import { NextRequest, NextResponse } from "next/server";
import { getCJClient } from "@/lib/cj/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pid = searchParams.get("pid");

    if (!pid) {
      return NextResponse.json({ error: "pid is required" }, { status: 400 });
    }

    const cj = getCJClient();
    if (!cj) {
      return NextResponse.json({ error: "CJ_API_KEY not configured" }, { status: 400 });
    }

    const [detail, variants, totalInventory] = await Promise.all([
      cj.getProductDetails(pid),
      cj.getVariants(pid),
      cj.getTotalInventory(pid),
    ]);

    const defaultVariant = variants[0];

    const cjPrice = parseFloat(defaultVariant?.variantSellPrice || detail.sellPrice?.toString() || "0");
    const marginPercent = 58;
    const exchangeRate = 0.92;
    const storePrice = Math.round(cjPrice * exchangeRate * (1 + marginPercent / 100) * 100) / 100;
    const productImage = detail.bigImage || (detail.productImageSet && detail.productImageSet[0]) || "";

    return NextResponse.json({
      pid: detail.pid || pid,
      name: detail.productNameEn || "Imported Product",
      description: detail.description || "",
      image: productImage,
      images: detail.productImageSet || [],
      cjPrice,
      storePrice,
      originalPrice: Math.round(storePrice * 2 * 100) / 100,
      marginPercent,
      inventory: totalInventory,
      sku: detail.productSku || defaultVariant?.variantSku || "",
      variantId: defaultVariant?.vid || "",
      variants: variants.map((v) => ({
        id: v.vid,
        sku: v.variantSku,
        name: v.variantNameEn || v.variantName || v.variantKey || "",
        price: v.variantSellPrice,
        image: v.variantImage || "",
        weight: v.variantWeight,
        length: v.variantLength,
        width: v.variantWidth,
        height: v.variantHeight,
      })),
      category: detail.categoryName || "",
    });
  } catch (error: unknown) {
    console.error("CJ preview error:", error);
    const message = error instanceof Error ? error.message : "Preview failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
