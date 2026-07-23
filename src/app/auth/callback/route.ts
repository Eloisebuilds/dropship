import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sendWelcomeEmail } from "@/lib/resend";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/orders";

  if (code) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const isFirstSignIn =
          user.created_at && user.last_sign_in_at
            ? Math.abs(new Date(user.created_at).getTime() - new Date(user.last_sign_in_at).getTime()) < 5000
            : false;

        if (isFirstSignIn) {
          const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
          sendWelcomeEmail(user.email!, name);
        }
      }

      const response = NextResponse.redirect(`${origin}${next}`);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, { ...cookie });
      });
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
