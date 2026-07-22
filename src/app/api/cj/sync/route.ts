import { NextRequest, NextResponse } from "next/server";
import { getCJClient } from "@/lib/cj/client";
import { createServiceClient } from "@/lib/supabase/server";
import type { CJProductListItem, CJVariant, CJInventoryItem } from "@/lib/cj/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, cj_product_id, keyword } = body;

    if (action !== "import") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const cj = getCJClient();
    if (!cj) {
      return NextResponse.json(
        { error: "CJ API key not configured. Set CJ_API_KEY environment variable." },
        { status: 400 }
      );
    }

    let pid: string | undefined = cj_product_id;
    let importedProduct: CJProductListItem | undefined;

    if (!pid && keyword) {
      const searchResult = await cj.searchProducts(keyword, 1, 5);
      const products = searchResult.data?.content?.[0]?.productList || [];
      if (products.length === 0) {
        return NextResponse.json({ error: "No products found for keyword" }, { status: 404 });
      }
      pid = products[0].id;
      importedProduct = products[0];
    }

    if (!pid) {
      return NextResponse.json(
        { error: "Provide cj_product_id or keyword" },
        { status: 400 }
      );
    }

    const [detail, variants, inventory] = await Promise.all([
      cj.getProductDetails(pid),
      cj.getVariants(pid),
      cj.getInventory(pid),
    ]);

    const defaultVariant = variants.find((v: CJVariant) => v.variantStatus === 1) || variants[0];
    if (!defaultVariant) {
      return NextResponse.json({ error: "No active variant found" }, { status: 404 });
    }

    const totalInventory = Object.values(inventory).reduce(
      (sum: number, warehouses: CJInventoryItem[]) =>
        sum + warehouses.reduce((s: number, w: CJInventoryItem) => s + (w.storageNum || 0), 0),
      0
    );

    const cjPrice = parseFloat(defaultVariant.variantSellPrice || detail.sellPrice?.toString() || "0");
    const marginPercent = 58;
    const exchangeRate = 0.92;
    const storePrice = Math.round(cjPrice * exchangeRate * (1 + marginPercent / 100) * 100) / 100;
    const originalStorePrice = Math.round(storePrice * 2 * 100) / 100;

    const supabase = createServiceClient();

    const productData = {
      name: detail.productNameEn || importedProduct?.nameEn || "Imported Product",
      description: detail.description || importedProduct?.description || "",
      price: storePrice,
      image_url: detail.productImage || importedProduct?.bigImage || "",
      stock_quantity: totalInventory,
      cj_product_id: pid,
      cj_variant_id: defaultVariant.vid,
      cj_last_synced_at: new Date().toISOString(),
      supplier_price: cjPrice,
      margin_percent: marginPercent,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("cj_product_id", pid)
      .maybeSingle();

    let productId: string;
    if (existing) {
      const { data } = await supabase
        .from("products")
        .update(productData)
        .eq("id", existing.id)
        .select("id")
        .single();
      productId = data?.id;
    } else {
      const { data } = await supabase
        .from("products")
        .insert({ ...productData, created_at: new Date().toISOString() })
        .select("id")
        .single();
      productId = data?.id;
    }

    const cjProductData = {
      store_product_id: productId,
      cj_product_id: pid,
      cj_variant_id: defaultVariant.vid,
      cj_sku: defaultVariant.variantSku || detail.productSku || "",
      cj_spu: detail.productSku || "",
      cj_image_url: detail.productImage || "",
      cj_sell_price: cjPrice,
      cj_now_price: parseFloat(importedProduct?.nowPrice || "0") || cjPrice,
      warehouse_inventory: inventory,
      last_synced_at: new Date().toISOString(),
    };

    await supabase.from("cj_products").upsert(cjProductData, {
      onConflict: "store_product_id,cj_variant_id",
    });

    await supabase.from("sync_logs").insert({
      sync_type: "product_import",
      status: "completed",
      items_processed: 1,
      items_failed: 0,
    });

    return NextResponse.json({
      success: true,
      product: {
        id: productId,
        name: productData.name,
        price: storePrice,
        originalPrice: originalStorePrice,
        cjPrice,
        inventory: totalInventory,
        marginPercent,
        image: detail.productImage,
        cjProductId: pid,
        cjVariantId: defaultVariant.vid,
      },
    });
  } catch (error: unknown) {
    console.error("CJ sync error:", error);
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "CJ Sync API. Use POST with { action: 'import', cj_product_id: '...' } or { action: 'import', keyword: '...' }",
  });
}
