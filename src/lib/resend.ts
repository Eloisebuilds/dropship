import { Resend } from "resend";

const FROM = "FavorItems <onboarding@resend.dev>";

const TEMPLATES = {
  magicLink: "f9b7acaa-cbd3-46a0-b3f7-c28bb15fff1f",
  welcome: "8bf27416-0249-4b20-9c34-4c0ca0cabefe",
  orderConfirmation: "5812caff-b8cd-4625-bf8d-2d32cf61a7d0",
  orderShipped: "5c6afe41-c3bb-4187-9855-55bf57cc4b45",
  orderDelivered: "4846cfa3-8bfd-41d4-8e85-03f3cc5f0df9",
  abandonedCart: "ceeabdd3-55e0-4072-984b-64e9b4f2e73d",
} as const;

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
    from: FROM,
    to: email,
    subject: "Sign in to FavorItems",
    template: { id: TEMPLATES.magicLink, variables: { LOGIN_URL: loginUrl } as Record<string, string | number> },
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
    template: {
      id: TEMPLATES.welcome,
      variables: {
        CUSTOMER_NAME: customerName,
        ACCOUNT_URL: `${process.env.NEXT_PUBLIC_SITE_URL || "https://dropship-builds333.vercel.app"}/orders`,
      } as Record<string, string | number>,
    },
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
    template: {
      id: TEMPLATES.orderConfirmation,
      variables: {
        CUSTOMER_NAME: customerName,
        ORDER_NUMBER: orderNumber,
        PRODUCT_NAME: productName,
        ORDER_TOTAL: orderTotal,
        ORDER_URL: orderUrl,
      } as Record<string, string | number>,
    },
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
    template: {
      id: TEMPLATES.orderShipped,
      variables: {
        CUSTOMER_NAME: customerName,
        ORDER_NUMBER: orderNumber,
        TRACKING_NUMBER: trackingNumber || "N/A",
        ORDER_URL: orderUrl,
      } as Record<string, string | number>,
    },
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
    template: {
      id: TEMPLATES.orderDelivered,
      variables: {
        CUSTOMER_NAME: customerName,
        ORDER_NUMBER: orderNumber,
        ORDER_URL: orderUrl,
      } as Record<string, string | number>,
    },
  });

  return !error;
}
