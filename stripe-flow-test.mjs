import fs from "node:fs";
import Stripe from "stripe";

const BASE = process.env.TEST_BASE || "http://localhost:3100";
const env = {};
for (const line of fs.readFileSync("/Users/eloisegourillon/Desktop/dropshipping/.env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
const STRIPE_SECRET = env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;

const stripe = new Stripe(STRIPE_SECRET);
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY;

const { createClient } = await import("@supabase/supabase-js");
const supabase = createClient(supabaseUrl, serviceRole);

const PRODUCT_ID = "c80a7858-bbbc-4784-8ed6-38157864df4a";
const TEST_EMAIL = "audit-test@example.com";

const results = [];
function report(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  -- " + detail : ""}`);
}

async function api(path, body) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function signEvent(session, type = "checkout.session.completed") {
  const payload = JSON.stringify({
    id: `evt_audit_${Date.now()}`,
    object: "event",
    api_version: "2026-07-29.dahlia",
    created: Math.floor(Date.now() / 1000),
    data: { object: session },
    livemode: true,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
    type,
  });
  const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
  return { payload, signature };
}

async function fireWebhook(session, type) {
  const { payload, signature } = await signEvent(session, type);
  const res = await fetch(BASE + "/api/stripe/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json", "stripe-signature": signature },
    body: payload,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

function sessionFor(orderId, sessionId, { paid = true, amount, currency = "eur" } = {}) {
  return {
    id: sessionId,
    object: "checkout.session",
    status: "complete",
    payment_status: paid ? "paid" : "unpaid",
    amount_total: amount,
    currency,
    customer_email: TEST_EMAIL,
    metadata: { order_id: orderId },
    payment_intent: "pi_audit_test",
    customer_details: { email: TEST_EMAIL, name: "Audit Tester", phone: "+15551234567" },
    collected_information: {
      shipping_details: {
        name: "Audit Tester",
        address: { line1: "1 Main St", line2: null, city: "Los Angeles", state: "CA", postal_code: "90001", country: "US" },
      },
    },
  };
}

const createdOrderIds = [];
const createdSessionIds = [];

// ---- 1. EUR checkout ----
{
  const { status, json } = await api("/api/stripe/checkout", {
    items: [{ productId: PRODUCT_ID, quantity: 2 }],
    email: TEST_EMAIL,
    currency: "EUR",
  });
  report("checkout EUR returns clientSecret", status === 200 && !!json.clientSecret, JSON.stringify(json).slice(0, 160));
  createdOrderIds.push(json.orderId);
  createdSessionIds.push(json.sessionId);
  const session = await stripe.checkout.sessions.retrieve(json.sessionId, { expand: ["line_items"] });
  const li = session.line_items?.data?.[0];
  const unit = li ? Math.round(li.amount_total / li.quantity) : undefined;
  report("EUR unit_amount = 2300", unit === 2300, `unit=${unit} total=${session.amount_total} cur=${session.currency}`);
  report("EUR session amount_total = 4600", session.amount_total === 4600, `total=${session.amount_total}`);
}

// ---- 2. JPY checkout (zero-decimal) ----
let jpyOrderId = null;
{
  const { status, json } = await api("/api/stripe/checkout", {
    items: [{ productId: PRODUCT_ID, quantity: 1 }],
    email: TEST_EMAIL,
    currency: "JPY",
  });
  report("checkout JPY works", status === 200 && !!json.clientSecret, JSON.stringify(json).slice(0, 160));
  jpyOrderId = json.orderId;
  createdOrderIds.push(json.orderId);
  createdSessionIds.push(json.sessionId);
  const session = await stripe.checkout.sessions.retrieve(json.sessionId, { expand: ["line_items"] });
  const unit = session.line_items?.data?.[0]?.amount_total;
  const { data: dbOrder } = await supabase.from("orders").select("total, currency").eq("id", jpyOrderId).single();
  report("JPY unit_amount = 3761 (not 376100)", unit === 3761, `unit=${unit}`);
  report("JPY order.total stored as 3761 JPY (not 37.61)", dbOrder?.total === 3761, `total=${dbOrder?.total} currency=${dbOrder?.currency}`);

  // session-status endpoint shape
  const sres = await fetch(`${BASE}/api/stripe/session-status?session_id=${encodeURIComponent(json.sessionId)}`);
  const sj = await sres.json();
  report("session-status returns status+paymentStatus", sres.status === 200 && typeof sj.paymentStatus === "string", JSON.stringify(sj).slice(0, 120));

  // full webhook success on JPY order (zero-decimal reconciliation)
  const jpyOk = await fireWebhook(sessionFor(jpyOrderId, json.sessionId, { amount: 3761, currency: "jpy" }));
  const { data: jdb } = await supabase.from("orders").select("payment_status, total, error_message").eq("id", jpyOrderId).single();
  report("JPY webhook marks paid with total 3761", jpyOk.status === 200 && jdb?.payment_status === "paid" && jdb?.total === 3761, `status=${jdb?.payment_status} total=${jdb?.total} err=${jdb?.error_message}`);
}

// ---- 3. Error paths ----
{
  const badPayload = JSON.stringify({ id: "x", type: "checkout.session.completed" });
  const res = await fetch(BASE + "/api/stripe/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json", "stripe-signature": "t=1,v1=bogus" },
    body: badPayload,
  });
  report("webhook rejects bad signature (400)", res.status === 400, `status=${res.status}`);
}

// ---- 4. Success flow on EUR order ----
let successOrderId = null;
{
  const { status, json } = await api("/api/stripe/checkout", {
    items: [{ productId: PRODUCT_ID, quantity: 1 }],
    email: TEST_EMAIL,
    currency: "EUR",
  });
  successOrderId = json.orderId;
  createdOrderIds.push(json.orderId);
  createdSessionIds.push(json.sessionId);
  const session = await stripe.checkout.sessions.retrieve(json.sessionId);

  // 4a. not-paid event
  const notPaid = await fireWebhook(sessionFor(successOrderId, session.id, { paid: false, amount: session.amount_total }));
  let { data: db } = await supabase.from("orders").select("payment_status, error_message").eq("id", successOrderId).single();
  report("webhook not-paid leaves order unpaid", notPaid.json.notPaid === true && db?.payment_status === "unpaid", `notPaid=${notPaid.json.notPaid} status=${db?.payment_status}`);

  // 4b. amount mismatch
  const mismatch = await fireWebhook(sessionFor(successOrderId, session.id, { amount: session.amount_total + 1 }));
  ({ data: db } = await supabase.from("orders").select("payment_status, error_message").eq("id", successOrderId).single());
  report("webhook amount mismatch flagged", mismatch.json.mismatch === true && db?.payment_status === "unpaid" && !!db?.error_message, `error=${db?.error_message}`);

  // 4c. correct paid event -> full success
  const ok = await fireWebhook(sessionFor(successOrderId, session.id, { amount: session.amount_total }));
  ({ data: db } = await supabase.from("orders").select("*").eq("id", successOrderId).single());
  report("webhook success marks order paid", ok.status === 200 && db?.payment_status === "paid", `status=${db?.payment_status}`);
  report("order status -> processing", db?.status === "processing", `status=${db?.status}`);
  report("order total updated from session", db?.total === session.amount_total / 100, `total=${db?.total}`);
  report("order shipping_address populated", db?.shipping_address !== "Pending" && db?.shipping_address !== null, `addr=${db?.shipping_address}`);
  report("stripe_session_id + intent stored", db?.stripe_session_id === session.id && !!db?.stripe_payment_intent_id, `session=${db?.stripe_session_id} intent=${db?.stripe_payment_intent_id}`);
  report("CJ fulfillment attempted", !!db?.cj_order_id || !!db?.error_message, `cj_order_id=${db?.cj_order_id} error=${db?.error_message}`);

  // 4d. duplicate event
  const dup = await fireWebhook(sessionFor(successOrderId, session.id, { amount: session.amount_total }));
  report("duplicate webhook ignored", dup.json.duplicate === true, `duplicate=${dup.json.duplicate}`);
}

// ---- 5. Cleanup ----
{
  const { error } = await supabase.from("orders").delete().in("id", createdOrderIds);
  report("test orders cleaned up", !error, error ? error.message : `${createdOrderIds.length} deleted`);
  for (const sid of createdSessionIds) {
    try { await stripe.checkout.sessions.expire(sid); } catch {}
  }
  console.log(`expired ${createdSessionIds.length} checkout sessions`);
}

console.log("\n=== SUMMARY ===");
const failed = results.filter((r) => !r.ok);
console.log(`${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.log("FAILED:");
  failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
  process.exit(1);
}
