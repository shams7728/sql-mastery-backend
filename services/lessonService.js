const fs = require('fs');
const path = require('path');
const LESSON_CONTENT_DIR = path.resolve(__dirname, '../lesson-content');

function getLesson(lessonId) {
  const lessonPath = path.join(LESSON_CONTENT_DIR, `lesson_${lessonId}.json`);
  if (!fs.existsSync(lessonPath)) return null;
  const raw = fs.readFileSync(lessonPath, 'utf8');
  return JSON.parse(raw);
}

function getAllLessons() {
  const files = fs.readdirSync(LESSON_CONTENT_DIR)
    .filter(file => file.endsWith('.json'));
  return files.map(file => {
    const raw = fs.readFileSync(path.join(LESSON_CONTENT_DIR, file), 'utf8');
    return JSON.parse(raw);
  });
}

module.exports = { getLesson, getAllLessons };
