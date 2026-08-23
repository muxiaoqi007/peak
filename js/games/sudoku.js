// 数独 — loaded as a classic script to support file:// usage.
registerGame('sudoku', openSudoku);
function sudokuCandidates(board, index) {
  const used=new Set(), row=Math.floor(index/9), col=index%9;
  for(let i=0;i<9;i++){used.add(board[row*9+i]);used.add(board[i*9+col]);}
  const br=Math.floor(row/3)*3,bc=Math.floor(col/3)*3;for(let r=br;r<br+3;r++)for(let c=bc;c<bc+3;c++)used.add(board[r*9+c]);
  return [1,2,3,4,5,6,7,8,9].filter(n=>!used.has(n));
}
function solveSudoku(board, limit=2) {
  let count=0, solution=null;
  function search(){if(count>=limit)return;let target=-1,choices=null;for(let i=0;i<81;i++)if(board[i]===0){const c=sudokuCandidates(board,i);if(!c.length)return;if(!choices||c.length<choices.length){target=i;choices=c;if(c.length===1)break;}}if(target<0){count++;if(!solution)solution=[...board];return;}for(const n of choices){board[target]=n;search();board[target]=0;if(count>=limit)return;}}
  search(); return { count, solution };
}
function generateSudoku(difficulty='easy', random=Math.random) {
  const base=(r,c)=>(r*3+Math.floor(r/3)+c)%9;
  const bands=shuffle([0,1,2],random), stacks=shuffle([0,1,2],random);
  const rows=bands.flatMap(b=>shuffle([0,1,2],random).map(r=>b*3+r)); const cols=stacks.flatMap(s=>shuffle([0,1,2],random).map(c=>s*3+c)); const nums=shuffle([1,2,3,4,5,6,7,8,9],random);
  const solution=rows.flatMap(r=>cols.map(c=>nums[base(r,c)])); const puzzle=[...solution]; const target={easy:42,medium:34,hard:28}[difficulty];
  for(const index of shuffle([...Array(81)].map((_,i)=>i),random)){if(puzzle.filter(Boolean).length<=target)break;const keep=puzzle[index];puzzle[index]=0;if(solveSudoku([...puzzle],2).count!==1)puzzle[index]=keep;}
  return { puzzle, solution, clues:puzzle.filter(Boolean).length };
}
function openSudoku() {
  state = { kind:'sudoku-menu', timer:null }; prepareGeneric('数独');
  stage.innerHTML=`<div class="stage-inner"><p class="eyebrow">每局唯一解</p><h2>选择数独难度</h2><p>关卡会实时随机生成，并经过求解器验证，不会重复背题。</p><div class="choice-grid"><button class="choice" data-sudoku-level="easy">初级<br><small>约 42 条线索</small></button><button class="choice" data-sudoku-level="medium">中级<br><small>约 34 条线索</small></button><button class="choice" data-sudoku-level="hard">困难<br><small>约 28 条线索</small></button><button class="choice" id="sudokuHelp">玩法教程</button></div></div>`;
  stage.querySelector('.choice-grid').addEventListener('click',e=>{if(e.target.closest('[data-sudoku-level]'))startSudoku(e.target.closest('[data-sudoku-level]').dataset.sudokuLevel);});
  document.getElementById('sudokuHelp').addEventListener('click',()=>toast('每行、每列、每个 3×3 宫内，数字 1–9 都不能重复'));
}
function startSudoku(difficulty) {
  document.getElementById('lives').textContent='正在生成…'; const generated=generateSudoku(difficulty);
  state={kind:'sudoku',difficulty,puzzle:[...generated.puzzle],solution:generated.solution,board:[...generated.puzzle],clues:generated.clues,selected:-1,mistakes:0,startedAt:Date.now(),timer:null};renderSudoku();
}
function renderSudoku() {
  const labels={easy:'初级',medium:'中级',hard:'困难'};document.getElementById('lives').textContent=`错误 ${state.mistakes}`;document.getElementById('level').textContent=`${labels[state.difficulty]} · ${state.clues} 线索`;
  stage.innerHTML = `<div class="stage-inner"><h2>数独</h2><p class="muted">选中空格，再填入数字</p><div class="sudoku-board">${state.board.map((v,i) => `<button class="sudoku-cell ${state.puzzle[i] ? 'given' : ''} ${state.selected === i ? 'selected' : ''}" data-sudoku="${i}" ${state.puzzle[i] ? 'disabled' : ''}>${v || ''}</button>`).join('')}</div><div class="number-pad">${[1,2,3,4,5,6,7,8,9].map(n => `<button data-number="${n}">${n}</button>`).join('')}</div><div class="game-actions" style="margin-top:10px"><button class="btn btn-secondary" id="eraseSudoku">清除</button><button class="btn btn-secondary" id="hintSudoku">智能提示 · 20 XP</button><button class="btn btn-secondary" id="newSudoku">换一局</button></div></div>`;
  stage.querySelector('.sudoku-board').addEventListener('click', e => { const i = e.target.dataset.sudoku; if (i === undefined) return; state.selected = Number(i); renderSudoku(); });
  stage.querySelector('.number-pad').addEventListener('click', e => { const n = e.target.dataset.number; if (n && state.selected >= 0) setSudoku(Number(n)); });
  document.getElementById('eraseSudoku').addEventListener('click', () => { if (state.selected >= 0) { state.board[state.selected] = 0; renderSudoku(); } });
  document.getElementById('hintSudoku').addEventListener('click',()=>{const empty=state.board.findIndex((v,i)=>!v&&!state.puzzle[i]);if(empty<0)return;if(progress.xp<20)return toast('积分不足，完成训练可以获得 XP');progress.xp-=20;state.board[empty]=state.solution[empty];saveProgress();renderSudoku();});
  document.getElementById('newSudoku').addEventListener('click',openSudoku);
}
function setSudoku(value) {
  if (state.solution[state.selected] !== value) state.mistakes++;
  state.board[state.selected] = value;
  if (state.board.every((v,i)=>v===state.solution[i])) {
    const seconds = Math.round((Date.now() - state.startedAt) / 1000); const score = Math.max(100, 950 - state.mistakes * 40 - seconds / 3);
    completeGame('sudoku', '数独', score, [{ value: state.mistakes, label: '错误' }, { value: `${seconds}s`, label: '用时' }, { value: state.difficulty, label: '难度' }], openSudoku);
  } else renderSudoku();
}
