import { getSubjectById, getChapters } from '../courses.js';
import {
  getLocalProgress,
  getProgressPercent,
} from '../progress.js';
import { link, navigate } from '../router.js';

export function renderSubject(app, subjectId) {
  const subject = getSubjectById(subjectId);
  if (!subject) {
    app.innerHTML = `
      <div class="card" style="text-align:center; padding: 48px;">
        <h2>科目不存在</h2>
        <p><a href="${link('/')}" data-nav="/">← 返回首页</a></p>
      </div>
    `;
    bindNav(app);
    return;
  }

  const chapters = getChapters(subjectId);
  const progress = getLocalProgress();
  const subjectChapters = chapters.map((c) => c.id);
  const completedInSubject = progress.completedChapters.filter((id) => subjectChapters.includes(id)).length;
  const percent = chapters.length ? Math.round((completedInSubject / chapters.length) * 100) : 0;

  app.innerHTML = `
    <header class="site-header">
      <div>
        <h1>${subject.icon} ${subject.title}</h1>
        <p class="muted">${subject.description}</p>
      </div>
      <nav class="site-nav">
        <a href="${link('/')}" data-nav="/">← 全部科目</a>
        <a href="${link('/settings')}" data-nav="/settings">设置</a>
      </nav>
    </header>

    <section class="card progress-card">
      <div class="progress-header">
        <h2>本科目进度</h2>
        <span class="badge">${percent}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${percent}%"></div>
      </div>
      <p class="muted small">
        已完成 ${completedInSubject} / ${chapters.length} 章
      </p>
    </section>

    <section class="card">
      <h2>章节目录</h2>
      <ul class="chapter-list">
        ${chapters
          .map((chapter) => {
            const done = progress.completedChapters.includes(chapter.id);
            const last = progress.lastVisited[chapter.id];
            return `
              <li class="chapter-item ${done ? 'done' : ''}">
                <a href="${link(`/lesson/${subjectId}/${chapter.id}`)}" data-nav="/lesson/${subjectId}/${chapter.id}">
                  <span class="chapter-status">${done ? '✓' : '○'}</span>
                  <span class="chapter-title">${chapter.title}</span>
                </a>
                ${last ? `<span class="chapter-meta">上次学习 ${formatDate(last)}</span>` : ''}
              </li>
            `;
          })
          .join('')}
      </ul>
    </section>
  `;

  bindNav(app);
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function bindNav(root) {
  root.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.getAttribute('data-nav'));
    });
  });
}