import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, image_url, cj_product_id, cj_last_synced_at, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    const ids = products.map((p) => p.id);
    const { data: cjData } = await supabase
      .from("cj_products")
      .select("store_product_id, warehouse_inventory")
      .in("store_product_id", ids);

    const invMap = new Map<string, number>();
    if (cjData) {
      for (const row of cjData) {
        const inv = row.warehouse_inventory;
        if (typeof inv === "number") {
          invMap.set(row.store_product_id, inv);
        }
      }
    }

    const result = products.map((p) => ({
      ...p,
      warehouse_inventory: invMap.get(p.id) ?? null,
    }));

    return NextResponse.json({ products: result });
  } catch (error: unknown) {
    console.error("Admin list products error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
