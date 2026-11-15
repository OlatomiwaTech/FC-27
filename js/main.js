/**
 * FC 27 - Master Game Engine Bootstrap
 * Orchestrates WebGL Three.js rendering, Web Audio synthesis, camera cinematography,
 * input processing (keyboard & gamepad), and game mode state routing.
 */

import { SoundSystem } from './audio/SoundSystem.js';
import { MusicPlayer } from './audio/MusicPlayer.js';
import { Stadium3D } from './graphics/Stadium3D.js';
import { CameraSystem } from './graphics/CameraSystem.js';
import { MatchSimulation } from './gameplay/MatchSimulation.js';
import { TrainingDrillSimulation } from './gameplay/TrainingDrillSimulation.js';
import { MenuManager } from './ui/MenuManager.js';
import { KickOffUI } from './ui/KickOffUI.js';
import { SquadBuilderUI } from './ui/SquadBuilderUI.js';
import { CareerModeUI } from './ui/CareerModeUI.js';
import { TournamentUI } from './ui/TournamentUI.js';
import { TrainingArenaUI } from './ui/TrainingArenaUI.js';
import { MatchHUD } from './ui/MatchHUD.js';
import { TrainingHUD } from './ui/TrainingHUD.js';
import { TEAMS, STADIUMS } from './data/TeamsData.js';

export class FC27Engine {
  constructor() {
    this.canvas = document.getElementById('webglCanvas');
    this.uiContainer = document.getElementById('uiRoot');

    // 1. Audio & Music Soundtrack Engine
    this.sound = new SoundSystem();
    this.music = new MusicPlayer();

    // 2. Three.js Scene Setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 300);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 3. Stadium & Camera
    this.stadium = new Stadium3D(this.scene, STADIUMS[0]);
    this.cameraSystem = new CameraSystem(this.camera);
    this.cameraSystem.setMode('cinematic_orbit');

    // 4. Input State
    this.keysDown = new Set();
    this.input = {
      up: false, down: false, left: false, right: false,
      sprint: false,
      passTriggered: false,
      shootHeld: false,
      throughTriggered: false,
      crossTriggered: false,
      skillTriggered: false,
      slideTriggered: false,
      switchTriggered: false
    };

    // 5. Game State
    this.activeMode = 'menu'; // 'menu', 'kickoff_setup', 'match', 'training_drill', 'squad', 'career', 'tournament', 'training'
    this.currentSimulation = null;
    this.currentDrillSim = null;
    this.currentHUD = null;
    this.currentDrillHUD = null;
    this.activeUI = null;

    this.lastTime = performance.now();

    this.initInputs();
    this.initMusicWidget();
    this.initRouter();
    this.handleResize();

    // Start master game loop
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  initMusicWidget() {
    const widget = document.createElement('div');
    widget.className = 'fc-music-widget';
    widget.id = 'musicWidget';
    widget.innerHTML = `
      <div class="music-disc-spin" id="musicDisc">💿</div>
      <div class="music-meta">
        <div class="music-track-title" id="musicTrackTitle">${this.music.getCurrentTrack().title}</div>
        <div class="music-bars" id="musicBars">
          <span></span><span></span><span></span><span></span>
        </div>
      </div>
      <button class="music-btn" id="musicPrev" title="Previous Track">⏮</button>
      <button class="music-btn" id="musicToggle" title="Play / Pause">▶</button>
      <button class="music-btn" id="musicNext" title="Next Track">⏭</button>
    `;
    document.body.appendChild(widget);

    const toggleBtn = document.getElementById('musicToggle');
    const disc = document.getElementById('musicDisc');
    const bars = document.getElementById('musicBars');
    const title = document.getElementById('musicTrackTitle');

    const updateUI = () => {
      toggleBtn.textContent = this.music.isPlaying ? '⏸' : '▶';
      disc.classList.toggle('paused', !this.music.isPlaying);
      bars.style.opacity = this.music.isPlaying ? '1' : '0.3';
      title.textContent = this.music.getCurrentTrack().title;
    };

    toggleBtn.onclick = () => {
      this.sound.ensureContext();
      this.music.ensureContext();
      this.music.toggle();
      updateUI();
    };

    document.getElementById('musicNext').onclick = () => {
      this.sound.ensureContext();
      this.music.ensureContext();
      this.music.nextTrack();
      if (!this.music.isPlaying) this.music.start();
      updateUI();
    };

    document.getElementById('musicPrev').onclick = () => {
      this.sound.ensureContext();
      this.music.ensureContext();
      this.music.prevTrack();
      if (!this.music.isPlaying) this.music.start();
      updateUI();
    };

    this.music.onTrackChange = (track) => {
      title.textContent = track.title;
    };
  }

  initInputs() {
    window.addEventListener('keydown', (e) => {
      // Audio context unlock on first key interaction
      this.sound.ensureContext();

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(e.code)) {
        e.preventDefault();
      }

      this.keysDown.add(e.code);

      // ESC to toggle pause
      if (e.code === 'Escape' && this.activeMode === 'match' && this.currentHUD) {
        this.currentHUD.togglePause(this.currentSimulation.matchState !== 'paused');
      }

      // One-shot triggers
      if (e.code === 'KeyJ') {
        this.input.passTriggered = true;
      }
      if (e.code === 'KeyI') {
        this.input.throughTriggered = true;
      }
      if (e.code === 'KeyL') {
        this.input.crossTriggered = true;
      }
      if (e.code === 'KeyF') {
        this.input.skillTriggered = true;
      }
      if (e.code === 'KeyE') {
        this.input.slideTriggered = true;
      }
      if (e.code === 'KeyQ' || e.code === 'Tab') {
        this.input.switchTriggered = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.code);
    });

    window.addEventListener('resize', () => this.handleResize());

    // First user click on window unlocks audio
    window.addEventListener('pointerdown', () => this.sound.ensureContext(), { once: true });
  }

  pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (!gp) return;

    const deadzone = 0.25;
    const axX = gp.axes[0] || 0;
    const axY = gp.axes[1] || 0;

    if (Math.abs(axX) > deadzone) {
      if (axX > deadzone) this.input.right = true;
      if (axX < -deadzone) this.input.left = true;
    }
    if (Math.abs(axY) > deadzone) {
      if (axY > deadzone) this.input.down = true;
      if (axY < -deadzone) this.input.up = true;
    }

    // D-Pad
    if (gp.buttons[12]?.pressed) this.input.up = true;
    if (gp.buttons[13]?.pressed) this.input.down = true;
    if (gp.buttons[14]?.pressed) this.input.left = true;
    if (gp.buttons[15]?.pressed) this.input.right = true;

    // Face Buttons
    if (gp.buttons[0]?.pressed) this.input.passTriggered = true; // A (Pass)
    if (gp.buttons[1]?.pressed) this.input.shootHeld = true; // B (Shoot)
    if (gp.buttons[2]?.pressed) this.input.crossTriggered = true; // X (Cross)
    if (gp.buttons[3]?.pressed) this.input.throughTriggered = true; // Y (Through)

    // Triggers / Bumpers
    if (gp.buttons[7]?.pressed || gp.buttons[7]?.value > 0.4) this.input.sprint = true; // RT
    if (gp.buttons[4]?.pressed) this.input.switchTriggered = true; // LB
    if (gp.buttons[5]?.pressed) this.input.skillTriggered = true; // RB
    if (gp.buttons[9]?.pressed) { // Start Button (Pause)
      if (this.activeMode === 'match' && this.currentHUD) {
        this.currentHUD.togglePause(this.currentSimulation.matchState !== 'paused');
      }
    }
  }

  updateInputState() {
    this.input.up = this.keysDown.has('KeyW') || this.keysDown.has('ArrowUp');
    this.input.down = this.keysDown.has('KeyS') || this.keysDown.has('ArrowDown');
    this.input.left = this.keysDown.has('KeyA') || this.keysDown.has('ArrowLeft');
    this.input.right = this.keysDown.has('KeyD') || this.keysDown.has('ArrowRight');

    this.input.sprint = this.keysDown.has('ShiftLeft') || this.keysDown.has('ShiftRight');
    this.input.shootHeld = this.keysDown.has('KeyK') || this.keysDown.has('Space');

    // Poll Gamepad
    this.pollGamepad();
  }

  initRouter() {
    this.menuManager = new MenuManager(this.uiContainer, this.sound, (destination) => {
      this.sound.playUISelect();
      switch (destination) {
        case 'kickoff':
          this.navigateTo('kickoff_setup');
          break;
        case 'career':
          this.navigateTo('career');
          break;
        case 'tournament':
          this.navigateTo('tournament');
          break;
        case 'training':
          this.navigateTo('training');
          break;
        case 'squad':
          this.navigateTo('squad');
          break;
      }
    });
  }

  navigateTo(mode) {
    this.activeMode = mode;
    this.uiContainer.innerHTML = '';

    if (mode === 'menu') {
      this.cameraSystem.setMode('cinematic_orbit');
      if (this.currentSimulation) {
        this.currentSimulation.dispose();
        this.currentSimulation = null;
      }
      if (this.currentDrillSim) {
        this.currentDrillSim.dispose();
        this.currentDrillSim = null;
      }
      this.initRouter();
    }
    else if (mode === 'kickoff_setup') {
      this.cameraSystem.setMode('cinematic_orbit');
      new KickOffUI(
        this.uiContainer,
        this.sound,
        (home, away, options) => this.startMatch(home, away, options),
        () => this.navigateTo('menu')
      );
    }
    else if (mode === 'squad') {
      this.cameraSystem.setMode('cinematic_orbit');
      new SquadBuilderUI(
        this.uiContainer,
        this.sound,
        () => this.navigateTo('menu')
      );
    }
    else if (mode === 'career') {
      this.cameraSystem.setMode('cinematic_orbit');
      new CareerModeUI(
        this.uiContainer,
        this.sound,
        (home, away) => this.startMatch(home, away, { stadium: STADIUMS[0], duration: 4, difficulty: 'standard' }),
        () => this.navigateTo('menu')
      );
    }
    else if (mode === 'tournament') {
      this.cameraSystem.setMode('cinematic_orbit');
      new TournamentUI(
        this.uiContainer,
        this.sound,
        (home, away) => this.startMatch(home, away, { stadium: STADIUMS[0], duration: 4, difficulty: 'standard' }),
        () => this.navigateTo('menu')
      );
    }
    else if (mode === 'training') {
      this.cameraSystem.setMode('cinematic_orbit');
      new TrainingArenaUI(
        this.uiContainer,
        this.sound,
        (drillMode, team) => this.startTrainingDrill(drillMode, team),
        () => this.navigateTo('menu')
      );
    }
  }

  startMatch(homeTeam, awayTeam, options = {}) {
    this.activeMode = 'match';
    this.uiContainer.innerHTML = '';

    // Switch camera to selected camera angle
    const camMode = this.menuManager ? this.menuManager.settings.camera : 'broadcast';
    this.cameraSystem.setMode(camMode);

    // Start royalty-free stadium soundtrack music if not running
    if (this.music && !this.music.isPlaying) {
      this.music.start();
    }

    // Initialize 3D Match Simulation
    this.currentSimulation = new MatchSimulation(this.scene, this.sound, {
      homeTeam,
      awayTeam,
      stadium: options.stadium || STADIUMS[0],
      duration: options.duration || 4,
      difficulty: options.difficulty || 'standard'
    });

    // Mount In-Game Broadcast HUD
    this.currentHUD = new MatchHUD(this.uiContainer, this.currentSimulation);
    this.currentHUD.onQuit = () => {
      this.sound.playUIClick();
      this.navigateTo('menu');
    };
  }

  startTrainingDrill(drillMode, team) {
    this.activeMode = 'training_drill';
    this.uiContainer.innerHTML = '';

    if (this.currentSimulation) {
      this.currentSimulation.dispose();
      this.currentSimulation = null;
    }
    if (this.currentDrillSim) {
      this.currentDrillSim.dispose();
      this.currentDrillSim = null;
    }

    // Start royalty-free stadium soundtrack
    if (this.music && !this.music.isPlaying) {
      this.music.start();
    }

    if (drillMode === 'free_kick') {
      this.cameraSystem.setMode('tele');
      this.currentDrillSim = new TrainingDrillSimulation(this.scene, this.sound, 'free_kick', team, TEAMS[1]);
      this.currentDrillHUD = new TrainingHUD(this.uiContainer, this.currentDrillSim, () => this.navigateTo('training'));
    } else if (drillMode === 'penalty') {
      this.cameraSystem.setMode('tele');
      this.currentDrillSim = new TrainingDrillSimulation(this.scene, this.sound, 'penalty', team, TEAMS[1]);
      this.currentDrillHUD = new TrainingHUD(this.uiContainer, this.currentDrillSim, () => this.navigateTo('training'));
    } else {
      this.cameraSystem.setMode('broadcast');
      this.currentDrillSim = new TrainingDrillSimulation(this.scene, this.sound, '1v1', team, TEAMS[1]);
      this.currentDrillHUD = new TrainingHUD(this.uiContainer, this.currentDrillSim, () => this.navigateTo('training'));
    }
  }

  handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  loop(now) {
    const dt = Math.min(0.04, (now - this.lastTime) / 1000);
    this.lastTime = now;

    // Update input vector
    this.updateInputState();

    // Update Animated LED boards & Corner Flags
    this.stadium.updateAdBoards(now / 1000);

    // Update Match Simulation if in game
    if (this.activeMode === 'match' && this.currentSimulation) {
      this.currentSimulation.update(dt, this.input);

      // Camera follows the ball and active player
      this.cameraSystem.update(
        dt,
        this.currentSimulation.ball.position,
        this.currentSimulation.activeUserPlayer
      );

      // Update 2D Radar HUD
      if (this.currentHUD) {
        this.currentHUD.updateRadar();
      }
    } else if (this.activeMode === 'training_drill' && this.currentDrillSim) {
      this.currentDrillSim.update(dt, this.input);

      // Camera follows the drill ball and striker
      this.cameraSystem.update(
        dt,
        this.currentDrillSim.ball.position,
        this.currentDrillSim.striker
      );
    } else {
      // Cinematic orbit around stadium in menu modes
      this.cameraSystem.update(dt, new THREE.Vector3(0, 0, 0), null);
    }

    // Reset one-shot input triggers
    this.input.passTriggered = false;
    this.input.throughTriggered = false;
    this.input.crossTriggered = false;
    this.input.skillTriggered = false;
    this.input.slideTriggered = false;
    this.input.switchTriggered = false;

    // Render 3D Scene
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.loop);
  }
}

// Bootstrap on DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  window.fcEngine = new FC27Engine();
});
