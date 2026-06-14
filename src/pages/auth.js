import { marked } from 'marked';
import { signUp, signIn, signInWithOAuth, signOut, getCurrentUser, onAuthChange, isAuthReady } from '../auth.js';
import { link, navigate } from '../router.js';

marked.setOptions({ gfm: true, breaks: true });

let currentMode = 'login';
let pendingRedirect = '/';

export function renderAuth(app, redirectTo = '/') {
  pendingRedirect = redirectTo;
  currentMode = 'login';
  renderAuthForm(app);
}

function renderAuthForm(app) {
  const user = getCurrentUser();
  if (user) {
    navigate(pendingRedirect);
    return;
  }

  const isLogin = currentMode === 'login';

  app.innerHTML = `
    <header class="site-header">
      <div>
        <h1>${isLogin ? '登录' : '注册'}</h1>
        <p class="muted">使用 GitHub 账号或邮箱密码</p>
      </div>
    </header>

    <section class="card auth-card">
      <div id="auth-message" class="auth-message"></div>

      <form id="auth-form" class="auth-form">
        ${!isLogin ? `
          <div class="form-group">
            <label for="email">邮箱</label>
            <input type="email" id="email" name="email" required autocomplete="email" placeholder="you@example.com" />
          </div>
        ` : ''}

        <div class="form-group">
          <label for="password">${isLogin ? '密码' : '设置密码'}</label>
          <input type="password" id="password" name="password" required autocomplete="${isLogin ? 'current-password' : 'new-password'}" placeholder="至少 6 位字符" minlength="6" />
        </div>

        ${!isLogin ? `
          <div class="form-group">
            <label for="confirm-password">确认密码</label>
            <input type="password" id="confirm-password" name="confirmPassword" required autocomplete="new-password" placeholder="再次输入密码" minlength="6" />
          </div>
        ` : ''}

        <button type="submit" class="btn primary btn-block" id="auth-submit">
          ${isLogin ? '登录' : '注册'}
        </button>
      </form>

      <div class="divider">或</div>

      <button type="button" class="btn btn-block" id="github-oauth">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px; vertical-align: middle;">
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
        </svg>
        使用 GitHub 登录
      </button>

      <p class="auth-switch">
        ${isLogin ? '没有账号？' : '已有账号？'}
        <button type="button" id="switch-mode">${isLogin ? '立即注册' : '去登录'}</button>
      </p>

      <p class="auth-back">
        <a href="${link('/')}" data-nav="/">← 返回首页</a>
      </p>
    </section>
  `;

  bindAuthEvents(app);
}

function bindAuthEvents(app) {
  const form = app.querySelector('#auth-form');
  const submitBtn = app.querySelector('#auth-submit');
  const githubBtn = app.querySelector('#github-oauth');
  const switchBtn = app.querySelector('#switch-mode');
  const messageEl = app.querySelector('#auth-message');

  function showMessage(text, isError = true) {
    messageEl.textContent = text;
    messageEl.className = `auth-message ${isError ? 'error' : 'success'}`;
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    githubBtn.disabled = loading;
    submitBtn.textContent = loading ? (currentMode === 'login' ? '登录中...' : '注册中...') : (currentMode === 'login' ? '登录' : '注册');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (!isLogin && password !== confirmPassword) {
      showMessage('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    showMessage('');

    try {
      if (currentMode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      showMessage(isLogin ? '登录成功，跳转中...' : '注册成功，请检查邮箱验证', false);
      setTimeout(() => navigate(pendingRedirect), 1000);
    } catch (err) {
      showMessage(err.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  });

  githubBtn.addEventListener('click', async () => {
    setLoading(true);
    try {
      await signInWithOAuth('github');
    } catch (err) {
      showMessage(err.message || 'GitHub 登录失败');
      setLoading(false);
    }
  });

  switchBtn.addEventListener('click', () => {
    currentMode = currentMode === 'login' ? 'register' : 'login';
    renderAuthForm(app);
  });

  // Handle back navigation
  app.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.getAttribute('data-nav'));
    });
  });
}

// Auth callback page handler (for OAuth redirect)
export function renderAuthCallback(app) {
  app.innerHTML = `
    <section class="card" style="text-align: center; padding: 48px;">
      <div class="spinner" style="margin: 0 auto 16px; width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p>正在完成登录...</p>
    </section>
    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  `;

  // The auth state change listener in auth.js will handle the redirect
}

// Check auth state on app load
export function checkAuthAndRedirect(app, requiredAuth = true) {
  return new Promise((resolve) => {
    const unsubscribe = onAuthChange((user) => {
      if (!isAuthReady()) return;
      unsubscribe();
      if (requiredAuth && !user) {
        navigate('/login');
      } else if (!requiredAuth && user) {
        navigate('/');
      }
      resolve(user);
    });
  });
}