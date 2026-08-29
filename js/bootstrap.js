// Application event bindings — loaded as a classic script to support file:// usage.
function navigatePage(pageId){document.querySelectorAll('.app').forEach(page=>page.classList.toggle('hidden',page.id!==pageId));document.querySelectorAll('[data-tab]').forEach(button=>button.classList.toggle('active',button.dataset.tab===pageId));if(pageId==='progressPage')renderReports();renderProgress();window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>navigatePage(button.dataset.tab)));
document.getElementById('viewAchievements').addEventListener('click',()=>navigatePage('profilePage'));
document.getElementById('gameFilters').addEventListener('click',event=>{const button=event.target.closest('[data-game-filter]');if(!button)return;gameFilter=button.dataset.gameFilter;document.querySelectorAll('[data-game-filter]').forEach(item=>item.classList.toggle('active',item===button));renderGameLibrary();});
document.getElementById('gameSearch').addEventListener('input',event=>{gameQuery=event.target.value;renderGameLibrary();});
document.getElementById('resetProgress').addEventListener('click',()=>{if(!confirm('确定清除这台设备上的全部训练数据吗？'))return;progress={...DEFAULT_PROGRESS,dailyDate:dateKey(),best:{},history:[],achievements:{},seen:{...DEFAULT_PROGRESS.seen}};saveProgress();renderProgress();renderReports();toast('本地训练数据已重置');});
gamesEl.addEventListener('click', e => {
  const card = e.target.closest('[data-game]'); if (!card) return;
  const launcher = gameLaunchers.get(card.dataset.game);
  launcher ? launcher() : toast('这款游戏已列入下一阶段');
});
document.getElementById('startWorkout').addEventListener('click',()=>{const daily=[openNumberGame,openColorGame,openMathGame,openPathGame];daily[Math.min(progress.completedToday,daily.length-1)]();});

function closeGame() { clearTimeout(state?.timer); stage.className = 'game-stage'; gameScreen.classList.remove('open'); document.body.style.overflow = ''; }
document.getElementById('closeGame').addEventListener('click', closeGame);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && gameScreen.classList.contains('open')) closeGame(); });
document.addEventListener('keydown', e => { if (state?.kind !== '2048') return; const directions={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(directions[e.key]){e.preventDefault();play2048(directions[e.key]);} });
document.addEventListener('keydown', e => { if (state?.kind !== 'sokoban') return; const directions={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(directions[e.key]){e.preventDefault();playSokoban(directions[e.key]);} });

renderProgress();
