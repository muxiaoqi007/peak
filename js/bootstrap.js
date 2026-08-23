// Application event bindings — loaded as a classic script to support file:// usage.
document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.app').forEach(page=>page.classList.toggle('hidden',page.id!==button.dataset.tab));document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===button));if(button.dataset.tab==='progressPage')renderReports();renderProgress();window.scrollTo({top:0,behavior:'smooth'});}));
document.getElementById('resetProgress').addEventListener('click',()=>{if(!confirm('确定清除这台设备上的全部训练数据吗？'))return;progress={...DEFAULT_PROGRESS,best:{},history:[]};saveProgress();renderProgress();renderReports();toast('本地训练数据已重置');});
gamesEl.addEventListener('click', e => {
  const card = e.target.closest('[data-game]'); if (!card) return;
  const launcher = gameLaunchers.get(card.dataset.game);
  launcher ? launcher() : toast('这款游戏已列入下一阶段');
});
document.getElementById('startWorkout').addEventListener('click', openNumberGame);

function closeGame() { clearTimeout(state?.timer); stage.className = 'game-stage'; gameScreen.classList.remove('open'); document.body.style.overflow = ''; }
document.getElementById('closeGame').addEventListener('click', closeGame);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && gameScreen.classList.contains('open')) closeGame(); });
document.addEventListener('keydown', e => { if (state?.kind !== '2048') return; const directions={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(directions[e.key]){e.preventDefault();play2048(directions[e.key]);} });

renderProgress();
