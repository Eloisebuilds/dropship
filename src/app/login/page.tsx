"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  if (user) {
    router.push("/orders");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send sign-in link");
      }

      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-[400px] mx-auto px-4 py-20 text-center">
        <div className="w-[64px] h-[64px] bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 4L12 13 2 4" />
          </svg>
        </div>
        <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-3">Check Your Email</h1>
        <p className="font-[Roboto] text-[14px] text-[#6B7280] mb-3 max-w-[320px] mx-auto">
          We sent a sign-in link to <strong className="text-black">{email}</strong>.
        </p>
        <p className="font-[Roboto] text-[12px] text-[#9CA3AF] mb-8">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <button
            onClick={() => { setSent(false); setSending(false); }}
            className="underline hover:text-black cursor-pointer"
          >
            try again
          </button>
        </p>
        <Link href="/" className="font-[Roboto] text-[14px] text-[#6B7280] hover:text-black transition-colors">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[400px] mx-auto px-4 py-20">
      <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-2 text-center">Sign In</h1>
      <p className="font-[Roboto] text-[14px] text-[#6B7280] mb-8 text-center">
        Enter your email and we&apos;ll send you a sign-in link.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-[44px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black transition-colors"
        />

        {error && (
          <p className="font-[Roboto] text-[12px] text-[#B91C1C]">{error}</p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full h-[48px] bg-black text-white font-[Roboto] font-bold text-[14px] rounded-[4px] hover:bg-[#6B7280] transition-colors disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send Sign-In Link"}
        </button>

        <Link href="/" className="text-center font-[Roboto] text-[14px] text-[#6B7280] hover:text-black transition-colors">
          Continue as guest
        </Link>
      </form>
    </div>
  );
}
