/**
 * FC 27 - High-Energy Stadium Soundtrack Engine (FIFA/EA FC Style)
 * Produces adrenaline-pumping 128 BPM electro-rock sports anthems
 * with crunchy bass guitar riffs, 4-on-the-floor kick punch, brass synth hooks,
 * stadium clap grooves, and crowd choir chants.
 */

export class MusicPlayer {
  constructor(audioContext = null) {
    this.ctx = audioContext;
    this.isPlaying = false;
    this.volume = 0.55;
    this.currentTrackIndex = 0;
    this.step = 0;
    this.timerId = null;

    this.tracks = [
      {
        id: 'apex_overdrive',
        title: '⚡ APEX OVERDRIVE — FC 27 MAIN THEME',
        genre: 'FIFA Electro-Rock Anthem',
        bpm: 128,
        // High-energy D-minor rock riff: D, D, F, G, G#, G, F, D
        riff: [38, 38, 41, 43, 44, 43, 41, 38],
        leadNotes: [62, 62, 65, 67, 68, 67, 65, 62, 74, 72, 69, 67],
        chords: [
          [50, 53, 57, 62], // Dm
          [46, 50, 53, 58], // Bb
          [41, 45, 48, 53], // F
          [43, 47, 50, 55]  // C
        ]
      },
      {
        id: 'stadium_hyperdrive',
        title: '🔥 STADIUM HYPERDRIVE (FESTIVAL DROP)',
        genre: 'Club Progressive Anthem',
        bpm: 130,
        riff: [36, 36, 39, 41, 43, 41, 39, 36],
        leadNotes: [60, 63, 67, 72, 70, 67, 63, 60],
        chords: [
          [48, 51, 55, 60], // Cm
          [44, 48, 51, 56], // Ab
          [39, 43, 46, 51], // Eb
          [46, 50, 53, 58]  // Bb
        ]
      },
      {
        id: 'joga_fever',
        title: '⚽ JOGA FEVER (SAMBA ELECTRO BASS)',
        genre: 'Brazilian Tech Funk',
        bpm: 125,
        riff: [33, 36, 38, 40, 43, 40, 38, 36],
        leadNotes: [57, 60, 64, 69, 67, 64, 60, 57],
        chords: [
          [45, 48, 52, 57], // Am
          [41, 45, 48, 53], // F
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

      // Master Compressor to give it that punchy commercial radio / AAA sports game polish
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);
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

  duckVolume(target = 0.15, duration = 3.0) {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.15);
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

    this.playStep(this.step, track, stepDuration);
    this.step = (this.step + 1) % 64; // 4-bar loop of 16 steps

    if (this.onBeat && this.step % 4 === 0) {
      this.onBeat(this.step / 4);
    }

    this.timerId = setTimeout(() => {
      this.scheduleLoop();
    }, stepDuration * 1000);
  }

  playStep(step, track, stepDuration) {
    const now = this.ctx.currentTime;
    const beatIndex = Math.floor(step / 4);
    const sixteenth = step % 4;

    // 1. Heavy Punchy Kick Drum on every beat
    if (sixteenth === 0) {
      this.playKick(now);
    }

    // 2. Off-Beat Shakers & Open Hi-Hats
    if (sixteenth === 2) {
      this.playOpenHiHat(now);
    } else {
      this.playShaker(now);
    }

    // 3. Stadium Snare / Clap on beats 2 and 4
    if (sixteenth === 0 && (beatIndex % 4 === 1 || beatIndex % 4 === 3)) {
      this.playStadiumClap(now);
    }

    // 4. Crunchy Rock Guitar / Bass Riff (16th note drive)
    const riffMidi = track.riff[Math.floor(step / 2) % track.riff.length];
    if (sixteenth === 0 || sixteenth === 2 || (sixteenth === 3 && step % 8 !== 0)) {
      this.playCrunchyBass(now, riffMidi, stepDuration * 1.8);
    }

    // 5. Huge Brass / Synth Chord Stabs on beat 1 and syncopated beat 3.5
    if ((sixteenth === 0 && beatIndex % 2 === 0) || (sixteenth === 2 && beatIndex % 4 === 2)) {
      const chordIndex = Math.floor(step / 16) % track.chords.length;
      this.playBrassChords(now, track.chords[chordIndex]);
    }

    // 6. High Energy Lead Melody (Enters after bar 1)
    if (step >= 16) {
      const noteMidi = track.leadNotes[step % track.leadNotes.length];
      this.playSynthLead(now, noteMidi);
    }

    // 7. Stadium Crowd Vocal Chant ("OH-WAY-OH")
    if (step >= 32 && sixteenth === 0 && (beatIndex % 4 === 0 || beatIndex % 4 === 2)) {
      this.playStadiumVocal(now, 57 + (beatIndex % 2 === 0 ? 0 : 3));
    }
  }

  midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  playKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    // Huge 180Hz punch dropping to 35Hz sub
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.1);

    gain.gain.setValueAtTime(0.85, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  playStadiumClap(time) {
    // Twin noise bursts + reverb snap
    [0, 0.012, 0.024].forEach((offset, i) => {
      const noise = this.ctx.createBufferSource();
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < data.length; j++) data[j] = (Math.random() * 2 - 1) * 0.45;
      noise.buffer = buf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400 + i * 200, time + offset);
      filter.Q.setValueAtTime(1.8, time + offset);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.45 / (i + 1), time + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, time + offset + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(time + offset);
      noise.stop(time + offset + 0.2);
    });
  }

  playOpenHiHat(time) {
    const noise = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.12, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6800, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.12);
  }

  playShaker(time) {
    const noise = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.04, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(9200, time);
    filter.Q.setValueAtTime(2.5, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.038);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.04);
  }

  playCrunchyBass(time, midi, duration = 0.2) {
    // Twin detuned sawtooth oscillators with drive
    [-6, 6].forEach(detune => {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(this.midiToFreq(midi), time);
      osc.detune.setValueAtTime(detune, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, time);
      filter.frequency.exponentialRampToValueAtTime(260, time + 0.14);
      filter.Q.setValueAtTime(4.0, time); // resonant bite!

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + duration + 0.02);
    });
  }

  playBrassChords(time, chordMidis) {
    chordMidis.forEach(midi => {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(this.midiToFreq(midi), time);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, time);
      filter.Q.setValueAtTime(2.0, time);

      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.3);
    });
  }

  playSynthLead(time, midi) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(this.midiToFreq(midi), time);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, time);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.12);
  }

  playStadiumVocal(time, midi) {
    // Formant vocal choir simulation ("OH-WAY")
    [320, 800, 2400].forEach((formant, i) => {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(this.midiToFreq(midi), time);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(formant, time);
      filter.Q.setValueAtTime(5.0, time);

      gain.gain.setValueAtTime(0.08 / (i + 1), time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.38);
    });
  }
}
