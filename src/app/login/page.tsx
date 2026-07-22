"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
  const supabase = createClient();

  if (user) {
    router.push("/orders");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (signInError) {
      setError(signInError.message);
      setSending(false);
      return;
    }

    setSent(true);
    setSending(false);
  };

  if (sent) {
    return (
      <div className="max-w-[400px] mx-auto px-4 py-20 text-center">
        <div className="text-[48px] mb-6">✉️</div>
        <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-3">Check Your Email</h1>
        <p className="font-[Roboto] text-[14px] text-[#6B7280] mb-8">
          We sent a magic link to <strong className="text-black">{email}</strong>. Click the link to sign in.
        </p>
        <Link href="/" className="text-[14px] text-[#6B7280] hover:text-black underline">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[400px] mx-auto px-4 py-20">
      <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-2 text-center">Sign In</h1>
      <p className="font-[Roboto] text-[14px] text-[#6B7280] mb-8 text-center">
        Enter your email and we&apos;ll send you a magic link.
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
          {sending ? "Sending..." : "Send Magic Link"}
        </button>

        <Link href="/" className="text-center font-[Roboto] text-[14px] text-[#6B7280] hover:text-black transition-colors">
          Continue as guest
        </Link>
      </form>
    </div>
  );
}
