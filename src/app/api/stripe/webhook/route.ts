import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { fulfillWithCJ } from "@/lib/orders/fulfillment";
import { sendOrderConfirmationEmail } from "@/lib/resend";
import { formatAmountInCurrency, getMinorUnitDecimals, fromMinorUnits } from "@/lib/currency-config";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature || "", secret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signature verification failed";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createServiceClient();

    const orderId = session.metadata?.order_id;
    if (!orderId) {
      console.error("Checkout session without order_id:", session.id);
      return NextResponse.json({ received: true });
    }

    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (!order) {
      console.error("Order not found for session:", session.id);
      return NextResponse.json({ received: true });
    }

    // Idempotency: never process the same order twice.
    if (order.payment_status === "paid") {
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Reconcile the charged amount against what we created the session for.
    if (session.payment_status !== "paid") {
      console.error("Session not paid:", session.id, session.payment_status);
      return NextResponse.json({ received: true, notPaid: true });
    }

    const chargedCents = session.amount_total || 0;
    const orderCurrency = (order.currency || session.currency || "eur").toLowerCase();
    const expectedCents = Math.round(
      parseFloat(order.total ?? "0") * Math.pow(10, getMinorUnitDecimals(orderCurrency))
    );
    if (chargedCents !== expectedCents) {
      console.error("Amount mismatch:", session.id, chargedCents, expectedCents);
      await supabase
        .from("orders")
        .update({
          error_message: `Payment amount mismatch: ${chargedCents} vs ${expectedCents}`,
        })
        .eq("id", order.id);
      return NextResponse.json({ received: true, mismatch: true });
    }

    const customerDetails = session.customer_details;
    const shippingDetails = session.collected_information?.shipping_details ?? null;

    const shippingAddress = shippingDetails
      ? [
          shippingDetails.name,
          shippingDetails.address?.line1,
          shippingDetails.address?.line2,
          shippingDetails.address?.city,
          shippingDetails.address?.state,
          shippingDetails.address?.postal_code,
          shippingDetails.address?.country,
        ]
          .filter(Boolean)
          .join(", ")
      : "Pending";

    const customerEmail = customerDetails?.email || session.customer_email || order.customer_email || "";
    const customerName = shippingDetails?.name || customerDetails?.name || order.customer_name || "Customer";

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
        status: "processing",
        currency: orderCurrency,
        total: fromMinorUnits(chargedCents, orderCurrency),
        stripe_session_id: session.id,
        stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null,
        customer_email: customerEmail,
        customer_name: customerName,
        shipping_address: shippingAddress,
        error_message: null,
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Failed to mark order as paid:", updateError);
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, cj_variant_id, quantity")
      .eq("order_id", order.id);

    const fulfillment = await fulfillWithCJ({
      orderId: order.id,
      items: (orderItems || []).map((item) => ({
        cjVariantId: item.cj_variant_id || undefined,
        productId: item.product_id || undefined,
        quantity: item.quantity,
      })),
      shipping: {
        countryCode: shippingDetails?.address?.country || "US",
        country: shippingDetails?.address?.country || "United States",
        province: shippingDetails?.address?.state || "N/A",
        city: shippingDetails?.address?.city || "N/A",
        address: [
          shippingDetails?.address?.line1,
          shippingDetails?.address?.line2,
        ].filter(Boolean).join(" ") || "N/A",
        zip: shippingDetails?.address?.postal_code || "",
        phone: customerDetails?.phone || "",
      },
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerDetails?.phone || "",
      },
    });

    if (fulfillment.cjOrderId) {
      await supabase
        .from("orders")
        .update({
          cj_order_id: fulfillment.cjOrderId,
          cj_order_status: fulfillment.cjOrderStatus || "CREATED",
        })
        .eq("id", order.id);
    }

    if (fulfillment.error) {
      console.warn("CJ fulfillment warning (non-fatal):", fulfillment.error);
      await supabase
        .from("orders")
        .update({ error_message: `CJ: ${fulfillment.error}` })
        .eq("id", order.id);
    }

    if (customerEmail) {
      try {
        const { data: firstItem } = await supabase
          .from("order_items")
          .select("products(name)")
          .eq("order_id", order.id)
          .limit(1)
          .maybeSingle();

        const productName =
          (firstItem as unknown as { products: { name: string } | null } | null)?.products?.name || "Product";

        await sendOrderConfirmationEmail(
          customerEmail,
          customerName,
          order.id.slice(0, 8),
          productName,
          formatAmountInCurrency(fromMinorUnits(chargedCents, orderCurrency), orderCurrency),
          `${process.env.NEXT_PUBLIC_SITE_URL || "https://shopfavoritems.com"}/order-confirmation/${order.id}`
        );
      } catch (emailError) {
        console.warn("Failed to send confirmation email (non-fatal):", emailError);
      }
    }
  }

  return NextResponse.json({ received: true });
}
