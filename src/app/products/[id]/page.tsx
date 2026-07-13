"use client";

import { useParams } from "next/navigation";
import { products } from "@/lib/products";
import { useCart } from "@/lib/cart";
import Link from "next/link";
import { useState } from "react";

export default function ProductDetailPage() {
  const params = useParams();
  const product = products.find((p) => p.id === params.id);
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]?.name || "");
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-20 text-center">
        <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-4">Product not found</h1>
        <Link href="/products" className="font-[Roboto] text-[14px] font-bold text-black underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    const size = selectedSize || product.sizes[0];
    const color = selectedColor || product.colors[0].name;
    addItem(product, size, color);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 font-[Roboto] text-[14px] text-[#6B7280] hover:text-black transition-colors mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="aspect-[4/5] bg-[#F3F4F6] rounded-[8px] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <p className="font-[Roboto] text-[12px] text-[#6B7280] mb-2">{product.category}</p>
          <h1 className="font-[Montserrat] font-bold text-[28px] md:text-[30px] text-black mb-3">
            {product.name}
          </h1>
          <p className="font-[Roboto] font-bold text-[20px] text-black mb-6">
            ${product.price.toFixed(2)}
          </p>
          <p className="font-[Roboto] text-[14px] text-[#6B7280] leading-[19.6px] mb-8">
            {product.description}
          </p>

          {/* Colors */}
          <div className="mb-6">
            <p className="font-[Roboto] font-bold text-[14px] text-black mb-3">
              Color — {selectedColor || product.colors[0]?.name}
            </p>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={`w-8 h-8 rounded-full border-2 transition-colors ${
                    (selectedColor || product.colors[0].name) === c.name
                      ? "border-black"
                      : "border-[#E5E7EB] hover:border-[#6B7280]"
                  }`}
                  style={{ backgroundColor: c.value }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-8">
            <p className="font-[Roboto] font-bold text-[14px] text-black mb-3">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[44px] h-[40px] px-3 rounded-[4px] font-[Roboto] text-[14px] font-bold border transition-colors ${
                    (selectedSize || product.sizes[0]) === size
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-[#E5E7EB] hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full h-[48px] bg-black text-white font-[Roboto] font-bold text-[14px] rounded-[4px] hover:bg-[#6B7280] transition-colors"
          >
            {added ? "Added to Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
