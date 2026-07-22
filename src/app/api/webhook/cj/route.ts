import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { sendOrderShippedEmail } from "@/lib/resend";
import type { SupabaseClient } from "@supabase/supabase-js";

function verifySignature(sign: string, rawBody: string, openId: string): boolean {
  try {
    const hmac = crypto.createHmac("sha256", openId);
    hmac.update(rawBody, "utf-8");
    const expected = hmac.digest("base64");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sign));
  } catch {
    return false;
  }
}

interface WarehouseInfo {
  vid: string;
  areaId: string;
  areaEn: string;
  countryCode: string;
  storageNum: number;
}

async function handleProductUpdate(params: Record<string, unknown>, supabase: SupabaseClient) {
  await supabase.from("products").update({
    cj_last_synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("cj_product_id", params.pid as string);
}

async function handleStockUpdate(params: Record<string, WarehouseInfo[]>, supabase: SupabaseClient) {
  for (const [vid, warehouses] of Object.entries(params)) {
    const totalStock = warehouses.reduce(
      (sum: number, w: WarehouseInfo) => sum + (w.storageNum || 0),
      0
    );

    await supabase.from("cj_products").update({
      warehouse_inventory: warehouses,
      last_synced_at: new Date().toISOString(),
    }).eq("cj_variant_id", vid);

    await supabase.from("products").update({
      stock_quantity: totalStock,
      updated_at: new Date().toISOString(),
    }).eq("cj_variant_id", vid);
  }
}

async function handleOrderUpdate(params: Record<string, unknown>, supabase: SupabaseClient) {
  const { orderNumber, cjOrderId, orderStatus, trackNumber, logisticName } = params as Record<string, string | undefined>;

  const updateData: Record<string, string | undefined> = {
    cj_order_status: orderStatus,
    updated_at: new Date().toISOString(),
  };
  if (cjOrderId) updateData.cj_order_id = cjOrderId;
  if (trackNumber) updateData.cj_tracking_number = trackNumber;
  if (logisticName) updateData.cj_logistic_name = logisticName;

  if (orderStatus && ["SHIPPED", "DELIVERED", "CANCELLED"].includes(orderStatus)) {
    const statusMap: Record<string, string> = {
      SHIPPED: "shipped",
      DELIVERED: "delivered",
      CANCELLED: "cancelled",
    };
    updateData.status = statusMap[orderStatus] || "processing";
  }

  const filter = cjOrderId
    ? { column: "cj_order_id" as const, value: cjOrderId }
    : { column: "id" as const, value: orderNumber as string };
  const { data: order } = await supabase.from("orders").update(updateData).eq(filter.column, filter.value).select("customer_email, customer_name, id").single();

  if (order && orderStatus === "SHIPPED") {
    sendOrderShippedEmail(
      order.customer_email,
      order.customer_name,
      order.id.slice(0, 8),
      trackNumber || null,
      `${process.env.NEXT_PUBLIC_SITE_URL || "https://dropship-builds333.vercel.app"}/orders/${order.id}`
    );
  }
}

async function handleLogisticUpdate(params: Record<string, unknown>, supabase: SupabaseClient) {
  const { orderNumber, orderId, trackingNumber, trackingStatus, logisticName } = params as Record<string, string | undefined>;

  const filter = orderId
    ? { column: "cj_order_id" as const, value: orderId }
    : { column: "id" as const, value: orderNumber as string };
  const { data: order } = await supabase.from("orders").update({
    cj_tracking_number: trackingNumber,
    cj_logistic_name: logisticName,
    cj_order_status: trackingStatus ? `TRACKING_${trackingStatus}` : undefined,
    updated_at: new Date().toISOString(),
  }).eq(filter.column, filter.value).select("customer_email, customer_name, id").single();

  if (order && trackingNumber) {
    sendOrderShippedEmail(
      order.customer_email,
      order.customer_name,
      order.id.slice(0, 8),
      trackingNumber,
      `${process.env.NEXT_PUBLIC_SITE_URL || "https://dropship-builds333.vercel.app"}/orders/${order.id}`
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sign = request.headers.get("sign") || "";
    const rawBody = await request.text();

    const supabase = createServiceClient();

    const { data: tokenData } = await supabase
      .from("cj_tokens")
      .select("open_id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenData) {
      const openId = String(tokenData.open_id);
      if (!verifySignature(sign, rawBody, openId)) {
        await supabase.from("webhook_events").insert({
          event_type: "webhook",
          event_subtype: "signature_failure",
          payload: { sign, bodyPreview: rawBody.slice(0, 200) },
          status: "failed",
          error_message: "Signature verification failed",
        });
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const { messageId, type, messageType, params } = payload;

    const { data: event } = await supabase
      .from("webhook_events")
      .insert({
        event_type: type,
        event_subtype: messageType,
        cj_message_id: messageId,
        payload: payload,
        status: "processing",
      })
      .select("id")
      .single();

    const eventId = event?.id;

    try {
      switch (type) {
        case "PRODUCT":
        case "VARIANT":
          await handleProductUpdate(params, supabase);
          break;
        case "STOCK":
          await handleStockUpdate(params, supabase);
          break;
        case "ORDER":
          await handleOrderUpdate(params, supabase);
          break;
        case "LOGISTIC":
          await handleLogisticUpdate(params, supabase);
          break;
      }
    } catch (handlerError: unknown) {
      if (eventId) {
        const message = handlerError instanceof Error ? handlerError.message : "Handler failed";
        await supabase
          .from("webhook_events")
          .update({ status: "failed", error_message: message, processed_at: new Date().toISOString() })
          .eq("id", eventId);
      }
      throw handlerError;
    }

    if (eventId) {
      await supabase
        .from("webhook_events")
        .update({ status: "completed", processed_at: new Date().toISOString() })
        .eq("id", eventId);
    }

    return NextResponse.json({ code: 200, result: true, message: "ok" });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return NextResponse.json({ code: 200, result: true, message: "ok" });
  }
}
