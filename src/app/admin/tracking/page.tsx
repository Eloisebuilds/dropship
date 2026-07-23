"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface TrackedOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  cj_order_id: string | null;
  cj_tracking_number: string | null;
  cj_status: string | null;
  cj_shipping_method: string | null;
  cj_estimated_delivery: string | null;
  created_at: string;
}

export default function AdminTracking() {
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select("id, customer_name, customer_email, total, status, cj_order_id, cj_tracking_number, cj_status, cj_shipping_method, cj_estimated_delivery, created_at")
        .order("created_at", { ascending: false });
      if (data) setOrders(data);
      setLoading(false);
    })();
  }, []);

  const fulfilled = orders.filter((o) => o.cj_order_id);

  return (
    <div>
      <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-6">Fulfillment Tracking</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-4">
          <p className="font-[Roboto] text-[11px] text-[#6B7280] font-bold">Total Orders</p>
          <p className="font-[Montserrat] font-bold text-[28px] text-black mt-1">{orders.length}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-4">
          <p className="font-[Roboto] text-[11px] text-[#6B7280] font-bold">With CJ Tracking</p>
          <p className="font-[Montserrat] font-bold text-[28px] text-black mt-1">{fulfilled.length}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-4">
          <p className="font-[Roboto] text-[11px] text-[#6B7280] font-bold">Awaiting Fulfillment</p>
          <p className="font-[Montserrat] font-bold text-[28px] text-black mt-1">{orders.length - fulfilled.length}</p>
        </div>
      </div>

      {loading ? (
        <p className="font-[Roboto] text-[14px] text-[#6B7280] text-center py-20">Loading tracking data...</p>
      ) : fulfilled.length === 0 ? (
        <p className="font-[Roboto] text-[14px] text-[#6B7280] text-center py-20">No fulfilled orders with tracking yet.</p>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="text-left px-4 py-3 font-[Roboto] text-[11px] text-[#6B7280] font-bold">Order</th>
                <th className="text-left px-4 py-3 font-[Roboto] text-[11px] text-[#6B7280] font-bold">Customer</th>
                <th className="text-left px-4 py-3 font-[Roboto] text-[11px] text-[#6B7280] font-bold">CJ Order ID</th>
                <th className="text-left px-4 py-3 font-[Roboto] text-[11px] text-[#6B7280] font-bold">Tracking</th>
                <th className="text-left px-4 py-3 font-[Roboto] text-[11px] text-[#6B7280] font-bold">Status</th>
                <th className="text-left px-4 py-3 font-[Roboto] text-[11px] text-[#6B7280] font-bold">Method</th>
                <th className="text-right px-4 py-3 font-[Roboto] text-[11px] text-[#6B7280] font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fulfilled.map((o) => (
                <tr key={o.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-[Roboto] text-[12px] text-[#6B7280] underline hover:text-black">
                      #{o.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-[Roboto] text-[13px] text-black">{o.customer_name}</td>
                  <td className="px-4 py-3 font-[Roboto] text-[12px] text-[#6B7280] font-mono">{o.cj_order_id}</td>
                  <td className="px-4 py-3">
                    {o.cj_tracking_number ? (
                      <span className="font-[Roboto] text-[12px] text-black font-mono">{o.cj_tracking_number}</span>
                    ) : (
                      <span className="font-[Roboto] text-[12px] text-[#9CA3AF]">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-[Roboto] text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      o.cj_status === "Shipped" || o.cj_status === "Delivered" ? "bg-[#D1FAE5] text-[#065F46]" :
                      o.cj_status === "Processing" ? "bg-[#FEF3C7] text-[#92400E]" :
                      "bg-[#F3F4F6] text-[#6B7280]"
                    }`}>{o.cj_status || "Unknown"}</span>
                  </td>
                  <td className="px-4 py-3 font-[Roboto] text-[12px] text-[#6B7280]">{o.cj_shipping_method || "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="font-[Roboto] text-[12px] text-[#6B7280] underline hover:text-black">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}