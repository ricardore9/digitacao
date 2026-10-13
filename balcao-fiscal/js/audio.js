/**
 * Gerenciador de Áudio com Web Audio API
 * Sintetizador de efeitos sonoros de escritório, papel, teclado e carimbo sem arquivos externos
 * SODIPROM - CAMP Diadema | Balcão Fiscal: Desafio da Nota Fiscal
 */
class FiscalSoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('sodiprom_fiscal_sound_muted') === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('sodiprom_fiscal_sound_muted', this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  /**
   * Clique mecânico rápido para cada tecla numérica digitada
   */
  playKeyClick(isEnter = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Ruído do impacto plástico/mecânico
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.012);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isEnter ? 2400 : 3800 + Math.random() * 400, t);
      filter.Q.setValueAtTime(3.5, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(isEnter ? 0.25 : 0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);

      // 2. Ressonância suave do corpo da tecla
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isEnter ? 140 : 220 + Math.random() * 30, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.035);

      oscGain.gain.setValueAtTime(isEnter ? 0.2 : 0.09, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.035);
    } catch (e) {
      // Ignora autoplay restrictions
    }
  }

  /**
   * Som de folha de papel de nota fiscal deslizando suavemente no balcão
   */
  playPaperSlide() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const duration = 0.18;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink noise simulado para atrito suave de papel
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.25;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, t);
      filter.frequency.linearRampToValueAtTime(800, t + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
    } catch (e) {}
  }

  /**
   * Som satisfatório e potente de carimbo batendo na nota (THUMP!)
   */
  playStampSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Golpe pesado de impacto de borracha/madeira (sub bass)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

      oscGain.gain.setValueAtTime(0.45, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);

      // 2. Ruído do impacto seco do carimbo
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t);

      // 3. Sino alegre e sutil de confirmação de entrada (chime)
      setTimeout(() => {
        if (this.muted || !this.ctx) return;
        const t2 = this.ctx.currentTime;
        const bell = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        bell.type = 'triangle';
        bell.frequency.setValueAtTime(784, t2); // Sol (G5)
        bell.frequency.setValueAtTime(1046.5, t2 + 0.05); // Dó (C6)

        bellGain.gain.setValueAtTime(0.12, t2);
        bellGain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.2);

        bell.connect(bellGain);
        bellGain.connect(this.ctx.destination);
        bell.start(t2);
        bell.stop(t2 + 0.2);
      }, 50);

    } catch (e) {}
  }

  /**
   * Som de erro/rejeição sutil (sem frustrar, mas indicando digitação incorreta)
   */
  playErrorSound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.setValueAtTime(110, t + 0.08);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.18);
    } catch (e) {}
  }

  /**
   * Som de caixa registradora / moedas (Ka-ching!) para combos de notas sem errar
   */
  playComboChing(multiplier = 2) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const freqs = [1046.5, 1318.5, 1567.98, 2093.0]; // Arpejo C maior brilhante

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * (1 + (multiplier - 2) * 0.08), t + idx * 0.045);

        gain.gain.setValueAtTime(0.14, t + idx * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.045 + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + idx * 0.045);
        osc.stop(t + idx * 0.045 + 0.22);
      });
    } catch (e) {}
  }

  /**
   * Fanfarra ao concluir fase ou expediente
   */
  playVictoryFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [
        { f: 523.25, d: 0.12, w: 0 },    // C5
        { f: 659.25, d: 0.12, w: 0.12 }, // E5
        { f: 783.99, d: 0.14, w: 0.24 }, // G5
        { f: 1046.5, d: 0.35, w: 0.38 }  // C6
      ];

      const t = this.ctx.currentTime;
      notes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, t + n.w);

        gain.gain.setValueAtTime(0.2, t + n.w);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.w + n.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + n.w);
        osc.stop(t + n.w + n.d);
      });
    } catch (e) {}
  }
}

window.fiscalAudio = new FiscalSoundEngine();
