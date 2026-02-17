// ==== Global Variables ====
const gridSize = 6;
let commands = [];
let functionCommands = [];
let function2Commands = [];
let currentPathCoords = [];
let phaseProgress = { current: 1, unlocked: [] };
let isAnimating = false;
let mainCommandLimit = Infinity;
let currentFunctionLimit = Infinity;
let currentPhase = 1;
let gameStartTime = 0;
const RATIO_OFFSET = 4 / 64;
const RATIO_INNER = 56 / 64;
const RATIO_FONT = 24 / 64;
const RATIO_RADIUS = 14 / 64;
let alignmentOffset = 0;

// ==== Translations ====
let currentLang = localStorage.getItem('lang') || (navigator.language.startsWith('pt') ? 'pt' : 'en');
const translations = {
  // === English ===
  en: {
    title: "Code Path Challenge",
    subtitle: "Guide the cube from A to B using direction commands!",
    how_to_play_title: "How to Play",
    got_it: "Got It!",
    phase: "Phase",
    phases: "Phases",
    locked: "LOCKED",
    start_game: "Start",
    reset: "Reset",
    running: "Running...",
    failed: "Failed",
    cube_left_path: "Cube left the path!",
    not_reach_b: "Did not reach B!",
    only_main_commands_alert: "Only {0} main commands allowed! Use FUNCTION (F)",
    main_limit_reached: "Main command limit reached!",
    only_func_commands_alert: "Only {0} commands allowed in the FUNCTION for Phase {1}!",
    function_f1: "FUNCTION (F1):",
    function_f2: "FUNCTION 2 (F2):",
    clear: "Clear",
    you_have_only: "You have only",
    function_commands: "function commands",
    main_commands: "main commands – use FUNCTION (F) wisely!",
    phase_complete: "Phase Complete!",
    next_phase: "Next Phase",
    select_phase: "Select Phase",
    play_again: "Play Again",
    commands_label: "Commands:",
    code_size: "Code size",
    commands_unit: "commands",
    time_label: "Time",
    completed: "Completed!",
    enter_name_placeholder: "Enter your name",
    submit_leaderboard: "Submit to Leaderboard",
    skip: "Skip",
    home_title: "Home",
    tutorial_title: "How to Play",
    global_rankings: "Global Rankings",
    rankings: "Rankings",
    close: "Close",
    back_to_menu: "Back to Menu",
    loading_rankings: "Loading rankings...",
    no_records: "No records yet!<br>Be the first in the world!",
    error_loading: "Error loading rankings!",
    your_rank_you: "You",
    inappropriate_name: "That name contains inappropriate words.",
    enter_name_alert: "Please enter a name!",
    kofi_button: "Support on Ko-fi ☕",
    kofi_message: "If you enjoyed the game and can support, consider buying a virtual coffee! (Totally optional ❤️)",
    tutorial_basic_title: "How to Play",
    tutorial_basic_text: 'Click direction buttons to build a command sequence. Cube must stay on <strong>white path</strong> and reach <strong>B (red)</strong>. Hit "Start" to run!<br><br>Forward/back OK, but <strong>no leaving path</strong>!',
    tutorial_phase3_title: "New: FUNCTION (F)",
    tutorial_phase3_text: `<p>You now have only <strong>5 main commands</strong>!</p>
<p>Use the orange <strong>FUNCTION box</strong>:<br>
• Add moves with the small arrows<br>
• Press the orange <strong>F</strong> button to use it<br>
• You can use F multiple times!</p>
<p><strong>Solve Phase 3 with ≤5 main commands!</strong></p>`,
    tutorial_phase7_title: "New: FUNCTION 2 (F2)",
    tutorial_phase7_text: `<p>Now, you have two <strong>FUNCTIONS boxes</strong>:<br>
• Press the orange <strong>F1</strong> or <strong>F2</strong> button to use them<br>
• You can call function 2 on function 1 or call function 1 on Function 2,</p>
<p><strong>BUT BE CAREFUL</strong> you dont want be stuck in infinite loop!</p>
<p>• Is not mandatory to use it, but will help you!</p>
<p><strong>Solve Phase 7!</strong></p>`,
    tutorial_phase9_title: "New: Command Restrictions",
    tutorial_phase9_text: `<p><strong>Ops!!</strong>, Now lacks certain commands<br>
`

  },
// === Portuguese ===
  pt: {
    title: "Desafio Caminho do Código",
    subtitle: "Guie o cubo do ponto A até o ponto B usando os commandos direcionais!",
    how_to_play_title: "Como Jogar",
    got_it: "Entendi!",
    phase: "Fase",
    phases: "Fases",
    locked: "BLOQUEADO",
    start_game: "Iniciar",
    back_to_menu: "Voltar ao Menu",
    reset: "Reiniciar",
    running: "Executando...",
    failed: "Falhou",
    cube_left_path: "O cubo saiu do caminho!",
    not_reach_b: "Não alcançou B!",
    only_main_commands_alert: "Apenas {0} comandos principais permitidos! Use a FUNÇÃO (F)",
    main_limit_reached: "Limite de comandos principais atingido!",
    only_func_commands_alert: "Apenas {0} comandos permitidos na FUNÇÃO para a Fase {1}!",
    function_f1: "FUNÇÃO (F1):",
    function_f2: "FUNÇÃO 2 (F2):",
    clear: "Limpar",
    select_phase: "Selecionar Fase",
    you_have_only: "Você tem apenas",
    function_commands: "comandos de função",
    main_commands: "comandos principais – use a FUNÇÃO (F) com sabedoria!",
    phase_complete: "Fase Concluída!",
    next_phase: "Próxima Fase",
    play_again: "Jogar Novamente",
    commands_label: "Comandos:",
    code_size: "Tamanho do código",
    commands_unit: "comandos",
    time_label: "Tempo",
    completed: "Concluída!",
    enter_name_placeholder: "Digite seu nome",
    submit_leaderboard: "Enviar para Classificação",
    skip: "Pular",
    home_title: "Início",
    tutorial_title: "Como Jogar",
    global_rankings: "Classificações Globais",
    rankings: "Classificação",
    close: "Fechar",
    loading_rankings: "Carregando classificações...",
    no_records: "Nenhum registro ainda!<br>Seja o primeiro no mundo!",
    error_loading: "Erro ao carregar classificações!",
    your_rank_you: "Você",
    inappropriate_name: "Esse nome contém palavras inadequadas.",
    enter_name_alert: "Por favor, digite um nome!",
    kofi_button: "Apoie no Ko-fi ☕",
    kofi_message: "Se você gostou do jogo e puder apoiar, considere comprar um café virtual! (Totalmente opcional ❤️)",
    tutorial_basic_title: "Como Jogar",
    tutorial_basic_text: 'Clique nos botões de direção para construir uma sequência de comandos. O cubo deve permanecer no <strong>caminho branco</strong> e alcançar <strong>B (vermelho)</strong>. Pressione "Iniciar" para executar!<br><br>Avançar/recuar OK, mas <strong>sem sair do caminho</strong>!',
    tutorial_phase3_title: "Novo: FUNÇÃO (F)",
    tutorial_phase3_text: `<p>Você agora tem apenas <strong>5 comandos principais</strong>!</p>
<p>Use a caixa laranja <strong>FUNÇÃO</strong>:<br>
• Adicione movimentos com as setas pequenas<br>
• Pressione o botão laranja <strong>F</strong> para usá-la<br>
• Você pode usar F várias vezes!</p>
<p><strong>Resolva a Fase 3 com ≤5 comandos principais!</strong></p>`,
    tutorial_phase7_title: "Novo: FUNÇÃO 2 (F2)",
    tutorial_phase7_text: `<p>Agora você tem duas <strong>caixas de FUNÇÕES</strong>:<br>
• Pressione o botão laranja <strong>F1</strong> ou <strong>F2</strong> para usá-las<br>
• Você pode chamar a função 2 na função 1 ou chamar a função 1 na Função 2,</p>
<p><strong>MAS CUIDADO</strong> você não quer ficar preso em loop infinito!</p>
<p>• Não é obrigatório usar, mas vai ajudar!</p>
<p><strong>Resolva a Fase 7!</strong></p>`,
    tutorial_phase9_title: "Novo restrições de comando",
    tutorial_phase9_text: `<p><strong>Vixe!!!</strong>, Agora alguns comandos estão faltando<br>
`
  }
};
// ==== Translation Functions ====
function t(key) {
  return translations[currentLang][key] || translations.en[key] || key;
}
function format(str, ...args) {
  return str.replace(/\{(\d+)\}/g, (_, i) => args[i] || '');
}
// ==== UI Update Functions ====
function updateTexts() {
  document.title = t('title');
  document.documentElement.lang = currentLang === 'pt' ? 'pt-BR' : 'en';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.innerHTML = t(key);
  });

  const input = document.getElementById('player-name-input');
  if (input) input.placeholder = t('enter_name_placeholder');
  
  const homeBtn = document.getElementById('home-btn');
  if (homeBtn) homeBtn.title = t('home_title');
  
  const tutorialBtn = document.getElementById('tutorial-btn');
  if (tutorialBtn) tutorialBtn.title = t('tutorial_title');
  
  const startBtn = document.getElementById('start-btn');
  if (startBtn && !isAnimating) startBtn.textContent = t('start_game');
}

// ===================================

// ==== Core Game Functions ====
function getCellSize() {
  const cell = document.querySelector('.grid-cell');
  return cell ? cell.offsetWidth : 64;
}

// Show the start screen and hide the game screen
function showStartScreen() {
  document.getElementById('start-screen').classList.add('active');
  document.getElementById('game-screen').classList.remove('active');
  closeTutorial();
  closePhaseSelection();
  updateTexts();
  updateMobilePhaseSelect()
}

// Start a phase by its ID
function startPhase(id) {
  if (id !== 1 && !phaseProgress.unlocked.includes(id)) return;
  phaseProgress.current = id;
  currentPhase = id;
  document.getElementById('start-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  document.querySelectorAll('.phase-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.getElementById(`phase-${id}-btn`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  document.getElementById('ranking-phase-num').textContent = id;
  initPhase(id);
  updateTexts();
  updateRecursiveButtonsVisibility();
  adjustMobileGridPosition();
  if (id === 1) showBasicTutorial();
  else if (id === 3) showPhase3Tutorial();
  else if (id === 7) showPhase7Tutorial();
  else if (id === 9) showPhase9Tutorial();
  updateMobilePhaseSelect();
}

// Show the rankings modal
function closeRankingModal() {
  document.getElementById('ranking-modal').style.display = 'none';
  document.getElementById('result-modal').style.display = 'none';
}

// Show the rankings modal
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
    limitText.querySelector('strong') ? null : limitText.innerHTML = `${t('you_have_only')} <span id="limit-number">${phase.mainCommandLimit}</span> ${t('main_commands')}`;
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
  updateDirectionButtons();
  updateFunctionDisplay();
  updateRecursiveButtonsVisibility();
  updateMobilePhaseSelect();
  initGame();

}

// Reposition the cube, start point, and end point based on the current grid and ratios
function repositionElements() {
  const cellSize = getCellSize();
  const cube = document.getElementById('cube');
  const startPoint = document.getElementById('start-point');
  const endPoint = document.getElementById('end-point');

  if (!cube || !startPoint || !endPoint) return;

  let innerSize, fontSize, radius, finalOffset;

  // === MOBILE/SMALL SCREENS ===
  if (window.innerWidth <= 1024) {
    innerSize = 45;
    finalOffset = 16;
    fontSize = 15;
    radius = 8;

    if (window.innerWidth < 350) {
      innerSize = 35;
      finalOffset = 17;
      fontSize = 13;
      radius = 4;
    } else if (window.innerWidth >= 400) {
      innerSize = 45;
      finalOffset = 17;
      fontSize = 13;
      radius = 4;
    }else if (window.innerWidth >= 800) {
      innerSize = 45;
      finalOffset = 17;
      fontSize = 14;
      radius = 4;
    }

    alignmentOffset = finalOffset;  

  } else {
    // === DESKTOP/LARGER SCREENS ===
    innerSize = cellSize * RATIO_INNER;
    fontSize = cellSize * RATIO_FONT;
    radius = cellSize * RATIO_RADIUS;

    const containerPadding = 8;
    const gridBorder = 5;

    const centering = (cellSize - innerSize) / 2;
    finalOffset = containerPadding + gridBorder + centering;

    alignmentOffset = finalOffset; 
  }

  const apply = (el, pos) => {
    el.style.width = `${innerSize}px`;
    el.style.height = `${innerSize}px`;
    el.style.borderRadius = `${radius}px`;
    el.style.fontSize = `${fontSize}px`;
    el.style.position = 'absolute';
    el.style.boxSizing = 'border-box';
    el.style.margin = '0';

    el.style.left = `${pos.x * cellSize + finalOffset}px`;
    el.style.top = `${pos.y * cellSize + finalOffset}px`;
  };

  apply(cube, cubePos);
  apply(startPoint, cubePos);
  apply(endPoint, endPos);
}

// === Initialize the game grid and elements for the current phase
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

  repositionElements();
  resetCommands();
}

// === Reset the grid and reposition elements (used when resizing or resetting)
function resetGridAndReposition() {
  if (!document.getElementById('game-screen').classList.contains('active')) return;
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
  repositionElements();
}

// === Reset commands and update displays ===
function resetCommands() {
  commands = [];
  functionCommands = [];
  function2Commands = [];
  document.getElementById('command-list').innerHTML = `${t('commands_label')} <span style="color:#666">[]</span>`;
  document.getElementById('function-commands').innerHTML = '<span style="color:#666">[]</span>';
  document.getElementById('function2-commands').innerHTML = '<span style="color:#666">[]</span>';
  const startBtn = document.getElementById('start-btn');
  if (startBtn) startBtn.textContent = t('start_game');
  isAnimating = false;
  document.querySelectorAll('.grid-cell').forEach(c => c.classList.remove('visited'));
  updateFunctionDisplay();
  updateDirectionButtons();
  adjustMobileGridPosition();
}

// === Add a main command and update display ===
function addCommand(dir) {
  if (isAnimating) return;
  if (commands.length >= mainCommandLimit) {
    alert(format(t('only_main_commands_alert'), mainCommandLimit));
    return;
  }
  commands.push(dir);
  updateCommandDisplay();
}

//=== Add a FUNCTION (F) command and update display ===
function addFunctionCommand() {
  if (isAnimating) return;
  if (commands.length >= mainCommandLimit) {
    alert(t('main_limit_reached'));
    return;
  }
  commands.push("F");
  updateCommandDisplay();
}

//=== Add a FUNCTION 2 (F2) command and update display ===
function addFunction2Command() {
  if (isAnimating) return;
  if (commands.length >= mainCommandLimit) {
    alert(t('main_limit_reached'));
    return;
  }
  commands.push("F2");
  updateCommandDisplay();
}

//=== Add a command to the FUNCTION box and update display ===
function addToFunction(dir) {
  if (isAnimating) return;
  if (dir === 'F2' && currentPhase < 7) return;
  if (functionCommands.length >= functionCommandLimit) {
    alert(format(t('only_func_commands_alert'), functionCommandLimit, currentPhase));
    return;
  }
  functionCommands.push(dir);
  updateFunctionDisplay();
}

//=== Add a command to the FUNCTION 2 box and update display ===
function addToFunction2(dir) {
  if (isAnimating) return;
  if (dir === 'F' && currentPhase < 7) return;
  if (function2Commands.length >= function2CommandLimit) {
    alert(format(t('only_func_commands_alert'), function2CommandLimit, currentPhase));
    return;
  }
  function2Commands.push(dir);
  updateFunctionDisplay();
}

//=== Clear FUNCTION and update display ===
function clearFunction() {
  functionCommands = [];
  updateFunctionDisplay();
}

//=== Clear FUNCTION 2 and update display ===
function clearFunction2() {
  function2Commands = [];
  updateFunctionDisplay();
}

//=== Update the main command display with icons ===
function updateCommandDisplay() {
  const list = document.getElementById('command-list');
  list.innerHTML = '';
  list.textContent = t('commands_label') + ' ';
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
  adjustMobileGridPosition();
}

///== Update the FUNCTION and FUNCTION 2 displays with icons ===
function updateFunctionDisplay() {
  const box = document.getElementById('function-commands');
  if (functionCommands.length === 0) {
    box.innerHTML = '<span style="color:#666">[]</span>';
  } else {
    box.innerHTML = '';
    functionCommands.forEach(dir => {
      const icon = document.createElement('span');
      icon.className = 'cmd-icon function-icon';
      if (dir === 'F2') {
        icon.innerHTML = '<i class="fas fa-cogs" style="color:#ff6600;"></i><sub>2</sub>';
        icon.title = 'Call F2';
      } else {
        icon.innerHTML = getDirectionIcon(dir);
      }
      box.appendChild(icon);
    });
  }

  const box2 = document.getElementById('function2-commands');
  if (function2Commands.length === 0) {
    box2.innerHTML = '<span style="color:#666">[]</span>';
  } else {
    box2.innerHTML = '';
    function2Commands.forEach(dir => {
      const icon = document.createElement('span');
      icon.className = 'cmd-icon function-icon';
      if (dir === 'F') {
        icon.innerHTML = '<i class="fas fa-cogs" style="color:#ffaa00;"></i><sub>1</sub>';
        icon.title = 'Call F1';
      } else {
        icon.innerHTML = getDirectionIcon(dir);
      }
      box2.appendChild(icon);
    });
  }
}

//=== Get the corresponding icon HTML for a direction command ===
function getDirectionIcon(d) {
  const icons = { 'up': '<i class="fas fa-arrow-up"></i>', 'down': '<i class="fas fa-arrow-down"></i>', 'left': '<i class="fas fa-arrow-left"></i>', 'right': '<i class="fas fa-arrow-right"></i>' };
  return icons[d] || '';
}

//=== Execute the command sequence and animate the cube ===
function startGame() {
  if (commands.length === 0 || isAnimating) return;
  isAnimating = true;
  gameStartTime = Date.now();
  document.getElementById('start-btn').textContent = t('running');
  repositionElements();

  let pos = { ...cubePos };

  const callStack = [{
    program: commands.slice(),
    index: 0
  }];

  function exec() {
    if (callStack.length === 0) {
      checkWin(pos);
      return;
    }

    const frame = callStack[callStack.length - 1];
    if (frame.index >= frame.program.length) {
      callStack.pop();
      setTimeout(exec, 400);
      return;
    }

    const cmd = frame.program[frame.index];

    if (cmd === 'F') {
      if (functionCommands.length === 0) {
        frame.index++;
        setTimeout(exec, 400);
        return;
      }
      callStack.push({ program: functionCommands.slice(), index: 0 });
      frame.index++;
      setTimeout(exec, 400);
      return;
    }

    if (cmd === 'F2') {
      if (function2Commands.length === 0) {
        frame.index++;
        setTimeout(exec, 400);
        return;
      }
      callStack.push({ program: function2Commands.slice(), index: 0 });
      frame.index++;
      setTimeout(exec, 400);
      return;
    }

    move(cmd, () => {
      frame.index++;
      setTimeout(exec, 400);
    });
  }



  function move(dir, cb) {
    let np = { ...pos };
    if (dir === 'up' && pos.y > 0) np.y--;
    if (dir === 'down' && pos.y < gridSize - 1) np.y++;
    if (dir === 'left' && pos.x > 0) np.x--;
    if (dir === 'right' && pos.x < gridSize - 1) np.x++;

    const onPath = currentPathCoords.some(p => p.x === np.x && p.y === np.y);
    if (!onPath) {
      showFail(t('cube_left_path'));
      return;
    }

    pos = np;

    const cellSize = getCellSize();
    document.getElementById('cube').style.left = `${pos.x * cellSize + alignmentOffset}px`;
    document.getElementById('cube').style.top = `${pos.y * cellSize + alignmentOffset}px`;

    document.querySelector(`.grid-cell[data-x="${pos.x}"][data-y="${pos.y}"]`).classList.add('visited');

    cb();
  }

  exec();
}

//=== Update visibility of FUNCTION buttons based on current phase ===
function updateRecursiveButtonsVisibility() {
  const show = currentPhase >= 7;
  document.querySelectorAll('.recursive-call-btn').forEach(btn => {
    btn.style.display = show ? 'inline-block' : 'none';
  });
}

//=== Check if the cube reached the end position and show win/fail accordingly ===
function checkWin(p) {
  if (p.x === endPos.x && p.y === endPos.y) showWin();
  else showFail(t('not_reach_b'));
}

let currentPhaseData = {};

//=== Show the win modal with stats and leaderboard submission ===
function showWin() {
  isAnimating = false;
  const timeTaken = ((Date.now() - gameStartTime) / 1000).toFixed(1);
  const phase = phaseProgress.current;

  const mainProgramSize = commands.length;
  const f1Size = functionCommands.length;
  const f2Size = function2Commands.length;
  const totalCommands = mainProgramSize + f1Size + f2Size;

  currentPhaseData = { phase, totalCommands, timeTaken };

  document.getElementById('name-phase-num').textContent = phase;
  document.getElementById('name-stats').innerHTML = `
        ${t('code_size')}: <strong>${totalCommands}</strong> ${t('commands_unit')}<br>
        ${t('time_label')}: <strong>${timeTaken}s</strong>
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

  document.getElementById('result-title').textContent = t('phase_complete');
  document.getElementById('result-message').innerHTML = document.getElementById('name-stats').innerHTML;
  document.getElementById('next-btn').style.display = 'inline-block';

  const next = phaseProgress.current + 1;
  if (!phaseProgress.unlocked.includes(next) && phases[next - 1]) {
    phaseProgress.unlocked.push(next);
    const nextBtn = document.getElementById(`phase-${next}-btn`);
    if (nextBtn) nextBtn.classList.remove('locked');
  }
  localStorage.setItem('phaseProgress', JSON.stringify(phaseProgress));
  updatePhaseButtons();
  updateRecursiveButtonsVisibility();
  document.getElementById('result-modal').style.display = 'block';
  updateTexts();
}

//=== Handle player name submission, validate, save to leaderboard, and close modal ===
function submitPlayerName() {
  let playerName = document.getElementById('player-name-input').value.trim();

  if (containsBadWord(playerName)) {
    alert(t('inappropriate_name'));
    return;
  }

  playerName = playerName.substring(0, 15);
  if (!playerName) {
    alert(t('enter_name_alert'));
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
    .then(() => console.log("Score saved!"))
    .catch(err => console.error("Save failed:", err));

  closeNameModal();
}

//=== Check if the name contains any inappropriate words ===
function containsBadWord(name) {
  const lowered = name.toLowerCase();
  const badWords = [
    'fuck', 'shit', 'cunt', 'nigger', 'nigga', 'fag', 'retard', 'bitch',
    'pussy', 'dick', 'cock', 'asshole', 'whore', 'slut',
    'f u c k', 'f*ck', 'fu ck', 'fück', 'phuck', 'fuk',
    'sh1t', 'sh*t', 's h i t',
    'nigg', 'n1gger', 'n igger',
    'puta', 'mierda', 'joder', 'polla', 'coño', 'cago', 'caca',
    'caralho', 'porra', 'cu', 'buceta', 'pau',
  ];

  return badWords.some(word => lowered.includes(word));
}


function closeNameModal() {
  document.getElementById('name-entry-modal').style.display = 'none';
}

//=== Shows if fail the phase ===
function showFail(msg) {
  isAnimating = false;
  document.getElementById('result-title').textContent = t('failed');
  document.getElementById('result-message').textContent = msg;
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('result-modal').style.display = 'block';
  const startBtn = document.getElementById('start-btn');
  if (startBtn) startBtn.textContent = t('start_game');
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
        <h3>${t('tutorial_basic_title')}</h3>
        <p>${t('tutorial_basic_text')}</p>
        <button onclick="closeTutorial()" class="green-btn" style="margin-top: 15px;">${t('got_it')}</button>
    `;
  showTutorial();
}

function showPhase3Tutorial() {
  document.querySelector('#tutorial-modal .modal-content').innerHTML = `
        <span class="close" onclick="closeTutorial()">&times;</span>
        <h3>${t('tutorial_phase3_title')}</h3>
        ${t('tutorial_phase3_text')}
        <button onclick="closeTutorial()" class="green-btn" style="margin-top: 15px;">${t('got_it')}</button>
    `;
  showTutorial();
}

function showPhase7Tutorial() {
  document.querySelector('#tutorial-modal .modal-content').innerHTML = `
        <span class="close" onclick="closeTutorial()">&times;</span>
        <h3>${t('tutorial_phase7_title')}</h3>
        ${t('tutorial_phase7_text')}
        <button onclick="closeTutorial()" class="green-btn" style="margin-top: 15px;">${t('got_it')}</button>
    `;
  showTutorial();
}
function showPhase9Tutorial() {
  document.querySelector('#tutorial-modal .modal-content').innerHTML = `
        <span class="close" onclick="closeTutorial()">&times;</span>
        <h3>${t('tutorial_phase9_title')}</h3>
        ${t('tutorial_phase9_text')}
        <button onclick="closeTutorial()" class="green-btn" style="margin-top: 15px;">${t('got_it')}</button>
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

function showPhaseSelection() {
  const buttons = document.getElementById('phase-selection-buttons');
  buttons.innerHTML = '';
  phases.forEach(phase => {
    const btn = document.createElement('button');
    btn.className = 'start-phase-btn' + (phaseProgress.unlocked.includes(phase.id) ? ' unlocked' : ' locked');
    btn.innerHTML = `
            <img src="images/phase${phase.id}.png" alt="${t('phase')} ${phase.id}" onerror="this.src='placeholder.png';">
            <span>${t('phase')} ${phase.id}</span>
        `;
    if (phaseProgress.unlocked.includes(phase.id)) {
      btn.onclick = () => {
        closePhaseSelection();
        startPhase(phase.id);
      };
    }
    buttons.appendChild(btn);
  });
  updatePhaseButtons();
  document.getElementById('phase-selection-modal').style.display = 'flex';
  updateTexts();
}

function closePhaseSelection() {
  document.getElementById('phase-selection-modal').style.display = 'none';
}

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
            <h2>${t('global_rankings')}</h2>
            <select id="ranking-phase-select" onchange="showRanking(this.value)" class="phase-select" style="margin:15px 0; padding:10px; font-size:1em; width:100%; max-width:300px;">
                ${phases.map(p => `<option value="${p.id}" ${p.id === 1 ? 'selected' : ''}>${t('phase')} ${p.id}${p.name ? ' – ' + p.name : ''}</option>`).join('')}
            </select>
            <div id="global-ranking-list" class="ranking-list"></div>
            <button onclick="document.getElementById('global-rank-container').remove()" class="green-btn close-btn">${t('close')}</button>
        </div>
    </div>
    `;

  document.body.appendChild(modal);

  setTimeout(() => {
    modal.style.opacity = '1';
    modal.querySelector('.modal-content').style.transform = 'scale(1)';
  }, 10);

  showRanking(1);
  updateTexts();
}

function showRanking(phase) {
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
      if (title) title.textContent = `${t('phase')} ${phaseNum} Ranking`;
    }
  }

  list.innerHTML = `<p class="loading-text">${t('loading_rankings')}</p>`;

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
        list.innerHTML = `<p class="no-records-text">${t('no_records')}</p>`;
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
                        <td><strong>${r.name}${myName && r.name === myName ? ' (' + t('your_rank_you') + ')' : ''}</strong></td>
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

      list.querySelectorAll('.ranking-row').forEach((row, i) => {
        setTimeout(() => {
          row.style.opacity = '1';
          row.style.transform = 'translateY(0)';
        }, i * 100);
      });

      if (yourRank) {
        const box = document.createElement('div');
        box.id = 'your-rank-box';
        box.innerHTML = `
                    <div style="margin:20px auto; padding:18px; background:#001a0d; border:3px solid #00ff88; border-radius:16px; text-align:center; max-width:340px; color:white; font-family:sans-serif;">
                        <div style="font-size:2.8em; font-weight:bold; color:#00ff88;">
                            ${yourRank <= 3 ? ['1st', '2nd', '3rd'][yourRank - 1] : '#' + yourRank}
                        </div>
                        <div style="font-size:1.4em; margin:8px 0;"><strong>${t('your_rank_you')}: ${yourData.name}</strong></div>
                        <div style="color:#ccc;">${yourData.commands} commands • ${yourData.time}s</div>
                    </div>
                `;
        list.parentNode.insertBefore(box, list);
      }
    })
    .catch(err => {
      console.error("Leaderboard error:", err);
      list.innerHTML = `<p class="error-text">${t('error_loading')}</p>`;
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

  updateRecursiveButtonsVisibility();

  // Configura o seletor de idioma 
  const select = document.getElementById('language-select');
  if (select) {
    select.value = currentLang;
    select.addEventListener('change', (e) => {
      currentLang = e.target.value;
      localStorage.setItem('lang', currentLang);
      updateTexts();
      updateCommandDisplay();
      const startBtn = document.getElementById('start-btn');
      if (startBtn && !isAnimating) startBtn.textContent = t('start_game');
    });
  }
  updateMobilePhaseSelect();
  adjustMobileGridPosition();
  updateTexts();
});
window.addEventListener('resize', () => {
  if (document.getElementById('game-screen').classList.contains('active')) {
    repositionElements();
  }

  updateMobilePhaseSelect();
  adjustMobileGridPosition();

  // RESET FORTE + RECRIA GRID NO DESKTOP
  if (window.innerWidth > 1024) {
    // Reset inline
    const elements = [
      document.getElementById('cube'),
      document.getElementById('start-point'),
      document.getElementById('end-point'),
      document.getElementById('game-container'),
      document.getElementById('command-list'),
      document.getElementById('game-screen')
    ];

    elements.forEach(el => {
      if (el) {
        el.removeAttribute('style');
      }
    });

    // Força phase-nav
    const phaseNav = document.getElementById('phase-nav');
    if (phaseNav) phaseNav.style.display = 'flex';

    // Recria grid e reposiciona (mata desalinhamento de A/B/cube)
    resetGridAndReposition();
  }
});



// Restrição de botões de direção por fase
function updateDirectionButtons() {
  const phase = phases.find(p => p.id === currentPhase);
  console.log('Fase atual:', currentPhase);
  console.log('disabledMainDirections:', phase.disabledMainDirections || 'nenhum');

  const disabledMain = phase.disabledMainDirections || [];
  const disabledF1 = phase.disabledF1Directions || [];
  const disabledF2 = phase.disabledF2Directions || [];
  // Principais
  console.log('Botões principais encontrados:');
  document.querySelectorAll('.dir-btn:not(.small)').forEach(btn => {
    console.log('Botão principal:', btn.outerHTML.substring(0, 100), '→ data-dir:', btn.dataset.dir);
    const dir = btn.dataset.dir;
    if (disabledMain.includes(dir)) {
      btn.style.display = 'none';
      btn.disabled = true;
    } else {
      btn.style.display = '';
      btn.disabled = false;
    }
  });
  // Comandos principais 
  document.querySelectorAll('.dir-btn:not(.small)').forEach(btn => {
    const dir = btn.dataset.dir;
    if (disabledMain.includes(dir)) {
      btn.style.display = 'none';
      btn.disabled = true;
    } else {
      btn.style.display = '';
      btn.disabled = false;
    }
  });

  // botões dentro de #function-box
  document.querySelectorAll('#function-box .dir-btn').forEach(btn => {
    const dir = btn.dataset.dir;
    if (disabledF1.includes(dir)) {
      btn.style.display = 'none';
      btn.disabled = true;
    } else {
      btn.style.display = '';
      btn.disabled = false;
    }
  });

  //  botões dentro de #function2-box
  document.querySelectorAll('#function2-box .dir-btn').forEach(btn => {
    const dir = btn.dataset.dir;
    if (disabledF2.includes(dir)) {
      btn.style.display = 'none';
      btn.disabled = true;
    } else {
      btn.style.display = '';
      btn.disabled = false;
    }
  });
}
function updatePhaseButtons() {
  document.querySelectorAll('.phase-btn').forEach(btn => {
    const match = btn.id.match(/phase-(\d+)-btn/);
    if (!match) return;
    const id = parseInt(match[1]);

    if (phaseProgress.unlocked.includes(id)) {
      btn.classList.remove('locked');
      btn.disabled = false;
    } else {
      btn.classList.add('locked');
      btn.disabled = true;
    }

    // Atualiza o botão da fase atual 
    if (id === phaseProgress.current) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Atualiza os botões do modal de seleção 
  document.querySelectorAll('.start-phase-btn').forEach(btn => {
    const span = btn.querySelector('span');
    if (!span) return;
    const id = parseInt(span.textContent.match(/\d+/)?.[0]);
    if (id && phaseProgress.unlocked.includes(id)) {
      btn.classList.remove('locked');
      btn.classList.add('unlocked');
    } else {
      btn.classList.remove('unlocked');
      btn.classList.add('locked');
    }

  });
  updateMobilePhaseSelect();
}



function updateMobilePhaseSelect() {
  const display = document.getElementById('mobile-phase-display');
  const optionsList = document.getElementById('mobile-phase-options');
  if (!display || !optionsList) return;

  if (window.innerWidth <= 1024) {
    optionsList.innerHTML = '';


    display.onclick = () => optionsList.classList.toggle('select-hide');


    const phaseButtons = document.querySelectorAll('.phase-btn');
    const maxPhase = phaseButtons.length > 0
      ? Math.max(...Array.from(phaseButtons).map(btn => {
        const match = btn.id.match(/phase-(\d+)-btn/);
        return match ? parseInt(match[1]) : 0;
      }))
      : phaseProgress.unlocked.length + 5;

    for (let id = 1; id <= maxPhase; id++) {
      const li = document.createElement('li');
      let text = `${t('phase')} ${id}`;

      const btn = document.getElementById(`phase-${id}-btn`);
      const isLocked = btn ? btn.classList.contains('locked') : false;

      if (isLocked) {
        li.classList.add('locked');
        text += ` (${t('locked')})`;
      }

      li.textContent = text;


      li.onclick = function () {
        if (!isLocked) {
          display.textContent = text;
          optionsList.classList.add('select-hide');
          startPhase(id);
        }
      };

      if (id === currentPhase) {
        display.textContent = text;
      }

      optionsList.appendChild(li);
    }
  }

  display.onclick = function (e) {
    e.stopPropagation();

    optionsList.classList.toggle('select-hide');
    display.classList.toggle('select-arrow-active');
  };
}


window.onclick = function (event) {
  if (!event.target.matches('.select-selected')) {
    document.getElementById('mobile-phase-options')?.classList.add('select-hide');
  }
}

function adjustMobileGridPosition() {
  if (window.innerWidth > 1024) return;

  const commandList = document.getElementById('command-list');
  const gridContainer = document.getElementById('game-container');

  if (commandList && gridContainer) {
    const commandHeight = commandList.offsetHeight || 70;
    const newTop = commandHeight + 30;
    gridContainer.style.top = `${newTop}px`;

    document.getElementById('game-screen').style.paddingTop = `${newTop + 370}px`;
  }
}

// Carrega progresso salvo 
const savedProgress = localStorage.getItem('phaseProgress');
if (savedProgress) {
  phaseProgress = JSON.parse(savedProgress);
} else {
  phaseProgress = { current: 1, unlocked: [1] };
}


updatePhaseButtons();

