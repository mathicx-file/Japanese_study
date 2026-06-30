export const JapaneseLearningLevels = (() => {
  const LEVELS = [
    { level: 1, title: 'Aprendiz de Kana', minXp: 0 },
    { level: 2, title: 'Explorador de Hiragana', minXp: 80 },
    { level: 3, title: 'Leitor de Kana', minXp: 180 },
    { level: 4, title: 'Praticante Constante', minXp: 320 },
    { level: 5, title: 'Mestre de Kana Inicial', minXp: 520 }
  ];

  function calculate(data = {}) {
    const stats = data.stats || {};
    const completion = data.completion || {};
    const srsStats = data.srsStats || {};
    const quizStats = data.quizStats || {};

    const hiraganaPercent = getPercent(completion.hiragana);
    const katakanaPercent = getPercent(completion.katakana);
    const studied = Number(stats.totalStudied || 0);
    const streak = Number(stats.streak || 0);
    const mastered = Number(srsStats.mastered || 0);
    const quizAnswered = Number(quizStats.answered || 0);

    const xp =
      studied * 3 +
      mastered * 5 +
      Math.min(streak, 30) * 4 +
      Math.round(hiraganaPercent * 0.8) +
      Math.round(katakanaPercent * 0.8) +
      Math.min(quizAnswered, 300);

    const current = [...LEVELS].reverse().find(level => xp >= level.minXp) || LEVELS[0];
    const next = LEVELS.find(level => level.minXp > current.minXp) || null;
    const progress = next
      ? Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100)
      : 100;

    return {
      ...current,
      xp,
      next,
      progress: clamp(progress, 0, 100),
      hint: getLevelHint(current.level, hiraganaPercent, katakanaPercent, srsStats)
    };
  }

  function getPercent(group = {}) {
    const total = Number(group.total || 0);
    if (total <= 0) return 0;
    return Math.round((Number(group.studied || 0) / total) * 100);
  }

  function getLevelHint(level, hiraganaPercent, katakanaPercent, srsStats = {}) {
    if (level <= 1) return 'Comece pelo Gojuuon de hiragana.';
    if (hiraganaPercent < 70) return 'Complete mais hiragana antes de acelerar.';
    if (katakanaPercent < 50) return 'Inclua katakana nas próximas sessões.';
    if ((srsStats.due || 0) > 0) return 'Faça uma revisão curta para manter o ritmo.';
    return 'Experimente escrita e preparação para Kanji.';
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  return { calculate, LEVELS };
})();
