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
  else if (id === 7) showPhase7Tutorial();
}
function closeRankingModal() {
  // This is for the *Phase* ranking modal (the one without a phase selector)
  document.getElementById('ranking-modal').style.display = 'none';
  // This is to close the one that shows the result modal, too
  document.getElementById('result-modal').style.display = 'none';
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

  if (phase.mainCommandLimit != null && phase.mainCommandLimit < Infinity) {
    limitNum.textContent = phase.mainCommandLimit;
    limitText.style.display = 'block';
  } else {
    limitText.style.display = 'none';
  }

  if (phase.hasFunction && phase.functionCommandLimit != null && phase.functionCommandLimit < Infinity) {
    funclimitNum.textContent = phase.functionCommandLimit;
    funclimitText.style.display = 'block';
  } else {
    funclimitText.style.display = 'none';
  }

  if (phase.hasFunction2 && phase.function2CommandLimit != null && phase.function2CommandLimit < Infinity) {
    func2limitNum.textContent = phase.function2CommandLimit;
    func2limitText.style.display = 'block';
  } else {
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
let currentPhaseData = {}; 

function showWin() {
  isAnimating = false;
  const timeTaken = ((Date.now() - gameStartTime) / 1000).toFixed(1);
  const phase = phaseProgress.current;
  let totalCommands = commands.length;
  const numFCalls = commands.filter(c => c === "F").length;
  const numF2Calls = commands.filter(c => c === "F2").length;
  totalCommands += numFCalls * functionCommands.length;
  totalCommands += numF2Calls * function2Commands.length;

  // Store data temporarily
  currentPhaseData = { phase, totalCommands, timeTaken };

  document.getElementById('name-phase-num').textContent = phase;
  document.getElementById('name-stats').innerHTML = `
    Completed with <strong>${totalCommands}</strong> total commands<br>
    Time: <strong>${timeTaken}s</strong>
  `;
  document.getElementById('player-name-input').value = localStorage.getItem('playerName') || '';

  document.getElementById('name-entry-modal').style.display = 'flex';

  const input = document.getElementById('player-name-input');
  input.focus();
  input.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
      submitPlayerName();
    }
  });

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

//  Submit name and save to leaderboard
function submitPlayerName() {
  const playerName = document.getElementById('player-name-input').value.trim().substring(0, 15);
  if (!playerName) {
    alert('Please enter a name!'); 
    return;
  }
  localStorage.setItem('playerName', playerName);

  const { phase, totalCommands, timeTaken } = currentPhaseData;
  db.collection("leaderboard").add({
    phase: phase,
    name: playerName,
    commands: totalCommands,
    time: parseFloat(timeTaken),
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
    .then(() => console.log("Global score saved!"))
    .catch(err => console.error("Save failed:", err));

  closeNameModal();
}

function closeNameModal() {
  document.getElementById('name-entry-modal').style.display = 'none';
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
    <p>You now have only <strong>5 main commands</strong>!</p>
    <p>Use the orange <strong>FUNCTION box</strong>:<br>
    • Add moves with the small arrows<br>
    • Press the orange <strong>F</strong> button to use it<br>
    • You can use F multiple times!</p>
    <p><strong>Solve Phase 3 with ≤5 main commands!</strong></p>
  `;
  showTutorial();
}
function showPhase7Tutorial() {
  document.querySelector('#tutorial-modal .modal-content').innerHTML = `
    <span class="close" onclick="closeTutorial()">&times;</span>
    <h3>New: FUNCTION 2 (F2)</h3>
    <p>Now, you have two <strong>FUNCTIONS boxes</strong>:<br>
    • Add moves with the small arrows<br>
    • Press the orange <strong>F1</strong> or <strong>F2</strong> button to use them<br>
    • Is not mandatory to use it, but will help you!</p>
    <p><strong>Solve Phase 7 !</strong></p>
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
  document.getElementById('phase-selection-modal').style.display = 'flex';
}

function closePhaseSelection() {
  document.getElementById('phase-selection-modal').style.display = 'none';
}
// GLOBAL RANKINGS 
function showGlobalRankings() {
  const existing = document.getElementById('global-rank-container');
  if (existing) {
    existing.style.display = 'flex';
    existing.style.opacity = '0';
    setTimeout(() => {
      existing.style.opacity = '1';
      existing.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 10);
    const select = document.getElementById('ranking-phase-select');
    if (select) showRanking(select.value || 1);
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'global-rank-container';
  modal.className = 'modal';
  modal.style.cssText = 'display:flex; opacity:0;';
  modal.innerHTML = `
  <div class="modal-content">
    <span class="close" onclick="document.getElementById('global-rank-container').remove()">×</span>
    <div class="scroll-area">
      <h2>Global Rankings</h2>
     <select id="ranking-phase-select" onchange="showRanking(this.value)" class="phase-select" style="margin:15px 0; padding:10px; font-size:1em; width:100%; max-width:300px;">
                ${phases.map(p => `<option value="${p.id}" ${p.id === 1 ? 'selected' : ''}>Phase ${p.id}${p.name ? ' – ' + p.name : ''}</option>`).join('')}
            </select>
      <div id="global-ranking-list" class="ranking-list"></div>
      <button onclick="document.getElementById('global-rank-container').remove()" class="green-btn close-btn">Close</button>
    </div>
  </div>
`;
  

  document.body.appendChild(modal);

  // Fade in animation
  setTimeout(() => {
    modal.style.opacity = '1';
    modal.querySelector('.modal-content').style.transform = 'scale(1)';
  }, 10);


  showRanking(1);
}


function showRanking(phase) {
  console.trace("showRanking called with phase:", phase);
  const phaseNum = parseInt(phase, 10) || 1;
  const isGlobal = !!document.getElementById('global-ranking-list');
  const listId = isGlobal ? 'global-ranking-list' : 'ranking-list';
  const list = document.getElementById(listId);
  if (!list) return;

  if (!isGlobal) {
    const modal = document.getElementById('ranking-modal');
    if (modal) {
      modal.style.display = 'flex';
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
      }, 10);
      const title = document.getElementById('ranking-title');
      if (title) title.textContent = `Phase ${phaseNum} Ranking`;
    }
  }

  list.innerHTML = '<p class="loading-text">Loading rankings...</p>';

  const myName = (localStorage.getItem('playerName') || '').trim();
  const oldBox = document.getElementById('your-rank-box');
  if (oldBox) oldBox.remove();

  db.collection("leaderboard")
    .where("phase", "==", phaseNum)
    .orderBy("commands", "asc")
    .orderBy("time", "asc")
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        list.innerHTML = '<p class="no-records-text">No records yet!<br>Be the first in the world!</p>';
        return;
      }

      let yourRank = null;
      let yourData = null;
      let html = '<table class="ranking-table"><thead><tr><th>Rank</th><th>Player</th><th>Commands</th><th>Time</th></tr></thead><tbody>';

      snapshot.docs.forEach((doc, i) => {
        const r = doc.data();
        const rank = i + 1;

        if (i < 10) {
          const medal = rank === 1 ? "1st" : rank === 2 ? "2nd" : rank === 3 ? "3rd" : `${rank}.`;
          const rowClass = `ranking-row ${rank <= 3 ? 'top-row' : ''} ${i % 2 === 0 ? 'even-row' : 'odd-row'}`;

          if (myName && r.name === myName) {
            yourRank = rank;
            yourData = r;
          }

          html += `<tr class="${rowClass}">
                        <td>${medal}</td>
                        <td><strong>${r.name}${myName && r.name === myName ? ' (You)' : ''}</strong></td>
                        <td>${r.commands}</td>
                        <td>${r.time}s</td>
                    </tr>`;
        } else if (!yourRank && myName && r.name === myName) {
          yourRank = rank;
          yourData = r;
        }
      });

      html += '</tbody></table>';
      list.innerHTML = html;

      // Row animation
      list.querySelectorAll('.ranking-row').forEach((row, i) => {
        setTimeout(() => {
          row.style.opacity = '1';
          row.style.transform = 'translateY(0)';
        }, i * 100);
      });

      // RANK 
      if (yourRank) {
        const box = document.createElement('div');
        box.id = 'your-rank-box';
        box.innerHTML = `
                    <div style="margin:20px auto; padding:18px; background:#001a0d; border:3px solid #00ff88; border-radius:16px; text-align:center; max-width:340px; color:white; font-family:sans-serif;">
                        <div style="font-size:2.8em; font-weight:bold; color:#00ff88;">
                            ${yourRank <= 3 ? ['1st', '2nd', '3rd'][yourRank - 1] : '#' + yourRank}
                        </div>
                        <div style="font-size:1.4em; margin:8px 0;"><strong>You: ${yourData.name}</strong></div>
                        <div style="color:#ccc;">${yourData.commands} commands • ${yourData.time}s</div>
                    </div>
                `;
        list.parentNode.insertBefore(box, list);
      }
    })
    .catch(err => {
      console.error("Leaderboard error:", err);
      list.innerHTML = '<p class="error-text">Error loading rankings!</p>';
    });
}

function updateGlobalRankDisplay(rank) {
  document.querySelectorAll('#player-rank, [data-rank], .player-rank').forEach(el => {
    if (!rank) {
      el.textContent = '-';
    } else if (rank <= 3) {
      el.textContent = ['1st place', '2nd place', '3rd place'][rank - 1];
    } else {
      el.textContent = '#' + rank;
    }
  });
}
window.addEventListener('load', () => {
  document.getElementById('game-screen').classList.remove('active');
  document.getElementById('start-screen').classList.add('active');

  document.querySelectorAll('.modal, #ranking-modal, #global-rank-container, #phase-selection-modal')
    .forEach(m => m.style.display = 'none');

  const current = phaseProgress.current || 1;
  document.querySelectorAll('.phase-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.getElementById(`phase-${current}-btn`);
  if (activeBtn) activeBtn.classList.add('active');

  // Optional: Auto-open phase selection instead of start screen
  // showPhaseSelection();
});