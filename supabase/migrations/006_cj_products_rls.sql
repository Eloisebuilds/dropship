-- Allow authenticated users (admin) to read cj_products
drop policy if exists "Authenticated users can view cj_products" on cj_products;
create policy "Authenticated users can view cj_products" on cj_products for select using (auth.role() = 'authenticated');
