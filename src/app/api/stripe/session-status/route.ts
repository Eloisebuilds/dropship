import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 });
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.status,
      paymentStatus: session.payment_status,
      orderId: session.metadata?.order_id || null,
      amountTotal: session.amount_total,
      currency: session.currency,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
