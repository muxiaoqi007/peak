const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context=vm.createContext({registerGame(){},Math,Set,Map});
vm.runInContext('function shuffle(a,r=Math.random){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}function seeded(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}}',context);
for(const file of ['futoshiki','peg-solitaire'])vm.runInContext(fs.readFileSync(__dirname+'/games/'+file+'.js','utf8'),context);
for(let level=0;level<3;level++)for(let seed=1;seed<=20;seed++){
  context.level=level;context.seed=seed;
  assert(vm.runInContext('(()=>{const p=generateFuto(level,seeded(seed)),s=solveFuto(p);return s.count===1&&!s.truncated&&s.solution.join()===p.solution.join()&&p.givens.includes(0);})()',context));
  assert(vm.runInContext('(()=>{const p=generatePeg(level,seeded(seed));let b=p.pegs;for(const m of p.path){if(!pegMoves(b).some(x=>x.from===m.from&&x.to===m.to))return false;b=applyPeg(b,m);}return b.size===1&&solvePeg(p.pegs).path!==null;})()',context));
}
assert(vm.runInContext('solveFuto({n:2,givens:[1,1,0,0],inequalities:[]}).count===0',context));
console.log('Passed: 60 unique Futoshiki puzzles, 60 playable Peg Solitaire paths, invalid-input rejection.');
