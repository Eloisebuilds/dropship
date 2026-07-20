"use client";

import { useCart } from "@/lib/cart";
import { useCurrency, formatPrice } from "@/lib/currency";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const currency = useCurrency();

  if (items.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-20 text-center">
        <div className="text-[48px] mb-6">🛒</div>
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
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
                    Size: {item.selectedSize} · Color: {item.selectedColor}
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
                      −
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

        {/* Summary */}
        <div className="border border-[#E5E7EB] rounded-[8px] p-6 bg-white h-fit sticky top-[80px]">
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
          <button className="w-full h-[48px] bg-black text-white font-[Roboto] font-bold text-[14px] rounded-[4px] hover:bg-[#6B7280] transition-colors">
            Checkout
          </button>
          <Link
            href="/"
            className="block text-center font-[Roboto] text-[14px] text-[#6B7280] hover:text-black transition-colors mt-4"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
