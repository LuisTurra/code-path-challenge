const gridSize = 6;
// const cellSize = 64;
// let cubePos = { x: 0, y: 0 };
// let endPos = { x: 5, y: 5 };
let commands = [];
let functionCommands = [];
let function2Commands = [];
let currentPathCoords = [];
let phaseProgress = { current: 1, unlocked: [1, 2, 3, 4, 5, 6, 7] };
let isAnimating = false;
let mainCommandLimit = Infinity;
let currentFunctionLimit = Infinity;
let currentPhase = 1;
let gameStartTime = 0;


function getScaledCellSize() {
  const cellElement = document.querySelector('.grid-cell');
  return cellElement ? cellElement.offsetWidth : 64;
}

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
  function2CommandLimit = phase.function2CommandLimit || Infinity;
  const hasFunc = !!phase.hasFunction;
  const hasFunc2 = !!phase.hasFunction2;
  const limitText = document.getElementById('command-limit-text');
  const limitNum = document.getElementById('limit-number');
  const funclimitText = document.getElementById('func-limit-text');
  const funclimitNum = document.getElementById('func-limit-number');
  const func2limitText = document.getElementById('func2-limit-text');
  const func2limitNum = document.getElementById('func2-limit-number');
  if (phase.mainCommandLimit && phase.mainCommandLimit < Infinity && phase.functionCommandLimit && phase.functionCommandLimit < Infinity && phase.function2CommandLimit && phase.function2CommandLimit < Infinity) {
    limitNum.textContent = phase.mainCommandLimit;
    limitText.style.display = 'block';

    funclimitNum.textContent = phase.functionCommandLimit;
    funclimitText.style.display = 'block';

    func2limitNum.textContent = phase.function2CommandLimit;
    func2limitText.style.display = 'block';
  }
  else {
    limitText.style.display = 'none';
    funclimitText.style.display = 'none';
    func2limitText.style.display = 'none';
  }

  document.getElementById('function-btn').style.display = hasFunc ? 'inline-block' : 'none';
  document.getElementById('function-box').style.display = hasFunc ? 'block' : 'none';
  document.getElementById('function2-btn').style.display = hasFunc2 ? 'inline-block' : 'none';
  document.getElementById('function2-box').style.display = hasFunc2 ? 'block' : 'none';
  functionCommands = [];
  function2Commands = [];
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
  const currentCellSize = getScaledCellSize();
  const o = 4;

  document.getElementById('cube').style.left = `${cubePos.x * currentCellSize + o}px`;
  document.getElementById('cube').style.top = `${cubePos.y * currentCellSize + o}px`;
  document.getElementById('start-point').style.left = `${cubePos.x * currentCellSize + o}px`;
  document.getElementById('start-point').style.top = `${cubePos.y * currentCellSize + o}px`;
  document.getElementById('end-point').style.left = `${endPos.x * currentCellSize + o}px`;
  document.getElementById('end-point').style.top = `${endPos.y * currentCellSize + o}px`;
  resetCommands();
}

function resetCommands() {
  commands = [];
  functionCommands = [];
  function2Commands = [];
  // cubePos = { x: 0, y: 0 };
  document.getElementById('command-list').innerHTML = 'Commands: <span style="color:#666">[]</span>';
  document.getElementById('function-commands').innerHTML = '<span style="color:#666">[]</span>';
  document.getElementById('function2-commands').innerHTML = '<span style="color:#666">[]</span>';
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
function addFunction2Command() {
  if (isAnimating) return;
  if (commands.length >= mainCommandLimit) { alert('Main command limit reached!'); return; }
  commands.push("F2");
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
function addToFunction2(dir) {
  if (isAnimating) return;
  if (function2Commands.length >= function2CommandLimit) {
    alert(`Only ${function2CommandLimit} commands allowed in the FUNCTION for Phase ${currentPhase}!`);
    return;
  }
  function2Commands.push(dir);
  updateFunctionDisplay();
}
function clearFunction() {
  functionCommands = [];
  updateFunctionDisplay();
}
function clearFunction2() {
  function2Commands = [];
  updateFunctionDisplay();
}
function updateCommandDisplay() {
  const list = document.getElementById('command-list');
  list.innerHTML = '';
  list.textContent = 'Commands: ';
  if (commands.length === 0) {
    const emptySpan = document.createElement('span');
    emptySpan.style.color = '#666';
    emptySpan.textContent = '[]';
    list.appendChild(emptySpan);
    return;
  }
  commands.forEach(c => {
    const icon = document.createElement('span');
    icon.classList.add('cmd-icon');
    if (c === 'F') {
      icon.classList.add('function-icon');
      icon.innerHTML = '<i class="fas fa-cogs">1</i>';
    } else if (c === 'F2') {
      icon.classList.add('function-icon');
      icon.innerHTML = '<i class="fas fa-cogs">2</i>';
    } else {
      icon.innerHTML = getDirectionIcon(c);
    }
    list.appendChild(icon);
  });
}

function updateFunctionDisplay() {
  const box = document.getElementById('function-commands');
  const box2 = document.getElementById('function2-commands');
  if (functionCommands.length === 0) {
    box.innerHTML = '<span style="color:#666">[]</span>';
  } else {
    box.innerHTML = '';
    functionCommands.forEach(dir => {
      const icon = document.createElement('span');
      icon.className = 'cmd-icon function-icon';
      icon.innerHTML = getDirectionIcon(dir);
      box.appendChild(icon);
    });
  }
  if (function2Commands.length === 0) {
    box2.innerHTML = '<span style="color:#666">[]</span>';
  } else {
    box2.innerHTML = '';
    function2Commands.forEach(dir => {
      const icon = document.createElement('span');
      icon.className = 'cmd-icon function-icon';
      icon.innerHTML = getDirectionIcon(dir);
      box2.appendChild(icon);
    });
  }
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
    if (step >= commands.length) {
      checkWin(pos);
      return;
    }
    const cmd = commands[step];

    if (cmd === 'F') {
      let fi = 0;
      function runF() {
        if (fi >= functionCommands.length) {
          step++;
          setTimeout(exec, 400);
          return;
        }
        move(functionCommands[fi], () => {
          fi++;
          setTimeout(runF, 400);
        });
      }
      runF();
    } else if (cmd === 'F2') {
      let f2i = 0;
      function runF2() {
        if (f2i >= function2Commands.length) {
          step++;
          setTimeout(exec, 400);
          return;
        }
        move(function2Commands[f2i], () => {
          f2i++;
          setTimeout(runF2, 400);
        });
      }
      runF2();
    } else {
      move(cmd, () => {
        step++;
        setTimeout(exec, 400);
      });
    }
  }
  const currentCellSize = getScaledCellSize();
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
    document.getElementById('cube').style.left = `${pos.x * currentCellSize + 4}px`;
    document.getElementById('cube').style.top = `${pos.y * currentCellSize + 4}px`;

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
  let totalCommands = commands.length;
  const numFCalls = commands.filter(c => c === "F").length;
  const numF2Calls = commands.filter(c => c === "F2").length;
  totalCommands += numFCalls * functionCommands.length;
  totalCommands += numF2Calls * function2Commands.length;

  const playerName = prompt(
    `PHASE ${phase} COMPLETED!\n${totalCommands} total commands – ${timeTaken}s\n\nEnter your name for GLOBAL leaderboard:`,
    "Player"
  );

  if (playerName && playerName.trim()) {
    const name = playerName.trim().substring(0, 15);

    db.collection("leaderboard").add({
      phase: phase,
      name: name,
      commands: totalCommands,
      time: parseFloat(timeTaken),
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
      .then(() => console.log("Global score saved!"))
      .catch(err => console.error("Save failed:", err));
  }

  document.getElementById('result-title').textContent = 'Phase Complete!';
  document.getElementById('result-message').innerHTML = `
    Completed with <strong>${totalCommands}</strong> total commands<br>
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
    modal.id = 'global-rank-container'; 
    modal.style.display = 'block';
    const STARTING_PHASE_ID = 1; 
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
        <h2>Global Rankings</h2>
        <select id="ranking-phase-select" onchange="showRanking(this.value)" style="margin:10px 0;padding:8px;">
          ${
            (typeof phases !== 'undefined' && phases.length > 0)
              ? phases.map(p => `<option value="${p.id}" ${p.id === STARTING_PHASE_ID ? 'selected' : ''}>Phase ${p.id}</option>`).join('')
              : '<option value="1">Phase 1</option>' 
          }
        </select>
        <div id="global-ranking-list" style="margin:20px 0;font-family:monospace;text-align:left;">Loading...</div>
        <button onclick="this.closest('.modal').remove()" class="green-btn">Close</button>
      </div>
    `;

    document.body.appendChild(modal);

    showRanking(STARTING_PHASE_ID);
}

// Ranking Function
function showRanking(phase) {
    const phaseNum = parseInt(phase, 10); 
    let listId;
    
    if (document.getElementById('global-ranking-list')) {
        listId = 'global-ranking-list';
    } else if (document.getElementById('ranking-list')) {
        listId = 'ranking-list';
    } else {
        console.error("No ranking list element found to update!");
        return;
    }
    
    const list = document.getElementById(listId);
    
   
    if (listId === 'ranking-list') {
        document.getElementById('ranking-modal').style.display = 'block';
        const titleElement = document.getElementById('ranking-title');
        if (titleElement) {
            titleElement.textContent = `PHASE ${phaseNum} RANKING`;
        }
    } 
    
    list.innerHTML = 'Loading rankings...';

    db.collection("leaderboard")
      .where("phase", "==", phaseNum)
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
}

window.addEventListener('load', () => {
  startPhase(1);
});