// 孔明棋残局：从单子逆向跳跃生成，保留通关路径。
registerGame('peg-solitaire',openPeg);
const PEG_LEVELS=[{name:'入门',pegs:6},{name:'标准',pegs:9},{name:'进阶',pegs:12}];
const PEG_CELLS=Array.from({length:49},(_,i)=>i).filter(i=>{const r=Math.floor(i/7),c=i%7;return(r>=2&&r<=4)||(c>=2&&c<=4);});
const PEG_JUMPS=PEG_CELLS.flatMap(from=>[[-1,0],[1,0],[0,-1],[0,1]].map(([dr,dc])=>{
  const r=Math.floor(from/7),c=from%7,mr=r+dr,mc=c+dc,tr=r+2*dr,tc=c+2*dc;
  if(tr<0||tr>6||tc<0||tc>6)return null;
  const over=mr*7+mc,to=tr*7+tc;return PEG_CELLS.includes(over)&&PEG_CELLS.includes(to)?{from,over,to}:null;
}).filter(Boolean));
function pegMoves(pegs){return PEG_JUMPS.filter(m=>pegs.has(m.from)&&pegs.has(m.over)&&!pegs.has(m.to));}
function applyPeg(pegs,m){const next=new Set(pegs);next.delete(m.from);next.delete(m.over);next.add(m.to);return next;}
function generatePeg(level,random=Math.random){
  for(let attempt=0;attempt<100;attempt++){
    const pegs=new Set([PEG_CELLS[Math.floor(random()*PEG_CELLS.length)]]),path=[];
    while(pegs.size<PEG_LEVELS[level].pegs){
      const moves=PEG_JUMPS.filter(m=>pegs.has(m.to)&&!pegs.has(m.from)&&!pegs.has(m.over));if(!moves.length)break;
      const m=moves[Math.floor(random()*moves.length)];pegs.delete(m.to);pegs.add(m.from);pegs.add(m.over);path.unshift(m);
    }
    if(pegs.size===PEG_LEVELS[level].pegs)return {level,pegs,path};
  }
  throw new Error('生成失败，请重试');
}
function solvePeg(pegs,limit=80000){
  const dead=new Set();let nodes=0,truncated=false;
  function search(board){
    if(board.size===1)return [];
    if(++nodes>limit){truncated=true;return null;}
    const key=[...board].sort((a,b)=>a-b).join(',');if(dead.has(key))return null;
    for(const m of pegMoves(board)){const tail=search(applyPeg(board,m));if(tail)return[m,...tail];if(truncated)return null;}
    dead.add(key);return null;
  }
  return {path:search(pegs),truncated};
}
function openPeg(){
  state={kind:'peg-menu'};prepareGeneric('孔明棋');
  stage.innerHTML='<div class="stage-inner"><p class="eyebrow">经典跳子残局</p><h2>孔明棋</h2><p>选中棋子，跳过相邻的一颗棋子，落到直线上的空孔。被跳过的棋子移除，最后只留一颗即获胜。只能横跳或竖跳。</p><div class="choice-grid">'+PEG_LEVELS.map((l,i)=>'<button class="choice" data-peg-level="'+i+'">'+l.name+' · '+l.pegs+' 子</button>').join('')+'</div></div>';
  stage.querySelectorAll('[data-peg-level]').forEach(b=>b.onclick=()=>startPeg(+b.dataset.pegLevel));
}
function startPeg(level){
  const p=freshPuzzle('pegSolitaire',()=>generatePeg(level),p=>[...p.pegs].sort((a,b)=>a-b).join(','));
  prepareGeneric('孔明棋');state={kind:'peg-solitaire',...p,initial:new Set(p.pegs),history:[],selected:null,hints:0};renderPeg();
}
function renderPeg(message='先选棋子，再点亮起的空孔'){
  stage.className='game-stage new-puzzle-stage';document.getElementById('lives').textContent=PEG_LEVELS[state.level].name;document.getElementById('level').textContent='剩余 '+state.pegs.size+' 子';
  const moves=pegMoves(state.pegs).filter(m=>m.from===state.selected);
  stage.innerHTML='<div class="stage-inner"><h2>孔明棋</h2><p role="status">'+message+'</p><div class="new-board-space"><div class="peg-board">'+Array.from({length:49},(_,i)=>PEG_CELLS.includes(i)?'<button data-peg="'+i+'" class="peg-hole '+(state.pegs.has(i)?'occupied ':'')+(state.selected===i?'selected ':'')+(moves.some(m=>m.to===i)?'destination':'')+'" aria-label="第 '+(Math.floor(i/7)+1)+' 行第 '+(i%7+1)+' 列，'+(state.pegs.has(i)?'棋子':'空孔')+'">'+(state.pegs.has(i)?'●':'')+'</button>':'<span></span>').join('')+'</div></div><button class="btn btn-secondary" id="restartPeg">重开本局</button>'+newPuzzleToolbar()+'</div>';
  stage.querySelectorAll('[data-peg]').forEach(b=>b.onclick=()=>{const i=+b.dataset.peg;if(state.pegs.has(i)){state.selected=i;renderPeg();}else{const m=pegMoves(state.pegs).find(m=>m.from===state.selected&&m.to===i);if(m)playPeg(m);}});
  document.getElementById('restartPeg').onclick=()=>{state.pegs=new Set(state.initial);state.history=[];state.selected=null;renderPeg();};
  bindNewPuzzleTools(()=>{const old=state.history.pop();if(old)state.pegs=old;state.selected=null;renderPeg();},hintPeg,()=>startPeg(state.level),()=>{
    const result=solvePeg(state.pegs);renderPeg(result.path?'当前局面有解':result.truncated?'搜索达到上限，可尝试撤销':'当前局面无解，请撤销或重开');
  });
}
function playPeg(move){
  if(state.settled)return;state.history.push(new Set(state.pegs));state.pegs=applyPeg(state.pegs,move);state.selected=null;
  if(state.pegs.size===1){const level=state.level;completeGame('peg-solitaire','孔明棋',Math.max(100,800+level*75-state.hints*45),[{value:state.history.length,label:'跳跃'},{value:state.hints,label:'辅助'}],()=>startPeg(level));}
  else renderPeg(pegMoves(state.pegs).length?'继续跳跃，目标只留一颗':'没有可跳的位置，请撤销或重开');
}
function hintPeg(){
  if(progress.xp<30)return toast('积分不足');
  const result=solvePeg(state.pegs);if(!result.path?.length)return toast(result.truncated?'搜索达到上限，未扣积分':'当前无解，请撤销；未扣积分');
  progress.xp-=30;state.hints++;saveProgress();playPeg(result.path[0]);
}
