import { init, register, start } from './router.js';
import { Landing } from './pages/landing.js';
import { Signup }  from './pages/signup.js';
import { Login }   from './pages/login.js';
import { Shell }   from './dashboard/shell.js';

const app = document.getElementById('app');
init(app);

// Public pages
register('/',         (ctx) => Landing(ctx));
register('/signup',   (ctx) => Signup(ctx));
register('/login',    (ctx) => Login(ctx));

// Dashboard panels — all share the same shell, just different inner panel.
const DASH_PATH = /^\/app(?:\/(?<panel>overview|score|loans|inventory|transactions|assistant|profile))?$/;
register(DASH_PATH, (ctx) => Shell({
  panel: ctx.params.panel || 'overview',
  navigate: ctx.navigate,
}));

// Hide the pre-JS loader once routes are wired.
const loader = document.getElementById('loading');
if (loader) {
  loader.classList.add('hidden');
  setTimeout(() => loader.remove(), 400);
}

start();
