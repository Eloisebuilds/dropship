-- Stripe payment fields for orders
alter table orders add column if not exists payment_status text default 'unpaid'
  check (payment_status in ('unpaid', 'paid', 'failed', 'refunded'));
alter table orders add column if not exists paid_at timestamptz;
alter table orders add column if not exists currency text default 'usd';
alter table orders add column if not exists stripe_session_id text;
alter table orders add column if not exists stripe_payment_intent_id text;

create index if not exists idx_orders_stripe_session on orders(stripe_session_id);
