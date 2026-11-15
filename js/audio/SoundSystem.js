/**
 * FC 27 - Procedural Sound Engine (Web Audio API)
 * Generates all crowd effects, whistles, ball strikes, goal horns and UI audio in real time.
 */

export class SoundSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.8;
    this.crowdNode = null;
    this.crowdGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initialized = true;
      this.setupAmbience();
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  ensureContext() {
    if (!this.initialized) {
      this.init();
    } else if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setupAmbience() {
    if (!this.ctx) return;
    try {
      // Procedural Crowd Ambience using pink/filtered noise buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      this.crowdSource = this.ctx.createBufferSource();
      this.crowdSource.buffer = noiseBuffer;
      this.crowdSource.loop = true;

      // Bandpass filter to make it sound like human crowd hum
      this.crowdFilter = this.ctx.createBiquadFilter();
      this.crowdFilter.type = 'bandpass';
      this.crowdFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
      this.crowdFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      this.crowdGain = this.ctx.createGain();
      this.crowdGain.gain.setValueAtTime(0.12 * this.volume, this.ctx.currentTime);

      this.crowdSource.connect(this.crowdFilter);
      this.crowdFilter.connect(this.crowdGain);
      this.crowdGain.connect(this.ctx.destination);
      this.crowdSource.start();
    } catch (err) {
      console.warn('Could not start crowd ambience:', err);
    }
  }

  setCrowdIntensity(level) { // level from 0.0 to 1.0
    if (!this.crowdGain || !this.ctx || !this.enabled) return;
    const target = (0.08 + Math.min(1, Math.max(0, level)) * 0.22) * this.volume;
    this.crowdGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.3);
    if (this.crowdFilter) {
      this.crowdFilter.frequency.linearRampToValueAtTime(450 + level * 350, this.ctx.currentTime + 0.3);
    }
  }

  playKick(power = 1.0) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Low punchy sine wave
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + power * 40, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.09);

      const amp = Math.min(0.4, 0.15 + power * 0.2) * this.volume;
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      // Add brief click/strike transient
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      click.type = 'sine';
      click.frequency.setValueAtTime(600, now);
      click.frequency.exponentialRampToValueAtTime(90, now + 0.02);
      clickGain.gain.setValueAtTime(0.1 * power * this.volume, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      click.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      click.start(now);
      click.stop(now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch {}
  }

  playWhistle(type = 'short') {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const count = type === 'triple' ? 3 : type === 'double' ? 2 : 1;

      for (let i = 0; i < count; i++) {
        const start = now + i * (type === 'triple' ? 0.28 : 0.22);
        const duration = (i === count - 1 && type === 'triple') ? 0.45 : 0.15;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const mainGain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(2850, start);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(3240, start);

        // Flutter vibrato
        lfo.type = 'triangle';
        lfo.frequency.setValueAtTime(36, start);
        lfoGain.gain.setValueAtTime(140, start);
        lfo.connect(osc1.frequency);
        lfo.connect(osc2.frequency);

        mainGain.gain.setValueAtTime(0.001, start);
        mainGain.gain.linearRampToValueAtTime(0.18 * this.volume, start + 0.02);
        mainGain.gain.setValueAtTime(0.18 * this.volume, start + duration - 0.03);
        mainGain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc1.connect(mainGain);
        osc2.connect(mainGain);
        mainGain.connect(this.ctx.destination);

        lfo.start(start);
        osc1.start(start);
        osc2.start(start);
        lfo.stop(start + duration);
        osc1.stop(start + duration);
        osc2.stop(start + duration);
      }
    } catch {}
  }

  playGoalCheer() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // 1. Stadium Air Horn
      [220, 277.18, 329.63].forEach(freq => {
        const horn = this.ctx.createOscillator();
        const hornGain = this.ctx.createGain();
        horn.type = 'sawtooth';
        horn.frequency.setValueAtTime(freq, now);
        hornGain.gain.setValueAtTime(0.15 * this.volume, now);
        hornGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, now);

        horn.connect(filter);
        filter.connect(hornGain);
        hornGain.connect(this.ctx.destination);

        horn.start(now);
        horn.stop(now + 1.3);
      });

      // 2. Huge crowd roar surge
      this.setCrowdIntensity(1.0);
      setTimeout(() => this.setCrowdIntensity(0.3), 3500);

      // 3. Goal whistle
      this.playWhistle('double');
    } catch {}
  }

  playPostHit() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [840, 1680].forEach(freq => {
        const ping = this.ctx.createOscillator();
        const pingGain = this.ctx.createGain();
        ping.type = 'sine';
        ping.frequency.setValueAtTime(freq, now);
        pingGain.gain.setValueAtTime(0.25 * this.volume, now);
        pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        ping.connect(pingGain);
        pingGain.connect(this.ctx.destination);
        ping.start(now);
        ping.stop(now + 0.4);
      });
    } catch {}
  }

  playNetRustle() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.4, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.12;
      noise.buffer = buf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, now);
      filter.Q.setValueAtTime(2.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.4);
    } catch {}
  }

  playTackle() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.25, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
      noise.buffer = buf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.25);
    } catch {}
  }

  playUIClick() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
      gain.gain.setValueAtTime(0.08 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  playUISelect() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.07);
      gain.gain.setValueAtTime(0.12 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }
}
