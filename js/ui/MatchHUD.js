/**
 * FC 27 - In-Game Broadcast HUD & Real-time Radar Mini-Map
 * Renders the top scorebug, player status bar with stamina/power gauge,
 * 2D radar pitch overlay with all 22 player coordinates, and banner alerts.
 */

export class MatchHUD {
  constructor(container, simulation) {
    this.container = container;
    this.sim = simulation;
    this.radarCanvas = null;
    this.radarCtx = null;

    this.build();
    this.bindSimulation();
  }

  build() {
    this.container.innerHTML = `
      <!-- Top Broadcast Scorebug -->
      <div class="hud-scorebug" id="scorebug">
        <div class="scorebug-team home">
          <span class="team-badge" id="hudHomeBadge">MER</span>
          <span class="team-title" id="hudHomeName">MERIDIAN CITY</span>
          <span class="team-score" id="hudHomeScore">0</span>
        </div>
        <div class="scorebug-clock">
          <span class="match-time" id="hudClock">00'</span>
          <span class="match-period" id="hudPeriod">1ST HALF</span>
        </div>
        <div class="scorebug-team away">
          <span class="team-score" id="hudAwayScore">0</span>
          <span class="team-title" id="hudAwayName">NORTHSTAR FC</span>
          <span class="team-badge" id="hudAwayBadge">NOR</span>
        </div>
      </div>

      <!-- Live Broadcast Alert Ticker -->
      <div class="hud-ticker" id="hudTicker">
        <span class="ticker-pulse"></span>
        <span class="ticker-text" id="hudTickerText">MATCH UNDER WAY · MERIDIAN PARK</span>
      </div>

      <div class="hud-commentary" id="hudCommentary" aria-live="polite" aria-atomic="true">
        <span class="commentary-label">LIVE COMMENTARY</span>
        <span class="commentary-line" id="hudCommentaryLine"></span>
      </div>

      <!-- Bottom Player Info & Gauges -->
      <div class="hud-player-card" id="hudPlayerCard">
        <div class="player-num-badge" id="hudPlayerNum">10</div>
        <div class="player-meta">
          <div class="player-name-row">
            <span class="player-name" id="hudPlayerName">JIN OKORO</span>
            <span class="player-role-pill" id="hudPlayerRole">CAM</span>
          </div>
          <div class="player-bars">
            <div class="bar-wrap stamina">
              <span class="bar-label">STAMINA</span>
              <div class="bar-track"><div class="bar-fill" id="hudStaminaBar" style="width: 100%;"></div></div>
            </div>
            <div class="bar-wrap power">
              <span class="bar-label" id="hudPowerLabel">POWER</span>
              <div class="bar-track"><div class="bar-fill" id="hudPowerBar" style="width: 0%;"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Radar Mini-map -->
      <div class="hud-radar">
        <canvas id="radarCanvas" width="160" height="104"></canvas>
      </div>

      <!-- Touch Controls for Mobile/Tablets -->
      <div class="hud-touch-controls" id="touchControls">
        <div class="touch-stick-area" id="touchStick">
          <div class="touch-nub" id="touchNub"></div>
        </div>
        <div class="touch-actions-group">
          <button class="touch-btn sprint" id="touchSprint">SPRINT</button>
          <button class="touch-btn shoot" id="touchShoot">SHOOT</button>
          <button class="touch-btn pass" id="touchPass">PASS</button>
          <button class="touch-btn switch" id="touchSwitch">SWITCH</button>
        </div>
      </div>

      <!-- Pause Menu Overlay -->
      <div class="hud-overlay hidden" id="pauseOverlay">
        <div class="hud-modal">
          <div class="modal-badge">MATCH PAUSED</div>
          <h2>TACTICAL <em>BREAK.</em></h2>
          <p>Readjust your approach. Under the stadium floodlights, every second counts.</p>
          <div class="modal-actions">
            <button class="fc-btn primary" id="btnResumeMatch">RESUME MATCH <span>▶</span></button>
            <button class="fc-btn secondary" id="btnRestartMatch">RESTART KICK-OFF <span>↻</span></button>
            <button class="fc-btn danger" id="btnQuitMatch">QUIT TO MAIN MENU <span>✕</span></button>
          </div>
          <div class="modal-tip"><kbd>ESC</kbd> to return directly to the pitch</div>
        </div>
      </div>

      <!-- Half-Time Overlay -->
      <div class="hud-overlay hidden" id="halftimeOverlay">
        <div class="hud-modal">
          <div class="modal-badge">HALF TIME WHISTLE</div>
          <h2>THE <em>BREAK.</em></h2>
          <div class="modal-scoreline">
            <span id="htHomeName">MERIDIAN CITY</span>
            <strong id="htHomeScore">0</strong>
            <i>—</i>
            <strong id="htAwayScore">0</strong>
            <span id="htAwayName">NORTHSTAR FC</span>
          </div>
          <p>Switch sides. Catch your breath. Forty-five minutes remain to secure glory.</p>
          <div class="modal-actions">
            <button class="fc-btn primary" id="btnStartSecondHalf">START SECOND HALF <span>▶</span></button>
          </div>
        </div>
      </div>

      <!-- Full-Time Overlay -->
      <div class="hud-overlay hidden" id="fulltimeOverlay">
        <div class="hud-modal">
          <div class="modal-badge">FULL TIME WHISTLE</div>
          <h2 id="ftResultTitle">MATCH <em>COMPLETE.</em></h2>
          <div class="modal-scoreline">
            <span id="ftHomeName">MERIDIAN CITY</span>
            <strong id="ftHomeScore">0</strong>
            <i>—</i>
            <strong id="ftAwayScore">0</strong>
            <span id="ftAwayName">NORTHSTAR FC</span>
          </div>
          <div class="modal-stats-grid">
            <div class="stat-col"><small>POSSESSION</small><strong id="ftPossession">50% — 50%</strong></div>
            <div class="stat-col"><small>TOTAL SHOTS</small><strong id="ftShots">0 — 0</strong></div>
          </div>
          <div class="modal-actions">
            <button class="fc-btn primary" id="btnRematch">PLAY AGAIN <span>↻</span></button>
            <button class="fc-btn secondary" id="btnExitToMenu">RETURN TO MENU <span>⌂</span></button>
          </div>
        </div>
      </div>
    `;

    this.radarCanvas = document.getElementById('radarCanvas');
    this.radarCtx = this.radarCanvas.getContext('2d');

    // Sync initial team names & badges
    document.getElementById('hudHomeName').textContent = this.sim.homeTeamData.name;
    document.getElementById('hudHomeBadge').textContent = this.sim.homeTeamData.shortName;
    document.getElementById('hudAwayName').textContent = this.sim.awayTeamData.name;
    document.getElementById('hudAwayBadge').textContent = this.sim.awayTeamData.shortName;

    // Button listeners
    document.getElementById('btnResumeMatch').onclick = () => this.togglePause(false);
    document.getElementById('btnRestartMatch').onclick = () => {
      this.togglePause(false);
      this.sim.homeScore = 0;
      this.sim.awayScore = 0;
      this.sim.elapsedRealSeconds = 0;
      this.sim.isSecondHalf = false;
      document.getElementById('hudHomeScore').textContent = '0';
      document.getElementById('hudAwayScore').textContent = '0';
      this.sim.resetToKickoff('home');
    };
    document.getElementById('btnQuitMatch').onclick = () => {
      if (this.onQuit) this.onQuit();
    };
    document.getElementById('btnStartSecondHalf').onclick = () => {
      document.getElementById('halftimeOverlay').classList.add('hidden');
      this.sim.startSecondHalf();
    };
    document.getElementById('btnRematch').onclick = () => {
      document.getElementById('fulltimeOverlay').classList.add('hidden');
      this.sim.homeScore = 0;
      this.sim.awayScore = 0;
      this.sim.elapsedRealSeconds = 0;
      this.sim.isSecondHalf = false;
      document.getElementById('hudHomeScore').textContent = '0';
      document.getElementById('hudAwayScore').textContent = '0';
      this.sim.resetToKickoff('home');
    };
    document.getElementById('btnExitToMenu').onclick = () => {
      if (this.onQuit) this.onQuit();
    };

    // Touch stick & action buttons
    const passBtn = document.getElementById('touchPass');
    const shootBtn = document.getElementById('touchShoot');
    const sprintBtn = document.getElementById('touchSprint');
    const switchBtn = document.getElementById('touchSwitch');

    if (passBtn) {
      passBtn.onpointerdown = (e) => {
        e.preventDefault();
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS' }));
      };
    }
    if (shootBtn) {
      shootBtn.onpointerdown = (e) => {
        e.preventDefault();
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }));
      };
      shootBtn.onpointerup = (e) => {
        e.preventDefault();
        window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }));
      };
    }
    if (sprintBtn) {
      sprintBtn.onpointerdown = (e) => {
        e.preventDefault();
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft' }));
      };
      sprintBtn.onpointerup = (e) => {
        e.preventDefault();
        window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft' }));
      };
    }
    if (switchBtn) {
      switchBtn.onpointerdown = (e) => {
        e.preventDefault();
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyQ' }));
      };
    }
  }

  bindSimulation() {
    this.sim.onScoreUpdate = (home, away) => {
      document.getElementById('hudHomeScore').textContent = home;
      document.getElementById('hudAwayScore').textContent = away;
    };

    this.sim.onClockUpdate = (minute, isSecondHalf) => {
      document.getElementById('hudClock').textContent = `${minute}'`;
      document.getElementById('hudPeriod').textContent = isSecondHalf ? '2ND HALF' : '1ST HALF';
    };

    this.sim.onMatchEvent = (msg) => {
      const ticker = document.getElementById('hudTicker');
      const text = document.getElementById('hudTickerText');
      text.textContent = msg;
      ticker.classList.add('pulse');
      clearTimeout(this.tickerTimer);
      this.tickerTimer = setTimeout(() => ticker.classList.remove('pulse'), 2500);
    };

    this.sim.onCommentary = (line) => {
      const commentary = document.getElementById('hudCommentary');
      document.getElementById('hudCommentaryLine').textContent = line;
      commentary.classList.add('active');
      clearTimeout(this.commentaryTimer);
      this.commentaryTimer = setTimeout(() => commentary.classList.remove('active'), 8000);
    };
    if (this.sim.commentary.lastLine) {
      this.sim.onCommentary(this.sim.commentary.lastLine);
    }

    this.sim.onStaminaUpdate = (stamina, playerInfo) => {
      document.getElementById('hudStaminaBar').style.width = `${stamina}%`;
      if (playerInfo) {
        document.getElementById('hudPlayerNum').textContent = playerInfo.num;
        document.getElementById('hudPlayerName').textContent = playerInfo.name.toUpperCase();
        document.getElementById('hudPlayerRole').textContent = playerInfo.role;
      }
    };

    this.sim.onPowerUpdate = (power, label) => {
      document.getElementById('hudPowerLabel').textContent = label;
      document.getElementById('hudPowerBar').style.width = `${power * 100}%`;
    };

    this.sim.onMatchEnd = (stats) => {
      document.getElementById('ftHomeName').textContent = this.sim.homeTeamData.name;
      document.getElementById('ftAwayName').textContent = this.sim.awayTeamData.name;
      document.getElementById('ftHomeScore').textContent = stats.homeScore;
      document.getElementById('ftAwayScore').textContent = stats.awayScore;
      document.getElementById('ftPossession').textContent = `${stats.homePossession}% — ${stats.awayPossession}%`;
      document.getElementById('ftShots').textContent = `${stats.homeShots} — ${stats.awayShots}`;

      const title = (stats.homeScore === stats.awayScore) ? 'A HARD-FOUGHT DRAW' :
                    (stats.homeScore > stats.awayScore) ? `${this.sim.homeTeamData.name.toUpperCase()} VICTORIOUS` :
                    `${this.sim.awayTeamData.name.toUpperCase()} TRIUMPH`;
      document.getElementById('ftResultTitle').textContent = title;

      document.getElementById('fulltimeOverlay').classList.remove('hidden');
    };
  }

  togglePause(show) {
    const overlay = document.getElementById('pauseOverlay');
    if (show) {
      overlay.classList.remove('hidden');
      this.sim.matchState = 'paused';
    } else {
      overlay.classList.add('hidden');
      this.sim.matchState = 'playing';
    }
  }

  updateRadar() {
    if (!this.radarCtx) return;
    const ctx = this.radarCtx;
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Pitch background
    ctx.fillStyle = 'rgba(6, 17, 10, 0.85)';
    ctx.fillRect(0, 0, w, h);

    // Pitch boundary lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    // Halfway line & center circle
    ctx.beginPath();
    ctx.moveTo(w / 2, 4);
    ctx.lineTo(w / 2, h - 4);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 14, 0, Math.PI * 2);
    ctx.stroke();

    // Map function from pitch coordinates (-52.5..52.5, -34..34) to radar canvas
    const toRadar = (x, z) => ({
      rx: 4 + ((x + 52.5) / 105) * (w - 8),
      ry: 4 + ((z + 34) / 68) * (h - 8)
    });

    // Draw Home players (Cyan / Volt)
    this.sim.homePlayers.forEach(p => {
      const { rx, ry } = toRadar(p.position.x, p.position.z);
      ctx.fillStyle = (p === this.sim.activeUserPlayer) ? '#00ff87' : '#00b4d8';
      ctx.beginPath();
      ctx.arc(rx, ry, (p === this.sim.activeUserPlayer) ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Away players (Gold / Red)
    this.sim.awayPlayers.forEach(p => {
      const { rx, ry } = toRadar(p.position.x, p.position.z);
      ctx.fillStyle = '#ffb703';
      ctx.beginPath();
      ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Ball (White glowing dot)
    const ballPos = toRadar(this.sim.ball.position.x, this.sim.ball.position.z);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ballPos.rx, ballPos.ry, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }

  dispose() {
    clearTimeout(this.tickerTimer);
    clearTimeout(this.commentaryTimer);
    this.sim.onMatchEvent = null;
    this.sim.onCommentary = null;
    this.container.innerHTML = '';
  }
}
