// 数字闪忆 — loaded as a classic script to support file:// usage.
registerGame('number', openNumberGame);
function initialState() { return { level: 1, length: 3, mistakes: 0, correct: 0, rounds: 0, score: 0, sequence: '', startedAt: 0, timer: null }; }
function makeSequence(length, random = Math.random) {
  let value = String(1 + Math.floor(random() * 9));
  while (value.length < length) value += Math.floor(random() * 10);
  return value;
}
function calculateRoundScore(length, responseMs, correct) {
  if (!correct) return 0;
  return Math.max(10, Math.round(length * 120 - Math.max(0, responseMs - 1000) / 20));
}
function syncGameMeta() {
  document.getElementById('lives').textContent = `失误 ${state.mistakes} / 3`;
  document.getElementById('level').textContent = `等级 ${state.level}`;
}
function openNumberGame() {
  state = initialState(); stage.className = 'game-stage'; gameScreen.classList.add('open'); document.body.style.overflow = 'hidden'; syncGameMeta();
  stage.innerHTML = `<div class="stage-inner"><p class="eyebrow">记忆训练</p><h2>数字闪忆</h2><p>数字只会出现片刻。记住顺序，然后准确输入。</p><div style="margin-top:36px"><button class="btn btn-primary" id="beginRound">我准备好了</button></div></div>`;
  document.getElementById('beginRound').addEventListener('click', showSequence);
}
function showSequence() {
  state.sequence = makeSequence(state.length); state.rounds++; syncGameMeta();
  stage.innerHTML = `<div class="stage-inner"><p class="muted">记住这个数字</p><div class="number-display">${state.sequence}</div><p class="muted">${state.length} 位</p></div>`;
  clearTimeout(state.timer); state.timer = setTimeout(showAnswer, Math.max(900, 1800 - state.length * 90));
}
function showAnswer() {
  state.startedAt = performance.now();
  stage.innerHTML = `<div class="stage-inner"><h2>刚才是什么？</h2><input class="answer" id="answer" inputmode="numeric" autocomplete="off" maxlength="12" aria-label="输入刚才的数字"><div class="keypad">${[1,2,3,4,5,6,7,8,9].map(n => `<button class="key" data-key="${n}">${n}</button>`).join('')}<button class="key" data-key="back">⌫</button><button class="key" data-key="0">0</button><button class="key submit" data-key="submit">确认</button></div><div class="feedback" id="feedback" aria-live="polite"></div></div>`;
  const input = document.getElementById('answer'); input.focus();
  stage.querySelector('.keypad').addEventListener('click', e => { const key = e.target.dataset.key; if (!key) return; if (key === 'back') input.value = input.value.slice(0, -1); else if (key === 'submit') submitAnswer(); else if (input.value.length < 12) input.value += key; });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submitAnswer(); });
}
function submitAnswer() {
  const input = document.getElementById('answer'); if (!input || !input.value) return;
  const isCorrect = input.value === state.sequence; const elapsed = performance.now() - state.startedAt; state.score += calculateRoundScore(state.length, elapsed, isCorrect);
  if (isCorrect) { state.correct++; state.length = Math.min(12, state.length + 1); state.level++; }
  else { state.mistakes++; state.length = Math.max(3, state.length - 1); }
  syncGameMeta();
  const feedback = document.getElementById('feedback'); feedback.textContent = isCorrect ? '正确，难度提升' : `答案是 ${state.sequence}`;
  input.disabled = true; stage.querySelectorAll('.key').forEach(k => k.disabled = true);
  clearTimeout(state.timer); state.timer = setTimeout(() => state.mistakes >= 3 ? showResults() : showSequence(), 1050);
}
function showResults() {
  const accuracy = state.rounds ? Math.round(state.correct / state.rounds * 100) : 0;
  const finalScore = Math.min(999, Math.round(state.score / Math.max(1, state.rounds)));
  const isBest = finalScore > (progress.best.number || 0);
  progress.best.number = Math.max(finalScore, progress.best.number || 0); progress.sessions++; progress.xp += state.correct * 10;
  progress.completedToday = Math.min(4, progress.completedToday + 1); recordSession('number',finalScore); saveProgress(); renderProgress();
  stage.innerHTML = `<div class="stage-inner"><p class="eyebrow">训练完成</p><h2>${isBest ? '新的个人最佳' : '不错的练习'}</h2><div class="result-score">${finalScore}</div><p class="muted">记忆力得分</p><div class="result-grid"><div><strong>${accuracy}%</strong><small>准确率</small></div><div><strong>${state.correct}</strong><small>答对</small></div><div><strong>${state.level}</strong><small>最高等级</small></div></div><button class="btn btn-primary" id="replay">再练一次</button><button class="btn btn-secondary" id="finish" style="width:100%;margin-top:9px">返回首页</button></div>`;
  document.getElementById('replay').addEventListener('click', openNumberGame); document.getElementById('finish').addEventListener('click', closeGame);
}
