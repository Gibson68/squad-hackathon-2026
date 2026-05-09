import { el, icon } from '../utils.js';

const STEPS = [
  { key: 'account',  title: 'Create your account',     sub: 'Just an email & a password to start.' },
  { key: 'business', title: 'Tell us about your shop', sub: 'So we can tailor your TradeScore.' },
  { key: 'connect',  title: 'Connect your Squad wallet', sub: 'We use this to build your credit profile — read-only access only.' },
  { key: 'done',     title: 'You’re in!',              sub: 'Your AI is analysing your transactions now.' },
];

export function Signup({ navigate }) {
  let step = 0;
  const data = {
    email: '', password: '',
    business: '', category: 'Fashion', location: '',
  };

  const root = el('div', { class: 'min-h-screen flex' });

  // ── Left brand pane ─────────────────────────────────────
  const brand = el('aside', {
    class: 'hidden lg:flex flex-col justify-between p-12 w-[42%] relative overflow-hidden',
    style: {
      background:
        'radial-gradient(900px 500px at -10% -10%, #0B6E4F 0%, transparent 60%),' +
        'radial-gradient(700px 400px at 110% 110%, #1F8A65 0%, transparent 60%),' +
        'linear-gradient(155deg, #022B23 0%, #043b30 100%)',
      color: '#fff',
    },
  });
  brand.appendChild(el('a', {
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
  ));

  brand.appendChild(el('div', {},
    el('h2', {
      class: 'font-display text-[40px] font-extrabold leading-tight',
    }, 'Build credit', el('br'), 'while you trade.'),
    el('p', { class: 'mt-5 text-white/70 text-[15px] leading-relaxed max-w-[420px]' },
      'Setup takes 2 minutes. Your AI assistant gets to work the moment you connect Squad.'),
    el('div', { class: 'mt-8 space-y-3' }, ...[
      'Read-only access to Squad data',
      'Cancel and disconnect anytime',
      'Your data is never shared with third parties',
    ].map(t => el('div', { class: 'flex items-center gap-3 text-[14px]' },
      el('span', { class: 'w-5 h-5 rounded-full flex items-center justify-center text-[10px]',
        style: { background: 'rgba(232,255,139,0.20)', color: '#E8FF8B' } }, icon('check-lg')),
      t,
    ))),
  ));

  brand.appendChild(el('div', { class: 'text-[11.5px] text-white/45' },
    'Powered by Squad API · GTCO regulated · NDPR compliant'));
  root.appendChild(brand);

  // ── Right form pane ────────────────────────────────────
  const right = el('section', {
    class: 'flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-squad-paper',
  });

  // Top bar (mobile shows logo, both show "Already?" link)
  const topbar = el('div', { class: 'w-full max-w-[480px] flex items-center justify-between mb-8' });
  topbar.appendChild(el('a', {
    class: 'lg:hidden flex items-center gap-2 cursor-pointer',
    onClick: () => navigate('#/'),
  },
    el('div', { class: 'w-9 h-9 rounded-lg bg-squad-deep flex items-center justify-center text-squad-lime', style: { fontSize: '15px' } }, icon('shop')),
    el('span', { class: 'font-display font-extrabold text-squad-deep' }, 'TradeScore'),
  ));
  topbar.appendChild(el('span', { class: 'text-[13px] text-ink-2 ml-auto' },
    'Have an account? ',
    el('a', {
      class: 'text-squad-green font-bold hover:underline cursor-pointer',
      onClick: () => navigate('#/login'),
    }, 'Log in'),
  ));
  right.appendChild(topbar);

  // Form container
  const card = el('div', { class: 'w-full max-w-[480px]' });
  right.appendChild(card);

  // Progress
  const progress = el('div', { class: 'flex gap-1.5 mb-8' });
  STEPS.forEach((_, i) => progress.appendChild(el('div', {
    class: 'h-1 flex-1 rounded-full transition-colors',
    'data-step-bar': i,
    style: { background: i === 0 ? '#0B6E4F' : '#E2E8E4' },
  })));
  card.appendChild(progress);

  // Header
  const header = el('div', { class: 'mb-7' });
  const title = el('h1', { class: 'font-display text-[28px] font-extrabold text-squad-deep' });
  const sub = el('p', { class: 'text-[14px] text-ink-2 mt-1' });
  header.appendChild(title);
  header.appendChild(sub);
  card.appendChild(header);

  // Body container — replaced per step
  const body = el('div', { class: 'fade-up' });
  card.appendChild(body);

  function paintProgress() {
    progress.querySelectorAll('[data-step-bar]').forEach((bar, i) => {
      bar.style.background = i <= step ? '#0B6E4F' : '#E2E8E4';
    });
    title.textContent = STEPS[step].title;
    sub.textContent   = STEPS[step].sub;
  }

  function render() {
    body.innerHTML = '';
    body.classList.remove('fade-up');
    void body.offsetWidth;
    body.classList.add('fade-up');
    paintProgress();
    if (step === 0)      body.appendChild(stepAccount());
    else if (step === 1) body.appendChild(stepBusiness());
    else if (step === 2) body.appendChild(stepConnect());
    else                 body.appendChild(stepDone());
  }

  function next() {
    if (step < STEPS.length - 1) { step++; render(); }
    else navigate('#/app/overview');
  }
  function back() { if (step > 0) { step--; render(); } }

  // ── Step 1: Account ────────────────────────────────────
  function stepAccount() {
    const wrap = el('div', { class: 'space-y-4' });
    const emailField = field('Email address', 'email', 'you@business.ng', 'email');
    const passField  = field('Create password', 'password', 'At least 8 characters', 'password');
    wrap.appendChild(emailField.field);
    wrap.appendChild(passField.field);

    // OR continue with phone
    wrap.appendChild(el('div', { class: 'flex items-center gap-3 my-2' },
      el('div', { class: 'flex-1 h-px bg-line' }),
      el('span', { class: 'text-[11px] text-ink-3 font-semibold uppercase tracking-wider' }, 'or'),
      el('div', { class: 'flex-1 h-px bg-line' }),
    ));
    wrap.appendChild(el('button', {
      class: 'btn btn-ghost w-full justify-center py-[14px]',
      onClick: () => alert('Phone OTP signup — wire to Squad in production'),
    }, icon('phone'), 'Continue with phone number'));

    const cta = el('button', {
      class: 'btn btn-primary w-full mt-6 py-[15px]',
      onClick: () => {
        if (!emailField.input.value || emailField.input.value.length < 4) {
          emailField.error.textContent = 'Please enter a valid email.';
          emailField.error.style.display = 'block';
          return;
        }
        if (!passField.input.value || passField.input.value.length < 6) {
          passField.error.textContent = 'Use at least 6 characters.';
          passField.error.style.display = 'block';
          return;
        }
        data.email = emailField.input.value;
        data.password = passField.input.value;
        next();
      },
    }, 'Continue', icon('arrow-right'));
    wrap.appendChild(cta);

    return wrap;
  }

  // ── Step 2: Business ───────────────────────────────────
  function stepBusiness() {
    const wrap = el('div', { class: 'space-y-4' });
    const nameField = field('Business name', 'business', "e.g. Funmi's Fashion Fabrics");
    wrap.appendChild(nameField.field);

    // Category select
    const catWrap = el('div');
    catWrap.appendChild(el('label', { class: 'label' }, 'Category'));
    const cats = ['Fashion', 'Food & Drinks', 'Electronics', 'Beauty', 'Groceries', 'Other'];
    const grid = el('div', { class: 'grid grid-cols-3 gap-2' });
    cats.forEach(c => {
      const btn = el('button', {
        class: 'py-3 px-3 rounded-xl text-[13px] font-bold tap text-center transition-all',
        'data-cat': c,
      }, c);
      btn.addEventListener('click', () => {
        data.category = c;
        grid.querySelectorAll('[data-cat]').forEach(b => paintCat(b));
      });
      function paintCat(b) {
        const a = b.dataset.cat === data.category;
        b.style.background = a ? '#0B6E4F' : '#fff';
        b.style.color      = a ? '#fff' : '#4A5C56';
        b.style.border     = a ? '1px solid #0B6E4F' : '1px solid #E2E8E4';
        b.style.boxShadow  = a ? '0 4px 14px rgba(11,110,79,0.25)' : 'none';
      }
      paintCat(btn);
      grid.appendChild(btn);
    });
    catWrap.appendChild(grid);
    wrap.appendChild(catWrap);

    const locField = field('Shop location', 'location', 'e.g. Balogun Market, Lagos');
    wrap.appendChild(locField.field);

    const row = el('div', { class: 'flex gap-3 mt-6' });
    row.appendChild(el('button', { class: 'btn btn-ghost flex-1 py-[15px]', onClick: back }, icon('arrow-left'), 'Back'));
    row.appendChild(el('button', {
      class: 'btn btn-primary flex-[2] py-[15px]',
      onClick: () => {
        if (!nameField.input.value) {
          nameField.error.textContent = 'Required.';
          nameField.error.style.display = 'block';
          return;
        }
        data.business = nameField.input.value;
        data.location = locField.input.value;
        next();
      },
    }, 'Continue', icon('arrow-right')));
    wrap.appendChild(row);
    return wrap;
  }

  // ── Step 3: Connect Squad ──────────────────────────────
  function stepConnect() {
    const wrap = el('div', { class: 'space-y-4' });
    const card = el('div', {
      class: 'card p-6',
      style: { background: 'linear-gradient(135deg, #F5F5F0, #fff)' },
    });
    card.appendChild(el('div', { class: 'flex items-center gap-4 mb-4' },
      el('div', {
        class: 'w-14 h-14 rounded-2xl flex items-center justify-center',
        style: { background: '#022B23', color: '#E8FF8B', fontSize: '24px' },
      }, icon('lightning-charge-fill')),
      el('div', {},
        el('div', { class: 'font-display text-[18px] font-extrabold text-squad-deep' }, 'Squad Wallet'),
        el('div', { class: 'text-[12px] text-ink-3' }, 'Read-only · Disconnect any time'),
      ),
    ));
    card.appendChild(el('p', {
      class: 'text-[13.5px] text-ink-2 leading-relaxed',
    }, 'We’ll request access to your transaction history. We never see your password and we never move money without your consent.'));

    const list = el('ul', { class: 'mt-4 space-y-2' });
    [
      'Read transaction history (12 months)',
      'Get account balance & wallet ID',
      'Disburse approved loans (with consent)',
    ].forEach(t => list.appendChild(el('li', { class: 'flex items-center gap-3 text-[13px] text-ink-2' },
      el('span', { class: 'w-5 h-5 rounded-full bg-squad-pale text-squad-green flex items-center justify-center text-[10px]' }, icon('check-lg')),
      t,
    )));
    card.appendChild(list);
    wrap.appendChild(card);

    // Connect button — simulates OAuth round-trip
    const connectBtn = el('button', {
      class: 'btn btn-primary w-full py-[15px] mt-2',
    }, icon('lightning-charge-fill'), 'Connect Squad wallet');
    let connecting = false;
    connectBtn.addEventListener('click', () => {
      if (connecting) return;
      connecting = true;
      connectBtn.innerHTML = '';
      connectBtn.appendChild(el('span', { class: 'spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full' }));
      connectBtn.appendChild(el('span', {}, 'Authorizing with Squad…'));
      setTimeout(() => next(), 1500);
    });
    wrap.appendChild(connectBtn);

    wrap.appendChild(el('button', {
      class: 'btn btn-ghost w-full mt-2 py-[14px]', onClick: back,
    }, icon('arrow-left'), 'Back'));
    return wrap;
  }

  // ── Step 4: Done ───────────────────────────────────────
  function stepDone() {
    const wrap = el('div', { class: 'text-center pop' });
    wrap.appendChild(el('div', {
      class: 'w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center',
      style: {
        background: 'linear-gradient(135deg, #E8FF8B, #27AE60)',
        boxShadow: '0 8px 28px rgba(39,174,96,0.35)',
      },
    }, el('span', { class: 'text-white', style: { fontSize: '38px' } }, icon('check-lg'))));
    wrap.appendChild(el('p', { class: 'text-ink-2 text-[14.5px] leading-relaxed mt-2' },
      'Your AI assistant is analysing your last 12 months of Squad transactions to build your TradeScore. This typically takes < 30 seconds.'));

    // Live "AI working" indicator
    const tasks = el('div', { class: 'mt-6 space-y-2 text-left' });
    const items = [
      'Importing transaction history…',
      'Calculating revenue trends…',
      'Scoring 5 credit factors…',
      'Pre-approving loan offers…',
    ];
    items.forEach((t, i) => {
      const row = el('div', {
        class: 'flex items-center gap-3 text-[13px] text-ink-2 p-3 rounded-xl bg-white border border-line',
        style: { animation: `fadeUp 0.4s ${0.1 + i * 0.18}s cubic-bezier(0.22,1,0.36,1) both` },
      });
      const ic = el('span', { class: 'w-5 h-5 rounded-full bg-line flex-shrink-0' });
      row.appendChild(ic);
      row.appendChild(el('span', {}, t));
      tasks.appendChild(row);
      setTimeout(() => {
        ic.style.background = '#E5F9F0';
        ic.style.color = '#27AE60';
        ic.classList.add('flex', 'items-center', 'justify-center', 'text-[11px]');
        ic.innerHTML = '';
        ic.appendChild(icon('check-lg'));
      }, 600 + i * 450);
    });
    wrap.appendChild(tasks);

    const cta = el('button', {
      class: 'btn btn-primary w-full mt-6 py-[15px]',
      onClick: () => navigate('#/app/overview'),
    }, 'Open my dashboard', icon('arrow-right'));
    wrap.appendChild(cta);
    return wrap;
  }

  function field(label, key, placeholder, type = 'text') {
    const wrap = el('div');
    wrap.appendChild(el('label', { class: 'label' }, label));
    const input = el('input', { class: 'input', placeholder, type });
    wrap.appendChild(input);
    const error = el('div', {
      class: 'text-[12px] mt-1.5',
      style: { color: '#D43E3E', display: 'none' },
    });
    wrap.appendChild(error);
    return { field: wrap, input, error };
  }

  render();
  root.appendChild(right);
  return root;
}
