import { NextRequest, NextResponse } from "next/server";
import { getCJClient } from "@/lib/cj/client";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, shipping } = body;

    if (!items?.length || !customer?.email || !customer?.name) {
      return NextResponse.json(
        { error: "Missing required fields: items, customer.email, customer.name" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_email: customer.email,
        customer_name: customer.name,
        shipping_address: shipping?.address || "N/A",
        status: "pending",
        total: items.reduce(
          (sum: number, item: any) => sum + (item.product?.price || 0) * item.quantity,
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
    let cjResult: any = null;

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
          products: items.map((item: any) => ({
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

          // Add to CJ cart and proceed
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
          } catch (cjFlowError: any) {
            console.warn("CJ order flow warning (non-fatal):", cjFlowError.message);
          }
        }
      } catch (cjError: any) {
        console.warn("CJ order creation warning (non-fatal):", cjError.message);
        await supabase
          .from("orders")
          .update({
            status: "pending",
            error_message: `CJ: ${cjError.message}`,
          })
          .eq("id", order.id);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      cjOrderId: cjResult?.data?.orderId || null,
      message: cj
        ? "Order created and sent to supplier"
        : "Order saved locally. CJ API key not configured.",
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
