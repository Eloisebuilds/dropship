import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendMagicLinkEmail } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {},
        },
      }
    );

    const redirectTo = new URL("/auth/callback", request.url).toString();

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email.toLowerCase().trim(),
      options: { redirectTo },
    });

    if (error) {
      console.error("Supabase generateLink error:", error.message);
      return NextResponse.json({ error: "Failed to generate sign-in link" }, { status: 500 });
    }

    const loginUrl = data.properties?.action_link;

    if (!loginUrl) {
      return NextResponse.json({ error: "No sign-in link generated" }, { status: 500 });
    }

    const sent = await sendMagicLinkEmail(email, loginUrl);

    if (!sent) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("send-magic-link error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
