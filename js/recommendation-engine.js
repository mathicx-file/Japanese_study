export const JapaneseRecommendationEngine = (() => {
  const SYLLABUS = [
    { id: 'hiragana-gojuuon', title: 'Hiragana Gojuuon', script: 'hiragana', categories: ['gojuuon'] },
    { id: 'hiragana-dakuon', title: 'Hiragana Dakuon e Handakuon', script: 'hiragana', categories: ['dakuon', 'handakuon'] },
    { id: 'hiragana-youon', title: 'Hiragana Youon', script: 'hiragana', categories: ['youon'] },
    { id: 'katakana-gojuuon', title: 'Katakana Gojuuon', script: 'katakana', categories: ['gojuuon'] },
    { id: 'katakana-dakuon', title: 'Katakana Dakuon e Handakuon', script: 'katakana', categories: ['dakuon', 'handakuon'] },
    { id: 'katakana-youon', title: 'Katakana Youon', script: 'katakana', categories: ['youon'] },
    { id: 'similar-kana', title: 'Revisão de caracteres parecidos', script: 'all', categories: ['gojuuon'] },
    { id: 'writing-basic', title: 'Escrita básica', script: 'all', categories: ['gojuuon'] },
    { id: 'pre-kanji', title: 'Pré-Kanji: vocabulário e radicais iniciais', script: 'all', categories: ['gojuuon'] },
    { id: 'kanji-n5-initial', title: 'Kanji N5 inicial', script: 'kanji', categories: ['N5'] }
  ];

  const GUIDED_TRAILS = [
    {
      id: 'hiragana-7-days',
      title: 'Hiragana em 7 dias',
      description: 'Comece pelo Gojuuon e avance por blocos curtos de hiragana.',
      quiz: { mode: 'multiple-choice', script: 'hiragana', categories: ['gojuuon'], limit: '10', includeMistakeReviews: true }
    },
    {
      id: 'katakana-7-days',
      title: 'Katakana em 7 dias',
      description: 'Construa reconhecimento de katakana antes de palavras estrangeiras.',
      quiz: { mode: 'multiple-choice', script: 'katakana', categories: ['gojuuon'], limit: '10', includeMistakeReviews: true }
    },
    {
      id: 'similar-kana',
      title: 'Kana parecidos',
      description: 'Reforce pares que costumam confundir leitura e escrita.',
      quiz: { mode: 'multiple-choice', script: 'all', categories: ['gojuuon'], limit: '10', includeMistakeReviews: true }
    },
    {
      id: 'active-production',
      title: 'Produ\u00e7\u00e3o ativa',
      description: 'Veja o romaji e produza o kana sem depender de alternativas.',
      quiz: { mode: 'kana-typing', script: 'hiragana', categories: ['gojuuon'], limit: '10', includeMistakeReviews: true }
    },
    {
      id: 'kanji-n5-initial',
      title: 'Primeiros Kanji N5',
      description: 'Pratique significado e leitura dos 10 primeiros kanji.',
      quiz: { mode: 'multiple-choice', script: 'kanji', categories: ['N5'], limit: '10', includeMistakeReviews: true }
    }
  ];

  const QUICK_SESSIONS = [
    {
      id: 'five-minute-review',
      title: 'Revis\u00e3o de 5 minutos',
      quiz: { mode: 'multiple-choice', script: 'all', categories: ['gojuuon'], limit: '10', includeMistakeReviews: true }
    },
    {
      id: 'new-hiragana',
      title: '10 hiragana b\u00e1sicos',
      quiz: { mode: 'multiple-choice', script: 'hiragana', categories: ['gojuuon'], limit: '10', includeMistakeReviews: true }
    },
    {
      id: 'new-katakana',
      title: '10 katakana b\u00e1sicos',
      quiz: { mode: 'multiple-choice', script: 'katakana', categories: ['gojuuon'], limit: '10', includeMistakeReviews: true }
    },
    {
      id: 'active-kana',
      title: 'Produ\u00e7\u00e3o ativa',
      quiz: { mode: 'kana-typing', script: 'all', categories: ['gojuuon'], limit: '10', includeMistakeReviews: true }
    },
    {
      id: 'flashcards',
      title: 'Flashcards r\u00e1pidos',
      quiz: { mode: 'flashcards', script: 'all', categories: ['gojuuon'], limit: '10', includeMistakeReviews: false }
    },
    {
      id: 'kanji-n5',
      title: 'Kanji N5 inicial',
      quiz: { mode: 'multiple-choice', script: 'kanji', categories: ['N5'], limit: '10', includeMistakeReviews: true }
    }
  ];

  function recommend(data = {}) {
    const srsStats = data.srsStats || {};
    const difficulty = data.difficulty || [];
    const completion = data.completion || {};
    const diagnostic = data.diagnostic || {};

    if ((srsStats.due || 0) > 0 && (srsStats.totalTracked || 0) > 0) {
      return {
        type: 'review',
        title: 'Revisar pendentes',
        description: `Você tem ${srsStats.due} revisão(ões) vencida(s) no SRS.`,
        action: 'study-now',
        session: { reason: 'review-due', script: 'all', categories: ['gojuuon', 'dakuon', 'handakuon', 'youon', 'N5'], mode: 'multiple-choice', limit: 10 }
      };
    }

    const recurringErrors = difficulty.filter(item => (item.errors || 0) >= 2 && (item.accuracy || 0) < 70);
    if (recurringErrors.length >= 3) {
      return {
        type: 'reinforcement',
        title: 'Reforçar erros recentes',
        description: 'Alguns caracteres apareceram com baixa precisão. Faça uma sessão curta de reforço.',
        action: 'study-now',
        session: { reason: 'recent-errors', script: 'all', categories: ['gojuuon', 'dakuon', 'handakuon', 'youon', 'N5'], mode: 'multiple-choice', limit: 10 }
      };
    }

    const nextItem = getNextSyllabusItem(data.characters || [], data.studiedIds || [], completion, diagnostic);
    return {
      type: 'syllabus',
      title: nextItem.title,
      description: nextItem.description || 'Próximo bloco recomendado da ementa.',
      action: 'study-now',
      session: {
        reason: nextItem.id,
        script: nextItem.script,
        categories: nextItem.categories,
        mode: 'multiple-choice',
        limit: 10
      }
    };
  }

  function getNextSyllabusItem(characters, studiedIds, completion, diagnostic) {
    const studied = new Set(studiedIds || []);
    const weakScript = diagnostic?.weakScript;

    if (weakScript === 'katakana') {
      return { ...SYLLABUS[3], description: 'Seu diagnóstico indica que katakana merece atenção.' };
    }

    for (const item of SYLLABUS.slice(0, 6)) {
      const pool = characters.filter(char =>
        char.script === item.script &&
        item.categories.includes(char.category)
      );
      const studiedCount = pool.filter(char => studied.has(buildStudyId(char))).length;
      const ratio = pool.length ? studiedCount / pool.length : 1;
      if (ratio < 0.8) return item;
    }

    if (getPercent(completion.katakana) >= 80 && getPercent(completion.hiragana) >= 80) {
      if (getPercent(completion.kanji) < 80) return SYLLABUS[9];
      return SYLLABUS[7];
    }

    return SYLLABUS[0];
  }

  function getPercent(group = {}) {
    const total = Number(group.total || 0);
    return total > 0 ? Math.round((Number(group.studied || 0) / total) * 100) : 0;
  }

  function getGuidedTrail(id) {
    return GUIDED_TRAILS.find(item => item.id === id) || null;
  }

  function getQuickSession(id) {
    return QUICK_SESSIONS.find(item => item.id === id) || null;
  }

  function buildStudyId(item) {
    if (item?.script === 'kanji') return `kanji_${item.id || item.unicode || item.char}`;
    return `${item.romaji}_${item.char}`;
  }

  return { recommend, SYLLABUS, GUIDED_TRAILS, QUICK_SESSIONS, getGuidedTrail, getQuickSession };
})();
