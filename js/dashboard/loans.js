import { el, fmt, fmtShort, icon } from '../utils.js';
import { TRADER, LOAN_TIERS } from '../data.js';
import { recommendLoan } from '../ai.js';

export function LoansPanel({ navigate }) {
  const root = el('div', { class: 'max-w-[1280px] mx-auto space-y-6' });

  // ── Hero / eligibility ────────────────────────────────────
  const hero = el('div', {
    class: 'grid lg:grid-cols-[1.4fr_1fr] gap-5 fade-up',
  });

  // Big card
  const big = el('div', {
    class: 'rounded-2xl p-7 relative overflow-hidden',
    style: {
      background: 'linear-gradient(135deg, #022B23 0%, #0B6E4F 100%)',
      boxShadow: '0 16px 40px rgba(2, 43, 35, 0.18)',
    },
  });
  big.appendChild(el('div', {
    class: 'absolute rounded-full',
    style: { width: '300px', height: '300px', top: '-120px', right: '-100px',
             background: 'radial-gradient(circle, rgba(232,255,139,0.16), transparent 70%)' },
  }));
  big.appendChild(el('div', {
    class: 'text-[11px] font-bold uppercase tracking-[0.2em] relative',
    style: { color: '#E8FF8B' },
  }, "You're pre-approved for"));
  big.appendChild(el('div', {
    class: 'font-display font-extrabold text-white relative mt-1',
    style: { fontSize: '52px', lineHeight: '1.05', letterSpacing: '-0.04em' },
  }, fmt(TRADER.loanEligible)));
  big.appendChild(el('div', { class: 'text-[14px] mt-1 relative', style: { color: 'rgba(255,255,255,0.7)' } },
    `Based on TradeScore ${TRADER.score} · From 2.2% / month`));

  // AI rec
  const r = recommendLoan('stock');
  const aiBox = el('div', {
    class: 'mt-5 p-4 rounded-2xl glass relative',
  });
  aiBox.appendChild(el('div', { class: 'flex items-center gap-2 mb-1' },
    el('span', { style: { color: '#E8FF8B', fontSize: '14px' } }, icon('stars')),
    el('span', { class: 'text-[10.5px] font-extrabold uppercase tracking-[0.15em]', style: { color: '#E8FF8B' } },
      'AI recommendation'),
  ));
  aiBox.appendChild(el('div', {
    class: 'text-white text-[15px] leading-relaxed',
    html: `Borrow <strong style="color:#E8FF8B;">${fmt(r.amount)}</strong> over <strong style="color:#E8FF8B;">${r.term}</strong> at <strong style="color:#E8FF8B;">${r.rate}%/mo</strong>. ${r.reasons[0]}`,
  }));
  big.appendChild(aiBox);
  hero.appendChild(big);

  // Right: 3 quick stats
  const right = el('div', { class: 'grid gap-4' });
  right.appendChild(StatCard({ iconName: 'percent', label: 'Lowest rate available', value: '2.2%', sub: 'per month', accent: '#0B6E4F' }));
  right.appendChild(StatCard({ iconName: 'calendar3', label: 'Max term', value: '120', sub: 'days', accent: '#1F8A65' }));
  right.appendChild(StatCard({ iconName: 'lightning-charge', label: 'Funding speed', value: '< 5', sub: 'minutes', accent: '#27AE60' }));
  hero.appendChild(right);

  root.appendChild(hero);

  // ── Loan tiers grid ──────────────────────────────────────
  const tiersWrap = el('div', { class: 'fade-up-1' });
  tiersWrap.appendChild(el('div', { class: 'flex items-center justify-between mb-4' },
    el('div', {},
      el('h3', { class: 'font-display text-[20px] font-extrabold text-squad-deep' }, 'Loan products'),
      el('p', { class: 'text-[12.5px] text-ink-3 mt-0.5' },
        'Tiers unlock as your TradeScore grows. Tap any tier to apply.'),
    ),
  ));
  const tiersGrid = el('div', { class: 'grid md:grid-cols-2 lg:grid-cols-4 gap-4' });
  LOAN_TIERS.forEach((t, i) => tiersGrid.appendChild(TierCard(t, TRADER.score >= t.minScore, i)));
  tiersWrap.appendChild(tiersGrid);
  root.appendChild(tiersWrap);

  // ── Calculator ────────────────────────────────────────────
  root.appendChild(buildCalculator(TRADER, navigate));

  return root;
}

function StatCard({ iconName, label, value, sub, accent }) {
  return el('div', { class: 'card p-5 flex items-center gap-4' },
    el('div', {
      class: 'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
      style: { background: '#E8F4EE', color: accent, fontSize: '20px' },
    }, icon(iconName)),
    el('div', { class: 'min-w-0' },
      el('div', { class: 'text-[10.5px] uppercase tracking-[0.1em] text-ink-3 font-bold' }, label),
      el('div', { class: 'flex items-baseline gap-1.5 mt-0.5' },
        el('span', {
          class: 'font-display font-extrabold text-squad-deep',
          style: { fontSize: '28px', letterSpacing: '-0.025em' },
        }, value),
        el('span', { class: 'text-[12.5px] font-medium', style: { color: accent } }, sub),
      ),
    ),
  );
}

function TierCard(t, eligible, i) {
  const card = el('div', {
    class: 'card p-5 ' + (eligible ? 'card-hover cursor-pointer' : 'opacity-60'),
    style: { animation: `fadeUp 0.5s ${0.05 + i * 0.06}s cubic-bezier(0.22,1,0.36,1) both` },
  });
  card.appendChild(el('div', { class: 'flex items-center justify-between mb-3' },
    el('div', {
      class: 'w-10 h-10 rounded-xl flex items-center justify-center',
      style: {
        background: eligible ? '#E8F4EE' : '#F5F5F0',
        color: eligible ? '#0B6E4F' : '#9AA8A2',
        fontSize: '17px',
      },
    }, icon(eligible ? 'unlock-fill' : 'lock-fill')),
    el('span', {
      class: 'chip',
      style: eligible
        ? { background: '#E5F9F0', color: '#27AE60' }
        : { background: '#F5F5F0', color: '#9AA8A2' },
    }, eligible ? 'Eligible' : `Need ${t.minScore}+`),
  ));
  card.appendChild(el('h4', {
    class: 'font-display text-[18px] font-extrabold text-squad-deep',
    style: { letterSpacing: '-0.02em' },
  }, t.name));
  card.appendChild(el('p', { class: 'text-[12px] text-ink-3 mt-0.5 mb-4' }, t.desc));
  card.appendChild(el('div', { class: 'flex items-baseline gap-1.5' },
    el('span', { class: 'font-display font-extrabold text-squad-deep', style: { fontSize: '28px' } },
      'Up to ' + fmtShort(t.max)),
  ));
  card.appendChild(el('div', { class: 'text-[12px] text-ink-2 mt-1' },
    `${t.rateMonthly}% / month · ${t.term}`));
  return card;
}

// ── Calculator ────────────────────────────────────────────────
function buildCalculator(TRADER, navigate) {
  let amount = 250000;
  let term   = '60 days';

  const card = el('div', { class: 'card p-6 lg:p-8 fade-up-2' });
  card.appendChild(el('div', { class: 'flex items-center justify-between mb-1' },
    el('h3', {
      class: 'font-display text-[20px] font-extrabold text-squad-deep',
      style: { letterSpacing: '-0.02em' },
    }, 'Loan calculator'),
    el('span', { class: 'chip', style: { background: '#E8F4EE', color: '#0B6E4F' } },
      icon('stars'), 'AI auto-rate'),
  ));
  card.appendChild(el('p', { class: 'text-[13px] text-ink-3 mb-6' },
    'Pick an amount and term — we’ll match the lowest rate your TradeScore unlocks.'));

  const grid = el('div', { class: 'grid lg:grid-cols-[1.3fr_1fr] gap-8' });

  // Left: controls
  const controls = el('div', {});

  // Amount slider
  controls.appendChild(el('label', { class: 'label' }, 'Loan amount'));
  const amountDisplay = el('div', {
    class: 'font-display font-extrabold text-squad-deep mb-3',
    style: { fontSize: '34px', letterSpacing: '-0.03em' },
  }, fmt(amount));
  controls.appendChild(amountDisplay);
  const slider = el('input', {
    type: 'range', min: '20000', max: String(TRADER.loanEligible),
    step: '5000', value: String(amount),
    class: 'w-full',
  });
  controls.appendChild(slider);
  controls.appendChild(el('div', { class: 'flex justify-between mt-2 text-[11px] text-ink-3 font-semibold' },
    el('span', {}, '₦20K'),
    el('span', {}, fmtShort(TRADER.loanEligible)),
  ));

  // Term selector
  controls.appendChild(el('div', { class: 'label mt-7' }, 'Repayment period'));
  const termRow = el('div', { class: 'grid grid-cols-4 gap-2' });
  ['30 days', '60 days', '90 days', '120 days'].forEach(t => {
    const btn = el('button', {
      class: 'h-12 rounded-xl font-bold text-[13px] tap text-center transition-all',
      'data-term': t,
    }, t);
    btn.addEventListener('click', () => {
      term = t; paintTerms(); paint();
    });
    termRow.appendChild(btn);
  });
  controls.appendChild(termRow);
  function paintTerms() {
    termRow.querySelectorAll('[data-term]').forEach(btn => {
      const a = btn.dataset.term === term;
      btn.style.background = a ? '#0B6E4F' : '#fff';
      btn.style.color      = a ? '#fff' : '#4A5C56';
      btn.style.border     = a ? '1px solid #0B6E4F' : '1px solid #E2E8E4';
      btn.style.boxShadow  = a ? '0 4px 14px rgba(11, 110, 79, 0.25)' : 'none';
    });
  }
  paintTerms();

  // Purpose
  controls.appendChild(el('div', { class: 'label mt-7' }, 'Purpose'));
  const purposeRow = el('div', { class: 'flex flex-wrap gap-2' });
  let purpose = 'stock';
  ['stock', 'rent', 'expansion', 'emergency', 'other'].forEach(p => {
    const btn = el('button', {
      class: 'px-4 py-2.5 rounded-full font-bold text-[12px] tap capitalize transition-all',
      'data-purpose': p,
    }, p);
    btn.addEventListener('click', () => {
      purpose = p; paintPurpose(); paint();
    });
    purposeRow.appendChild(btn);
  });
  function paintPurpose() {
    purposeRow.querySelectorAll('[data-purpose]').forEach(btn => {
      const a = btn.dataset.purpose === purpose;
      btn.style.background = a ? '#E8FF8B' : '#fff';
      btn.style.color      = a ? '#022B23' : '#4A5C56';
      btn.style.border     = a ? '1px solid #022B23' : '1px solid #E2E8E4';
    });
  }
  paintPurpose();
  controls.appendChild(purposeRow);

  grid.appendChild(controls);

  // Right: summary
  const summary = el('div', {
    class: 'p-6 rounded-2xl',
    style: { background: 'linear-gradient(135deg, #022B23 0%, #0B6E4F 100%)' },
  });
  summary.appendChild(el('div', { class: 'text-[10.5px] font-bold uppercase tracking-widest', style: { color: '#E8FF8B' } },
    'Your loan'));
  const totalEl = el('div', {
    class: 'font-display text-white font-extrabold mt-1 mb-4',
    style: { fontSize: '32px', letterSpacing: '-0.03em' },
  });
  summary.appendChild(totalEl);

  const sumList = el('div', { class: 'space-y-2.5' });
  summary.appendChild(sumList);

  const aiNote = el('div', {
    class: 'mt-5 p-3 rounded-xl text-[12px] leading-relaxed',
    style: { background: 'rgba(232,255,139,0.10)', color: 'rgba(255,255,255,0.85)' },
  });
  summary.appendChild(aiNote);

  const apply = el('button', {
    class: 'btn btn-lime w-full mt-5 !py-4 !text-[14px]',
    onClick: () => showLoanSuccess(amount, term),
  }, 'Apply now', icon('arrow-right'));
  summary.appendChild(apply);

  grid.appendChild(summary);
  card.appendChild(grid);

  function pickRate() {
    const eligible = LOAN_TIERS.filter(t => t.minScore <= TRADER.score && t.max >= amount)
      .sort((a, b) => a.rateMonthly - b.rateMonthly);
    return eligible[0]?.rateMonthly ?? 3.5;
  }

  function paint() {
    const rate = pickRate();
    const months = parseInt(term, 10) / 30;
    const interest = Math.round(amount * (rate / 100) * months);
    const total = amount + interest;
    const installment = Math.round(total / months);

    amountDisplay.textContent = fmt(amount);
    totalEl.textContent = fmt(total);
    sumList.innerHTML = '';
    sumList.appendChild(rowKv('Loan amount', fmt(amount)));
    sumList.appendChild(rowKv('Interest rate', rate + '% / month'));
    sumList.appendChild(rowKv('Term', term));
    sumList.appendChild(rowKv('Total interest', fmt(interest)));
    sumList.appendChild(rowKv('Monthly instalment', fmt(installment), true));

    aiNote.innerHTML = `<strong style="color:#E8FF8B;">AI:</strong> At ${fmt(installment)} / month, your repayment uses ${Math.round((installment / TRADER.monthlyRevenue) * 100)}% of average revenue — within the safe 18% threshold.`;
  }

  slider.addEventListener('input', e => { amount = parseInt(e.target.value, 10); paint(); });
  paint();

  return card;
}

function rowKv(k, v, highlight) {
  return el('div', { class: 'flex items-center justify-between' },
    el('span', { class: 'text-[13px]', style: { color: 'rgba(255,255,255,0.65)' } }, k),
    el('span', {
      class: (highlight ? 'text-[15.5px]' : 'text-[13.5px]') + ' font-extrabold',
      style: { color: highlight ? '#E8FF8B' : '#fff' },
    }, v),
  );
}

// ── Success modal ────────────────────────────────────────────
function showLoanSuccess(amount, term) {
  const overlay = el('div', {
    class: 'fixed inset-0 z-50 flex items-center justify-center fade-in p-6',
    style: { background: 'rgba(2, 43, 35, 0.55)', backdropFilter: 'blur(6px)' },
  });
  const close = () => {
    overlay.style.opacity = '0'; overlay.style.transition = 'opacity 0.2s ease';
    setTimeout(() => overlay.remove(), 200);
  };
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  const modal = el('div', {
    class: 'card slide-up relative',
    style: { padding: '40px', maxWidth: '480px', width: '100%' },
  });
  modal.appendChild(el('div', {
    class: 'w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center pop',
    style: {
      background: 'linear-gradient(135deg, #E8FF8B, #27AE60)',
      boxShadow: '0 8px 28px rgba(39,174,96,0.35)',
    },
  }, el('span', { class: 'text-white', style: { fontSize: '40px' } }, icon('check-lg'))));
  modal.appendChild(el('h2', {
    class: 'font-display text-[26px] font-extrabold text-squad-deep text-center',
    style: { letterSpacing: '-0.025em' },
  }, 'Loan approved!'));
  modal.appendChild(el('p', { class: 'text-[14px] text-ink-2 text-center mt-2 leading-relaxed' },
    fmt(amount) + ' is on its way to your Squad wallet · ' + term + ' term'));

  const detail = el('div', {
    class: 'mt-6 p-4 rounded-xl space-y-2',
    style: { background: '#F5F5F0' },
  });
  detail.appendChild(rowKvL('Disbursement', 'Squad wallet · SQ-3417-820'));
  detail.appendChild(rowKvL('Available', 'Within 5 minutes'));
  detail.appendChild(rowKvL('First instalment', '30 days from today'));
  modal.appendChild(detail);

  modal.appendChild(el('button', {
    class: 'btn btn-primary w-full mt-6 !py-3.5',
    onClick: close,
  }, 'Done'));

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

function rowKvL(k, v) {
  return el('div', { class: 'flex items-center justify-between text-[13px]' },
    el('span', { class: 'text-ink-2' }, k),
    el('span', { class: 'font-extrabold text-ink-1' }, v),
  );
}
