/**
 * FC 27 - In-Drill Training HUD Overlay
 * Provides set-piece reticle controls, curl slider, penalty shootout indicators,
 * and drill score tracking.
 */

export class TrainingHUD {
  constructor(container, drillSim, onQuit) {
    this.container = container;
    this.sim = drillSim;
    this.onQuit = onQuit;

    this.build();
    this.bindEvents();
  }

  build() {
    this.container.innerHTML = `
      <div class="drill-hud-container">
        <!-- Top Bar: Drill Name & Score -->
        <div class="drill-topbar">
          <div class="drill-info-pill">
            <span class="drill-mode-badge">${this.sim.mode.replace('_', ' ').toUpperCase()}</span>
            <div class="drill-score-group">
              <span>SCORE: <b id="drillScore">0</b> PTS</span>
              <span>GOALS: <b id="drillGoals">0</b> / <b id="drillAttempts">0</b></span>
            </div>
          </div>

          <!-- Penalty rounds indicator if penalty mode -->
          ${this.sim.mode === 'penalty' ? `
            <div class="penalty-rounds-tracker" id="penRoundsTracker">
              <span class="pen-dot empty">1</span>
              <span class="pen-dot empty">2</span>
              <span class="pen-dot empty">3</span>
              <span class="pen-dot empty">4</span>
              <span class="pen-dot empty">5</span>
            </div>
          ` : ''}

          <button class="fc-btn secondary" id="btnExitDrill">EXIT DRILL <span>✕</span></button>
        </div>

        <!-- Live Ticker Banner -->
        <div class="drill-ticker" id="drillTicker">
          <span class="ticker-pulse"></span>
          <span id="drillTickerText">SET PIECE DRILL ACTIVE</span>
        </div>

        <!-- Free Kick Set-Piece Controls Panel (Bottom-Center) -->
        ${this.sim.mode === 'free_kick' ? `
          <div class="freekick-control-panel">
            <div class="aim-directional-pad">
              <button class="aim-btn" id="aimUp">▲</button>
              <div class="aim-horiz">
                <button class="aim-btn" id="aimLeft">◀</button>
                <span class="aim-center-label">AIM</span>
                <button class="aim-btn" id="aimRight">▶</button>
              </div>
              <button class="aim-btn" id="aimDown">▼</button>
            </div>

            <div class="curl-control-group">
              <label>BALL CURL / SPIN</label>
              <div class="curl-slider-wrap">
                <span>OUTSIDE</span>
                <input type="range" id="curlSlider" min="0" max="1" step="0.05" value="0.5">
                <span>INSIDE</span>
              </div>
            </div>

            <div class="strike-action-wrap">
              <button class="fc-btn primary big-strike-btn" id="btnStrikeFreeKick">
                CHARGE & STRIKE <span>⚡</span>
              </button>
              <div class="power-track-mini"><div class="power-fill-mini" id="drillPowerBar"></div></div>
            </div>
          </div>
        ` : ''}

        <!-- Penalty Shootout Target Selector -->
        ${this.sim.mode === 'penalty' ? `
          <div class="penalty-target-panel">
            <div class="goal-target-grid">
              <button class="pen-target-cell top-left" data-target="-0.75" data-y="1.8">TOP LEFT</button>
              <button class="pen-target-cell top-center" data-target="0" data-y="2.0">TOP CENTER</button>
              <button class="pen-target-cell top-right" data-target="0.75" data-y="1.8">TOP RIGHT</button>
              <button class="pen-target-cell bot-left" data-target="-0.75" data-y="0.4">BOTTOM LEFT</button>
              <button class="pen-target-cell bot-center" data-target="0" data-y="0.4">LOW CENTER</button>
              <button class="pen-target-cell bot-right" data-target="0.75" data-y="0.4">BOTTOM RIGHT</button>
            </div>
            <div class="pen-instruction">CLICK A CORNER TO STRIKE THE PENALTY</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  bindEvents() {
    document.getElementById('btnExitDrill').onclick = () => {
      if (this.onQuit) this.onQuit();
    };

    // Free Kick listeners
    if (this.sim.mode === 'free_kick') {
      document.getElementById('aimUp').onclick = () => this.sim.adjustAim(0, 0.25);
      document.getElementById('aimDown').onclick = () => this.sim.adjustAim(0, -0.25);
      document.getElementById('aimLeft').onclick = () => this.sim.adjustAim(-0.35, 0);
      document.getElementById('aimRight').onclick = () => this.sim.adjustAim(0.35, 0);

      const curlSlider = document.getElementById('curlSlider');
      curlSlider.oninput = (e) => {
        this.sim.curlAmount = parseFloat(e.target.value);
      };

      const strikeBtn = document.getElementById('btnStrikeFreeKick');
      let power = 0;
      let powerTimer = null;

      strikeBtn.onpointerdown = () => {
        power = 0;
        powerTimer = setInterval(() => {
          power = Math.min(1.0, power + 0.05);
          document.getElementById('drillPowerBar').style.width = `${power * 100}%`;
        }, 30);
      };

      strikeBtn.onpointerup = () => {
        clearInterval(powerTimer);
        this.sim.strikeFreeKick(power, this.sim.curlAmount);
        setTimeout(() => {
          document.getElementById('drillPowerBar').style.width = '0%';
        }, 500);
      };
    }

    // Penalty listeners
    if (this.sim.mode === 'penalty') {
      this.container.querySelectorAll('.pen-target-cell').forEach(cell => {
        cell.onclick = () => {
          const targetZ = parseFloat(cell.dataset.target);
          const power = 0.75 + Math.random() * 0.2;
          this.sim.strikePenalty(targetZ, power);
        };
      });
    }

    // Drill Events
    this.sim.onDrillEvent = (msg) => {
      const text = document.getElementById('drillTickerText');
      if (text) text.textContent = msg;

      // Update score display
      const scoreEl = document.getElementById('drillScore');
      const goalsEl = document.getElementById('drillGoals');
      const attEl = document.getElementById('drillAttempts');
      if (scoreEl) scoreEl.textContent = this.sim.score;
      if (goalsEl) goalsEl.textContent = this.sim.goalsScored;
      if (attEl) attEl.textContent = this.sim.attempts;

      // Update penalty round tracker dots
      if (this.sim.mode === 'penalty') {
        const dots = this.container.querySelectorAll('.pen-dot');
        this.sim.penaltyResults.forEach((res, i) => {
          if (dots[i]) {
            dots[i].className = `pen-dot ${res ? 'scored' : 'missed'}`;
            dots[i].textContent = res ? '⚽' : '✕';
          }
        });
      }
    };
  }

  dispose() {
    this.container.innerHTML = '';
  }
}
