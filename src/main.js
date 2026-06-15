import { registerRoute, startRouter, navigate } from './router.js';
import { renderHome } from './pages/home.js';
import { renderSubject } from './pages/subject.js';
import { renderLesson } from './pages/lesson.js';
import { renderSettings } from './pages/settings.js';
import { renderAuth, renderAuthCallback } from './pages/auth.js';

const app = document.getElementById('app');

// Public routes — no auth required
registerRoute('/', () => renderHome(app));
registerRoute('/login', () => navigate('/'));
registerRoute('/register', () => navigate('/'));
registerRoute('/auth/callback', () => navigate('/'));

// All routes accessible without login
registerRoute('/settings', () => renderSettings(app));
registerRoute('/subject/:subjectId', (subjectId) => renderSubject(app, subjectId));
registerRoute('/lesson/:subjectId/:chapterId', (subjectId, chapterId) => renderLesson(app, subjectId, chapterId));

startRouter();
