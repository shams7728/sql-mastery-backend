const { getLessonDB } = require('../utils/db');
const { sanitizeQuery } = require('../utils/security');
const lessonService = require('./lessonService');

// A more robust function to compare two arrays of query results.
// It is immune to row order and column order.
function areResultsEqual(res1, res2) {
  if (!Array.isArray(res1) || !Array.isArray(res2)) return false;
  if (res1.length !== res2.length) return false;
  if (res1.length === 0) return true; // Both are empty, so they are equal.

  // Create a canonical string representation of each row object
  // by sorting its keys and joining key-value pairs.
  const toCanonicalString = (row) => {
    return Object.keys(row).sort().map(key => `${key}:${row[key]}`).join('|');
  };

  const set1 = new Set(res1.map(toCanonicalString));
  const set2 = new Set(res2.map(toCanonicalString));

  if (set1.size !== set2.size) return false;

  for (const item of set1) {
    if (!set2.has(item)) {
      return false;
    }
  }

  return true;
}


async function validateSolution(userQuery, lessonId, exerciseId) {
  let db;
  try {
    if (!userQuery) throw new Error('Empty query');
    const lesson = lessonService.getLesson(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    let exercise = lesson.practice?.find(p => p.id === exerciseId);
    if (!exercise && lesson.challenges) {
      for (const challenge of lesson.challenges) {
        exercise = challenge.steps.find(s => s.stepId === exerciseId);
        if (exercise) break;
      }
    }

    if (!exercise) throw new Error('Exercise not found');

    db = getLessonDB(lessonId);
    // Run both queries and get their results
    const [userRes, correctRes] = await Promise.all([
      runQuery(db, userQuery).catch(err => {
          // If user's query has a syntax error, catch it and return it as the result.
          return { error: err.message };
      }),
      runQuery(db, exercise.solution)
    ]);

    // If the user's query resulted in an error, return that immediately.
    if (userRes.error) {
        return { valid: false, message: `Query Error: ${userRes.error}`, userRes: [], correctRes };
    }

    // Use the new robust comparison function
    const isEqual = areResultsEqual(userRes, correctRes);

    return {
      valid: isEqual,
      message: isEqual ? 'Correct! Well done.' : 'Incorrect. Compare your results with the expected output.',
      userResult: userRes, // Send back user's result
      correctResult: correctRes // Send back the correct result
    };
  } catch (e) {
    return { valid: false, message: e.message, userResult: [], correctResult: [] };
  } finally {
    if (db) db.close();
  }
}


function runQuery(db, query) {
  return new Promise((resolve, reject) => {
    try {
      const safe = sanitizeQuery(query);
      db.all(safe, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { validateSolution };
