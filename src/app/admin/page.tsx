"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/currency";
import Link from "next/link";

interface Stats {
  totalOrders: number;
  revenue: number;
  productsCount: number;
  customersCount: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  recentOrders: {
    id: string;
    customer_name: string;
    customer_email: string;
    total: number;
    status: string;
    created_at: string;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();

      const [ordersRes, productsRes, customersRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("user_id", { count: "exact", head: true }).not("user_id", "is", null),
      ]);

      const orders = ordersRes.data || [];
      const recentOrders = orders.slice(0, 5).map((o) => ({
        id: o.id,
        customer_name: o.customer_name,
        customer_email: o.customer_email,
        total: o.total,
        status: o.status,
        created_at: o.created_at,
      }));

      setStats({
        totalOrders: orders.length,
        revenue: orders.reduce((s: number, o: { total: number }) => s + Number(o.total), 0),
        productsCount: productsRes.count || 0,
        customersCount: customersRes.count || 0,
        pending: orders.filter((o: { status: string }) => o.status === "pending").length,
        processing: orders.filter((o: { status: string }) => o.status === "processing").length,
        shipped: orders.filter((o: { status: string }) => o.status === "shipped").length,
        delivered: orders.filter((o: { status: string }) => o.status === "delivered").length,
        cancelled: orders.filter((o: { status: string }) => o.status === "cancelled").length,
        recentOrders,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="font-[Roboto] text-[14px] text-[#6B7280]">Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) return null;

  const statusColors: Record<string, string> = {
    pending: "bg-gray-400",
    processing: "bg-yellow-400",
    shipped: "bg-blue-400",
    delivered: "bg-green-400",
    cancelled: "bg-red-400",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  const maxStatus = Math.max(stats.pending, stats.processing, stats.shipped, stats.delivered, stats.cancelled, 1);

  return (
    <div>
      <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", value: stats.totalOrders.toString(), color: "text-black" },
          { label: "Revenue", value: formatPrice(stats.revenue, "USD"), color: "text-[#065F46]" },
          { label: "Products", value: stats.productsCount.toString(), color: "text-black" },
          { label: "Customers", value: stats.customersCount.toString(), color: "text-black" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-[#E5E7EB] rounded-[8px] p-5">
            <p className="font-[Roboto] text-[12px] text-[#6B7280] mb-1">{label}</p>
            <p className={`font-[Montserrat] font-bold text-[22px] ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-5">
          <h2 className="font-[Montserrat] font-bold text-[17px] text-black mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {Object.entries(statusLabels).map(([key, label]) => {
              const count = stats[key as keyof typeof stats] as number;
              const pct = maxStatus > 0 ? (count / maxStatus) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between font-[Roboto] text-[13px] mb-1">
                    <span className="text-black">{label}</span>
                    <span className="text-[#6B7280]">{count}</span>
                  </div>
                  <div className="h-[6px] bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${statusColors[key]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[Montserrat] font-bold text-[17px] text-black">Recent Orders</h2>
            <Link href="/admin/orders" className="font-[Roboto] text-[12px] text-[#6B7280] underline hover:text-black">
              View all
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="font-[Roboto] text-[14px] text-[#6B7280] py-8 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between py-2.5 border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] -mx-5 px-5 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-[Roboto] text-[13px] text-black truncate">{order.customer_name}</p>
                    <p className="font-[Roboto] text-[11px] text-[#6B7280]">#{order.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-[Roboto] text-[13px] text-black font-bold">{formatPrice(order.total, "USD")}</p>
                    <span className={`inline-block font-[Roboto] text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      order.status === "pending" ? "bg-gray-100 text-gray-600" :
                      order.status === "processing" ? "bg-[#FEF3C7] text-[#92400E]" :
                      order.status === "shipped" ? "bg-[#DBEAFE] text-[#1E40AF]" :
                      order.status === "delivered" ? "bg-[#D1FAE5] text-[#065F46]" :
                      "bg-[#FEE2E2] text-[#991B1B]"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}