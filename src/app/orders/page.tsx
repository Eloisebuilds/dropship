"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/context";
import { formatPrice } from "@/lib/currency";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  status: string;
  total: number;
  created_at: string;
  cj_order_status: string | null;
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?redirect=/orders");
      return;
    }

    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setOrders(data);
        setLoading(false);
      });
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-20 text-center">
        <p className="font-[Roboto] text-[14px] text-[#6B7280]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-6 py-12 md:py-16">
      <h1 className="font-[Montserrat] font-bold text-[28px] text-black mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-[Roboto] text-[14px] text-[#6B7280] mb-6">You haven&apos;t placed any orders yet.</p>
          <Link href="/" className="inline-block bg-black text-white font-[Roboto] font-bold text-[14px] rounded-[4px] px-8 py-3 hover:bg-[#6B7280] transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="border border-[#E5E7EB] rounded-[8px] p-5 bg-white hover:border-black transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-[Roboto] text-[12px] text-[#6B7280]">
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className={`font-[Roboto] text-[12px] font-bold px-2 py-1 rounded ${
                  order.status === "processing" ? "bg-[#FEF3C7] text-[#92400E]" :
                  order.status === "shipped" ? "bg-[#DBEAFE] text-[#1E40AF]" :
                  order.status === "delivered" ? "bg-[#D1FAE5] text-[#065F46]" :
                  order.status === "cancelled" ? "bg-[#FEE2E2] text-[#991B1B]" :
                  "bg-[#F3F4F6] text-[#6B7280]"
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-[Roboto] text-[14px] text-black font-bold">{order.customer_name}</p>
                  <p className="font-[Roboto] text-[12px] text-[#6B7280]">
                    Order #{order.id.slice(0, 8)}
                    {order.cj_order_status && ` · CJ: ${order.cj_order_status}`}
                  </p>
                </div>
                <span className="font-[Roboto] font-bold text-[16px] text-black">
                  {formatPrice(order.total, "USD")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
