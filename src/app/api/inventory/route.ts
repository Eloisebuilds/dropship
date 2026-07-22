import { NextRequest, NextResponse } from "next/server";
import { getCJClient } from "@/lib/cj/client";

export async function GET(request: NextRequest) {
  try {
    const pid = request.nextUrl.searchParams.get("pid");
    if (!pid) {
      return NextResponse.json({ error: "Provide cj_product_id as ?pid=..." }, { status: 400 });
    }

    const cj = getCJClient();
    if (!cj) {
      return NextResponse.json({ error: "CJ API not configured" }, { status: 400 });
    }

    const inventory = await cj.getInventory(pid);
    return NextResponse.json({ inventory });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
