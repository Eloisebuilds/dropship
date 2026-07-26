"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  position: number;
  is_remote: boolean;
}

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
  const [productId, setProductId] = useState<string>("");
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  useEffect(() => {
    (async () => {
      const { id } = await params;
      setProductId(id);
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
      const { data: imgs } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("position", { ascending: true });
      if (imgs) setImages(imgs);
      setLoading(false);
    })();
  }, [params]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !productId) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("product_id", productId);
      const res = await fetch("/api/admin/products/images", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImages((prev) => [...prev, data.image]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDeleteImage = async (image: ProductImage) => {
    if (!confirm(`Delete this image?`)) return;
    setError(null);
    try {
      const res = await fetch("/api/admin/products/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: image.id, product_id: image.product_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImages((prev) => prev.filter((img) => img.id !== image.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

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

        <hr className="border-[#E5E7EB]" />
        <div>
          <label className="font-[Roboto] text-[12px] text-[#6B7280] font-bold block mb-2">Images ({images.length}/10)</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group aspect-square bg-[#F3F4F6] rounded-[4px] overflow-hidden">
                <img src={img.url} alt={img.alt || ""} className="object-contain w-full h-full" />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img)}
                  className="absolute top-1 right-1 w-6 h-6 bg-[#991B1B] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[12px] font-bold"
                >
                  &times;
                </button>
                {img.is_remote && (
                  <span className="absolute bottom-1 left-1 font-[Roboto] text-[9px] text-[#6B7280] bg-white/80 px-1 py-0.5 rounded">CJ</span>
                )}
              </div>
            ))}
            {images.length < 10 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="aspect-square border-2 border-dashed border-[#E5E7EB] rounded-[4px] flex flex-col items-center justify-center gap-1 hover:border-black transition-colors disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="font-[Roboto] text-[10px] text-[#9CA3AF]">Add</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <p className="font-[Roboto] text-[10px] text-[#6B7280] mt-2">Max 5MB per image. Supported: JPG, PNG, WebP.</p>
        </div>

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
