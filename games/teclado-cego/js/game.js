/**
 * Motor Principal do Jogo Mestre do Teclado Cego
 * Controla a digitação, métricas, feedback de teclas e dedos
 * SODIPROM - CAMP Diadema
 */

class TouchTypingGame {
  constructor() {
    this.currentLessonIndex = 0;
    this.currentLesson = LESSONS_DATABASE[0];
    this.targetText = "";
    this.currentIndex = 0;
    
    this.isRunning = false;
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.timerInterval = null;

    this.totalTyped = 0;
    this.correctTyped = 0;
    this.errorsCount = 0;
    this.currentCombo = 0;
    this.maxCombo = 0;
    this.errorKeys = {};

    // Elementos DOM
    this.dom = {
      textStream: document.getElementById('text-stream'),
      keyboardContainer: document.getElementById('keyboard-grid'),
      hudWpm: document.getElementById('stat-wpm'),
      hudAccuracy: document.getElementById('stat-accuracy'),
      hudCombo: document.getElementById('stat-combo'),
      hudTime: document.getElementById('stat-time'),
      lessonTag: document.getElementById('lesson-tag'),
      lessonTitle: document.getElementById('lesson-title'),
      guideKeyBadge: document.getElementById('guide-key-badge'),
      guideInstruction: document.getElementById('guide-instruction'),
      guideFingerIndicator: document.getElementById('guide-finger-indicator'),
      modalResult: document.getElementById('modal-result'),
      modalLessons: document.getElementById('modal-lessons')
    };

    this.init();
  }

  init() {
    this.renderKeyboard();
    this.loadLesson(0);
    this.bindEvents();
    this.updateSoundToggleIcon();
  }

  /**
   * Renderiza a estrutura física do teclado ABNT2 no DOM
   */
  renderKeyboard() {
    if (!this.dom.keyboardContainer) return;
    this.dom.keyboardContainer.innerHTML = '';

    ABNT2_KEYBOARD_LAYOUT.forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.className = 'keyboard-row';

      row.forEach(key => {
        const keyEl = document.createElement('div');
        keyEl.className = `keycap ${key.width || ''} ${key.isHoming ? 'homing' : ''}`;
        keyEl.id = `key-${key.code}`;
        keyEl.dataset.code = key.code;

        // Barra inferior com a cor do dedo
        const fingerInfo = FINGER_DATA[key.finger];
        if (fingerInfo) {
          const fingerBar = document.createElement('div');
          fingerBar.className = 'finger-bar';
          fingerBar.style.backgroundColor = fingerInfo.color;
          keyEl.appendChild(fingerBar);
        }

        // Exibição do rótulo
        if (key.display) {
          const label = document.createElement('span');
          label.className = 'key-primary-char';
          label.textContent = key.display;
          keyEl.appendChild(label);
        } else {
          if (key.shift) {
            const shiftSpan = document.createElement('span');
            shiftSpan.className = 'key-shift-char';
            shiftSpan.textContent = key.shift;
            keyEl.appendChild(shiftSpan);
          }
          const primarySpan = document.createElement('span');
          primarySpan.className = 'key-primary-char';
          primarySpan.textContent = key.primary.toUpperCase();
          keyEl.appendChild(primarySpan);
        }

        rowEl.appendChild(keyEl);
      });

      this.dom.keyboardContainer.appendChild(rowEl);
    });
  }

  /**
   * Carrega uma lição específica
   */
  loadLesson(index) {
    if (index < 0 || index >= LESSONS_DATABASE.length) index = 0;
    this.currentLessonIndex = index;
    this.currentLesson = LESSONS_DATABASE[index];
    this.targetText = this.currentLesson.text;

    this.resetStats();

    if (this.dom.lessonTag) this.dom.lessonTag.textContent = this.currentLesson.levelName;
    if (this.dom.lessonTitle) this.dom.lessonTitle.textContent = this.currentLesson.title;

    this.renderTextStream();
    this.updateTargetHighlight();
  }

  resetStats() {
    this.currentIndex = 0;
    this.isRunning = false;
    this.startTime = null;
    this.elapsedSeconds = 0;
    clearInterval(this.timerInterval);

    this.totalTyped = 0;
    this.correctTyped = 0;
    this.errorsCount = 0;
    this.currentCombo = 0;
    this.maxCombo = 0;
    this.errorKeys = {};

    this.updateHUD();
  }

  renderTextStream() {
    if (!this.dom.textStream) return;
    this.dom.textStream.innerHTML = '';

    for (let i = 0; i < this.targetText.length; i++) {
      const charSpan = document.createElement('span');
      charSpan.className = `char ${i === 0 ? 'current' : 'upcoming'}`;
      charSpan.id = `char-${i}`;
      
      const c = this.targetText[i];
      charSpan.textContent = c === ' ' ? '␣' : c;
      if (c === ' ') charSpan.dataset.isSpace = 'true';

      this.dom.textStream.appendChild(charSpan);
    }

    // Scroll para o início
    this.dom.textStream.scrollLeft = 0;
  }

  /**
   * Atualiza as marcações visuais na tela (tecla atual, tecla shift, dedo)
   */
  updateTargetHighlight() {
    // Limpa destaques anteriores no teclado
    document.querySelectorAll('.keycap.target-key, .keycap.target-shift').forEach(el => {
      el.classList.remove('target-key', 'target-shift');
      el.style.removeProperty('--target-color');
    });

    // Limpa destaque das mãos
    document.querySelectorAll('.finger-slot.active').forEach(el => {
      el.classList.remove('active');
      el.style.removeProperty('--active-color');
    });

    if (this.currentIndex >= this.targetText.length) {
      return;
    }

    const targetChar = this.targetText[this.currentIndex];
    const keyInfo = resolveKeyForChar(targetChar);

    if (!keyInfo) return;

    // Destaca a tecla alvo no teclado
    const keyEl = document.getElementById(`key-${keyInfo.code}`);
    if (keyEl) {
      keyEl.classList.add('target-key');
      const fingerData = FINGER_DATA[keyInfo.finger];
      if (fingerData) {
        keyEl.style.setProperty('--target-color', fingerData.color);
      }
    }

    // Se precisar de tecla Shift, destaca o Shift correto (da mão oposta)
    if (keyInfo.shiftCode) {
      const shiftEl = document.getElementById(`key-${keyInfo.shiftCode}`);
      if (shiftEl) {
        shiftEl.classList.add('target-shift');
      }
    }

    // Destaca o dedo correspondente nas mãos ilustradas
    const fingerSlot = document.getElementById(`finger-${keyInfo.finger}`);
    if (fingerSlot) {
      fingerSlot.classList.add('active');
      const fingerData = FINGER_DATA[keyInfo.finger];
      if (fingerData) {
        fingerSlot.style.setProperty('--active-color', fingerData.color);
      }
    }

    // Atualiza o banner didático
    if (this.dom.guideKeyBadge) {
      this.dom.guideKeyBadge.textContent = targetChar === ' ' ? 'Espaço (␣)' : targetChar;
    }

    if (this.dom.guideInstruction) {
      this.dom.guideInstruction.innerHTML = keyInfo.instruction.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
    }

    if (this.dom.guideFingerIndicator) {
      const fingerData = FINGER_DATA[keyInfo.finger];
      if (fingerData) {
        this.dom.guideFingerIndicator.innerHTML = `
          <span class="finger-dot" style="background-color: ${fingerData.color};"></span>
          <span style="color: ${fingerData.color}; font-weight: 800;">${fingerData.name}</span>
        `;
      }
    }

    // Auto-scroll do texto para manter o caractere visível
    const currentCharEl = document.getElementById(`char-${this.currentIndex}`);
    if (currentCharEl && this.dom.textStream) {
      const containerLeft = this.dom.textStream.getBoundingClientRect().left;
      const charLeft = currentCharEl.getBoundingClientRect().left;
      const offset = charLeft - containerLeft - 100;
      if (offset > 150 || offset < 0) {
        this.dom.textStream.scrollBy({ left: offset, behavior: 'smooth' });
      }
    }
  }

  handleKeystroke(e) {
    // Ignora teclas de navegação ou atalhos como F5, F12, Ctrl+R
    if (e.ctrlKey || e.altKey || e.metaKey || e.key.startsWith('F')) return;
    if (['Tab', 'CapsLock', 'Shift', 'Control', 'Alt'].includes(e.key)) return;

    e.preventDefault();

    if (!this.isRunning) {
      this.startTimer();
    }

    const targetChar = this.targetText[this.currentIndex];
    const typedKey = e.key;

    this.totalTyped++;

    if (typedKey === targetChar) {
      // ACERTO
      sound.playKeyClick();

      const charEl = document.getElementById(`char-${this.currentIndex}`);
      if (charEl) {
        charEl.className = 'char correct';
      }

      this.correctTyped++;
      this.currentCombo++;
      if (this.currentCombo > this.maxCombo) {
        this.maxCombo = this.currentCombo;
      }

      // Marcos de combo sonoros
      if (this.currentCombo === 15) sound.playStreakSound(1);
      else if (this.currentCombo === 30) sound.playStreakSound(2);
      else if (this.currentCombo === 50) sound.playStreakSound(3);

      this.currentIndex++;

      if (this.currentIndex < this.targetText.length) {
        const nextCharEl = document.getElementById(`char-${this.currentIndex}`);
        if (nextCharEl) {
          nextCharEl.className = 'char current';
        }
        this.updateTargetHighlight();
      } else {
        this.finishLesson();
      }
    } else {
      // ERRO
      sound.playErrorSound();

      const charEl = document.getElementById(`char-${this.currentIndex}`);
      if (charEl) {
        charEl.classList.add('wrong');
        setTimeout(() => charEl.classList.remove('wrong'), 250);
      }

      this.errorsCount++;
      this.currentCombo = 0;
      this.errorKeys[targetChar] = (this.errorKeys[targetChar] || 0) + 1;
    }

    this.updateHUD();
  }

  startTimer() {
    this.isRunning = true;
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      this.updateHUD();
    }, 500);
  }

  updateHUD() {
    const minutes = this.elapsedSeconds > 0 ? this.elapsedSeconds / 60 : 0.01;
    const words = this.correctTyped / 5;
    const wpm = Math.max(0, Math.round(words / minutes));

    const accuracy = this.totalTyped > 0 
      ? Math.max(0, Math.round(((this.totalTyped - this.errorsCount) / this.totalTyped) * 100))
      : 100;

    if (this.dom.hudWpm) this.dom.hudWpm.textContent = wpm;
    if (this.dom.hudAccuracy) this.dom.hudAccuracy.textContent = accuracy;
    if (this.dom.hudCombo) this.dom.hudCombo.textContent = this.currentCombo;

    if (this.dom.hudTime) {
      const mins = Math.floor(this.elapsedSeconds / 60);
      const secs = this.elapsedSeconds % 60;
      this.dom.hudTime.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  }

  finishLesson() {
    clearInterval(this.timerInterval);
    this.isRunning = false;

    const minutes = Math.max(0.1, this.elapsedSeconds / 60);
    const wpm = Math.round((this.correctTyped / 5) / minutes);
    const accuracy = Math.round(((this.totalTyped - this.errorsCount) / this.totalTyped) * 100);

    const stats = {
      wpm: wpm,
      accuracy: accuracy,
      errors: this.errorsCount,
      timeSeconds: this.elapsedSeconds,
      maxCombo: this.maxCombo
    };

    saveLessonResult(this.currentLesson.id, stats);
    sound.playVictorySound();

    this.showResultsModal(stats);
  }

  showResultsModal(stats) {
    if (!this.dom.modalResult) return;

    document.getElementById('res-wpm').textContent = stats.wpm;
    document.getElementById('res-accuracy').textContent = stats.accuracy + '%';
    document.getElementById('res-errors').textContent = stats.errors;
    document.getElementById('res-time').textContent = stats.timeSeconds + 's';
    document.getElementById('res-combo').textContent = stats.maxCombo;

    // Estrelas
    let stars = 1;
    if (stats.accuracy >= 92 && stats.wpm >= 15) stars = 2;
    if (stats.accuracy >= 97 && stats.wpm >= 25) stars = 3;

    const starIcons = document.querySelectorAll('.star-icon');
    starIcons.forEach((icon, idx) => {
      if (idx < stars) icon.classList.add('active');
      else icon.classList.remove('active');
    });

    this.dom.modalResult.classList.remove('hidden');
  }

  nextLesson() {
    this.closeModal('modal-result');
    this.loadLesson(this.currentLessonIndex + 1);
  }

  repeatLesson() {
    this.closeModal('modal-result');
    this.loadLesson(this.currentLessonIndex);
  }

  openLessonsModal() {
    if (!this.dom.modalLessons) return;
    const grid = document.getElementById('lessons-picker-grid');
    if (grid) {
      grid.innerHTML = '';
      const progress = getSavedProgress();

      LESSONS_DATABASE.forEach((lesson, idx) => {
        const item = document.createElement('div');
        item.className = `lesson-card-item ${idx === this.currentLessonIndex ? 'active' : ''}`;
        
        const cardProgress = progress[lesson.id];
        const starsText = cardProgress ? '⭐'.repeat(cardProgress.stars) : '☆☆☆';

        item.innerHTML = `
          <div class="lesson-card-header">
            <span class="lesson-num-badge">Lição #${lesson.id}</span>
            <span class="text-xs">${starsText}</span>
          </div>
          <div class="lesson-card-title">${lesson.title}</div>
          <div class="lesson-card-desc">${lesson.desc}</div>
        `;

        item.onclick = () => {
          this.loadLesson(idx);
          this.closeModal('modal-lessons');
        };

        grid.appendChild(item);
      });
    }

    this.dom.modalLessons.classList.remove('hidden');
  }

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }

  toggleSound() {
    const isMuted = sound.toggleMute();
    this.updateSoundToggleIcon();
  }

  updateSoundToggleIcon() {
    const btn = document.getElementById('btn-sound-toggle');
    if (btn) {
      btn.innerHTML = sound.isMuted() ? '🔇 <span>Mudo</span>' : '🔊 <span>Som</span>';
    }
  }

  bindEvents() {
    // Captura global de digitação
    window.addEventListener('keydown', (e) => {
      // Visual do teclado físico sendo pressionado
      const keyEl = document.getElementById(`key-${e.code}`);
      if (keyEl) keyEl.classList.add('pressed');

      // Se nenhum modal estiver aberto, processa a digitação
      const hasOpenModal = document.querySelector('.modal-overlay:not(.hidden)');
      if (!hasOpenModal) {
        this.handleKeystroke(e);
      }
    });

    window.addEventListener('keyup', (e) => {
      const keyEl = document.getElementById(`key-${e.code}`);
      if (keyEl) keyEl.classList.remove('pressed');
    });

    // Fechar modais ao clicar no fundo
    ['modal-result', 'modal-lessons'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          if (e.target === el) this.closeModal(id);
        });
      }
    });
  }
}

// Inicializa o jogo quando o DOM estiver carregado
let gameInstance = null;
function initTouchTypingGame() {
  if (!gameInstance) {
    gameInstance = new TouchTypingGame();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTouchTypingGame);
} else {
  initTouchTypingGame();
}
