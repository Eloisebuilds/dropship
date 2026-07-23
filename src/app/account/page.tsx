"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/context";
import { formatPrice } from "@/lib/currency";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  status: string;
  total: number;
  created_at: string;
}

export default function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?redirect=/account");
      return;
    }

    if (user.user_metadata?.full_name) {
      setName(user.user_metadata.full_name);
    } else {
      setName(user.email?.split("@")[0] || "");
    }

    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setOrders(data);
        setLoadingOrders(false);
      });
  }, [user, authLoading]);

  const handleSaveName = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim() || user?.email?.split("@")[0] },
    });
    if (!error) {
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  if (authLoading) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
        <p className="font-[Roboto] text-[14px] text-[#6B7280]">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-[600px] mx-auto px-4 md:px-6 py-12 md:py-16">
      <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-8">My Account</h1>

      <div className="border border-[#E5E7EB] rounded-[8px] p-6 bg-white mb-6">
        <h2 className="font-[Montserrat] font-bold text-[17px] text-black mb-4">Profile</h2>

        <div className="space-y-4">
          <div>
            <p className="font-[Roboto] text-[12px] text-[#6B7280] mb-1">Email</p>
            <p className="font-[Roboto] text-[14px] text-black">{user.email}</p>
          </div>

          <div>
            <p className="font-[Roboto] text-[12px] text-[#6B7280] mb-1">Name</p>
            {editing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 h-[36px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black"
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="h-[36px] px-4 bg-black text-white font-[Roboto] text-[12px] font-bold rounded-[4px] hover:bg-[#6B7280] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => { setEditing(false); setName(user.user_metadata?.full_name || user.email?.split("@")[0] || ""); }}
                  className="h-[36px] px-4 border border-[#E5E7EB] font-[Roboto] text-[12px] text-[#6B7280] rounded-[4px] hover:text-black"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-[Roboto] text-[14px] text-black">
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </p>
                <button
                  onClick={() => setEditing(true)}
                  className="font-[Roboto] text-[12px] text-[#6B7280] underline hover:text-black"
                >
                  Edit
                </button>
                {saved && (
                  <span className="font-[Roboto] text-[12px] text-[#065F46]">Saved!</span>
                )}
              </div>
            )}
          </div>

          <div>
            <p className="font-[Roboto] text-[12px] text-[#6B7280] mb-1">Member since</p>
            <p className="font-[Roboto] text-[14px] text-black">
              {new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-[8px] p-6 bg-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[Montserrat] font-bold text-[17px] text-black">Recent Orders</h2>
          <Link href="/orders" className="font-[Roboto] text-[12px] text-[#6B7280] underline hover:text-black">
            View all
          </Link>
        </div>

        {loadingOrders ? (
          <p className="font-[Roboto] text-[14px] text-[#6B7280]">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-[Roboto] text-[14px] text-[#6B7280] mb-4">You haven&apos;t placed any orders yet.</p>
            <Link href="/" className="inline-block h-[44px] px-6 bg-black text-white font-[Roboto] text-[14px] font-bold rounded-[4px] leading-[44px] hover:bg-[#6B7280]">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block border border-[#E5E7EB] rounded-[6px] p-4 hover:border-black transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-[Roboto] text-[14px] text-black font-bold">Order #{order.id.slice(0, 8)}</p>
                    <p className="font-[Roboto] text-[12px] text-[#6B7280]">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={`font-[Roboto] text-[12px] font-bold px-2 py-0.5 rounded ${
                    order.status === "pending" ? "bg-gray-100 text-gray-600" :
                    order.status === "processing" ? "bg-[#FEF3C7] text-[#92400E]" :
                    order.status === "shipped" ? "bg-[#DBEAFE] text-[#1E40AF]" :
                    order.status === "delivered" ? "bg-[#D1FAE5] text-[#065F46]" :
                    order.status === "cancelled" ? "bg-[#FEE2E2] text-[#991B1B]" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-[Roboto] text-[12px] text-[#6B7280]">{order.customer_name}</p>
                  <p className="font-[Roboto] text-[14px] text-black font-bold">{formatPrice(order.total, "USD")}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={signOut}
        className="w-full h-[48px] border border-[#E5E7EB] text-[#991B1B] font-[Roboto] text-[14px] font-bold rounded-[4px] hover:bg-[#FEE2E2] transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
