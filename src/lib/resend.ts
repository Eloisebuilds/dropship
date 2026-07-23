import { Resend } from "resend";

const FROM = "FavorItems <onboarding@resend.dev>";

let instance: Resend | null = null;

export function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!instance) {
    instance = new Resend(apiKey);
  }
  return instance;
}

function wrapHtml(body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#f9fafb">${body}</body></html>`;
}

export async function sendMagicLinkEmail(email: string, loginUrl: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Sign in to FavorItems",
    html: wrapHtml(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
        <div style="max-width:480px;background:#fff;border-radius:8px;padding:40px 32px;text-align:left">
          <div style="font-size:20px;font-weight:700;margin-bottom:24px;color:#000">FAVORITEMS</div>
          <h1 style="font-size:22px;font-weight:700;color:#000;margin:0 0 12px">Sign in to your account</h1>
          <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 24px">
            Click the button below to sign in. This link expires in 15 minutes and can only be used once.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td>
            <a href="${loginUrl}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">
              Sign in to FavorItems
            </a>
          </td></tr></table>
          <p style="font-size:12px;line-height:1.5;color:#9CA3AF;margin-top:24px">
            If you didn't request this sign-in link, you can safely ignore this email.
          </p>
        </div>
      </td></tr></table>
    `),
  });

  return !error;
}

export async function sendWelcomeEmail(email: string, customerName: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Welcome to FavorItems!",
    html: wrapHtml(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
        <div style="max-width:480px;background:#fff;border-radius:8px;padding:40px 32px;text-align:left">
          <div style="font-size:20px;font-weight:700;margin-bottom:24px;color:#000">FAVORITEMS</div>
          <h1 style="font-size:22px;font-weight:700;color:#000;margin:0 0 12px">Welcome to FavorItems, ${customerName}!</h1>
          <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 24px">
            You're all set. When you place an order, you can track it from your account dashboard.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://dropship-builds333.vercel.app"}/orders" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">
              Go to My Orders
            </a>
          </td></tr></table>
          <p style="font-size:12px;line-height:1.5;color:#9CA3AF;margin-top:24px">
            Questions? Email us anytime.
          </p>
        </div>
      </td></tr></table>
    `),
  });

  return !error;
}

export async function sendOrderConfirmationEmail(
  email: string,
  customerName: string,
  orderNumber: string,
  productName: string,
  orderTotal: string,
  orderUrl: string
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Order Confirmed — #${orderNumber}`,
    html: wrapHtml(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
        <div style="max-width:480px;background:#fff;border-radius:8px;padding:40px 32px;text-align:left">
          <div style="font-size:20px;font-weight:700;margin-bottom:24px;color:#000">FAVORITEMS</div>
          <h1 style="font-size:22px;font-weight:700;color:#000;margin:0 0 12px">Order Confirmed</h1>
          <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 8px">Hi ${customerName},</p>
          <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 8px">Your order <strong>#${orderNumber}</strong> has been confirmed.</p>
          <div style="border:1px solid #E5E7EB;border-radius:6px;padding:16px;margin:16px 0 24px">
            <p style="font-size:14px;color:#6B7280;margin:0 0 4px">Product: <strong style="color:#000">${productName}</strong></p>
            <p style="font-size:14px;color:#6B7280;margin:0">Total: <strong style="color:#000">${orderTotal}</strong></p>
          </div>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td>
            <a href="${orderUrl}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">
              View Order Details
            </a>
          </td></tr></table>
          <p style="font-size:12px;line-height:1.5;color:#9CA3AF;margin-top:24px">
            We'll notify you when your order ships.
          </p>
        </div>
      </td></tr></table>
    `),
  });

  return !error;
}

export async function sendOrderShippedEmail(
  email: string,
  customerName: string,
  orderNumber: string,
  trackingNumber: string | null,
  orderUrl: string
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your Order Has Shipped — #${orderNumber}`,
    html: wrapHtml(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
        <div style="max-width:480px;background:#fff;border-radius:8px;padding:40px 32px;text-align:left">
          <div style="font-size:20px;font-weight:700;margin-bottom:24px;color:#000">FAVORITEMS</div>
          <h1 style="font-size:22px;font-weight:700;color:#000;margin:0 0 12px">Your Order Has Shipped!</h1>
          <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 8px">Hi ${customerName},</p>
          <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 8px">Your order <strong>#${orderNumber}</strong> is on its way!</p>
          ${trackingNumber ? `<p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 24px">Tracking: <strong>${trackingNumber}</strong></p>` : ""}
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td>
            <a href="${orderUrl}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">
              Track Your Order
            </a>
          </td></tr></table>
          <p style="font-size:12px;line-height:1.5;color:#9CA3AF;margin-top:24px">Thank you for shopping with FavorItems.</p>
        </div>
      </td></tr></table>
    `),
  });

  return !error;
}

export async function sendOrderDeliveredEmail(
  email: string,
  customerName: string,
  orderNumber: string,
  orderUrl: string
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Order Delivered — #${orderNumber}`,
    html: wrapHtml(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
        <div style="max-width:480px;background:#fff;border-radius:8px;padding:40px 32px;text-align:left">
          <div style="font-size:20px;font-weight:700;margin-bottom:24px;color:#000">FAVORITEMS</div>
          <h1 style="font-size:22px;font-weight:700;color:#000;margin:0 0 12px">Order Delivered!</h1>
          <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 8px">Hi ${customerName},</p>
          <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 24px">Your order <strong>#${orderNumber}</strong> has been delivered. We hope you love it!</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td>
            <a href="${orderUrl}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">
              View Order Details
            </a>
          </td></tr></table>
          <p style="font-size:12px;line-height:1.5;color:#9CA3AF;margin-top:24px">Thank you for choosing FavorItems.</p>
        </div>
      </td></tr></table>
    `),
  });

  return !error;
}
