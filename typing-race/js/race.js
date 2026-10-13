/**
 * Lógica Principal da Corrida de Digitação (Typing Race)
 * Suporte a Multiplayer 1v1 em Tempo Real, Desafio vs Bot IA e Treino Solo
 * SODIPROM - CAMP Diadema
 */

class TypingRaceEngine {
  constructor() {
    this.mode = 'bot'; // 'bot', 'multiplayer', 'solo'
    this.botDifficulty = 'medium'; // 'easy' (30 wpm), 'medium' (50 wpm), 'hard' (75 wpm)
    this.state = 'LOBBY'; // 'LOBBY', 'WAITING', 'COUNTDOWN', 'RACING', 'FINISHED'

    // Dados do Jogador
    this.playerName = localStorage.getItem('sodiprom_pilot_name') || "Piloto Veloz";
    this.carColor = "red";
    this.targetText = "";
    this.textMetadata = null;
    this.currentIndex = 0;
    this.errorCount = 0;
    this.totalKeystrokes = 0;
    this.correctChars = 0;
    this.startTime = null;
    this.finishTime = null;
    this.wpm = 0;
    this.accuracy = 100;
    this.progressPct = 0;

    // Dados do Oponente (Outro jogador ou Bot)
    this.opponentName = "Robô Turbo";
    this.opponentCarColor = "blue";
    this.opponentProgressPct = 0;
    this.opponentWpm = 0;
    this.opponentFinished = false;
    this.opponentFinishTime = null;
    this.opponentStats = null;

    // Intervalos e timers
    this.botInterval = null;
    this.statsInterval = null;
    this.countdownTimer = null;

    // Referências do DOM
    this.dom = {
      carPlayer: document.getElementById('carPlayer'),
      carOpponent: document.getElementById('carOpponent'),
      labelPlayerName: document.getElementById('labelPlayerName'),
      labelOpponentName: document.getElementById('labelOpponentName'),
      tagPlayerWpm: document.getElementById('tagPlayerWpm'),
      tagOpponentWpm: document.getElementById('tagOpponentWpm'),
      liveWpmDisplay: document.getElementById('liveWpmDisplay'),
      liveAccDisplay: document.getElementById('liveAccDisplay'),
      liveTimeDisplay: document.getElementById('liveTimeDisplay'),
      positionBadge: document.getElementById('positionBadge'),
      textContainer: document.getElementById('raceTextContainer'),
      textTitle: document.getElementById('raceTextTitle'),
      textProgressChars: document.getElementById('textProgressChars'),
      hiddenInput: document.getElementById('hiddenRaceInput'),
      countdownOverlay: document.getElementById('countdownOverlay'),
      countdownBigText: document.getElementById('countdownBigText'),
      lightBulbs: document.querySelectorAll('.light-bulb'),
      modalMode: document.getElementById('modalModeSelect'),
      modalMultiplayerLobby: document.getElementById('modalMultiplayerLobby'),
      modalPodium: document.getElementById('modalPodium'),
      roomCodeDisplay: document.getElementById('roomCodeDisplay'),
      inputJoinCode: document.getElementById('inputJoinCode'),
      btnSoundToggle: document.getElementById('btnSoundToggle')
    };

    this.initEventListeners();
    this.initMultiplayerListeners();
    this.updateSoundButtonUI();
  }

  initEventListeners() {
    // Foco e digitação contínua
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));

    const textCard = document.getElementById('raceCardArea');
    if (textCard) {
      textCard.addEventListener('click', () => {
        if (this.dom.hiddenInput) this.dom.hiddenInput.focus();
      });
    }

    if (this.dom.btnSoundToggle) {
      this.dom.btnSoundToggle.addEventListener('click', () => {
        const isMuted = window.raceAudio.toggleMute();
        this.updateSoundButtonUI();
      });
    }
  }

  initMultiplayerListeners() {
    // Evento de conexão do oponente
    window.raceMultiplayer.on('PLAYER_CONNECTED', (data) => {
      this.opponentName = data.opponentName;
      this.opponentCarColor = data.opponentCarColor;
      this.dom.labelOpponentName.textContent = this.opponentName;

      // Se for host, seleciona um texto e inicia a largada para ambos
      if (data.isHost) {
        const text = RaceTextManager.getRandomText('classic');
        this.textMetadata = text;
        this.targetText = text.text;
        
        setTimeout(() => {
          window.raceMultiplayer.broadcastStartRace(text.id, 4000);
          this.startCountdown();
        }, 1200);
      }
    });

    // Evento de largada sincronizada enviada pelo host
    window.raceMultiplayer.on('START_RACE', (data) => {
      const text = RaceTextManager.getTextById(data.textId);
      this.textMetadata = text;
      this.targetText = text.text;
      this.startCountdown();
    });

    // Progresso em tempo real do oponente
    window.raceMultiplayer.on('OPPONENT_PROGRESS', (data) => {
      this.opponentProgressPct = data.progressPct;
      this.opponentWpm = data.wpm;
      this.updateOpponentCarPosition();
    });

    // Oponente cruzou a linha de chegada
    window.raceMultiplayer.on('OPPONENT_FINISHED', (data) => {
      this.opponentFinished = true;
      this.opponentFinishTime = data.timeSecs;
      this.opponentStats = data;
      this.opponentProgressPct = 100;
      this.updateOpponentCarPosition();
      this.checkRaceCompletion();
    });

    // Revanche solicitada
    window.raceMultiplayer.on('REMATCH_REQUESTED', () => {
      if (window.raceMultiplayer.isHost) {
        const text = RaceTextManager.getRandomText('classic');
        window.raceMultiplayer.broadcastStartRace(text.id, 4000);
        this.startCountdown();
      }
    });
  }

  updateSoundButtonUI() {
    if (!this.dom.btnSoundToggle) return;
    const isMuted = window.raceAudio.isMuted();
    this.dom.btnSoundToggle.innerHTML = isMuted 
      ? `<span>🔇</span> <span>Som: Desligado</span>`
      : `<span>🔊</span> <span>Som: Ligado</span>`;
  }

  /**
   * Abre o seletor de modos
   */
  openModeSelection() {
    this.closeAllModals();
    this.state = 'LOBBY';
    this.dom.modalMode.classList.add('open');
  }

  /**
   * Inicia modo contra Robô IA
   */
  startBotRace(difficulty = 'medium') {
    this.mode = 'bot';
    this.botDifficulty = difficulty;
    this.opponentName = difficulty === 'easy' ? "Robô Iniciante" : (difficulty === 'medium' ? "Robô Turbo" : "Mestre dos Circuitos");
    this.dom.labelOpponentName.textContent = this.opponentName;
    this.closeAllModals();

    const text = RaceTextManager.getRandomText('classic');
    this.textMetadata = text;
    this.targetText = text.text;

    this.startCountdown();
  }

  /**
   * Inicia modo treino solo
   */
  startSoloRace() {
    this.mode = 'solo';
    this.dom.labelOpponentName.textContent = "Carro Fantasma";
    this.closeAllModals();

    const text = RaceTextManager.getRandomText('classic');
    this.textMetadata = text;
    this.targetText = text.text;

    this.startCountdown();
  }

  /**
   * Abre tela de criar/entrar em sala multiplayer
   */
  openMultiplayerLobby() {
    this.closeAllModals();
    this.dom.modalMultiplayerLobby.classList.add('open');
    document.getElementById('multiplayerCreationView').style.display = 'block';
    document.getElementById('multiplayerWaitingView').style.display = 'none';
  }

  /**
   * Cria uma sala como anfitrião (Host)
   */
  createMultiplayerRoom() {
    this.mode = 'multiplayer';
    const roomCode = window.raceMultiplayer.createRoom(this.playerName, this.carColor);
    
    document.getElementById('multiplayerCreationView').style.display = 'none';
    document.getElementById('multiplayerWaitingView').style.display = 'block';
    this.dom.roomCodeDisplay.textContent = roomCode;
  }

  /**
   * Entra em uma sala existente
   */
  joinMultiplayerRoom() {
    const code = this.dom.inputJoinCode.value.trim().toUpperCase();
    if (!code) {
      alert("Por favor, digite o código de 4 dígitos da sala!");
      return;
    }

    this.mode = 'multiplayer';
    window.raceMultiplayer.joinRoom(code, this.playerName, this.carColor);

    document.getElementById('multiplayerCreationView').style.display = 'none';
    document.getElementById('multiplayerWaitingView').style.display = 'block';
    this.dom.roomCodeDisplay.textContent = code;
    document.getElementById('waitingNoticeText').textContent = "Conectando ao oponente...";
  }

  /**
   * Contagem regressiva no semáforo 3D (3, 2, 1, LARGADA!)
   */
  startCountdown() {
    this.closeAllModals();
    this.resetRaceState();
    this.renderText();

    this.state = 'COUNTDOWN';
    this.dom.countdownOverlay.classList.add('active');

    let step = 3;
    this.updateLights(step);
    window.raceAudio.playCountdownBeep(false);
    this.dom.countdownBigText.textContent = step;

    this.countdownTimer = setInterval(() => {
      step--;
      if (step > 0) {
        this.updateLights(step);
        window.raceAudio.playCountdownBeep(false);
        this.dom.countdownBigText.textContent = step;
      } else if (step === 0) {
        // LARGADA!
        this.updateLights(0);
        window.raceAudio.playCountdownBeep(true);
        this.dom.countdownBigText.textContent = "LARGADA! 🏁";
        this.dom.countdownBigText.style.color = "#10b981";

        setTimeout(() => {
          this.dom.countdownOverlay.classList.remove('active');
          this.beginRacing();
        }, 600);

        clearInterval(this.countdownTimer);
      }
    }, 1000);
  }

  updateLights(step) {
    this.dom.lightBulbs.forEach(b => b.classList.remove('on'));
    if (step === 3) {
      this.dom.lightBulbs[0].classList.add('on');
    } else if (step === 2) {
      this.dom.lightBulbs[0].classList.add('on');
      this.dom.lightBulbs[1].classList.add('on');
    } else if (step === 1) {
      this.dom.lightBulbs[0].classList.add('on');
      this.dom.lightBulbs[1].classList.add('on');
      this.dom.lightBulbs[2].classList.add('on');
    } else if (step === 0) {
      this.dom.lightBulbs[3].classList.add('on');
      this.dom.lightBulbs[4].classList.add('on');
    }
  }

  beginRacing() {
    this.state = 'RACING';
    this.startTime = Date.now();
    if (this.dom.hiddenInput) this.dom.hiddenInput.focus();

    // Inicia cronômetro do HUD
    this.statsInterval = setInterval(() => this.updateLiveHUD(), 100);

    // Se estiver jogando contra Bot IA, inicia o piloto automático do bot
    if (this.mode === 'bot') {
      this.startBotSimulation();
    }
  }

  resetRaceState() {
    this.currentIndex = 0;
    this.errorCount = 0;
    this.totalKeystrokes = 0;
    this.correctChars = 0;
    this.wpm = 0;
    this.accuracy = 100;
    this.progressPct = 0;
    this.finishTime = null;

    this.opponentProgressPct = 0;
    this.opponentWpm = 0;
    this.opponentFinished = false;
    this.opponentFinishTime = null;
    this.opponentStats = null;

    this.stopBotSimulation();
    if (this.statsInterval) clearInterval(this.statsInterval);

    this.dom.carPlayer.style.left = "2%";
    this.dom.carOpponent.style.left = "2%";
    this.dom.carPlayer.classList.remove('nitro-active');
    this.dom.carOpponent.classList.remove('nitro-active');

    this.dom.tagPlayerWpm.textContent = "0 WPM";
    this.dom.tagOpponentWpm.textContent = "0 WPM";
    this.dom.positionBadge.textContent = "1º LUGAR";
  }

  renderText() {
    this.dom.textTitle.textContent = `🏁 ${this.textMetadata.title}`;
    this.dom.textProgressChars.textContent = `0 / ${this.targetText.length}`;

    let html = "";
    for (let i = 0; i < this.targetText.length; i++) {
      const char = this.targetText[i];
      const charDisplay = char === ' ' ? '&nbsp;' : char;

      if (i < this.currentIndex) {
        html += `<span class="char-correct">${charDisplay}</span>`;
      } else if (i === this.currentIndex) {
        html += `<span class="char-current">${charDisplay}</span>`;
      } else {
        html += `<span class="char-pending">${charDisplay}</span>`;
      }
    }

    this.dom.textContainer.innerHTML = html;
  }

  handleKeyDown(e) {
    if (this.state !== 'RACING') return;

    // Ignora teclas funcionais (Shift, Alt, Tab, etc.)
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'CapsLock' || e.key === 'Meta') {
      return;
    }

    // Previne rolagem de barra de espaço
    if (e.key === ' ') {
      e.preventDefault();
    }

    if (e.key === 'Backspace') {
      // Opcional: permite corrigir o último caractere se desejar, ou avanço estrito
      return;
    }

    if (e.key.length === 1) {
      this.processCharInput(e.key);
    }
  }

  processCharInput(typedChar) {
    const expectedChar = this.targetText[this.currentIndex];
    this.totalKeystrokes++;

    if (typedChar === expectedChar) {
      // ACERTO!
      this.currentIndex++;
      this.correctChars++;
      window.raceAudio.playKeyKeystroke();

      // Som especial ao terminar uma palavra (espaço ou pontuação)
      if (expectedChar === ' ' || this.currentIndex === this.targetText.length) {
        window.raceAudio.playWordComplete();
      }

      // Efeito de nitro se estiver digitando muito rápido (WPM > 50)
      if (this.wpm > 50) {
        this.dom.carPlayer.classList.add('nitro-active');
        if (Math.random() > 0.85) window.raceAudio.playNitroBoost();
      } else {
        this.dom.carPlayer.classList.remove('nitro-active');
      }

      this.progressPct = (this.currentIndex / this.targetText.length) * 100;
      this.updatePlayerCarPosition();
      this.renderText();

      // Transmite progresso via multiplayer
      if (this.mode === 'multiplayer') {
        window.raceMultiplayer.sendProgress(this.progressPct, this.wpm);
      }

      // Chegada na linha final!
      if (this.currentIndex >= this.targetText.length) {
        this.finishPlayerRace();
      }
    } else {
      // ERRO!
      this.errorCount++;
      window.raceAudio.playBrakeError();
      this.dom.carPlayer.classList.remove('nitro-active');

      // Feedback visual momentâneo de erro no caractere atual
      const currentCharEl = this.dom.textContainer.querySelector('.char-current');
      if (currentCharEl) {
        currentCharEl.classList.add('char-wrong');
        setTimeout(() => currentCharEl.classList.remove('char-wrong'), 200);
      }
    }
  }

  updatePlayerCarPosition() {
    // A pista vai de 2% (largada) até 92% (linha de chegada)
    const trackLeft = 2 + (this.progressPct / 100) * 88;
    this.dom.carPlayer.style.left = `${trackLeft}%`;
    this.dom.tagPlayerWpm.textContent = `${this.wpm} WPM`;
    this.dom.textProgressChars.textContent = `${this.currentIndex} / ${this.targetText.length}`;

    // Atualiza indicativo de 1º / 2º lugar
    if (this.progressPct >= this.opponentProgressPct) {
      this.dom.positionBadge.textContent = "1º LUGAR 🥇";
      this.dom.positionBadge.style.background = "linear-gradient(135deg, #10b981, #059669)";
    } else {
      this.dom.positionBadge.textContent = "2º LUGAR 🥈";
      this.dom.positionBadge.style.background = "linear-gradient(135deg, #f59e0b, #d97706)";
    }
  }

  updateOpponentCarPosition() {
    const trackLeft = 2 + (this.opponentProgressPct / 100) * 88;
    this.dom.carOpponent.style.left = `${trackLeft}%`;
    this.dom.tagOpponentWpm.textContent = `${this.opponentWpm} WPM`;

    if (this.opponentWpm > 55) {
      this.dom.carOpponent.classList.add('nitro-active');
    } else {
      this.dom.carOpponent.classList.remove('nitro-active');
    }
  }

  updateLiveHUD() {
    if (!this.startTime) return;
    const elapsedSecs = Math.max(1, (Date.now() - this.startTime) / 1000);
    const elapsedMins = elapsedSecs / 60;

    // Cálculo oficial de WPM = (caracteres certos / 5) / minutos
    this.wpm = Math.round((this.correctChars / 5) / elapsedMins);
    this.accuracy = this.totalKeystrokes > 0 ? Math.round((this.correctChars / this.totalKeystrokes) * 100) : 100;

    this.dom.liveWpmDisplay.textContent = this.wpm;
    this.dom.liveAccDisplay.textContent = `${this.accuracy}%`;

    const mins = Math.floor(elapsedSecs / 60);
    const secs = Math.floor(elapsedSecs % 60);
    this.dom.liveTimeDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  finishPlayerRace() {
    this.state = 'FINISHED';
    this.finishTime = (Date.now() - this.startTime) / 1000;
    this.dom.carPlayer.style.left = "92%"; // Cruzou a linha!
    this.dom.carPlayer.classList.remove('nitro-active');

    const isWinner = !this.opponentFinished;
    window.raceAudio.playFinishCheer(isWinner);

    if (this.mode === 'multiplayer') {
      window.raceMultiplayer.sendFinish(this.finishTime, this.wpm, this.accuracy);
    }

    setTimeout(() => {
      this.showVictoryPodium();
    }, 1200);
  }

  /**
   * Simulação do Bot IA
   */
  startBotSimulation() {
    // Alvo de velocidade do Bot
    let targetWpm = 45;
    if (this.botDifficulty === 'easy') targetWpm = 28;
    if (this.botDifficulty === 'hard') targetWpm = 75;

    // Conversão de WPM para caracteres por segundo: 1 WPM ~= 5 chars/min = 5/60 chars/s
    const charsPerSec = (targetWpm * 5) / 60;
    const intervalMs = 150;

    this.botInterval = setInterval(() => {
      if (this.state !== 'RACING') return;

      // Variação humana de ritmo
      const fluctuation = (Math.random() * 0.4) + 0.8;
      const charsInStep = (charsPerSec * (intervalMs / 1000)) * fluctuation;
      const stepPct = (charsInStep / this.targetText.length) * 100;

      this.opponentProgressPct = Math.min(100, this.opponentProgressPct + stepPct);
      this.opponentWpm = Math.round(targetWpm * fluctuation);

      this.updateOpponentCarPosition();

      if (this.opponentProgressPct >= 100 && !this.opponentFinished) {
        this.opponentFinished = true;
        this.opponentFinishTime = (Date.now() - this.startTime) / 1000;
        this.opponentStats = {
          wpm: this.opponentWpm,
          accuracy: 98,
          timeSecs: this.opponentFinishTime
        };
        clearInterval(this.botInterval);
        this.checkRaceCompletion();
      }
    }, intervalMs);
  }

  stopBotSimulation() {
    if (this.botInterval) {
      clearInterval(this.botInterval);
      this.botInterval = null;
    }
  }

  checkRaceCompletion() {
    if (this.state === 'FINISHED') {
      this.showVictoryPodium();
    }
  }

  showVictoryPodium() {
    this.closeAllModals();

    const isPlayerWinner = (!this.opponentFinishTime) || (this.finishTime <= this.opponentFinishTime);

    document.getElementById('podiumTitle').textContent = isPlayerWinner ? "🏁 VITÓRIA! CAMPEÃO DA PISTA!" : "🏁 FIM DA CORRIDA!";
    document.getElementById('podiumSubTitle').textContent = isPlayerWinner ? "Você cruzou a linha de chegada em 1º Lugar!" : "O oponente cruzou a linha em 1º Lugar!";

    // Card do Jogador
    document.getElementById('podiumPlayerName').textContent = this.playerName;
    document.getElementById('podiumPlayerWpm').textContent = `${this.wpm} WPM`;
    document.getElementById('podiumPlayerAcc').textContent = `Precisão: ${this.accuracy}% • ${this.finishTime ? this.finishTime.toFixed(1) : 0}s`;
    document.getElementById('podiumPlayerTrophy').textContent = isPlayerWinner ? "🏆 1º LUGAR" : "🥈 2º LUGAR";

    const cardP = document.getElementById('podiumCardPlayer');
    if (cardP) {
      cardP.classList.toggle('winner', isPlayerWinner);
    }

    // Card do Oponente
    const oppWpm = this.opponentStats ? this.opponentStats.wpm : this.opponentWpm;
    const oppAcc = this.opponentStats ? this.opponentStats.accuracy : 98;
    const oppTime = this.opponentFinishTime ? this.opponentFinishTime.toFixed(1) : (this.finishTime ? (this.finishTime + 2).toFixed(1) : 0);

    document.getElementById('podiumOpponentName').textContent = this.opponentName;
    document.getElementById('podiumOpponentWpm').textContent = `${oppWpm} WPM`;
    document.getElementById('podiumOpponentAcc').textContent = `Precisão: ${oppAcc}% • ${oppTime}s`;
    document.getElementById('podiumOpponentTrophy').textContent = !isPlayerWinner ? "🏆 1º LUGAR" : "🥈 2º LUGAR";

    const cardO = document.getElementById('podiumCardOpponent');
    if (cardO) {
      cardO.classList.toggle('winner', !isPlayerWinner);
    }

    this.dom.modalPodium.classList.add('open');
  }

  requestRematch() {
    if (this.mode === 'multiplayer') {
      window.raceMultiplayer.sendRematch();
      this.closeAllModals();
      document.getElementById('waitingNoticeText').textContent = "Aguardando oponente aceitar revanche...";
      this.dom.modalMultiplayerLobby.classList.add('open');
      document.getElementById('multiplayerCreationView').style.display = 'none';
      document.getElementById('multiplayerWaitingView').style.display = 'block';
    } else {
      // Revanche vs Bot ou Solo imediata
      this.closeAllModals();
      const text = RaceTextManager.getRandomText('classic');
      this.textMetadata = text;
      this.targetText = text.text;
      this.startCountdown();
    }
  }

  closeAllModals() {
    document.querySelectorAll('.race-modal-overlay').forEach(m => m.classList.remove('open'));
  }
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
  window.raceEngine = new TypingRaceEngine();
  window.raceEngine.openModeSelection();
});
