"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/currency";
import Link from "next/link";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  shipping_address: string;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
  cj_order_id: string | null;
  cj_order_status: string | null;
  cj_tracking_number: string | null;
  cj_logistic_name: string | null;
  error_message: string | null;
}

interface OrderItem {
  id: string;
  product_id: string | null;
  quantity: number;
  price: number;
  cj_variant_id: string | null;
  products: { name: string; image_url: string } | null;
}

export default function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);
  const supabase = createClient();

  const load = async () => {
    const { id } = await params;
    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();
    if (orderData) {
      setOrder(orderData);
      setNewStatus(orderData.status);
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*, products(name, image_url)")
        .eq("order_id", orderData.id);
      if (itemsData) setItems(itemsData);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async () => {
    if (!order || newStatus === order.status) return;
    setUpdating(true);
    setUpdateMsg(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrder({ ...order, status: newStatus });
      setUpdateMsg("Status updated successfully");
    } catch (err: unknown) {
      setUpdateMsg(err instanceof Error ? err.message : "Failed to update status");
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="font-[Roboto] text-[14px] text-[#6B7280]">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="font-[Roboto] text-[14px] text-[#6B7280] mb-4">Order not found.</p>
        <Link href="/admin/orders" className="font-[Roboto] text-[14px] text-[#6B7280] underline">Back to orders</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/orders" className="font-[Roboto] text-[14px] text-[#6B7280] hover:text-black transition-colors mb-6 inline-block">
        &larr; Back to orders
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-[Montserrat] font-bold text-[24px] text-black">Order #{order.id.slice(0, 8)}</h1>
          <p className="font-[Roboto] text-[14px] text-[#6B7280] mt-1">{order.customer_email}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[13px] text-black outline-none focus:border-black bg-white"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={updateStatus}
            disabled={updating || newStatus === order.status}
            className="h-[40px] px-4 bg-black text-white font-[Roboto] text-[13px] font-bold rounded-[4px] hover:bg-[#6B7280] disabled:opacity-50 transition-colors"
          >
            {updating ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
      {updateMsg && (
        <p className={`font-[Roboto] text-[13px] mb-4 ${updateMsg.includes("error") || updateMsg.includes("Failed") ? "text-[#B91C1C]" : "text-[#065F46]"}`}>
          {updateMsg}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-5">
            <h2 className="font-[Montserrat] font-bold text-[17px] text-black mb-4">Items</h2>
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 py-3 border-b border-[#E5E7EB] last:border-0">
                {item.products?.image_url && (
                  <div className="w-[56px] h-[56px] bg-[#F3F4F6] rounded-[4px] overflow-hidden shrink-0 relative">
                    <img src={item.products.image_url} alt={item.products.name || ""} className="object-contain w-full h-full" />
                  </div>
                )}
                <div className="flex-1 flex justify-between items-start">
                  <div>
                    <p className="font-[Roboto] text-[14px] text-black font-bold">{item.products?.name || "Unknown Product"}</p>
                    <p className="font-[Roboto] text-[12px] text-[#6B7280]">Qty: {item.quantity} &middot; ${Number(item.price).toFixed(2)} each</p>
                    {item.cj_variant_id && <p className="font-[Roboto] text-[11px] text-[#6B7280]">Variant: {item.cj_variant_id}</p>}
                  </div>
                  <span className="font-[Roboto] text-[14px] text-black font-bold shrink-0 ml-4">{formatPrice(item.price * item.quantity, "USD")}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-5">
            <h2 className="font-[Montserrat] font-bold text-[17px] text-black mb-3">Order Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-[Roboto] text-[12px] text-[#6B7280]">Status</p>
                <p className={`font-[Roboto] text-[14px] font-bold mt-0.5 ${
                  order.status === "processing" ? "text-[#92400E]" :
                  order.status === "shipped" ? "text-[#1E40AF]" :
                  order.status === "delivered" ? "text-[#065F46]" :
                  order.status === "cancelled" ? "text-[#991B1B]" : "text-[#6B7280]"
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </p>
              </div>
              <div>
                <p className="font-[Roboto] text-[12px] text-[#6B7280]">Total</p>
                <p className="font-[Roboto] text-[14px] text-black font-bold mt-0.5">{formatPrice(order.total, "USD")}</p>
              </div>
              <div>
                <p className="font-[Roboto] text-[12px] text-[#6B7280]">Date</p>
                <p className="font-[Roboto] text-[13px] text-black mt-0.5">
                  {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {order.updated_at && (
                <div>
                  <p className="font-[Roboto] text-[12px] text-[#6B7280]">Last Updated</p>
                  <p className="font-[Roboto] text-[13px] text-black mt-0.5">
                    {new Date(order.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {order.cj_order_id && (
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-5">
              <h2 className="font-[Montserrat] font-bold text-[17px] text-black mb-3">CJ Fulfillment</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-[Roboto] text-[12px] text-[#6B7280]">CJ Order ID</p>
                  <p className="font-[Roboto] text-[13px] text-black mt-0.5">{order.cj_order_id}</p>
                </div>
                <div>
                  <p className="font-[Roboto] text-[12px] text-[#6B7280]">CJ Status</p>
                  <p className="font-[Roboto] text-[13px] text-black mt-0.5">{order.cj_order_status || "—"}</p>
                </div>
                {order.cj_logistic_name && (
                  <div>
                    <p className="font-[Roboto] text-[12px] text-[#6B7280]">Logistics</p>
                    <p className="font-[Roboto] text-[13px] text-black mt-0.5">{order.cj_logistic_name}</p>
                  </div>
                )}
                {order.cj_tracking_number && (
                  <div>
                    <p className="font-[Roboto] text-[12px] text-[#6B7280]">Tracking</p>
                    <p className="font-[Roboto] text-[13px] text-black mt-0.5">{order.cj_tracking_number}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {order.error_message && (
            <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-[8px] p-5">
              <h2 className="font-[Montserrat] font-bold text-[17px] text-[#991B1B] mb-2">Error</h2>
              <p className="font-[Roboto] text-[13px] text-[#991B1B]">{order.error_message}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-5">
            <h2 className="font-[Montserrat] font-bold text-[17px] text-black mb-3">Customer</h2>
            <p className="font-[Roboto] text-[14px] text-black font-bold">{order.customer_name}</p>
            <p className="font-[Roboto] text-[13px] text-[#6B7280] mt-1">{order.customer_email}</p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-5">
            <h2 className="font-[Montserrat] font-bold text-[17px] text-black mb-3">Shipping Address</h2>
            <p className="font-[Roboto] text-[14px] text-black">{order.customer_name}</p>
            <p className="font-[Roboto] text-[13px] text-[#6B7280] mt-1 whitespace-pre-line">{order.shipping_address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}