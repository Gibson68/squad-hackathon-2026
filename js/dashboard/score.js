import { el, animate, icon } from '../utils.js';
import { FACTORS } from '../data.js';
import { getUser } from '../store.js';
import { ScoreGauge } from '../components/scoreGauge.js';
import { generateScoreInsight } from '../ai.js';

export function ScorePanel({ navigate }) {
  const TRADER = getUser();
  const root = el('div', { class: 'max-w-[1280px] mx-auto space-y-6' });
  const ins = generateScoreInsight();

  // ── Top hero card ──────────────────────────────────────────
  const top = el('div', {
    class: 'rounded-2xl p-6 lg:p-8 grid lg:grid-cols-[280px_1fr] gap-8 items-center fade-up',
    style: {
      background: 'linear-gradient(135deg, #022B23 0%, #0B6E4F 100%)',
      boxShadow: '0 16px 40px rgba(2, 43, 35, 0.20)',
    },
  });

  const gaugeWrap = el('div', { class: 'flex justify-center gauge-text-light' });
  gaugeWrap.appendChild(ScoreGauge({ score: TRADER.score, size: 240 }));
  // Force gauge text colors to look right on dark bg
  setTimeout(() => {
    gaugeWrap.querySelectorAll('text').forEach((t, i) => {
      if (i === 0) t.style.fill = '#fff';
      else if (i >= 2) t.style.fill = 'rgba(255,255,255,0.55)';
    });
  }, 0);
  top.appendChild(gaugeWrap);

  const right = el('div', {});
  right.appendChild(el('div', { class: 'flex items-center gap-2 mb-2' },
    el('span', { class: 'chip', style: { background: 'rgba(232,255,139,0.18)', color: '#E8FF8B' } },
      icon('stars'), 'AI INSIGHT'),
    el('span', { class: 'text-[11px]', style: { color: 'rgba(232,255,139,0.65)' } },
      `Confidence ${Math.round(ins.confidence * 100)}%`),
  ));
  right.appendChild(el('h2', {
    class: 'font-display text-white text-[24px] lg:text-[30px] font-extrabold leading-tight',
    style: { letterSpacing: '-0.025em' },
  }, ins.headline));
  const body = el('div', { class: 'mt-4 space-y-2.5 max-w-[640px]' });
  ins.body.forEach(t => body.appendChild(el('p', {
    class: 'text-[14px] leading-relaxed ai-text',
    style: { color: 'rgba(255,255,255,0.78)' },
    html: t.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#E8FF8B;">$1</strong>'),
  })));
  right.appendChild(body);
  right.appendChild(el('div', { class: 'flex flex-wrap gap-3 mt-5' },
    el('button', {
      class: 'btn btn-lime !py-2.5 !px-4 !text-[13px]',
      onClick: () => navigate('#/app/assistant'),
    }, icon('chat-square-quote'), 'Ask AI a follow-up'),
    el('button', {
      class: 'btn !py-2.5 !px-4 !text-[13px] text-white border border-white/30 hover:bg-white/10',
      onClick: () => navigate('#/app/loans'),
    }, 'See loan options', icon('arrow-right')),
  ));
  top.appendChild(right);
  root.appendChild(top);

  // ── Factor breakdown ──────────────────────────────────────
  const factorCard = el('div', { class: 'card p-6 fade-up-1' });
  factorCard.appendChild(el('div', { class: 'flex items-center justify-between mb-1' },
    el('h3', {
      class: 'font-display text-[20px] font-extrabold text-squad-deep',
      style: { letterSpacing: '-0.02em' },
    }, 'How your score is built'),
    el('span', { class: 'chip', style: { background: '#F5F5F0', color: '#4A5C56' } },
      '5 factors · weighted'),
  ));
  factorCard.appendChild(el('p', { class: 'text-[13px] text-ink-3 mb-6' },
    'TradeScore = Σ (factor × weight). Hover any factor for AI explanation.'));

  const grid = el('div', { class: 'grid md:grid-cols-2 gap-4' });
  FACTORS.forEach((f, i) => grid.appendChild(FactorCard(f, i)));
  factorCard.appendChild(grid);
  root.appendChild(factorCard);

  // ── Tips card ─────────────────────────────────────────────
  const tips = el('div', { class: 'card p-6 fade-up-2' });
  tips.appendChild(el('h3', {
    class: 'font-display text-[18px] font-extrabold text-squad-deep mb-1',
    style: { letterSpacing: '-0.02em' },
  }, 'Boost your score'));
  tips.appendChild(el('p', { class: 'text-[12.5px] text-ink-3 mb-5' },
    'AI-prioritised actions. Each estimates point gain over 30 days.'));

  const tipList = el('div', { class: 'space-y-3' });
  [
    { gain: '+8', title: 'Encourage 8 more unique customers', body: 'Promote your Squad QR at the till. Improves Customer Diversity from 79 → 86.' },
    { gain: '+5', title: 'Maintain daily inflow streak',      body: 'Hold your 12-month consistency for 4 more weeks to unlock the 18-month bonus tier.' },
    { gain: '+4', title: 'Diversify outflow types',           body: 'Currently 53% of outflows are stock — adding utility/payroll improves the cash-flow signature.' },
    { gain: '+3', title: 'Repay one loan on time',            body: 'A clean repayment cycle is the single biggest signal we can give the lending tier.' },
  ].forEach((t, i) => tipList.appendChild(el('div', {
    class: 'flex gap-4 p-4 rounded-xl border border-line hover:border-squad-green hover:bg-squad-pale/30 transition cursor-pointer',
    style: { animation: `fadeUp 0.5s ${0.1 + i * 0.06}s cubic-bezier(0.22,1,0.36,1) both` },
  },
    el('div', {
      class: 'font-display font-extrabold text-[18px] flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
      style: { background: '#E8FF8B', color: '#022B23' },
    }, t.gain),
    el('div', { class: 'flex-1' },
      el('div', { class: 'text-[14px] font-bold text-ink-1' }, t.title),
      el('div', { class: 'text-[12.5px] text-ink-2 leading-relaxed mt-0.5' }, t.body),
    ),
    el('span', { class: 'text-ink-3 self-center', style: { fontSize: '14px' } }, icon('arrow-right')),
  )));
  tips.appendChild(tipList);
  root.appendChild(tips);

  return root;
}

// ── Factor card with animated bar ─────────────────────────────
function FactorCard(f, idx) {
  const card = el('div', {
    class: 'p-5 rounded-2xl border border-line bg-white card-hover',
    style: { animation: `fadeUp 0.5s ${0.05 + idx * 0.06}s cubic-bezier(0.22,1,0.36,1) both` },
  });
  card.appendChild(el('div', { class: 'flex items-start justify-between mb-1' },
    el('div', {},
      el('div', { class: 'text-[14px] font-bold text-ink-1' }, f.label),
      el('div', { class: 'text-[12px] text-ink-3 mt-0.5' }, f.desc),
    ),
    el('div', {
      class: 'font-display font-extrabold',
      style: { color: '#0B6E4F', fontSize: '24px', letterSpacing: '-0.5px' },
    }, '0'),
  ));
  // Animate score
  const scoreEl = card.querySelector('.font-display');
  animate({ to: f.value, duration: 1100, onUpdate: v => scoreEl.textContent = Math.round(v) });

  // Bar
  const track = el('div', {
    class: 'mt-3 h-[7px] rounded-full overflow-hidden',
    style: { background: '#E2E8E4' },
  });
  const bar = el('div', {
    class: 'h-full rounded-full',
    style: {
      width: '0%',
      background: 'linear-gradient(90deg, #1F8A65, #27AE60)',
      transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
    },
  });
  track.appendChild(bar);
  card.appendChild(track);
  card.appendChild(el('div', {
    class: 'mt-2 text-[10.5px] font-bold uppercase tracking-wider',
    style: { color: '#9AA8A2' },
  }, `Weight in score: ${f.weight}%`));

  setTimeout(() => { bar.style.width = f.value + '%'; }, 200 + idx * 50);
  return card;
}
