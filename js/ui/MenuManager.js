/**
 * FC 27 - Master Menu & Navigation System
 * Renders the main menu, animated tile cards, settings modal, and controls guide.
 */

export class MenuManager {
  constructor(container, sound, onNavigate) {
    this.container = container;
    this.sound = sound;
    this.onNavigate = onNavigate;

    this.settings = {
      camera: 'broadcast',
      volume: 0.8,
      soundEnabled: true,
      graphicsQuality: 'high'
    };

    this.build();
  }

  build() {
    this.container.innerHTML = `
      <div class="main-menu-screen" id="mainMenuScreen">
        <!-- Brand Header Bar -->
        <header class="menu-topbar">
          <div class="brand-crest-group">
            <span class="fc-emblem">FC<b>27</b></span>
            <div class="brand-sub">THE NEXT GENERATION OF FOOTBALL</div>
          </div>
          <div class="menu-topbar-right">
            <span class="version-pill">BUILD 27.4.0 · WEBGL 2.0</span>
            <button class="sound-quick-toggle" id="btnSoundToggle">
              <span id="soundIcon">🔊</span> SOUND ON
            </button>
          </div>
        </header>

        <!-- Center Main Menu Hero Layout -->
        <main class="menu-content-wrap">
          <div class="menu-hero-text">
            <div class="hero-eyebrow"><span class="pulse-dot"></span> SEASON 2026/27 LIVE</div>
            <h1 class="hero-title">OWN<br><em>THE PITCH.</em></h1>
            <p class="hero-desc">Experience next-generation 3D football physics, authentic broadcast presentation, and tactical depth in your browser.</p>
          </div>

          <!-- Interactive Menu Tile Grid -->
          <div class="menu-tiles-grid">
            <!-- 1. Kick Off -->
            <button class="menu-tile hero-tile" data-action="kickoff">
              <div class="tile-number">01</div>
              <div class="tile-icon">⚽</div>
              <div class="tile-info">
                <h3>KICK OFF</h3>
                <p>Jump straight into an exhibition match with authentic 3D broadcast cameras and clubs.</p>
              </div>
              <span class="tile-arrow">↗</span>
            </button>

            <!-- 2. Career Mode -->
            <button class="menu-tile" data-action="career">
              <div class="tile-number">02</div>
              <div class="tile-icon">👔</div>
              <div class="tile-info">
                <h3>CAREER MODE</h3>
                <p>Lead your club to glory. Sign superstar players, conduct press conferences, and build a dynasty.</p>
              </div>
              <span class="tile-arrow">↗</span>
            </button>

            <!-- 3. Tournament -->
            <button class="menu-tile" data-action="tournament">
              <div class="tile-number">03</div>
              <div class="tile-icon">🏆</div>
              <div class="tile-info">
                <h3>TOURNAMENT</h3>
                <p>Knockout championship bracket. Compete for the prestigious Continental Champions Cup.</p>
              </div>
              <span class="tile-arrow">↗</span>
            </button>

            <!-- 4. Training Arena -->
            <button class="menu-tile" data-action="training">
              <div class="tile-number">04</div>
              <div class="tile-icon">🎯</div>
              <div class="tile-info">
                <h3>TRAINING ARENA</h3>
                <p>Master 1v1 practice, curved free kick challenges, and penalty shootouts.</p>
              </div>
              <span class="tile-arrow">↗</span>
            </button>

            <!-- 5. Team Management (Squad Builder) -->
            <button class="menu-tile" data-action="squad">
              <div class="tile-number">05</div>
              <div class="tile-icon">📋</div>
              <div class="tile-info">
                <h3>TEAM MANAGEMENT</h3>
                <p>Configure starting XI, tactical formations, player chem links, and card attributes.</p>
              </div>
              <span class="tile-arrow">↗</span>
            </button>

            <!-- 6. Settings -->
            <button class="menu-tile util-tile" data-action="settings">
              <div class="tile-number">06</div>
              <div class="tile-icon">⚙</div>
              <div class="tile-info">
                <h3>SETTINGS</h3>
                <p>Broadcast cameras, controls, audio, and graphics preferences.</p>
              </div>
              <span class="tile-arrow">⚙</span>
            </button>

            <!-- 7. About the Game -->
            <button class="menu-tile util-tile" data-action="about">
              <div class="tile-number">07</div>
              <div class="tile-icon">ℹ</div>
              <div class="tile-info">
                <h3>ABOUT FC 27</h3>
                <p>Engine architecture, credits, physics simulation specs, and licenses.</p>
              </div>
              <span class="tile-arrow">ℹ</span>
            </button>
          </div>
        </main>

        <!-- Bottom Controls Bar -->
        <footer class="menu-footer">
          <div class="controls-legend">
            <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> MOVE</span>
            <span><kbd>SHIFT</kbd> SPRINT</span>
            <span><kbd>S</kbd> / <kbd>J</kbd> PASS</span>
            <span><kbd>D</kbd> / <kbd>K</kbd> SHOOT</span>
            <span><kbd>W</kbd> / <kbd>I</kbd> THROUGH BALL</span>
            <span><kbd>A</kbd> / <kbd>L</kbd> CROSS</span>
            <span><kbd>SPACE</kbd> TACKLE</span>
            <span><kbd>Q</kbd> SWITCH</span>
          </div>
          <div class="controller-tag">🎮 GAMEPAD ENABLED</div>
        </footer>

        <!-- Settings Modal Overlay -->
        <div class="hud-overlay hidden" id="settingsModal">
          <div class="hud-modal settings-modal">
            <div class="modal-badge">GAME PREFERENCES</div>
            <h2>SETTINGS & <em>CONTROLS</em></h2>
            <div class="settings-form-grid">
              <div class="setting-item">
                <label>BROADCAST CAMERA</label>
                <select id="cfgCamera">
                  <option value="broadcast" ${this.settings.camera === 'broadcast' ? 'selected' : ''}>TV BROADCAST (DYNAMIC DAMPING)</option>
                  <option value="tele" ${this.settings.camera === 'tele' ? 'selected' : ''}>TELE 3D (TACTICAL ELEVATED)</option>
                  <option value="end_to_end" ${this.settings.camera === 'end_to_end' ? 'selected' : ''}>END-TO-END (VERTICAL)</option>
                  <option value="pro_cam" ${this.settings.camera === 'pro_cam' ? 'selected' : ''}>PRO CAM (THIRD PERSON)</option>
                </select>
              </div>

              <div class="setting-item">
                <label>AUDIO & CROWD VOLUME</label>
                <input type="range" id="cfgVolume" min="0" max="1" step="0.1" value="${this.settings.volume}">
              </div>

              <div class="setting-item">
                <label>GRAPHICS PRESET</label>
                <select id="cfgQuality">
                  <option value="high">ULTRA (SHADOWS & PARTICLES ON)</option>
                  <option value="medium">BALANCED</option>
                  <option value="low">PERFORMANCE 60FPS</option>
                </select>
              </div>

              <div class="controls-guide-box">
                <h4>KEYBOARD & GAMEPAD CONTROLS GUIDE</h4>
                <div class="guide-grid">
                  <div><strong>Movement:</strong> WASD / Arrows / Left Stick</div>
                  <div><strong>Sprint:</strong> Left Shift / Gamepad RT</div>
                  <div><strong>Short Pass:</strong> J / Gamepad A</div>
                  <div><strong>Through Ball:</strong> I / Gamepad Y</div>
                  <div><strong>Shoot (Charge):</strong> K / Space / Gamepad B</div>
                  <div><strong>Lob / Cross:</strong> L / Gamepad X</div>
                  <div><strong>Skill Move:</strong> F / Gamepad RB (while carrying)</div>
                  <div><strong>Standing / Slide Tackle:</strong> J / E / Gamepad X</div>
                  <div><strong>Switch Player:</strong> Q / Tab / Gamepad LB</div>
                  <div><strong>Pause Match:</strong> ESC / Start Button</div>
                </div>
              </div>
            </div>
            <div class="modal-actions">
              <button class="fc-btn primary" id="btnSaveSettings">SAVE PREFERENCES <span>✓</span></button>
            </div>
          </div>
        </div>

        <!-- About Modal Overlay -->
        <div class="hud-overlay hidden" id="aboutModal">
          <div class="hud-modal about-modal">
            <div class="modal-badge">STUDIO INFORMATION</div>
            <h2>FC 27 — <em>THE NEXT GENERATION</em></h2>
            <div class="about-content">
              <p>FC 27 is an original AAA football simulation built with HTML5, CSS3, ES6+ JavaScript, Three.js WebGL rendering, and Web Audio API procedural synthesis.</p>
              <div class="features-bullet-list">
                <div>✔ <b>Procedural 3D Stadium</b> with tiered spectator seating, animated LED perimeter hoardings, and floodlights.</div>
                <div>✔ <b>Articulated 3D Player Models</b> featuring custom kits, running animations, ball strike mechanics, and goalkeeper dive saves.</div>
                <div>✔ <b>Ball Aerodynamics Engine</b> simulating Magnus spin, air drag, turf rolling friction, and goal crossbar/post deflections.</div>
                <div>✔ <b>Synthesized Procedural Sound</b> generating dynamic crowd roars, referee whistles, ball strikes, and goal horns without external audio files.</div>
                <div>✔ <b>Comprehensive Game Modes:</b> Kick Off, Manager Career with Signing Cutscenes, Continental Championship, Training Drills, and FUT-style Squad Builder.</div>
              </div>
              <p class="credits-tag">Engineered with high performance WebGL 60FPS optimization.</p>
            </div>
            <div class="modal-actions">
              <button class="fc-btn primary" id="btnCloseAbout">CLOSE <span>✕</span></button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Menu tile buttons
    this.container.querySelectorAll('.menu-tile').forEach(tile => {
      tile.onclick = () => {
        this.sound.playUISelect();
        const action = tile.dataset.action;
        if (action === 'settings') {
          document.getElementById('settingsModal').classList.remove('hidden');
        } else if (action === 'about') {
          document.getElementById('aboutModal').classList.remove('hidden');
        } else if (this.onNavigate) {
          this.onNavigate(action);
        }
      };
    });

    // Sound toggle
    const soundBtn = document.getElementById('btnSoundToggle');
    const soundIcon = document.getElementById('soundIcon');
    soundBtn.onclick = () => {
      this.sound.ensureContext();
      this.settings.soundEnabled = !this.settings.soundEnabled;
      this.sound.enabled = this.settings.soundEnabled;
      soundIcon.textContent = this.settings.soundEnabled ? '🔊' : '🔇';
      soundBtn.innerHTML = `<span id="soundIcon">${soundIcon.textContent}</span> SOUND ${this.settings.soundEnabled ? 'ON' : 'OFF'}`;
    };

    // Settings listeners
    document.getElementById('btnSaveSettings').onclick = () => {
      this.sound.playUIClick();
      this.settings.camera = document.getElementById('cfgCamera').value;
      this.settings.volume = parseFloat(document.getElementById('cfgVolume').value);
      this.sound.volume = this.settings.volume;
      document.getElementById('settingsModal').classList.add('hidden');
    };

    document.getElementById('btnCloseAbout').onclick = () => {
      this.sound.playUIClick();
      document.getElementById('aboutModal').classList.add('hidden');
    };
  }

  show() {
    this.container.classList.remove('hidden');
  }

  hide() {
    this.container.classList.add('hidden');
  }
}
