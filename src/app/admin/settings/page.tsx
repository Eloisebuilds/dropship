"use client";

import { useEffect, useState } from "react";

interface CheckResult {
  label: string;
  status: "ok" | "error" | "unknown";
  detail: string;
}

export default function AdminSettings() {
  const [checks, setChecks] = useState<CheckResult[]>([
    { label: "Supabase URL", status: "unknown", detail: "Checking..." },
    { label: "Supabase Anon Key", status: "unknown", detail: "Checking..." },
    { label: "Service Role Key", status: "unknown", detail: "Checking..." },
    { label: "Resend API Key", status: "unknown", detail: "Checking..." },
    { label: "Site URL", status: "unknown", detail: "Checking..." },
  ]);

  useEffect(() => {
    const compute = () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const serviceRole = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
      const resendKey = process.env.NEXT_PUBLIC_RESEND_API_KEY;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

      return [
        {
          label: "Supabase URL",
          status: supabaseUrl?.startsWith("https://") ? "ok" : "error",
          detail: supabaseUrl?.startsWith("https://") ? supabaseUrl : "Missing or invalid",
        },
        {
          label: "Supabase Anon Key",
          status: supabaseAnon?.startsWith("ey") ? "ok" : "error",
          detail: supabaseAnon?.startsWith("ey") ? `ey${supabaseAnon.slice(2, 16)}...` : "Missing or invalid",
        },
        {
          label: "Service Role Key",
          status: serviceRole?.startsWith("ey") ? "ok" : "error",
          detail: serviceRole?.startsWith("ey") ? `ey${serviceRole.slice(2, 16)}...` : "Missing or invalid",
        },
        {
          label: "Resend API Key",
          status: resendKey?.startsWith("re_") ? "ok" : "error",
          detail: resendKey?.startsWith("re_") ? `re_${resendKey.slice(3, 12)}...` : "Missing or invalid",
        },
        {
          label: "Site URL",
          status: siteUrl?.startsWith("https://") ? "ok" : "error",
          detail: siteUrl?.startsWith("https://") ? siteUrl : typeof window !== "undefined" ? window.location.origin : "Not set",
        },
      ] as CheckResult[];
    };

    setChecks(compute());
  }, []);

  const [dbCheck, setDbCheck] = useState<CheckResult | null>(null);
  const [emailCheck, setEmailCheck] = useState<CheckResult | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);

  const runDbCheck = async () => {
    setDbCheck({ label: "Database Connection", status: "unknown", detail: "Connecting..." });
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setDbCheck({ label: "Database Connection", status: res.ok ? "ok" : "error", detail: res.ok ? `Connected (${data.products || 0} products)` : data.error || "Failed" });
    } catch {
      setDbCheck({ label: "Database Connection", status: "error", detail: "Could not reach API" });
    }
  };

  const runEmailCheck = async () => {
    if (!testEmail.trim()) return;
    setSending(true);
    setEmailCheck(null);
    try {
      const res = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      const data = await res.json();
      setEmailCheck({ label: "Email Test", status: res.ok ? "ok" : "error", detail: data.message || data.error || "Sent" });
    } catch {
      setEmailCheck({ label: "Email Test", status: "error", detail: "Could not send email" });
    }
    setSending(false);
  };

  return (
    <div className="max-w-[700px]">
      <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-6">Settings</h1>

      <section className="mb-8">
        <h2 className="font-[Roboto] text-[14px] text-black font-bold mb-3">Environment Variables</h2>
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] overflow-hidden">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] last:border-0">
              <div>
                <p className="font-[Roboto] text-[13px] text-black font-bold">{c.label}</p>
                <p className="font-[Roboto] text-[11px] text-[#6B7280] font-mono mt-0.5">{c.detail}</p>
              </div>
              <span className={`font-[Roboto] text-[11px] font-bold px-1.5 py-0.5 rounded ${
                c.status === "ok" ? "bg-[#D1FAE5] text-[#065F46]" :
                c.status === "error" ? "bg-[#FEE2E2] text-[#991B1B]" :
                "bg-[#FEF3C7] text-[#92400E]"
              }`}>
                {c.status === "ok" ? "OK" : c.status === "error" ? "Missing" : "Unknown"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-[Roboto] text-[14px] text-black font-bold mb-3">Database</h2>
        <button onClick={runDbCheck} className="h-[40px] px-4 bg-black text-white font-[Roboto] text-[13px] font-bold rounded-[4px] hover:bg-[#6B7280] transition-colors">
          Test Connection
        </button>
        {dbCheck && (
          <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-[4px] ${
            dbCheck.status === "ok" ? "bg-[#D1FAE5]" : dbCheck.status === "error" ? "bg-[#FEE2E2]" : "bg-[#FEF3C7]"
          }`}>
            <span className="font-[Roboto] text-[12px] text-black">{dbCheck.detail}</span>
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="font-[Roboto] text-[14px] text-black font-bold mb-3">Email</h2>
        <div className="flex gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
            className="flex-1 h-[40px] border border-[#E5E7EB] rounded-[4px] px-3 font-[Roboto] text-[14px] text-black outline-none focus:border-black"
          />
          <button onClick={runEmailCheck} disabled={sending || !testEmail.trim()} className="h-[40px] px-4 bg-black text-white font-[Roboto] text-[13px] font-bold rounded-[4px] hover:bg-[#6B7280] disabled:opacity-50 transition-colors shrink-0">
            {sending ? "Sending..." : "Send Test"}
          </button>
        </div>
        {emailCheck && (
          <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-[4px] ${
            emailCheck.status === "ok" ? "bg-[#D1FAE5]" : "bg-[#FEE2E2]"
          }`}>
            <span className="font-[Roboto] text-[12px] text-black">{emailCheck.detail}</span>
          </div>
        )}
      </section>
    </div>
  );
}