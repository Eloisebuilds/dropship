"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart";

function ReturnHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      router.replace("/cart");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/stripe/session-status?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (data.status === "complete" && data.orderId) {
          clearCart();
          router.replace(`/order-confirmation/${data.orderId}`);
        } else {
          router.replace("/cart");
        }
      } catch {
        router.replace("/cart");
      }
    })();
  }, [searchParams, router, clearCart]);

  return (
    <div className="max-w-[600px] mx-auto px-4 md:px-6 py-20 text-center">
      <div className="w-[48px] h-[48px] border-2 border-[#E5E7EB] border-t-black rounded-full animate-spin mx-auto mb-6" />
      <h1 className="font-[Montserrat] font-bold text-[20px] text-black mb-2">Confirming your payment...</h1>
      <p className="font-[Roboto] text-[14px] text-[#6B7280]">
        Please wait a moment while we finalize your order.
      </p>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense fallback={null}>
      <ReturnHandler />
    </Suspense>
  );
}
