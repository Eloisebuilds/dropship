"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth/context";
import { useState, useRef, useEffect } from "react";
import { useCurrency, TOP_CURRENCIES } from "@/lib/currency";

export default function Header() {
  const { itemCount } = useCart();
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const ADMIN_EMAIL = "uaerealprojects@gmail.com";
  const isAdmin = user?.email === ADMIN_EMAIL;
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const { currency, setCurrency } = useCurrency();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  const current = TOP_CURRENCIES.find((c) => c.code === currency) || TOP_CURRENCIES[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
          {user && (
            <Link href="/orders" className="font-[Roboto] text-[14px] text-black hover:text-[#6B7280] transition-colors">
              Orders
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="font-[Roboto] text-[14px] font-semibold text-[#B91C1C] hover:text-[#991B1B] transition-colors">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {/* Currency toggle */}
          <div className="relative" ref={currencyRef}>
            <button
              onClick={() => setCurrencyOpen(!currencyOpen)}
              className="flex items-center gap-1 font-[Roboto] text-[13px] text-black hover:text-[#6B7280] transition-colors"
            >
              <span className="w-[18px] text-center">{current.symbol}</span>
              <span>{currency}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${currencyOpen ? "rotate-180" : ""}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {currencyOpen && (
              <div className="absolute right-0 top-full mt-2 w-[200px] bg-white border border-[#E5E7EB] rounded-[8px] shadow-lg overflow-hidden z-50">
                {TOP_CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setCurrency(c.code); setCurrencyOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 font-[Roboto] text-[13px] text-left hover:bg-[#F9FAFB] transition-colors ${
                      currency === c.code ? "bg-[#F3F4F6] font-bold" : ""
                    }`}
                  >
                    <span className="text-[16px]">{c.flag}</span>
                    <span className="text-[#6B7280] w-[40px]">{c.code}</span>
                    <span className="text-black flex-1">{c.symbol}</span>
                    {currency === c.code && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href="/cart" className="relative font-[Roboto] text-[14px] font-bold text-black hover:text-[#6B7280] transition-colors">
            CART
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-black text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {loading ? null : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 font-[Roboto] text-[12px] text-black hover:text-[#6B7280] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {displayName}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-[180px] bg-white border border-[#E5E7EB] rounded-[8px] shadow-lg overflow-hidden">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 font-[Roboto] text-[14px] text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
                      </svg>
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/account"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 font-[Roboto] text-[14px] text-black hover:bg-[#F9FAFB] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    My Account
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 font-[Roboto] text-[14px] text-black hover:bg-[#F9FAFB] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                    </svg>
                    Orders
                  </Link>
                  <hr className="border-[#E5E7EB]" />
                  <button
                    onClick={() => { signOut(); setDropdownOpen(false); }}
                    className="flex items-center gap-2 w-full px-4 py-3 font-[Roboto] text-[14px] text-[#991B1B] hover:bg-[#FEF2F2] transition-colors text-left"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="font-[Roboto] text-[14px] text-[#6B7280] hover:text-black transition-colors">
              SIGN IN
            </Link>
          )}

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
          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="font-[Roboto] text-[14px] text-[#B91C1C] font-semibold" onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <Link href="/account" className="font-[Roboto] text-[14px] text-black" onClick={() => setMenuOpen(false)}>
                My Account
              </Link>
              <Link href="/orders" className="font-[Roboto] text-[14px] text-black" onClick={() => setMenuOpen(false)}>
                Orders
              </Link>
              <hr className="border-[#E5E7EB]" />
              <p className="font-[Roboto] text-[12px] text-[#6B7280]">{user.email}</p>
              <button onClick={() => { signOut(); setMenuOpen(false); }} className="font-[Roboto] text-[14px] text-[#991B1B] text-left">
                Log Out
              </button>
            </>
          ) : (
            <Link href="/login" className="font-[Roboto] text-[14px] text-black" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
