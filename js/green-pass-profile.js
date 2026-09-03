(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GreenPassProfile = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const clamp = value => Math.max(0, Math.min(1, Number(value) || 0));
  const normalize = value => String(value ?? '').trim();

  function createProfile(id = 'anonymous') {
    return {
      id: normalize(id) || 'anonymous',
      attempts: 0,
      correct: 0,
      accuracy: 0,
      bySkill: {},
      reinforcement: [],
      greenPass: false
    };
  }

  function skillKey(attempt) {
    return [attempt.language, attempt.chapter, attempt.skill]
      .map(normalize)
      .filter(Boolean)
      .join(':') || 'general';
  }

  function classifySkill(record) {
    if (record.attempts < 2) return 'observing';
    if (record.accuracy >= 0.8 && record.confidence >= 0.7) return 'ready';
    if (record.accuracy >= 0.6) return 'developing';
    return 'reinforce';
  }

  function recordAttempt(profile, attempt) {
    if (!profile || typeof profile !== 'object') throw new TypeError('A learner profile is required.');
    if (!attempt || typeof attempt !== 'object') throw new TypeError('An assessment attempt is required.');

    const key = skillKey(attempt);
    const correct = Boolean(attempt.correct);
    const confidence = clamp(attempt.confidence ?? (correct ? 0.7 : 0.4));
    const previous = profile.bySkill[key] || { attempts: 0, correct: 0, accuracy: 0, confidence: 0, status: 'observing' };
    const attempts = previous.attempts + 1;
    const correctCount = previous.correct + (correct ? 1 : 0);
    const skill = {
      attempts,
      correct: correctCount,
      accuracy: correctCount / attempts,
      confidence: ((previous.confidence * previous.attempts) + confidence) / attempts
    };
    skill.status = classifySkill(skill);

    const next = {
      ...profile,
      attempts: profile.attempts + 1,
      correct: profile.correct + (correct ? 1 : 0),
      bySkill: { ...profile.bySkill, [key]: skill }
    };
    next.accuracy = next.correct / next.attempts;
    next.reinforcement = Object.entries(next.bySkill)
      .filter(([, record]) => record.status === 'reinforce')
      .map(([skillName]) => skillName);
    const observed = Object.values(next.bySkill).filter(record => record.attempts >= 2);
    next.greenPass = observed.length > 0 && observed.every(record => record.status === 'ready');
    return next;
  }

  function recommendNext(profile) {
    const reinforcement = profile?.reinforcement || [];
    if (reinforcement.length) return { action: 'reinforce', skill: reinforcement[0] };
    if (profile?.greenPass) return { action: 'advance' };
    return { action: 'continue-assessment' };
  }

  return { createProfile, recordAttempt, recommendNext, classifySkill, skillKey };
});
