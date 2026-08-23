// 扫雷 — loaded as a classic script to support file:// usage.
registerGame('mine', openMines);
function mineNeighbors(index) { const r=Math.floor(index/9),c=index%9,out=[]; for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const nr=r+dr,nc=c+dc;if((dr||dc)&&nr>=0&&nr<9&&nc>=0&&nc<9)out.push(nr*9+nc);} return out; }
function plantMines(safe, random=Math.random) {
  const mines=new Set(); while(mines.size<10){const i=Math.floor(random()*81);if(i!==safe&&!mineNeighbors(safe).includes(i))mines.add(i);} return [...Array(81)].map((_,i)=>({mine:mines.has(i),revealed:false,flagged:false,count:0})).map((cell,i,all)=>({...cell,count:mineNeighbors(i).filter(n=>all[n].mine).length}));
}
function openMines() { state={kind:'mine',cells:null,revealed:new Set(),flags:new Set(),flagMode:false,startedAt:Date.now(),timer:null};prepareGeneric('扫雷');renderMines(); }
function renderMines(message='首次点击保证安全') {
  const cells=state.cells||Array.from({length:81},()=>({mine:false,revealed:false,flagged:false,count:0}));
  document.getElementById('lives').textContent=`旗帜 ${state.flags.size} / 10`;document.getElementById('level').textContent='初级 9×9';
  stage.innerHTML=`<div class="stage-inner"><h2>扫雷</h2><p class="muted">${message}</p><div class="mine-board">${cells.map((c,i)=>`<button class="mine-cell ${c.revealed?'revealed':''} ${c.flagged?'flagged':''}" data-mine="${i}">${c.flagged?'⚑':c.revealed?(c.mine?'×':c.count||''):''}</button>`).join('')}</div><div class="game-actions"><button class="btn ${state.flagMode?'btn-primary':'btn-secondary'}" id="flagMode">${state.flagMode?'标记模式已开':'标记模式'}</button><button class="btn btn-secondary" id="restartMine">新棋盘</button></div></div>`;
  stage.querySelector('.mine-board').addEventListener('click',e=>{const i=e.target.dataset.mine;if(i!==undefined)state.flagMode?flagMine(Number(i)):revealMine(Number(i));});
  stage.querySelector('.mine-board').addEventListener('contextmenu',e=>{e.preventDefault();const i=e.target.dataset.mine;if(i!==undefined)flagMine(Number(i));});
  document.getElementById('flagMode').addEventListener('click',()=>{state.flagMode=!state.flagMode;renderMines();});document.getElementById('restartMine').addEventListener('click',openMines);
}
function flagMine(i){if(!state.cells||state.cells[i].revealed)return;state.cells[i].flagged=!state.cells[i].flagged;state.cells[i].flagged?state.flags.add(i):state.flags.delete(i);renderMines();}
function revealMine(i){if(!state.cells)state.cells=plantMines(i);const cell=state.cells[i];if(cell.flagged||cell.revealed)return;if(cell.mine){cell.revealed=true;state.cells.forEach(c=>{if(c.mine)c.revealed=true;});renderMines('踩到地雷，挑战结束');return state.timer=setTimeout(()=>completeGame('mine','扫雷',Math.max(50,state.revealed.size*8),[{value:state.revealed.size,label:'安全格'},{value:state.flags.size,label:'旗帜'},{value:'未完成',label:'结果'}],openMines),900);}const queue=[i];while(queue.length){const n=queue.pop(),c=state.cells[n];if(c.revealed||c.flagged)continue;c.revealed=true;state.revealed.add(n);if(c.count===0)mineNeighbors(n).forEach(x=>{if(!state.cells[x].revealed&&!state.cells[x].mine)queue.push(x);});}if(state.revealed.size===71){const seconds=Math.round((Date.now()-state.startedAt)/1000);return completeGame('mine','扫雷',Math.max(100,999-seconds),[{value:'胜利',label:'结果'},{value:`${seconds}s`,label:'用时'},{value:state.flags.size,label:'旗帜'}],openMines);}renderMines();}
