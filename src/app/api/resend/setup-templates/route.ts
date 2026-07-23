import { NextResponse } from "next/server";
import { getResend } from "@/lib/resend";

export async function POST() {
  try {
    const resend = getResend();
    if (!resend) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
    }

    try {
      await resend.templates.list();
    } catch {
      return NextResponse.json(
        {
          error: "API key cannot manage templates (restricted to sending only)",
          note: "Your Resend API key is restricted to sending emails only. Templates use built-in HTML emails — no template API needed.",
        },
        { status: 400 }
      );
    }

    const templates = [
      {
        name: "magic-link",
        html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px"><div style="font-size:20px;font-weight:700;margin-bottom:24px">FAVORITEMS</div><h1 style="font-size:22px;font-weight:700;margin:0 0 12px">Sign in</h1><p style="font-size:14px;color:#6B7280;margin:0 0 24px">Click to sign in. Link expires in 15 minutes.</p><a href="{{{LOGIN_URL}}}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">Sign in</a></div>`,
        variables: [{ key: "LOGIN_URL", type: "string" as const }],
      },
      {
        name: "order-confirmation",
        html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px"><div style="font-size:20px;font-weight:700;margin-bottom:24px">FAVORITEMS</div><h1 style="font-size:22px;font-weight:700;margin:0 0 12px">Order Confirmed</h1><p style="font-size:14px;color:#6B7280;margin:0 0 8px">Hi {{{CUSTOMER_NAME}}},</p><p style="font-size:14px;color:#6B7280;margin:0 0 24px">Order #{{{ORDER_NUMBER}}} confirmed.</p><a href="{{{ORDER_URL}}}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">View Order</a></div>`,
        variables: [
          { key: "CUSTOMER_NAME", type: "string" as const },
          { key: "ORDER_NUMBER", type: "string" as const },
          { key: "ORDER_URL", type: "string" as const },
        ],
      },
      {
        name: "order-shipped",
        html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px"><div style="font-size:20px;font-weight:700;margin-bottom:24px">FAVORITEMS</div><h1 style="font-size:22px;font-weight:700;margin:0 0 12px">Shipped!</h1><p style="font-size:14px;color:#6B7280;margin:0 0 8px">Hi {{{CUSTOMER_NAME}}},</p><p style="font-size:14px;color:#6B7280;margin:0 0 24px">Order #{{{ORDER_NUMBER}}} shipped!</p><p style="font-size:14px;color:#6B7280;margin:0 0 24px">Tracking: {{{TRACKING_NUMBER}}}</p><a href="{{{ORDER_URL}}}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">Track</a></div>`,
        variables: [
          { key: "CUSTOMER_NAME", type: "string" as const },
          { key: "ORDER_NUMBER", type: "string" as const },
          { key: "TRACKING_NUMBER", type: "string" as const },
          { key: "ORDER_URL", type: "string" as const },
        ],
      },
    ];

    const results = [];
    for (const tpl of templates) {
      const created = await resend.templates.create(tpl);
      if (created.data) {
        await resend.templates.publish(created.data.id);
        results.push({ name: tpl.name, id: created.data.id, status: "created" });
      }
    }

    return NextResponse.json({ success: true, templates: results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
