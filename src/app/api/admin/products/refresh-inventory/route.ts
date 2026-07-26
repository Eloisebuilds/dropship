import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { getCJClient } from "@/lib/cj/client";

const ADMIN_EMAIL = "uaerealprojects@gmail.com";

async function checkAdmin(request: NextRequest) {
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return false;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { product_id } = await request.json();
    if (!product_id) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("cj_product_id, cj_variant_id")
      .eq("id", product_id)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.cj_product_id) {
      return NextResponse.json({ error: "Product has no CJ link" }, { status: 400 });
    }

    const cj = getCJClient();
    if (!cj) {
      return NextResponse.json({ error: "CJ_API_KEY not configured" }, { status: 400 });
    }

    const pid = product.cj_product_id.trim();
    const totalInventory = await cj.getTotalInventory(pid);

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("products")
      .update({ stock_quantity: totalInventory, cj_last_synced_at: now })
      .eq("id", product_id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
    }

    await supabase.from("cj_products").upsert({
      store_product_id: product_id,
      cj_product_id: product.cj_product_id.trim(),
      cj_variant_id: product.cj_variant_id || null,
      warehouse_inventory: totalInventory,
      last_synced_at: now,
    }, { onConflict: "store_product_id,cj_variant_id" });

    return NextResponse.json({ success: true, inventory: totalInventory, synced_at: now });
  } catch (error: unknown) {
    console.error("Refresh inventory error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
