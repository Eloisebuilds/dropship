import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Resend API key not configured" }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Dropshipping Store <onboarding@resend.dev>",
      to: email,
      subject: "Test email from your dropshipping store",
      html: "<p>This is a test email. Your email configuration is working correctly!</p>",
    });

    if (error) throw error;
    return Response.json({ message: `Test email sent to ${email}` });
  } catch (err) {
    console.error("Test email error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to send email" },
      { status: 500 }
    );
  }
}