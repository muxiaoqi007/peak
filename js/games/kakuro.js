// 数和（Kakuro）— procedural, solver-verified number-sum crosswords.
registerGame('kakuro', openKakuro);

const KAKURO_LEVELS = {
  easy: { name:'入门', size:5, blockRatio:.10, starterRatio:.34 },
  medium: { name:'标准', size:6, blockRatio:.13, starterRatio:.27 },
  hard: { name:'进阶', size:7, blockRatio:.16, starterRatio:.21 },
  expert: { name:'困难', size:8, blockRatio:.18, starterRatio:.16 },
  master: { name:'大师', size:9, blockRatio:.20, starterRatio:.12 }
};
let kakuroGenerationNonce=0;

function validKakuroMask(mask,size){
  const runLength=(index,step)=>{let start=index;while(start-step>=0&&mask[start-step]&&(step===size||Math.floor((start-step)/size)===Math.floor(start/size)))start-=step;let length=0;for(let cell=start;cell<mask.length&&mask[cell]&&(step===size||Math.floor(cell/size)===Math.floor(start/size));cell+=step)length++;return length;};
  for(let row=1;row<size;row++)for(let col=1;col<size;col++){const index=row*size+col;if(mask[index]&&(runLength(index,1)<2||runLength(index,size)<2))return false;}
  return true;
}

function makeKakuroMask(size,random,blockRatio){
  const mask=Array(size*size).fill(false);for(let row=1;row<size;row++)for(let col=1;col<size;col++)mask[row*size+col]=true;
  const cells=shuffle([...Array((size-1)*(size-1))].map((_,i)=>(Math.floor(i/(size-1))+1)*size+(i%(size-1)+1)),random),target=Math.max(1,Math.round(cells.length*blockRatio));let placed=0;
  for(const index of cells){if(placed>=target)break;mask[index]=false;if(validKakuroMask(mask,size))placed++;else mask[index]=true;}
  return mask;
}

function makeKakuroSolution(mask,size,random){
  const rows=shuffle([...Array(size-1)].map((_,i)=>i),random),cols=shuffle([...Array(size-1)].map((_,i)=>i),random),digits=shuffle([1,2,3,4,5,6,7,8,9],random),solution=Array(size*size).fill(0);
  for(let row=1;row<size;row++)for(let col=1;col<size;col++)if(mask[row*size+col])solution[row*size+col]=digits[(rows[row-1]+cols[col-1])%9];
  return solution;
}

function buildKakuroRuns(mask,size,solution){
  const runs=[],cellRuns=Array.from({length:mask.length},()=>[]);
  const addRun=(cells,direction)=>{if(cells.length<2)return;const run={id:runs.length,cells,direction,target:cells.reduce((sum,index)=>sum+solution[index],0)};runs.push(run);cells.forEach(index=>cellRuns[index].push(run.id));};
  for(let row=1;row<size;row++)for(let col=1;col<size;col++){const index=row*size+col;if(!mask[index])continue;if(!mask[index-1]){const cells=[];for(let c=col;c<size&&mask[row*size+c];c++)cells.push(row*size+c);addRun(cells,'across');}if(!mask[index-size]){const cells=[];for(let r=row;r<size&&mask[r*size+col];r++)cells.push(r*size+col);addRun(cells,'down');}}
  return {runs,cellRuns};
}

function kakuroCanChoose(mask,count,sum,cache){
  const key=`${mask}/${count}/${sum}`;if(cache.has(key))return cache.get(key);if(count===0)return sum===0;if(sum<=0)return false;
  for(let digit=1;digit<=9;digit++)if(!(mask&(1<<digit))&&kakuroCanChoose(mask|(1<<digit),count-1,sum-digit,cache)){cache.set(key,true);return true;}
  cache.set(key,false);return false;
}

function kakuroRunFeasible(run,board,cache){
  let sum=0,used=0,empty=0;for(const index of run.cells){const digit=board[index];if(!digit){empty++;continue;}if(used&(1<<digit))return false;used|=1<<digit;sum+=digit;}
  if(sum>run.target)return false;return kakuroCanChoose(used,empty,run.target-sum,cache);
}

function solveKakuro(puzzle,limit=2,initial=null,nodeLimit=350000){
  const board=initial?[...initial]:[...puzzle.givens],solutions=[],cache=new Map();let nodes=0,truncated=false;
  const candidates=index=>{const out=[];for(let digit=1;digit<=9;digit++){board[index]=digit;if(puzzle.cellRuns[index].every(id=>kakuroRunFeasible(puzzle.runs[id],board,cache)))out.push(digit);}board[index]=0;return out;};
  const search=()=>{if(solutions.length>=limit||truncated)return;if(++nodes>nodeLimit){truncated=true;return;}let chosen=-1,options=null;for(const index of puzzle.whiteCells)if(!board[index]){const next=candidates(index);if(!next.length)return;if(!options||next.length<options.length){chosen=index;options=next;if(next.length===1)break;}}if(chosen<0){solutions.push([...board]);return;}for(const digit of options){board[chosen]=digit;search();board[chosen]=0;if(solutions.length>=limit||truncated)return;}};
  if(puzzle.runs.every(run=>kakuroRunFeasible(run,board,cache)))search();
  return {count:solutions.length,solution:solutions[0]||null,alternate:solutions[1]||null,nodes,truncated};
}

function generateKakuro(difficulty,providedRandom=null,testMode=false){
  const config=KAKURO_LEVELS[difficulty],nonce=++kakuroGenerationNonce,random=providedRandom||seededRandom((Date.now()+nonce*49979687)>>>0);
  for(let attempt=0;attempt<60;attempt++){
    const mask=makeKakuroMask(config.size,random,config.blockRatio),solution=makeKakuroSolution(mask,config.size,random),{runs,cellRuns}=buildKakuroRuns(mask,config.size,solution),whiteCells=mask.map((white,index)=>white?index:-1).filter(index=>index>=0);
    if(runs.some(run=>run.cells.length<2)||whiteCells.some(index=>cellRuns[index].length!==2))continue;
    const givens=Array(mask.length).fill(0),ordered=shuffle(whiteCells,random),base=Math.round(whiteCells.length*config.starterRatio);ordered.slice(0,base).forEach(index=>givens[index]=solution[index]);
    const puzzle={difficulty,...config,mask,solution,givens,runs,cellRuns,whiteCells};let solved=solveKakuro(puzzle,2);
    for(let guard=base;solved.count!==1&&guard<whiteCells.length;guard++){
      let index=solved.alternate&&solved.solution?whiteCells.find(cell=>solved.solution[cell]!==solved.alternate[cell]&&!givens[cell]):null;
      if(index==null)index=ordered.find(cell=>!givens[cell]);if(index==null)break;givens[index]=solution[index];solved=solveKakuro(puzzle,2);
    }
    if(solved.count!==1||solved.solution.join('')!==solution.join(''))continue;
    const signature=`${config.size}:${mask.map(Boolean).map(Number).join('')}:${runs.map(run=>run.target).join('.')}:${givens.join('')}`;
    if(!testMode&&progress.seen.kakuro.includes(signature))continue;
    if(!testMode){progress.seen.kakuro=[signature,...progress.seen.kakuro].slice(0,80);saveProgress();}
    return {...puzzle,signature,starterCount:givens.filter(Boolean).length};
  }
  throw new Error('暂时无法生成唯一解数和关卡，请重试');
}

function openKakuro(){
  state={kind:'kakuro-menu',timer:null};prepareGeneric('数和');stage.innerHTML=`<div class="stage-inner"><p class="eyebrow">加法推理 · 唯一解验证</p><h2>选择数和难度</h2><p>让每组白格之和等于黑格提示，同一横组或纵组内数字不可重复。</p><div class="choice-grid">${Object.entries(KAKURO_LEVELS).map(([id,level])=>`<button class="choice" data-kakuro-level="${id}"><b>${level.name} · ${level.size}×${level.size}</b><br><small>约 ${Math.round((level.size-1)**2*(1-level.blockRatio))} 个填数格</small></button>`).join('')}</div><button class="btn btn-secondary" id="kakuroTutorial" style="margin-top:12px">玩法教程</button></div>`;
  stage.querySelector('.choice-grid').addEventListener('click',event=>{const button=event.target.closest('[data-kakuro-level]');if(button)startKakuro(button.dataset.kakuroLevel);});document.getElementById('kakuroTutorial').addEventListener('click',showKakuroTutorial);
}

function showKakuroTutorial(){
  stage.innerHTML=`<div class="stage-inner"><p class="eyebrow">数和教程</p><h2>看两个方向的和</h2><div class="kakuro-tutorial"><div class="kakuro-clue"><span class="down">↓ 4</span><span class="across">→ 3</span></div><b>1</b><b>2</b><b>3</b></div><p>箭头向右的数字约束右侧连续白格，箭头向下的数字约束下方连续白格。例如“→ 3”的两格只能是 1 与 2。</p><p class="muted">每个答案还必须同时满足它所在的横组和纵组；同一组不能出现重复数字。</p><button class="btn btn-primary" id="kakuroTutorialDone">从入门开始</button></div>`;
  document.getElementById('kakuroTutorialDone').addEventListener('click',()=>startKakuro('easy'));
}

function startKakuro(difficulty){
  prepareGeneric('正在生成唯一解关卡…');let puzzle;try{puzzle=generateKakuro(difficulty);}catch(error){toast(error.message);return openKakuro();}
  state={kind:'kakuro',...puzzle,values:[...puzzle.givens],notes:{},selected:puzzle.whiteCells.find(index=>!puzzle.givens[index]),noteMode:false,history:[],mistakes:0,hints:0,startedAt:Date.now(),timer:null,feedback:'选择白格，再用下方数字键填写'};renderKakuro();
}

function kakuroClues(puzzle){
  const clues=Array.from({length:puzzle.mask.length},()=>({}));for(const run of puzzle.runs){const first=run.cells[0],clue=run.direction==='across'?first-1:first-puzzle.size;clues[clue][run.direction]=run.target;}return clues;
}

function renderKakuro(){
  stage.className='game-stage kakuro-stage';const filled=state.whiteCells.filter(index=>state.values[index]).length,clues=kakuroClues(state);document.getElementById('lives').textContent=`${KAKURO_LEVELS[state.difficulty].name} · 已填 ${filled}/${state.whiteCells.length}`;document.getElementById('level').textContent=`${state.size}×${state.size} · 提示数 ${state.starterCount}`;
  stage.innerHTML=`<div class="stage-inner"><h2>数和</h2><p class="muted">${state.feedback}</p><div class="kakuro-board" style="--kakuro-size:${state.size}">${state.mask.map((white,index)=>{if(!white){const clue=clues[index];return`<div class="kakuro-clue ${clue.across||clue.down?'has-clue':''}">${clue.down?`<span class="down">↓${clue.down}</span>`:''}${clue.across?`<span class="across">→${clue.across}</span>`:''}</div>`;}const given=state.givens[index],notes=state.notes[index]||[];return`<button class="kakuro-cell ${given?'given':''} ${index===state.selected?'selected':''}" data-kakuro-cell="${index}" aria-label="第 ${Math.floor(index/state.size)+1} 行第 ${index%state.size+1} 列${given?'，已知 '+given:''}">${state.values[index]||`<span class="kakuro-notes">${[1,2,3,4,5,6,7,8,9].map(n=>`<i>${notes.includes(n)?n:''}</i>`).join('')}</span>`}</button>`;}).join('')}</div><div class="kakuro-pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-kakuro-number="${n}">${n}</button>`).join('')}<button data-kakuro-number="0">⌫</button></div><div class="kakuro-toolbar"><button class="btn btn-secondary ${state.noteMode?'active':''}" id="noteKakuro">候选</button><button class="btn btn-secondary" id="undoKakuro">撤销</button><button class="btn btn-secondary" id="checkKakuro">查错</button><button class="btn btn-secondary" id="hintKakuro">AI 一步 · 30 XP</button><button class="btn btn-secondary" id="newKakuro">换题</button><button class="btn btn-secondary" id="closeKakuro">主页</button></div></div>`;
  stage.querySelector('.kakuro-board').addEventListener('click',event=>{const cell=event.target.closest('[data-kakuro-cell]');if(cell&&!state.givens[Number(cell.dataset.kakuroCell)]){state.selected=Number(cell.dataset.kakuroCell);renderKakuro();}});stage.querySelector('.kakuro-pad').addEventListener('click',event=>{const button=event.target.closest('[data-kakuro-number]');if(button)enterKakuro(Number(button.dataset.kakuroNumber));});document.getElementById('noteKakuro').addEventListener('click',()=>{state.noteMode=!state.noteMode;state.feedback=state.noteMode?'候选模式：数字会记在格内':'填数模式';renderKakuro();});document.getElementById('undoKakuro').addEventListener('click',undoKakuro);document.getElementById('checkKakuro').addEventListener('click',checkKakuro);document.getElementById('hintKakuro').addEventListener('click',hintKakuro);document.getElementById('newKakuro').addEventListener('click',()=>startKakuro(state.difficulty));document.getElementById('closeKakuro').addEventListener('click',closeGame);
}

function kakuroSnapshot(){return{values:[...state.values],notes:Object.fromEntries(Object.entries(state.notes).map(([key,value])=>[key,[...value]]))};}
function enterKakuro(digit){
  const index=state.selected;if(index==null||state.givens[index])return toast('请先选择一个可填写的白格');state.history.push(kakuroSnapshot());
  if(state.noteMode&&digit){const notes=new Set(state.notes[index]||[]);notes.has(digit)?notes.delete(digit):notes.add(digit);state.notes[index]=[...notes].sort();state.values[index]=0;}else{state.values[index]=digit;delete state.notes[index];}
  if(state.whiteCells.every(cell=>state.values[cell]===state.solution[cell])){renderKakuro();state.timer=setTimeout(finishKakuro,300);return;}state.feedback=digit?state.noteMode?'已更新候选数字':'已填入数字':'已清除当前格';renderKakuro();
}
function undoKakuro(){const previous=state.history.pop();if(!previous)return toast('还没有可撤销的操作');state.values=previous.values;state.notes=previous.notes;state.feedback='已撤销上一步';renderKakuro();}
function checkKakuro(){const wrong=state.whiteCells.filter(index=>state.values[index]&&state.values[index]!==state.solution[index]);if(wrong.length){state.mistakes++;state.selected=wrong[0];state.feedback=`发现 ${wrong.length} 个不正确的数字，已定位第一个`;}else state.feedback=state.whiteCells.every(index=>state.values[index])?'全部正确，正在完成':'目前填写的数字都正确';renderKakuro();}
function hintKakuro(){if(progress.xp<30)return toast('积分不足');const index=(state.selected&&!state.givens[state.selected]&&state.values[state.selected]!==state.solution[state.selected])?state.selected:state.whiteCells.find(cell=>state.values[cell]!==state.solution[cell]);if(index==null)return toast('当前关卡已经完成');state.history.push(kakuroSnapshot());progress.xp-=30;state.hints++;saveProgress();state.selected=index;state.values[index]=state.solution[index];delete state.notes[index];state.feedback='AI 已根据横纵约束填好一格';if(state.whiteCells.every(cell=>state.values[cell]===state.solution[cell])){renderKakuro();state.timer=setTimeout(finishKakuro,300);}else renderKakuro();}
function finishKakuro(){if(state.kind!=='kakuro')return;const seconds=Math.max(1,Math.round((Date.now()-state.startedAt)/1000)),{difficulty,size,starterCount,mistakes,hints}=state;completeGame('kakuro','数和',Math.max(100,760+size*35-starterCount*3-mistakes*30-hints*45-seconds),[{value:`${size}×${size}`,label:'棋盘'},{value:starterCount,label:'起始数'},{value:`${seconds}s`,label:'用时'}],()=>startKakuro(difficulty));}
