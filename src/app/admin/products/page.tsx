"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/currency";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  cj_product_id: string | null;
  cj_last_synced_at: string | null;
  created_at: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("id, name, price, stock_quantity, image_url, cj_product_id, cj_last_synced_at, created_at")
        .order("created_at", { ascending: false });
      if (data) setProducts(data);
      setLoading(false);
    })();
  }, []);

  const filtered = products.filter((p) => {
    if (!search) return true;
    return p.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-[Montserrat] font-bold text-[24px] text-black">Products</h1>
        <Link
          href="/admin/products/new"
          className="h-[40px] px-4 bg-black text-white font-[Roboto] text-[13px] font-bold rounded-[4px] hover:bg-[#6B7280] transition-colors inline-flex items-center"
        >
          + Add Product
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black mb-6"
      />

      {loading ? (
        <p className="font-[Roboto] text-[14px] text-[#6B7280] text-center py-20">Loading products...</p>
      ) : filtered.length === 0 ? (
        <p className="font-[Roboto] text-[14px] text-[#6B7280] text-center py-20">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}/edit`}
              className="bg-white border border-[#E5E7EB] rounded-[8px] p-4 hover:border-black transition-colors"
            >
              <div className="w-full h-[140px] bg-[#F3F4F6] rounded-[4px] overflow-hidden mb-3 flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="object-contain w-full h-full" />
                ) : (
                  <span className="font-[Roboto] text-[12px] text-[#9CA3AF]">No image</span>
                )}
              </div>
              <p className="font-[Roboto] text-[14px] text-black font-bold truncate">{product.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-[Roboto] text-[13px] text-black">{formatPrice(product.price, "USD")}</span>
                <span className={`font-[Roboto] text-[11px] font-bold px-1.5 py-0.5 rounded ${
                  product.stock_quantity > 0 ? "bg-[#D1FAE5] text-[#065F46]" : "bg-[#FEE2E2] text-[#991B1B]"
                }`}>
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of stock"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {product.cj_product_id ? (
                  <span className="font-[Roboto] text-[10px] text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.5 rounded">CJ synced</span>
                ) : (
                  <span className="font-[Roboto] text-[10px] text-[#9CA3AF] bg-[#F3F4F6] px-1.5 py-0.5 rounded">No CJ link</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}