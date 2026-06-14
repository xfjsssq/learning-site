import { registerRoute, startRouter, navigate } from './router.js';
import { renderHome } from './pages/home.js';
import { renderSubject } from './pages/subject.js';
import { renderLesson } from './pages/lesson.js';
import { renderSettings } from './pages/settings.js';
import { renderAuth, renderAuthCallback, checkAuthAndRedirect } from './pages/auth.js';
import { syncFromCloud } from './sync.js';
import { initAuth, onAuthChange } from './auth.js';

const app = document.getElementById('app');

// Public routes
registerRoute('/', () => renderHome(app));
registerRoute('/login', (params, query) => renderAuth(app, query.redirect || '/'));
registerRoute('/register', (params, query) => {
  const redirect = query.redirect || '/';
  window.__authStartMode = 'register';
  renderAuth(app, redirect);
});
registerRoute('/auth/callback', () => renderAuthCallback(app));

// Protected routes (require authentication)
function requireAuth(handler) {
  return async (...args) => {
    const user = await checkAuthAndRedirect(app, true);
    if (user) {
      handler(...args);
    }
  };
}

registerRoute('/settings', requireAuth(() => renderSettings(app)));
registerRoute('/subject/:subjectId', requireAuth((subjectId) => renderSubject(app, subjectId)));
registerRoute('/lesson/:subjectId/:chapterId', requireAuth((subjectId, chapterId) => renderLesson(app, subjectId, chapterId)));

async function bootstrap() {
  // Initialize auth first
  await initAuth();

  // Listen for auth changes to handle redirects
  onAuthChange((user) => {
    const path = window.location.pathname;
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const cleanPath = base && path.startsWith(base) ? path.slice(base.length) || '/' : path;
    
    if (user && (cleanPath === '/login' || cleanPath === '/register')) {
      navigate('/settings');
    }
  });

  // Sync progress if authenticated
  const supabase = (await import('./supabase.js')).getSupabaseClient();
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const result = await syncFromCloud();
      if (!result.ok && result.reason === 'missing_config') {
        console.info('Supabase not configured — local progress only.');
      }
    }
  }

  startRouter();
}

bootstrap();