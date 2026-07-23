"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    supplier_url: "",
    stock_quantity: "0",
    cj_product_id: "",
    cj_variant_id: "",
    supplier_price: "",
    margin_percent: "30",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  useEffect(() => {
    (async () => {
      const { id } = await params;
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*").eq("id", id).single();
      if (data) {
        setForm({
          name: data.name || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          image_url: data.image_url || "",
          supplier_url: data.supplier_url || "",
          stock_quantity: data.stock_quantity?.toString() || "0",
          cj_product_id: data.cj_product_id || "",
          cj_variant_id: data.cj_variant_id || "",
          supplier_price: data.supplier_price?.toString() || "",
          margin_percent: data.margin_percent?.toString() || "30",
        });
      }
      setLoading(false);
    })();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { id } = await params;
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          image_url: form.image_url || null,
          supplier_url: form.supplier_url || null,
          stock_quantity: parseInt(form.stock_quantity) || 0,
          cj_product_id: form.cj_product_id || null,
          cj_variant_id: form.cj_variant_id || null,
          supplier_price: form.supplier_price ? parseFloat(form.supplier_price) : null,
          margin_percent: parseFloat(form.margin_percent) || 30,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/admin/products");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this product? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const { id } = await params;
      await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      router.push("/admin/products");
    } catch {
      setError("Failed to delete product");
    }
    setDeleting(false);
  };

  if (loading) return <p className="font-[Roboto] text-[14px] text-[#6B7280] text-center py-20">Loading...</p>;

  return (
    <div className="max-w-[600px]">
      <Link href="/admin/products" className="font-[Roboto] text-[14px] text-[#6B7280] hover:text-black transition-colors mb-6 inline-block">
        &larr; Back to products
      </Link>
      <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">Name</label>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black" />
        </div>
        <div>
          <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className="w-full border border-[#E5E7EB] rounded-[4px] px-3 py-2 font-[Roboto] text-[14px] text-black outline-none focus:border-black resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">Price (USD)</label>
            <input type="number" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black" />
          </div>
          <div>
            <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">Stock</label>
            <input type="number" value={form.stock_quantity} onChange={(e) => update("stock_quantity", e.target.value)} className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black" />
          </div>
        </div>
        <div>
          <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">Image URL</label>
          <input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black" />
        </div>
        {form.image_url && (
          <div className="w-[120px] h-[120px] bg-[#F3F4F6] rounded-[4px] overflow-hidden">
            <img src={form.image_url} alt="" className="object-contain w-full h-full" />
          </div>
        )}
        <hr className="border-[#E5E7EB]" />
        <p className="font-[Roboto] text-[13px] text-[#6B7280] font-bold">CJ Dropshipping</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">CJ Product ID</label>
            <input value={form.cj_product_id} onChange={(e) => update("cj_product_id", e.target.value)} className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black" />
          </div>
          <div>
            <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">CJ Variant ID</label>
            <input value={form.cj_variant_id} onChange={(e) => update("cj_variant_id", e.target.value)} className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">Supplier Price</label>
            <input type="number" step="0.01" value={form.supplier_price} onChange={(e) => update("supplier_price", e.target.value)} className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black" />
          </div>
          <div>
            <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">Margin %</label>
            <input type="number" step="0.1" value={form.margin_percent} onChange={(e) => update("margin_percent", e.target.value)} className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black" />
          </div>
        </div>

        {error && <p className="font-[Roboto] text-[13px] text-[#B91C1C]">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="h-[44px] px-6 bg-black text-white font-[Roboto] text-[14px] font-bold rounded-[4px] hover:bg-[#6B7280] disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting} className="h-[44px] px-6 border border-[#FEE2E2] text-[#991B1B] font-[Roboto] text-[14px] font-bold rounded-[4px] hover:bg-[#FEF2F2] disabled:opacity-50 transition-colors">
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </form>
    </div>
  );
}