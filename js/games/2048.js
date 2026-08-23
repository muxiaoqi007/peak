// 2048 — loaded as a classic script to support file:// usage.
registerGame('2048', open2048);
function spawnTile(board, random = Math.random) {
  const empty = board.map((v,i) => v === 0 ? i : -1).filter(i => i >= 0); if (!empty.length) return board;
  board[empty[Math.floor(random() * empty.length)]] = random() < .9 ? 2 : 4; return board;
}
function mergeLine(line) {
  const values = line.filter(Boolean), out = [], result = { line: [], score: 0 };
  for (let i = 0; i < values.length; i++) { if (values[i] === values[i+1]) { const v = values[i] * 2; out.push(v); result.score += v; i++; } else out.push(values[i]); }
  result.line = [...out, ...Array(4 - out.length).fill(0)]; return result;
}
function move2048(board, direction) {
  const next = [...board]; let gained = 0;
  for (let line = 0; line < 4; line++) {
    let ids = direction === 'left' ? [0,1,2,3].map(c=>line*4+c) : direction === 'right' ? [3,2,1,0].map(c=>line*4+c) : direction === 'up' ? [0,1,2,3].map(r=>r*4+line) : [3,2,1,0].map(r=>r*4+line);
    const merged = mergeLine(ids.map(i => board[i])); gained += merged.score; ids.forEach((id,i) => next[id] = merged.line[i]);
  }
  return { board: next, score: gained, moved: next.some((v,i) => v !== board[i]) };
}
function has2048Moves(board) {
  if (board.includes(0)) return true;
  return ['left','right','up','down'].some(d => move2048(board,d).moved);
}
function open2048() {
  const board = Array(16).fill(0); spawnTile(board); spawnTile(board);
  state = { kind: '2048', board, score: 0, moves: 0, touch: null, timer: null }; prepareGeneric('2048'); render2048();
}
function render2048() {
  document.getElementById('lives').textContent = `分数 ${state.score}`; document.getElementById('level').textContent = `移动 ${state.moves}`;
  stage.innerHTML = `<div class="stage-inner"><h2>2048</h2><p class="muted">滑动棋盘或使用方向键</p><div class="tile-board" id="tileBoard">${state.board.map(v => `<div class="tile" data-value="${v}">${v || ''}</div>`).join('')}</div><div class="game-actions"><button class="btn btn-secondary" data-dir="left">←</button><button class="btn btn-secondary" data-dir="up">↑</button><button class="btn btn-secondary" data-dir="down">↓</button><button class="btn btn-secondary" data-dir="right">→</button></div></div>`;
  stage.querySelector('.game-actions').addEventListener('click', e => { if (e.target.dataset.dir) play2048(e.target.dataset.dir); });
  const board = document.getElementById('tileBoard');
  board.addEventListener('pointerdown', e => state.touch = { x:e.clientX, y:e.clientY });
  board.addEventListener('pointerup', e => { if (!state.touch) return; const dx=e.clientX-state.touch.x, dy=e.clientY-state.touch.y; if (Math.max(Math.abs(dx),Math.abs(dy)) > 24) play2048(Math.abs(dx)>Math.abs(dy) ? dx>0?'right':'left' : dy>0?'down':'up'); state.touch=null; });
}
function play2048(direction) {
  const moved = move2048(state.board, direction); if (!moved.moved) return;
  state.board = moved.board; state.score += moved.score; state.moves++; spawnTile(state.board);
  if (!has2048Moves(state.board)) return completeGame('2048', '2048', Math.min(999, state.score / 2), [{ value: Math.max(...state.board), label: '最大方块' }, { value: state.score, label: '合并分' }, { value: state.moves, label: '移动' }], open2048);
  render2048();
}
