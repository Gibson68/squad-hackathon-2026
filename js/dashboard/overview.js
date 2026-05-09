import { el, fmt, animate, icon } from '../utils.js';
import { TXS, REV, MONS } from '../data.js';
import { getUser } from '../store.js';
import { generateScoreInsight, detectAlerts, recommendLoan, forecastNextMonths, categorize } from '../ai.js';
import { TxRow } from '../components/txRow.js';

export function Overview({ navigate }) {
  const TRADER = getUser();
  const root = el('div', { class: 'max-w-[1280px] mx-auto space-y-6' });

  // ── Greeting ──────────────────────────────────────────────
  const hello = new Date().getHours() < 12 ? 'Good morning'
              : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  root.appendChild(el('div', { class: 'flex flex-wrap items-end justify-between gap-3 fade-up' },
    el('div', {},
      el('p', { class: 'text-ink-2 text-[14px] flex items-center gap-1.5' },
        `${hello}, ${TRADER.firstName}`, icon('hand-thumbs-up')),
      el('h2', {
        class: 'font-display text-[24px] md:text-[30px] font-extrabold text-squad-deep',
        style: { letterSpacing: '-0.025em' },
      }, 'Here’s how your business is doing today.'),
    ),
    el('div', { class: 'chip', style: { background: '#E5F9F0', color: '#27AE60' } },
      el('span', { style: { fontSize: '7px' } }, '●'),
      'Live · synced with Squad 2 min ago'),
  ));

  // ── KPI strip ─────────────────────────────────────────────
  const kpis = el('div', { class: 'grid grid-cols-2 lg:grid-cols-4 gap-4 fade-up-1' });
  kpis.appendChild(KpiCard({
    iconName: 'speedometer2', iconBg: '#E8F4EE', iconColor: '#0B6E4F', label: 'TradeScore',
    value: TRADER.score, sub: '+12 pts this week', accent: '#0B6E4F',
    onClick: () => navigate('#/app/score'),
  }));
  kpis.appendChild(KpiCard({
    iconName: 'wallet2', iconBg: '#E5F9F0', iconColor: '#27AE60', label: 'Monthly revenue',
    value: fmt(TRADER.monthlyRevenue), sub: `+${TRADER.growth}% vs last month`, accent: '#27AE60',
  }));
  kpis.appendChild(KpiCard({
    iconName: 'arrow-left-right', iconBg: '#E8F4EE', iconColor: '#1F8A65', label: 'Transactions',
    value: TRADER.transactions, sub: 'this month', accent: '#1F8A65',
  }));
  kpis.appendChild(KpiCard({
    iconName: 'people', iconBg: '#EFEDFE', iconColor: '#6C5CE7', label: 'Unique customers',
    value: TRADER.uniqueCustomers, sub: '+11 new this week', accent: '#6C5CE7',
  }));
  root.appendChild(kpis);

  // ── Two-column main ───────────────────────────────────────
  const grid = el('div', { class: 'grid lg:grid-cols-3 gap-6' });

  // Left column (2/3)
  const left = el('div', { class: 'lg:col-span-2 space-y-6' });

  // AI Insight banner
  left.appendChild(buildAiInsightBanner(navigate));

  // Revenue chart
  left.appendChild(buildRevenueCard());

  // Recent transactions with categories
  left.appendChild(buildRecentTxs(navigate));

  grid.appendChild(left);

  // Right column (1/3)
  const right = el('div', { class: 'space-y-6' });
  right.appendChild(buildLoanOfferCard(navigate));
  right.appendChild(buildAlertsCard());
  right.appendChild(buildForecastCard());
  grid.appendChild(right);

  root.appendChild(grid);

  return root;
}

// ── KPI ────────────────────────────────────────────────────────
function KpiCard({ iconName, iconBg = '#E8F4EE', iconColor = '#0B6E4F', label, value, sub, accent, onClick }) {
  const card = el('div', {
    class: 'card p-5 ' + (onClick ? 'card-hover cursor-pointer' : ''),
    onClick,
  });
  card.appendChild(el('div', { class: 'flex items-center justify-between mb-3' },
    el('div', {
      class: 'w-10 h-10 rounded-xl flex items-center justify-center',
      style: { background: iconBg, color: iconColor, fontSize: '17px' },
    }, icon(iconName)),
    onClick ? el('span', { class: 'text-ink-3', style: { fontSize: '13px' } }, icon('arrow-right')) : null,
  ));
  card.appendChild(el('div', { class: 'text-[10.5px] uppercase tracking-[0.1em] text-ink-3 font-bold' }, label));
  const v = el('div', {
    class: 'font-display text-[24px] md:text-[26px] font-extrabold text-ink-1 mt-1',
    style: { letterSpacing: '-0.025em' },
  }, '0');
  card.appendChild(v);
  card.appendChild(el('div', { class: 'text-[11.5px] mt-1 font-medium', style: { color: accent } }, sub));

  // Animate counter if value is a number
  if (typeof value === 'number') {
    animate({ to: value, duration: 1000, onUpdate: n => v.textContent = Math.round(n).toLocaleString() });
  } else {
    v.textContent = String(value);
  }
  return card;
}

// ── AI Insight banner ──────────────────────────────────────────
function buildAiInsightBanner(navigate) {
  const ins = generateScoreInsight();
  const card = el('div', {
    class: 'rounded-2xl p-6 md:p-7 relative overflow-hidden',
    style: {
      background: 'linear-gradient(135deg, #022B23 0%, #0B6E4F 100%)',
      boxShadow: '0 12px 32px rgba(2, 43, 35, 0.15)',
    },
  });
  card.appendChild(el('div', {
    class: 'absolute rounded-full',
    style: { width: '260px', height: '260px', top: '-90px', right: '-80px',
             background: 'radial-gradient(circle, rgba(232,255,139,0.18), transparent 70%)' },
  }));
  const inner = el('div', { class: 'relative z-10' });

  inner.appendChild(el('div', { class: 'flex items-center gap-2 mb-4' },
    el('div', {
      class: 'w-8 h-8 rounded-full flex items-center justify-center',
      style: { background: 'rgba(232,255,139,0.16)', color: '#E8FF8B', fontSize: '14px' },
    }, icon('stars')),
    el('div', { class: 'text-[11px] font-bold uppercase tracking-[0.18em]', style: { color: '#E8FF8B' } },
      'AI INSIGHT · GENERATED LIVE'),
  ));

  inner.appendChild(el('h3', {
    class: 'font-display text-white text-[22px] md:text-[26px] font-extrabold leading-tight',
    style: { letterSpacing: '-0.02em' },
  }, ins.headline));

  const body = el('div', { class: 'mt-3 space-y-2' });
  ins.body.forEach(t => body.appendChild(el('p', {
    class: 'text-[13.5px] leading-relaxed ai-text',
    style: { color: 'rgba(255,255,255,0.78)' },
    html: t.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#E8FF8B;">$1</strong>'),
  })));
  inner.appendChild(body);

  inner.appendChild(el('div', { class: 'flex flex-wrap items-center gap-3 mt-5' },
    el('button', {
      class: 'btn btn-lime !py-2.5 !px-4 !text-[13px]',
      onClick: () => navigate('#/app/score'),
    }, 'See full breakdown', icon('arrow-right')),
    el('button', {
      class: 'btn !py-2.5 !px-4 !text-[13px] text-white border border-white/30 hover:bg-white/10',
      onClick: () => navigate('#/app/assistant'),
    }, icon('chat-square-quote'), 'Ask follow-up'),
    el('div', {
      class: 'ml-auto text-[11px]',
      style: { color: 'rgba(232,255,139,0.65)' },
    }, `Confidence: ${Math.round(ins.confidence * 100)}%`),
  ));
  card.appendChild(inner);
  return card;
}

// ── Revenue chart ──────────────────────────────────────────────
function buildRevenueCard() {
  const card = el('div', { class: 'card p-6' });
  card.appendChild(el('div', { class: 'flex items-center justify-between mb-1' },
    el('h3', { class: 'font-display text-[18px] font-extrabold text-squad-deep', style: { letterSpacing: '-0.02em' } }, 'Revenue trend'),
    el('div', { class: 'flex items-center gap-2' },
      el('span', { class: 'chip', style: { background: '#E5F9F0', color: '#27AE60' } },
        icon('arrow-up-short'), '18.4%'),
      el('span', { class: 'chip', style: { background: '#F5F5F0', color: '#4A5C56' } }, '7 months'),
    ),
  ));
  card.appendChild(el('p', { class: 'text-[12.5px] text-ink-3 mb-5' }, 'Aggregated from your Squad transaction history'));
  card.appendChild(buildRevenueChart());
  return card;
}

function buildRevenueChart() {
  const W = 720, H = 240, PAD_X = 20, PAD_Y = 30;
  const fc = forecastNextMonths(2);
  const series = [...REV, ...fc];
  const labels = [...MONS, 'May*', 'Jun*'];
  const max = Math.max(...series) * 1.08;
  const stepX = (W - PAD_X * 2) / (series.length - 1);

  const points = series.map((v, i) => {
    const x = PAD_X + i * stepX;
    const y = H - PAD_Y - (v / max) * (H - PAD_Y * 2);
    return [x, y];
  });
  const realPts = points.slice(0, REV.length);
  const fcPts   = points.slice(REV.length - 1); // include last real point
  const realLine = realPts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const fillPath = realLine + ` L${realPts[realPts.length - 1][0].toFixed(1)} ${H - PAD_Y} L${realPts[0][0].toFixed(1)} ${H - PAD_Y} Z`;
  const fcLine   = fcPts.map((p, i)  => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');

  const wrap = el('div', { class: 'w-full' });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H + 28}`);
  svg.style.width = '100%';
  svg.style.height = 'auto';
  svg.style.display = 'block';
  svg.innerHTML = `
    <defs>
      <linearGradient id="revFill2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0B6E4F" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#0B6E4F" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${[1,2,3].map(i => {
      const y = PAD_Y + ((H - PAD_Y * 2) / 4) * i;
      return `<line x1="${PAD_X}" y1="${y}" x2="${W - PAD_X}" y2="${y}" stroke="#E2E8E4" stroke-dasharray="4 6" />`;
    }).join('')}
    <path d="${fillPath}" fill="url(#revFill2)" />
    <path d="${realLine}" fill="none" stroke="#0B6E4F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
      stroke-dasharray="2000" stroke-dashoffset="2000">
      <animate attributeName="stroke-dashoffset" from="2000" to="0" dur="1.4s" fill="freeze" />
    </path>
    <path d="${fcLine}" fill="none" stroke="#27AE60" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
      stroke-dasharray="6 6" opacity="0">
      <animate attributeName="opacity" from="0" to="1" begin="1.4s" dur="0.4s" fill="freeze" />
    </path>
    ${points.map((p, i) => `
      <circle cx="${p[0]}" cy="${p[1]}" r="${i === REV.length - 1 ? 6 : 4}"
        fill="${i >= REV.length ? '#E8FF8B' : (i === REV.length - 1 ? '#E8FF8B' : '#0B6E4F')}"
        stroke="#fff" stroke-width="2" />
    `).join('')}
    ${labels.map((m, i) => {
      const x = PAD_X + i * stepX;
      const isFc = i >= REV.length;
      return `<text x="${x}" y="${H + 18}" text-anchor="middle"
        style="font-family: Inter, sans-serif; font-size: 11px; font-weight: 600; fill: ${isFc ? '#9AA8A2' : '#4A5C56'};">${m}</text>`;
    }).join('')}
  `;
  wrap.appendChild(svg);

  const legend = el('div', { class: 'flex items-center gap-5 mt-4 text-[11.5px]' },
    el('span', { class: 'flex items-center gap-2' },
      el('span', { class: 'w-3 h-3 rounded-full', style: { background: '#0B6E4F' } }),
      el('span', { class: 'text-ink-2 font-semibold' }, 'Actual'),
    ),
    el('span', { class: 'flex items-center gap-2' },
      el('span', { class: 'w-3 h-3 rounded-full', style: { background: '#E8FF8B', border: '2px solid #27AE60' } }),
      el('span', { class: 'text-ink-2 font-semibold' }, 'AI forecast'),
    ),
  );
  wrap.appendChild(legend);
  return wrap;
}

// ── Recent transactions ────────────────────────────────────────
function buildRecentTxs(navigate) {
  const card = el('div', { class: 'card p-6' });
  card.appendChild(el('div', { class: 'flex items-center justify-between mb-4' },
    el('div', {},
      el('h3', { class: 'font-display text-[18px] font-extrabold text-squad-deep', style: { letterSpacing: '-0.02em' } }, 'Recent transactions'),
      el('p', { class: 'text-[12.5px] text-ink-3 mt-0.5' }, 'AI auto-tagged in real time'),
    ),
    el('button', {
      class: 'btn btn-ghost !py-2 !px-4 !text-[12.5px]',
      onClick: () => navigate('#/app/transactions'),
    }, 'View all', icon('arrow-right')),
  ));
  const list = el('div', { class: 'divide-y divide-line' });
  TXS.slice(0, 6).forEach(tx => list.appendChild(TxRow(tx, { showCategory: true, categorize })));
  card.appendChild(list);
  return card;
}

// ── Loan offer ────────────────────────────────────────────────
function buildLoanOfferCard(navigate) {
  const r = recommendLoan('stock');
  const card = el('div', {
    class: 'rounded-2xl p-5 relative overflow-hidden',
    style: {
      background: 'linear-gradient(135deg, #E8FF8B 0%, #C5F362 100%)',
      boxShadow: '0 12px 28px rgba(232, 255, 139, 0.45)',
    },
  });
  card.appendChild(el('div', { class: 'flex items-center gap-2 mb-3' },
    el('span', { class: 'text-squad-deep', style: { fontSize: '14px' } }, icon('stars')),
    el('span', { class: 'text-[10.5px] font-extrabold uppercase tracking-[0.15em] text-squad-deep' },
      'AI-recommended loan'),
  ));
  card.appendChild(el('div', {
    class: 'font-display text-[32px] font-extrabold text-squad-deep',
    style: { letterSpacing: '-0.025em' },
  }, fmt(r.amount)));
  card.appendChild(el('div', { class: 'text-[12.5px] text-squad-deep/80 -mt-0.5' },
    `${r.rate}% / month · ${r.term} term`));

  const why = el('div', { class: 'mt-4 p-3 rounded-xl bg-white/40 border border-white/60' });
  why.appendChild(el('div', { class: 'text-[10.5px] uppercase tracking-wider font-extrabold text-squad-deep mb-1' },
    'Why this amount?'));
  why.appendChild(el('p', { class: 'text-[12px] text-squad-deep/85 leading-relaxed' }, r.reasons[0]));
  card.appendChild(why);

  card.appendChild(el('button', {
    class: 'btn btn-dark w-full !py-3 mt-4 !text-[13px]',
    onClick: () => navigate('#/app/loans'),
  }, 'Continue', icon('arrow-right')));

  return card;
}

// ── Alerts ────────────────────────────────────────────────────
function buildAlertsCard() {
  const card = el('div', { class: 'card p-6' });
  card.appendChild(el('div', { class: 'flex items-center justify-between mb-4' },
    el('h3', { class: 'font-display text-[16px] font-extrabold text-squad-deep', style: { letterSpacing: '-0.02em' } }, 'Smart alerts'),
    el('span', { class: 'chip', style: { background: '#E8F4EE', color: '#0B6E4F' } }, icon('stars'), 'AI'),
  ));
  const list = el('div', { class: 'space-y-3' });
  const alertIcon = {
    opportunity: 'lightning-charge-fill',
    risk: 'exclamation-triangle-fill',
    info: 'info-circle-fill',
  };
  detectAlerts().forEach((a, i) => {
    const tone = a.kind === 'opportunity' ? { bg: '#E5F9F0', accent: '#27AE60' }
              : a.kind === 'risk'         ? { bg: '#FCE8E8', accent: '#D43E3E' }
              : { bg: '#FFF8DA', accent: '#B58400' };
    list.appendChild(el('div', {
      class: 'flex gap-3 p-3 rounded-xl',
      style: { background: tone.bg, animation: `fadeUp 0.5s ${0.1 + i * 0.07}s cubic-bezier(0.22,1,0.36,1) both` },
    },
      el('div', {
        class: 'flex-shrink-0 mt-0.5',
        style: { color: tone.accent, fontSize: '17px', lineHeight: '1' },
      }, icon(alertIcon[a.kind] || 'info-circle-fill')),
      el('div', {},
        el('div', { class: 'text-[12.5px] font-extrabold mb-0.5', style: { color: tone.accent } }, a.title),
        el('div', { class: 'text-[11.5px] text-ink-2 leading-relaxed' }, a.body),
      ),
    ));
  });
  card.appendChild(list);
  return card;
}

// ── Forecast ──────────────────────────────────────────────────
function buildForecastCard() {
  const fc = forecastNextMonths(3);
  const months = ['May', 'Jun', 'Jul'];
  const card = el('div', { class: 'card p-6' });
  card.appendChild(el('h3', {
    class: 'font-display text-[16px] font-extrabold text-squad-deep mb-1',
    style: { letterSpacing: '-0.02em' },
  }, 'Revenue forecast'));
  card.appendChild(el('p', { class: 'text-[11.5px] text-ink-3 mb-4' },
    'AI projection · linear regression on Squad data'));
  const list = el('div', { class: 'space-y-3' });
  fc.forEach((v, i) => list.appendChild(el('div', {
    class: 'flex items-center justify-between p-3 rounded-xl',
    style: { background: i === 0 ? '#E8F4EE' : '#FAFAF6', border: '1px solid ' + (i === 0 ? '#0B6E4F' : '#E2E8E4') },
  },
    el('div', {},
      el('div', { class: 'text-[12px] uppercase tracking-wider font-bold text-ink-3' },
        months[i] + (i === 0 ? ' · Next month' : '')),
      el('div', { class: 'font-display text-[20px] font-extrabold text-squad-deep mt-0.5' }, fmt(v)),
    ),
    el('div', {
      class: 'chip',
      style: { background: '#fff', color: '#0B6E4F', border: '1px solid #E2E8E4' },
    }, icon('arrow-up-short'), Math.round(((v / REV[REV.length - 1]) - 1) * 100) + '%'),
  )));
  card.appendChild(list);
  return card;
}
