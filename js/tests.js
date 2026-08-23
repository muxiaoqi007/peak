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
    assert('malformed storage fallback', loadProgress('{broken').version === 5);
    assert('progress merge', loadProgress('{"streak":7}').streak === 7);
    assert('nonogram history migration', Array.isArray(loadProgress('{"version":4,"seen":{"race":[],"castle":[]}}').seen.nonogram));
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
    let nonogramSample=null;for(let i=0;i<200&&!nonogramSample;i++){const solution=makeNonogramCandidate(8,seededRandom(90210+i)),clues=nonogramPuzzleFromSolution(solution,8),solved=solveNonogram(clues.rows,clues.cols,2);if(solved.count===1)nonogramSample={solution,clues,solved};}
    assert('nonogram deterministic sample generated', !!nonogramSample);
    assert('nonogram solver unique', nonogramSample.solved.count === 1);
    assert('nonogram solver matches', nonogramSample.solved.solution.join('') === nonogramSample.solution.join(''));
    console.table(checks.map(name => ({ test: name, result: 'PASS' }))); return `${checks.length} tests passed`;
  }
};
