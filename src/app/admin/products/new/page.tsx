"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProduct() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    supplier_url: "",
    stock_quantity: "10",
    cj_product_id: "",
    cj_variant_id: "",
    supplier_price: "",
    margin_percent: "30",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price.trim()) {
      setError("Name and price are required.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          image_url: form.image_url || null,
          supplier_url: form.supplier_url || null,
          stock_quantity: parseInt(form.stock_quantity) || 10,
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
      setError(err instanceof Error ? err.message : "Failed to create product");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-[600px]">
      <Link href="/admin/products" className="font-[Roboto] text-[14px] text-[#6B7280] hover:text-black transition-colors mb-6 inline-block">
        &larr; Back to products
      </Link>
      <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-6">New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">Name *</label>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black" />
        </div>
        <div>
          <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className="w-full border border-[#E5E7EB] rounded-[4px] px-3 py-2 font-[Roboto] text-[14px] text-black outline-none focus:border-black resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">Price * (USD)</label>
            <input type="number" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black" />
          </div>
          <div>
            <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">Stock Quantity</label>
            <input type="number" value={form.stock_quantity} onChange={(e) => update("stock_quantity", e.target.value)} className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black" />
          </div>
        </div>
        <div>
          <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">Image URL</label>
          <input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black" />
        </div>
        <div>
          <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">Supplier URL</label>
          <input value={form.supplier_url} onChange={(e) => update("supplier_url", e.target.value)} className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black" />
        </div>
        <hr className="border-[#E5E7EB]" />
        <p className="font-[Roboto] text-[13px] text-[#6B7280] font-bold">CJ Dropshipping (optional)</p>
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
            {saving ? "Creating..." : "Create Product"}
          </button>
          <Link href="/admin/products" className="h-[44px] px-6 border border-[#E5E7EB] font-[Roboto] text-[14px] text-[#6B7280] rounded-[4px] hover:text-black transition-colors inline-flex items-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}