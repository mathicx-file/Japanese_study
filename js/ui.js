import { JapaneseStorage } from './storage.js';
import { JapaneseSearch } from './search.js';
import { JapaneseStrokePlayer } from './stroke-player.js';
import { JapanesePractice } from './practice.js';
import { JapaneseKanaInput } from './kana-input.js';

export const JapaneseUI = (() => {
  let currentCharacters = [];
  let currentFilters = { script: 'hiragana', category: '', onlyFavorites: false, dueReview: false };
  let currentView = 'characters';
  let dictionaryFilters = { tab: 'all', script: 'all' };
  let currentDictionaryWords = [];
  let currentIndex = 0;
  let modalOpen = false;
  let currentStrokeModel = null;

  const elements = {};

  function init() {
    elements.searchInput = document.getElementById('search-input');
    elements.filtersBar = document.getElementById('filters-bar');
    elements.grid = document.getElementById('character-grid');
    elements.modal = document.getElementById('study-modal');
    elements.modalContent = elements.modal.querySelector('.modal-content');
    elements.strokeArea = document.getElementById('stroke-player-area');
    elements.practiceArea = document.getElementById('practice-area');
    elements.practiceCanvas = document.getElementById('practice-canvas');
    elements.practiceResult = document.getElementById('practice-result');
    elements.dashboard = document.getElementById('learning-dashboard');
    elements.dashboardMetrics = document.getElementById('dashboard-metrics');
    elements.adaptiveDashboard = document.getElementById('adaptive-dashboard');
    elements.dashboardProgress = document.getElementById('dashboard-progress');
    elements.activityCalendar = document.getElementById('activity-calendar');
    elements.recentCharacters = document.getElementById('recent-characters');
    elements.viewTabs = document.querySelector('.view-tabs');
    elements.dictionarySection = document.getElementById('dictionary-section');
    elements.dictionaryGrid = document.getElementById('dictionary-grid');
    elements.dictionaryCount = document.getElementById('dictionary-count');
    elements.dictionaryToolbar = document.querySelector('.dictionary-toolbar');
    elements.quizSection = document.getElementById('quiz-section');
    elements.quizMode = document.getElementById('quiz-mode');
    elements.quizScript = document.getElementById('quiz-script');
    elements.quizCategoryFilter = document.getElementById('quiz-category-filter');
    elements.quizLimit = document.getElementById('quiz-limit');
    elements.quizIncludeReviews = document.getElementById('quiz-include-reviews');
    elements.quizCard = document.getElementById('quiz-card');
    elements.quizScore = document.getElementById('quiz-score');
    elements.studyNowBtn = document.getElementById('study-now-btn');
    elements.diagnosticBtn = document.getElementById('diagnostic-btn');
    elements.dataSection = document.getElementById('data-section');
    elements.backupExportBtn = document.getElementById('backup-export-btn');
    elements.backupFileInput = document.getElementById('backup-file-input');
    elements.backupMergeBtn = document.getElementById('backup-merge-btn');
    elements.backupReplaceBtn = document.getElementById('backup-replace-btn');
    elements.backupPreview = document.getElementById('backup-preview');
    elements.clearDataConfirm = document.getElementById('clear-data-confirm');
    elements.clearDataBtn = document.getElementById('clear-data-btn');
    elements.clearDataStatus = document.getElementById('clear-data-status');

    JapaneseStrokePlayer.init(elements.strokeArea);

    elements.modal.addEventListener('click', (e) => {
      if (e.target === elements.modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (!modalOpen) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') navigateModal(1);
      if (e.key === 'ArrowLeft') navigateModal(-1);
    });

    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    elements.grid.addEventListener('click', handleGridClick);
    elements.viewTabs.addEventListener('click', handleViewTabsClick);
    elements.dictionaryToolbar.addEventListener('click', handleDictionaryToolbarClick);
    elements.dictionaryGrid.addEventListener('click', handleDictionaryClick);
    elements.adaptiveDashboard.addEventListener('click', handleAdaptiveDashboardClick);
    elements.quizSection.addEventListener('click', handleQuizClick);
    elements.quizSection.addEventListener('input', handleQuizInput);
    elements.quizSection.addEventListener('submit', handleQuizSubmit);
    elements.quizMode.addEventListener('change', notifyQuizSettingsChange);
    elements.quizScript.addEventListener('change', notifyQuizSettingsChange);
    elements.quizCategoryFilter.addEventListener('change', notifyQuizSettingsChange);
    elements.quizLimit.addEventListener('change', notifyQuizSettingsChange);
    elements.quizIncludeReviews.addEventListener('change', notifyQuizSettingsChange);
    elements.studyNowBtn.addEventListener('click', () => {
      if (typeof onStudyNow === 'function') onStudyNow();
    });
    elements.diagnosticBtn.addEventListener('click', () => {
      if (typeof onDiagnostic === 'function') onDiagnostic();
    });
    elements.backupExportBtn.addEventListener('click', () => {
      if (typeof onBackupExport === 'function') onBackupExport();
    });
    elements.backupFileInput.addEventListener('change', () => {
      if (typeof onBackupFileSelected === 'function') onBackupFileSelected(elements.backupFileInput.files[0]);
    });
    elements.backupMergeBtn.addEventListener('click', () => {
      if (typeof onBackupImport === 'function') onBackupImport('merge');
    });
    elements.backupReplaceBtn.addEventListener('click', () => {
      if (typeof onBackupImport === 'function') onBackupImport('replace');
    });
    elements.clearDataConfirm.addEventListener('change', () => {
      elements.clearDataBtn.disabled = !elements.clearDataConfirm.checked;
      if (!elements.clearDataConfirm.checked) {
        showClearDataStatus('A exclusão só será liberada após marcar a confirmação.');
      }
    });
    elements.clearDataBtn.addEventListener('click', () => {
      if (typeof onClearData === 'function') onClearData();
    });
  }

  function setCharacters(chars) {
    currentCharacters = chars;
  }

  function getFilters() {
    return { ...currentFilters };
  }

  function getCurrentView() {
    return currentView;
  }

  function setCurrentView(view) {
    if (!['characters', 'dictionary', 'quiz', 'data'].includes(view)) return;
    currentView = view;
    updateViewTabs();
    updateViewVisibility();
  }

  function getDictionaryFilters() {
    return { ...dictionaryFilters };
  }

  function getQuizSettings() {
    const script = elements.quizScript ? elements.quizScript.value : 'all';
    const categories = getSelectedQuizCategories();
    return {
      mode: elements.quizMode ? elements.quizMode.value : 'recognition',
      script,
      categories: script === 'kanji' && !categories.includes('N5') ? [...categories, 'N5'] : categories,
      limit: elements.quizLimit ? elements.quizLimit.value : '10',
      includeMistakeReviews: elements.quizIncludeReviews ? elements.quizIncludeReviews.checked : true
    };
  }

  function applyQuizSettings(settings = {}) {
    if (elements.quizMode && settings.mode) elements.quizMode.value = settings.mode;
    if (elements.quizScript && settings.script) elements.quizScript.value = settings.script;
    if (elements.quizLimit && settings.limit) elements.quizLimit.value = String(settings.limit);
    if (elements.quizIncludeReviews && typeof settings.includeMistakeReviews === 'boolean') {
      elements.quizIncludeReviews.checked = settings.includeMistakeReviews;
    }
    if (elements.quizCategoryFilter && Array.isArray(settings.categories)) {
      const selected = new Set(settings.categories);
      elements.quizCategoryFilter.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.checked = selected.has(input.value);
      });
    }
    ensureKanjiQuizCategory();
  }

  function getSelectedQuizCategories() {
    if (!elements.quizCategoryFilter) return ['gojuuon', 'dakuon', 'handakuon', 'youon'];
    return Array.from(elements.quizCategoryFilter.querySelectorAll('input[type="checkbox"]:checked'))
      .map(input => input.value);
  }

  function setFilters(filters) {
    Object.assign(currentFilters, filters);
    updateFilterButtons();
  }

  function renderGrid(characters) {
    const grid = elements.grid;
    currentCharacters = characters || [];

    if (!characters || characters.length === 0) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-icon">\uD83D\uDD0D</div><p>Nenhum caractere encontrado</p></div>';
      return;
    }

    grid.innerHTML = '';
    const frag = document.createDocumentFragment();

    characters.forEach((char, idx) => {
      const id = JapaneseSearch.buildId(char);
      const isFav = JapaneseStorage.isFavorite(id);

      const card = document.createElement('div');
      card.className = 'character-card';
      card.dataset.index = idx;
      card.dataset.id = id;
      card.innerHTML =
        '<button class="favorite-btn ' + (isFav ? 'active' : '') + '" data-id="' + id + '" data-char="' + char.char + '" title="Favorito">' + (isFav ? '\u2605' : '\u2606') + '</button>' +
        '<div class="romaji">' + getCardSubtitle(char) + '</div>' +
        '<div class="char-display">' + char.char + '</div>' +
        '<span class="category-tag">' + getCategoryLabel(char.category) + '</span>';

      frag.appendChild(card);
    });

    grid.appendChild(frag);
  }

  function renderDictionary(words) {
    currentDictionaryWords = words || [];
    const grid = elements.dictionaryGrid;

    if (elements.dictionaryCount) {
      elements.dictionaryCount.textContent = currentDictionaryWords.length + (currentDictionaryWords.length === 1 ? ' palavra' : ' palavras');
    }

    if (!currentDictionaryWords.length) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-icon">\uD83D\uDD0D</div><p>Nenhuma palavra encontrada</p></div>';
      return;
    }

    grid.innerHTML = '';
    const frag = document.createDocumentFragment();

    currentDictionaryWords.forEach((word, index) => {
      const isFav = JapaneseStorage.isDictionaryFavorite(word.id);
      const card = document.createElement('article');
      card.className = 'dictionary-card';
      card.dataset.index = index;
      card.dataset.id = word.id;
      card.innerHTML =
        '<button class="dictionary-favorite ' + (isFav ? 'active' : '') + '" data-id="' + word.id + '" title="Favoritar palavra">' + (isFav ? '\u2605' : '\u2606') + '</button>' +
        '<div class="dictionary-word">' + word.word + '</div>' +
        '<div class="dictionary-romaji">' + (word.reading ? word.reading + ' · ' : '') + word.romaji + '</div>' +
        '<p class="dictionary-definition">' + word.definition + '</p>' +
        '<div class="dictionary-meta">' +
          '<span>' + getScriptLabel(word.script) + '</span>' +
          '<span>' + (word.category || 'geral') + '</span>' +
        '</div>';
      frag.appendChild(card);
    });

    grid.appendChild(frag);
  }

  function handleGridClick(e) {
    const favBtn = e.target.closest('.favorite-btn');
    if (favBtn) {
      e.stopPropagation();
      toggleCardFavorite(favBtn, favBtn.dataset.id);
      return;
    }

    const card = e.target.closest('.character-card');
    if (!card || !elements.grid.contains(card)) return;

    const index = Number(card.dataset.index);
    const char = currentCharacters[index];
    if (char) openModal(char, index);
  }

  function handleViewTabsClick(e) {
    const btn = e.target.closest('[data-view]');
    if (!btn) return;

    currentView = btn.dataset.view;
    updateViewTabs();
    updateViewVisibility();
    if (typeof onViewChange === 'function') onViewChange(currentView);
  }

  function handleDictionaryToolbarClick(e) {
    const tabBtn = e.target.closest('[data-dictionary-tab]');
    if (tabBtn) {
      dictionaryFilters.tab = tabBtn.dataset.dictionaryTab;
      updateDictionaryControls();
      if (typeof onDictionaryFilterChange === 'function') onDictionaryFilterChange();
      return;
    }

    const scriptBtn = e.target.closest('[data-dictionary-script]');
    if (scriptBtn) {
      dictionaryFilters.script = scriptBtn.dataset.dictionaryScript;
      updateDictionaryControls();
      if (typeof onDictionaryFilterChange === 'function') onDictionaryFilterChange();
    }
  }

  function handleDictionaryClick(e) {
    const favBtn = e.target.closest('.dictionary-favorite');
    if (favBtn) {
      e.stopPropagation();
      toggleDictionaryFavorite(favBtn, favBtn.dataset.id);
      return;
    }

    const card = e.target.closest('.dictionary-card');
    if (!card || !elements.dictionaryGrid.contains(card)) return;

    const index = Number(card.dataset.index);
    const word = currentDictionaryWords[index];
    if (!word) return;

    JapaneseStorage.markDictionaryViewed(word).then(() => {
      JapaneseStorage.emitChange('dictionary-history-updated', { wordId: word.id });
    }).catch(() => {});

    card.classList.add('viewed');
  }

  function handleAdaptiveDashboardClick(e) {
    const trailBtn = e.target.closest('[data-guided-trail]');
    if (trailBtn) {
      if (typeof onGuidedTrail === 'function') onGuidedTrail(trailBtn.dataset.guidedTrail);
      return;
    }

    const quickBtn = e.target.closest('[data-quick-session]');
    if (quickBtn) {
      if (typeof onQuickSession === 'function') onQuickSession(quickBtn.dataset.quickSession);
    }
  }

  function toggleDictionaryFavorite(btn, id) {
    const result = JapaneseStorage.toggleDictionaryFavorite(id);
    btn.classList.toggle('active', result.added);
    btn.textContent = result.added ? '\u2605' : '\u2606';
    JapaneseStorage.emitChange(
      result.added ? 'dictionary-favorite-added' : 'dictionary-favorite-removed',
      { wordId: id }
    );
  }

  function handleQuizClick(e) {
    const answerBtn = e.target.closest('[data-quiz-answer]');
    if (answerBtn) {
      if (answerBtn.disabled) return;
      if (typeof onQuizAnswer === 'function') onQuizAnswer(answerBtn.dataset.quizAnswer);
      return;
    }

    const actionBtn = e.target.closest('[data-quiz-action]');
    if (!actionBtn) return;

    if (actionBtn.dataset.quizAction === 'next' && typeof onQuizNext === 'function') {
      onQuizNext();
    }
    if (actionBtn.dataset.quizAction === 'reveal' && typeof onQuizReveal === 'function') {
      onQuizReveal();
    }
    if (actionBtn.dataset.quizAction === 'reset' && typeof onQuizReset === 'function') {
      onQuizReset();
    }
  }

  function handleQuizInput(e) {
    const input = e.target.closest('[data-kana-input]');
    if (!input || input.disabled) return;

    const converted = JapaneseKanaInput.convertRomajiToKana(input.value, input.dataset.kanaInput);
    if (converted === input.value) return;

    input.value = converted;
    const end = input.value.length;
    input.setSelectionRange(end, end);
  }

  function handleQuizSubmit(e) {
    if (!e.target.classList.contains('quiz-answer-form')) return;
    e.preventDefault();
    const input = e.target.querySelector('[name="quiz-answer"]');
    if (!input || input.disabled) return;
    if (input.dataset.kanaInput) {
      input.value = JapaneseKanaInput.convertRomajiToKana(input.value, input.dataset.kanaInput, { finalizeN: true });
    }
    if (input && typeof onQuizAnswer === 'function') {
      onQuizAnswer(input.value);
    }
  }

  function notifyQuizSettingsChange() {
    ensureKanjiQuizCategory();
    if (typeof onQuizSettingsChange === 'function') onQuizSettingsChange(getQuizSettings());
  }

  function ensureKanjiQuizCategory() {
    if (!elements.quizScript || !elements.quizCategoryFilter) return;
    if (elements.quizScript.value !== 'kanji') return;
    const kanjiCategory = elements.quizCategoryFilter.querySelector('input[value="N5"]');
    if (kanjiCategory) kanjiCategory.checked = true;
  }

  function renderQuiz(question, stats, result, context) {
    if (!elements.quizCard) return;
    updateQuizScore(stats);
    const contextHtml = renderQuizContext(context);

    if (!question) {
      elements.quizCard.innerHTML = contextHtml + '<div class="empty-state"><p>Nenhum caractere dispon\u00edvel para o quiz.</p></div>';
      return;
    }

    if (question.type === 'complete') {
      elements.quizCard.innerHTML =
        contextHtml +
        '<div class="quiz-prompt-wrap">' +
          '<div class="quiz-instruction">' + question.instruction + '</div>' +
          '<div class="quiz-complete-title">Sess\u00e3o conclu\u00edda</div>' +
          '<div class="quiz-complete-detail">' + (stats.correct || 0) + ' acertos em ' + (stats.answered || 0) + ' respostas.</div>' +
        '</div>' +
        '<div class="quiz-actions">' +
          '<button class="quiz-secondary-btn" data-quiz-action="reset">Nova sess\u00e3o</button>' +
        '</div>';
      return;
    }

    const feedback = result ? renderQuizFeedback(result) : '';
    const body = question.type === 'typing'
      ? renderTypingQuestion(question)
      : question.type === 'flashcard'
        ? renderFlashcardQuestion(question)
        : renderChoiceQuestion(question);

    elements.quizCard.innerHTML =
      contextHtml +
      '<div class="quiz-prompt-wrap">' +
        (question.review ? '<div class="quiz-review-pill">Revis\u00e3o</div>' : '') +
        '<div class="quiz-instruction">' + question.instruction + '</div>' +
        '<div class="quiz-prompt">' + question.prompt + '</div>' +
      '</div>' +
      body +
      feedback +
      '<div class="quiz-actions">' +
        '<button class="quiz-secondary-btn" data-quiz-action="reset">Zerar placar</button>' +
        '<button class="quiz-next-btn" data-quiz-action="next">Pr\u00f3xima</button>' +
      '</div>';
  }

  function renderQuizContext(context) {
    if (!context || !context.title) return '';
    const type = context.type === 'diagnostic' ? 'diagnostic' : 'recommended';
    const label = type === 'diagnostic' ? 'Diagn\u00f3stico' : 'Estudo recomendado';
    return '<div class="quiz-session-context ' + type + '">' +
      '<div class="quiz-session-label">' + label + '</div>' +
      '<strong>' + context.title + '</strong>' +
      (context.description ? '<p>' + context.description + '</p>' : '') +
    '</div>';
  }

  function updateQuizScore(stats = {}) {
    if (!elements.quizScore) return;
    elements.quizScore.textContent =
      (stats.asked || 0) + '/' + (stats.limit || 10) + ' perguntas' +
      ' \u00b7 ' + (stats.correct || 0) + '/' + (stats.answered || 0) +
      ' \u00b7 ' + (stats.accuracy || 0) + '%';
  }

  function renderChoiceQuestion(question) {
    return '<div class="quiz-options">' + question.options.map(option =>
      '<button class="quiz-option" data-quiz-answer="' + option + '"' + (question.answered ? ' disabled' : '') + '>' + option + '</button>'
    ).join('') + '</div>';
  }

  function renderTypingQuestion(question) {
    const isKanaTyping = question.mode === 'kana-typing';
    const script = question.target?.script === 'katakana' ? 'katakana' : 'hiragana';
    const placeholder = isKanaTyping ? 'Digite romaji: ka, shi, kya...' : 'Digite a resposta...';

    return '<form class="quiz-answer-form">' +
      '<input name="quiz-answer" autocomplete="off" placeholder="' + placeholder + '"' +
        (isKanaTyping ? ' data-kana-input="' + script + '"' : '') +
        (question.answered ? ' disabled' : '') + ' />' +
      '<button class="quiz-next-btn" type="submit"' + (question.answered ? ' disabled' : '') + '>Verificar</button>' +
    '</form>' +
    (isKanaTyping ? '<p class="kana-input-hint">Digite em romaji no teclado f\u00edsico. Ex.: ka vira ' + (script === 'katakana' ? '\u30ab' : '\u304b') + '.</p>' : '');
  }

  function renderKanaKeyboard(question) {
    const script = question.target?.script === 'katakana' ? 'katakana' : 'hiragana';
    const rows = getKanaKeyboardRows(script);

    return '<div class="kana-keyboard" aria-label="Teclado japon\u00eas virtual">' +
      '<div class="kana-keyboard-header">' +
        '<span>Teclado ' + getScriptLabel(script) + '</span>' +
        '<div class="kana-keyboard-actions">' +
          '<button type="button" data-kana-action="backspace">Apagar</button>' +
          '<button type="button" data-kana-action="clear">Limpar</button>' +
        '</div>' +
      '</div>' +
      rows.map(row =>
        '<div class="kana-keyboard-row">' + row.map(kana =>
          kana
            ? '<button type="button" class="kana-key" data-kana-key="' + kana + '">' + kana + '</button>'
            : '<span class="kana-key spacer"></span>'
        ).join('') + '</div>'
      ).join('') +
    '</div>';
  }

  function getKanaKeyboardRows(script) {
    if (script === 'katakana') {
      return [
        ['ア', 'イ', 'ウ', 'エ', 'オ'],
        ['カ', 'キ', 'ク', 'ケ', 'コ'],
        ['サ', 'シ', 'ス', 'セ', 'ソ'],
        ['タ', 'チ', 'ツ', 'テ', 'ト'],
        ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
        ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
        ['マ', 'ミ', 'ム', 'メ', 'モ'],
        ['ヤ', '', 'ユ', '', 'ヨ'],
        ['ラ', 'リ', 'ル', 'レ', 'ロ'],
        ['ワ', '', 'ヲ', '', 'ン'],
        ['ガ', 'ギ', 'グ', 'ゲ', 'ゴ'],
        ['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ'],
        ['ダ', 'ヂ', 'ヅ', 'デ', 'ド'],
        ['バ', 'ビ', 'ブ', 'ベ', 'ボ'],
        ['パ', 'ピ', 'プ', 'ペ', 'ポ'],
        ['ャ', 'ュ', 'ョ', 'ッ', 'ー']
      ];
    }

    return [
      ['あ', 'い', 'う', 'え', 'お'],
      ['か', 'き', 'く', 'け', 'こ'],
      ['さ', 'し', 'す', 'せ', 'そ'],
      ['た', 'ち', 'つ', 'て', 'と'],
      ['な', 'に', 'ぬ', 'ね', 'の'],
      ['は', 'ひ', 'ふ', 'へ', 'ほ'],
      ['ま', 'み', 'む', 'め', 'も'],
      ['や', '', 'ゆ', '', 'よ'],
      ['ら', 'り', 'る', 'れ', 'ろ'],
      ['わ', '', 'を', '', 'ん'],
      ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
      ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
      ['だ', 'ぢ', 'づ', 'で', 'ど'],
      ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
      ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
      ['ゃ', 'ゅ', 'ょ', 'っ', 'ー']
    ];
  }

  function renderFlashcardQuestion(question) {
    if (question.revealed) {
      return '<div class="quiz-flash-answer">' + question.answer + '</div>';
    }
    return '<button class="quiz-reveal-btn" data-quiz-action="reveal">Revelar resposta</button>';
  }

  function renderQuizFeedback(result) {
    if (result.empty) {
      return '<div class="quiz-feedback warning">Digite uma resposta antes de verificar.</div>';
    }
    const cls = result.correct ? 'correct' : 'wrong';
    const text = result.correct ? 'Correto!' : 'Resposta correta: ' + result.expected;
    return '<div class="quiz-feedback ' + cls + '">' + text + '</div>';
  }

  function updateViewTabs() {
    elements.viewTabs.querySelectorAll('[data-view]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === currentView);
    });
  }

  function updateViewVisibility() {
    const dictionaryOpen = currentView === 'dictionary';
    const quizOpen = currentView === 'quiz';
    const dataOpen = currentView === 'data';
    elements.dictionarySection.style.display = dictionaryOpen ? '' : 'none';
    elements.quizSection.style.display = quizOpen ? '' : 'none';
    elements.dataSection.style.display = dataOpen ? '' : 'none';
    elements.filtersBar.style.display = (dictionaryOpen || quizOpen || dataOpen) ? 'none' : '';
    elements.dashboard.style.display = (dictionaryOpen || quizOpen || dataOpen) ? 'none' : '';
    elements.grid.style.display = (dictionaryOpen || quizOpen || dataOpen) ? 'none' : '';
    elements.searchInput.placeholder = dictionaryOpen
      ? 'Buscar palavra, leitura, romaji ou defini\u00e7\u00e3o...'
      : quizOpen
        ? 'O quiz usa os filtros pr\u00f3prios abaixo...'
        : dataOpen
          ? 'Backup não usa busca...'
          : 'Buscar por romaji, kana, kanji, leitura ou significado...';
  }

  function updateDictionaryControls() {
    elements.dictionaryToolbar.querySelectorAll('[data-dictionary-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.dictionaryTab === dictionaryFilters.tab);
    });
    elements.dictionaryToolbar.querySelectorAll('[data-dictionary-script]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.dictionaryScript === dictionaryFilters.script);
    });
  }

  function updateCardFavoriteState(charId) {
    const isFav = JapaneseStorage.isFavorite(charId);
    const btn = elements.grid.querySelector('.favorite-btn[data-id="' + charId + '"]');
    if (btn) {
      btn.classList.toggle('active', isFav);
      btn.textContent = isFav ? '\u2605' : '\u2606';
    }
  }

  function toggleCardFavorite(btn, id) {
    const result = JapaneseStorage.toggleFavorite(id);
    btn.classList.toggle('active', result.added);
    btn.textContent = result.added ? '\u2605' : '\u2606';
    JapaneseStorage.emitChange(
      result.added ? 'favorite-added' : 'favorite-removed',
      { charId: id }
    );
    sendHostMessage(result.added ? 'favorite-added' : 'favorite-removed', { charId: id });
  }

  function renderFilters(categories, activeCategory) {
    const bar = elements.filtersBar;
    bar.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn ' + (activeCategory === '' ? 'active' : '');
    allBtn.dataset.filter = '';
    allBtn.textContent = 'Todos';
    allBtn.addEventListener('click', () => {
      currentFilters.category = '';
      updateFilterButtons();
      if (typeof onFilterChange === 'function') onFilterChange();
    });
    bar.appendChild(allBtn);

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn ' + (activeCategory === cat ? 'active' : '');
      btn.dataset.filter = cat;
      btn.textContent = getCategoryLabel(cat);
      btn.addEventListener('click', () => {
        currentFilters.category = cat;
        updateFilterButtons();
        if (typeof onFilterChange === 'function') onFilterChange();
      });
      bar.appendChild(btn);
    });

    const favFilterBtn = document.createElement('button');
    favFilterBtn.className = 'filter-btn fav-btn ' + (currentFilters.onlyFavorites ? 'active' : '');
    favFilterBtn.textContent = '\u2605 Favoritos';
    favFilterBtn.addEventListener('click', () => {
      currentFilters.onlyFavorites = !currentFilters.onlyFavorites;
      updateFilterButtons();
      if (typeof onFilterChange === 'function') onFilterChange();
    });
    bar.appendChild(favFilterBtn);

    const dueFilterBtn = document.createElement('button');
    dueFilterBtn.className = 'filter-btn review-btn ' + (currentFilters.dueReview ? 'active' : '');
    dueFilterBtn.textContent = 'Revisar hoje';
    dueFilterBtn.addEventListener('click', () => {
      currentFilters.dueReview = !currentFilters.dueReview;
      updateFilterButtons();
      if (typeof onFilterChange === 'function') onFilterChange();
    });
    bar.appendChild(dueFilterBtn);

    const scriptBtn = document.createElement('button');
    scriptBtn.className = 'filter-btn';
    scriptBtn.dataset.scriptToggle = 'true';
    scriptBtn.textContent = getNextScriptToggleLabel();
    scriptBtn.addEventListener('click', () => {
      currentFilters.script = getNextScript(currentFilters.script);
      updateFilterButtons();
      if (typeof onFilterChange === 'function') onFilterChange();
    });
    bar.appendChild(scriptBtn);
  }

  function getNextScript(script) {
    if (script === 'hiragana') return 'katakana';
    if (script === 'katakana') return 'kanji';
    return 'hiragana';
  }

  function getNextScriptToggleLabel() {
    const next = getNextScript(currentFilters.script);
    return '\u2192 ' + getScriptLabel(next);
  }

  let onFilterChange = null;
  let onViewChange = null;
  let onDictionaryFilterChange = null;
  let onQuizSettingsChange = null;
  let onQuizAnswer = null;
  let onQuizNext = null;
  let onQuizReveal = null;
  let onQuizReset = null;
  let onBackupExport = null;
  let onBackupFileSelected = null;
  let onBackupImport = null;
  let onClearData = null;
  let onStudyNow = null;
  let onDiagnostic = null;
  let onGuidedTrail = null;
  let onQuickSession = null;

  function onFilterChangeCallback(cb) {
    onFilterChange = cb;
  }

  function onViewChangeCallback(cb) {
    onViewChange = cb;
  }

  function onDictionaryFilterChangeCallback(cb) {
    onDictionaryFilterChange = cb;
  }

  function onQuizSettingsChangeCallback(cb) {
    onQuizSettingsChange = cb;
  }

  function onQuizAnswerCallback(cb) {
    onQuizAnswer = cb;
  }

  function onQuizNextCallback(cb) {
    onQuizNext = cb;
  }

  function onQuizRevealCallback(cb) {
    onQuizReveal = cb;
  }

  function onQuizResetCallback(cb) {
    onQuizReset = cb;
  }

  function onBackupExportCallback(cb) {
    onBackupExport = cb;
  }

  function onBackupFileSelectedCallback(cb) {
    onBackupFileSelected = cb;
  }

  function onBackupImportCallback(cb) {
    onBackupImport = cb;
  }

  function onClearDataCallback(cb) {
    onClearData = cb;
  }

  function onStudyNowCallback(cb) {
    onStudyNow = cb;
  }

  function onDiagnosticCallback(cb) {
    onDiagnostic = cb;
  }

  function onGuidedTrailCallback(cb) {
    onGuidedTrail = cb;
  }

  function onQuickSessionCallback(cb) {
    onQuickSession = cb;
  }

  function updateBackupPreview(validation, fileName = '') {
    if (!elements.backupPreview) return;
    elements.backupPreview.textContent = '';

    if (!validation) {
      elements.backupPreview.textContent = 'Nenhum arquivo selecionado.';
      elements.backupMergeBtn.disabled = true;
      elements.backupReplaceBtn.disabled = true;
      return;
    }

    if (!validation.ok) {
      const title = document.createElement('strong');
      title.textContent = 'Backup inválido';
      const list = document.createElement('ul');
      validation.errors.forEach(error => {
        const item = document.createElement('li');
        item.textContent = error;
        list.appendChild(item);
      });
      elements.backupPreview.append(title, list);
      elements.backupMergeBtn.disabled = true;
      elements.backupReplaceBtn.disabled = true;
      return;
    }

    const summary = validation.summary || {};
    const title = document.createElement('strong');
    title.textContent = fileName || 'Backup válido';
    const details = document.createElement('div');
    details.className = 'backup-summary';
    [
      (summary.favorites || 0) + ' favoritos',
      (summary.dictionaryFavorites || 0) + ' palavras favoritas',
      (summary.progress || 0) + ' registros',
      (summary.srs || 0) + ' itens SRS'
    ].forEach(text => {
      const pill = document.createElement('span');
      pill.textContent = text;
      details.appendChild(pill);
    });
    elements.backupPreview.append(title, details);
    elements.backupMergeBtn.disabled = false;
    elements.backupReplaceBtn.disabled = false;
  }

  function showBackupStatus(message, type = 'info') {
    if (!elements.backupPreview) return;
    elements.backupPreview.textContent = '';
    const status = document.createElement('div');
    status.className = 'backup-status ' + type;
    status.textContent = message;
    elements.backupPreview.appendChild(status);
    if (type === 'success') {
      elements.backupFileInput.value = '';
      elements.backupMergeBtn.disabled = true;
      elements.backupReplaceBtn.disabled = true;
    }
  }

  function resetClearDataConfirmation() {
    if (!elements.clearDataConfirm || !elements.clearDataBtn) return;
    elements.clearDataConfirm.checked = false;
    elements.clearDataBtn.disabled = true;
  }

  function showClearDataStatus(message, type = 'info') {
    if (!elements.clearDataStatus) return;
    elements.clearDataStatus.textContent = '';
    const status = document.createElement('div');
    status.className = 'backup-status ' + type;
    status.textContent = message;
    elements.clearDataStatus.appendChild(status);
  }

  function updateFilterButtons() {
    const bar = elements.filtersBar;
    bar.querySelectorAll('.filter-btn').forEach(btn => {
      if (btn.dataset.filter !== undefined) {
        btn.classList.toggle('active', btn.dataset.filter === currentFilters.category);
      }
      if (btn.classList.contains('fav-btn')) {
        btn.classList.toggle('active', currentFilters.onlyFavorites);
      }
      if (btn.classList.contains('review-btn')) {
        btn.classList.toggle('active', currentFilters.dueReview);
      }
      if (btn.dataset.scriptToggle) {
        btn.textContent = getNextScriptToggleLabel();
      }
    });
  }

  function getCardSubtitle(char) {
    if (char?.script === 'kanji') {
      return (char.meanings || []).slice(0, 2).join(', ') || char.level || 'Kanji';
    }
    return char.romaji || '';
  }

  function getReadingSummary(char) {
    if (char?.script !== 'kanji') return char.romaji || '';
    const readings = [
      ...(char.onyomi || []),
      ...(char.kunyomi || [])
    ];
    return readings.length ? readings.join(' / ') : (char.meanings || []).join(', ');
  }

  function getMeaningSummary(char) {
    return (char.meanings || []).join(', ');
  }

  function getCategoryLabel(cat) {
    const labels = {
      'gojuuon': 'Gojuuon',
      'dakuon': 'Dakuon',
      'handakuon': 'Handakuon',
      'youon': 'Youon',
      'N5': 'Kanji N5'
    };
    return labels[cat] || cat;
  }

  function getScriptLabel(script) {
    if (script === 'hiragana') return 'Hiragana';
    if (script === 'katakana') return 'Katakana';
    if (script === 'kanji') return 'Kanji';
    return script || 'Geral';
  }

  async function openModal(char, index) {
    currentIndex = index;
    modalOpen = true;
    elements.modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    markCharacterViewed(char);
    sendHostMessage('study-progress', {
      charId: JapaneseSearch.buildId(char),
      char: char.char,
      romaji: char.romaji
    });

    const header = elements.modalContent.querySelector('.modal-header');
    if (!header) {
      const h = document.createElement('div');
      h.className = 'modal-header';
      elements.modalContent.insertBefore(h, elements.strokeArea);
    }
    renderModalDetails(char);

    renderMnemonicSection(char);
    renderExamplesSection(char);

    let nav = elements.modalContent.querySelector('.modal-nav');
    if (!nav) {
      nav = document.createElement('div');
      nav.className = 'modal-nav';
      elements.modalContent.appendChild(nav);
    }
    nav.innerHTML =
      '<button class="modal-nav-btn" data-nav="prev">\u2039 Anterior</button>' +
      '<button class="modal-nav-btn" data-nav="practice">\u270D Praticar</button>' +
      '<button class="modal-nav-btn" data-nav="next">Pr\u00f3ximo \u203A</button>';

    renderSrsSection(char);

    nav.querySelector('[data-nav="prev"]').addEventListener('click', () => navigateModal(-1));
    nav.querySelector('[data-nav="next"]').addEventListener('click', () => navigateModal(1));
    nav.querySelector('[data-nav="practice"]').addEventListener('click', () => openPractice());

    currentStrokeModel = await JapaneseStrokePlayer.loadCharacter(char.unicode);
  }

  async function navigateModal(direction) {
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = currentCharacters.length - 1;
    if (currentIndex >= currentCharacters.length) currentIndex = 0;
    const char = currentCharacters[currentIndex];
    if (char) {
      elements.practiceArea.style.display = 'none';
      renderModalDetails(char);
      renderMnemonicSection(char);
      renderExamplesSection(char);
      renderSrsSection(char);
      markCharacterViewed(char);
      sendHostMessage('study-progress', {
        charId: JapaneseSearch.buildId(char),
        char: char.char,
        romaji: char.romaji
      });
      currentStrokeModel = await JapaneseStrokePlayer.loadCharacter(char.unicode);
    }
  }

  function renderModalDetails(char) {
    const header = elements.modalContent.querySelector('.modal-header');
    if (header) {
      header.innerHTML =
        '<div class="modal-char">' + char.char + '</div>' +
        '<div class="modal-romaji">' + getReadingSummary(char) + '</div>' +
        (char.script === 'kanji' ? '<div class="modal-kanji-meaning">' + getMeaningSummary(char) + '</div>' : '');
    }

    let meta = elements.modalContent.querySelector('.modal-meta');
    if (!meta) {
      meta = document.createElement('div');
      meta.className = 'modal-meta';
      elements.modalContent.insertBefore(meta, elements.strokeArea);
    }

    if (char.script === 'kanji') {
      meta.innerHTML =
        '<div class="modal-meta-item"><strong>' + (char.level || 'N5') + '</strong>Nível</div>' +
        '<div class="modal-meta-item"><strong>' + char.strokes + '</strong>Tra\u00e7os</div>' +
        '<div class="modal-meta-item"><strong>' + (char.radical || '-') + '</strong>Radical</div>' +
        '<div class="modal-meta-item"><strong>' + (char.components || []).join(' ') + '</strong>Componentes</div>';
      renderKanjiReadings(char);
      return;
    }

    removeKanjiReadings();
    meta.innerHTML =
      '<div class="modal-meta-item"><strong>' + getCategoryLabel(char.category) + '</strong>Categoria</div>' +
      '<div class="modal-meta-item"><strong>' + char.strokes + '</strong>Tra\u00e7os</div>';
  }

  function renderKanjiReadings(char) {
    let section = elements.modalContent.querySelector('.kanji-readings-section');
    if (!section) {
      section = document.createElement('div');
      section.className = 'kanji-readings-section';
      elements.modalContent.insertBefore(section, elements.strokeArea);
    }

    section.innerHTML =
      '<div class="kanji-reading-row"><strong>Onyomi</strong><span>' + ((char.onyomi || []).join(' / ') || '-') + '</span></div>' +
      '<div class="kanji-reading-row"><strong>Kunyomi</strong><span>' + ((char.kunyomi || []).join(' / ') || '-') + '</span></div>' +
      '<div class="kanji-reading-row"><strong>Tags</strong><span>' + ((char.tags || []).join(', ') || '-') + '</span></div>';
  }

  function removeKanjiReadings() {
    const section = elements.modalContent.querySelector('.kanji-readings-section');
    if (section) section.remove();
  }

  function renderExamplesSection(char) {
    let examples = elements.modalContent.querySelector('.examples-section');
    if (char.examples && char.examples.length > 0) {
      if (!examples) {
        examples = document.createElement('div');
        examples.className = 'examples-section';
        elements.modalContent.appendChild(examples);
      }
      examples.innerHTML =
        '<h3>\uD83D\uDCD6 Palavras de Exemplo</h3>' +
        char.examples.map(ex =>
          '<div class="example-item"><span class="example-word">' + ex.word + '</span><span class="example-meaning">' + getExampleDetail(ex, char) + '</span></div>'
        ).join('');
    } else if (examples) {
      examples.remove();
    }
  }

  function getExampleDetail(example, char) {
    if (char.script === 'kanji') {
      return [example.reading, example.romaji, example.meaning].filter(Boolean).join(' - ');
    }
    return example.meaning || '';
  }

  function renderMnemonicSection(char) {
    let section = elements.modalContent.querySelector('.mnemonic-section');
    if (!section) {
      section = document.createElement('div');
      section.className = 'mnemonic-section';
      elements.modalContent.insertBefore(section, elements.strokeArea);
    }

    const charId = JapaneseSearch.buildId(char);
    const mnemonic = JapaneseStorage.getMnemonic(charId);
    section.innerHTML =
      '<label class="mnemonic-label" for="mnemonic-note">Mnem\u00f4nico pessoal</label>' +
      '<textarea id="mnemonic-note" class="mnemonic-note" maxlength="500" rows="2" placeholder="Ex.: parece com...">' + escapeHtml(mnemonic) + '</textarea>';

    const textarea = section.querySelector('.mnemonic-note');
    const save = () => {
      JapaneseStorage.setMnemonic(charId, textarea.value);
      JapaneseStorage.emitChange('mnemonic-updated', { charId });
    };
    textarea.addEventListener('input', save);
    textarea.addEventListener('change', save);
    textarea.addEventListener('blur', save);
  }

  function openPractice() {
    const char = currentCharacters[currentIndex];
    if (!char) return;

    elements.practiceArea.style.display = 'block';
    JapanesePractice.init(elements.practiceCanvas);
    JapanesePractice.startPractice({
      char: char.char,
      romaji: char.romaji || getMeaningSummary(char),
      unicode: char.unicode,
      strokes: char.strokes
    }, currentStrokeModel);

    const existingResult = elements.practiceResult;
    existingResult.textContent = '';
    existingResult.className = 'practice-result';
    existingResult.style.display = 'none';

    let controls = elements.practiceArea.querySelector('.practice-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'practice-controls';
      elements.practiceArea.appendChild(controls);
    }
    controls.innerHTML =
      '<button class="practice-btn" data-action="clear">Limpar</button>' +
      '<button class="practice-btn primary" data-action="check">Verificar</button>';

    controls.querySelector('[data-action="clear"]').addEventListener('click', () => {
      JapanesePractice.clearCanvas();
      existingResult.style.display = 'none';
    });

    controls.querySelector('[data-action="check"]').addEventListener('click', () => {
      const result = JapanesePractice.compare();
      existingResult.textContent = result.message;
      existingResult.className = 'practice-result ' + result.rating;
      existingResult.style.display = 'block';
    });
  }
  function renderSrsSection(char) {
    let section = elements.modalContent.querySelector('.srs-section');
    if (!section) {
      section = document.createElement('div');
      section.className = 'srs-section';
    }

    const nav = elements.modalContent.querySelector('.modal-nav');
    if (nav) {
      elements.modalContent.insertBefore(section, nav);
    } else {
      elements.modalContent.appendChild(section);
    }

    const charId = JapaneseSearch.buildId(char);
    const status = JapaneseStorage.getSrsStatus(charId);
    section.innerHTML =
      '<div class="srs-header">' +
        '<div><h3>SRS</h3><p>' + getSrsStateLabel(status.state) + ' \u00b7 pr\u00f3xima revis\u00e3o: ' + formatSrsDate(status.nextReview) + '</p></div>' +
        '<span class="srs-pill">' + (status.interval || 0) + 'd</span>' +
      '</div>' +
      '<div class="srs-controls">' +
        '<button class="srs-btn" data-srs-rating="hard">Dif\u00edcil</button>' +
        '<button class="srs-btn primary" data-srs-rating="good">Bom</button>' +
        '<button class="srs-btn" data-srs-rating="easy">F\u00e1cil</button>' +
      '</div>';

    section.querySelectorAll('[data-srs-rating]').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = JapaneseStorage.reviewSrs({
          id: charId,
          char: char.char,
          romaji: char.romaji,
          script: char.script,
          category: char.category,
          meanings: char.meanings,
          onyomi: char.onyomi,
          kunyomi: char.kunyomi,
          level: char.level
        }, btn.dataset.srsRating);
        JapaneseStorage.emitChange('srs-updated', { charId, status: next });
        renderSrsSection(char);
      });
    });
  }

  function getSrsStateLabel(state) {
    const labels = {
      new: 'Novo',
      learning: 'Aprendendo',
      review: 'Revis\u00e3o',
      mastered: 'Dominado'
    };
    return labels[state] || 'Novo';
  }

  function formatSrsDate(dateKey) {
    if (!dateKey) return 'hoje';
    const today = getDayKey(new Date());
    if (dateKey <= today) return 'hoje';
    const parts = dateKey.split('-');
    return parts.length === 3 ? parts[2] + '/' + parts[1] : dateKey;
  }

  function closeModal() {
    modalOpen = false;
    elements.modal.classList.remove('open');
    document.body.style.overflow = '';
    elements.practiceArea.style.display = 'none';
  }

  function sendHostMessage(type, payload) {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type, payload }, '*');
      }
    } catch {}
  }

  function markCharacterViewed(char) {
    JapaneseStorage.markAsViewed({
      id: JapaneseSearch.buildId(char),
      char: char.char,
      romaji: char.romaji,
      script: char.script,
      category: char.category,
      meanings: char.meanings,
      onyomi: char.onyomi,
      kunyomi: char.kunyomi,
      level: char.level
    }).then(() => {
      JapaneseStorage.emitChange('progress-updated', { charId: JapaneseSearch.buildId(char) });
    }).catch(() => {});
  }

  function updateStats(stats) {
    const bar = document.getElementById('stats-bar');
    if (!bar) return;
    bar.innerHTML =
      '<div class="stat-item">\uD83D\uDCDA <span class="stat-value">' + (stats.totalChars || 0) + '</span> caracteres</div>' +
      '<div class="stat-item">\u2B50 <span class="stat-value">' + (stats.favorites || 0) + '</span> favoritos</div>' +
      '<div class="stat-item">\uD83D\uDCD6 <span class="stat-value">' + (stats.studied || 0) + '</span> estudados</div>';
  }

  function updateDashboard(data) {
    if (!elements.dashboard) return;

    const stats = data.stats || {};
    const srsStats = data.srsStats || {};
    const completion = data.completion || {};
    const recent = stats.recent || [];
    const activity = stats.activity || {};
    const level = data.level || {};
    const recommendation = data.recommendation || {};
    const difficulty = data.difficulty || [];
    const syllabus = data.syllabus || [];
    const guidedTrails = data.guidedTrails || [];
    const quickSessions = data.quickSessions || [];

    elements.dashboardMetrics.innerHTML =
      renderMetric('Estudados', stats.totalStudied || 0, 'caracteres unicos') +
      renderMetric('Tempo total', formatStudyTime(stats.studyTime || 0), 'minutos registrados') +
      renderMetric('Revis\u00f5es hoje', srsStats.due || 0, 'pendentes no SRS') +
      renderMetric('Dominados', srsStats.mastered || 0, 'caracteres') +
      renderMetric('Kanji N5', (completion.kanji?.studied || 0) + '/' + (completion.kanji?.total || 0), 'estudados');

    elements.dashboardProgress.innerHTML =
      renderProgressRow('Hiragana', completion.hiragana || {}) +
      renderProgressRow('Katakana', completion.katakana || {}) +
      renderProgressRow('Kanji N5 inicial', completion.kanji || {});

    elements.activityCalendar.innerHTML = renderActivityCalendar(activity);
    elements.recentCharacters.innerHTML = renderRecentCharacters(recent);
    elements.adaptiveDashboard.innerHTML = renderAdaptiveDashboard(level, recommendation, difficulty, syllabus, guidedTrails, quickSessions);
  }

  function renderAdaptiveDashboard(level, recommendation, difficulty, syllabus, guidedTrails, quickSessions) {
    return (
      '<section class="adaptive-card level-card">' +
        '<div class="adaptive-label">Nível atual</div>' +
        '<h3>Nível ' + (level.level || 1) + ' — ' + (level.title || 'Aprendiz de Kana') + '</h3>' +
        '<div class="progress-track"><div class="progress-fill" style="width:' + (level.progress || 0) + '%"></div></div>' +
        '<p>' + (level.hint || 'Comece pelo Gojuuon de hiragana.') + '</p>' +
      '</section>' +
      '<section class="adaptive-card next-step-card">' +
        '<div class="adaptive-label">Próximo passo</div>' +
        '<h3>' + (recommendation.title || 'Começar por hiragana básico') + '</h3>' +
        '<p>' + (recommendation.description || 'Faça uma sessão curta para iniciar seu histórico.') + '</p>' +
      '</section>' +
      '<section class="adaptive-card syllabus-card">' +
        '<div class="adaptive-label">Ementa</div>' +
        '<ol>' + syllabus.slice(0, 9).map(item => '<li>' + item.title + '</li>').join('') + '</ol>' +
      '</section>' +
      '<section class="adaptive-card difficulty-card">' +
        '<div class="adaptive-label">Mapa de dificuldades</div>' +
        renderDifficultyList(difficulty) +
      '</section>' +
      '<section class="adaptive-card guided-card">' +
        '<div class="adaptive-label">Trilhas guiadas</div>' +
        renderGuidedTrails(guidedTrails) +
      '</section>' +
      '<section class="adaptive-card quick-card">' +
        '<div class="adaptive-label">Sess\u00f5es r\u00e1pidas</div>' +
        renderQuickSessions(quickSessions) +
      '</section>'
    );
  }

  function renderGuidedTrails(items) {
    if (!items || items.length === 0) return '<p>Nenhuma trilha dispon\u00edvel.</p>';
    return '<div class="guided-list">' + items.slice(0, 5).map(item =>
      '<button class="guided-action" type="button" data-guided-trail="' + item.id + '">' +
        '<strong>' + item.title + '</strong>' +
        '<span>' + (item.description || 'Sess\u00e3o guiada curta.') + '</span>' +
      '</button>'
    ).join('') + '</div>';
  }

  function renderQuickSessions(items) {
    if (!items || items.length === 0) return '<p>Nenhuma sess\u00e3o dispon\u00edvel.</p>';
    return '<div class="quick-session-list">' + items.slice(0, 6).map(item =>
      '<button class="quick-session-btn" type="button" data-quick-session="' + item.id + '">' + item.title + '</button>'
    ).join('') + '</div>';
  }

  function renderDifficultyList(items) {
    if (!items || items.length === 0) {
      return '<p>Responda quizzes para revelar caracteres que merecem reforço.</p>';
    }
    return '<div class="difficulty-list">' + items.slice(0, 5).map(item =>
      '<div class="difficulty-item">' +
        '<strong>' + (item.char || '?') + '</strong>' +
        '<span>' + (item.romaji || item.charId || '') + ' · ' + (item.accuracy || 0) + '% · ' + (item.state || 'Atenção') + '</span>' +
      '</div>'
    ).join('') + '</div>';
  }

  function renderMetric(label, value, detail) {
    return '<div class="metric-card">' +
      '<span class="metric-label">' + label + '</span>' +
      '<strong class="metric-value">' + value + '</strong>' +
      '<span class="metric-detail">' + detail + '</span>' +
    '</div>';
  }

  function renderProgressRow(label, data) {
    const total = data.total || 0;
    const studied = data.studied || 0;
    const percent = total > 0 ? Math.round((studied / total) * 100) : 0;

    return '<div class="progress-row">' +
      '<div class="progress-row-header">' +
        '<span>' + label + '</span>' +
        '<strong>' + percent + '%</strong>' +
      '</div>' +
      '<div class="progress-track"><div class="progress-fill" style="width:' + percent + '%"></div></div>' +
      '<div class="progress-caption">' + studied + ' de ' + total + ' caracteres</div>' +
    '</div>';
  }

  function renderActivityCalendar(activity) {
    const days = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = getDayKey(date);
      const count = activity[key] || 0;
      const level = count === 0 ? 0 : count < 3 ? 1 : count < 7 ? 2 : 3;
      days.push(
        '<div class="activity-day level-' + level + '" title="' + formatDate(date) + ': ' + count + ' estudos">' +
          '<span>' + date.getDate() + '</span>' +
        '</div>'
      );
    }

    return days.join('');
  }

  function renderRecentCharacters(recent) {
    if (!recent || recent.length === 0) {
      return '<div class="recent-empty">Abra um caractere para iniciar o historico.</div>';
    }

    return recent.map(item =>
      '<div class="recent-character">' +
        '<strong>' + (item.char || '?') + '</strong>' +
        '<span>' + (item.romaji || item.charId || '') + '</span>' +
      '</div>'
    ).join('');
  }

  function formatStudyTime(minutes) {
    const rounded = Math.round(minutes || 0);
    if (rounded < 60) return rounded + ' min';
    const hours = Math.floor(rounded / 60);
    const mins = rounded % 60;
    return mins > 0 ? hours + 'h ' + mins + 'min' : hours + 'h';
  }

  function getDayKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function formatDate(date) {
    return String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  return {
    init,
    setCharacters,
    getFilters,
    getCurrentView,
    setCurrentView,
    getDictionaryFilters,
    getQuizSettings,
    applyQuizSettings,
    setFilters,
    renderGrid,
    renderDictionary,
    renderQuiz,
    renderFilters,
    onFilterChangeCallback,
    onViewChangeCallback,
    onDictionaryFilterChangeCallback,
    onQuizSettingsChangeCallback,
    onQuizAnswerCallback,
    onQuizNextCallback,
    onQuizRevealCallback,
    onQuizResetCallback,
    onBackupExportCallback,
    onBackupFileSelectedCallback,
    onBackupImportCallback,
    onClearDataCallback,
    onStudyNowCallback,
    onDiagnosticCallback,
    onGuidedTrailCallback,
    onQuickSessionCallback,
    updateBackupPreview,
    showBackupStatus,
    resetClearDataConfirmation,
    showClearDataStatus,
    updateCardFavoriteState,
    updateStats,
    updateDashboard,
    closeModal,
    getElements: () => elements
  };
})();


