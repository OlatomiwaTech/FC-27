/**
 * FC 27 - Kick-Off Match Setup & Pre-Match Lineup Walkout
 * Allows selecting Home and Away clubs, kits, stadiums, difficulty, match duration,
 * and launches the pre-match presentation walkout with lineups.
 */

import { TEAMS, STADIUMS, FORMATIONS } from '../data/TeamsData.js';

export class KickOffUI {
  constructor(container, sound, onStartMatch, onBack) {
    this.container = container;
    this.sound = sound;
    this.onStartMatch = onStartMatch;
    this.onBack = onBack;

    this.homeTeamIdx = 0; // Meridian City
    this.awayTeamIdx = 1; // Northstar Athletic
    this.stadiumIdx = 0; // Grand Apex Arena
    this.difficulty = 'standard';
    this.duration = 4; // minutes
    this.homeKitType = 'home';
    this.awayKitType = 'away';

    this.currentStep = 'setup'; // 'setup', 'walkout'
    this.build();
  }

  build() {
    this.container.innerHTML = `
      <div class="kickoff-screen">
        <header class="kickoff-topbar">
          <div class="brand-pill">
            <span class="crest-icon">⚽</span>
            <span>MATCHDAY // KICK OFF EXHIBITION</span>
          </div>
          <button class="fc-btn secondary" id="kickoffBackBtn">BACK TO MENU <span>✕</span></button>
        </header>

        <main class="kickoff-stage" id="kickoffStage">
          <!-- Populated by renderSetup() or renderWalkout() -->
        </main>
      </div>
    `;

    document.getElementById('kickoffBackBtn').onclick = () => {
      this.sound.playUIClick();
      if (this.onBack) this.onBack();
    };

    this.renderSetup();
  }

  renderSetup() {
    this.currentStep = 'setup';
    const stage = document.getElementById('kickoffStage');
    const home = TEAMS[this.homeTeamIdx];
    const away = TEAMS[this.awayTeamIdx];
    const stadium = STADIUMS[this.stadiumIdx];

    stage.innerHTML = `
      <div class="setup-layout">
        <!-- Team Matchup Display -->
        <div class="matchup-selector-row">
          <!-- Home Club Card -->
          <div class="club-select-card home-card">
            <div class="card-tag">HOME CLUB</div>
            <div class="club-hero">
              <span class="big-club-crest" style="background:${home.primaryColor}">${home.shortName}</span>
              <h2>${home.name}</h2>
              <div class="stars-gold">★★★★★ <small>${home.overallRating} OVR</small></div>
            </div>
            <div class="team-stat-bars">
              <div class="stat-row"><small>ATTACK</small><strong>${home.attackRating}</strong></div>
              <div class="stat-row"><small>MIDFIELD</small><strong>${home.midfieldRating}</strong></div>
              <div class="stat-row"><small>DEFENSE</small><strong>${home.defenseRating}</strong></div>
            </div>
            <div class="team-cycler">
              <button class="cycler-btn" id="prevHomeClub">◀</button>
              <span>CHANGE CLUB</span>
              <button class="cycler-btn" id="nextHomeClub">▶</button>
            </div>
          </div>

          <div class="vs-divider">
            <span class="vs-text">VS</span>
            <span class="stadium-badge">${stadium.name}</span>
          </div>

          <!-- Away Club Card -->
          <div class="club-select-card away-card">
            <div class="card-tag">AWAY CLUB</div>
            <div class="club-hero">
              <span class="big-club-crest" style="background:${away.primaryColor}">${away.shortName}</span>
              <h2>${away.name}</h2>
              <div class="stars-gold">★★★★★ <small>${away.overallRating} OVR</small></div>
            </div>
            <div class="team-stat-bars">
              <div class="stat-row"><small>ATTACK</small><strong>${away.attackRating}</strong></div>
              <div class="stat-row"><small>MIDFIELD</small><strong>${away.midfieldRating}</strong></div>
              <div class="stat-row"><small>DEFENSE</small><strong>${away.defenseRating}</strong></div>
            </div>
            <div class="team-cycler">
              <button class="cycler-btn" id="prevAwayClub">◀</button>
              <span>CHANGE CLUB</span>
              <button class="cycler-btn" id="nextAwayClub">▶</button>
            </div>
          </div>
        </div>

        <!-- Match Options Bar -->
        <div class="match-options-bar">
          <div class="opt-group">
            <label>STADIUM</label>
            <select id="selectStadium">
              ${STADIUMS.map((s, i) => `<option value="${i}" ${i === this.stadiumIdx ? 'selected' : ''}>${s.name} (${s.city})</option>`).join('')}
            </select>
          </div>

          <div class="opt-group">
            <label>DIFFICULTY</label>
            <select id="selectDifficulty">
              <option value="amateur" ${this.difficulty === 'amateur' ? 'selected' : ''}>AMATEUR</option>
              <option value="standard" ${this.difficulty === 'standard' ? 'selected' : ''}>PROFESSIONAL</option>
              <option value="legendary" ${this.difficulty === 'legendary' ? 'selected' : ''}>LEGENDARY</option>
            </select>
          </div>

          <div class="opt-group">
            <label>HALF LENGTH</label>
            <select id="selectDuration">
              <option value="2" ${this.duration === 2 ? 'selected' : ''}>2 MINUTES</option>
              <option value="4" ${this.duration === 4 ? 'selected' : ''}>4 MINUTES</option>
              <option value="6" ${this.duration === 6 ? 'selected' : ''}>6 MINUTES</option>
            </select>
          </div>

          <button class="fc-btn primary" id="btnGoToLineup">PROCEED TO LINEUPS <span>▶</span></button>
        </div>
      </div>
    `;

    // Event bindings
    document.getElementById('prevHomeClub').onclick = () => {
      this.sound.playUIClick();
      this.homeTeamIdx = (this.homeTeamIdx - 1 + TEAMS.length) % TEAMS.length;
      if (this.homeTeamIdx === this.awayTeamIdx) this.homeTeamIdx = (this.homeTeamIdx - 1 + TEAMS.length) % TEAMS.length;
      this.renderSetup();
    };

    document.getElementById('nextHomeClub').onclick = () => {
      this.sound.playUIClick();
      this.homeTeamIdx = (this.homeTeamIdx + 1) % TEAMS.length;
      if (this.homeTeamIdx === this.awayTeamIdx) this.homeTeamIdx = (this.homeTeamIdx + 1) % TEAMS.length;
      this.renderSetup();
    };

    document.getElementById('prevAwayClub').onclick = () => {
      this.sound.playUIClick();
      this.awayTeamIdx = (this.awayTeamIdx - 1 + TEAMS.length) % TEAMS.length;
      if (this.awayTeamIdx === this.homeTeamIdx) this.awayTeamIdx = (this.awayTeamIdx - 1 + TEAMS.length) % TEAMS.length;
      this.renderSetup();
    };

    document.getElementById('nextAwayClub').onclick = () => {
      this.sound.playUIClick();
      this.awayTeamIdx = (this.awayTeamIdx + 1) % TEAMS.length;
      if (this.awayTeamIdx === this.homeTeamIdx) this.awayTeamIdx = (this.awayTeamIdx + 1) % TEAMS.length;
      this.renderSetup();
    };

    document.getElementById('selectStadium').onchange = (e) => {
      this.sound.playUISelect();
      this.stadiumIdx = parseInt(e.target.value, 10);
    };

    document.getElementById('selectDifficulty').onchange = (e) => {
      this.sound.playUISelect();
      this.difficulty = e.target.value;
    };

    document.getElementById('selectDuration').onchange = (e) => {
      this.sound.playUISelect();
      this.duration = parseInt(e.target.value, 10);
    };

    document.getElementById('btnGoToLineup').onclick = () => {
      this.sound.playUISelect();
      this.renderWalkout();
    };
  }

  renderWalkout() {
    this.currentStep = 'walkout';
    const stage = document.getElementById('kickoffStage');
    const home = TEAMS[this.homeTeamIdx];
    const away = TEAMS[this.awayTeamIdx];
    const stadium = STADIUMS[this.stadiumIdx];

    stage.innerHTML = `
      <div class="lineup-presentation-layout">
        <div class="lineup-top-header">
          <div>
            <div class="lineup-eyebrow"><span class="pulse-dot"></span> LIVE FROM ${stadium.name.toUpperCase()} · 20:45</div>
            <h2>STARTING ELEVEN <em>PRESENTATION</em></h2>
          </div>
          <button class="fc-btn secondary" id="btnBackToSetup">CHANGE SETUP <span>◀</span></button>
        </div>

        <div class="lineup-columns-wrap">
          <!-- Home Lineup Sheet -->
          <div class="squad-sheet-card">
            <div class="sheet-header" style="border-bottom: 3px solid ${home.primaryColor}">
              <span class="sheet-badge" style="background:${home.primaryColor}">${home.shortName}</span>
              <div>
                <strong>${home.name}</strong>
                <small>4-3-3 ATTACK · MGR: ${home.manager}</small>
              </div>
            </div>
            <div class="player-roster-list">
              ${home.roster.slice(0, 11).map(p => `
                <div class="roster-row">
                  <span class="p-num">${p.num}</span>
                  <span class="p-role">${p.role}</span>
                  <span class="p-name">${p.name} ${p.isCaptain ? '(C)' : ''}</span>
                  <span class="p-ovr">${p.ovr}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Walkout Center Card -->
          <div class="walkout-center-card">
            <div class="match-walkout-emblem">FC 27</div>
            <div class="officials-pill">MATCH REFEREE: K. MORENO (ESP)</div>
            <p>The players stand ready in the tunnel. Floodlights ignite the stadium.</p>
            <button class="fc-btn primary big-kickoff-btn" id="btnLaunchMatch">
              KICK OFF MATCH <span>▶</span>
            </button>
          </div>

          <!-- Away Lineup Sheet -->
          <div class="squad-sheet-card">
            <div class="sheet-header" style="border-bottom: 3px solid ${away.primaryColor}">
              <span class="sheet-badge" style="background:${away.primaryColor}">${away.shortName}</span>
              <div>
                <strong>${away.name}</strong>
                <small>4-3-3 ATTACK · MGR: ${away.manager}</small>
              </div>
            </div>
            <div class="player-roster-list">
              ${away.roster.slice(0, 11).map(p => `
                <div class="roster-row">
                  <span class="p-num">${p.num}</span>
                  <span class="p-role">${p.role}</span>
                  <span class="p-name">${p.name} ${p.isCaptain ? '(C)' : ''}</span>
                  <span class="p-ovr">${p.ovr}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btnBackToSetup').onclick = () => {
      this.sound.playUIClick();
      this.renderSetup();
    };

    document.getElementById('btnLaunchMatch').onclick = () => {
      this.sound.playWhistle('short');
      if (this.onStartMatch) {
        this.onStartMatch(home, away, {
          stadium,
          difficulty: this.difficulty,
          duration: this.duration
        });
      }
    };
  }
}

