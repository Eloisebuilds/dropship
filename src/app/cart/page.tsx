"use client";

import { useCart } from "@/lib/cart";
import { useCurrency, formatPrice } from "@/lib/currency";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const currency = useCurrency();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    zip: "",
    country: "United States",
    countryCode: "US",
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleCheckout = async () => {
    if (!form.name || !form.email || !form.address || !form.city) {
      setCheckoutError("Please fill in name, email, address, and city.");
      return;
    }

    setCheckingOut(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer: {
            email: form.email,
            name: form.name,
            phone: form.phone,
          },
          shipping: {
            address: form.address,
            city: form.city,
            province: form.province,
            country: form.country,
            countryCode: form.countryCode,
            zip: form.zip,
            phone: form.phone,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.redirectUrl) {
        clearCart();
        window.location.href = data.redirectUrl;
      } else {
        clearCart();
        setCheckoutSuccess(true);
      }
    } catch (error: any) {
      setCheckoutError(error.message || "Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="max-w-[600px] mx-auto px-4 md:px-6 py-20 text-center">
        <div className="text-[48px] mb-6">&#10003;</div>
        <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-3">Order Placed!</h1>
        <p className="font-[Roboto] text-[14px] text-[#6B7280] mb-8">
          Your order has been submitted. You will receive a confirmation email shortly.
        </p>
        <Link
          href="/"
          className="inline-block bg-black text-white font-[Roboto] font-bold text-[14px] rounded-[4px] px-8 py-3 hover:bg-[#6B7280] transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-20 text-center">
        <div className="text-[48px] mb-6">&#128722;</div>
        <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-3">Your cart is empty</h1>
        <p className="font-[Roboto] text-[14px] text-[#6B7280] mb-8">
          Add the 360° Microfiber Floor Mop to get started.
        </p>
        <Link
          href="/"
          className="inline-block bg-black text-white font-[Roboto] font-bold text-[14px] rounded-[4px] px-8 py-3 hover:bg-[#6B7280] transition-colors"
        >
          View Product
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16">
      <h1 className="font-[Montserrat] font-bold text-[28px] md:text-[30px] text-black mb-8">
        Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
              className="flex gap-4 border border-[#E5E7EB] rounded-[8px] p-4 bg-white"
            >
              <div className="w-[160px] bg-[#F3F4F6] rounded-[4px] overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-[Montserrat] font-bold text-[17px] text-black">
                    {item.product.name}
                  </h3>
                  <p className="font-[Roboto] text-[12px] text-[#6B7280] mt-1">
                    Size: {item.selectedSize} &middot; Color: {item.selectedColor}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)
                      }
                      className="w-[28px] h-[28px] border border-[#E5E7EB] rounded-[4px] font-[Roboto] text-[14px] text-black hover:border-black transition-colors flex items-center justify-center"
                    >
                      &minus;
                    </button>
                    <span className="font-[Roboto] text-[14px] font-bold text-black w-[24px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)
                      }
                      className="w-[28px] h-[28px] border border-[#E5E7EB] rounded-[4px] font-[Roboto] text-[14px] text-black hover:border-black transition-colors flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-[Roboto] font-bold text-[14px] text-black">
                      {formatPrice(item.product.price * item.quantity, currency)}
                    </span>
                    <button
                      onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                      className="font-[Roboto] text-[12px] text-[#6B7280] hover:text-[#B91C1C] transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-[#E5E7EB] rounded-[8px] p-6 bg-white">
            <h2 className="font-[Montserrat] font-bold text-[17px] text-black mb-4">Order Summary</h2>
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex justify-between font-[Roboto] text-[14px]">
                <span className="text-[#6B7280]">Subtotal</span>
                <span className="text-black font-bold">{formatPrice(total, currency)}</span>
              </div>
              <div className="flex justify-between font-[Roboto] text-[14px]">
                <span className="text-[#6B7280]">Shipping</span>
                <span className="text-black font-bold">Free</span>
              </div>
              <div className="border-t border-[#E5E7EB] pt-3 flex justify-between font-[Roboto] text-[16px]">
                <span className="text-black font-bold">Total</span>
                <span className="text-black font-bold">{formatPrice(total, currency)}</span>
              </div>
            </div>
          </div>

          <div className="border border-[#E5E7EB] rounded-[8px] p-6 bg-white">
            <h2 className="font-[Montserrat] font-bold text-[17px] text-black mb-4">Shipping Details</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Full Name *"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black transition-colors"
              />
              <input
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black transition-colors"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black transition-colors"
              />
              <input
                type="text"
                placeholder="Street Address *"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black transition-colors"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City *"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black transition-colors"
                />
                <input
                  type="text"
                  placeholder="State / Province"
                  value={form.province}
                  onChange={(e) => updateField("province", e.target.value)}
                  className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="ZIP / Postal Code"
                  value={form.zip}
                  onChange={(e) => updateField("zip", e.target.value)}
                  className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black transition-colors"
                />
                <select
                  value={form.countryCode}
                  onChange={(e) => {
                    const codes: Record<string, string> = {
                      US: "United States", GB: "United Kingdom", CA: "Canada",
                      AU: "Australia", DE: "Germany", FR: "France",
                      IT: "Italy", ES: "Spain", NL: "Netherlands",
                      BR: "Brazil", JP: "Japan", CN: "China",
                    };
                    updateField("countryCode", e.target.value);
                    updateField("country", codes[e.target.value] || e.target.value);
                  }}
                  className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black transition-colors bg-white"
                >
                  {["US", "GB", "CA", "AU", "DE", "FR", "IT", "ES", "NL", "BR", "JP", "CN"].map(
                    (code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>

          {checkoutError && (
            <p className="font-[Roboto] text-[12px] text-[#B91C1C]">{checkoutError}</p>
          )}

          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="w-full h-[48px] bg-black text-white font-[Roboto] font-bold text-[14px] rounded-[4px] hover:bg-[#6B7280] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkingOut ? "Processing..." : "Place Order"}
          </button>

          <Link
            href="/"
            className="block text-center font-[Roboto] text-[14px] text-[#6B7280] hover:text-black transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
