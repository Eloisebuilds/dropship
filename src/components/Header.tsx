"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useState } from "react";

export default function Header() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-[60px] flex items-center justify-between">
        <Link href="/" className="font-[Montserrat] font-bold text-[20px] text-black tracking-[-0.2px]">
          FAVORITEMS
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="font-[Roboto] text-[14px] font-normal text-black hover:text-[#6B7280] transition-colors">
            Home
          </Link>
          <Link href="/products" className="font-[Roboto] text-[14px] font-normal text-black hover:text-[#6B7280] transition-colors">
            Shop
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative font-[Roboto] text-[14px] font-bold text-black hover:text-[#6B7280] transition-colors">
            CART
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-black text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            className="md:hidden text-black p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-4 flex flex-col gap-4">
          <Link href="/" className="font-[Roboto] text-[14px] text-black" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link href="/products" className="font-[Roboto] text-[14px] text-black" onClick={() => setMenuOpen(false)}>
            Shop
          </Link>
        </div>
      )}
    </header>
  );
}
