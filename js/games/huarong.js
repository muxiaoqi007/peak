// 三国华容道 — loaded as a classic script to support file:// usage.
registerGame('huarong', openHuarong);
const HUARONG_LEVELS=[
  ['横刀立马',38],['指挥若定',48],['将拥曹营',58],['齐头并进',68],['兵分三路',78],['左右布兵',88],
  ['桃花园中',98],['一路进军',112],['一夫当关',126],['层层设防',140],['水泄不通',156],['小燕出巢',176]
];
function huarongSolvedPieces(){return [
  {id:'cao',name:'曹操',portrait:'cao',w:2,h:2,x:1,y:3},{id:'guan',name:'关羽',portrait:'guan',w:2,h:1,x:1,y:2},
  {id:'zhang',name:'张飞',portrait:'zhang',w:1,h:2,x:0,y:0},{id:'zhao',name:'赵云',portrait:'zhao',w:1,h:2,x:3,y:0},
  {id:'huang',name:'黄忠',portrait:'huang',w:1,h:2,x:0,y:2},{id:'ma',name:'马超',portrait:'guard',w:1,h:2,x:3,y:2},
  {id:'s1',name:'兵',portrait:'guard',w:1,h:1,x:1,y:0},{id:'s2',name:'兵',portrait:'guard',w:1,h:1,x:2,y:0},
  {id:'s3',name:'兵',portrait:'guard',w:1,h:1,x:1,y:1},{id:'s4',name:'兵',portrait:'guard',w:1,h:1,x:2,y:1}
];}
    function canMoveHuarong(pieces,id,dx,dy){const p=pieces.find(x=>x.id===id),nx=p.x+dx,ny=p.y+dy;if(nx<0||ny<0||nx+p.w>4||ny+p.h>5)return false;for(const other of pieces){if(other.id===id)continue;if(nx<other.x+other.w&&nx+p.w>other.x&&ny<other.y+other.h&&ny+p.h>other.y)return false;}return true;}
function huarongClassicPieces(){const pieces=huarongSolvedPieces(),set=(id,x,y)=>Object.assign(pieces.find(p=>p.id===id),{x,y});set('cao',1,0);set('guan',1,2);set('zhang',0,0);set('zhao',3,0);set('huang',0,2);set('ma',3,2);set('s1',1,3);set('s2',2,3);set('s3',0,4);set('s4',3,4);return pieces;}
function makeHuarongLevel(levelIndex){
  const pieces=huarongClassicPieces(),random=seededRandom(7319+levelIndex*997),turns=levelIndex===0?0:HUARONG_LEVELS[levelIndex][1],history=[];let previous=null;
  for(let n=0;n<turns;n++){let options=[];for(const p of pieces)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(canMoveHuarong(pieces,p.id,dx,dy)&&!(p.id==='cao'&&p.x+dx===1&&p.y+dy===3))options.push({id:p.id,dx,dy});const filtered=options.filter(m=>!(previous&&previous.id===m.id&&previous.dx===-m.dx&&previous.dy===-m.dy));if(filtered.length)options=filtered;if(!options.length)break;const move=options[Math.floor(random()*options.length)],p=pieces.find(x=>x.id===move.id);p.x+=move.dx;p.y+=move.dy;history.push(move);previous=move;}
  return {pieces,history};
}
function huarongStateKey(pieces){const pos=id=>{const p=pieces.find(x=>x.id===id);return`${p.x}${p.y}`;},vertical=pieces.filter(p=>p.w===1&&p.h===2).map(p=>`${p.x}${p.y}`).sort().join(''),soldiers=pieces.filter(p=>p.w===1&&p.h===1).map(p=>`${p.x}${p.y}`).sort().join('');return pos('cao')+pos('guan')+vertical+soldiers;}
function solveHuarongNextMove(start){const root=start.map(p=>({...p})),queue=[{pieces:root,first:null}],seen=new Set([huarongStateKey(root)]);let head=0;while(head<queue.length&&head<120000){const current=queue[head++],cao=current.pieces.find(p=>p.id==='cao');if(cao.x===1&&cao.y===3)return current.first;for(const p of current.pieces)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(canMoveHuarong(current.pieces,p.id,dx,dy)){const next=current.pieces.map(x=>({...x})),m=next.find(x=>x.id===p.id);m.x+=dx;m.y+=dy;const key=huarongStateKey(next);if(!seen.has(key)){seen.add(key);queue.push({pieces:next,first:current.first||{id:p.id,dx,dy}});}}}return null;}
function openHuarong(){
  state={kind:'huarong-menu',timer:null};prepareGeneric('华容道');document.getElementById('lives').textContent=`${progress.xp} XP`;document.getElementById('level').textContent='12 关';
  stage.innerHTML=`<div class="stage-inner"><p class="eyebrow">三国经典益智</p><h2>华容道</h2><p>移动人物卡牌，让曹操从棋盘下方中央脱身。所有关卡都经过合法倒推，保证可解。</p><div class="huarong-levels">${HUARONG_LEVELS.map((l,i)=>`<button class="choice" data-hr-level="${i}"><b>${String(i+1).padStart(2,'0')} · ${l[0]}</b><br><small>${i<3?'入门':i<8?'进阶':'困难'}</small></button>`).join('')}</div><button class="btn btn-secondary" id="hrTutorial" style="margin-top:12px">查看玩法教程</button></div>`;
  stage.querySelector('.huarong-levels').addEventListener('click',e=>{const b=e.target.closest('[data-hr-level]');if(b)startHuarong(Number(b.dataset.hrLevel));});document.getElementById('hrTutorial').addEventListener('click',showHuarongTutorial);
}
function showHuarongTutorial(){stage.innerHTML=`<div class="stage-inner"><p class="eyebrow">玩法教程</p><h2>先腾挪，再突围</h2><p>点击一张人物卡，再用方向键移动。卡牌不能重叠，也不能越过棋盘边界。曹操是 2×2 主将卡；当他到达底部中央出口，即可通关。</p><div class="game-actions"><span class="tag">竖将 1×2</span><span class="tag">横将 2×1</span><span class="tag">士兵 1×1</span><span class="tag">曹操 2×2</span></div><button class="btn btn-primary" id="hrTutorialStart" style="margin-top:30px">从第一关开始</button></div>`;document.getElementById('hrTutorialStart').addEventListener('click',()=>startHuarong(0));}
function startHuarong(levelIndex){const generated=makeHuarongLevel(levelIndex);state={kind:'huarong',levelIndex,pieces:generated.pieces,selected:'cao',moves:0,hints:0,startedAt:Date.now(),timer:null};renderHuarong();}
function renderHuarong(){
  document.getElementById('lives').textContent=`移动 ${state.moves} · ${progress.xp} XP`;document.getElementById('level').textContent=HUARONG_LEVELS[state.levelIndex][0];
  stage.innerHTML=`<div class="stage-inner"><h2>${HUARONG_LEVELS[state.levelIndex][0]}</h2><div class="huarong-board">${state.pieces.map(p=>`<button class="hr-piece portrait-${p.portrait} ${state.selected===p.id?'selected':''}" data-hr-piece="${p.id}" data-name="${p.name}" style="left:${p.x*25}%;top:${p.y*20}%;width:${p.w*25}%;height:${p.h*20}%" aria-label="${p.name}"></button>`).join('')}</div><div class="dpad"><span></span><button data-hr-dir="0,-1">↑</button><span></span><button data-hr-dir="-1,0">←</button><button data-hr-dir="0,1">↓</button><button data-hr-dir="1,0">→</button></div><div class="game-actions" style="margin-top:12px"><button class="btn btn-secondary" id="assistHuarong">智能辅助一步 · 25 XP</button><button class="btn btn-secondary" id="levelsHuarong">选择关卡</button></div></div>`;
  stage.querySelector('.huarong-board').addEventListener('click',e=>{const p=e.target.closest('[data-hr-piece]');if(p){state.selected=p.dataset.hrPiece;renderHuarong();}});stage.querySelector('.dpad').addEventListener('click',e=>{if(e.target.dataset.hrDir){const [dx,dy]=e.target.dataset.hrDir.split(',').map(Number);moveHuarong(state.selected,dx,dy,false);}});document.getElementById('assistHuarong').addEventListener('click',assistHuarong);document.getElementById('levelsHuarong').addEventListener('click',openHuarong);
}
function moveHuarong(id,dx,dy,fromHint=false){if(!canMoveHuarong(state.pieces,id,dx,dy))return;const p=state.pieces.find(x=>x.id===id);p.x+=dx;p.y+=dy;state.moves++;
  const cao=state.pieces.find(x=>x.id==='cao');if(cao.x===1&&cao.y===3){const seconds=Math.round((Date.now()-state.startedAt)/1000);return completeGame('huarong','华容道',Math.max(100,999-state.moves-state.hints*30-seconds/3),[{value:state.moves,label:'移动'},{value:`${seconds}s`,label:'用时'},{value:HUARONG_LEVELS[state.levelIndex][0],label:'关卡'}],()=>startHuarong(state.levelIndex));}renderHuarong();}
function assistHuarong(){if(progress.xp<25)return toast('积分不足，完成训练可以获得 XP');toast('正在分析当前局面…');setTimeout(()=>{const move=solveHuarongNextMove(state.pieces);if(!move)return toast('当前局面未找到可行路径');progress.xp-=25;state.hints++;saveProgress();state.selected=move.id;moveHuarong(move.id,move.dx,move.dy,true);},30);}
