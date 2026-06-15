import { navigate } from '../router.js';

// Auth page — redirect to home since auth is no longer needed
export function renderAuth(app) {
  navigate('/');
}

export function renderAuthCallback(app) {
  navigate('/');
}

export function checkAuthAndRedirect(app, requiredAuth = false) {
  return Promise.resolve(requiredAuth ? {} : null);
}
