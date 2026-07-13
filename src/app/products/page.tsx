"use client";

import Link from "next/link";
import { products } from "@/lib/products";

export default function ProductsPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="mb-10">
        <h1 className="font-[Montserrat] font-bold text-[28px] md:text-[30px] text-black mb-2">
          Shop
        </h1>
        <p className="font-[Roboto] text-[14px] text-[#6B7280]">
          {products.length} products
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group border border-[#E5E7EB] rounded-[8px] overflow-hidden bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow"
          >
            <div className="aspect-[4/5] bg-[#F3F4F6] overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="font-[Montserrat] font-bold text-[17px] text-black mb-1">
                {product.name}
              </h3>
              <p className="font-[Roboto] text-[14px] text-[#6B7280] mb-3">
                {product.category}
              </p>
              <p className="font-[Roboto] font-bold text-[16px] text-black">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
