/**
 * Gerenciador de Áudio com Web Audio API
 * Sintetizador de sons mecânicos e feedback tátil sem dependências externas
 * SODIPROM - CAMP Diadema | Mestre do Teclado Cego
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('sodiprom_sound_muted') === 'true';
    this.keyPitchOffset = 0;
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
    localStorage.setItem('sodiprom_sound_muted', this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  /**
   * Simula o clique mecânico de alta precisão (switch azul / marrom)
   */
  playKeyClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Ruído do clique inicial (transiente rápido)
      const bufferSize = this.ctx.sampleRate * 0.015;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(3200 + Math.random() * 600, t);
      noiseFilter.Q.setValueAtTime(3, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(t);

      // 2. Ressonância da carcaça do teclado (thud suave)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 180 + Math.random() * 40;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.04);

      oscGain.gain.setValueAtTime(0.12, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {
      // Ignora pequenos bloqueios de autoplay do navegador
    }
  }

  /**
   * Som de erro sutil (para não frustrar o aluno, mas sinalizar a tecla incorreta)
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
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.linearRampToValueAtTime(90, t + 0.12);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.12);
    } catch (e) {}
  }

  /**
   * Acorde de comemoração ao atingir marcas de combo (10, 25, 50 teclas sem errar)
   */
  playStreakSound(level = 1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const baseNotes = level >= 3 ? [523.25, 659.25, 783.99, 1046.50] : [440, 554.37, 659.25];

      baseNotes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);

        gain.gain.setValueAtTime(0, t);
        gain.gain.setValueAtTime(0.12, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.35);
      });
    } catch (e) {}
  }

  /**
   * Fanfarra de vitória ao concluir a lição
   */
  playVictorySound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      // Melodia triunfante em Dó Maior
      const notes = [
        { f: 523.25, d: 0.12, s: 0.0 },   // C5
        { f: 659.25, d: 0.12, s: 0.12 },  // E5
        { f: 783.99, d: 0.14, s: 0.24 },  // G5
        { f: 1046.50, d: 0.40, s: 0.38 }, // C6
      ];

      notes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, t + n.s);

        gain.gain.setValueAtTime(0.18, t + n.s);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.s + n.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + n.s);
        osc.stop(t + n.s + n.d);
      });
    } catch (e) {}
  }
}

// Instância global
const sound = new SoundEngine();
