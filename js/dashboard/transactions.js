import { el, fmt, fmtShort, icon } from '../utils.js';
import { TXS } from '../data.js';
import { categorize } from '../ai.js';

export function Transactions({ navigate }) {
  const root = el('div', { class: 'max-w-[1280px] mx-auto space-y-6' });
  let filter = 'all';
  let category = null;

  // ── Header KPIs ──────────────────────────────────────────
  const inflow  = TXS.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const outflow = TXS.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);

  root.appendChild(el('div', { class: 'grid grid-cols-2 lg:grid-cols-4 gap-4 fade-up' },
    KpiSm('Total inflow',  fmtShort(inflow),  TXS.filter(t => t.type === 'in').length + ' transactions',  '#27AE60', 'arrow-down-circle'),
    KpiSm('Total outflow', fmtShort(outflow), TXS.filter(t => t.type === 'out').length + ' transactions', '#D4711F', 'arrow-up-circle'),
    KpiSm('Net flow',      fmtShort(inflow - outflow), 'Last 30 days', '#0B6E4F', 'graph-up-arrow'),
    KpiSm('Categories',    Object.keys(buildCategoryMap()).length, 'AI-detected types', '#6C5CE7', 'tags'),
  ));

  // ── Filters bar ──────────────────────────────────────────
  const bar = el('div', { class: 'card p-4 flex flex-wrap items-center gap-3 fade-up-1' });
  bar.appendChild(el('div', {
    class: 'flex items-center gap-2 px-3 py-2 rounded-xl bg-squad-paper border border-line flex-1 min-w-[200px]',
  },
    el('span', { class: 'text-ink-3', style: { fontSize: '14px' } }, icon('search')),
    el('input', {
      class: 'flex-1 bg-transparent outline-none text-[13px]',
      placeholder: 'Search transactions, refs, customers…',
    }),
  ));

  const segWrap = el('div', { class: 'flex bg-squad-paper p-1 rounded-xl border border-line', 'data-seg': '1' });
  ['all', 'in', 'out'].forEach(s => {
    const btn = el('button', {
      class: 'px-4 py-2 rounded-lg text-[12.5px] font-bold capitalize tap',
      'data-filter': s,
      onClick: () => { filter = s; render(); paintSeg(); },
    }, s === 'in' ? 'Inflow' : s === 'out' ? 'Outflow' : 'All');
    segWrap.appendChild(btn);
  });
  bar.appendChild(segWrap);
  function paintSeg() {
    segWrap.querySelectorAll('[data-filter]').forEach(b => {
      const a = b.dataset.filter === filter;
      b.style.background = a ? '#fff' : 'transparent';
      b.style.color      = a ? '#0A1F1A' : '#9AA8A2';
      b.style.boxShadow  = a ? '0 2px 8px rgba(0,0,0,0.06)' : 'none';
    });
  }
  paintSeg();

  bar.appendChild(el('button', {
    class: 'btn btn-ghost !py-2.5 !px-4 !text-[12.5px]',
  }, icon('download'), 'Export CSV'));
  root.appendChild(bar);

  // ── Category chips ──────────────────────────────────────
  const catBar = el('div', { class: 'flex flex-wrap gap-2 fade-up-2' });
  const cats = buildCategoryMap();
  const allBtn = el('button', {
    class: 'chip px-4 py-2 cursor-pointer tap',
    'data-cat': '__all',
    style: { background: '#022B23', color: '#fff' },
    onClick: () => { category = null; render(); paintCats(); },
  }, icon('grid-fill'), 'All categories');
  catBar.appendChild(allBtn);
  Object.entries(cats).forEach(([name, info]) => {
    const btn = el('button', {
      class: 'chip px-4 py-2 cursor-pointer tap',
      'data-cat': name,
      style: { background: '#fff', color: info.color, border: '1px solid #E2E8E4' },
      onClick: () => { category = (category === name ? null : name); render(); paintCats(); },
    }, icon('tag-fill'), `${name} · ${info.count}`);
    catBar.appendChild(btn);
  });
  function paintCats() {
    catBar.querySelectorAll('[data-cat]').forEach(b => {
      const key = b.dataset.cat;
      const isAll = key === '__all';
      const active = isAll ? !category : (category === key);
      if (isAll) {
        b.style.background = active ? '#022B23' : '#fff';
        b.style.color      = active ? '#fff' : '#4A5C56';
        b.style.border     = active ? '1px solid #022B23' : '1px solid #E2E8E4';
      } else {
        const info = cats[key];
        b.style.background = active ? info.color : '#fff';
        b.style.color      = active ? '#fff' : info.color;
        b.style.border     = active ? '1px solid ' + info.color : '1px solid #E2E8E4';
      }
    });
  }
  root.appendChild(catBar);

  // ── List ────────────────────────────────────────────────
  const card = el('div', { class: 'card p-2 md:p-3 fade-up-3' });
  const list = el('div', { class: 'divide-y divide-line' });
  card.appendChild(list);
  root.appendChild(card);

  function render() {
    list.innerHTML = '';
    let visible = TXS.filter(t => filter === 'all' || t.type === filter);
    if (category) visible = visible.filter(t => categorize(t).category === category);
    if (!visible.length) {
      list.appendChild(el('div', { class: 'p-8 text-center text-ink-3 text-[13px]' },
        'No transactions match this filter.'));
      return;
    }
    visible.forEach(t => list.appendChild(buildRow(t)));
  }
  render();

  return root;
}

function buildRow(tx) {
  const isIn = tx.type === 'in';
  const cat = categorize(tx);
  return el('div', { class: 'flex items-center gap-4 p-4' },
    el('div', {
      class: 'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
      style: {
        background: isIn ? '#E5F9F0' : '#FFEFE5',
        color: isIn ? '#27AE60' : '#D4711F',
        fontSize: '17px',
      },
    }, icon(isIn ? 'arrow-down' : 'arrow-up')),
    el('div', { class: 'flex-1 min-w-0' },
      el('div', { class: 'flex items-center gap-2 flex-wrap' },
        el('span', { class: 'text-[14px] font-bold text-ink-1' }, tx.name),
        el('span', {
          class: 'chip',
          style: { background: cat.color + '18', color: cat.color, padding: '2px 8px', fontSize: '10.5px' },
        }, icon('tag-fill'), cat.category),
      ),
      el('div', { class: 'text-[11.5px] text-ink-3 mt-0.5' }, tx.time + (tx.ref ? ' · ' + tx.ref : '')),
    ),
    el('div', {
      class: 'text-[14.5px] font-extrabold flex-shrink-0',
      style: { color: isIn ? '#27AE60' : '#0A1F1A' },
    }, (isIn ? '+' : '-') + fmt(tx.amount)),
  );
}

function KpiSm(label, value, sub, accent, iconName) {
  return el('div', { class: 'card p-4' },
    el('div', { class: 'flex items-center gap-2' },
      iconName ? el('span', { style: { color: accent, fontSize: '15px' } }, icon(iconName)) : null,
      el('div', { class: 'text-[10.5px] uppercase tracking-[0.1em] text-ink-3 font-bold' }, label),
    ),
    el('div', {
      class: 'font-display font-extrabold text-squad-deep mt-1.5',
      style: { fontSize: '24px', letterSpacing: '-0.025em' },
    }, value),
    el('div', { class: 'text-[11px] mt-0.5 text-ink-3' }, sub),
  );
}

function buildCategoryMap() {
  const map = {};
  TXS.forEach(t => {
    const c = categorize(t);
    map[c.category] = map[c.category] || { color: c.color, count: 0 };
    map[c.category].count += 1;
  });
  return map;
}
