import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/resend";

const ADMIN_EMAIL = "reinagrim@gmail.com";

async function checkAdmin(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return false;
  }
  return true;
}

export async function PATCH(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId and status are required" }, { status: 400 });
    }

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: order } = await supabase
      .from("orders")
      .select("id, customer_email, customer_name, cj_tracking_number, status")
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    if (status === "shipped" && order.status !== "shipped") {
      sendOrderShippedEmail(
        order.customer_email,
        order.customer_name,
        order.id.slice(0, 8),
        order.cj_tracking_number || "N/A",
        `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}`
      );
    }

    if (status === "delivered" && order.status !== "delivered") {
      sendOrderDeliveredEmail(
        order.customer_email,
        order.customer_name,
        order.id.slice(0, 8),
        `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Admin order update error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}