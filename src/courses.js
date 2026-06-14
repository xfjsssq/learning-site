import coursesData from '../content/courses.json';

const chapterModules = import.meta.glob('../content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export function getCourseMeta() {
  return coursesData;
}

export function getSubjects() {
  return [...coursesData.subjects].sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getSubjectById(id) {
  return getSubjects().find((s) => s.id === id);
}

export function getChapters(subjectId) {
  const subject = getSubjectById(subjectId);
  if (!subject) return [];
  return [...subject.chapters].sort((a, b) => a.order - b.order);
}

export function getAllChapters() {
  return getSubjects().flatMap((s) => s.chapters);
}

export function getChapterById(id) {
  return getAllChapters().find((c) => c.id === id);
}

export function getChapterSubjectId(chapterId) {
  for (const subject of getSubjects()) {
    if (subject.chapters.some((c) => c.id === chapterId)) {
      return subject.id;
    }
  }
  return null;
}

export function getChapterContent(chapter) {
  const path = `../content/${chapter.file}`;
  return chapterModules[path] || '# 内容未找到\n\n请检查 Markdown 文件是否存在。';
}