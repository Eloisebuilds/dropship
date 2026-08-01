import { createServiceClient } from "@/lib/supabase/server";
import { formatAmountInCurrency } from "@/lib/currency-config";
import Link from "next/link";

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) {
    return (
      <div className="max-w-[600px] mx-auto px-4 md:px-6 py-20 text-center">
        <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-3">Order Not Found</h1>
        <p className="font-[Roboto] text-[14px] text-[#6B7280] mb-8">We couldn&apos;t find this order.</p>
        <Link href="/" className="text-[14px] text-[#6B7280] hover:text-black underline">Back to shop</Link>
      </div>
    );
  }

  const paid = order.payment_status === "paid";

  return (
    <div className="max-w-[600px] mx-auto px-4 md:px-6 py-20 text-center">
      <div className={`w-[64px] h-[64px] rounded-full flex items-center justify-center mx-auto mb-6 ${paid ? "bg-[#D1FAE5]" : "bg-[#F3F4F6]"}`}>
        {paid ? (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        )}
      </div>

      <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-3">
        {paid ? "Order Confirmed!" : "Order Received"}
      </h1>
      <p className="font-[Roboto] text-[14px] text-[#6B7280] mb-8 max-w-[400px] mx-auto">
        {paid
          ? "Thank you for your purchase. You will receive a confirmation email shortly."
          : "We are waiting for payment confirmation. You will receive an email once it is confirmed."}
        {order.status === "processing" && " Your order has been sent to the supplier for processing."}
      </p>

      <div className="border border-[#E5E7EB] rounded-[8px] p-6 bg-white mb-8 text-left max-w-[400px] mx-auto">
        <div className="flex justify-between mb-2">
          <span className="font-[Roboto] text-[12px] text-[#6B7280]">Order</span>
          <span className="font-[Roboto] text-[12px] text-black font-bold">#{order.id.slice(0, 8)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-[Roboto] text-[12px] text-[#6B7280]">Email</span>
          <span className="font-[Roboto] text-[12px] text-black">{order.customer_email}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-[Roboto] text-[12px] text-[#6B7280]">Payment</span>
          <span className={`font-[Roboto] text-[12px] font-bold ${paid ? "text-[#065F46]" : "text-[#92400E]"}`}>
            {paid ? "Paid" : "Pending"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-[Roboto] text-[12px] text-[#6B7280]">Total</span>
          <span className="font-[Roboto] font-bold text-[14px] text-black">
            {formatAmountInCurrency(Number(order.total), order.currency || "usd")}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 items-center">
        <Link
          href={order.user_id ? `/orders/${order.id}` : "/"}
          className="inline-block bg-black text-white font-[Roboto] font-bold text-[14px] rounded-[4px] px-8 py-3 hover:bg-[#6B7280] transition-colors"
        >
          {order.user_id ? "View Order Details" : "Continue Shopping"}
        </Link>
        <Link
          href="/"
          className="font-[Roboto] text-[14px] text-[#6B7280] hover:text-black transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
