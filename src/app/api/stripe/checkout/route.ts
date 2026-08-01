import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { convertFromEur, SUPPORTED_CURRENCIES } from "@/lib/currency-config";

const ALLOWED_COUNTRIES = [
  "US", "GB", "CA", "AU", "DE", "FR", "IT", "ES", "NL", "BR", "JP", "CN",
] as const;

interface CheckoutItem {
  productId: string;
  quantity: number;
}

interface CheckoutBody {
  items: CheckoutItem[];
  email?: string;
  currency?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutBody = await request.json();

    if (!body.items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const currency = (body.currency || "EUR").toUpperCase();
    if (!SUPPORTED_CURRENCIES.includes(currency)) {
      return NextResponse.json({ error: "Unsupported currency" }, { status: 400 });
    }

    const authSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {},
        },
      }
    );
    const { data: { user } } = await authSupabase.auth.getUser();

    const supabase = createServiceClient();

    const ids = body.items.map((i) => i.productId).filter(Boolean);
    if (ids.length === 0) {
      return NextResponse.json({ error: "Invalid cart items" }, { status: 400 });
    }

    const { data: dbProducts, error: productsError } = await supabase
      .from("products")
      .select("id, name, description, price, image_url, cj_variant_id")
      .in("id", ids);

    if (productsError || !dbProducts) {
      return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    const lineItems: Array<{
      productId: string;
      quantity: number;
      name: string;
      priceEur: number;
      unitAmount: number;
    }> = [];

    for (const item of body.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: "Product no longer available" }, { status: 400 });
      }
      const quantity = Math.min(Math.max(Math.floor(item.quantity || 1), 1), 99);
      const priceEur = parseFloat(String(product.price ?? "0"));
      if (priceEur <= 0) {
        return NextResponse.json({ error: "Product not purchasable" }, { status: 400 });
      }
      lineItems.push({
        productId: product.id,
        quantity,
        name: product.name,
        priceEur,
        unitAmount: Math.round(convertFromEur(priceEur, currency) * 100),
      });
    }

    const totalEur = lineItems.reduce((sum, li) => sum + li.priceEur * li.quantity, 0);
    const totalCharged = lineItems.reduce((sum, li) => sum + li.unitAmount * li.quantity, 0);

    const email = (body.email || user?.email || "").trim();
    const customerName = user?.user_metadata?.full_name || email.split("@")[0] || "Customer";

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id || null,
        customer_email: email,
        customer_name: customerName,
        shipping_address: "Pending",
        status: "pending",
        payment_status: "unpaid",
        currency: currency.toLowerCase(),
        total: totalCharged / 100,
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      lineItems.map((li) => ({
        order_id: order.id,
        product_id: li.productId,
        quantity: li.quantity,
        price: li.priceEur,
        cj_variant_id: productMap.get(li.productId)?.cj_variant_id || "",
      }))
    );

    if (itemsError) {
      return NextResponse.json({ error: "Failed to save order items" }, { status: 500 });
    }

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "payment",
      line_items: lineItems.map((li) => ({
        quantity: li.quantity,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: li.unitAmount,
          product_data: {
            name: li.name,
            images: productMap.get(li.productId)?.image_url ? [productMap.get(li.productId)!.image_url!] : undefined,
          },
        },
      })),
      customer_email: email || undefined,
      metadata: { order_id: order.id },
      payment_intent_data: { metadata: { order_id: order.id } },
      shipping_address_collection: { allowed_countries: [...ALLOWED_COUNTRIES] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: currency.toLowerCase() },
            display_name: "Free Shipping",
          },
        },
      ],
      phone_number_collection: { enabled: true },
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://shopfavoritems.com"}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    if (!session.client_secret) {
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
      orderId: order.id,
      totalEur,
    });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Failed to start checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
