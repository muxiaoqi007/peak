// Shared application core — loaded as a classic script to support file:// usage.

const GAMES = [
  { id: 'number', icon: '123', title: '数字闪忆', desc: '记住一闪而过的数字，并按原顺序复现。', type: '记忆训练', ready: true },
  { id: 'color', icon: 'Aa', title: '颜色冲突', desc: '忽略文字含义，快速判断它真正的颜色。', type: '专注训练', ready: true },
  { id: 'math', icon: '±', title: '极速运算', desc: '在倒计时内判断算式是否成立。', type: '敏捷训练', ready: true },
  { id: 'path', icon: '↗', title: '路径回溯', desc: '观察路线，隐藏后完整地重走一遍。', type: '推理训练', ready: true },
  { id: 'sudoku', icon: '9×', title: '数独', desc: '用逻辑补全九宫格，每行每列不重复。', type: '经典益智', ready: true },
  { id: '2048', icon: '2ⁿ', title: '2048', desc: '合并相同数字，规划每一步的空间。', type: '经典益智', ready: true },
  { id: 'slide', icon: '▦', title: '华容滑块', desc: '移动方块，以更少步数还原目标。', type: '经典益智', ready: true },
  { id: 'huarong', icon: '将', title: '华容道', desc: '调兵遣将，为曹操打开华容道出口。', type: '经典益智', ready: true },
  { id: 'mine', icon: '·×', title: '扫雷', desc: '根据数字线索，找出所有隐藏雷区。', type: '经典益智', ready: true },
  { id: 'memory', icon: '□?', title: '记忆翻牌', desc: '翻开并配对所有图案，尽量减少尝试。', type: '记忆训练', ready: true },
  { id: 'hanoi', icon: '△', title: '汉诺塔', desc: '遵守小盘在上的规则，完成整塔迁移。', type: '经典益智', ready: true },
  { id: 'stroke', icon: '⌁', title: '一笔画', desc: '每条线只能经过一次，画完整个图形。', type: '推理训练', ready: true },
  { id: 'race', icon: 'ⅠⅡ', title: '赛马逻辑', desc: '根据线索推断每匹马的最终名次。', type: '逻辑推理', ready: true },
  { id: 'castle', icon: '城', title: '城堡拼图', desc: '拖动地图拼块，完整填满矩形区域。', type: '空间推理', ready: true },
  { id: 'nonogram', icon: '▥', title: '数织', desc: '根据行列数字线索，推理并填出隐藏图案。', type: '逻辑推理', ready: true },
  { id: 'logic-grid', icon: '✓×', title: '逻辑矩阵', desc: '阅读条件线索，用确定与排除找出唯一对应关系。', type: '逻辑推理', ready: true },
  { id: 'lights-out', icon: '✦', title: '开关灯', desc: '点击会影响相邻灯光，用最少步骤关闭全部灯。', type: '逻辑推理', ready: true },
  { id: 'kakuro', icon: 'Σ', title: '数和', desc: '根据横纵和提示填入数字，同一连续组不能重复。', type: '数字逻辑', ready: true },
  { id: 'hashi', icon: '≋', title: '数桥', desc: '按照岛屿数字架桥，让所有岛屿连成一个整体。', type: '逻辑推理', ready: true },
  { id: 'skyscrapers', icon: '▥', title: '摩天楼', desc: '根据四周视线提示，推断每栋楼的高度。', type: '数字逻辑', ready: true },
  { id: 'star-battle', icon: '★', title: '星星战役', desc: '在每行、每列和每个区域放置规定数量的星星。', type: '逻辑推理', ready: true },
  { id: 'sokoban', icon: '箱', title: '推箱子', desc: '规划行走与推动顺序，把所有箱子送到目标点。', type: '空间推理', ready: true },
  { id: 'akari', icon: '☀', title: '美术馆', desc: '放置灯泡照亮全部空间，同时满足数字墙提示。', type: '逻辑推理', ready: true }
];
const STORAGE_KEY = 'lizhi-progress-v1';
const SCORE_BANDS=[{grade:'S',min:900,label:'巅峰'},{grade:'A',min:800,label:'卓越'},{grade:'B',min:650,label:'稳健'},{grade:'C',min:450,label:'成长'},{grade:'D',min:0,label:'起步'}];
const ACHIEVEMENTS=[
  {id:'first',icon:'✦',title:'初露锋芒',desc:'完成第 1 次训练',reward:50,test:p=>p.sessions>=1},
  {id:'daily-four',icon:'四',title:'今日全勤',desc:'一天完成 4 次训练',reward:80,test:p=>p.completedToday>=4},
  {id:'explorer-five',icon:'⑤',title:'好奇旅人',desc:'体验 5 款不同游戏',reward:100,test:p=>distinctGames(p).size>=5},
  {id:'explorer-twelve',icon:'⑫',title:'博闻强识',desc:'体验 12 款不同游戏',reward:160,test:p=>distinctGames(p).size>=12},
  {id:'explorer-all',icon:'全',title:'万象通达',desc:`体验全部 ${GAMES.length} 款游戏`,reward:300,test:p=>distinctGames(p).size>=GAMES.length},
  {id:'score-a',icon:'A',title:'锋刃已成',desc:'任意游戏达到 A 段位',reward:120,test:p=>Math.max(0,...Object.values(p.best||{}))>=800},
  {id:'score-s',icon:'S',title:'登峰造极',desc:'任意游戏达到 S 段位',reward:240,test:p=>Math.max(0,...Object.values(p.best||{}))>=900},
  {id:'sessions-ten',icon:'10',title:'渐入佳境',desc:'累计完成 10 次训练',reward:120,test:p=>p.sessions>=10},
  {id:'sessions-fifty',icon:'50',title:'百炼成钢',desc:'累计完成 50 次训练',reward:260,test:p=>p.sessions>=50},
  {id:'sessions-hundred',icon:'百',title:'持之以恒',desc:'累计完成 100 次训练',reward:500,test:p=>p.sessions>=100},
  {id:'streak-seven',icon:'焰',title:'七日连锋',desc:'连续训练 7 天',reward:180,test:p=>p.streak>=7},
  {id:'balanced',icon:'衡',title:'四维均衡',desc:'四项核心能力均达到 700 分',reward:220,test:p=>['number','color','math','path'].every(id=>(p.best?.[id]||0)>=700)}
];
const DEFAULT_PROGRESS = { version: 10, streak: 1, xp: 999999, masteryXp:0, sessions: 0, completedToday: 0, dailyDate:'', dailyRewardDate:'', achievements:{}, best: {}, history: [], seen: { race: [], castle: [], nonogram: [], logicGrid: [], lightsOut: [], kakuro: [], hashi: [], skyscrapers: [], starBattle: [], sokoban: [], akari: [] } };
function dateKey(date=new Date()){return`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function scoreGrade(score){return SCORE_BANDS.find(band=>score>=band.min);}
function scoreStars(score){return score>=900?5:score>=800?4:score>=650?3:score>=450?2:1;}
function scoreReward(score){return 20+Math.floor(Math.max(0,Math.min(999,score))/25);}
function masteryLevel(xp){const safe=Math.max(0,Number(xp)||0),level=Math.floor(Math.sqrt(safe/1000))+1,start=(level-1)**2*1000,next=level**2*1000,titles=['初学者','探索者','解谜者','思辨者','策略家','大师','巅峰智者'];return{level,start,next,current:safe-start,needed:next-start,ratio:(safe-start)/(next-start),title:titles[Math.min(level-1,titles.length-1)]};}
function distinctGames(p){return new Set((p.history||[]).map(row=>row.game));}
function syncDailyProgress(p,date=new Date()){const today=dateKey(date);if(p.dailyDate!==today){p.dailyDate=today;p.completedToday=0;}return p;}
function eligibleAchievements(p){return ACHIEVEMENTS.filter(item=>!p.achievements?.[item.id]&&item.test(p));}
function unlockAchievements(p,at=new Date().toISOString()){const unlocked=eligibleAchievements(p);p.achievements=p.achievements||{};unlocked.forEach(item=>p.achievements[item.id]=at);return unlocked;}
function loadProgress(raw = localStorage.getItem(STORAGE_KEY)) {
  try { const data = raw ? JSON.parse(raw) : {}; let migrated = data.version === 1 ? { ...data, version: 2, xp: 999999 } : data; if((migrated.version||0)<3)migrated={...migrated,version:3,history:migrated.history||[]};if((migrated.version||0)<4)migrated={...migrated,version:4,seen:{race:[],castle:[]}};if((migrated.version||0)<5)migrated={...migrated,version:5,seen:{...(migrated.seen||{}),nonogram:[]}};if((migrated.version||0)<6)migrated={...migrated,version:6,seen:{...(migrated.seen||{}),logicGrid:[]}};if((migrated.version||0)<7)migrated={...migrated,version:7,seen:{...(migrated.seen||{}),lightsOut:[]}};if((migrated.version||0)<8)migrated={...migrated,version:8,seen:{...(migrated.seen||{}),kakuro:[]}};if((migrated.version||0)<9)migrated={...migrated,version:9,seen:{...(migrated.seen||{}),hashi:[],skyscrapers:[],starBattle:[],sokoban:[],akari:[]}};if((migrated.version||0)<10)migrated={...migrated,version:10,masteryXp:(migrated.history||[]).reduce((sum,row)=>sum+Math.round((row.score||0)*.6),0),achievements:migrated.achievements||{},dailyDate:migrated.dailyDate||dateKey(),dailyRewardDate:migrated.dailyRewardDate||''};const seen=migrated.seen||{},loaded={...DEFAULT_PROGRESS,...migrated,best:{...(migrated.best||{})},history:Array.isArray(migrated.history)?migrated.history:[],achievements:{...(migrated.achievements||{})},seen:{...DEFAULT_PROGRESS.seen,...seen}};return syncDailyProgress(loaded); }
  catch { return { ...DEFAULT_PROGRESS, best: {}, history: [], seen:{...DEFAULT_PROGRESS.seen} }; }
}
let progress = loadProgress();
const retroactiveAchievements=unlockAchievements(progress);if(retroactiveAchievements.length){progress.xp+=retroactiveAchievements.reduce((sum,item)=>sum+item.reward,0);localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));}
const saveProgress = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
const gamesEl = document.getElementById('games');
let gameFilter='all',gameQuery='';
function gameCategory(game){if(game.type.includes('记忆'))return'memory';if(game.type.includes('空间'))return'spatial';if(game.type.includes('经典'))return'classic';return'logic';}
function renderGameLibrary(){const query=gameQuery.trim().toLowerCase(),visible=GAMES.filter(game=>(gameFilter==='all'||gameCategory(game)===gameFilter)&&(!query||`${game.title}${game.desc}${game.type}`.toLowerCase().includes(query)));gamesEl.innerHTML=visible.map(g=>{const best=progress.best[g.id]||0,band=best?scoreGrade(best):null;return`<button class="game-card" data-game="${g.id}"><span class="game-icon">${g.icon}</span>${best?`<span class="game-best grade-${band.grade.toLowerCase()}">${band.grade} · ${best}</span>`:''}<div><h3>${g.title}</h3><p>${g.desc}</p></div><span class="game-meta"><span>${g.type}</span><span>${best?'再练一次':'开始'} →</span></span></button>`;}).join('')||'<div class="empty-state library-empty">没有找到匹配的游戏</div>';}

function renderAchievements(){const unlocked=progress.achievements||{},card=item=>`<article class="achievement-card ${unlocked[item.id]?'unlocked':'locked'}"><span class="achievement-icon">${item.icon}</span><div><h3>${item.title}</h3><p>${item.desc}</p><small>${unlocked[item.id]?`已解锁 · ${new Date(unlocked[item.id]).toLocaleDateString('zh-CN')}`:`奖励 +${item.reward} XP`}</small></div></article>`;const grid=document.getElementById('achievementGrid'),preview=document.getElementById('achievementPreview');if(grid)grid.innerHTML=ACHIEVEMENTS.map(card).join('');if(preview){const ordered=[...ACHIEVEMENTS].sort((a,b)=>Number(!!unlocked[b.id])-Number(!!unlocked[a.id]));preview.innerHTML=ordered.slice(0,4).map(card).join('');}const count=Object.keys(unlocked).length;document.getElementById('homeAchievementCount').textContent=`${count}/${ACHIEVEMENTS.length}`;document.getElementById('profileAchievementCount').textContent=`${count} / ${ACHIEVEMENTS.length}`;}

function renderProgress() {
  syncDailyProgress(progress);const level=masteryLevel(progress.masteryXp),fmt=value=>Number(value||0).toLocaleString('zh-CN');
  document.getElementById('streakCount').textContent = progress.streak;
  document.getElementById('workoutProgress').textContent = `${Math.min(progress.completedToday, 4)} / 4`;
  document.getElementById('progressFill').style.width = `${Math.min(progress.completedToday, 4) * 25}%`;
  document.querySelectorAll('[data-daily-index]').forEach(item=>item.classList.toggle('done',Number(item.dataset.dailyIndex)<progress.completedToday));
  document.getElementById('workoutReward').textContent=progress.dailyRewardDate===dateKey()?'今日奖励已领取':'完成奖励 +120 XP';
  document.getElementById('startWorkout').textContent=progress.completedToday>=4?'今日已完成 · 再练一局':'继续今日训练';
  [['number','memoryScore','memoryGrade'],['color','focusScore','focusGrade'],['math','agilityScore','agilityGrade'],['path','reasonScore','reasonGrade']].forEach(([id,scoreId,gradeId])=>{const score=progress.best[id]||0;document.getElementById(scoreId).textContent=score||'—';document.getElementById(gradeId).textContent=score?`${scoreGrade(score).grade} 段 · ${'★'.repeat(scoreStars(score))}`:'尚未评级';});
  document.getElementById('headerLevel').textContent=`LV ${level.level}`;document.getElementById('headerXp').textContent=fmt(progress.xp);
  document.getElementById('homeLevel').textContent=`LV ${level.level}`;document.getElementById('homeLevelName').textContent=level.title;document.getElementById('homeMasteryText').textContent=`${fmt(level.current)} / ${fmt(level.needed)} 脑力经验`;document.getElementById('homeMasteryFill').style.width=`${Math.min(100,level.ratio*100)}%`;document.getElementById('homeLevelNext').textContent=`距离下一等级还差 ${fmt(level.next-progress.masteryXp)}`;
  document.getElementById('profileXp').textContent = progress.xp.toLocaleString('zh-CN');
  document.getElementById('profileMastery').textContent=fmt(progress.masteryXp);document.getElementById('profileLevel').textContent=`LV ${level.level}`;document.getElementById('profileLevelName').textContent=level.title;document.getElementById('avatarLevel').textContent=level.level;document.getElementById('profileMasteryText').textContent=`${fmt(level.current)} / ${fmt(level.needed)}`;document.getElementById('profileMasteryFill').style.width=`${Math.min(100,level.ratio*100)}%`;
  document.getElementById('profileStreak').textContent = progress.streak;
  document.getElementById('profileSessions').textContent = progress.sessions;
  document.getElementById('reportSessions').textContent = `${progress.sessions} 次训练`;
  renderAchievements();renderGameLibrary();saveProgress();
}
function recordSession(game,score,meta={}){progress.history=[{game,score:Math.round(score),grade:scoreGrade(score).grade,stars:scoreStars(score),...meta,at:new Date().toISOString()},...(progress.history||[])].slice(0,100);}
const gameNames=Object.fromEntries(GAMES.map(g=>[g.id,g.title]));
function renderReports(){
  const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(6-i));return d;});
  const values=days.map(day=>{const next=new Date(day);next.setDate(next.getDate()+1);const rows=progress.history.filter(h=>{const t=new Date(h.at);return t>=day&&t<next;});return rows.length?Math.round(rows.reduce((a,b)=>a+b.score,0)/rows.length):0;});
  document.getElementById('trendChart').innerHTML=days.map((d,i)=>`<div class="trend-day"><div class="trend-bar" style="height:${Math.max(2,values[i]/10)}%" title="${values[i]} 分"></div><small>${d.getMonth()+1}/${d.getDate()}</small></div>`).join('');
  const best=Object.entries(progress.best).filter(([,v])=>v).sort((a,b)=>b[1]-a[1]);
  document.getElementById('bestList').innerHTML=best.length?best.map(([id,score])=>`<div class="best-row"><span>${gameNames[id]||id}<small>${'★'.repeat(scoreStars(score))}</small></span><strong><i>${scoreGrade(score).grade}</i>${score}</strong></div>`).join(''):'<div class="empty-state">完成一局后显示成绩</div>';
  document.getElementById('historyList').innerHTML=progress.history.length?progress.history.slice(0,16).map(h=>`<div class="history-row"><div><b>${gameNames[h.game]||h.game}</b><br><small>${new Date(h.at).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})} · ${'★'.repeat(h.stars||scoreStars(h.score))}</small></div><strong><i>${h.grade||scoreGrade(h.score).grade}</i>${h.score}</strong></div>`).join(''):'<div class="empty-state">还没有训练记录</div>';
  const scores=progress.history.map(row=>row.score),top=scores.length?scoreGrade(Math.max(...scores)).grade:'—';document.getElementById('reportAverage').textContent=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):'—';document.getElementById('reportTopGrade').textContent=top;document.getElementById('reportGames').textContent=`${distinctGames(progress).size}/${GAMES.length}`;document.getElementById('reportMastery').textContent=Number(progress.masteryXp||0).toLocaleString('zh-CN');
}
function toast(message) {
  const el = document.getElementById('toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 1800);
}

const gameScreen = document.getElementById('gameScreen');
const stage = document.getElementById('gameStage');
let state;
const gameLaunchers = new Map();
function registerGame(id, launcher) {
  if (gameLaunchers.has(id)) throw new Error(`游戏入口重复注册：${id}`);
  gameLaunchers.set(id, launcher);
}

function completeGame(id, title, score, stats, replay) {
  stage.className = 'game-stage';
  syncDailyProgress(progress);const finalScore = Math.max(0, Math.min(999, Math.round(score))),band=scoreGrade(finalScore),stars=scoreStars(finalScore),xpEarned=scoreReward(finalScore),masteryEarned=Math.max(40,Math.round(finalScore*.6));
  const isBest = finalScore > (progress.best[id] || 0);
  progress.best[id] = Math.max(finalScore, progress.best[id] || 0);
  progress.sessions++;progress.completedToday=Math.min(4,progress.completedToday+1);progress.masteryXp+=masteryEarned;
  let dailyBonus=0;if(progress.completedToday===4&&progress.dailyRewardDate!==dateKey()){dailyBonus=120;progress.dailyRewardDate=dateKey();}
  recordSession(id,finalScore,{xp:xpEarned+dailyBonus,mastery:masteryEarned});
  const unlocked=unlockAchievements(progress),achievementReward=unlocked.reduce((sum,item)=>sum+item.reward,0);progress.xp+=xpEarned+dailyBonus+achievementReward;
  saveProgress(); renderProgress();
  stage.innerHTML = `<div class="stage-inner result-screen"><p class="eyebrow">${isBest?'新的个人最佳':'训练完成'}</p><div class="result-rank grade-${band.grade.toLowerCase()}"><span>${band.grade}</span><small>${band.label}段位</small></div><div class="result-score">${finalScore}</div><div class="result-stars" aria-label="${stars} 星">${'★'.repeat(stars)}${'☆'.repeat(5-stars)}</div><p class="muted">${title} · 满分 999</p><div class="reward-strip"><span>+${xpEarned} 可用 XP</span><span>+${masteryEarned} 脑力经验</span>${dailyBonus?'<span class="bonus">每日目标 +120 XP</span>':''}</div>${unlocked.length?`<div class="result-achievements"><small>新成就</small>${unlocked.map(item=>`<span>${item.icon} ${item.title} · +${item.reward} XP</span>`).join('')}</div>`:''}<div class="result-grid">${stats.map(s => `<div><strong>${s.value}</strong><small>${s.label}</small></div>`).join('')}</div><button class="btn btn-primary" id="replayGeneric">再练一次</button><button class="btn btn-secondary" id="finishGeneric" style="width:100%;margin-top:9px">返回首页</button></div>`;
  document.getElementById('replayGeneric').addEventListener('click', replay);
  document.getElementById('finishGeneric').addEventListener('click', closeGame);
}
function prepareGeneric(title) {
  stage.className = 'game-stage';
  gameScreen.classList.add('open'); document.body.style.overflow = 'hidden';
  document.getElementById('lives').textContent = title; document.getElementById('level').textContent = '准备';
}

function shuffle(values, random = Math.random) { const out=[...values]; for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];} return out; }

function seededRandom(seed){let n=seed>>>0;return()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};}
