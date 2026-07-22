import { NextResponse } from "next/server";
import { getResend } from "@/lib/resend";

export async function POST() {
  try {
    const resend = getResend();
    if (!resend) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
    }

    const templates = [
      {
        name: "magic-link",
        subject: "Your sign-in link for FavorItems",
        html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <div style="font-size:20px;font-weight:700;margin-bottom:24px">FAVORITEMS</div>
          <h1 style="font-size:22px;font-weight:700;margin:0 0 12px">Sign in to your account</h1>
          <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 24px">
            Click the button below to sign in. This link expires in 15 minutes and can only be used once.
          </p>
          <a href="{{{LOGIN_URL}}}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">
            Sign in to FavorItems
          </a>
          <p style="font-size:12px;line-height:1.5;color:#9CA3AF;margin-top:24px">
            If you didn't request this, ignore this email.
          </p>
        </div>`,
        variables: [{ key: "LOGIN_URL", type: "string" as const, fallbackValue: "https://favoritems.com" }],
      },
      {
        name: "order-confirmation",
        subject: "Order Confirmed — Thank You!",
        html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <div style="font-size:20px;font-weight:700;margin-bottom:24px">FAVORITEMS</div>
          <h1 style="font-size:22px;font-weight:700;margin:0 0 12px">Order Confirmed</h1>
          <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 8px">Hi {{{CUSTOMER_NAME}}},</p>
          <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 24px">
            Your order <strong>#{{{ORDER_NUMBER}}}</strong> has been confirmed. We'll notify you when it ships.
          </p>
          <a href="{{{ORDER_URL}}}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">
            View Order Details
          </a>
          <p style="font-size:12px;line-height:1.5;color:#9CA3AF;margin-top:24px">Thank you for shopping with FavorItems.</p>
        </div>`,
        variables: [
          { key: "CUSTOMER_NAME", type: "string" as const, fallbackValue: "Valued Customer" },
          { key: "ORDER_NUMBER", type: "string" as const, fallbackValue: "00000000" },
          { key: "ORDER_URL", type: "string" as const, fallbackValue: "https://favoritems.com/orders" },
        ],
      },
      {
        name: "order-shipped",
        subject: "Your Order Has Shipped!",
        html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <div style="font-size:20px;font-weight:700;margin-bottom:24px">FAVORITEMS</div>
          <h1 style="font-size:22px;font-weight:700;margin:0 0 12px">Your Order Has Shipped!</h1>
          <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 8px">Hi {{{CUSTOMER_NAME}}},</p>
          <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 8px">
            Your order <strong>#{{{ORDER_NUMBER}}}</strong> is on its way!
          </p>
          {{#TRACKING_NUMBER}}<p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 24px">
            Tracking: <strong>{{TRACKING_NUMBER}}</strong>
          </p>{{/TRACKING_NUMBER}}
          <a href="{{{ORDER_URL}}}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">
            Track Your Order
          </a>
          <p style="font-size:12px;line-height:1.5;color:#9CA3AF;margin-top:24px">Thank you for shopping with FavorItems.</p>
        </div>`,
        variables: [
          { key: "CUSTOMER_NAME", type: "string" as const, fallbackValue: "Valued Customer" },
          { key: "ORDER_NUMBER", type: "string" as const, fallbackValue: "00000000" },
          { key: "TRACKING_NUMBER", type: "string" as const, fallbackValue: "" },
          { key: "ORDER_URL", type: "string" as const, fallbackValue: "https://favoritems.com/orders" },
        ],
      },
    ];

    const results = [];

    for (const template of templates) {
      const list = await resend.templates.list();
      const listData = list.data;
      const existing = Array.isArray(listData)
        ? listData.find((t) => t.name === template.name)
        : undefined;

      if (existing) {
        await resend.templates.update(existing.id, {
          name: template.name,
          html: template.html,
        });
        results.push({ name: template.name, action: "updated", id: existing.id });
      } else {
        const created = await resend.templates.create(template);
        await resend.templates.publish(created.data!.id);
        results.push({ name: template.name, action: "created", id: created.data?.id });
      }
    }

    return NextResponse.json({ success: true, templates: results });
  } catch (error: unknown) {
    console.error("setup-templates error:", error);
    const message = error instanceof Error ? error.message : "Failed to setup templates";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
