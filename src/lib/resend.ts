import { Resend } from "resend";

let instance: Resend | null = null;

export function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!instance) {
    instance = new Resend(apiKey);
  }
  return instance;
}

export async function sendMagicLinkEmail(email: string, loginUrl: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const { error } = await resend.emails.send({
    from: "FavorItems <noreply@favoritems.com>",
    to: email,
    subject: "Your sign-in link for FavorItems",
    html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
      <div style="font-size:20px;font-weight:700;margin-bottom:24px;color:#000">FAVORITEMS</div>
      <h1 style="font-size:22px;font-weight:700;color:#000;margin:0 0 12px">Sign in to your account</h1>
      <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 24px">
        Click the button below to sign in. This link expires in 15 minutes and can only be used once.
      </p>
      <a href="${loginUrl}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">
        Sign in to FavorItems
      </a>
      <p style="font-size:12px;line-height:1.5;color:#9CA3AF;margin-top:24px">
        If you didn't request this sign-in link, you can safely ignore this email.
      </p>
    </div>`,
  });

  return !error;
}

export async function sendOrderConfirmationEmail(
  email: string,
  customerName: string,
  orderNumber: string,
  orderUrl: string
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const { error } = await resend.emails.send({
    from: "FavorItems <noreply@favoritems.com>",
    to: email,
    subject: "Order Confirmed — Thank You!",
    html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
      <div style="font-size:20px;font-weight:700;margin-bottom:24px;color:#000">FAVORITEMS</div>
      <h1 style="font-size:22px;font-weight:700;color:#000;margin:0 0 12px">Order Confirmed</h1>
      <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 8px">Hi ${customerName},</p>
      <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 24px">
        Your order <strong>#${orderNumber}</strong> has been confirmed. We&apos;ll notify you when it ships.
      </p>
      <a href="${orderUrl}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">
        View Order Details
      </a>
      <p style="font-size:12px;line-height:1.5;color:#9CA3AF;margin-top:24px">
        Thank you for shopping with FavorItems.
      </p>
    </div>`,
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

  const trackingHtml = trackingNumber
    ? `<p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 24px">
        Tracking number: <strong>${trackingNumber}</strong>
      </p>`
    : "";

  const { error } = await resend.emails.send({
    from: "FavorItems <noreply@favoritems.com>",
    to: email,
    subject: "Your Order Has Shipped!",
    html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
      <div style="font-size:20px;font-weight:700;margin-bottom:24px;color:#000">FAVORITEMS</div>
      <h1 style="font-size:22px;font-weight:700;color:#000;margin:0 0 12px">Your Order Has Shipped!</h1>
      <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 8px">Hi ${customerName},</p>
      <p style="font-size:14px;line-height:1.6;color:#6B7280;margin:0 0 8px">
        Your order <strong>#${orderNumber}</strong> is on its way!
      </p>
      ${trackingHtml}
      <a href="${orderUrl}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 32px;border-radius:4px;text-decoration:none">
        Track Your Order
      </a>
      <p style="font-size:12px;line-height:1.5;color:#9CA3AF;margin-top:24px">
        Thank you for shopping with FavorItems.
      </p>
    </div>`,
  });

  return !error;
}
