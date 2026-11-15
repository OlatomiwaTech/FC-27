/**
 * FC 27 - Manager Career Mode & Cinematic Signing Presentation
 * Inspired by modern AAA Career presentation (User Image 1):
 * Transfer signing ceremonies, interactive press conferences, board objectives,
 * transfer market negotiations, and season calendar fixtures.
 */

import { TEAMS } from '../data/TeamsData.js';

export class CareerModeUI {
  constructor(container, sound, onStartMatch, onBack) {
    this.container = container;
    this.sound = sound;
    this.onStartMatch = onStartMatch;
    this.onBack = onBack;

    this.currentClub = TEAMS[0]; // Meridian City
    this.managerName = 'Antonio Serrano';
    this.budget = 118500000;
    this.boardConfidence = 88;
    this.teamMorale = 92;
    this.currentView = 'hub'; // 'hub', 'signing', 'press_conference', 'transfers'

    this.signedPlayer = {
      name: 'Torin Havel',
      from: 'Northstar Athletic',
      fee: '€78,500,000',
      role: 'ST',
      ovr: 93,
      wage: '€240,000 / wk'
    };

    this.build();
  }

  build() {
    this.container.innerHTML = `
      <div class="career-screen">
        <!-- Top Career Header -->
        <header class="career-topbar">
          <div class="career-manager-info">
            <span class="club-crest-small">${this.currentClub.shortName}</span>
            <div>
              <div class="manager-title">${this.currentClub.name.toUpperCase()} // MANAGER CAREER</div>
              <small>Manager: <b>${this.managerName}</b> · Season 2026/27</small>
            </div>
          </div>
          <div class="career-status-pills">
            <div class="status-pill">
              <small>TRANSFER BUDGET</small>
              <strong id="careerBudget">€${(this.budget / 1000000).toFixed(1)}M</strong>
            </div>
            <div class="status-pill">
              <small>BOARD CONFIDENCE</small>
              <strong class="text-volt" id="careerConfidence">${this.boardConfidence}%</strong>
            </div>
            <div class="status-pill">
              <small>TEAM MORALE</small>
              <strong class="text-cyan" id="careerMorale">${this.teamMorale}%</strong>
            </div>
          </div>
          <button class="fc-btn secondary" id="careerExitBtn">EXIT CAREER <span>✕</span></button>
        </header>

        <!-- View Body -->
        <main class="career-main" id="careerMainBody">
          <!-- Populated by renderView() -->
        </main>
      </div>
    `;

    document.getElementById('careerExitBtn').onclick = () => {
      this.sound.playUIClick();
      if (this.onBack) this.onBack();
    };

    this.renderView('hub');
  }

  renderView(view) {
    this.currentView = view;
    const body = document.getElementById('careerMainBody');

    if (view === 'hub') {
      body.innerHTML = `
        <div class="career-hub-grid">
          <!-- Next Fixture Card -->
          <div class="career-card fixture-card">
            <div class="card-eyebrow"><span class="pulse-dot"></span> NEXT MATCH · PREMIER GLOBAL LEAGUE</div>
            <div class="fixture-matchup">
              <div class="fix-team">
                <span class="fix-crest">${this.currentClub.shortName}</span>
                <b>${this.currentClub.name}</b>
              </div>
              <div class="fix-vs">VS</div>
              <div class="fix-team">
                <span class="fix-crest">APX</span>
                <b>Apex Madrid</b>
              </div>
            </div>
            <div class="fixture-details">
              <span>VENUE: GRAND APEX ARENA</span>
              <span>MATCHDAY 14 · SATURDAY 20:00</span>
            </div>
            <div class="fixture-actions">
              <button class="fc-btn primary" id="btnPlayCareerMatch">PLAY MATCH <span>▶</span></button>
              <button class="fc-btn secondary" id="btnSimCareerMatch">QUICK SIMULATE <span>⚡</span></button>
            </div>
          </div>

          <!-- Signing Announcement Feature (User Image 1) -->
          <div class="career-card signing-feature-card">
            <div class="card-eyebrow">LATEST BLOCKBUSTER SIGNING</div>
            <div class="signing-banner-preview">
              <div class="signing-badge">OFFICIAL DEAL DONE</div>
              <div class="signing-player-info">
                <h3>${this.signedPlayer.name.toUpperCase()}</h3>
                <p>Transfer Fee: <b>${this.signedPlayer.fee}</b> · Rating: <b class="text-volt">${this.signedPlayer.ovr} OVR</b></p>
              </div>
            </div>
            <p>Relive the stadium jersey presentation ceremony and address the international press corps.</p>
            <div class="card-btn-row">
              <button class="fc-btn primary" id="btnViewSigning">SIGNING CEREMONY <span>📸</span></button>
              <button class="fc-btn secondary" id="btnPressConference">PRESS CONFERENCE <span>🎙</span></button>
            </div>
          </div>

          <!-- Board Objectives Card -->
          <div class="career-card objectives-card">
            <div class="card-eyebrow">BOARD OBJECTIVES (CRITICAL)</div>
            <ul class="obj-list">
              <li>
                <div>
                  <strong>Continental Glory</strong>
                  <p>Reach the Champions Cup Semi-Finals</p>
                </div>
                <span class="badge-status in-progress">ON TRACK</span>
              </li>
              <li>
                <div>
                  <strong>Youth Academy Pathway</strong>
                  <p>Play 2 academy graduates in 5 league matches</p>
                </div>
                <span class="badge-status pending">PENDING</span>
              </li>
              <li>
                <div>
                  <strong>Financial Sustainability</strong>
                  <p>Maintain wage budget under €2.2M / week</p>
                </div>
                <span class="badge-status completed">ACHIEVED</span>
              </li>
            </ul>
          </div>
        </div>
      `;

      document.getElementById('btnPlayCareerMatch').onclick = () => {
        this.sound.playUISelect();
        if (this.onStartMatch) {
          this.onStartMatch(this.currentClub, TEAMS[2]); // Apex Madrid
        }
      };

      document.getElementById('btnSimCareerMatch').onclick = () => {
        this.sound.playWhistle('triple');
        alert('Match Simulated: ' + this.currentClub.name + ' 3 — 1 Apex Madrid!\nGoals: Okoro 24\', Wren 67\', Havel 89\'');
      };

      document.getElementById('btnViewSigning').onclick = () => {
        this.sound.playUIClick();
        this.renderView('signing');
      };

      document.getElementById('btnPressConference').onclick = () => {
        this.sound.playUIClick();
        this.renderView('press_conference');
      };
    }

    else if (view === 'signing') {
      // Look at User Image 1: Manager and Player holding shirt at stadium with press flashbulbs!
      body.innerHTML = `
        <div class="career-cutscene-container">
          <div class="cutscene-visual">
            <div class="stadium-sky-backdrop">
              <div class="sky-clouds"></div>
              <div class="stadium-stands-silhouette"></div>
            </div>

            <!-- Authentic Stadium Signing Scene Representation -->
            <div class="signing-actors-scene">
              <!-- Flashbulbs animations -->
              <div class="press-flash flash-1"></div>
              <div class="press-flash flash-2"></div>
              <div class="press-flash flash-3"></div>

              <!-- Manager in tailored suit -->
              <div class="actor manager-actor">
                <div class="actor-head"></div>
                <div class="actor-suit">
                  <div class="tie"></div>
                </div>
              </div>

              <!-- The New Jersey held proudly between them! -->
              <div class="held-kit-container">
                <div class="held-jersey">
                  <div class="jersey-collar"></div>
                  <div class="jersey-crest">${this.currentClub.shortName}</div>
                  <div class="jersey-sponsor">VOLT</div>
                  <div class="jersey-number">${this.signedPlayer.role === 'ST' ? '9' : '10'}</div>
                  <div class="jersey-name">${this.signedPlayer.name.toUpperCase()}</div>
                </div>
              </div>

              <!-- Star Player in sharp black suit -->
              <div class="actor player-actor">
                <div class="actor-head player-head"></div>
                <div class="actor-suit">
                  <div class="tie"></div>
                </div>
              </div>
            </div>

            <div class="cutscene-dialogue-card">
              <div class="press-badge">PRESS UNVEILING // STADIUM PRESENTATION</div>
              <h2>"A NEW ERA BEGINS AT THE CLUB."</h2>
              <p>Manager <b>${this.managerName}</b> unveils marquee signing <b>${this.signedPlayer.name}</b> (${this.signedPlayer.ovr} OVR) in front of the world's sporting media.</p>
              <div class="cutscene-actions">
                <button class="fc-btn primary" id="btnProceedToPress">TAKE PRESS QUESTIONS <span>🎙</span></button>
                <button class="fc-btn secondary" id="btnBackToHub">RETURN TO OFFICE <span>⌂</span></button>
              </div>
            </div>
          </div>
        </div>
      `;

      document.getElementById('btnProceedToPress').onclick = () => {
        this.sound.playUIClick();
        this.renderView('press_conference');
      };

      document.getElementById('btnBackToHub').onclick = () => {
        this.sound.playUIClick();
        this.renderView('hub');
      };
    }

    else if (view === 'press_conference') {
      body.innerHTML = `
        <div class="press-conference-room">
          <div class="press-header">
            <span class="press-live-tag">● LIVE PRESS CONFERENCE</span>
            <h2>POST-SIGNING MEDIA INTERVIEW</h2>
            <p>Journalist: <i>"Manager ${this.managerName}, the fans have high expectations after paying ${this.signedPlayer.fee}. How will ${this.signedPlayer.name} fit into your starting XI?"</i></p>
          </div>

          <div class="press-answers-list">
            <button class="press-option" data-morale="4" data-conf="3">
              <span class="opt-key">A</span>
              <div>
                <strong>"He is world class. He will lead our attack and transform our title challenge."</strong>
                <small>Impact: +4% Team Morale, +3% Fan Hype</small>
              </div>
            </button>

            <button class="press-option" data-morale="2" data-conf="5">
              <span class="opt-key">B</span>
              <div>
                <strong>"He earns his spot like everyone else. We win as a cohesive squad, not individuals."</strong>
                <small>Impact: +5% Board Confidence, Balanced Dressing Room</small>
              </div>
            </button>

            <button class="press-option" data-morale="5" data-conf="1">
              <span class="opt-key">C</span>
              <div>
                <strong>"We're going to play breathtaking attacking football and bring trophies to this stadium."</strong>
                <small>Impact: Maximum Fan Excitement, Increased Expectation</small>
              </div>
            </button>
          </div>

          <div class="press-footer">
            <button class="fc-btn secondary" id="btnFinishPress">CONCLUDE PRESS CONFERENCE <span>✓</span></button>
          </div>
        </div>
      `;

      body.querySelectorAll('.press-option').forEach(btn => {
        btn.onclick = () => {
          this.sound.playUISelect();
          const moraleBonus = parseInt(btn.dataset.morale || '3', 10);
          const confBonus = parseInt(btn.dataset.conf || '3', 10);
          this.teamMorale = Math.min(100, this.teamMorale + moraleBonus);
          this.boardConfidence = Math.min(100, this.boardConfidence + confBonus);

          document.getElementById('careerMorale').textContent = `${this.teamMorale}%`;
          document.getElementById('careerConfidence').textContent = `${this.boardConfidence}%`;

          btn.classList.add('selected');
          setTimeout(() => this.renderView('hub'), 800);
        };
      });

      document.getElementById('btnFinishPress').onclick = () => {
        this.sound.playUIClick();
        this.renderView('hub');
      };
    }
  }
}

