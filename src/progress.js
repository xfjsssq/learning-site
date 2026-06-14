import { getSupabaseClient } from './supabase.js';

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

export { getLocalProgress as getProgress };
export { getLocalProgress };

export function markChapterComplete(progress, chapterId) {
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

export function markChapterIncomplete(progress, chapterId) {
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

export function touchChapter(progress, chapterId) {
  return saveLocalProgress({
    ...progress,
    lastVisited: {
      ...progress.lastVisited,
      [chapterId]: new Date().toISOString(),
    },
  });
}

export function mergeProgress(local, remote) {
  const remoteObj = remote && typeof remote === 'object' ? remote : createEmptyProgress();
  const completed = new Set([
    ...(local.completedChapters || []),
    ...(remoteObj.completedChapters || []),
  ]);
  const lastVisited = {
    ...(remoteObj.lastVisited || {}),
    ...(local.lastVisited || {}),
  };
  for (const [id, time] of Object.entries(local.lastVisited || {})) {
    const remoteTime = remoteObj.lastVisited?.[id];
    if (!remoteTime || new Date(time) > new Date(remoteTime)) {
      lastVisited[id] = time;
    }
  }
  const studyLog = [
    ...(remoteObj.studyLog || []),
    ...(local.studyLog || []),
  ]
    .sort((a, b) => new Date(a.at) - new Date(b.at))
    .slice(-200);

  return saveLocalProgress({
    completedChapters: [...completed],
    lastVisited,
    studyLog,
  });
}

export function getProgressPercent(progress, totalChapters) {
  if (!totalChapters) return 0;
  const done = progress.completedChapters?.length || 0;
  return Math.round((done / totalChapters) * 100);
}

export function exportProgressJson(progress) {
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
  return saveLocalProgress({
    ...createEmptyProgress(),
    ...data.progress,
  });
}

export async function fetchRemoteProgress() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc('get_my_progress');
  if (error) throw error;
  return data && typeof data === 'object' ? data : {};
}

export async function pushRemoteProgress(progress) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.rpc('upsert_my_progress', {
    p_progress: progress,
  });

  if (error) throw error;
  return true;
}

export async function syncFromCloud() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, reason: 'missing_config', progress: getLocalProgress() };
  }

  const local = getLocalProgress();

  try {
    const remote = await fetchRemoteProgress();
    const merged = mergeProgress(local, remote);
    await pushRemoteProgress(merged);
    return { ok: true, progress: merged, source: 'cloud' };
  } catch (err) {
    console.error('Sync from cloud failed:', err);
    return { ok: false, reason: 'error', error: err, progress: local };
  }
}

export function scheduleCloudSync(progress) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  if (window.syncTimer) clearTimeout(window.syncTimer);
  window.syncTimer = setTimeout(async () => {
    if (window.syncing) return;
    window.syncing = true;
    try {
      await pushRemoteProgress(progress);
    } catch (err) {
      console.error('Cloud sync failed:', err);
    } finally {
      window.syncing = false;
    }
  }, 800);
}