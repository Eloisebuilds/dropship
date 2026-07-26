"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CJProduct {
  id: string;
  name: string;
  sku: string;
  image: string;
  sellPrice: string;
  nowPrice: string;
  inventory: number;
  category: string;
  deliveryCycle: string;
  description: string;
}

interface CJPreview {
  pid: string;
  name: string;
  description: string;
  image: string;
  cjPrice: number;
  storePrice: number;
  originalPrice: number;
  marginPercent: number;
  inventory: number;
  sku: string;
  variantId: string;
  category: string;
}

export default function NewProduct() {
  const router = useRouter();
  const [step, setStep] = useState<"search" | "form">("search");
  const [keyword, setKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<CJProduct[]>([]);
  const [selected, setSelected] = useState<CJPreview | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doSearch = async () => {
    if (!keyword.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/cj/search?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.products || []);
      if (!data.products?.length) setError("No products found.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Search failed");
    }
    setSearching(false);
  };

  const selectProduct = async (pid: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/cj/preview?pid=${encodeURIComponent(pid)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelected(data);
      setTitle(data.name);
      setDescription(data.description);
      setPrice(data.storePrice.toString());
      setStep("form");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !price.trim()) {
      setError("Title and price are required.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        name: title,
        description,
        price: parseFloat(price),
        image_url: selected?.image || null,
        stock_quantity: selected?.inventory ?? 10,
        cj_product_id: selected?.pid || null,
        cj_variant_id: selected?.variantId || null,
        supplier_price: selected?.cjPrice || null,
        margin_percent: selected?.marginPercent ?? 30,
        cj_sku: selected?.sku || null,
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/admin/products");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    }
    setSaving(false);
  };

  if (step === "search") {
    return (
      <div>
        <Link href="/admin/products" className="font-[Roboto] text-[14px] text-[#6B7280] hover:text-black transition-colors mb-6 inline-block">
          &larr; Back to products
        </Link>
        <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-6">Add Product from CJ Dropshipping</h1>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Search CJ Dropshipping products..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            className="flex-1 h-[44px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black"
          />
          <button
            onClick={doSearch}
            disabled={searching}
            className="h-[44px] px-6 bg-black text-white font-[Roboto] text-[14px] font-bold rounded-[4px] hover:bg-[#6B7280] disabled:opacity-50 transition-colors"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {error && <p className="font-[Roboto] text-[13px] text-[#B91C1C] mb-4">{error}</p>}

        {results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((product) => (
              <button
                key={product.id}
                onClick={() => selectProduct(product.id)}
                className="bg-white border border-[#E5E7EB] rounded-[8px] p-4 hover:border-black transition-colors text-left w-full"
              >
                <div className="w-full h-[160px] bg-[#F3F4F6] rounded-[4px] overflow-hidden mb-3 flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="object-contain w-full h-full" />
                  ) : (
                    <span className="font-[Roboto] text-[12px] text-[#9CA3AF]">No image</span>
                  )}
                </div>
                <p className="font-[Roboto] text-[14px] text-black font-bold truncate">{product.name}</p>
                <p className="font-[Roboto] text-[11px] text-[#6B7280] truncate">SKU: {product.sku}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-[Roboto] text-[13px] text-black font-bold">${parseFloat(product.sellPrice).toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    {product.inventory > 0 && (
                      <span className="font-[Roboto] text-[10px] text-[#065F46] bg-[#D1FAE5] px-1.5 py-0.5 rounded">{product.inventory} in stock</span>
                    )}
                    <span className="font-[Roboto] text-[10px] text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.5 rounded">{product.category || "General"}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {results.length === 0 && !searching && !error && (
          <div className="text-center py-20">
            <p className="font-[Roboto] text-[14px] text-[#6B7280]">Search CJ Dropshipping products to get started.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[600px]">
      <button
        onClick={() => { setStep("search"); setSelected(null); setError(null); }}
        className="font-[Roboto] text-[14px] text-[#6B7280] hover:text-black transition-colors mb-6 inline-block"
      >
        &larr; Back to search
      </button>
      <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-1">Review Product</h1>
      <p className="font-[Roboto] text-[13px] text-[#6B7280] mb-6">You can only modify the title, description, and selling price. Everything else is synced from CJ.</p>

      {selected && (
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-4 mb-6 flex gap-4">
          <div className="w-[100px] h-[100px] bg-[#F3F4F6] rounded-[4px] overflow-hidden flex-shrink-0 flex items-center justify-center">
            {selected.image ? (
              <img src={selected.image} alt="" className="object-contain w-full h-full" />
            ) : (
              <span className="font-[Roboto] text-[10px] text-[#9CA3AF]">No image</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-[Roboto] text-[13px] text-black font-bold truncate">{selected.name}</p>
            <p className="font-[Roboto] text-[11px] text-[#6B7280]">SKU: {selected.sku}</p>
            <p className="font-[Roboto] text-[11px] text-[#6B7280]">Category: {selected.category}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-[Roboto] text-[12px] text-black">CJ: <strong>${selected.cjPrice.toFixed(2)}</strong></span>
              <span className="font-[Roboto] text-[12px] text-[#065F46]">{selected.inventory} in stock</span>
              <span className="font-[Roboto] text-[12px] text-[#6B7280]">Margin: {selected.marginPercent}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black" />
        </div>
        <div>
          <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full border border-[#E5E7EB] rounded-[4px] px-3 py-2 font-[Roboto] text-[14px] text-black outline-none focus:border-black resize-none" />
        </div>
        <div>
          <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-1">Selling Price * (USD)</label>
          <div className="relative">
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black" />
            {selected && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-[Roboto] text-[11px] text-[#6B7280]">
                (CJ: ${selected.cjPrice.toFixed(2)})
              </span>
            )}
          </div>
        </div>

        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-3">
          <p className="font-[Roboto] text-[11px] text-[#6B7280] font-bold mb-1">Auto-synced from CJ</p>
          <div className="grid grid-cols-2 gap-2 text-[12px] font-[Roboto]">
            <span className="text-[#6B7280]">Images: <strong className="text-black">{selected?.image ? "1 available" : "None"}</strong></span>
            <span className="text-[#6B7280]">Inventory: <strong className="text-black">{selected?.inventory ?? "N/A"}</strong></span>
            <span className="text-[#6B7280]">Supplier Price: <strong className="text-black">${selected?.cjPrice.toFixed(2) ?? "N/A"}</strong></span>
            <span className="text-[#6B7280]">SKU: <strong className="text-black">{selected?.sku ?? "N/A"}</strong></span>
          </div>
        </div>

        {error && <p className="font-[Roboto] text-[13px] text-[#B91C1C]">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="h-[44px] px-6 bg-black text-white font-[Roboto] text-[14px] font-bold rounded-[4px] hover:bg-[#6B7280] disabled:opacity-50 transition-colors">
            {saving ? "Creating..." : "Create Product"}
          </button>
          <button
            onClick={() => { setStep("search"); setSelected(null); setError(null); }}
            className="h-[44px] px-6 border border-[#E5E7EB] font-[Roboto] text-[14px] text-[#6B7280] rounded-[4px] hover:text-black transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
