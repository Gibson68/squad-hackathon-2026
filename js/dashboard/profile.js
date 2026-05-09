import { el, fmt, icon } from '../utils.js';
import { getUser } from '../store.js';

export function ProfilePanel({ navigate }) {
  const TRADER = getUser();
  const SETTINGS = [
    { icon: 'shop',              label: 'Business details', sub: 'Edit shop name, category, location' },
    { icon: 'link-45deg',        label: 'Squad wallet',     sub: 'Connected · ' + TRADER.squadWallet, tag: 'Linked' },
    { icon: 'box-seam',          label: 'Inventory',        sub: 'Manage items and prices', target: '#/app/inventory' },
    { icon: 'file-earmark-text', label: 'Loan history',     sub: 'View past loans & repayment schedule' },
    { icon: 'bell',              label: 'Notifications',    sub: 'Email, SMS and in-app alerts' },
    { icon: 'shield-lock',       label: 'Security & PIN',   sub: 'Two-factor authentication, login PIN' },
    { icon: 'robot',             label: 'AI preferences',   sub: 'Tune insight frequency and tone' },
    { icon: 'question-circle',   label: 'Help & support',   sub: 'Chat with our team, read FAQs' },
  ];
  const root = el('div', { class: 'max-w-[960px] mx-auto space-y-6' });

  // ── Header card ──────────────────────────────────────────
  const header = el('div', {
    class: 'rounded-2xl p-7 lg:p-8 grid lg:grid-cols-[auto_1fr_auto] gap-6 items-center fade-up',
    style: {
      background: 'linear-gradient(135deg, #022B23 0%, #0B6E4F 100%)',
      boxShadow: '0 16px 40px rgba(2, 43, 35, 0.18)',
    },
  });
  header.appendChild(el('div', {
    class: 'w-[88px] h-[88px] rounded-2xl flex items-center justify-center text-white font-extrabold text-[26px]',
    style: { background: 'rgba(232,255,139,0.18)', border: '1px solid rgba(232,255,139,0.28)' },
  }, TRADER.avatar));

  const info = el('div', {});
  info.appendChild(el('h1', { class: 'font-display text-white font-extrabold text-[26px] lg:text-[30px]' }, TRADER.name));
  info.appendChild(el('p', {
    class: 'text-[13.5px] mt-1 flex items-center gap-1.5 flex-wrap', style: { color: 'rgba(255,255,255,0.75)' },
  }, TRADER.business + ' · ', icon('geo-alt'), TRADER.location));
  info.appendChild(el('div', { class: 'flex flex-wrap gap-2 mt-3' },
    el('span', { class: 'chip', style: { background: '#E8FF8B', color: '#022B23' } },
      'TradeScore ' + TRADER.score),
    el('span', { class: 'chip', style: { background: 'rgba(255,255,255,0.10)', color: '#fff', border: '1px solid rgba(232,255,139,0.30)' } },
      icon('fire'), TRADER.streak + '-mo streak'),
    el('span', { class: 'chip', style: { background: 'rgba(255,255,255,0.10)', color: '#fff', border: '1px solid rgba(232,255,139,0.30)' } },
      'Member since ' + TRADER.since),
  ));
  header.appendChild(info);

  header.appendChild(el('button', {
    class: 'btn btn-lime !py-3 !px-5 !text-[13px] self-start lg:self-center',
  }, 'Edit profile'));
  root.appendChild(header);

  // ── Stat strip ──────────────────────────────────────────
  const strip = el('div', { class: 'grid grid-cols-2 lg:grid-cols-4 gap-4 fade-up-1' });
  [
    { label: 'TradeScore',      value: TRADER.score },
    { label: 'Monthly revenue', value: fmt(TRADER.monthlyRevenue) },
    { label: 'Streak',          value: TRADER.streak + ' mo' },
    { label: 'Growth',          value: '+' + TRADER.growth + '%' },
  ].forEach(s => strip.appendChild(el('div', { class: 'card p-5' },
    el('div', { class: 'text-[10.5px] uppercase tracking-wider text-ink-3 font-bold' }, s.label),
    el('div', {
      class: 'font-display font-extrabold text-squad-deep mt-1',
      style: { fontSize: '24px', letterSpacing: '-0.5px' },
    }, String(s.value)),
  )));
  root.appendChild(strip);

  // ── Settings list ───────────────────────────────────────
  const list = el('div', { class: 'card overflow-hidden fade-up-2' });
  SETTINGS.forEach((s, i) => {
    const row = el('button', {
      class: 'w-full flex items-center gap-4 p-5 text-left hover:bg-squad-paper transition-colors',
      style: i < SETTINGS.length - 1 ? { borderBottom: '1px solid #E2E8E4' } : {},
      onClick: s.target ? () => navigate(s.target) : undefined,
    },
      el('div', {
        class: 'w-11 h-11 rounded-xl flex items-center justify-center',
        style: { background: '#E8F4EE', color: '#0B6E4F', fontSize: '18px' },
      }, icon(s.icon)),
      el('div', { class: 'flex-1 min-w-0' },
        el('div', { class: 'flex items-center gap-2' },
          el('span', { class: 'text-[14.5px] font-bold text-ink-1' }, s.label),
          s.tag ? el('span', { class: 'chip', style: { background: '#E5F9F0', color: '#27AE60' } }, s.tag) : null,
        ),
        el('div', { class: 'text-[12px] text-ink-3 mt-0.5' }, s.sub),
      ),
      el('span', { class: 'text-ink-3', style: { fontSize: '14px' } }, icon('chevron-right')),
    );
    list.appendChild(row);
  });
  root.appendChild(list);

  // ── Logout ──────────────────────────────────────────────
  root.appendChild(el('button', {
    class: 'w-full btn !py-3.5 !text-[13.5px] fade-up-3',
    style: { background: '#FCE8E8', color: '#D43E3E' },
    onClick: () => navigate('#/'),
  }, icon('box-arrow-right'), 'Log out'));

  return root;
}
