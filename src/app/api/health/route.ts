import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });
    return Response.json({ ok: true, products: count ?? 0 });
  } catch (_err) {
    return Response.json({ ok: false, error: "Database connection failed" }, { status: 500 });
  }
}