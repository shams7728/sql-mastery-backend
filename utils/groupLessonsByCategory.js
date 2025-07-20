// ✅ groupLessonsByCategory.js

export function groupLessonsByCategory(lessons) {
    return lessons.reduce((acc, lesson) => {
      if (!acc[lesson.category]) acc[lesson.category] = [];
      acc[lesson.category].push(lesson);
      return acc;
    }, {});
  }
  