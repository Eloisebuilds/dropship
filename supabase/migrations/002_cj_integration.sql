-- CJ Integration Schema

-- Stores CJ API tokens (encrypted)
create table if not exists cj_tokens (
  id uuid primary key default gen_random_uuid(),
  access_token text not null,
  refresh_token text not null,
  open_id bigint not null,
  access_token_expires_at timestamptz not null,
  refresh_token_expires_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table cj_tokens enable row level security;

-- CJ product mapping (links store products to CJ products)
create table if not exists cj_products (
  id uuid primary key default gen_random_uuid(),
  store_product_id uuid not null references products(id) on delete cascade,
  cj_product_id text not null,
  cj_variant_id text not null,
  cj_sku text,
  cj_spu text,
  cj_category_id text,
  cj_category_name text,
  cj_image_url text,
  cj_sell_price decimal(10,2),
  cj_now_price decimal(10,2),
  cj_currency text default 'USD',
  warehouse_inventory jsonb default '[]',
  last_synced_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(store_product_id, cj_variant_id)
);

alter table cj_products enable row level security;

-- Webhook event log (for audit & retry)
create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  event_subtype text,
  cj_message_id text,
  payload jsonb not null,
  status text default 'pending',
  error_message text,
  processed_at timestamptz,
  created_at timestamptz default now()
);

alter table webhook_events enable row level security;

-- Sync log for product imports
create table if not exists sync_logs (
  id uuid primary key default gen_random_uuid(),
  sync_type text not null,
  status text not null default 'running',
  items_processed int default 0,
  items_failed int default 0,
  error_details jsonb,
  started_at timestamptz default now(),
  completed_at timestamptz
);

alter table sync_logs enable row level security;

-- Add CJ fields to existing products table
alter table products add column if not exists cj_product_id text;
alter table products add column if not exists cj_variant_id text;
alter table products add column if not exists cj_last_synced_at timestamptz;
alter table products add column if not exists supplier_price decimal(10,2);
alter table products add column if not exists margin_percent decimal(5,2) default 30.00;

-- Add CJ fields to orders table
alter table orders add column if not exists cj_order_id text;
alter table orders add column if not exists cj_order_status text;
alter table orders add column if not exists cj_tracking_number text;
alter table orders add column if not exists cj_logistic_name text;
alter table orders add column if not exists cj_makeup_status text;
alter table orders add column if not exists error_message text;

-- Add CJ fields to order_items
alter table order_items add column if not exists cj_variant_id text;
alter table order_items add column if not exists cj_line_item_id text;
alter table order_items add column if not exists cj_store_line_item_id text;

-- Indexes
create index if not exists idx_cj_products_cj_id on cj_products(cj_product_id);
create index if not exists idx_cj_products_store_id on cj_products(store_product_id);
create index if not exists idx_webhook_events_status on webhook_events(status);
create index if not exists idx_webhook_events_type on webhook_events(event_type);
create index if not exists idx_sync_logs_type on sync_logs(sync_type);
create index if not exists idx_orders_cj_order on orders(cj_order_id);
create index if not exists idx_products_cj on products(cj_product_id);
