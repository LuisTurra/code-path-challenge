const gridSize = 6;
const cellSize = 64;
// let cubePos = { x: 0, y: 0 };
// let endPos = { x: 5, y: 5 };
let commands = [];
let functionCommands = [];
let currentPathCoords = [];
let phaseProgress = { current: 1, unlocked: [1] };
let isAnimating = false;
let mainCommandLimit = Infinity;
let currentFunctionLimit = Infinity;
let currentPhase = 1;
let gameStartTime = 0;

function showStartScreen() {
  document.getElementById('start-screen').classList.add('active');
  document.getElementById('game-screen').classList.remove('active');
  closeTutorial();
  closePhaseSelection();
}

function startPhase(id) {
  if (!phaseProgress.unlocked.includes(id)) return;
  phaseProgress.current = id;
  currentPhase = id;
  document.getElementById('start-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  document.querySelectorAll('.phase-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`phase-${id}-btn`).classList.add('active');
  document.getElementById('ranking-phase-num').textContent = id;
  initPhase(id);

  if (id === 1) showBasicTutorial();
  else if (id === 3) showPhase3Tutorial();
}

function initPhase(id) {
  const phase = phases.find(p => p.id === id);
  currentPathCoords = phase.coords;
  cubePos = phase.startPos || { x: 0, y: 0 };
  endPos = phase.endPos || phase.coords[phase.coords.length - 1];
  mainCommandLimit = phase.mainCommandLimit || Infinity;
  functionCommandLimit = phase.functionCommandLimit || Infinity;
  const hasFunc = !!phase.hasFunction;
  const limitText = document.getElementById('command-limit-text');
  const limitNum = document.getElementById('limit-number');
  const funclimitText = document.getElementById('func-limit-text');
  const funclimitNum = document.getElementById('func-limit-number');
  if (phase.mainCommandLimit && phase.mainCommandLimit < Infinity && phase.functionCommandLimit && phase.functionCommandLimit < Infinity) {
    limitNum.textContent = phase.mainCommandLimit;
    limitText.style.display = 'block';

    funclimitNum.textContent = phase.functionCommandLimit;
    funclimitText.style.display = 'block';
  }
  else {
    limitText.style.display = 'none';
    funclimitText.style.display = 'none';
  }
  
  document.getElementById('function-btn').style.display = hasFunc ? 'inline-block' : 'none';
  document.getElementById('function-box').style.display = hasFunc ? 'block' : 'none';
  functionCommands = [];
  updateFunctionDisplay();
  initGame();
}

function initGame() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.x = x;
      cell.dataset.y = y;
      grid.appendChild(cell);
    }
  }
  currentPathCoords.forEach(p => {
    document.querySelector(`.grid-cell[data-x="${p.x}"][data-y="${p.y}"]`).classList.add('path');
  });
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
  commands = [];
  functionCommands = [];
  // cubePos = { x: 0, y: 0 };
  document.getElementById('command-list').innerHTML = 'Commands: <span style="color:#666">[]</span>';
  document.getElementById('function-commands').innerHTML = '<span style="color:#666">[]</span>';
  document.getElementById('start-btn').textContent = 'Start';
  isAnimating = false;
  document.querySelectorAll('.grid-cell').forEach(c => c.classList.remove('visited'));
  updateFunctionDisplay();
}

function addCommand(dir) {
  if (isAnimating) return;
  if (commands.length >= mainCommandLimit) { alert(`Only ${mainCommandLimit} main commands allowed! Use FUNCTION (F)`); return; }
  commands.push(dir);
  updateCommandDisplay();
}

function addFunctionCommand() {
  if (isAnimating) return;
  if (commands.length >= mainCommandLimit) { alert('Main command limit reached!'); return; }
  commands.push("F");
  updateCommandDisplay();
}

function addToFunction(dir) {
  if (isAnimating) return;
  if (functionCommands.length >= functionCommandLimit) {
    alert(`Only ${functionCommandLimit} commands allowed in the FUNCTION for Phase ${currentPhase}!`);
    return;
  }
  functionCommands.push(dir);
  updateFunctionDisplay();
}

function clearFunction() {
  functionCommands = [];
  updateFunctionDisplay();
}

function updateCommandDisplay() {
  const list = document.getElementById('command-list');
  if (commands.length === 0) { list.innerHTML = 'Commands: <span style="color:#666">[]</span>'; return; }
  list.innerHTML = 'Commands: ';
  commands.forEach(c => {
    const icon = document.createElement('span');
    icon.className = 'cmd-icon' + (c === 'F' ? ' function-icon' : '');
    icon.innerHTML = c === 'F' ? '<i class="fas fa-cogs"></i>' : getDirectionIcon(c);
    list.appendChild(icon);
  });
}

function updateFunctionDisplay() {
  const box = document.getElementById('function-commands');
  if (functionCommands.length === 0) { box.innerHTML = '<span style="color:#666">[]</span>'; return; }
  box.innerHTML = '';
  functionCommands.forEach(dir => {
    const icon = document.createElement('span');
    icon.className = 'cmd-icon function-icon';
    icon.innerHTML = getDirectionIcon(dir);
    box.appendChild(icon);
  });
}

function getDirectionIcon(d) {
  const icons = { 'up': '<i class="fas fa-arrow-up"></i>', 'down': '<i class="fas fa-arrow-down"></i>', 'left': '<i class="fas fa-arrow-left"></i>', 'right': '<i class="fas fa-arrow-right"></i>' };
  return icons[d] || '';
}

function startGame() {
  if (commands.length === 0 || isAnimating) return;
  isAnimating = true;
  gameStartTime = Date.now();
  document.getElementById('start-btn').textContent = 'Running...';
  let pos = { ...cubePos };
  let step = 0;
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

    if (!onPath) {
      console.error(`Failed at position: x=${np.x}, y=${np.y}. Not on path!`);
      showFail('Cube left the path!');
      return;
    }
    pos = np;
    document.getElementById('cube').style.left = `${pos.x * cellSize + 4}px`;
    document.getElementById('cube').style.top = `${pos.y * cellSize + 4}px`;
    document.querySelector(`.grid-cell[data-x="${pos.x}"][data-y="${pos.y}"]`).classList.add('visited');
    cb();
  }
  exec();
}

function checkWin(p) { if (p.x === endPos.x && p.y === endPos.y) showWin(); else showFail('Did not reach B!'); }

function showWin() {
  isAnimating = false;
  const timeTaken = ((Date.now() - gameStartTime) / 1000).toFixed(1);
  const phase = phaseProgress.current;


  let cmdCount = commands.length;
  const hasFunc = phases.find(p => p.id === phase).hasFunction;
  if (hasFunc) {
    const nonFuncCommands = commands.filter(c => c !== 'F').length;
    const numF = commands.filter(c => c === 'F').length;
    const funcLength = functionCommands.length;
    cmdCount = commands.length + funcLength;
  }
  const playerName = prompt(
    `PHASE ${phase} COMPLETED!\n${cmdCount} total commands – ${timeTaken}s\n\nEnter your name for GLOBAL leaderboard:`,
    "Player"
  );

  if (playerName && playerName.trim()) {
    const name = playerName.trim().substring(0, 15);

    db.collection("leaderboard").add({
      phase: phase,
      name: name,
      commands: cmdCount,
      time: parseFloat(timeTaken),
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
      .then(() => console.log("Global score saved!"))
      .catch(err => console.error("Save failed:", err));
  }

  document.getElementById('result-title').textContent = 'Phase Complete!';
  document.getElementById('result-message').innerHTML = `
    Completed with <strong>${cmdCount}</strong> total commands<br>
    Time: <strong>${timeTaken}s</strong>
  `;
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

function nextPhase() {
  closeModal();
  startPhase(phaseProgress.current + 1);
}

function resetGame() {
  resetCommands();
  initGame();
}

function closeModal() {
  document.getElementById('result-modal').style.display = 'none';
}

function showBasicTutorial() {
  document.querySelector('#tutorial-modal .modal-content').innerHTML = `
    <span class="close" onclick="closeTutorial()">&times;</span>
    <h3>How to Play</h3>
    <p>Click direction buttons to build a command sequence. Cube must stay on <strong>white path</strong> and reach <strong>B (red)</strong>. Hit "Start" to run!<br><br>Forward/back OK, but <strong>no leaving path</strong>!</p>
  `;
  showTutorial();
}

function showTutorial() {
  document.getElementById('tutorial-modal').style.display = 'block';
}

function toggleTutorial() {
  const m = document.getElementById('tutorial-modal');
  m.style.display = m.style.display === 'block' ? 'none' : 'block';
}

function closeTutorial() {
  document.getElementById('tutorial-modal').style.display = 'none';
}

function showPhase3Tutorial() {
  document.querySelector('#tutorial-modal .modal-content').innerHTML = `
    <span class="close" onclick="closeTutorial()">&times;</span>
    <h3>New: FUNCTION (F)</h3>
    <p>You now have only <strong>4 main commands</strong>!</p>
    <p>Use the orange <strong>FUNCTION box</strong>:<br>
    • Add moves with the small arrows<br>
    • Press the orange <strong>F</strong> button to use it<br>
    • You can use F multiple times!</p>
    <p><strong>Solve Phase 3 with ≤4 main commands!</strong></p>
  `;
  showTutorial();
}

// Phase Selection
function showPhaseSelection() {
  const buttons = document.getElementById('phase-selection-buttons');
  buttons.innerHTML = '';
  phases.forEach(phase => {
    const btn = document.createElement('button');
    btn.className = 'start-phase-btn' + (phaseProgress.unlocked.includes(phase.id) ? ' unlocked' : ' locked');
    btn.innerHTML = `
      <img src="images/phase${phase.id}.png" alt="Phase ${phase.id}" onerror="this.src='placeholder.png';">
      <span>Phase ${phase.id}</span>
    `;
    if (phaseProgress.unlocked.includes(phase.id)) {
      btn.onclick = () => {
        closePhaseSelection();
        startPhase(phase.id);
      };
    }
    buttons.appendChild(btn);
  });
  document.getElementById('phase-selection-modal').style.display = 'block';
}

function closePhaseSelection() {
  document.getElementById('phase-selection-modal').style.display = 'none';
}

// Global Rankings 
function showGlobalRankings() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
      <h2>Global Rankings</h2>
      <select id="ranking-phase-select" onchange="showRanking(this.value)" style="margin:10px 0;padding:8px;">
        ${phases.map(p => `<option value="${p.id}">Phase ${p.id}</option>`).join('')}
      </select>
      <div id="global-ranking-list" style="margin:20px 0;font-family:monospace;text-align:left;">Loading...</div>
      <button onclick="this.closest('.modal').remove()" class="green-btn">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
  showRanking(phases[0].id);
}

//Ranking Function
function showRanking(phase) {
  const listId = document.getElementById('ranking-modal') ? 'ranking-list' : 'global-ranking-list';
  const list = document.getElementById(listId);
  list.innerHTML = 'Loading rankings...';

  db.collection("leaderboard")
    .where("phase", "==", phase)
    .orderBy("commands", "asc")
    .orderBy("time", "asc")
    .limit(10)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        list.innerHTML = "No records yet!<br>Be the first in the world!";
        return;
      }
      let html = "";
      snapshot.forEach((doc, i) => {
        const r = doc.data();
        const medal = i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : `${i + 1}. `;
        html += `${medal}<strong>${r.name.padEnd(15)}</strong> → ${r.commands} cmds | ${r.time}s<br>`;
      });
      list.innerHTML = html;
    })
    .catch(err => {
      console.error("Ranking load error:", err);
      list.innerHTML = "Error loading rankings. Check internet and try again!";
    });

  if (document.getElementById('ranking-modal')) document.getElementById('ranking-modal').style.display = 'block';
}

window.addEventListener('load', () => {
  startPhase(1);
});