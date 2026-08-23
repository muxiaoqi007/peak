// 华容滑块 — loaded as a classic script to support file:// usage.
registerGame('slide', openSliding);
function shuffledSliding(size=4, random = Math.random) {
  const board=[...Array(size*size-1)].map((_,i)=>i+1).concat(0),history=[];let empty=board.length-1,last=-1;const turns={3:45,4:120,5:220}[size];
  for(let n=0;n<turns;n++){const r=Math.floor(empty/size),c=empty%size;let options=[];if(r)options.push(empty-size);if(r<size-1)options.push(empty+size);if(c)options.push(empty-1);if(c<size-1)options.push(empty+1);options=options.filter(i=>i!==last);const pick=options[Math.floor(random()*options.length)],tile=board[pick];[board[empty],board[pick]]=[board[pick],board[empty]];history.push(tile);last=empty;empty=pick;}
  return {board,history};
}
function openSliding() {
  state={kind:'slide-menu',timer:null};prepareGeneric('华容滑块');
  stage.innerHTML=`<div class="stage-inner"><p class="eyebrow">从入门到进阶</p><h2>选择滑块难度</h2><p>所有棋盘都从完成状态经过合法移动洗牌，因此保证可解。</p><div class="choice-grid"><button class="choice" data-slide-size="3">3×3<br><small>新手入门</small></button><button class="choice" data-slide-size="4">4×4<br><small>经典挑战</small></button><button class="choice" data-slide-size="5">5×5<br><small>进阶挑战</small></button><button class="choice" id="slideTutorial">玩法教程</button></div></div>`;
  stage.querySelector('.choice-grid').addEventListener('click',e=>{const b=e.target.closest('[data-slide-size]');if(b)startSliding(Number(b.dataset.slideSize));});document.getElementById('slideTutorial').addEventListener('click',showSlidingTutorial);
}
function showSlidingTutorial(){stage.innerHTML=`<div class="stage-inner"><p class="eyebrow">60 秒教程</p><h2>把数字送回顺序</h2><p>点击空格上、下、左、右相邻的数字，把它移入空格。目标是从左上到右下排列为 1、2、3…，最后留下空格。</p><div class="slide-board" style="grid-template-columns:repeat(3,1fr);max-width:280px"><button class="slide-tile">1</button><button class="slide-tile">2</button><button class="slide-tile">3</button><button class="slide-tile">4</button><button class="slide-tile">5</button><button class="slide-tile">6</button><button class="slide-tile">7</button><button class="slide-tile empty"></button><button class="slide-tile">8</button></div><p class="muted">这里点击 8，它就会进入空格，拼图完成。</p><button class="btn btn-primary" id="tutorialStart">开始 3×3</button></div>`;document.getElementById('tutorialStart').addEventListener('click',()=>startSliding(3));}
function startSliding(size){const mixed=shuffledSliding(size);state={kind:'slide',size,board:mixed.board,history:mixed.history,moves:0,hints:0,startedAt:Date.now(),timer:null};renderSliding();}
function renderSliding() {
  document.getElementById('lives').textContent=`移动 ${state.moves}`;document.getElementById('level').textContent=`${state.size}×${state.size} · ${progress.xp} XP`;
  stage.innerHTML = `<div class="stage-inner"><h2>华容滑块</h2><p class="muted">移动空格旁的数字，按顺序还原</p><div class="slide-board" style="grid-template-columns:repeat(${state.size},1fr)">${state.board.map((v,i)=>`<button class="slide-tile ${v===0?'empty':''}" data-slide="${i}" ${v===0?'disabled':''}>${v||''}</button>`).join('')}</div><div class="game-actions"><button class="btn btn-secondary" id="assistSlide">智能辅助一步 · 15 XP</button><button class="btn btn-secondary" id="reshuffle">换个难度</button></div></div>`;
  stage.querySelector('.slide-board').addEventListener('click', e => { const i=e.target.dataset.slide; if(i!==undefined) moveSliding(Number(i),false); });document.getElementById('assistSlide').addEventListener('click',assistSliding);document.getElementById('reshuffle').addEventListener('click',openSliding);
}
function moveSliding(index,fromHint=false) {
  const size=state.size,empty=state.board.indexOf(0),r=Math.floor(index/size),c=index%size,er=Math.floor(empty/size),ec=empty%size;if(Math.abs(r-er)+Math.abs(c-ec)!==1)return;
  const tile=state.board[index];[state.board[index],state.board[empty]]=[state.board[empty],state.board[index]];state.moves++;
  if(fromHint)state.history.pop();else if(state.history[state.history.length-1]===tile)state.history.pop();else state.history.push(tile);
  if(state.board.every((v,i)=>v===(i===state.board.length-1?0:i+1))){const seconds=Math.round((Date.now()-state.startedAt)/1000);return completeGame('slide','华容滑块',Math.max(100,950-state.moves-seconds/2-state.hints*20),[{value:state.moves,label:'移动'},{value:`${seconds}s`,label:'用时'},{value:`${size}×${size}`,label:'棋盘'}],openSliding);}renderSliding();
}
function assistSliding(){if(progress.xp<15)return toast('积分不足，完成训练可以获得 XP');const tile=state.history[state.history.length-1];if(tile===undefined)return;const index=state.board.indexOf(tile);progress.xp-=15;state.hints++;saveProgress();moveSliding(index,true);}
