import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const MIGRATION_SQL = `
-- Product images gallery
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt text,
  position int not null default 0,
  is_remote boolean default false,
  created_at timestamptz default now()
);

alter table product_images enable row level security;

create policy "Product images are viewable by everyone" on product_images for select using (true);
create policy "Admins can insert product images" on product_images for insert with check (auth.role() = 'authenticated');
create policy "Admins can update product images" on product_images for update using (auth.role() = 'authenticated');
create policy "Admins can delete product images" on product_images for delete using (auth.role() = 'authenticated');

create index if not exists idx_product_images_product on product_images(product_id, position);
`;

export async function POST() {
  const results: { step: string; status: string; message?: string }[] = [];

  // Step 1: Create storage bucket via JS SDK
  try {
    const supabase = createServiceClient();
    const { error: bucketError } = await supabase.storage.createBucket("product-images", {
      public: true,
    });
    if (bucketError && !bucketError.message?.includes("already exists")) {
      results.push({ step: "storage-bucket", status: "error", message: bucketError.message });
    } else {
      results.push({ step: "storage-bucket", status: "ok" });
    }
  } catch (err: unknown) {
    results.push({ step: "storage-bucket", status: "error", message: err instanceof Error ? err.message : "Unknown" });
  }

  // Step 2: Run migration SQL via Supabase Management API
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  if (!accessToken) {
    results.push({ step: "migration-sql", status: "error", message: "SUPABASE_ACCESS_TOKEN not set" });
    return NextResponse.json({ success: false, results });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      results.push({ step: "migration-sql", status: "error", message: "NEXT_PUBLIC_SUPABASE_URL not set" });
      return NextResponse.json({ success: false, results });
    }

    const projectRef = supabaseUrl.replace("https://", "").split(".")[0];

    const mgmtRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: MIGRATION_SQL }),
    });

    if (!mgmtRes.ok) {
      const mgmtError = await mgmtRes.text();
      results.push({ step: "migration-sql", status: "error", message: mgmtError });
    } else {
      results.push({ step: "migration-sql", status: "ok" });
    }
  } catch (err: unknown) {
    results.push({ step: "migration-sql", status: "error", message: err instanceof Error ? err.message : "Unknown" });
  }

  const success = results.every((r) => r.status === "ok");
  return NextResponse.json({ success, results });
}
