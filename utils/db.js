const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

function getLessonDB(lessonId, readOnly = true) {
  const dbPath = path.resolve(__dirname, '../lesson-data', `lesson_${lessonId}.db`);

  if (!fs.existsSync(dbPath)) {
    throw new Error(`❌ Database not found: lesson_${lessonId}.db`);
  }

  const mode = readOnly
    ? sqlite3.OPEN_READONLY
    : sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;

  return new sqlite3.Database(dbPath, mode);
}

module.exports = { getLessonDB };
