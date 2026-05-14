// ─────────────────────────────────────────────────────────────────
// Payments integration — front-end stub.
//
// 🔧 BACKEND TODO
// Replace the body of `createPaymentLink` with a real API call to your
// payment provider (Squad / Paystack / Flutterwave / GTPay etc.).
//
// The function MUST keep the same signature & return shape so the UI
// (js/dashboard/inventory.js) keeps working without changes.
//
// Expected request from UI:
//   {
//     item:      { id, name, category, price, qty }, // inventory row
//     qty:       Number,    // units the customer is buying
//     amount:    Number,    // unit price × qty (kobo? naira? — your call)
//     currency:  'NGN',
//     reference: String,    // generated client-side, can be overwritten
//     customer:  { name, business, walletId },
//   }
//
// Expected response shape:
//   {
//     url:        String,    // payment link to share with the customer
//     reference:  String,    // canonical txn reference (server-issued)
//     expiresAt:  Number,    // unix ms — used to render countdown
//     provider:   String,    // e.g. 'squad' | 'paystack'
//     status:     'pending' | 'paid' | 'failed',
//   }
//
// Sample real-world implementation (Squad sandbox):
//
//   const res = await fetch(`${API_BASE}/transaction/initiate`, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${SQUAD_SECRET_KEY}`, // server-side only!
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       amount: amount * 100,            // Squad expects kobo
//       email: customer.email,
//       currency: 'NGN',
//       initiate_type: 'inline',
//       transaction_ref: reference,
//       customer_name: customer.name,
//       metadata: { item_id: item.id, qty },
//     }),
//   });
//   const json = await res.json();
//   return {
//     url:        json.data.checkout_url,
//     reference:  json.data.transaction_ref,
//     expiresAt:  Date.now() + 30 * 60 * 1000,
//     provider:   'squad',
//     status:     'pending',
//   };
// ─────────────────────────────────────────────────────────────────

// 🔧 BACKEND: replace with your provider base URL and load via env vars.
export const API_BASE   = 'https://sandbox-api-d.squadco.com';
export const CHECKOUT_BASE = 'https://sandbox-pay.squadco.com';

// 🔧 BACKEND: generate a real reference server-side and return it in the
// response. The client-side fallback below is fine for dev only.
export function generateReference(prefix = 'TS') {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand  = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}

// 🔧 BACKEND: swap the body of this function with a real fetch() call.
// Keep the resolved shape identical (see contract above).
export async function createPaymentLink({ item, qty, amount, currency = 'NGN', reference, customer }) {
  // Simulate network latency so the UI shows its loading state.
  await new Promise(r => setTimeout(r, 700));

  const ref = reference || generateReference();

  // Mock checkout URL — purely for demo. Replace with provider response.
  const url = `${CHECKOUT_BASE}/pay?ref=${encodeURIComponent(ref)}&amt=${amount}&cur=${currency}`;

  return {
    url,
    reference: ref,
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
    provider:  'squad',
    status:    'pending',
    // Echo back the request so the UI can show line-item info.
    meta: { itemId: item?.id, itemName: item?.name, qty, amount, currency, customer },
  };
}

// 🔧 BACKEND: replace this with a real status poll (webhook is better).
export async function checkPaymentStatus(reference) {
  await new Promise(r => setTimeout(r, 500));
  return { reference, status: 'pending' };
}
