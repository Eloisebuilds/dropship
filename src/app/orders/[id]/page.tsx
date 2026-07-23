"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/context";
import { formatPrice } from "@/lib/currency";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  shipping_address: string;
  status: string;
  total: number;
  created_at: string;
  cj_order_id: string | null;
  cj_order_status: string | null;
  cj_tracking_number: string | null;
  cj_logistic_name: string | null;
}

interface OrderItem {
  id: string;
  product_id: string | null;
  quantity: number;
  price: number;
  cj_variant_id: string | null;
  products: { name: string; image_url: string } | null;
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    (async () => {
      const { id } = await params;

      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (orderData) {
        setOrder(orderData);
        const { data: itemsData } = await supabase
          .from("order_items")
          .select("*, products(name, image_url)")
          .eq("order_id", orderData.id);

        if (itemsData) setItems(itemsData);
      }

      setLoading(false);
    })();
  }, [user, authLoading, params]);

  if (authLoading || loading) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
        <p className="font-[Roboto] text-[14px] text-[#6B7280]">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
        <p className="font-[Roboto] text-[14px] text-[#6B7280] mb-6">Order not found.</p>
        <Link href="/orders" className="text-[14px] text-[#6B7280] hover:text-black underline">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto px-4 md:px-6 py-12 md:py-16">
      <Link href="/orders" className="font-[Roboto] text-[14px] text-[#6B7280] hover:text-black transition-colors mb-6 inline-block">
        &larr; Back to orders
      </Link>

      <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-6">Order Details</h1>

      <div className="border border-[#E5E7EB] rounded-[8px] p-6 bg-white mb-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="font-[Roboto] text-[12px] text-[#6B7280] mb-1">Order ID</p>
            <p className="font-[Roboto] text-[14px] text-black font-bold">#{order.id.slice(0, 8)}</p>
          </div>
          <div>
            <p className="font-[Roboto] text-[12px] text-[#6B7280] mb-1">Status</p>
            <p className={`font-[Roboto] text-[14px] font-bold ${
              order.status === "processing" ? "text-[#92400E]" :
              order.status === "shipped" ? "text-[#1E40AF]" :
              order.status === "delivered" ? "text-[#065F46]" :
              order.status === "cancelled" ? "text-[#991B1B]" :
              "text-[#6B7280]"
            }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </p>
          </div>
          <div>
            <p className="font-[Roboto] text-[12px] text-[#6B7280] mb-1">Date</p>
            <p className="font-[Roboto] text-[14px] text-black">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
          <div>
            <p className="font-[Roboto] text-[12px] text-[#6B7280] mb-1">Total</p>
            <p className="font-[Roboto] text-[14px] text-black font-bold">{formatPrice(order.total, "USD")}</p>
          </div>
        </div>

        {order.cj_order_id && (
          <div className="border-t border-[#E5E7EB] pt-4">
            <p className="font-[Roboto] text-[12px] text-[#6B7280] mb-2">Fulfillment</p>
            <div className="grid grid-cols-2 gap-2">
              <p className="font-[Roboto] text-[12px] text-black">CJ Order: {order.cj_order_id}</p>
              {order.cj_order_status && (
                <p className="font-[Roboto] text-[12px] text-black">Status: {order.cj_order_status}</p>
              )}
              {order.cj_logistic_name && (
                <p className="font-[Roboto] text-[12px] text-black">Logistics: {order.cj_logistic_name}</p>
              )}
              {order.cj_tracking_number && (
                <p className="font-[Roboto] text-[12px] text-black">Tracking: {order.cj_tracking_number}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border border-[#E5E7EB] rounded-[8px] p-6 bg-white mb-6">
        <h2 className="font-[Montserrat] font-bold text-[17px] text-black mb-4">Items</h2>
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 py-4 border-b border-[#E5E7EB] last:border-0">
            {item.products?.image_url && (
              <div className="w-[64px] h-[64px] bg-[#F3F4F6] rounded-[4px] overflow-hidden shrink-0 relative">
                <Image src={item.products.image_url} alt={item.products.name || "Product"} fill className="object-contain" sizes="64px" />
              </div>
            )}
            <div className="flex-1 flex justify-between items-start">
              <div>
                <p className="font-[Roboto] text-[14px] text-black font-bold">{item.products?.name || "Product"}</p>
                <p className="font-[Roboto] text-[12px] text-[#6B7280] mt-0.5">Qty: {item.quantity}</p>
                {item.cj_variant_id && (
                  <p className="font-[Roboto] text-[12px] text-[#6B7280]">Variant: {item.cj_variant_id}</p>
                )}
              </div>
              <span className="font-[Roboto] text-[14px] text-black font-bold ml-4 shrink-0">{formatPrice(item.price * item.quantity, "USD")}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-[#E5E7EB] rounded-[8px] p-6 bg-white mb-6">
        <h2 className="font-[Montserrat] font-bold text-[17px] text-black mb-4">Shipping Address</h2>
        <p className="font-[Roboto] text-[14px] text-black">{order.customer_name}</p>
        <p className="font-[Roboto] text-[14px] text-[#6B7280]">{order.shipping_address}</p>
      </div>
    </div>
  );
}
