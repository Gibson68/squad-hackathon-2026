import { el, icon } from '../utils.js';

export function Login({ navigate }) {
  const root = el('div', { class: 'min-h-screen flex' });

  // Left brand
  root.appendChild(el('aside', {
    class: 'hidden lg:flex flex-col justify-between p-12 w-[42%] relative overflow-hidden',
    style: {
      background:
        'radial-gradient(900px 500px at -10% -10%, #0B6E4F 0%, transparent 60%),' +
        'radial-gradient(700px 400px at 110% 110%, #1F8A65 0%, transparent 60%),' +
        'linear-gradient(155deg, #022B23 0%, #043b30 100%)',
      color: '#fff',
    },
  },
    el('a', {
      class: 'flex items-center gap-3 cursor-pointer',
      onClick: () => navigate('#/'),
    },
      el('div', {
        class: 'w-11 h-11 rounded-xl flex items-center justify-center',
        style: { background: 'rgba(232,255,139,0.16)', border: '1px solid rgba(232,255,139,0.28)', color: '#E8FF8B', fontSize: '19px' },
      }, icon('shop')),
      el('div', {},
        el('div', { class: 'font-display text-[20px] font-extrabold' }, 'TradeScore'),
        el('div', { class: 'text-[11px]', style: { color: 'rgba(232,255,139,0.85)' } }, 'by Squad'),
      ),
    ),
    el('div', {},
      el('h2', { class: 'font-display text-[36px] font-extrabold leading-tight' },
        'Welcome back.', el('br'), 'Your AI is up to speed.'),
      el('p', { class: 'mt-4 text-white/70 text-[14.5px] leading-relaxed max-w-[420px]' },
        'While you were away, we tracked your inflows, recalculated your TradeScore, and prepped 2 new loan offers for you.'),
    ),
    el('div', { class: 'text-[11.5px] text-white/45' },
      'Powered by Squad API · GTCO regulated · NDPR compliant'),
  ));

  // Right form
  const right = el('section', {
    class: 'flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-squad-paper',
  });

  const top = el('div', { class: 'w-full max-w-[420px] flex items-center justify-between mb-10' });
  top.appendChild(el('a', {
    class: 'lg:hidden flex items-center gap-2 cursor-pointer',
    onClick: () => navigate('#/'),
  },
    el('div', { class: 'w-9 h-9 rounded-lg bg-squad-deep flex items-center justify-center text-squad-lime', style: { fontSize: '15px' } }, icon('shop')),
    el('span', { class: 'font-display font-extrabold text-squad-deep' }, 'TradeScore'),
  ));
  top.appendChild(el('span', { class: 'text-[13px] text-ink-2 ml-auto' },
    'New here? ',
    el('a', {
      class: 'text-squad-green font-bold hover:underline cursor-pointer',
      onClick: () => navigate('#/signup'),
    }, 'Create account'),
  ));
  right.appendChild(top);

  const card = el('div', { class: 'w-full max-w-[420px] fade-up' });
  card.appendChild(el('h1', { class: 'font-display text-[30px] font-extrabold text-squad-deep' },
    'Log in to TradeScore'));
  card.appendChild(el('p', { class: 'text-[14px] text-ink-2 mt-1.5 mb-8' },
    'Pick up where you left off.'));

  const form = el('div', { class: 'space-y-4' });

  const emailWrap = el('div');
  emailWrap.appendChild(el('label', { class: 'label' }, 'Email or phone'));
  const emailInput = el('input', { class: 'input', placeholder: 'you@business.ng', value: 'funmi@fashionfabrics.ng' });
  emailWrap.appendChild(emailInput);
  form.appendChild(emailWrap);

  const passWrap = el('div');
  passWrap.appendChild(el('div', { class: 'flex items-center justify-between' },
    el('label', { class: 'label !mb-2' }, 'Password'),
    el('a', {
      class: 'text-[12px] text-squad-green font-bold hover:underline cursor-pointer mb-2',
      onClick: () => alert('Password reset flow — wire to Squad email service'),
    }, 'Forgot?'),
  ));
  const passInput = el('input', { class: 'input', type: 'password', placeholder: '••••••••', value: 'demo1234' });
  passWrap.appendChild(passInput);
  form.appendChild(passWrap);

  // Remember me
  form.appendChild(el('label', {
    class: 'flex items-center gap-2.5 text-[13px] text-ink-2 cursor-pointer select-none',
  },
    el('input', { type: 'checkbox', checked: true, class: 'w-4 h-4 accent-squad-green' }),
    'Keep me signed in for 30 days',
  ));

  const cta = el('button', {
    class: 'btn btn-primary w-full mt-2 py-[15px]',
    onClick: () => {
      cta.innerHTML = '';
      cta.appendChild(el('span', { class: 'spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full' }));
      cta.appendChild(el('span', {}, 'Signing you in…'));
      setTimeout(() => navigate('#/app/overview'), 900);
    },
  }, 'Log in', icon('arrow-right'));
  form.appendChild(cta);

  // OR divider
  form.appendChild(el('div', { class: 'flex items-center gap-3 my-2' },
    el('div', { class: 'flex-1 h-px bg-line' }),
    el('span', { class: 'text-[11px] text-ink-3 font-semibold uppercase tracking-wider' }, 'or'),
    el('div', { class: 'flex-1 h-px bg-line' }),
  ));
  form.appendChild(el('button', {
    class: 'btn btn-ghost w-full justify-center py-[14px]',
    onClick: () => navigate('#/app/overview'),
  }, icon('lightning-charge-fill'), 'Sign in with Squad'));

  card.appendChild(form);
  right.appendChild(card);
  root.appendChild(right);
  return root;
}
