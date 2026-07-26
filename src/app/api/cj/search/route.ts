import { NextRequest, NextResponse } from "next/server";
import { getCJClient } from "@/lib/cj/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword");
    const page = parseInt(searchParams.get("page") || "1");

    if (!keyword) {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    const cj = getCJClient();
    if (!cj) {
      return NextResponse.json({ error: "CJ_API_KEY not configured" }, { status: 400 });
    }

    const result = await cj.searchProducts(keyword, page, 20);
    const products = result.data?.content?.[0]?.productList || [];

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.nameEn,
        sku: p.sku,
        image: p.bigImage,
        sellPrice: p.sellPrice,
        nowPrice: p.nowPrice,
        inventory: p.warehouseInventoryNum,
        category: p.threeCategoryName,
        deliveryCycle: p.deliveryCycle,
        description: p.description,
      })),
      total: result.data?.totalRecords || 0,
      page: result.data?.pageNumber || 1,
      pages: result.data?.totalPages || 0,
    });
  } catch (error: unknown) {
    console.error("CJ search error:", error);
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
