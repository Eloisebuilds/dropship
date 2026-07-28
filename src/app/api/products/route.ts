import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const list = products || [];

    if (list.length > 0) {
      const ids = list.map((p) => p.id);
      const { data: firstImages } = await supabase
        .from("product_images")
        .select("product_id, url")
        .in("product_id", ids)
        .order("position", { ascending: true });

      if (firstImages) {
        const seen = new Set<string>();
        const imageMap: Record<string, string> = {};
        for (const img of firstImages) {
          if (!seen.has(img.product_id)) {
            seen.add(img.product_id);
            imageMap[img.product_id] = img.url;
          }
        }

        for (const product of list) {
          if (imageMap[product.id]) {
            product.image_url = imageMap[product.id];
          }
        }
      }
    }

    return NextResponse.json({ products: list });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
