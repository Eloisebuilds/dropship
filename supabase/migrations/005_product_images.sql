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

-- Public read
drop policy if exists "Product images are viewable by everyone" on product_images;
create policy "Product images are viewable by everyone" on product_images for select using (true);

-- Admin insert
drop policy if exists "Admins can insert product images" on product_images;
create policy "Admins can insert product images" on product_images for insert with check (auth.role() = 'authenticated');

-- Admin update
drop policy if exists "Admins can update product images" on product_images;
create policy "Admins can update product images" on product_images for update using (auth.role() = 'authenticated');

-- Admin delete
drop policy if exists "Admins can delete product images" on product_images;
create policy "Admins can delete product images" on product_images for delete using (auth.role() = 'authenticated');

-- Index
create index if not exists idx_product_images_product on product_images(product_id, position);

-- Storage bucket for product images
insert into storage.buckets (id, name, public, avif_autodetection)
values ('product-images', 'product-images', true, false)
on conflict (id) do nothing;

-- Allow public read
drop policy if exists "Public read product-images" on storage.objects;
create policy "Public read product-images" on storage.objects for select using (bucket_id = 'product-images');

-- Allow authenticated upload
drop policy if exists "Authenticated upload product-images" on storage.objects;
create policy "Authenticated upload product-images" on storage.objects for insert with check (
  bucket_id = 'product-images' and auth.role() = 'authenticated'
);

-- Allow authenticated delete
drop policy if exists "Authenticated delete product-images" on storage.objects;
create policy "Authenticated delete product-images" on storage.objects for delete using (
  bucket_id = 'product-images' and auth.role() = 'authenticated'
);

-- Refresh schema cache so REST API picks up new table & bucket
notify pgrst, 'reload schema';
