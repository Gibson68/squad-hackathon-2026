// Hash-based router. Routes look like #/, #/signup, #/app, #/app/score, etc.
// Each route is registered with a renderer that returns a DOM element.

const routes = [];
let host = null;
let current = null;
let lastRoute = null;

export function init(rootEl) { host = rootEl; }

// Register a route. `match` is either a string (exact) or a RegExp.
// Renderer receives ({ params, navigate, hash }).
export function register(match, render) {
  routes.push({ match, render });
}

export function navigate(hash) {
  if (!hash.startsWith('#')) hash = '#' + hash;
  if (location.hash === hash) handleRoute();
  else location.hash = hash;
}

function findRoute(hash) {
  const path = hash.replace(/^#\/?/, '/');
  for (const r of routes) {
    if (typeof r.match === 'string') {
      if (r.match === path) return { route: r, params: {} };
    } else {
      const m = path.match(r.match);
      if (m) return { route: r, params: m.groups || {} };
    }
  }
  return null;
}

function handleRoute() {
  const hash = location.hash || '#/';
  const found = findRoute(hash);
  if (!found) {
    console.warn('No route for', hash);
    location.hash = '#/';
    return;
  }

  let next;
  try {
    next = found.route.render({
      params: found.params,
      navigate,
      hash,
      prev: lastRoute,
    });
  } catch (err) {
    console.error('Route render failed:', err);
    return;
  }
  next.classList.add('page');

  if (current) current.remove();
  host.appendChild(next);
  current = next;
  lastRoute = hash;

  window.scrollTo(0, 0);
}

export function start() {
  window.addEventListener('hashchange', handleRoute);
  if (!location.hash) location.hash = '#/';
  else handleRoute();
}
