const LOCAL_PROGRESS_KEY = 'learning-site-progress-v2';

function createEmptyProgress() {
  return {
    completedChapters: [],
    lastVisited: {},
    studyLog: [],
    updatedAt: null,
  };
}

function getLocalProgress() {
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
    if (!raw) return createEmptyProgress();
    const parsed = JSON.parse(raw);
    return {
      ...createEmptyProgress(),
      ...parsed,
      completedChapters: Array.isArray(parsed.completedChapters) ? parsed.completedChapters : [],
      lastVisited: parsed.lastVisited && typeof parsed.lastVisited === 'object' ? parsed.lastVisited : {},
      studyLog: Array.isArray(parsed.studyLog) ? parsed.studyLog : [],
    };
  } catch {
    return createEmptyProgress();
  }
}

function saveLocalProgress(progress) {
  const payload = {
    ...progress,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(payload));
  return payload;
}

export function getProgress() {
  return getLocalProgress();
}

export function markChapterComplete(chapterId) {
  const progress = getLocalProgress();
  const completed = new Set(progress.completedChapters);
  completed.add(chapterId);
  return saveLocalProgress({
    ...progress,
    completedChapters: [...completed],
    lastVisited: {
      ...progress.lastVisited,
      [chapterId]: new Date().toISOString(),
    },
    studyLog: [
      ...progress.studyLog,
      { chapterId, action: 'complete', at: new Date().toISOString() },
    ].slice(-200),
  });
}

export function markChapterIncomplete(chapterId) {
  const progress = getLocalProgress();
  const completed = new Set(progress.completedChapters);
  completed.delete(chapterId);
  return saveLocalProgress({
    ...progress,
    completedChapters: [...completed],
    lastVisited: {
      ...progress.lastVisited,
      [chapterId]: new Date().toISOString(),
    },
  });
}

export function touchChapter(chapterId) {
  const progress = getLocalProgress();
  return saveLocalProgress({
    ...progress,
    lastVisited: {
      ...progress.lastVisited,
      [chapterId]: new Date().toISOString(),
    },
  });
}

export function getProgressPercent(completedCount, totalChapters) {
  if (!totalChapters) return 0;
  return Math.round((completedCount / totalChapters) * 100);
}

export function exportProgressJson() {
  const progress = getLocalProgress();
  return JSON.stringify(
    {
      progress,
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );
}

export function importProgressJson(jsonText) {
  const data = JSON.parse(jsonText);
  if (!data.progress || typeof data.progress !== 'object') {
    throw new Error('备份文件格式无效');
  }
  return saveLocalProgress(data.progress);
}
