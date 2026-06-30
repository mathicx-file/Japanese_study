import test from 'node:test';
import assert from 'node:assert/strict';

import { JapaneseLearningLevels } from '../js/learning-levels.js';
import { JapaneseRecommendationEngine } from '../js/recommendation-engine.js';
import { JapaneseStudyEngine } from '../js/study-engine.js';

const characters = [
  { romaji: 'a', char: 'あ', script: 'hiragana', category: 'gojuuon' },
  { romaji: 'ka', char: 'か', script: 'hiragana', category: 'gojuuon' },
  { romaji: 'a', char: 'ア', script: 'katakana', category: 'gojuuon' },
  { romaji: 'ka', char: 'カ', script: 'katakana', category: 'gojuuon' }
];

test('learning levels start at level 1 for empty progress', () => {
  const level = JapaneseLearningLevels.calculate({});

  assert.equal(level.level, 1);
  assert.equal(level.title, 'Aprendiz de Kana');
});

test('learning levels progress with study data', () => {
  const level = JapaneseLearningLevels.calculate({
    stats: { totalStudied: 40, streak: 12 },
    completion: {
      hiragana: { studied: 35, total: 46 },
      katakana: { studied: 20, total: 46 }
    },
    srsStats: { mastered: 15 },
    quizStats: { answered: 80 }
  });

  assert.ok(level.level >= 3);
  assert.ok(level.progress >= 0);
});

test('recommendation prioritizes SRS due reviews', () => {
  const recommendation = JapaneseRecommendationEngine.recommend({
    characters,
    srsStats: { due: 3, totalTracked: 3 },
    completion: {},
    studiedIds: []
  });

  assert.equal(recommendation.type, 'review');
  assert.equal(recommendation.session.reason, 'review-due');
});

test('study engine returns a valid default session without history', () => {
  const session = JapaneseStudyEngine.buildSession({
    characters,
    srsStats: { due: 0 },
    completion: {
      hiragana: { studied: 0, total: 2 },
      katakana: { studied: 0, total: 2 }
    },
    studiedIds: []
  });

  assert.equal(session.quiz.mode, 'multiple-choice');
  assert.equal(session.quiz.script, 'hiragana');
  assert.deepEqual(session.quiz.categories, ['gojuuon']);
  assert.equal(session.quiz.limit, '10');
});

test('adaptive presets expose guided trails and quick sessions', () => {
  const trail = JapaneseRecommendationEngine.getGuidedTrail('active-production');
  const quick = JapaneseRecommendationEngine.getQuickSession('active-kana');

  assert.equal(trail.quiz.mode, 'kana-typing');
  assert.equal(quick.quiz.mode, 'kana-typing');
  assert.ok(JapaneseRecommendationEngine.GUIDED_TRAILS.length >= 4);
  assert.ok(JapaneseRecommendationEngine.QUICK_SESSIONS.length >= 5);
});
