// 路径回溯 — loaded as a classic script to support file:// usage.
registerGame('path', openPathGame);
function makePath(size, length, random = Math.random) {
  const cells = [{ r: Math.floor(random() * size), c: Math.floor(random() * size) }];
  while (cells.length < length) {
    const last = cells[cells.length - 1];
    const candidates = [[1,0],[-1,0],[0,1],[0,-1]].map(([dr,dc]) => ({ r:last.r+dr, c:last.c+dc })).filter(p => p.r >= 0 && p.r < size && p.c >= 0 && p.c < size && !cells.some(x => x.r === p.r && x.c === p.c));
    if (!candidates.length) return makePath(size, length, random);
    cells.push(candidates[Math.floor(random() * candidates.length)]);
  }
  return cells;
}
function openPathGame() {
  state = { kind: 'path', round: 0, correct: 0, mistakes: 0, score: 0, path: [], selected: [], timer: null };
  prepareGeneric('路径回溯');
  stage.innerHTML = `<div class="stage-inner"><p class="eyebrow">推理训练</p><h2>路径回溯</h2><p>记住方格亮起的顺序，隐藏后从起点依次点选。</p><div style="margin-top:36px"><button class="btn btn-primary" id="beginPath">开始挑战</button></div></div>`;
  document.getElementById('beginPath').addEventListener('click', nextPathRound);
}
function nextPathRound() {
  if (state.round >= 5 || state.mistakes >= 3) return finishPath();
  state.round++; const size = state.round >= 4 ? 5 : 4; const length = 3 + state.round;
  state.path = makePath(size, length); state.selected = [];
  document.getElementById('lives').textContent = `失误 ${state.mistakes} / 3`; document.getElementById('level').textContent = `${state.round} / 5`;
  renderPathBoard(size, true);
  state.timer = setTimeout(() => renderPathBoard(size, false), 1200 + length * 170);
}
function renderPathBoard(size, reveal) {
  const positions = new Map(state.path.map((p, i) => [`${p.r}-${p.c}`, i]));
  let cells = '';
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    const order = positions.get(`${r}-${c}`); const shown = reveal && order !== undefined;
    cells += `<button class="path-cell ${shown ? 'shown' : ''} ${order === 0 ? 'start' : ''}" data-r="${r}" data-c="${c}" ${reveal ? 'disabled' : ''}>${shown ? order + 1 : ''}</button>`;
  }
  stage.innerHTML = `<div class="stage-inner"><p class="muted">${reveal ? '记住亮起的顺序' : '从起点依次点选'}</p><div class="path-board" style="grid-template-columns:repeat(${size},1fr)">${cells}</div><div class="feedback" aria-live="polite"></div></div>`;
  if (!reveal) stage.querySelector('.path-board').addEventListener('click', answerPath);
}
function answerPath(e) {
  const cell = e.target.closest('.path-cell'); if (!cell) return;
  const expected = state.path[state.selected.length]; const correct = Number(cell.dataset.r) === expected.r && Number(cell.dataset.c) === expected.c;
  if (!correct) {
    state.mistakes++; stage.querySelector('.feedback').textContent = '顺序不对，下一轮再来';
    stage.querySelectorAll('.path-cell').forEach(b => b.disabled = true); state.timer = setTimeout(nextPathRound, 850); return;
  }
  state.selected.push(expected); cell.classList.add('selected'); cell.textContent = state.selected.length; cell.disabled = true;
  if (state.selected.length === state.path.length) { state.correct++; state.score += state.path.length * 130; stage.querySelector('.feedback').textContent = '路线完全正确'; stage.querySelectorAll('.path-cell').forEach(b => b.disabled = true); state.timer = setTimeout(nextPathRound, 750); }
}
function finishPath() {
  completeGame('path', '问题解决', state.score / Math.max(1, state.round), [
    { value: state.correct, label: '完成路线' }, { value: state.round, label: '挑战轮数' }, { value: `${state.mistakes}/3`, label: '失误' }
  ], openPathGame);
}
