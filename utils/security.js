function sanitizeQuery(query) {
  const lowered = query.toLowerCase();
  const banned = ['insert', 'update', 'delete', 'drop', 'alter', 'create', 'attach'];
  for (let word of banned) {
    if (lowered.includes(word)) throw new Error(`Operation not allowed: ${word}`);
  }

  const joinCount = (lowered.match(/join/g) || []).length;
  if (joinCount > 3) throw new Error('Too many JOINs');

  return query;
}

module.exports = { sanitizeQuery };
