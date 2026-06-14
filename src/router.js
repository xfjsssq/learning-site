const routes = new Map();

export function registerRoute(path, handler) {
  routes.set(path, handler);
}

export function navigate(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  window.history.pushState({}, '', normalized);
  renderRoute();
}

export function getCurrentPath() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let path = window.location.pathname;
  if (base && path.startsWith(base)) {
    path = path.slice(base.length) || '/';
  }
  if (!path.startsWith('/')) path = `/${path}`;
  return path;
}

function matchRoute(path) {
  if (routes.has(path)) return routes.get(path);
  
  for (const [pattern, handler] of routes.entries()) {
    if (pattern.includes(':')) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '([^/]+)') + '$');
      const match = path.match(regex);
      if (match) {
        return { handler, params: match.slice(1) };
      }
    }
  }
  return routes.get('/');
}

export function renderRoute() {
  const path = getCurrentPath();
  const match = matchRoute(path);
  if (match.handler) {
    if (match.params) {
      match.handler(...match.params);
    } else {
      match.handler();
    }
  } else if (routes.get('/')) {
    routes.get('/')();
  }
}

export function startRouter() {
  window.addEventListener('popstate', renderRoute);
  renderRoute();
}

export function link(path) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (path === '/') return `${base}/` || '/';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}