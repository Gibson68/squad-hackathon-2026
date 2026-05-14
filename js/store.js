// localStorage-backed user + inventory store.
// Keeps signup details, profile edits and inventory persistent across sessions.

import { TRADER, TXS } from './data.js';

const USER_KEY  = 'tradescore_user';
const INV_KEY   = 'tradescore_inventory';
const SALES_KEY = 'tradescore_sales';
const PREFS_KEY = 'tradescore_prefs';

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); }
  catch { return null; }
}
function write(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── User profile ────────────────────────────────────────────────
// Merges saved overrides on top of the default mock TRADER, so every
// dashboard panel gets the trader's real signup details.
export function getUser() {
  const saved = read(USER_KEY) || {};
  const merged = { ...TRADER, ...saved };
  // Derived fields
  if (saved.name && !saved.firstName) merged.firstName = saved.name.split(/\s+/)[0];
  if (saved.name) {
    merged.avatar = saved.name
      .split(/\s+/).filter(Boolean).slice(0, 2)
      .map(p => p[0]?.toUpperCase()).join('') || TRADER.avatar;
  }
  if (saved.business) merged.business = saved.business;

  // Live KPIs: stack cash sales recorded in-app on top of the historical base.
  const sales = read(SALES_KEY) || [];
  const baseRev   = TRADER.monthlyRevenue;
  const baseTx    = TRADER.transactions;
  const baseScore = TRADER.score;
  const salesValue = sales.reduce((s, x) => s + x.total, 0);
  const salesCount = sales.length;
  merged.monthlyRevenue = baseRev + salesValue;
  merged.transactions   = baseTx + salesCount;
  // +2 pts per sale, capped at +50 so the demo doesn't run away
  merged.scoreBoost     = Math.min(50, salesCount * 2);
  merged.score          = baseScore + merged.scoreBoost;
  merged.salesValue     = salesValue;
  merged.salesCount     = salesCount;
  return merged;
}
export function saveUser(partial) {
  const cur = read(USER_KEY) || {};
  write(USER_KEY, { ...cur, ...partial });
  return getUser();
}
export function clearUser() { localStorage.removeItem(USER_KEY); }

// ── Inventory ──────────────────────────────────────────────────
// item: { id, name, category, price, qty }
export function getInventory() {
  return read(INV_KEY) || [];
}
export function saveInventory(items) { write(INV_KEY, items); }
export function addInventoryItem(item) {
  const items = getInventory();
  const next = [{ id: 'i_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), qty: 1, ...item }, ...items];
  saveInventory(next);
  return next;
}
export function updateInventoryItem(id, patch) {
  const items = getInventory().map(it => it.id === id ? { ...it, ...patch } : it);
  saveInventory(items);
  return items;
}
export function removeInventoryItem(id) {
  const items = getInventory().filter(it => it.id !== id);
  saveInventory(items);
  return items;
}

// ── Sales ledger ───────────────────────────────────────────────
// Cash-sale events: { id, itemId, name, category, price, qty, at }
export function getSales() { return read(SALES_KEY) || []; }
export function recordSale(item, qty = 1) {
  const items = getInventory();
  const found = items.find(i => i.id === item.id);
  if (!found || found.qty < qty) return { ok: false, reason: 'out_of_stock' };
  // decrement
  updateInventoryItem(item.id, { qty: found.qty - qty });
  const sales = getSales();
  const sale = {
    id: 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    itemId: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    qty,
    total: item.price * qty,
    at: Date.now(),
  };
  write(SALES_KEY, [sale, ...sales]);
  return { ok: true, sale };
}
export function getSalesToday() {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  return getSales().filter(s => s.at >= start.getTime());
}

// Inventory cash-sale → transaction-row shape.
function saleToTx(s) {
  return {
    id: s.id,
    name: `${s.qty}× ${s.name}`,
    type: 'in',
    amount: s.total,
    time: relativeTime(s.at),
    ref: 'INV-' + s.id.slice(-6).toUpperCase(),
    category: s.category,
    _sale: true,
    _at: s.at,
  };
}

function relativeTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  const isYest = d.toDateString() === yest.toDateString();
  const hh = d.getHours();
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = ((hh + 11) % 12) + 1;
  const clock = `${h12}:${mm} ${ampm}`;
  if (sameDay) return `Today, ${clock}`;
  if (isYest) return `Yesterday, ${clock}`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' + clock;
}

// Merged feed: inventory sales (newest first) + static mock TXS.
export function getAllTransactions() {
  const sales = getSales().map(saleToTx);
  return [...sales, ...TXS];
}

// ── Preferences (notifications, AI tone, security PIN) ──────────
export function getPrefs() {
  return {
    notifications: { email: true, sms: false, push: true },
    ai: { tone: 'friendly', frequency: 'daily' },
    security: { pin: null, twoFA: false },
    ...(read(PREFS_KEY) || {}),
  };
}
export function savePrefs(partial) {
  const cur = getPrefs();
  const next = { ...cur, ...partial };
  write(PREFS_KEY, next);
  return next;
}

// ── Catalog of preset items per signup category ────────────────
// User picks a category, then taps an item — no typing needed for the common case.
// They can still add a custom item via the "Custom item" field.
export const CATALOG = {
  'Fashion':       ['T-shirt', 'Trouser', 'Ankara fabric', 'Lace fabric', 'Shoes', 'Bag', 'Wristwatch', 'Cap', 'Belt', 'Headtie', 'Senator wear', 'Aso-oke'],
  'Food & Drinks': ['Rice (50kg)', 'Beans (50kg)', 'Yam tuber', 'Cooking oil (5L)', 'Garri (bucket)', 'Bottled drink', 'Sachet water (bag)', 'Bread (loaf)', 'Pepper basket', 'Crate of eggs', 'Tomato basket', 'Plantain bunch'],
  'Electronics':   ['Phone charger', 'Earpiece', 'Power bank', 'USB cable', 'Phone case', 'Bluetooth speaker', 'Memory card', 'LED bulb', 'Extension box', 'Battery', 'HDMI cable', 'Iron'],
  'Beauty':        ['Body cream', 'Shampoo', 'Lipstick', 'Perfume', 'Hair extension', 'Soap', 'Powder', 'Hair cream', 'Deodorant', 'Nail polish', 'Hair dye', 'Body oil'],
  'Groceries':     ['Tomato paste', 'Maggi cube', 'Milo sachet', 'Indomie pack', 'Toothpaste', 'Salt (500g)', 'Sugar (500g)', 'Detergent', 'Tissue roll', 'Spaghetti', 'Cornflakes', 'Tinned milk'],
  'Other':         ['Service', 'Custom item'],
};

// Sensible default unit price (NGN) per category — used as the starting price.
export const DEFAULT_PRICE = {
  'Fashion':       3500,
  'Food & Drinks': 1500,
  'Electronics':   2500,
  'Beauty':        2000,
  'Groceries':     800,
  'Other':         1000,
};
