import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/server";

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

async function handleProductUpdate(params: any, supabase: any) {
  await supabase.from("products").update({
    cj_last_synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("cj_product_id", params.pid);
}

async function handleStockUpdate(params: Record<string, any[]>, supabase: any) {
  for (const [vid, warehouses] of Object.entries(params)) {
    const totalStock = warehouses.reduce(
      (sum: number, w: any) => sum + (w.storageNum || 0),
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

async function handleOrderUpdate(params: any, supabase: any) {
  const { orderNumber, cjOrderId, orderStatus, trackNumber, logisticName } = params;

  const updateData: Record<string, any> = {
    cj_order_status: orderStatus,
    updated_at: new Date().toISOString(),
  };
  if (cjOrderId) updateData.cj_order_id = cjOrderId;
  if (trackNumber) updateData.cj_tracking_number = trackNumber;
  if (logisticName) updateData.cj_logistic_name = logisticName;

  if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(orderStatus)) {
    const statusMap: Record<string, string> = {
      SHIPPED: "shipped",
      DELIVERED: "delivered",
      CANCELLED: "cancelled",
    };
    updateData.status = statusMap[orderStatus] || "processing";
  }

  const filter = cjOrderId
    ? { column: "cj_order_id", value: cjOrderId }
    : { column: "id", value: orderNumber };
  await supabase.from("orders").update(updateData).eq(filter.column, filter.value);
}

async function handleLogisticUpdate(params: any, supabase: any) {
  const { orderNumber, orderId, trackingNumber, trackingStatus, logisticName } = params;

  const filter = orderId
    ? { column: "cj_order_id", value: orderId }
    : { column: "id", value: orderNumber };
  await supabase.from("orders").update({
    cj_tracking_number: trackingNumber,
    cj_logistic_name: logisticName,
    cj_order_status: `TRACKING_${trackingStatus}`,
    updated_at: new Date().toISOString(),
  }).eq(filter.column, filter.value);
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
    } catch (handlerError: any) {
      if (eventId) {
        await supabase
          .from("webhook_events")
          .update({ status: "failed", error_message: handlerError.message, processed_at: new Date().toISOString() })
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
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ code: 200, result: true, message: "ok" });
  }
}
