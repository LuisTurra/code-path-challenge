const gridSize = 5;
const cellSize = 64;
let cubePos = { x: 0, y: 0 };
let endPos = { x: 4, y: 4 };
let commands = [];
let functionCommands = [];
let currentPathCoords = [];
let phaseProgress = { current: 1, unlocked: [1] };
let isAnimating = false;
let mainCommandLimit = Infinity;

function showStartScreen() { document.getElementById('start-screen').classList.add('active'); document.getElementById('game-screen').classList.remove('active'); closeTutorial(); }
function startPhase(id) {
    if (!phaseProgress.unlocked.includes(id)) return;
    phaseProgress.current = id;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    document.querySelectorAll('.phase-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`phase-${id}-btn`).classList.add('active');
    initPhase(id);
    if (id === 1 || id === 3) showTutorial();
}
function initPhase(id) {
    const phase = phases.find(p => p.id === id);
    currentPathCoords = phase.coords;
    cubePos = phase.startPos || { x: 0, y: 0 };
    endPos = phase.endPos || phase.coords[phase.coords.length - 1];

    mainCommandLimit = phase.mainCommandLimit || Infinity;
    const hasFunc = !!phase.hasFunction;

    // === NEW: Show command limit text from Phase 3+ ===
    const limitText = document.getElementById('command-limit-text');
    const limitNum = document.getElementById('limit-number');
    if (phase.mainCommandLimit && phase.mainCommandLimit < Infinity) {
        limitNum.textContent = phase.mainCommandLimit;
        limitText.style.display = 'block';
    } else {
        limitText.style.display = 'none';
    }

    document.getElementById('function-btn').style.display = hasFunc ? 'inline-block' : 'none';
    document.getElementById('function-box').style.display = hasFunc ? 'block' : 'none';
    functionCommands = []; updateFunctionDisplay();

    if (id === 3) showPhase3Tutorial();
    initGame();
}
function initGame() {
    const grid = document.getElementById('grid'); grid.innerHTML = '';
    for (let y = 0; y < gridSize; y++)for (let x = 0; x < gridSize; x++) {
        const cell = document.createElement('div'); cell.className = 'grid-cell'; cell.dataset.x = x; cell.dataset.y = y; grid.appendChild(cell);
    }
    currentPathCoords.forEach(p => { document.querySelector(`.grid-cell[data-x="${p.x}"][data-y="${p.y}"]`).classList.add('path'); });
    const o = 4;
    document.getElementById('cube').style.left = `${cubePos.x * cellSize + o}px`;
    document.getElementById('cube').style.top = `${cubePos.y * cellSize + o}px`;
    document.getElementById('start-point').style.left = `${cubePos.x * cellSize + o}px`;
    document.getElementById('start-point').style.top = `${cubePos.y * cellSize + o}px`;
    document.getElementById('end-point').style.left = `${endPos.x * cellSize + o}px`;
    document.getElementById('end-point').style.top = `${endPos.y * cellSize + o}px`;
    resetCommands();
}
function resetCommands() {
    commands = []; cubePos = { x: 0, y: 0 };
    document.getElementById('command-list').innerHTML = 'Commands: <span style="color:#666">[]</span>';
    document.getElementById('start-btn').textContent = 'Start';
    isAnimating = false;
    document.querySelectorAll('.grid-cell').forEach(c => c.classList.remove('visited'));
}
function addCommand(dir) {
    if (isAnimating) return;
    if (commands.length >= mainCommandLimit) { alert(`Only ${mainCommandLimit} main commands allowed! Use FUNCTION (F)`); return; }
    commands.push(dir); updateCommandDisplay();
}
function addFunctionCommand() {
    if (isAnimating) return;
    if (commands.length >= mainCommandLimit) { alert('Main command limit reached!'); return; }
    commands.push('F'); updateCommandDisplay();
}
function addToFunction(dir) { if (isAnimating) return; functionCommands.push(dir); updateFunctionDisplay(); }
function clearFunction() { functionCommands = []; updateFunctionDisplay(); }
function updateCommandDisplay() {
    const list = document.getElementById('command-list');
    if (commands.length === 0) { list.innerHTML = 'Commands: <span style="color:#666">[]</span>'; return; }
    list.innerHTML = 'Commands: ';
    commands.forEach(c => { const icon = document.createElement('span'); icon.className = 'cmd-icon' + (c === 'F' ? ' function-icon' : ''); icon.innerHTML = c === 'F' ? '<i class="fas fa-cogs"></i>' : getDirectionIcon(c); list.appendChild(icon); });
}
function updateFunctionDisplay() {
    const box = document.getElementById('function-commands');
    if (functionCommands.length === 0) { box.innerHTML = '<span style="color:#666">[]</span>'; return; }
    box.innerHTML = '';
    functionCommands.forEach(dir => { const icon = document.createElement('span'); icon.className = 'cmd into function-icon'; icon.innerHTML = getDirectionIcon(dir); box.appendChild(icon); });
}
function getDirectionIcon(d) {
    const icons = { 'up': '<i class="fas fa-arrow-up"></i>', 'down': '<i class="fas fa-arrow-down"></i>', 'left': '<i class="fas fa-arrow-left"></i>', 'right': '<i class="fas fa-arrow-right"></i>' };
    return icons[d] || '';
}
function startGame() {
    if (commands.length === 0 || isAnimating) return;
    isAnimating = true; document.getElementById('start-btn').textContent = 'Running...';
    let pos = { x: 0, y: 0 }; let step = 0;
    function exec() {
        if (step >= commands.length) { checkWin(pos); return; }
        const cmd = commands[step];
        if (cmd === 'F') {
            let fi = 0;
            function runF() {
                if (fi >= functionCommands.length) { step++; setTimeout(exec, 400); return; }
                move(functionCommands[fi], () => { fi++; setTimeout(runF, 400); });
            }
            runF();
        } else {
            move(cmd, () => { step++; setTimeout(exec, 400); });
        }
    }
    function move(c, cb) {
        let np = { ...pos };
        if (c === 'up' && pos.y > 0) np.y--;
        if (c === 'down' && pos.y < gridSize - 1) np.y++;
        if (c === 'left' && pos.x > 0) np.x--;
        if (c === 'right' && pos.x < gridSize - 1) np.x++;
        const onPath = currentPathCoords.some(p => p.x === np.x && p.y === np.y);
        if (!onPath) { showFail('Cube left the path!'); return; }
        pos = np;
        document.getElementById('cube').style.left = `${pos.x * cellSize + 4}px`;
        document.getElementById('cube').style.top = `${pos.y * cellSize + 4}px`;
        document.querySelector(`.grid-cell[data-x="${pos.x}"][data-y="${pos.y}"]`).classList.add('visited');
        cb();
    }
    exec();
}
function checkWin(p) { p.x === endPos.x && p.y === endPos.y ? showWin() : showFail('Did not reach B!'); }
function showWin() {
    isAnimating = false;
    document.getElementById('result-title').textContent = 'Phase Complete!';
    document.getElementById('result-message').textContent = 'You reached B on the path!';
    document.getElementById('next-btn').style.display = 'inline-block';
    const next = phaseProgress.current + 1;
    if (!phaseProgress.unlocked.includes(next) && phases[next - 1]) {
        phaseProgress.unlocked.push(next);
        document.getElementById(`phase-${next}-btn`)?.classList.remove('locked');
    }
    document.getElementById('result-modal').style.display = 'block';
}
function showFail(msg) {
    isAnimating = false;
    document.getElementById('result-title').textContent = 'Failed';
    document.getElementById('result-message').textContent = msg;
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('result-modal').style.display = 'block';
}
function nextPhase() { closeModal(); startPhase(phaseProgress.current + 1); }
function resetGame() { resetCommands(); initGame(); }
function closeModal() { document.getElementById('result-modal').style.display = 'none'; }
function showTutorial() { document.getElementById('tutorial-modal').style.display = 'block'; }
function toggleTutorial() { const m = document.getElementById('tutorial-modal'); m.style.display = m.style.display === 'block' ? 'none' : 'block'; }
function closeTutorial() { document.getElementById('tutorial-modal').style.display = 'none'; }
function showPhase3Tutorial() {
    document.querySelector('#tutorial-modal .modal-content').innerHTML = `
    <span class="close" onclick="closeTutorial()">&times;</span>
    <h3>New: FUNCTION (F)</h3>
    <p>You now have <strong>4 main commands</strong>!</p>
    <p>Use the orange <strong>FUNCTION box</strong>:<br>
    • Add moves with the small arrows<br>
    • Press the orange <strong>F</strong> button to use it<br>
    • You can use F multiple times!</p>
    <p><strong>Solve Phase 3 with ≤4 main commands!</strong></p>
  `;
    showTutorial();
}
window.addEventListener('load', () => startPhase(1));