/**
 * Sassembly Interactive Playground Controller
 * Connects editor UI, token ribbons, registers grid, and live VM execution.
 */

document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('codeEditor');
  const lineNumbers = document.getElementById('lineNumbers');
  const presetSelect = document.getElementById('presetSelect');
  const btnRun = document.getElementById('btnRun');
  const btnStep = document.getElementById('btnStep');
  const btnReset = document.getElementById('btnReset');
  const btnClear = document.getElementById('btnClear');
  const btnCopy = document.getElementById('btnCopy');
  const execModeSelect = document.getElementById('execModeSelect');

  const uartDisplay = document.getElementById('uartOutput');
  const surfaceDisplay = document.getElementById('surfaceOutput');
  const haltStatusBadge = document.getElementById('haltStatus');
  const cycleCountSpan = document.getElementById('cycleCount');
  const pcSpan = document.getElementById('currentPc');
  const regGrid = document.getElementById('regGrid');
  const tokenRibbon = document.getElementById('tokenRibbon');

  if (!textarea || !window.Sassembly) return;

  const vm = new Sassembly.VM();
  let prevRegisters = new BigInt64Array(32);

  // --- 1. Populate Register Bank Grid ---
  function initRegistersGrid() {
    regGrid.innerHTML = '';
    Sassembly.REGISTERS.forEach((r, idx) => {
      const cell = document.createElement('div');
      cell.className = 'reg-cell';
      cell.id = `reg-cell-${idx}`;
      cell.innerHTML = `
        <span class="reg-name" title="${r.abi} (x${r.num}) - ${r.desc}">${r.dev}</span>
        <span class="reg-val" id="reg-val-${idx}">०षोड्०</span>
      `;
      regGrid.appendChild(cell);
    });
  }

  // --- 2. Populate Virtual Token Quick-Insert Ribbon ---
  function initTokenRibbon() {
    if (!tokenRibbon) return;
    const tokens = [
      // Kāraka Sigils
      { label: 'म् (कर्म)', insert: 'म् ', class: 'sigil', title: 'Destination (कर्म)' },
      { label: 'न (करण)', insert: 'न ', class: 'sigil', title: 'Source / Instrument (करण)' },
      { label: 'त् (अपादान)', insert: 'त् ', class: 'sigil', title: 'Load Address (अपादान)' },
      { label: 'य् (सम्प्रदान)', insert: 'य् ', class: 'sigil', title: 'Store Address / Jump Target (सम्प्रदान)' },
      { label: 'ए (अधिकरण)', insert: 'ए ', class: 'sigil', title: 'Locus (अधिकरण)' },
      // Statements & Directives
      { label: '। (दण्डः)', insert: ' ।\n', title: 'Statement Terminator' },
      { label: '॥ कोष्ठकम् ॱदत्त ॥', insert: '॥ कोष्ठकम् ॱदत्त ॥\n', title: 'Data Section' },
      { label: '॥ कोष्ठकम् ॱपाठ ॥', insert: '॥ कोष्ठकम् ॱपाठ ॥\n', title: 'Text Section' },
      { label: 'ॱॱ (नामपदम्)', insert: 'ॱॱ\n', title: 'Label' },
      { label: '॰ (टिप्पणी)', insert: '॰ ', title: 'Comment' },
      // Common Registers
      { label: 'क्षणिक०', insert: 'क्षणिक०', title: 'Temporary 0 (t0)' },
      { label: 'क्षणिक१', insert: 'क्षणिक१', title: 'Temporary 1 (t1)' },
      { label: 'अर्थ०', insert: 'अर्थ०', title: 'Argument 0 (a0)' },
      { label: 'शून्यः', insert: 'शून्यः', title: 'Zero (x0)' },
      // Numerals
      { label: '०षोड्', insert: '०षोड्', title: 'Hexadecimal Prefix' },
      { label: '०द्वि', insert: '०द्वि', title: 'Binary Prefix' }
    ];

    tokenRibbon.innerHTML = '';
    tokens.forEach(t => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `token-pill ${t.class || ''}`;
      btn.textContent = t.label;
      btn.title = t.title;
      btn.onclick = () => insertAtCursor(t.insert);
      tokenRibbon.appendChild(btn);
    });
  }

  function insertAtCursor(text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;
    textarea.value = val.substring(0, start) + text + val.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
    updateLineNumbers();
  }

  // --- 3. Line Numbers Synchronizer ---
  function updateLineNumbers() {
    const lines = textarea.value.split('\n').length;
    let nums = '';
    for (let i = 1; i <= lines; i++) {
      nums += i + '\n';
    }
    lineNumbers.textContent = nums;
  }

  textarea.addEventListener('input', updateLineNumbers);
  textarea.addEventListener('scroll', () => {
    lineNumbers.scrollTop = textarea.scrollTop;
  });

  // --- 4. Update UI with VM State ---
  function updateVMDisplay() {
    // Update Registers
    for (let i = 0; i < 32; i++) {
      const valElem = document.getElementById(`reg-val-${i}`);
      const cellElem = document.getElementById(`reg-cell-${i}`);
      if (valElem) {
        let val = vm.registers[i];
        valElem.textContent = Sassembly.toSanskritNumeral(Number(val), 16);

        if (val !== prevRegisters[i]) {
          cellElem.classList.add('highlight');
          setTimeout(() => cellElem.classList.remove('highlight'), 800);
        }
      }
    }
    prevRegisters = new BigInt64Array(vm.registers);

    // Update PC and Cycles
    pcSpan.textContent = '०षोड्' + vm.pc.toString(16).toUpperCase();
    cycleCountSpan.textContent = Sassembly.toSanskritNumeral(vm.cycleCount);

    // Update Panes
    uartDisplay.textContent = vm.uartOutput || (vm.isAppMode ? '(Empty: U-mode app cannot access UART)' : '(UART Ready)');
    surfaceDisplay.textContent = vm.surfaceOutput || (vm.isAppMode ? '(Surface Granted: Waiting for output)' : '(No surface granted to bare-metal proof)');

    // Update Halt Status
    if (vm.isHalted) {
      haltStatusBadge.textContent = vm.exitCode === 0 ? '✓ ' + vm.haltReason : '✗ ' + vm.haltReason;
      haltStatusBadge.className = vm.exitCode === 0 ? 'badge-live' : 'badge-live error';
      haltStatusBadge.style.background = vm.exitCode === 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      haltStatusBadge.style.color = vm.exitCode === 0 ? '#10b981' : '#f87171';
    } else {
      haltStatusBadge.textContent = 'सज्जम् (Running)';
      haltStatusBadge.className = 'badge-live';
      haltStatusBadge.style.background = 'rgba(0, 240, 255, 0.15)';
      haltStatusBadge.style.color = '#00f0ff';
    }
  }

  // --- 5. Assemble and Run ---
  function assembleAndRun() {
    const isApp = execModeSelect.value === 'app';
    const code = textarea.value;
    const res = vm.loadProgram(code, isApp);

    if (!res.success) {
      let errText = res.errors.map(e => `दोषः [Line ${e.line}]: ${e.text}`).join('\n');
      uartDisplay.textContent = errText;
      haltStatusBadge.textContent = 'संकलनदोषः (Assembly Error)';
      haltStatusBadge.style.background = 'rgba(239, 68, 68, 0.2)';
      haltStatusBadge.style.color = '#f87171';
      return;
    }

    vm.run();
    updateVMDisplay();
  }

  // --- 6. Step Execution ---
  function stepExecution() {
    if (vm.instructions.length === 0 || vm.isHalted) {
      const isApp = execModeSelect.value === 'app';
      const res = vm.loadProgram(textarea.value, isApp);
      if (!res.success) return;
    }

    vm.step();
    updateVMDisplay();
  }

  // --- 7. Reset State ---
  function resetVM() {
    const isApp = execModeSelect.value === 'app';
    vm.loadProgram(textarea.value, isApp);
    updateVMDisplay();
  }

  // --- 8. Event Listeners ---
  btnRun.addEventListener('click', assembleAndRun);
  btnStep.addEventListener('click', stepExecution);
  btnReset.addEventListener('click', resetVM);

  btnClear.addEventListener('click', () => {
    textarea.value = '';
    updateLineNumbers();
    resetVM();
  });

  btnCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(textarea.value);
    const originalText = btnCopy.innerHTML;
    btnCopy.innerHTML = '✓ प्रतिलिपितम् (Copied)';
    setTimeout(() => btnCopy.innerHTML = originalText, 1500);
  });

  presetSelect.addEventListener('change', () => {
    const key = presetSelect.value;
    const preset = Sassembly.PRESET_PROGRAMS[key];
    if (preset) {
      textarea.value = preset.code;
      execModeSelect.value = preset.type;
      updateLineNumbers();
      resetVM();
    }
  });

  // Shortcut: Cmd/Ctrl + Enter to Assemble & Run
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      assembleAndRun();
    }
  });

  // Initialize
  initRegistersGrid();
  initTokenRibbon();
  if (Sassembly.PRESET_PROGRAMS['namaste']) {
    textarea.value = Sassembly.PRESET_PROGRAMS['namaste'].code;
    updateLineNumbers();
    resetVM();
  }
});
