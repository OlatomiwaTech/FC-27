/**
 * FC 27 - Interactive Squad Builder & Tactical Management (FUT Style)
 * Faithful to AAA UI: Top navigation bar, tactical pitch board with starting XI cards,
 * chemistry calculations, formation switching, bench swaps, and detailed player stat cards.
 */

import { TEAMS, FORMATIONS } from '../data/TeamsData.js';

export class SquadBuilderUI {
  constructor(container, sound, onBack) {
    this.container = container;
    this.sound = sound;
    this.onBack = onBack;

    this.currentTeam = TEAMS[0]; // Meridian City default
    this.currentFormation = '4-3-3';
    this.selectedPlayerIndex = null;
    this.activeTab = 'squad';

    this.build();
  }

  build() {
    this.container.innerHTML = `
      <div class="squad-builder-screen">
        <!-- EA Sports FC Style Top Bar -->
        <header class="fut-topbar">
          <div class="fut-brand">
            <span class="fut-logo">FC<b>27</b></span>
            <span class="fut-section-title">ULTIMATE SQUAD // TACTICS</span>
          </div>
          <nav class="fut-nav-tabs">
            <button class="nav-tab" data-tab="home">HOME</button>
            <button class="nav-tab active" data-tab="squad">SQUAD</button>
            <button class="nav-tab" data-tab="tactics">TACTICS</button>
            <button class="nav-tab" data-tab="transfers">TRANSFERS</button>
            <button class="nav-tab" data-tab="club">CLUB</button>
          </nav>
          <div class="fut-currency">
            <div class="curr-item"><span class="curr-icon gold">◆</span> <b>185,760</b> <small>COINS</small></div>
            <div class="curr-item"><span class="curr-icon volt">▲</span> <b>2,400</b> <small>FC POINTS</small></div>
            <button class="fut-back-btn" id="squadBackBtn">EXIT <span>✕</span></button>
          </div>
        </header>

        <!-- Main Body: Pitch & Squad Overview -->
        <div class="fut-main-content">
          <!-- Left: Tactical Pitch Board -->
          <div class="tactical-pitch-container">
            <div class="squad-header-bar">
              <div class="club-badge-title">
                <span class="club-crest-pill">${this.currentTeam.shortName}</span>
                <div>
                  <h2 id="squadClubName">${this.currentTeam.name}</h2>
                  <div class="stars-row">★★★★★ <span class="rating-text">Rating: <b>${this.currentTeam.overallRating}</b></span></div>
                </div>
              </div>
              <div class="squad-metrics">
                <div class="metric-pill">
                  <small>CHEMISTRY</small>
                  <strong>33 / 33</strong>
                  <div class="chem-meter"><span style="width: 100%;"></span></div>
                </div>
                <div class="formation-selector-wrap">
                  <label>FORMATION</label>
                  <select id="formationSelect">
                    <option value="4-3-3" ${this.currentFormation === '4-3-3' ? 'selected' : ''}>4-3-3 ATTACK</option>
                    <option value="4-2-3-1" ${this.currentFormation === '4-2-3-1' ? 'selected' : ''}>4-2-3-1 BALANCED</option>
                    <option value="4-4-2" ${this.currentFormation === '4-4-2' ? 'selected' : ''}>4-4-2 CLASSIC</option>
                    <option value="3-5-2" ${this.currentFormation === '3-5-2' ? 'selected' : ''}>3-5-2 WINGBACKS</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 2D Tactical Pitch with Cards -->
            <div class="pitch-tactics-board" id="pitchBoard">
              <div class="pitch-marking halfway"></div>
              <div class="pitch-marking center-circle"></div>
              <div class="pitch-marking pen-box top"></div>
              <div class="pitch-marking pen-box bottom"></div>
              <!-- Cards dynamically inserted here -->
              <div class="pitch-cards-layer" id="pitchCardsLayer"></div>
            </div>
          </div>

          <!-- Right: Bench & Player Card Details Sidebar -->
          <div class="squad-sidebar">
            <!-- Active Selected Player Detail Card -->
            <div class="player-inspect-card" id="playerInspectCard">
              <!-- Dynamically populated -->
            </div>

            <!-- Substitutes / Reserves Bench -->
            <div class="bench-section">
              <div class="bench-title">
                <span>SUBSTITUTES</span>
                <small>CLICK TO SWAP</small>
              </div>
              <div class="bench-list" id="benchList">
                <!-- Bench player pills -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderPitchCards();
    this.renderBench();
    this.inspectPlayer(this.currentTeam.roster[7]); // Jin Okoro
  }

  bindEvents() {
    document.getElementById('squadBackBtn').onclick = () => {
      this.sound.playUIClick();
      if (this.onBack) this.onBack();
    };

    document.getElementById('formationSelect').onchange = (e) => {
      this.sound.playUISelect();
      this.currentFormation = e.target.value;
      this.renderPitchCards();
    };

    this.container.querySelectorAll('.nav-tab').forEach(tab => {
      tab.onclick = () => {
        this.sound.playUIClick();
        this.container.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeTab = tab.dataset.tab;
      };
    });
  }

  renderPitchCards() {
    const layer = document.getElementById('pitchCardsLayer');
    layer.innerHTML = '';

    const formationData = FORMATIONS[this.currentFormation] || FORMATIONS['4-3-3'];
    const startingXI = this.currentTeam.roster.slice(0, 11);

    formationData.home.forEach((slot, index) => {
      const player = startingXI[index] || this.currentTeam.roster[0];

      // Convert 0..105, 0..68 coordinate into percentage on vertical pitch
      // slot.pos[0] (0..105): 0 is GK (bottom of tactical board), 105 is ST (top)
      const topPct = 90 - (slot.pos[0] / 52.5) * 44; // keep inside tactical board
      const leftPct = (slot.pos[1] / 68) * 82 + 9;

      const card = document.createElement('div');
      card.className = `fut-player-card ${player.ovr >= 90 ? 'gold-special' : 'gold-standard'}`;
      card.style.top = `${topPct}%`;
      card.style.left = `${leftPct}%`;
      card.innerHTML = `
        <div class="card-ovr">${player.ovr}</div>
        <div class="card-pos">${slot.role}</div>
        <div class="card-avatar-circle">${player.name.charAt(0)}</div>
        <div class="card-name">${player.name.split(' ').pop()}</div>
        <div class="card-chem-dots">●●●</div>
      `;

      card.onclick = () => {
        this.sound.playUIClick();
        this.selectedPlayerIndex = index;
        this.inspectPlayer(player);

        // Highlight card
        layer.querySelectorAll('.fut-player-card').forEach(c => c.classList.remove('card-selected'));
        card.classList.add('card-selected');
      };

      layer.appendChild(card);
    });
  }

  renderBench() {
    const benchContainer = document.getElementById('benchList');
    benchContainer.innerHTML = '';

    this.currentTeam.subs.forEach((sub, subIdx) => {
      const item = document.createElement('div');
      item.className = 'bench-item';
      item.innerHTML = `
        <span class="bench-ovr">${sub.ovr}</span>
        <span class="bench-role">${sub.role}</span>
        <span class="bench-name">${sub.name}</span>
        <button class="bench-swap-btn">SWAP</button>
      `;

      item.onclick = () => {
        this.sound.playUISelect();
        if (this.selectedPlayerIndex !== null) {
          // Perform swap between selected starter and this bench player
          const temp = this.currentTeam.roster[this.selectedPlayerIndex];
          this.currentTeam.roster[this.selectedPlayerIndex] = sub;
          this.currentTeam.subs[subIdx] = temp;

          this.renderPitchCards();
          this.renderBench();
          this.inspectPlayer(sub);
        } else {
          this.inspectPlayer(sub);
        }
      };

      benchContainer.appendChild(item);
    });
  }

  inspectPlayer(player) {
    const container = document.getElementById('playerInspectCard');
    container.innerHTML = `
      <div class="fut-large-card ${player.ovr >= 90 ? 'glow-toty' : ''}">
        <div class="fut-card-header">
          <div class="card-big-ovr">${player.ovr}</div>
          <div class="card-big-role">${player.role}</div>
          <div class="card-badge">${this.currentTeam.shortName}</div>
        </div>
        <div class="fut-card-hero">
          <div class="card-silhouette">${player.name.split(' ').pop().toUpperCase()}</div>
        </div>
        <div class="fut-card-name">${player.name.toUpperCase()}</div>
        <div class="fut-card-stats-grid">
          <div class="stat-box"><small>PAC</small><b>${player.pac}</b></div>
          <div class="stat-box"><small>SHO</small><b>${player.sho}</b></div>
          <div class="stat-box"><small>PAS</small><b>${player.pas}</b></div>
          <div class="stat-box"><small>DRI</small><b>${player.dri}</b></div>
          <div class="stat-box"><small>DEF</small><b>${player.def}</b></div>
          <div class="stat-box"><small>PHY</small><b>${player.phy}</b></div>
        </div>
        <div class="card-playstyles">
          <span class="playstyle-pill">⚡ RAPID+</span>
          <span class="playstyle-pill">🎯 FINESSE SHOT</span>
          <span class="playstyle-pill">🛡 ANTICIPATE</span>
        </div>
      </div>
    `;
  }
}
