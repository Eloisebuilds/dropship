"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/currency";
import Link from "next/link";

interface Customer {
  email: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: { id: string; status: string; total: number; created_at: string }[];
  collapsed: boolean;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: orders } = await supabase
        .from("orders")
        .select("id, customer_email, customer_name, total, status, created_at")
        .order("created_at", { ascending: false });

      if (!orders) { setLoading(false); return; }

      const map = new Map<string, Customer>();
      for (const o of orders) {
        const key = o.customer_email;
        if (!map.has(key)) {
          map.set(key, {
            email: o.customer_email,
            name: o.customer_name,
            orderCount: 0,
            totalSpent: 0,
            lastOrderDate: o.created_at,
            orders: [],
            collapsed: true,
          });
        }
        const c = map.get(key)!;
        c.orderCount++;
        c.totalSpent += Number(o.total);
        if (new Date(o.created_at) > new Date(c.lastOrderDate)) {
          c.lastOrderDate = o.created_at;
        }
        c.orders.push({ id: o.id, status: o.status, total: o.total, created_at: o.created_at });
      }

      setCustomers(Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent));
      setLoading(false);
    })();
  }, []);

  const toggle = (email: string) => {
    setCustomers((prev) => prev.map((c) => c.email === email ? { ...c, collapsed: !c.collapsed } : c));
  };

  return (
    <div>
      <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-6">Customers</h1>

      {loading ? (
        <p className="font-[Roboto] text-[14px] text-[#6B7280] text-center py-20">Loading customers...</p>
      ) : customers.length === 0 ? (
        <p className="font-[Roboto] text-[14px] text-[#6B7280] text-center py-20">No customers yet.</p>
      ) : (
        <div className="space-y-3">
          {customers.map((c) => (
            <div key={c.email} className="bg-white border border-[#E5E7EB] rounded-[8px] overflow-hidden">
              <button onClick={() => toggle(c.email)} className="w-full flex items-center justify-between p-4 hover:bg-[#F9FAFB] transition-colors text-left">
                <div className="min-w-0 flex-1">
                  <p className="font-[Roboto] text-[14px] text-black font-bold">{c.name}</p>
                  <p className="font-[Roboto] text-[12px] text-[#6B7280]">{c.email}</p>
                </div>
                <div className="text-right shrink-0 ml-4 flex items-center gap-6">
                  <div>
                    <p className="font-[Roboto] text-[11px] text-[#6B7280]">Orders</p>
                    <p className="font-[Roboto] text-[14px] text-black font-bold">{c.orderCount}</p>
                  </div>
                  <div>
                    <p className="font-[Roboto] text-[11px] text-[#6B7280]">Spent</p>
                    <p className="font-[Roboto] text-[14px] text-black font-bold">{formatPrice(c.totalSpent, "USD")}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-[#6B7280] transition-transform ${!c.collapsed ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>
              {!c.collapsed && (
                <div className="border-t border-[#E5E7EB] px-4 py-3">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E5E7EB]">
                        <th className="text-left font-[Roboto] text-[11px] text-[#6B7280] font-bold pb-2">Order</th>
                        <th className="text-left font-[Roboto] text-[11px] text-[#6B7280] font-bold pb-2">Date</th>
                        <th className="text-left font-[Roboto] text-[11px] text-[#6B7280] font-bold pb-2">Status</th>
                        <th className="text-right font-[Roboto] text-[11px] text-[#6B7280] font-bold pb-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.orders.map((o) => (
                        <tr key={o.id}>
                          <td className="py-1.5">
                            <Link href={`/admin/orders/${o.id}`} className="font-[Roboto] text-[12px] text-[#6B7280] underline hover:text-black">
                              #{o.id.slice(0, 8)}
                            </Link>
                          </td>
                          <td className="py-1.5 font-[Roboto] text-[12px] text-[#6B7280]">
                            {new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </td>
                          <td className="py-1.5">
                            <span className={`font-[Roboto] text-[11px] font-bold px-1.5 py-0.5 rounded ${
                              o.status === "pending" ? "bg-gray-100 text-gray-600" :
                              o.status === "processing" ? "bg-[#FEF3C7] text-[#92400E]" :
                              o.status === "shipped" ? "bg-[#DBEAFE] text-[#1E40AF]" :
                              o.status === "delivered" ? "bg-[#D1FAE5] text-[#065F46]" :
                              "bg-[#FEE2E2] text-[#991B1B]"
                            }`}>{o.status}</span>
                          </td>
                          <td className="py-1.5 text-right font-[Roboto] text-[12px] text-black font-bold">{formatPrice(o.total, "USD")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}