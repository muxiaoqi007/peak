// Browser regression tests — loaded as a classic script to support file:// usage.
window.MindPeakTests = {
  run() {
    const checks = [];
    const assert = (name, condition) => { if (!condition) throw new Error(name); checks.push(name); };
    assert('all games registered', gameLaunchers.size === GAMES.length && GAMES.every(game => gameLaunchers.has(game.id)));
    assert('external stylesheet loaded', [...document.styleSheets].some(sheet => sheet.href?.endsWith('/css/styles.css')));
    assert('sequence length', makeSequence(8, () => .2).length === 8);
    assert('no leading zero', makeSequence(6, () => 0)[0] !== '0');
    assert('wrong answer scores zero', calculateRoundScore(5, 1000, false) === 0);
    assert('higher difficulty scores more', calculateRoundScore(6, 1000, true) > calculateRoundScore(3, 1000, true));
    assert('malformed storage fallback', loadProgress('{broken').version === 8);
    assert('progress merge', loadProgress('{"streak":7}').streak === 7);
    assert('nonogram history migration', Array.isArray(loadProgress('{"version":4,"seen":{"race":[],"castle":[]}}').seen.nonogram));
    assert('logic grid history migration', Array.isArray(loadProgress('{"version":5,"seen":{"race":[],"castle":[],"nonogram":[]}}').seen.logicGrid));
    assert('lights out history migration', Array.isArray(loadProgress('{"version":6,"seen":{"logicGrid":[]}}').seen.lightsOut));
    assert('kakuro history migration', Array.isArray(loadProgress('{"version":7,"seen":{"lightsOut":[]}}').seen.kakuro));
    const colorTrial = makeColorTrial(() => .1);
    assert('color trial in range', colorTrial.word >= 0 && colorTrial.ink < COLORS.length);
    const mathTrial = makeMathTrial(10, () => .2);
    assert('math truth metadata', mathTrial.isTrue ? mathTrial.shown === mathTrial.actual : mathTrial.shown !== mathTrial.actual);
    const path = makePath(4, 6, () => .2);
    assert('path length', path.length === 6);
    assert('path unique', new Set(path.map(p => `${p.r}-${p.c}`)).size === path.length);
    assert('2048 merges once', mergeLine([2,2,2,2]).line.join(',') === '4,4,0,0');
    assert('2048 score', mergeLine([4,4,0,0]).score === 8);
    const slide = shuffledSliding(4);
    assert('sliding puzzle keeps all tiles', [...slide.board].sort((a,b)=>a-b).join(',') === [...Array(16)].map((_,i)=>i).join(','));
    assert('sliding solver path available', slide.history.length > 0);
    const sudoku = generateSudoku('medium');
    assert('generated sudoku has unique solution', solveSudoku([...sudoku.puzzle],2).count === 1);
    assert('generated sudoku solution valid', solveSudoku([...sudoku.puzzle],1).solution.join('') === sudoku.solution.join(''));
    const mineCells = plantMines(40);
    assert('mines count', mineCells.filter(c=>c.mine).length === 10);
    assert('first mine click safe', !mineCells[40].mine && mineNeighbors(40).every(i=>!mineCells[i].mine));
    assert('nonogram run clues', nonogramClues([true,true,false,true,false]).join(',') === '2,1');
    assert('nonogram line patterns', nonogramLinePatterns(5,[2,1]).length === 3);
    assert('nonogram defaults to empty board', DEFAULT_NONOGRAM_LEVEL === 'challenge' && NONOGRAM_LEVELS[DEFAULT_NONOGRAM_LEVEL].ratio === 0);
    let nonogramSample=null;for(let i=0;i<200&&!nonogramSample;i++){const solution=makeNonogramCandidate(8,seededRandom(90210+i)),clues=nonogramPuzzleFromSolution(solution,8),solved=solveNonogram(clues.rows,clues.cols,2);if(solved.count===1)nonogramSample={solution,clues,solved};}
    assert('nonogram deterministic sample generated', !!nonogramSample);
    assert('nonogram solver unique', nonogramSample.solved.count === 1);
    assert('nonogram solver matches', nonogramSample.solved.solution.join('') === nonogramSample.solution.join(''));
    assert('logic permutations', logicPermutations([0,1,2]).length === 6);
    const logicSolution=[[0,1,2],[1,2,0]],logicClues=logicSolution.flatMap((permutation,cat)=>permutation.map((item,person)=>({type:'personEq',cat,person,item}))),logicSolved=solveLogicGrid(3,2,logicClues,2);
    assert('logic matrix solver unique', logicSolved.count === 1);
    assert('logic matrix solver matches', logicSolved.solution.flat().join('') === logicSolution.flat().join(''));
    assert('lights center affects cross', lightsAffected(4,3).length === 5);
    const lightsBoard=applyLightPresses(Array(16).fill(0),4,[0,5,10]),lightsSolution=solveLightsOut(lightsBoard,4);
    assert('lights solver finds solution', Array.isArray(lightsSolution));
    assert('lights solver turns all off', applyLightPresses(lightsBoard,4,lightsSolution).every(value=>value===0));
    const kakuroSample=generateKakuro('easy',seededRandom(24681357),true),kakuroSolved=solveKakuro(kakuroSample,2);
    assert('kakuro groups all have length', kakuroSample.runs.every(run=>run.cells.length>=2));
    assert('kakuro generated unique', kakuroSolved.count === 1);
    assert('kakuro solver matches', kakuroSolved.solution.join('') === kakuroSample.solution.join(''));
    console.table(checks.map(name => ({ test: name, result: 'PASS' }))); return `${checks.length} tests passed`;
  }
};
