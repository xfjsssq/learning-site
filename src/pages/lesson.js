import { marked } from 'marked';
import { getChapterById, getChapters, getChapterSubjectId } from '../courses.js';
import {
  getLocalProgress,
  markChapterComplete,
  markChapterIncomplete,
  touchChapter,
} from '../progress.js';
import { scheduleCloudSync } from '../sync.js';
import { link, navigate } from '../router.js';

marked.setOptions({ gfm: true, breaks: true });

export function renderLesson(app, subjectId, chapterId) {
  const chapter = getChapterById(chapterId);
  if (!chapter) {
    app.innerHTML = `
      <div class="card">
        <h2>章节不存在</h2>
        <p><a href="${link('/')}" data-nav="/">返回首页</a></p>
      </div>
    `;
    bindNav(app);
    return;
  }

  let progress = getLocalProgress();
  progress = touchChapter(progress, chapter.id);
  scheduleCloudSync(progress);

  const html = marked.parse(getChapterContent(chapter));
  const isDone = progress.completedChapters.includes(chapter.id);

  const chapters = getChapters(subjectId);
  const idx = chapters.findIndex((c) => c.id === chapterId);
  const prev = chapters[idx - 1];
  const next = chapters[idx + 1];

  app.innerHTML = `
    <header class="site-header">
      <div>
        <h1>${chapter.title}</h1>
        <p class="muted"><a href="${link(`/subject/${subjectId}`)}" data-nav="/subject/${subjectId}">← 返回目录</a></p>
      </div>
      <nav class="site-nav">
        <a href="${link('/settings')}" data-nav="/settings">设置</a>
      </nav>
    </header>

    <article class="card lesson-content page-enter">
      ${html}
    </article>

    <section class="card actions">
      <button type="button" class="btn primary" id="toggle-complete">
        ${isDone ? '取消完成标记' : '标记本章已完成'}
      </button>
      <div class="neighbor-links">
        ${prev ? `<a href="${link(`/lesson/${subjectId}/${prev.id}`)}" data-nav="/lesson/${subjectId}/${prev.id}">← ${prev.title}</a>` : '<span></span>'}
        ${next ? `<a href="${link(`/lesson/${subjectId}/${next.id}`)}" data-nav="/lesson/${subjectId}/${next.id}">${next.title} →</a>` : '<span></span>'}
      </div>
    </section>
  `;

  bindNav(app);

  requestAnimationFrame(() => {
    app.querySelector('.lesson-content')?.classList.add('page-enter-active');
  });

  const btn = app.querySelector('#toggle-complete');
  btn.addEventListener('click', () => {
    let current = getLocalProgress();
    if (current.completedChapters.includes(chapter.id)) {
      current = markChapterIncomplete(current, chapter.id);
    } else {
      current = markChapterComplete(current, chapter.id);
    }
    scheduleCloudSync(current);
    renderLesson(app, subjectId, chapterId);
  });
}

function bindNav(root) {
  root.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.getAttribute('data-nav'));
    });
  });
}