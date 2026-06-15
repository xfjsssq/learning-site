import { getSubjects, getAllChapters } from '../courses.js';
import { getProgressPercent } from '../progress.js';
import { link, navigate } from '../router.js';

export function renderHome(app) {
  const meta = getSubjects();
  const allChapters = getAllChapters();
  const progress = JSON.parse(localStorage.getItem('learning-site-progress-v2') || '{"completedChapters":[],"lastVisited":{},"studyLog":[],"updatedAt":null}');
  const completedCount = (progress.completedChapters || []).length;
  const percent = getProgressPercent(completedCount, allChapters.length);

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
        已完成 ${completedCount} / ${allChapters.length} 章
      </p>
    </section>

    <section class="card">
      <h2>学习科目</h2>
      <div class="subject-grid">
        ${meta
          .map((subject) => {
            const chapters = subject.chapters;
            const subjectIds = chapters.map((c) => c.id);
            const completed = (progress.completedChapters || []).filter((id) => subjectIds.includes(id)).length;
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
