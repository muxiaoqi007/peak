// 极速运算 — loaded as a classic script to support file:// usage.
registerGame('math', openMathGame);
function makeMathTrial(level = 1, random = Math.random) {
  const max = level < 5 ? 12 : level < 10 ? 25 : 50;
  const op = level >= 8 && random() < .28 ? '×' : random() < .5 ? '+' : '−';
  let a = 1 + Math.floor(random() * max), b = 1 + Math.floor(random() * max), actual;
  if (op === '−' && b > a) [a, b] = [b, a];
  actual = op === '+' ? a + b : op === '−' ? a - b : a * Math.min(b, 9);
  if (op === '×') b = Math.min(b, 9);
  const isTrue = random() < .5; const shown = isTrue ? actual : actual + (random() < .5 ? -1 : 1) * (1 + Math.floor(random() * 3));
  return { a, b, op, shown, isTrue, actual };
}
function openMathGame() {
  state = { kind: 'math', rounds: 0, correct: 0, score: 0, mistakes: 0, trial: null, startedAt: 0, timer: null };
  prepareGeneric('极速运算');
  stage.innerHTML = `<div class="stage-inner"><p class="eyebrow">敏捷训练</p><h2>极速运算</h2><p>判断屏幕上的算式是正确还是错误，共 15 题。</p><div style="margin-top:36px"><button class="btn btn-primary" id="beginMath">开始挑战</button></div></div>`;
  document.getElementById('beginMath').addEventListener('click', nextMathTrial);
}
function nextMathTrial() {
  if (state.rounds >= 15 || state.mistakes >= 3) return finishMath();
  state.trial = makeMathTrial(state.rounds + 1); state.rounds++; state.startedAt = performance.now();
  document.getElementById('lives').textContent = `失误 ${state.mistakes} / 3`; document.getElementById('level').textContent = `${state.rounds} / 15`;
  const t = state.trial;
  stage.innerHTML = `<div class="stage-inner"><p class="muted">这个算式成立吗？</p><div class="math-expression">${t.a} ${t.op} ${t.b} = ${t.shown}</div><div class="binary-grid"><button class="choice" data-math="false">错误</button><button class="choice" data-math="true">正确</button></div><div class="feedback" aria-live="polite"></div></div>`;
  stage.querySelector('.binary-grid').addEventListener('click', e => { if (!e.target.dataset.math || e.target.disabled) return; answerMath(e.target.dataset.math === 'true'); });
}
function answerMath(value) {
  const correct = value === state.trial.isTrue; const elapsed = performance.now() - state.startedAt;
  if (correct) { state.correct++; state.score += Math.max(25, 115 - elapsed / 35); } else state.mistakes++;
  stage.querySelectorAll('.choice').forEach(b => b.disabled = true);
  stage.querySelector('.feedback').textContent = correct ? '判断正确' : `实际答案是 ${state.trial.actual}`;
  state.timer = setTimeout(nextMathTrial, 600);
}
function finishMath() {
  const accuracy = Math.round(state.correct / Math.max(1, state.rounds) * 100);
  completeGame('math', '思维敏捷', state.score / Math.max(1, state.rounds) * 9, [
    { value: `${accuracy}%`, label: '准确率' }, { value: state.correct, label: '答对' }, { value: state.rounds, label: '题目' }
  ], openMathGame);
}
