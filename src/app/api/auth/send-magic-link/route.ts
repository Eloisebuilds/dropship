import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendMagicLinkEmail } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = createServiceClient();
    const redirectTo = new URL("/auth/callback", request.url).toString();

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: normalizedEmail,
      options: { redirectTo },
    });

    if (error) {
      console.error("Supabase generateLink error:", JSON.stringify(error));
      return NextResponse.json({ error: `Failed to generate sign-in link: ${error.message}` }, { status: 500 });
    }

    const loginUrl = data.properties?.action_link;

    if (!loginUrl) {
      return NextResponse.json({ error: "No sign-in link generated" }, { status: 500 });
    }

    const sent = await sendMagicLinkEmail(normalizedEmail, loginUrl);

    if (!sent) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("send-magic-link error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
