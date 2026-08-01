"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart";
import { useCurrency, formatPrice } from "@/lib/currency";
import { useAuth } from "@/lib/auth/context";
import Link from "next/link";
import { useState, useEffect } from "react";
import { loadStripe, type StripeEmbeddedCheckout } from "@stripe/stripe-js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { currency } = useCurrency();
  const [email, setEmail] = useState("");
  const [startingCheckout, setStartingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [checkout, setCheckout] = useState<StripeEmbeddedCheckout | null>(null);

  useEffect(() => {
    if (authLoading) return;
    setEmail(user?.email || user?.user_metadata?.last_shipping_address?.email || "");
  }, [user, authLoading]);

  useEffect(() => {
    if (checkoutMode && checkout) {
      try {
        checkout.mount("#embedded-checkout");
      } catch (error) {
        setCheckoutError(error instanceof Error ? error.message : "Failed to load checkout");
        setCheckoutMode(false);
      }
    }
  }, [checkoutMode, checkout]);

  const handleCheckout = async () => {
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setCheckoutError("Please enter a valid email address.");
      return;
    }

    setStartingCheckout(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          email: email.trim(),
          currency,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }

      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        throw new Error("Stripe is not configured");
      }

      const stripe = await loadStripe(publishableKey);
      if (!stripe) {
        throw new Error("Failed to load payment provider");
      }

      const checkout = await stripe.createEmbeddedCheckoutPage({
        fetchClientSecret: async () => data.clientSecret,
      });

      setCheckout(checkout);
      setCheckoutMode(true);
    } catch (error: unknown) {
      setCheckoutError(error instanceof Error ? error.message : "Failed to start checkout. Please try again.");
      setStartingCheckout(false);
    }
  };

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

  if (checkoutMode) {
    return (
      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-[Montserrat] font-bold text-[28px] md:text-[30px] text-black">Checkout</h1>
          <button
            onClick={() => window.location.reload()}
            className="font-[Roboto] text-[12px] text-[#6B7280] hover:text-black transition-colors"
          >
            Cancel
          </button>
        </div>
        <div id="embedded-checkout" className="min-h-[600px]" />
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
              <div className="w-[160px] aspect-[3/2] bg-[#F3F4F6] rounded-[4px] overflow-hidden shrink-0 relative">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  className="object-contain"
                  sizes="160px"
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
            <h2 className="font-[Montserrat] font-bold text-[17px] text-black mb-4">Contact</h2>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black transition-colors"
              />
              <p className="font-[Roboto] text-[12px] text-[#6B7280]">
                Shipping details and payment are completed securely in the next step.
              </p>
            </div>
          </div>

          {checkoutError && (
            <p className="font-[Roboto] text-[12px] text-[#B91C1C]">{checkoutError}</p>
          )}

          <button
            onClick={handleCheckout}
            disabled={startingCheckout}
            className="w-full h-[48px] bg-black text-white font-[Roboto] font-bold text-[14px] rounded-[4px] hover:bg-[#6B7280] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {startingCheckout ? "Preparing checkout..." : "Continue to Payment"}
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
