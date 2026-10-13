/**
 * Motor de Áudio para o Jogo de Corrida (Typing Race)
 * Sintetizador de efeitos automotivos, semáforo, motor e nitro via Web Audio API nativa
 * SODIPROM - CAMP Diadema
 */

class RaceSoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('sodiprom_race_sound_muted') === 'true';
    this.engineOsc = null;
    this.engineGain = null;
    this.isEngineRunning = false;
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
    localStorage.setItem('sodiprom_race_sound_muted', this.muted);
    if (this.muted) {
      this.stopEngine();
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  /**
   * Bipe do semáforo de largada (3, 2, 1... e LARGADA!)
   */
  playCountdownBeep(isFinal = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isFinal ? 'triangle' : 'sine';
      // Bipes baixos para 3, 2, 1 (440Hz) e agudo triunfante para LARGADA (880Hz -> 1046Hz)
      if (isFinal) {
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(1046.5, t + 0.15);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.stop(t + 0.6);
      } else {
        osc.frequency.setValueAtTime(440, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.stop(t + 0.25);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
    } catch (e) {}
  }

  /**
   * Efeito de clique seco/engrenagem a cada caractere digitado
   */
  playKeyKeystroke() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320 + Math.random() * 80, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.02);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.02);
    } catch (e) {}
  }

  /**
   * Efeito de troca de marcha / palavra completada com sucesso
   */
  playWordComplete() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, t); // D5
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.08); // A5

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    } catch (e) {}
  }

  /**
   * Pneu cantando / Efeito de turbo (Nitro) em combos rápidos de digitação
   */
  playNitroBoost() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;

      // Ruído branco filtrado para efeito de vento/turbo cortando o ar
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.frequency.linearRampToValueAtTime(2800, t + 0.25);
      filter.Q.setValueAtTime(4, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
    } catch (e) {}
  }

  /**
   * Freada / Engasgo do motor quando o jogador erra uma tecla
   */
  playBrakeError() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.linearRampToValueAtTime(90, t + 0.15);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }

  /**
   * Buzina comemorativa e fanfarra na linha de chegada
   */
  playFinishCheer(isWinner = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;

      if (isWinner) {
        // Melodia de vitória automotiva
        const notes = [
          { f: 523.25, d: 0.12, time: 0 },    // C5
          { f: 659.25, d: 0.12, time: 0.14 }, // E5
          { f: 783.99, d: 0.16, time: 0.28 }, // G5
          { f: 1046.5, d: 0.45, time: 0.45 }  // C6
        ];

        notes.forEach(n => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.f, t + n.time);

          gain.gain.setValueAtTime(0.28, t + n.time);
          gain.gain.exponentialRampToValueAtTime(0.001, t + n.time + n.d);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t + n.time);
          osc.stop(t + n.time + n.d);
        });
      } else {
        // Finalização honrosa
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.linearRampToValueAtTime(392, t + 0.3);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      }
    } catch (e) {}
  }

  stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch (e) {}
      this.engineOsc = null;
    }
    this.isEngineRunning = false;
  }
}

window.raceAudio = new RaceSoundEngine();
