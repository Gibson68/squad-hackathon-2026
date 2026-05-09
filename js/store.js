// localStorage-backed user + inventory store.
// Keeps signup details, profile edits and inventory persistent across sessions.

import { TRADER } from './data.js';

const USER_KEY = 'tradescore_user';
const INV_KEY  = 'tradescore_inventory';

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
