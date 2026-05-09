import { el, icon } from '../utils.js';
import { chatRespond, streamReply } from '../ai.js';
import { getUser } from '../store.js';

const SUGGESTIONS = [
  'How can I improve my TradeScore?',
  'How much can I safely borrow?',
  'When should I restock?',
  'Forecast my revenue for next month',
  'What are my biggest risks right now?',
];

export function Assistant() {
  const TRADER = getUser();
  const root = el('div', { class: 'max-w-[960px] mx-auto h-[calc(100vh-120px)] flex flex-col' });

  // ── Header ────────────────────────────────────────────────
  const header = el('div', {
    class: 'card p-5 mb-4 flex items-center justify-between gap-3',
  });
  header.appendChild(el('div', { class: 'flex items-center gap-3' },
    el('div', {
      class: 'w-12 h-12 rounded-2xl flex items-center justify-center',
      style: { background: 'linear-gradient(135deg, #0B6E4F, #27AE60)', color: '#fff', fontSize: '20px' },
    }, icon('stars')),
    el('div', {},
      el('div', { class: 'flex items-center gap-2' },
        el('h2', { class: 'font-display text-[19px] font-extrabold text-squad-deep', style: { letterSpacing: '-0.02em' } }, 'TradeScore AI'),
        el('span', { class: 'chip', style: { background: '#E5F9F0', color: '#27AE60' } },
          el('span', { style: { fontSize: '7px' } }, '●'), 'Online'),
      ),
      el('div', { class: 'text-[12px] text-ink-3 -mt-0.5' },
        `Trained on ${TRADER.transactions} transactions · Knows ${TRADER.business.toLowerCase()} inside out`),
    ),
  ));
  header.appendChild(el('button', {
    class: 'btn btn-ghost !py-2 !px-3 !text-[12px]',
    onClick: () => location.reload(),
  }, icon('arrow-clockwise'), 'New chat'));
  root.appendChild(header);

  // ── Chat scroll area ─────────────────────────────────────
  const chat = el('div', { class: 'flex-1 overflow-y-auto pr-2' });
  root.appendChild(chat);

  // Initial greeting
  const greeting = chatBubble('ai', null);
  chat.appendChild(greeting);
  typeOut(greeting.querySelector('[data-content]'),
    `Hello ${TRADER.firstName}! I'm your TradeScore assistant. I've reviewed your last ${TRADER.transactions} transactions — your business is in great shape (₦${TRADER.monthlyRevenue.toLocaleString()} monthly, +${TRADER.growth}% growth). What would you like to know?`);

  // Quick suggestions
  const suggestions = el('div', { class: 'flex flex-wrap gap-2 mt-3 mb-2' });
  SUGGESTIONS.forEach(s => suggestions.appendChild(el('button', {
    class: 'chip px-3.5 py-2 cursor-pointer tap text-[12px] hover:bg-squad-pale',
    style: { background: '#fff', color: '#4A5C56', border: '1px solid #E2E8E4' },
    onClick: () => { input.value = s; submit(); },
  }, s)));
  chat.appendChild(suggestions);

  // ── Input bar ────────────────────────────────────────────
  const inputBar = el('form', {
    class: 'mt-4 p-2 rounded-2xl border border-line bg-white flex items-center gap-2',
    style: { boxShadow: '0 8px 22px rgba(2, 43, 35, 0.06)' },
  });
  const input = el('input', {
    class: 'flex-1 px-3 py-2.5 bg-transparent outline-none text-[14px]',
    placeholder: 'Ask about your score, loans, revenue, risks…',
  });
  inputBar.appendChild(input);
  const sendBtn = el('button', {
    class: 'btn btn-primary !py-2.5 !px-4 !text-[13px]',
    type: 'submit',
  }, 'Send', icon('send'));
  inputBar.appendChild(sendBtn);
  root.appendChild(inputBar);

  let busy = false;
  async function submit() {
    if (busy) return;
    const text = input.value.trim();
    if (!text) return;
    suggestions.remove();

    // user bubble
    chat.appendChild(chatBubble('user', text));
    input.value = '';
    chat.scrollTop = chat.scrollHeight;

    // typing indicator
    busy = true;
    const typing = el('div', { class: 'flex gap-3 mt-4 fade-in' },
      avatar('ai'),
      el('div', { class: 'chat-bubble chat-ai' },
        el('div', { class: 'flex items-center gap-1.5' },
          dotPulse(0), dotPulse(0.15), dotPulse(0.3),
        ),
      ),
    );
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;

    const reply = await chatRespond(text);
    typing.remove();

    const aiB = chatBubble('ai', null);
    chat.appendChild(aiB);
    await typeOut(aiB.querySelector('[data-content]'), reply);
    busy = false;
    chat.scrollTop = chat.scrollHeight;
  }
  inputBar.addEventListener('submit', e => { e.preventDefault(); submit(); });

  return root;
}

// ── Chat bubble factory ─────────────────────────────────────────
function chatBubble(role, text) {
  const wrap = el('div', { class: 'flex gap-3 mt-4 fade-up' });
  if (role === 'ai') wrap.appendChild(avatar('ai'));
  const bubble = el('div', { class: 'chat-bubble ' + (role === 'user' ? 'chat-user' : 'chat-ai ai-text') });
  bubble.appendChild(el('div', { 'data-content': '1' }, text || ''));
  wrap.appendChild(bubble);
  if (role === 'user') wrap.appendChild(avatar('user'));
  if (role === 'user') wrap.style.flexDirection = 'row-reverse';
  return wrap;
}

function avatar(kind) {
  const isAi = kind === 'ai';
  return el('div', {
    class: 'w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[13px] font-bold',
    style: {
      background: isAi
        ? 'linear-gradient(135deg, #0B6E4F, #27AE60)'
        : 'linear-gradient(135deg, #1F8A65, #022B23)',
    },
  }, isAi ? icon('stars') : 'F');
}

function dotPulse(delay) {
  return el('span', {
    class: 'inline-block w-2 h-2 rounded-full',
    style: {
      background: '#0B6E4F',
      animation: `pulse 1.2s ${delay}s ease-in-out infinite`,
    },
  });
}

// Render markdown-ish bold/italic for AI responses.
function format(text) {
  return (text || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

// Typewriter using the streaming generator.
async function typeOut(node, text) {
  node.classList.add('typing-caret');
  let raw = '';
  for await (const ch of streamReply(text, 12)) {
    raw += ch;
    node.innerHTML = format(raw);
    node.parentElement.parentElement?.scrollIntoView?.({ block: 'end' });
  }
  node.classList.remove('typing-caret');
}
