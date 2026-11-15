/**
 * FC 27 - In-Game Broadcast HUD & Real-time Radar Mini-Map
 * Renders the top scorebug, player status bar with stamina/power gauge,
 * 2D radar pitch overlay with all 22 player coordinates, and banner alerts.
 */

export class MatchHUD {
  constructor(container, simulation) {
    this.container = container;
    this.sim = simulation;
    this.engine = window.fcEngine;
    this.radarCanvas = null;
    this.radarCtx = null;
    this.pauseReturnState = 'playing';
    this.panelReturnTo = 'pauseOverlay';

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

      <!-- Touch controls and action dock -->
      <div class="hud-touch-controls" id="touchControls">
        <div class="touch-stick-area" id="touchStick">
          <div class="touch-nub" id="touchNub"></div>
        </div>
      </div>
      <div class="hud-action-dock" id="matchActionDock" aria-label="Match controls">
        <button class="match-action" data-action="switch" title="Switch player (Q)">SWITCH <kbd>Q</kbd></button>
        <button class="match-action" data-action="tackle" title="Tackle (E)">TACKLE <kbd>E</kbd></button>
        <button class="match-action" data-action="skill" title="Skill move (F)">SKILL <kbd>F</kbd></button>
        <button class="match-action" data-action="sprint" title="Sprint (hold Shift)">SPRINT <kbd>⇧</kbd></button>
        <button class="match-action" data-action="cross" title="Cross (L)">CROSS <kbd>L</kbd></button>
        <button class="match-action" data-action="through" title="Through ball (I)">THROUGH <kbd>I</kbd></button>
        <button class="match-action" data-action="pass" title="Pass (J)">PASS <kbd>J</kbd></button>
        <button class="match-action primary" data-action="shoot" title="Shoot (hold K or Space)">SHOOT <kbd>K</kbd></button>
        <button class="match-action pause" data-action="pause" title="Pause match (Esc)">PAUSE <kbd>Esc</kbd></button>
      </div>

      <!-- Pause Menu Overlay -->
      <div class="hud-overlay hidden" id="pauseOverlay">
        <div class="hud-modal">
          <div class="modal-badge">MATCH PAUSED</div>
          <h2>TACTICAL <em>BREAK.</em></h2>
          <p>Readjust your approach. Under the stadium floodlights, every second counts.</p>
          <div class="modal-actions">
            <button class="fc-btn primary" id="btnResumeMatch">RESUME MATCH <span>▶</span></button>
            <button class="fc-btn secondary" id="btnReplay">REPLAY <span>↺</span></button>
            <button class="fc-btn secondary" id="btnSubstitutions">SUBSTITUTIONS <span>⇄</span></button>
            <button class="fc-btn secondary" id="btnMatchSettings">MATCH SETTINGS <span>⚙</span></button>
            <button class="fc-btn secondary" id="btnPausedMOTM">PLAYER OF THE MATCH <span>★</span></button>
            <button class="fc-btn secondary" id="btnRestartMatch">RESTART KICK-OFF <span>↻</span></button>
            <button class="fc-btn danger" id="btnQuitMatch">QUIT TO MAIN MENU <span>✕</span></button>
          </div>
          <div class="modal-tip"><kbd>ESC</kbd> to return directly to the pitch</div>
        </div>
      </div>

      <div class="hud-overlay hidden" id="replayOverlay">
        <div class="hud-modal">
          <div class="modal-badge">MATCH REPLAY</div>
          <h2>LAST <em>12 SECONDS.</em></h2>
          <p id="replayStatus">Review the recent action. The match will resume paused when the replay ends.</p>
          <div class="replay-progress"><div id="replayProgressBar"></div></div>
          <div class="modal-actions">
            <button class="fc-btn secondary" id="btnExitReplay">EXIT REPLAY <span>■</span></button>
          </div>
        </div>
      </div>

      <div class="hud-overlay hidden" id="substitutionOverlay">
        <div class="hud-modal">
          <div class="modal-badge">TOUCHLINE</div>
          <h2>MAKE A <em>SUBSTITUTION.</em></h2>
          <p id="substitutionCount">0 of 5 substitutions used</p>
          <div class="settings-form-grid">
            <div class="setting-item">
              <label for="subOutgoing">PLAYER COMING OFF</label>
              <select id="subOutgoing"></select>
            </div>
            <div class="setting-item">
              <label for="subIncoming">PLAYER COMING ON</label>
              <select id="subIncoming"></select>
            </div>
          </div>
          <p id="substitutionMessage" class="modal-feedback" aria-live="polite"></p>
          <div class="modal-actions">
            <button class="fc-btn primary" id="btnConfirmSubstitution">CONFIRM CHANGE <span>⇄</span></button>
            <button class="fc-btn secondary" data-return-pause>BACK</button>
          </div>
        </div>
      </div>

      <div class="hud-overlay hidden" id="matchSettingsOverlay">
        <div class="hud-modal">
          <div class="modal-badge">IN-MATCH OPTIONS</div>
          <h2>GAME <em>SETTINGS.</em></h2>
          <div class="settings-form-grid">
            <div class="setting-item">
              <label for="matchCamera">CAMERA</label>
              <select id="matchCamera">
                <option value="broadcast">TV Broadcast</option>
                <option value="tele">Tele</option>
                <option value="end_to_end">End-to-End</option>
                <option value="pro_cam">Pro Cam</option>
              </select>
            </div>
            <div class="setting-item">
              <label for="matchVolume">AUDIO VOLUME</label>
              <input id="matchVolume" type="range" min="0" max="1" step="0.05">
            </div>
            <label class="match-toggle"><input id="matchCommentary" type="checkbox"> Spoken commentary</label>
            <label class="match-toggle"><input id="matchAudio" type="checkbox"> Match sound effects</label>
          </div>
          <div class="controls-guide-box">
            <h4>CONTROLS</h4>
            <div class="guide-grid">
              <span><strong>WASD / Arrows</strong> Move</span><span><strong>Shift</strong> Sprint</span>
              <span><strong>K / Space</strong> Shoot</span><span><strong>J</strong> Pass</span>
              <span><strong>I</strong> Through ball</span><span><strong>L</strong> Cross</span>
              <span><strong>F</strong> Skill</span><span><strong>E</strong> Tackle</span>
              <span><strong>Q / Tab</strong> Switch</span><span><strong>Esc</strong> Pause</span>
            </div>
          </div>
          <div class="modal-actions">
            <button class="fc-btn primary" data-return-pause>DONE</button>
          </div>
        </div>
      </div>

      <div class="hud-overlay hidden" id="motmOverlay">
        <div class="hud-modal">
          <div class="modal-badge" id="motmStatus">CURRENT LEADER</div>
          <h2>PLAYER OF THE <em>MATCH.</em></h2>
          <div class="motm-card">
            <div class="motm-rating" id="motmRating">6.0</div>
            <div><strong id="motmName">PLAYER</strong><span id="motmDetails"></span></div>
          </div>
          <p id="motmStats" class="motm-stats"></p>
          <div class="modal-actions">
            <button class="fc-btn primary" data-return-pause id="btnCloseMOTM">BACK</button>
          </div>
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
          <button class="fc-btn secondary" id="btnFulltimeMOTM">PLAYER OF THE MATCH <span>★</span></button>
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
      document.getElementById('pauseOverlay').classList.add('hidden');
      this.resetMatch();
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
      this.resetMatch();
    };
    document.getElementById('btnExitToMenu').onclick = () => {
      if (this.onQuit) this.onQuit();
    };
    document.getElementById('btnReplay').onclick = () => this.openReplay();
    document.getElementById('btnExitReplay').onclick = () => this.sim.stopReplay();
    document.getElementById('btnSubstitutions').onclick = () => this.openPanel('substitutionOverlay');
    document.getElementById('btnMatchSettings').onclick = () => this.openSettings();
    document.getElementById('btnPausedMOTM').onclick = () => this.openMOTM('pauseOverlay');
    document.getElementById('btnFulltimeMOTM').onclick = () => this.openMOTM('fulltimeOverlay');
    document.getElementById('btnConfirmSubstitution').onclick = () => this.confirmSubstitution();
    document.querySelectorAll('[data-return-pause]').forEach(button => {
      button.onclick = () => this.returnFromPanel();
    });

    document.querySelectorAll('[data-action]').forEach(button => {
      const action = button.dataset.action;
      const held = action === 'shoot' || action === 'sprint';
      const release = () => {
        if (held) this.engine.touchInput[action === 'shoot' ? 'shootHeld' : 'sprint'] = false;
      };
      button.onpointerdown = event => {
        event.preventDefault();
        if (action === 'pause') {
          this.togglePause(true);
        } else if (held) {
          this.engine.touchInput[action === 'shoot' ? 'shootHeld' : 'sprint'] = true;
        } else {
          const field = {
            pass: 'passTriggered',
            through: 'throughTriggered',
            cross: 'crossTriggered',
            skill: 'skillTriggered',
            tackle: 'slideTriggered',
            switch: 'switchTriggered'
          }[action];
          if (field) this.engine.input[field] = true;
        }
      };
      button.onpointerup = release;
      button.onpointercancel = release;
      button.onlostpointercapture = release;
    });

    this.bindTouchStick();
    this.syncCameraSetting();
    document.getElementById('matchVolume').value = this.engine.sound.volume;
    document.getElementById('matchCommentary').checked = this.sim.commentary.enabled;
    document.getElementById('matchAudio').checked = this.engine.sound.enabled;
    document.getElementById('matchCamera').onchange = event => {
      this.engine.cameraSystem.setMode(event.target.value);
    };
    document.getElementById('matchVolume').oninput = event => {
      const volume = Number(event.target.value);
      this.engine.sound.volume = volume;
      this.engine.music.setVolume(volume);
    };
    document.getElementById('matchCommentary').onchange = event => {
      this.sim.commentary.enabled = event.target.checked;
    };
    document.getElementById('matchAudio').onchange = event => {
      this.engine.sound.enabled = event.target.checked;
    };
    this.renderSubstitutionOptions();

    this.sim.onReplayProgress = progress => {
      document.getElementById('replayProgressBar').style.width =
        `${Math.min(100, progress * 100)}%`;
    };
    this.sim.onReplayEnd = () => {
      document.getElementById('replayOverlay').classList.add('hidden');
      document.getElementById('pauseOverlay').classList.remove('hidden');
    };
  }

  bindTouchStick() {
    const stick = document.getElementById('touchStick');
    const nub = document.getElementById('touchNub');
    const touch = this.engine.touchInput;
    const update = event => {
      const rect = stick.getBoundingClientRect();
      const radius = Math.min(rect.width, rect.height) * 0.36;
      let x = event.clientX - (rect.left + rect.width / 2);
      let y = event.clientY - (rect.top + rect.height / 2);
      const length = Math.hypot(x, y);
      if (length > radius) {
        x = x / length * radius;
        y = y / length * radius;
      }
      nub.style.transform = `translate(${x}px, ${y}px)`;
      touch.left = x < -radius * 0.2;
      touch.right = x > radius * 0.2;
      touch.up = y < -radius * 0.2;
      touch.down = y > radius * 0.2;
    };
    const release = () => {
      touch.left = touch.right = touch.up = touch.down = false;
      nub.style.transform = 'translate(0, 0)';
    };
    stick.onpointerdown = event => {
      event.preventDefault();
      stick.setPointerCapture(event.pointerId);
      update(event);
    };
    stick.onpointermove = event => {
      if (stick.hasPointerCapture(event.pointerId)) update(event);
    };
    stick.onpointerup = release;
    stick.onpointercancel = release;
  }

  openPanel(id) {
    document.getElementById('pauseOverlay').classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
  }

  returnFromPanel() {
    document.querySelectorAll('#replayOverlay, #substitutionOverlay, #matchSettingsOverlay, #motmOverlay')
      .forEach(overlay => overlay.classList.add('hidden'));
    document.getElementById(this.panelReturnTo).classList.remove('hidden');
  }

  openSettings() {
    this.syncCameraSetting();
    document.getElementById('matchVolume').value = this.engine.sound.volume;
    this.panelReturnTo = 'pauseOverlay';
    this.openPanel('matchSettingsOverlay');
  }

  syncCameraSetting() {
    const select = document.getElementById('matchCamera');
    const mode = this.engine.cameraSystem.mode;
    select.value = Array.from(select.options).some(option => option.value === mode)
      ? mode
      : 'broadcast';
  }

  openReplay() {
    if (!this.sim.startReplay()) {
      document.getElementById('hudTickerText').textContent =
        'REPLAY UNAVAILABLE · PLAY A LITTLE LONGER FIRST';
      return;
    }
    document.getElementById('replayProgressBar').style.width = '0%';
    document.getElementById('replayOverlay').classList.remove('hidden');
    document.getElementById('pauseOverlay').classList.add('hidden');
  }

  renderSubstitutionOptions() {
    const outgoing = document.getElementById('subOutgoing');
    const incoming = document.getElementById('subIncoming');
    outgoing.replaceChildren();
    incoming.replaceChildren();
    this.sim.homePlayers.forEach(player => {
      const option = document.createElement('option');
      option.value = player.info.num;
      option.textContent = `#${player.info.num} ${player.info.name} · ${player.info.role}`;
      outgoing.appendChild(option);
    });
    this.sim.homeBench.forEach(player => {
      const option = document.createElement('option');
      option.value = player.num;
      option.textContent = `#${player.num} ${player.name} · ${player.role}`;
      incoming.appendChild(option);
    });

    document.getElementById('substitutionCount').textContent =
      `${this.sim.substitutionsUsed} of 5 substitutions used · ${this.sim.homeBench.length} on the bench`;
    document.getElementById('btnConfirmSubstitution').disabled =
      this.sim.substitutionsUsed >= 5 || this.sim.homeBench.length === 0;
  }

  confirmSubstitution() {
    const outgoing = Number(document.getElementById('subOutgoing').value);
    const incoming = Number(document.getElementById('subIncoming').value);
    const result = this.sim.performSubstitution(outgoing, incoming);
    document.getElementById('substitutionMessage').textContent = result.message;
    if (result.success) this.renderSubstitutionOptions();
  }

  openMOTM(returnTo) {
    this.panelReturnTo = returnTo;
    const result = this.sim.getPlayerOfMatch();
    document.getElementById('motmStatus').textContent =
      this.sim.matchState === 'fulltime' ? 'FULL-TIME AWARD' : 'PROVISIONAL LEADER';
    if (result) {
      const { player, stats, rating } = result;
      document.getElementById('motmRating').textContent = rating.toFixed(1);
      document.getElementById('motmName').textContent =
        `#${player.info.num} ${player.info.name}`;
      const team = player.teamData?.name || '';
      document.getElementById('motmDetails').textContent =
        `${team} · ${player.info.role}`;
      document.getElementById('motmStats').textContent =
        `${stats.goals || 0} goals · ${stats.assists || 0} assists · ` +
        `${stats.saves || 0} saves · ${stats.tackles || 0} tackles · ` +
        `${stats.shots || 0} shots`;
    }
    document.getElementById('pauseOverlay').classList.add('hidden');
    document.getElementById('fulltimeOverlay').classList.add('hidden');
    document.getElementById('motmOverlay').classList.remove('hidden');
  }

  resetMatch() {
    document.querySelectorAll(
      '#pauseOverlay, #replayOverlay, #substitutionOverlay, #matchSettingsOverlay, #motmOverlay, #halftimeOverlay, #fulltimeOverlay'
    ).forEach(overlay => overlay.classList.add('hidden'));
    this.pauseReturnState = 'playing';
    this.sim.homeScore = 0;
    this.sim.awayScore = 0;
    this.sim.homeShots = 0;
    this.sim.awayShots = 0;
    this.sim.homePossessionTime = 0;
    this.sim.awayPossessionTime = 0;
    this.sim.elapsedRealSeconds = 0;
    this.sim.isSecondHalf = false;
    this.sim.lineupDone = true;
    this.sim.homeRoster = this.sim.homeTeamData.roster.slice(0, 11);
    this.sim.homeBench = (this.sim.homeTeamData.subs || []).slice();
    this.sim.substitutionsUsed = 0;
    this.sim.playerMatchStats.clear();
    this.sim.replayFrames = [];
    this.sim.replayTime = 0;
    this.sim.replayAccumulator = 0;
    this.sim.chargingShot = false;
    this.sim.shotPower = 0;
    this.sim.initTeams();
    this.renderSubstitutionOptions();
    document.getElementById('hudHomeScore').textContent = '0';
    document.getElementById('hudAwayScore').textContent = '0';
    document.getElementById('hudClock').textContent = "00'";
    document.getElementById('hudPeriod').textContent = '1ST HALF';
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

    this.sim.onHalfTime = (home, away) => {
      document.getElementById('htHomeName').textContent = this.sim.homeTeamData.name;
      document.getElementById('htAwayName').textContent = this.sim.awayTeamData.name;
      document.getElementById('htHomeScore').textContent = home;
      document.getElementById('htAwayScore').textContent = away;
      document.getElementById('halftimeOverlay').classList.remove('hidden');
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
    const overlays = document.querySelectorAll(
      '#pauseOverlay, #replayOverlay, #substitutionOverlay, #matchSettingsOverlay, #motmOverlay, #halftimeOverlay, #fulltimeOverlay'
    );
    if (this.sim.isReplaying) {
      this.sim.stopReplay();
      return;
    }
    if (show) {
      if (this.sim.matchState !== 'paused') this.pauseReturnState = this.sim.matchState;
      overlays.forEach(overlay => overlay.classList.add('hidden'));
      document.getElementById('pauseOverlay').classList.remove('hidden');
      this.sim.matchState = 'paused';
    } else {
      overlays.forEach(overlay => overlay.classList.add('hidden'));
      this.sim.matchState = this.pauseReturnState || 'playing';
      if (this.sim.matchState === 'halftime') {
        document.getElementById('halftimeOverlay').classList.remove('hidden');
      } else if (this.sim.matchState === 'fulltime') {
        document.getElementById('fulltimeOverlay').classList.remove('hidden');
      }
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
