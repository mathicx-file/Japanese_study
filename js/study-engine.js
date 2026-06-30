import { JapaneseRecommendationEngine } from './recommendation-engine.js';

export const JapaneseStudyEngine = (() => {
  function buildSession(context = {}) {
    const recommendation = JapaneseRecommendationEngine.recommend(context);
    const session = recommendation.session || {};
    const script = resolveScript(session.script, context);

    return {
      reason: session.reason || recommendation.type || 'default',
      title: recommendation.title || 'Sessão recomendada',
      description: recommendation.description || 'Sessão curta montada com base no seu progresso.',
      quiz: {
        mode: session.mode || 'multiple-choice',
        script,
        categories: normalizeCategories(session.categories),
        limit: String(session.limit || 10),
        includeMistakeReviews: true
      }
    };
  }

  function resolveScript(script, context) {
    if (script && script !== 'all') return script;

    const completion = context.completion || {};
    const hiraganaRatio = getRatio(completion.hiragana);
    const katakanaRatio = getRatio(completion.katakana);

    if (hiraganaRatio < 0.8) return 'hiragana';
    if (katakanaRatio < 0.8) return 'katakana';
    if (getRatio(completion.kanji) < 0.8) return 'kanji';
    return 'all';
  }

  function normalizeCategories(categories) {
    const allowed = ['gojuuon', 'dakuon', 'handakuon', 'youon', 'N5'];
    const selected = Array.isArray(categories) ? categories.filter(category => allowed.includes(category)) : [];
    return selected.length ? selected : ['gojuuon'];
  }

  function getRatio(group = {}) {
    const total = Number(group.total || 0);
    return total > 0 ? Number(group.studied || 0) / total : 0;
  }

  return { buildSession };
})();
