import { getSubjects, getAllChapters } from '../courses.js';
import { getLocalProgress, getProgressPercent } from '../progress.js';
import { getCloudStatus } from '../sync.js';
import { link, navigate } from '../router.js';
import { isAuthenticated } from '../auth.js';

export function renderHome(app) {
  const meta = getSubjects();
  const allChapters = getAllChapters();
  const loggedIn = isAuthenticated();

  // 未登录时显示登录引导卡
  if (!loggedIn) {
    app.innerHTML = `
      <header class="site-header">
        <div>
          <h1>我的学习站</h1>
          <p class="muted">选择科目开始学习</p>
        </div>
        <nav class="site-nav">
          <a href="${link('/')}" data-nav="/">首页</a>
          <a href="${link('/login')}" data-nav="/login">登录</a>
        </nav>
      </header>

      <section class="card auth-card" style="text-align: center; padding: 40px 20px;">
        <h2>登录以同步学习进度</h2>
        <p class="muted">登录后你的学习进度将自动保存到云端，换设备也能继续。</p>
        <div class="row" style="justify-content: center; margin-top: 20px;">
          <a href="${link('/login')}" class="btn primary" data-nav="/login">登录 / 注册</a>
        </div>
      </section>

      <section class="card">
        <h2>学习科目（未登录仅可预览）</h2>
        <p class="muted small">登录后即可查看进度、自动同步。</p>
        <div class="subject-grid">
          ${meta
            .map((subject) => `
              <a href="${link('/login')}" data-nav="/login" class="subject-card">
                <div class="subject-icon">${subject.icon}</div>
                <div class="subject-info">
                  <h3>${subject.title}</h3>
                  <p class="muted small">${subject.description}</p>
                  <div class="subject-progress">
                    <span class="small muted">共 ${subject.chapters.length} 章 · <strong>登录后解锁</strong></span>
                  </div>
                </div>
              </a>
            `)
            .join('')}
        </div>
      </section>
    `;
    bindNav(app);
    return;
  }

  // 已登录：正常展示进度和科目
  const progress = getLocalProgress();
  const percent = getProgressPercent(progress, allChapters.length);
  const cloud = getCloudStatus();

  app.innerHTML = `
    <header class="site-header">
      <div>
        <h1>我的学习站</h1>
        <p class="muted">选择科目开始学习</p>
      </div>
      <nav class="site-nav">
        <a href="${link('/')}" data-nav="/">首页</a>
        <a href="${link('/settings')}" data-nav="/settings">设置</a>
      </nav>
    </header>

    <section class="card progress-card">
      <div class="progress-header">
        <h2>总体进度</h2>
        <span class="badge">${percent}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${percent}%"></div>
      </div>
      <p class="muted small">
        已完成 ${progress.completedChapters.length} / ${allChapters.length} 章
        · 云端 ${cloud === 'configured' ? '已连接' : '未配置'}
      </p>
      ${cloud !== 'configured' ? '<p class="warn small">请在 GitHub Secrets 或本地 .env 配置 Supabase 后重新部署。</p>' : ''}
    </section>

    <section class="card">
      <h2>学习科目</h2>
      <div class="subject-grid">
        ${meta
          .map((subject) => {
            const chapters = subject.chapters;
            const subjectIds = chapters.map((c) => c.id);
            const completed = progress.completedChapters.filter((id) => subjectIds.includes(id)).length;
            const subjectPercent = chapters.length ? Math.round((completed / chapters.length) * 100) : 0;
            return `
              <a href="${link(`/subject/${subject.id}`)}" data-nav="/subject/${subject.id}" class="subject-card ${subjectPercent === 100 ? 'completed' : ''}">
                <div class="subject-icon">${subject.icon}</div>
                <div class="subject-info">
                  <h3>${subject.title}</h3>
                  <p class="muted small">${subject.description}</p>
                  <div class="subject-progress">
                    <div class="progress-bar small">
                      <div class="progress-fill" style="width: ${subjectPercent}%"></div>
                    </div>
                    <span class="small muted">${completed}/${chapters.length} 章 · ${subjectPercent}%</span>
                  </div>
                </div>
              </a>
            `;
          })
          .join('')}
      </div>
    </section>
  `;

  bindNav(app);
}

function bindNav(root) {
  root.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.getAttribute('data-nav'));
    });
  });
}