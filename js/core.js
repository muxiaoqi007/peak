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
const DEFAULT_PROGRESS = { version: 9, streak: 1, xp: 999999, sessions: 0, completedToday: 0, best: {}, history: [], seen: { race: [], castle: [], nonogram: [], logicGrid: [], lightsOut: [], kakuro: [], hashi: [], skyscrapers: [], starBattle: [], sokoban: [], akari: [] } };
function loadProgress(raw = localStorage.getItem(STORAGE_KEY)) {
  try { const data = raw ? JSON.parse(raw) : {}; let migrated = data.version === 1 ? { ...data, version: 2, xp: 999999 } : data; if((migrated.version||0)<3)migrated={...migrated,version:3,history:migrated.history||[]};if((migrated.version||0)<4)migrated={...migrated,version:4,seen:{race:[],castle:[]}};if((migrated.version||0)<5)migrated={...migrated,version:5,seen:{...(migrated.seen||{}),nonogram:[]}};if((migrated.version||0)<6)migrated={...migrated,version:6,seen:{...(migrated.seen||{}),logicGrid:[]}};if((migrated.version||0)<7)migrated={...migrated,version:7,seen:{...(migrated.seen||{}),lightsOut:[]}};if((migrated.version||0)<8)migrated={...migrated,version:8,seen:{...(migrated.seen||{}),kakuro:[]}};if((migrated.version||0)<9)migrated={...migrated,version:9,seen:{...(migrated.seen||{}),hashi:[],skyscrapers:[],starBattle:[],sokoban:[],akari:[]}}; const seen=migrated.seen||{};return { ...DEFAULT_PROGRESS, ...migrated, best: { ...DEFAULT_PROGRESS.best, ...(migrated.best || {}) }, history: Array.isArray(migrated.history)?migrated.history:[], seen:{...DEFAULT_PROGRESS.seen,...seen} }; }
  catch { return { ...DEFAULT_PROGRESS, best: {}, history: [], seen:{...DEFAULT_PROGRESS.seen} }; }
}
let progress = loadProgress();
const saveProgress = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
const gamesEl = document.getElementById('games');
gamesEl.innerHTML = GAMES.map(g => `<button class="game-card" data-game="${g.id}"><span class="game-icon">${g.icon}</span><div><h3>${g.title}</h3><p>${g.desc}</p></div><span class="game-meta"><span>${g.type}</span><span>开始 →</span></span></button>`).join('');

function renderProgress() {
  document.getElementById('streakCount').textContent = progress.streak;
  document.getElementById('workoutProgress').textContent = `${Math.min(progress.completedToday, 4)} / 4`;
  document.getElementById('progressFill').style.width = `${Math.min(progress.completedToday, 4) * 25}%`;
  document.getElementById('memoryScore').textContent = progress.best.number || '—';
  document.getElementById('focusScore').textContent = progress.best.color || '—';
  document.getElementById('agilityScore').textContent = progress.best.math || '—';
  document.getElementById('reasonScore').textContent = progress.best.path || '—';
  document.getElementById('profileXp').textContent = progress.xp.toLocaleString('zh-CN');
  document.getElementById('profileStreak').textContent = progress.streak;
  document.getElementById('profileSessions').textContent = progress.sessions;
  document.getElementById('reportSessions').textContent = `${progress.sessions} 次训练`;
}
function recordSession(game, score){progress.history=[{game,score:Math.round(score),at:new Date().toISOString()},...(progress.history||[])].slice(0,50);}
const gameNames=Object.fromEntries(GAMES.map(g=>[g.id,g.title]));
function renderReports(){
  const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(6-i));return d;});
  const values=days.map(day=>{const next=new Date(day);next.setDate(next.getDate()+1);const rows=progress.history.filter(h=>{const t=new Date(h.at);return t>=day&&t<next;});return rows.length?Math.round(rows.reduce((a,b)=>a+b.score,0)/rows.length):0;});
  document.getElementById('trendChart').innerHTML=days.map((d,i)=>`<div class="trend-day"><div class="trend-bar" style="height:${Math.max(2,values[i]/10)}%" title="${values[i]} 分"></div><small>${d.getMonth()+1}/${d.getDate()}</small></div>`).join('');
  const best=Object.entries(progress.best).filter(([,v])=>v).sort((a,b)=>b[1]-a[1]);
  document.getElementById('bestList').innerHTML=best.length?best.map(([id,score])=>`<div class="best-row"><span>${gameNames[id]||id}</span><strong>${score}</strong></div>`).join(''):'<div class="empty-state">完成一局后显示成绩</div>';
  document.getElementById('historyList').innerHTML=progress.history.length?progress.history.slice(0,12).map(h=>`<div class="history-row"><div><b>${gameNames[h.game]||h.game}</b><br><small>${new Date(h.at).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</small></div><strong>${h.score}</strong></div>`).join(''):'<div class="empty-state">还没有训练记录</div>';
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
  const finalScore = Math.max(0, Math.min(999, Math.round(score)));
  const isBest = finalScore > (progress.best[id] || 0);
  progress.best[id] = Math.max(finalScore, progress.best[id] || 0);
  progress.sessions++; progress.xp += Math.round(finalScore / 10); progress.completedToday = Math.min(4, progress.completedToday + 1); recordSession(id,finalScore);
  saveProgress(); renderProgress();
  stage.innerHTML = `<div class="stage-inner"><p class="eyebrow">训练完成</p><h2>${isBest ? '新的个人最佳' : title}</h2><div class="result-score">${finalScore}</div><p class="muted">${title}得分</p><div class="result-grid">${stats.map(s => `<div><strong>${s.value}</strong><small>${s.label}</small></div>`).join('')}</div><button class="btn btn-primary" id="replayGeneric">再练一次</button><button class="btn btn-secondary" id="finishGeneric" style="width:100%;margin-top:9px">返回首页</button></div>`;
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
