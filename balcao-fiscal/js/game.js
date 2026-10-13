/**
 * Lógica Principal do Jogo - Balcão Fiscal: Desafio da Nota Fiscal
 * SODIPROM - CAMP Diadema
 */

class BalcaoFiscalGame {
  constructor() {
    this.currentMode = 'career'; // 'career', 'rush', 'free'
    this.currentLevelIndex = 0;
    this.levelConfig = FISCAL_LEVELS[0];
    
    // Estado da partida
    this.state = 'MENU'; // 'MENU', 'PLAYING', 'STAMPING', 'LEVEL_COMPLETE', 'GAME_OVER'
    this.currentInvoice = null;
    this.typedBuffer = "";
    
    // Métricas
    this.score = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.invoicesCompleted = 0;
    this.totalStrokes = 0;
    this.correctStrokes = 0;
    this.errorCount = 0;
    this.startTime = null;
    this.timerInterval = null;
    this.timeLeft = 60;

    // Elementos do DOM
    this.dom = {
      levelBadge: document.getElementById('levelBadge'),
      levelTitle: document.getElementById('levelTitle'),
      metricScore: document.getElementById('metricScore'),
      metricCombo: document.getElementById('metricCombo'),
      metricGoal: document.getElementById('metricGoal'),
      metricTimer: document.getElementById('metricTimer'),
      invoicePaper: document.getElementById('invoicePaper'),
      stampOverlay: document.getElementById('stampOverlay'),
      consolePrompt: document.getElementById('consolePrompt'),
      consoleBufferDisplay: document.getElementById('consoleBufferDisplay'),
      btnEnter: document.getElementById('btnEnterStamp'),
      modalMode: document.getElementById('modalModeSelect'),
      modalVictory: document.getElementById('modalVictory'),
      modalGameOver: document.getElementById('modalGameOver'),
      numpadPanel: document.getElementById('numpadPanel'),
      btnToggleNumpad: document.getElementById('btnToggleNumpad'),
      btnSoundToggle: document.getElementById('btnSoundToggle')
    };

    this.initEventListeners();
    this.updateSoundButtonUI();
  }

  initEventListeners() {
    // Captura global de teclado
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Botão Enter na tela
    if (this.dom.btnEnter) {
      this.dom.btnEnter.addEventListener('click', () => this.submitInput());
    }

    // Toggle do teclado numérico virtual
    if (this.dom.btnToggleNumpad) {
      this.dom.btnToggleNumpad.addEventListener('click', () => {
        this.dom.numpadPanel.classList.toggle('collapsed');
      });
    }

    // Toggle de som
    if (this.dom.btnSoundToggle) {
      this.dom.btnSoundToggle.addEventListener('click', () => {
        const isMuted = window.fiscalAudio.toggleMute();
        this.updateSoundButtonUI();
      });
    }

    // Cliques nas teclas do Numpad virtual na tela (suporte touch/mouse)
    document.querySelectorAll('.np-key').forEach(keyEl => {
      keyEl.addEventListener('click', () => {
        const keyVal = keyEl.getAttribute('data-key');
        if (!keyVal) return;
        if (keyVal === 'Enter') {
          this.submitInput();
        } else if (keyVal === 'Backspace') {
          this.deleteChar();
        } else {
          this.appendChar(keyVal);
        }
      });
    });
  }

  updateSoundButtonUI() {
    if (!this.dom.btnSoundToggle) return;
    const isMuted = window.fiscalAudio.isMuted();
    this.dom.btnSoundToggle.innerHTML = isMuted 
      ? `<span>🔇</span> <span>Som: Desligado</span>`
      : `<span>🔊</span> <span>Som: Ligado</span>`;
  }

  /**
   * Inicia um modo de jogo
   */
  startMode(mode, levelIndex = 0) {
    this.currentMode = mode;
    this.currentLevelIndex = levelIndex;
    this.levelConfig = FISCAL_LEVELS[levelIndex] || FISCAL_LEVELS[0];

    this.score = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.invoicesCompleted = 0;
    this.totalStrokes = 0;
    this.correctStrokes = 0;
    this.errorCount = 0;
    this.startTime = Date.now();

    // Fecha modais
    this.closeAllModals();

    // Configura metas e tempo
    if (this.currentMode === 'rush') {
      this.timeLeft = 60;
      this.startTimer();
      this.dom.levelBadge.textContent = "Modo Corrida";
      this.dom.levelTitle.textContent = "Carimbe o máximo de notas em 60s!";
      this.dom.metricGoal.textContent = "--";
    } else if (this.currentMode === 'free') {
      this.stopTimer();
      this.dom.metricTimer.parentElement.style.display = 'none';
      this.dom.levelBadge.textContent = "Treino Livre";
      this.dom.levelTitle.textContent = "Prática livre sem pressão de tempo";
      this.dom.metricGoal.textContent = "∞";
    } else {
      // Modo Carreira
      this.dom.levelBadge.textContent = `Nível ${this.levelConfig.id}`;
      this.dom.levelTitle.textContent = this.levelConfig.title;
      this.dom.metricGoal.textContent = `0 / ${this.levelConfig.targetGoal}`;
      if (this.levelConfig.timeLimit) {
        this.timeLeft = this.levelConfig.timeLimit;
        this.startTimer();
      } else {
        this.stopTimer();
        this.dom.metricTimer.parentElement.style.display = 'none';
      }
    }

    this.updateHUD();
    this.state = 'PLAYING';
    this.spawnNextInvoice();
  }

  startTimer() {
    this.stopTimer();
    this.dom.metricTimer.parentElement.style.display = 'flex';
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();

      if (this.timeLeft <= 0) {
        this.stopTimer();
        this.finishGameTimeUp();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerDisplay() {
    if (!this.dom.metricTimer) return;
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    this.dom.metricTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Gera e apresenta a próxima nota fiscal no balcão
   */
  spawnNextInvoice() {
    this.typedBuffer = "";
    this.currentInvoice = InvoiceGenerator.generateInvoice(this.levelConfig, this.currentMode);
    
    // Reproduz som de papel deslizando
    window.fiscalAudio.playPaperSlide();

    // Renderiza a nota fiscal no DOM
    this.renderInvoiceDOM(this.currentInvoice);

    // Animação de entrada
    this.dom.invoicePaper.classList.remove('slide-out', 'shake-error');
    this.dom.invoicePaper.classList.add('slide-in');
    this.dom.stampOverlay.classList.remove('stamp-active');

    // Atualiza prompt e console de digitação
    this.updateConsoleUI();
  }

  renderInvoiceDOM(inv) {
    const currentField = inv.fieldsToInput[inv.currentFieldIndex];

    // Cabeçalho da nota
    document.getElementById('emitterEmoji').textContent = inv.company.logoEmoji;
    document.getElementById('emitterName').textContent = inv.company.name;
    document.getElementById('emitterCnpj').textContent = `CNPJ: ${inv.company.cnpj} • ${inv.company.cidade}`;
    document.getElementById('danfeSerie').textContent = `Série: ${inv.series}`;

    // Campos principais
    const boxNum = document.getElementById('boxInvoiceNumber');
    const boxEmission = document.getElementById('boxEmissionDate');
    const boxBarcode = document.getElementById('boxBarcode');
    const boxTotal = document.getElementById('boxTotalValue');

    document.getElementById('dispInvoiceNumber').textContent = inv.invoiceNumber;
    document.getElementById('dispEmissionDate').textContent = inv.emissionDate;
    document.getElementById('dispBarcode').textContent = inv.barcode;
    document.getElementById('dispTotalValue').textContent = inv.totalValue;

    // Remove destaques anteriores
    [boxNum, boxEmission, boxBarcode, boxTotal].forEach(el => el.classList.remove('target-highlight'));

    // Adiciona destaque ao campo alvo atual
    if (currentField.highlightField === 'invoiceNumber') {
      boxNum.classList.add('target-highlight');
    } else if (currentField.highlightField === 'emissionDate') {
      boxEmission.classList.add('target-highlight');
    } else if (currentField.highlightField === 'barcode') {
      boxBarcode.classList.add('target-highlight');
    } else if (currentField.highlightField === 'totalValue') {
      boxTotal.classList.add('target-highlight');
    }

    // Tabela de itens
    const itemsTbody = document.getElementById('invoiceItemsTbody');
    itemsTbody.innerHTML = inv.items.map(item => `
      <tr>
        <td>${item.desc}</td>
        <td class="mono-td">${item.qtd}</td>
        <td class="mono-td">${item.precoUnit}</td>
        <td class="mono-td">${item.total}</td>
      </tr>
    `).join('');
  }

  updateConsoleUI() {
    if (!this.currentInvoice) return;
    const currentField = this.currentInvoice.fieldsToInput[this.currentInvoice.currentFieldIndex];

    this.dom.consolePrompt.innerHTML = `
      <span>🎯 ${currentField.label}:</span>
      <span class="console-instruction-pill">💡 ${currentField.instruction}</span>
    `;

    this.renderBufferComparison(currentField.targetValue);
  }

  renderBufferComparison(target) {
    let html = "";
    const len = Math.max(this.typedBuffer.length, 0);

    for (let i = 0; i < len; i++) {
      const charTyped = this.typedBuffer[i];
      const targetChar = target[i];

      if (targetChar !== undefined && charTyped === targetChar) {
        html += `<span class="char-match">${charTyped}</span>`;
      } else {
        html += `<span class="char-mismatch">${charTyped}</span>`;
      }
    }

    // Cursor pulsante
    html += `<span class="typing-cursor"></span>`;
    this.dom.consoleBufferDisplay.innerHTML = html;
  }

  /**
   * Processa tecla pressionada
   */
  handleKeyDown(e) {
    if (this.state !== 'PLAYING') return;

    // Ilumina tecla no Numpad virtual se aplicável
    this.highlightVirtualNumpadKey(e.key);

    // Previne rolagem de página no Enter ou Barra de Espaço
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
    }

    if (e.key === 'Enter') {
      this.submitInput();
      return;
    }

    if (e.key === 'Backspace') {
      this.deleteChar();
      return;
    }

    // Permite caracteres numéricos e pontuação fiscal comum: 0-9, vírgula, ponto, barra
    const validChars = "0123456789,./-";
    if (e.key.length === 1 && validChars.includes(e.key)) {
      this.appendChar(e.key);
    }
  }

  highlightVirtualNumpadKey(key) {
    let keySelector = `[data-key="${key}"]`;
    if (key === 'Enter') keySelector = `[data-key="Enter"]`;
    if (key === '.') keySelector = `[data-key="."]`;
    if (key === ',') keySelector = `[data-key=","]`;

    const btn = document.querySelector(keySelector);
    if (btn) {
      btn.classList.add('key-active');
      setTimeout(() => btn.classList.remove('key-active'), 150);
    }
  }

  appendChar(char) {
    this.typedBuffer += char;
    this.totalStrokes++;

    const currentField = this.currentInvoice.fieldsToInput[this.currentInvoice.currentFieldIndex];
    const target = currentField.targetValue;
    const charIndex = this.typedBuffer.length - 1;

    if (target[charIndex] === char) {
      this.correctStrokes++;
      window.fiscalAudio.playKeyClick(false);
    } else {
      window.fiscalAudio.playErrorSound();
    }

    this.renderBufferComparison(target);
  }

  deleteChar() {
    if (this.typedBuffer.length > 0) {
      this.typedBuffer = this.typedBuffer.slice(0, -1);
      window.fiscalAudio.playKeyClick(false);
      const currentField = this.currentInvoice.fieldsToInput[this.currentInvoice.currentFieldIndex];
      this.renderBufferComparison(currentField.targetValue);
    }
  }

  /**
   * Ação ao pressionar ENTER: Valida o campo digitado
   */
  submitInput() {
    if (this.state !== 'PLAYING' || !this.currentInvoice) return;

    const currentField = this.currentInvoice.fieldsToInput[this.currentInvoice.currentFieldIndex];
    const target = currentField.targetValue.trim();
    const typed = this.typedBuffer.trim();

    if (typed === target) {
      // SUCESSO!
      this.handleFieldSuccess();
    } else {
      // ERRO AO CARIMBAR!
      this.handleFieldError();
    }
  }

  handleFieldSuccess() {
    window.fiscalAudio.playStampSuccess();
    
    // Pontuação e Combos
    const pointsGained = 100 * this.combo;
    this.score += pointsGained;
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    // Som de Ka-ching em combos múltiplos
    if (this.combo >= 3 && this.combo % 3 === 0) {
      window.fiscalAudio.playComboChing(this.combo);
    }

    this.updateHUD();

    // Verifica se há outro campo na mesma nota fiscal (ex: dual_input)
    const hasNextField = (this.currentInvoice.currentFieldIndex + 1) < this.currentInvoice.fieldsToInput.length;

    if (hasNextField) {
      // Avança para o próximo campo da mesma nota
      this.currentInvoice.currentFieldIndex++;
      this.typedBuffer = "";
      this.renderInvoiceDOM(this.currentInvoice);
      this.updateConsoleUI();
    } else {
      // NOTA FISCAL TOTALMENTE CONCLUÍDA E CARIMBADA!
      this.state = 'STAMPING';
      this.invoicesCompleted++;
      this.updateHUD();

      // Ativa carimbo gigante
      this.dom.stampOverlay.classList.remove('stamp-active');
      void this.dom.stampOverlay.offsetWidth; // trigger reflow
      this.dom.stampOverlay.classList.add('stamp-active');

      // Espera 350ms e desliza a nota para a pilha de saída
      setTimeout(() => {
        this.dom.invoicePaper.classList.remove('slide-in');
        this.dom.invoicePaper.classList.add('slide-out');

        setTimeout(() => {
          this.checkProgressOrNext();
        }, 320);
      }, 350);
    }
  }

  handleFieldError() {
    window.fiscalAudio.playErrorSound();
    this.errorCount++;
    this.combo = 1; // quebra o combo
    this.updateHUD();

    // Tremor da nota
    this.dom.invoicePaper.classList.remove('shake-error');
    void this.dom.invoicePaper.offsetWidth;
    this.dom.invoicePaper.classList.add('shake-error');
  }

  checkProgressOrNext() {
    if (this.currentMode === 'career') {
      if (this.invoicesCompleted >= this.levelConfig.targetGoal) {
        this.finishLevelVictory();
        return;
      }
    }

    this.state = 'PLAYING';
    this.spawnNextInvoice();
  }

  finishLevelVictory() {
    this.state = 'LEVEL_COMPLETE';
    this.stopTimer();
    window.fiscalAudio.playVictoryFanfare();

    const accuracy = this.totalStrokes > 0 ? Math.round((this.correctStrokes / this.totalStrokes) * 100) : 100;
    const timeSpent = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    const npm = Math.round((this.invoicesCompleted / timeSpent) * 60);

    document.getElementById('vicLevelTitle').textContent = `${this.levelConfig.title} Concluído!`;
    document.getElementById('vicBadge').textContent = `🏅 Distintivo: ${this.levelConfig.badge}`;
    document.getElementById('vicScore').textContent = this.score;
    document.getElementById('vicInvoices').textContent = this.invoicesCompleted;
    document.getElementById('vicAccuracy').textContent = `${accuracy}%`;
    document.getElementById('vicNpm').textContent = `${npm} NF/min`;

    // Botão próxima fase
    const btnNext = document.getElementById('btnNextLevel');
    if (this.currentLevelIndex + 1 < FISCAL_LEVELS.length) {
      btnNext.style.display = 'inline-flex';
      btnNext.onclick = () => {
        this.startMode('career', this.currentLevelIndex + 1);
      };
    } else {
      btnNext.style.display = 'none';
      document.getElementById('vicBadge').textContent = `🏆 PARABÉNS! VOCÊ ZEROU A TRILHA FISCAL!`;
    }

    this.dom.modalVictory.classList.add('modal-open');
  }

  finishGameTimeUp() {
    this.state = 'GAME_OVER';
    window.fiscalAudio.playVictoryFanfare();

    const accuracy = this.totalStrokes > 0 ? Math.round((this.correctStrokes / this.totalStrokes) * 100) : 100;

    document.getElementById('goScore').textContent = this.score;
    document.getElementById('goInvoices').textContent = this.invoicesCompleted;
    document.getElementById('goMaxCombo').textContent = `${this.maxCombo}x`;
    document.getElementById('goAccuracy').textContent = `${accuracy}%`;

    this.dom.modalGameOver.classList.add('modal-open');
  }

  updateHUD() {
    this.dom.metricScore.textContent = this.score;
    this.dom.metricCombo.textContent = `${this.combo}x`;

    if (this.currentMode === 'career') {
      this.dom.metricGoal.textContent = `${this.invoicesCompleted} / ${this.levelConfig.targetGoal}`;
    } else if (this.currentMode === 'rush') {
      this.dom.metricGoal.textContent = `${this.invoicesCompleted} NF`;
    }
  }

  openModeSelect() {
    this.stopTimer();
    this.state = 'MENU';
    this.closeAllModals();
    this.dom.modalMode.classList.add('modal-open');
  }

  closeAllModals() {
    document.querySelectorAll('.fiscal-modal-backdrop').forEach(m => m.classList.remove('modal-open'));
  }
}

// Inicialização após carregamento
window.addEventListener('DOMContentLoaded', () => {
  window.game = new BalcaoFiscalGame();
  window.game.openModeSelect();
});
