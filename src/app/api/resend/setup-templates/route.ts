import { NextResponse } from "next/server";
import { getResend } from "@/lib/resend";

const TEMPLATE_DEFS = [
  {
    name: "magic-link",
    html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px"><div style="font-size:20px;font-weight:700;margin-bottom:24px;color:#000">FAVORITEMS</div><h1 style="font-size:22px;font-weight:700;color:#000;margin:0 0 12px">Sign in to your account</h1><p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 24px">Click the button to sign in. This link expires in 15 minutes.</p><a href="{{{LOGIN_URL}}}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">Sign in to FavorItems</a></div>`,
    variables: [{ key: "LOGIN_URL", type: "string" as const }],
  },
  {
    name: "welcome",
    html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px"><div style="font-size:20px;font-weight:700;margin-bottom:24px;color:#000">FAVORITEMS</div><h1 style="font-size:22px;font-weight:700;color:#000;margin:0 0 12px">Welcome, {{{CUSTOMER_NAME}}}!</h1><p style="font-size:14px;color:#6B7280;margin:0 0 24px">You are all set. Track your orders from your account.</p><a href="{{{ACCOUNT_URL}}}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">My Orders</a></div>`,
    variables: [{ key: "CUSTOMER_NAME", type: "string" as const }, { key: "ACCOUNT_URL", type: "string" as const }],
  },
  {
    name: "order-confirmation",
    html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px"><div style="font-size:20px;font-weight:700;margin-bottom:24px;color:#000">FAVORITEMS</div><h1 style="font-size:22px;font-weight:700;color:#000;margin:0 0 12px">Order Confirmed</h1><p style="font-size:14px;color:#6B7280;margin:0 0 8px">Hi {{{CUSTOMER_NAME}}},</p><p style="font-size:14px;color:#6B7280;margin:0 0 8px">Order #{{{ORDER_NUMBER}}} confirmed.</p><div style="border:1px solid #E5E7EB;border-radius:6px;padding:16px;margin:16px 0 24px"><p style="font-size:14px;color:#6B7280;margin:0 0 4px">{{{PRODUCT_NAME}}}</p><p style="font-size:14px;color:#6B7280;margin:0">Total: <strong>{{{ORDER_TOTAL}}}</strong></p></div><a href="{{{ORDER_URL}}}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">View Order</a></div>`,
    variables: [
      { key: "CUSTOMER_NAME", type: "string" as const },
      { key: "ORDER_NUMBER", type: "string" as const },
      { key: "PRODUCT_NAME", type: "string" as const },
      { key: "ORDER_TOTAL", type: "string" as const },
      { key: "ORDER_URL", type: "string" as const },
    ],
  },
  {
    name: "order-shipped",
    html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px"><div style="font-size:20px;font-weight:700;margin-bottom:24px;color:#000">FAVORITEMS</div><h1 style="font-size:22px;font-weight:700;color:#000;margin:0 0 12px">Shipped!</h1><p style="font-size:14px;color:#6B7280;margin:0 0 8px">Hi {{{CUSTOMER_NAME}}},</p><p style="font-size:14px;color:#6B7280;margin:0 0 8px">Order #{{{ORDER_NUMBER}}} shipped!</p><p style="font-size:14px;color:#6B7280;margin:0 0 24px">Tracking: {{{TRACKING_NUMBER}}}</p><a href="{{{ORDER_URL}}}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">Track</a></div>`,
    variables: [
      { key: "CUSTOMER_NAME", type: "string" as const },
      { key: "ORDER_NUMBER", type: "string" as const },
      { key: "TRACKING_NUMBER", type: "string" as const },
      { key: "ORDER_URL", type: "string" as const },
    ],
  },
  {
    name: "order-delivered",
    html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px"><div style="font-size:20px;font-weight:700;margin-bottom:24px;color:#000">FAVORITEMS</div><h1 style="font-size:22px;font-weight:700;color:#000;margin:0 0 12px">Delivered!</h1><p style="font-size:14px;color:#6B7280;margin:0 0 8px">Hi {{{CUSTOMER_NAME}}},</p><p style="font-size:14px;color:#6B7280;margin:0 0 24px">Order #{{{ORDER_NUMBER}}} delivered. We hope you love it!</p><a href="{{{ORDER_URL}}}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">View Order</a></div>`,
    variables: [
      { key: "CUSTOMER_NAME", type: "string" as const },
      { key: "ORDER_NUMBER", type: "string" as const },
      { key: "ORDER_URL", type: "string" as const },
    ],
  },
  {
    name: "abandoned-cart",
    html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px"><div style="font-size:20px;font-weight:700;margin-bottom:24px;color:#000">FAVORITEMS</div><h1 style="font-size:22px;font-weight:700;color:#000;margin:0 0 12px">You left something behind!</h1><p style="font-size:14px;color:#6B7280;margin:0 0 8px">Hi {{{CUSTOMER_NAME}}},</p><div style="border:1px solid #E5E7EB;border-radius:6px;padding:16px;margin:16px 0 24px"><p style="font-size:14px;color:#6B7280;margin:0 0 4px">{{{PRODUCT_NAME}}}</p><p style="font-size:14px;color:#6B7280;margin:0">Price: <strong>{{{PRODUCT_PRICE}}}</strong></p></div><a href="{{{CART_URL}}}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">Checkout</a></div>`,
    variables: [
      { key: "CUSTOMER_NAME", type: "string" as const },
      { key: "PRODUCT_NAME", type: "string" as const },
      { key: "PRODUCT_PRICE", type: "string" as const },
      { key: "CART_URL", type: "string" as const },
    ],
  },
];

export async function POST() {
  try {
    const resend = getResend();
    if (!resend) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
    }

    const results: { name: string; action: string; id: string }[] = [];

    for (const def of TEMPLATE_DEFS) {
      const list = await resend.templates.list();
      const raw = list.data;
      const arr: { id: string; name: string }[] = [];
      if (Array.isArray(raw)) {
        for (const item of raw) {
          if (item && typeof item === "object" && "id" in item && "name" in item) {
            arr.push({ id: (item as { id: string; name: string }).id, name: (item as { id: string; name: string }).name });
          }
        }
      }

      const existing = arr.find((t) => t.name === def.name);

      if (existing) {
        await resend.templates.update(existing.id, def);
        results.push({ name: def.name, action: "updated", id: existing.id });
      } else {
        const created = await resend.templates.create(def);
        if (created.data) {
          await resend.templates.publish(created.data.id);
          results.push({ name: def.name, action: "created", id: created.data.id });
        }
      }
    }

    return NextResponse.json({ success: true, templates: results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
