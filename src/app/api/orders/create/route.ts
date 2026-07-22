import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getCJClient } from "@/lib/cj/client";
import { createServiceClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/resend";
import type { CJOrderCreateResponse } from "@/lib/cj/types";

interface OrderItemInput {
  product?: {
    id?: string;
    price?: number;
    cjVariantId?: string;
  };
  quantity: number;
}

interface OrderBody {
  items: OrderItemInput[];
  customer: { email: string; name: string; phone?: string };
  shipping?: {
    address?: string;
    city?: string;
    province?: string;
    country?: string;
    countryCode?: string;
    zip?: string;
    phone?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderBody = await request.json();
    const { items, customer, shipping } = body;

    if (!items?.length || !customer?.email || !customer?.name) {
      return NextResponse.json(
        { error: "Missing required fields: items, customer.email, customer.name" },
        { status: 400 }
      );
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

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id || null,
        customer_email: customer.email,
        customer_name: customer.name,
        shipping_address: shipping?.address || "N/A",
        status: "pending",
        total: items.reduce(
          (sum: number, item: OrderItemInput) => sum + (item.product?.price || 0) * item.quantity,
          0
        ),
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Failed to create order in database" },
        { status: 500 }
      );
    }

    for (const item of items) {
      const pid = item.product?.id || "";
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pid);
      await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: isValidUuid ? pid : null,
        quantity: item.quantity,
        price: item.product?.price || 0,
        cj_variant_id: item.product?.cjVariantId || "",
      });
    }

    const cj = getCJClient();
    let cjResult: CJOrderCreateResponse | null = null;

    if (cj) {
      try {
        cjResult = await cj.createOrder({
          orderNumber: order.id,
          shippingCountryCode: shipping?.countryCode || "US",
          shippingCountry: shipping?.country || "United States",
          shippingProvince: shipping?.province || "N/A",
          shippingCity: shipping?.city || "N/A",
          shippingAddress: shipping?.address || "N/A",
          shippingCustomerName: customer.name,
          shippingPhone: shipping?.phone || customer.phone || "",
          shippingZip: shipping?.zip || "",
          email: customer.email,
          logisticName: "CJPacket Ordinary",
          fromCountryCode: "CN",
          isSandbox: process.env.NODE_ENV === "development" ? 1 : 0,
          products: items.map((item: OrderItemInput) => ({
            vid: item.product?.cjVariantId || item.product?.id || "",
            quantity: item.quantity,
            storeLineItemId: `${order.id}-${item.product?.id}`,
          })),
        });

        if (cjResult.data?.orderId) {
          await supabase
            .from("orders")
            .update({
              cj_order_id: cjResult.data.orderId,
              cj_order_status: cjResult.data.orderStatus || "CREATED",
              status: "processing",
            })
            .eq("id", order.id);

          try {
            await cj.addCart({
              orderNumber: order.id,
              orderId: cjResult.data.orderId,
            });
            await cj.confirmCart({
              orderNumber: order.id,
              orderId: cjResult.data.orderId,
            });
            const parentOrder = await cj.generateParentOrder({
              orderNumber: order.id,
              orderId: cjResult.data.orderId,
            });

            if (parentOrder.data?.cjPayUrl) {
              return NextResponse.json({
                success: true,
                orderId: order.id,
                cjOrderId: cjResult.data.orderId,
                redirectUrl: parentOrder.data.cjPayUrl,
              });
            }
          } catch (cjFlowError: unknown) {
            const flowMessage = cjFlowError instanceof Error ? cjFlowError.message : "CJ flow failed";
            console.warn("CJ order flow warning (non-fatal):", flowMessage);
          }
        }
      } catch (cjError: unknown) {
        const cjMessage = cjError instanceof Error ? cjError.message : "CJ error";
        console.warn("CJ order creation warning (non-fatal):", cjMessage);
        await supabase
          .from("orders")
          .update({
            status: "pending",
            error_message: `CJ: ${cjMessage}`,
          })
          .eq("id", order.id);
      }
    }

    sendOrderConfirmationEmail(
      customer.email,
      customer.name,
      order.id.slice(0, 8),
      `${process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin") || ""}/order-confirmation/${order.id}`
    );

    return NextResponse.json({
      success: true,
      orderId: order.id,
      cjOrderId: cjResult?.data?.orderId || null,
      redirectUrl: null,
      message: cj
        ? "Order created and sent to supplier"
        : "Order saved locally. CJ API key not configured.",
    });
  } catch (error: unknown) {
    console.error("Order creation error:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
