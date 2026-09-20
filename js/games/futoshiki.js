// 不等式数独：求解器只接受完整搜索确认的唯一解。
registerGame('futoshiki',()=>openFutoshiki());
const FUTO_LEVELS=[{name:'入门',n:4,remove:.45},{name:'标准',n:5,remove:.6},{name:'进阶',n:6,remove:.72}];
function solveFuto(p,initial=p.givens,limit=2){
  const b=[...initial];let count=0,solution=null,nodes=0,truncated=false;
  function allowed(i,v){
    const r=Math.floor(i/p.n),c=i%p.n;
    for(let k=0;k<p.n;k++)if((r*p.n+k!==i&&b[r*p.n+k]===v)||(k*p.n+c!==i&&b[k*p.n+c]===v))return false;
    return p.inequalities.every(([a,z])=>a===i?(!b[z]||v<b[z]):z===i?(!b[a]||b[a]<v):true);
  }
  if(b.some((v,i)=>v&&(!Number.isInteger(v)||v<1||v>p.n||!allowed(i,v))))return {count:0,solution:null,truncated:false};
  function visit(){
    if(++nodes>60000){truncated=true;return;}
    let at=-1,opts=null;
    for(let i=0;i<b.length;i++)if(!b[i]){
      const candidates=Array.from({length:p.n},(_,k)=>k+1).filter(v=>allowed(i,v));
      if(!candidates.length)return;
      if(!opts||candidates.length<opts.length){at=i;opts=candidates;if(opts.length===1)break;}
    }
    if(at<0){count++;solution||=[...b];return;}
    for(const v of opts){b[at]=v;visit();b[at]=0;if(count>=limit||truncated)return;}
  }
  visit();return {count,solution,truncated};
}
function generateFuto(level,random=Math.random){
  const cfg=FUTO_LEVELS[level],n=cfg.n,rows=shuffle([...Array(n).keys()],random),cols=shuffle([...Array(n).keys()],random),digits=shuffle([...Array(n)].map((_,i)=>i+1),random);
  const solution=rows.flatMap(r=>cols.map(c=>digits[(r+c)%n])),inequalities=[];
  for(let i=0;i<n*n;i++)for(const j of [i%n<n-1?i+1:-1,i+n<n*n?i+n:-1])if(j>=0&&random()<.4)inequalities.push(solution[i]<solution[j]?[i,j]:[j,i]);
  const p={n,level,solution,inequalities,givens:[...solution]};
  let removed=0;
  for(const i of shuffle([...Array(n*n).keys()],random)){
    const value=p.givens[i];p.givens[i]=0;const solved=solveFuto(p);
    if(solved.count!==1||solved.truncated)p.givens[i]=value;else removed++;
    if(removed>=Math.floor(n*n*cfg.remove))break;
  }
  return p;
}
function openFutoshiki(){
  state={kind:'futo-menu'};prepareGeneric('不等式数独');
  stage.innerHTML='<div class="stage-inner"><p class="eyebrow">数字推理</p><h2>不等式数独</h2><p>每行每列填入 1 到 N，数字不能重复，还要满足格子之间的大小关系。尖端朝向较小的数字。</p><div class="choice-grid">'+FUTO_LEVELS.map((l,i)=>'<button class="choice" data-futo-level="'+i+'">'+l.name+' · '+l.n+'×'+l.n+'</button>').join('')+'</div></div>';
  stage.querySelectorAll('[data-futo-level]').forEach(b=>b.onclick=()=>startFuto(+b.dataset.futoLevel));
}
function startFuto(level){
  const p=freshPuzzle('futoshiki',()=>generateFuto(level),p=>JSON.stringify([p.givens,p.inequalities]));
  prepareGeneric('不等式数独');state={kind:'futoshiki',...p,values:[...p.givens],selected:p.givens.indexOf(0),history:[],hints:0,startedAt:Date.now()};renderFuto();
}
function renderFuto(message='点选白格，再选择数字；橙色为已知数字'){
  stage.className='game-stage new-puzzle-stage';
  document.getElementById('lives').textContent=FUTO_LEVELS[state.level].name;
  document.getElementById('level').textContent=state.values.filter(Boolean).length+'/'+state.n**2;
  let cells='';
  for(let r=0;r<state.n*2-1;r++)for(let c=0;c<state.n*2-1;c++){
    if(r%2===0&&c%2===0){const i=r/2*state.n+c/2;cells+='<button class="futo-cell '+(state.givens[i]?'given ':'')+(state.selected===i?'selected':'')+'" data-futo-cell="'+i+'" aria-label="第 '+(r/2+1)+' 行第 '+(c/2+1)+' 列">'+(state.values[i]||'')+'</button>';}
    else{let symbol='';if(r%2!==c%2){const a=Math.floor(r/2)*state.n+Math.floor(c/2),b=a+(r%2?state.n:1),edge=state.inequalities.find(e=>e.includes(a)&&e.includes(b));if(edge)symbol=r%2?(edge[0]===a?'∧':'∨'):(edge[0]===a?'&lt;':'&gt;');}cells+='<span class="futo-sign">'+symbol+'</span>';}
  }
  stage.innerHTML='<div class="stage-inner"><h2>不等式数独</h2><p role="status">'+message+'</p><div class="new-board-space"><div class="futo-board" style="--n:'+state.n+'">'+cells+'</div></div><div class="new-number-pad">'+Array.from({length:state.n+1},(_,v)=>'<button data-futo-value="'+v+'">'+(v||'⌫')+'</button>').join('')+'</div>'+newPuzzleToolbar()+'</div>';
  stage.querySelectorAll('[data-futo-cell]').forEach(b=>b.onclick=()=>{if(!state.givens[+b.dataset.futoCell]){state.selected=+b.dataset.futoCell;renderFuto();}});
  stage.querySelectorAll('[data-futo-value]').forEach(b=>b.onclick=()=>{if(state.settled||state.givens[state.selected])return;state.history.push([...state.values]);state.values[state.selected]=+b.dataset.futoValue;finishOrRenderFuto();});
  bindNewPuzzleTools(()=>{const old=state.history.pop();if(old)state.values=old;renderFuto('已撤销');},hintFuto,()=>startFuto(state.level),()=>{
    const s=solveFuto(state,state.values,1);renderFuto(s.solution?'当前填写可以继续完成':s.truncated?'暂未确定，请检查大小关系':'当前填写有矛盾，请撤销或修改');
  });
}
function finishOrRenderFuto(){
  if(state.values.every(Boolean)&&solveFuto(state,state.values,1).count===1){
    const level=state.level;completeGame('futoshiki','不等式数独',Math.max(100,850+level*50-state.hints*45),[{value:state.n+'×'+state.n,label:'棋盘'},{value:state.hints,label:'辅助'}],()=>startFuto(level));
  }else renderFuto();
}
function hintFuto(){
  if(progress.xp<30)return toast('积分不足');
  const i=state.values.findIndex((v,k)=>v!==state.solution[k]);if(i<0)return;
  state.history.push([...state.values]);state.values[i]=state.solution[i];state.selected=i;state.hints++;progress.xp-=30;saveProgress();finishOrRenderFuto();
}
