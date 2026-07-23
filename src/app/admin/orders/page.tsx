"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/currency";
import Link from "next/link";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
  cj_order_status: string | null;
  cj_tracking_number: string | null;
}

const STATUSES = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select("id, customer_name, customer_email, total, status, created_at, cj_order_status, cj_tracking_number")
        .order("created_at", { ascending: false });
      if (data) setOrders(data);
      setLoading(false);
    })();
  }, []);

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!o.customer_name.toLowerCase().includes(q) && !o.customer_email.toLowerCase().includes(q) && !o.id.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div>
      <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-6">Orders</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name, email or order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black"
        />
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 h-[40px] rounded-[4px] font-[Roboto] text-[13px] font-bold transition-colors ${
                filter === s ? "bg-black text-white" : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-black hover:text-black"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="font-[Roboto] text-[14px] text-[#6B7280] text-center py-20">Loading orders...</p>
      ) : filtered.length === 0 ? (
        <p className="font-[Roboto] text-[14px] text-[#6B7280] text-center py-20">No orders found.</p>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="text-left font-[Roboto] text-[12px] text-[#6B7280] font-bold px-4 py-3">Order</th>
                  <th className="text-left font-[Roboto] text-[12px] text-[#6B7280] font-bold px-4 py-3">Customer</th>
                  <th className="text-left font-[Roboto] text-[12px] text-[#6B7280] font-bold px-4 py-3">Date</th>
                  <th className="text-left font-[Roboto] text-[12px] text-[#6B7280] font-bold px-4 py-3">Status</th>
                  <th className="text-left font-[Roboto] text-[12px] text-[#6B7280] font-bold px-4 py-3">CJ</th>
                  <th className="text-right font-[Roboto] text-[12px] text-[#6B7280] font-bold px-4 py-3">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 font-[Roboto] text-[13px] text-black font-bold">#{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <p className="font-[Roboto] text-[13px] text-black">{order.customer_name}</p>
                      <p className="font-[Roboto] text-[11px] text-[#6B7280]">{order.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 font-[Roboto] text-[13px] text-[#6B7280]">
                      {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block font-[Roboto] text-[11px] font-bold px-2 py-0.5 rounded ${
                        order.status === "pending" ? "bg-gray-100 text-gray-600" :
                        order.status === "processing" ? "bg-[#FEF3C7] text-[#92400E]" :
                        order.status === "shipped" ? "bg-[#DBEAFE] text-[#1E40AF]" :
                        order.status === "delivered" ? "bg-[#D1FAE5] text-[#065F46]" :
                        "bg-[#FEE2E2] text-[#991B1B]"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-[Roboto] text-[12px] text-[#6B7280]">{order.cj_order_status || "—"}</td>
                    <td className="px-4 py-3 text-right font-[Roboto] text-[13px] text-black font-bold">{formatPrice(order.total, "USD")}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/orders/${order.id}`} className="font-[Roboto] text-[12px] text-[#6B7280] underline hover:text-black">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}