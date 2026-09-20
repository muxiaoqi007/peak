// Shared controls for new independent puzzle modules.
function freshPuzzle(key,make,signature){
  const seen=progress.seen[key]||[];
  for(let i=0;i<100;i++){const p=make(),id=signature(p);if(seen.includes(id))continue;progress.seen[key]=[id,...seen].slice(0,80);saveProgress();return p;}
  throw new Error('暂时无法生成新题，请重试');
}
function newPuzzleToolbar(){return '<div class="puzzle-toolbar"><button class="btn btn-secondary" data-action="undo">撤销</button><button class="btn btn-secondary" data-action="check">检查</button><button class="btn btn-secondary" data-action="hint">辅助 · 30 XP</button><button class="btn btn-secondary" data-action="new">换题</button><button class="btn btn-secondary" data-action="home">主页</button></div>';}
function bindNewPuzzleTools(undo,hint,next,check){for(const [name,fn] of Object.entries({undo,hint,new:next,check,home:closeGame}))stage.querySelector('[data-action="'+name+'"]').onclick=fn;}
