// 颜色冲突 — loaded as a classic script to support file:// usage.
registerGame('color', openColorGame);
const COLORS = [
  { name: '红色', className: 'ink-red' }, { name: '蓝色', className: 'ink-blue' },
  { name: '绿色', className: 'ink-green' }, { name: '黑色', className: 'ink-black' }
];

function makeColorTrial(random = Math.random) {
  const word = Math.floor(random() * COLORS.length);
  let ink = Math.floor(random() * COLORS.length);
  if (ink === word && random() < .75) ink = (ink + 1 + Math.floor(random() * 3)) % COLORS.length;
  return { word, ink };
}
function openColorGame() {
  state = { kind: 'color', rounds: 0, correct: 0, score: 0, mistakes: 0, trial: null, startedAt: 0, timer: null };
  prepareGeneric('颜色冲突');
  stage.innerHTML = `<div class="stage-inner"><p class="eyebrow">专注训练</p><h2>颜色冲突</h2><p>选择文字的字体颜色，不要选择它写出的颜色。</p><div style="margin-top:36px"><button class="btn btn-primary" id="beginColor">开始挑战</button></div></div>`;
  document.getElementById('beginColor').addEventListener('click', nextColorTrial);
}
function nextColorTrial() {
  if (state.rounds >= 15 || state.mistakes >= 3) return finishColor();
  state.trial = makeColorTrial(); state.rounds++; state.startedAt = performance.now();
  document.getElementById('lives').textContent = `失误 ${state.mistakes} / 3`; document.getElementById('level').textContent = `${state.rounds} / 15`;
  const t = state.trial;
  stage.innerHTML = `<div class="stage-inner"><p class="muted">字体是什么颜色？</p><div class="trial-word ${COLORS[t.ink].className}">${COLORS[t.word].name}</div><div class="choice-grid">${COLORS.map((c, i) => `<button class="choice" data-color="${i}">${c.name}</button>`).join('')}</div><div class="feedback" aria-live="polite"></div></div>`;
  stage.querySelector('.choice-grid').addEventListener('click', e => { const value = e.target.dataset.color; if (value === undefined || e.target.disabled) return; answerColor(Number(value)); });
}
function answerColor(value) {
  const correct = value === state.trial.ink; const elapsed = performance.now() - state.startedAt;
  if (correct) { state.correct++; state.score += Math.max(30, 110 - elapsed / 30); } else state.mistakes++;
  stage.querySelectorAll('.choice').forEach(b => b.disabled = true);
  stage.querySelector('.feedback').textContent = correct ? '判断正确' : `正确答案：${COLORS[state.trial.ink].name}`;
  state.timer = setTimeout(nextColorTrial, 650);
}
function finishColor() {
  const accuracy = Math.round(state.correct / Math.max(1, state.rounds) * 100);
  completeGame('color', '专注力', state.score / Math.max(1, state.rounds) * 9, [
    { value: `${accuracy}%`, label: '准确率' }, { value: state.correct, label: '答对' }, { value: state.rounds, label: '题目' }
  ], openColorGame);
}
