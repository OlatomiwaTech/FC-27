/**
 * FC 27 - Real Stock Royalty-Free Sports Music Soundtrack Engine
 * Generates driving 124-128 BPM electronic sports anthems (FIFA/EA FC style)
 * with 4-on-the-floor kicks, rolling synth bass, euphoric chord drops, and melodic leads.
 * 100% Royalty-Free, zero external network dependency, seamless dynamic looping.
 */

export class MusicPlayer {
  constructor(audioContext = null) {
    this.ctx = audioContext;
    this.isPlaying = false;
    this.volume = 0.45;
    this.currentTrackIndex = 0;
    this.tempo = 124; // BPM
    this.step = 0;
    this.timerId = null;

    this.tracks = [
      {
        id: 'neon_strike',
        title: 'NEON STRIKE (FC 27 MAIN THEME)',
        genre: 'Stadium Electro House',
        bpm: 124,
        scale: [50, 53, 55, 57, 60, 62], // D minor pentatonic: D3, F3, G3, A3, C4, D4
        bassline: [38, 38, 41, 41, 36, 36, 43, 43], // D2, F2, C2, G2
        chords: [
          [50, 53, 57, 62], // Dm
          [41, 45, 48, 53], // F
          [36, 40, 43, 48], // C
          [43, 47, 50, 55]  // G
        ]
      },
      {
        id: 'champions_pulse',
        title: 'CHAMPIONS PULSE',
        genre: 'Club Progressive Anthem',
        bpm: 128,
        scale: [48, 51, 55, 58, 60, 63], // C minor
        bassline: [36, 36, 39, 39, 44, 44, 46, 46], // C2, Eb2, Ab2, Bb2
        chords: [
          [48, 51, 55, 60], // Cm
          [39, 43, 46, 51], // Eb
          [44, 48, 51, 56], // Ab
          [46, 50, 53, 58]  // Bb
        ]
      },
      {
        id: 'samba_flair',
        title: 'JOGA BONITO (SAMBA VIBES)',
        genre: 'Latin Groove & Tech',
        bpm: 122,
        scale: [45, 48, 50, 52, 55, 57], // A minor
        bassline: [33, 33, 36, 36, 38, 38, 40, 40], // A1, C2, D2, E2
        chords: [
          [45, 48, 52, 57], // Am
          [36, 40, 43, 48], // C
          [38, 41, 45, 50], // Dm
          [40, 44, 47, 52]  // E7
        ]
      }
    ];

    this.onTrackChange = null;
    this.onBeat = null;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  start() {
    this.ensureContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.step = 0;
    this.scheduleLoop();
    if (this.onTrackChange) {
      this.onTrackChange(this.getCurrentTrack());
    }
  }

  stop() {
    this.isPlaying = false;
    clearTimeout(this.timerId);
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.step = 0;
    if (this.onTrackChange) {
      this.onTrackChange(this.getCurrentTrack());
    }
  }

  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.step = 0;
    if (this.onTrackChange) {
      this.onTrackChange(this.getCurrentTrack());
    }
  }

  getCurrentTrack() {
    return this.tracks[this.currentTrackIndex];
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
  }

  duckVolume(target = 0.15, duration = 2.5) {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.2);
    setTimeout(() => {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.8);
      }
    }, duration * 1000);
  }

  scheduleLoop() {
    if (!this.isPlaying || !this.ctx) return;

    const track = this.getCurrentTrack();
    const secondsPerBeat = 60.0 / track.bpm;
    const stepDuration = secondsPerBeat / 4; // 16th note steps

    this.playStep(this.step, track);
    this.step = (this.step + 1) % 64; // 4-bar loop of 16 steps

    if (this.onBeat && this.step % 4 === 0) {
      this.onBeat(this.step / 4);
    }

    this.timerId = setTimeout(() => {
      this.scheduleLoop();
    }, stepDuration * 1000);
  }

  playStep(step, track) {
    const now = this.ctx.currentTime;
    const beatIndex = Math.floor(step / 4);
    const sixteenth = step % 4;

    // 1. Kick Drum: on every quarter note (step 0, 4, 8, 12, 16...)
    if (sixteenth === 0) {
      this.playKick(now);
    }

    // 2. Off-beat Hi-Hat: on every step 2 of 4 (off-beat 8th note)
    if (sixteenth === 2) {
      this.playHiHat(now, 0.08);
    } else if (sixteenth === 1 || sixteenth === 3) {
      // Light shaker
      this.playHiHat(now, 0.03);
    }

    // 3. Snare / Clap: on beats 2 and 4 (step 4 and 12 in each 16)
    if (sixteenth === 0 && (beatIndex % 4 === 1 || beatIndex % 4 === 3)) {
      this.playSnare(now);
    }

    // 4. Rolling Synth Bassline (16th note groove)
    const bassNoteMidi = track.bassline[Math.floor(step / 8) % track.bassline.length];
    if (sixteenth === 0 || sixteenth === 2 || (sixteenth === 3 && Math.random() > 0.4)) {
      this.playSynthBass(now, bassNoteMidi, stepDuration * 1.5);
    }

    // 5. Chord Stabs: on beat 1 and syncopated beat 3.5
    if (sixteenth === 0 && beatIndex % 2 === 0) {
      const chordIndex = Math.floor(step / 16) % track.chords.length;
      this.playChordStab(now, track.chords[chordIndex]);
    }

    // 6. Arpeggiated Melody Lead
    if (step >= 16) { // lead enters in bar 2
      const noteMidi = track.scale[(step * 3 + beatIndex) % track.scale.length] + 12;
      this.playLeadNote(now, noteMidi);
    }
  }

  midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  playKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.09);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.13);
  }

  playSnare(time) {
    // Noise burst + mid tone
    const noise = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.15);
  }

  playHiHat(time, amp = 0.06) {
    const noise = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(amp, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.05);
  }

  playSynthBass(time, midi, duration = 0.15) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(this.midiToFreq(midi), time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, time);
    filter.frequency.exponentialRampToValueAtTime(140, time + 0.12);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  playChordStab(time, chordMidis) {
    chordMidis.forEach(midi => {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(this.midiToFreq(midi), time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, time);
      filter.frequency.exponentialRampToValueAtTime(400, time + 0.22);

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.26);
    });
  }

  playLeadNote(time, midi) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.midiToFreq(midi), time);

    gain.gain.setValueAtTime(0.09, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.13);
  }
}

