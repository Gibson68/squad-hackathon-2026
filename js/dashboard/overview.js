import { el, fmt, animate, icon, openModal } from '../utils.js';
import { REV, MONS } from '../data.js';
import { getUser, getAllTransactions } from '../store.js';
import { recommendLoan, categorize } from '../ai.js';
import { TxRow } from '../components/txRow.js';

export function Overview({ navigate }) {
  const TRADER = getUser();
  const root = el('div', { class: 'max-w-[1280px] mx-auto space-y-6' });

  // ── Greeting ──────────────────────────────────────────────
  const hello = new Date().getHours() < 12 ? 'Good morning'
              : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  root.appendChild(el('div', { class: 'flex flex-wrap items-end justify-between gap-3 fade-up' },
    el('div', {},
      el('p', { class: 'text-ink-2 text-[14px]' }, `${hello}, ${TRADER.firstName}`),
      el('h2', {
        class: 'font-display text-[22px] md:text-[26px] font-extrabold text-squad-deep',
        style: { letterSpacing: '-0.025em' },
      }, 'Your business today'),
    ),
    el('div', { class: 'chip', style: { background: '#E5F9F0', color: '#27AE60' } },
      el('span', { style: { fontSize: '7px' } }, '●'),
      'Synced 2 min ago'),
  ));

  // ── KPI strip ─────────────────────────────────────────────
  // Single green family — graded from deepest (hero score) to brightest.
  const scoreSub = TRADER.scoreBoost > 0
    ? `+${TRADER.scoreBoost} pts from your sales`
    : '+12 pts this week';
  const txSub = TRADER.salesCount > 0
    ? `${TRADER.salesCount} from inventory · ${TRADER.transactions - TRADER.salesCount} bank`
    : 'this month';
  const revSub = TRADER.salesValue > 0
    ? `+${fmt(TRADER.salesValue)} from sales today`
    : `+${TRADER.growth}% vs last month`;
  const kpis = el('div', { class: 'grid grid-cols-2 lg:grid-cols-4 gap-4 fade-up-1' });
  kpis.appendChild(KpiCard({
    iconName: 'speedometer2', label: 'TradeScore',
    value: TRADER.score, sub: scoreSub,
    from: '#022B23', to: '#0B6E4F',
    onClick: () => navigate('#/app/score'),
  }));
  kpis.appendChild(KpiCard({
    iconName: 'wallet2', label: 'Monthly revenue',
    value: fmt(TRADER.monthlyRevenue), sub: revSub,
    from: '#0B6E4F', to: '#14855F',
  }));
  kpis.appendChild(KpiCard({
    iconName: 'arrow-left-right', label: 'Transactions',
    value: TRADER.transactions, sub: txSub,
    from: '#14855F', to: '#1F8A65',
  }));
  kpis.appendChild(KpiCard({
    iconName: 'people', label: 'Customers',
    value: TRADER.uniqueCustomers, sub: '+11 new this week',
    from: '#1F8A65', to: '#27AE60',
  }));
  root.appendChild(kpis);

  // ── Two-column main ───────────────────────────────────────
  const grid = el('div', { class: 'grid lg:grid-cols-3 gap-6' });

  // Left column (2/3)
  const left = el('div', { class: 'lg:col-span-2 space-y-6' });
  left.appendChild(buildRevenueCard());
  left.appendChild(buildRecentTxs(navigate));
  grid.appendChild(left);

  // Right column (1/3) — single loan offer, no AI noise
  const right = el('div', { class: 'space-y-6' });
  right.appendChild(buildLoanOfferCard(navigate));
  grid.appendChild(right);

  root.appendChild(grid);

  return root;
}

// ── KPI ────────────────────────────────────────────────────────
function KpiCard({ iconName, label, value, sub, from, to, onClick }) {
  const card = el('div', {
    class: 'rounded-2xl p-5 relative overflow-hidden ' + (onClick ? 'cursor-pointer' : ''),
    style: {
      background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
      boxShadow: `0 10px 24px -10px ${from}99`,
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    onClick,
  });
  if (onClick) {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = `0 16px 30px -10px ${from}cc`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = `0 10px 24px -10px ${from}99`;
    });
  }
  // Subtle halo top-right
  card.appendChild(el('div', {
    style: {
      position: 'absolute', top: '-50px', right: '-50px',
      width: '150px', height: '150px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)',
      pointerEvents: 'none',
    },
  }));
  card.appendChild(el('div', { class: 'flex items-center gap-2.5 mb-3 relative' },
    el('div', {
      class: 'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
      style: {
        background: 'rgba(255,255,255,0.18)',
        color: '#fff', fontSize: '15px',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.18) inset',
      },
    }, icon(iconName)),
    el('div', {
      class: 'text-[11.5px] font-bold uppercase tracking-[0.08em]',
      style: { color: 'rgba(255,255,255,0.82)' },
    }, label),
  ));
  const v = el('div', {
    class: 'font-display text-[26px] font-extrabold text-white relative',
    style: { letterSpacing: '-0.025em' },
  }, '0');
  card.appendChild(v);
  card.appendChild(el('div', {
    class: 'text-[11.5px] mt-0.5 relative font-semibold',
    style: { color: 'rgba(255,255,255,0.75)' },
  }, sub));

  if (typeof value === 'number') {
    animate({ to: value, duration: 1000, onUpdate: n => v.textContent = Math.round(n).toLocaleString() });
  } else {
    v.textContent = String(value);
  }
  return card;
}

// ── Revenue chart ──────────────────────────────────────────────
function buildRevenueCard() {
  const card = el('div', { class: 'card p-6' });
  card.appendChild(el('div', { class: 'flex items-center justify-between mb-4' },
    el('h3', { class: 'font-display text-[18px] font-extrabold text-squad-deep', style: { letterSpacing: '-0.02em' } }, 'Revenue trend'),
    el('div', { class: 'flex items-center gap-2' },
      el('span', { class: 'chip', style: { background: '#E5F9F0', color: '#27AE60' } },
        icon('arrow-up-short'), '18.4%'),
      el('button', {
        class: 'btn btn-ghost !py-1.5 !px-3 !text-[12px]',
        onClick: () => openRevenueModal(),
      }, icon('arrows-fullscreen'), 'Expand'),
    ),
  ));
  card.appendChild(buildRevenueChart({ height: 220 }));
  return card;
}

function openRevenueModal() {
  openModal(({ close }) => {
    const wrap = el('div', { class: 'p-6' });
    wrap.appendChild(el('div', { class: 'flex items-center justify-between mb-1' },
      el('h3', { class: 'font-display text-[20px] font-extrabold text-squad-deep' }, 'Revenue trend'),
      el('span', { class: 'chip', style: { background: '#E5F9F0', color: '#27AE60' } },
        icon('arrow-up-short'), '18.4% vs last period'),
    ));
    wrap.appendChild(el('p', { class: 'text-[12.5px] text-ink-3 mb-4' },
      'Hover or tap a point to see the month total'));
    wrap.appendChild(buildRevenueChart({ height: 380 }));

    const total = REV.reduce((s, v) => s + v, 0);
    const avg = total / REV.length;
    const best = Math.max(...REV);
    const bestMon = MONS[REV.indexOf(best)];
    const stats = el('div', { class: 'grid grid-cols-3 gap-3 mt-5' });
    [
      ['Total', fmt(total)],
      ['Monthly average', fmt(Math.round(avg))],
      ['Best month', `${fmt(best)} · ${bestMon}`],
    ].forEach(([k, v]) => stats.appendChild(el('div', {
      class: 'p-3 rounded-xl',
      style: { background: '#F5F9F6', border: '1px solid #E2E8E4' },
    },
      el('div', { class: 'text-[10.5px] uppercase tracking-wider font-bold text-ink-3' }, k),
      el('div', { class: 'font-display text-[15px] font-extrabold text-squad-deep mt-0.5' }, v),
    )));
    wrap.appendChild(stats);

    wrap.appendChild(el('div', { class: 'flex justify-end mt-5' },
      el('button', { class: 'btn btn-primary !py-2.5 !px-5 !text-[13px]', onClick: close }, 'Close'),
    ));
    return wrap;
  }, { width: 820 });
}

function buildRevenueChart({ height = 220 } = {}) {
  const W = 720, H = height, PAD_X = 30, PAD_Y = 30;
  const series = REV;
  const labels = MONS;
  const max = Math.max(...series) * 1.08;
  const stepX = (W - PAD_X * 2) / (series.length - 1);

  const points = series.map((v, i) => {
    const x = PAD_X + i * stepX;
    const y = H - PAD_Y - (v / max) * (H - PAD_Y * 2);
    return { x, y, v, label: labels[i] };
  });
  const line = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
  const fillPath = line + ` L${points[points.length - 1].x.toFixed(1)} ${H - PAD_Y} L${points[0].x.toFixed(1)} ${H - PAD_Y} Z`;
  const gradId = 'revFill_' + Math.random().toString(36).slice(2, 8);

  const wrap = el('div', { class: 'w-full relative' });

  // Tooltip element (absolute-positioned over the SVG)
  const tip = el('div', {
    style: {
      position: 'absolute', pointerEvents: 'none', opacity: '0',
      background: '#0A1F1A', color: '#fff', padding: '8px 12px',
      borderRadius: '10px', fontSize: '12px', fontWeight: '700',
      transform: 'translate(-50%, -120%)', whiteSpace: 'nowrap',
      transition: 'opacity 0.15s', boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
      zIndex: '10',
    },
  });
  wrap.appendChild(tip);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H + 28}`);
  svg.style.width = '100%';
  svg.style.height = 'auto';
  svg.style.display = 'block';
  svg.innerHTML = `
    <defs>
      <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0B6E4F" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#0B6E4F" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${[1,2,3].map(i => {
      const y = PAD_Y + ((H - PAD_Y * 2) / 4) * i;
      return `<line x1="${PAD_X}" y1="${y}" x2="${W - PAD_X}" y2="${y}" stroke="#E2E8E4" stroke-dasharray="4 6" />`;
    }).join('')}
    <path d="${fillPath}" fill="url(#${gradId})" />
    <path d="${line}" fill="none" stroke="#0B6E4F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
      stroke-dasharray="2000" stroke-dashoffset="2000">
      <animate attributeName="stroke-dashoffset" from="2000" to="0" dur="1.2s" fill="freeze" />
    </path>
    ${labels.map((m, i) => {
      const x = PAD_X + i * stepX;
      return `<text x="${x}" y="${H + 18}" text-anchor="middle"
        style="font-family: Inter, sans-serif; font-size: 11px; font-weight: 600; fill: #4A5C56;">${m}</text>`;
    }).join('')}
  `;
  // Add interactive points as DOM nodes so we can attach listeners
  const NS = 'http://www.w3.org/2000/svg';
  // A vertical guide line revealed on hover
  const guide = document.createElementNS(NS, 'line');
  guide.setAttribute('stroke', '#0B6E4F');
  guide.setAttribute('stroke-width', '1');
  guide.setAttribute('stroke-dasharray', '3 4');
  guide.setAttribute('opacity', '0');
  svg.appendChild(guide);

  points.forEach(p => {
    // Visible dot
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', p.x);
    c.setAttribute('cy', p.y);
    c.setAttribute('r', '4');
    c.setAttribute('fill', '#0B6E4F');
    c.setAttribute('stroke', '#fff');
    c.setAttribute('stroke-width', '2');
    svg.appendChild(c);

    // Larger transparent hit-area for easier hover/tap
    const hit = document.createElementNS(NS, 'circle');
    hit.setAttribute('cx', p.x);
    hit.setAttribute('cy', p.y);
    hit.setAttribute('r', '18');
    hit.setAttribute('fill', 'transparent');
    hit.style.cursor = 'pointer';
    const show = () => {
      c.setAttribute('r', '6');
      c.setAttribute('fill', '#E8FF8B');
      c.setAttribute('stroke', '#0B6E4F');
      guide.setAttribute('x1', p.x);
      guide.setAttribute('x2', p.x);
      guide.setAttribute('y1', PAD_Y);
      guide.setAttribute('y2', H - PAD_Y);
      guide.setAttribute('opacity', '0.6');
      const rect = svg.getBoundingClientRect();
      const scaleX = rect.width / W;
      const scaleY = rect.height / (H + 28);
      tip.style.left = (p.x * scaleX) + 'px';
      tip.style.top = (p.y * scaleY) + 'px';
      tip.innerHTML = `<div style="font-size:10.5px;opacity:0.7;text-transform:uppercase;letter-spacing:0.08em;">${p.label}</div><div style="font-size:14px;margin-top:2px;">${fmt(p.v)}</div>`;
      tip.style.opacity = '1';
    };
    const hide = () => {
      c.setAttribute('r', '4');
      c.setAttribute('fill', '#0B6E4F');
      c.setAttribute('stroke', '#fff');
      guide.setAttribute('opacity', '0');
      tip.style.opacity = '0';
    };
    hit.addEventListener('mouseenter', show);
    hit.addEventListener('mouseleave', hide);
    hit.addEventListener('touchstart', e => { e.preventDefault(); show(); });
    hit.addEventListener('touchend', hide);
    svg.appendChild(hit);
  });

  wrap.appendChild(svg);
  return wrap;
}

// ── Recent transactions ────────────────────────────────────────
function buildRecentTxs(navigate) {
  const card = el('div', { class: 'card p-6' });
  card.appendChild(el('div', { class: 'flex items-center justify-between mb-4' },
    el('h3', { class: 'font-display text-[18px] font-extrabold text-squad-deep', style: { letterSpacing: '-0.02em' } }, 'Recent transactions'),
    el('button', {
      class: 'btn btn-ghost !py-2 !px-4 !text-[12.5px]',
      onClick: () => navigate('#/app/transactions'),
    }, 'View all', icon('arrow-right')),
  ));
  const list = el('div', { class: 'divide-y divide-line' });
  getAllTransactions().slice(0, 6).forEach(tx => list.appendChild(TxRow(tx, { showCategory: false, categorize })));
  card.appendChild(list);
  return card;
}

// ── Loan offer ────────────────────────────────────────────────
function buildLoanOfferCard(navigate) {
  const r = recommendLoan('stock');
  const card = el('div', { class: 'card p-5' });
  card.appendChild(el('div', { class: 'flex items-center gap-2 mb-3' },
    el('div', {
      class: 'w-8 h-8 rounded-lg flex items-center justify-center',
      style: { background: '#E8F4EE', color: '#0B6E4F', fontSize: '14px' },
    }, icon('cash-coin')),
    el('span', { class: 'text-[12px] font-bold text-ink-2' }, 'You qualify for a loan'),
  ));
  card.appendChild(el('div', {
    class: 'font-display text-[28px] font-extrabold text-squad-deep',
    style: { letterSpacing: '-0.025em' },
  }, fmt(r.amount)));
  card.appendChild(el('div', { class: 'text-[12px] text-ink-3 mt-0.5' },
    `${r.rate}% / month · ${r.term}`));

  card.appendChild(el('button', {
    class: 'btn btn-primary w-full !py-3 mt-4 !text-[13px]',
    onClick: () => navigate('#/app/loans'),
  }, 'See loan options', icon('arrow-right')));

  return card;
}
