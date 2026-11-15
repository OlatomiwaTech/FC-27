/**
 * FC 27 - Tournament Mode & Championship Bracket Engine
 * Supports 8-team knockout bracket tree (Quarter-Finals, Semi-Finals, Grand Final),
 * match simulations, player participation, and the Championship Trophy ceremony.
 */

import { TEAMS } from '../data/TeamsData.js';

export class TournamentUI {
  constructor(container, sound, onStartMatch, onBack) {
    this.container = container;
    this.sound = sound;
    this.onStartMatch = onStartMatch;
    this.onBack = onBack;

    this.tournamentName = 'CONTINENTAL CHAMPIONS CUP';
    this.currentRound = 'Quarter-Finals';

    this.bracket = {
      qf: [
        { id: 1, home: TEAMS[0], away: TEAMS[7], scoreHome: null, scoreAway: null, winner: null }, // Meridian vs Rio
        { id: 2, home: TEAMS[2], away: TEAMS[4], scoreHome: null, scoreAway: null, winner: null }, // Apex vs Tokyo
        { id: 3, home: TEAMS[1], away: TEAMS[3], scoreHome: null, scoreAway: null, winner: null }, // Northstar vs Bayern
        { id: 4, home: TEAMS[5], away: TEAMS[6], scoreHome: null, scoreAway: null, winner: null }
      ],
      sf: [
        { id: 5, home: null, away: null, scoreHome: null, scoreAway: null, winner: null },
        { id: 6, home: null, away: null, scoreHome: null, scoreAway: null, winner: null }
      ],
      final: { id: 7, home: null, away: null, scoreHome: null, scoreAway: null, winner: null }
    };

    this.build();
  }

  build() {
    this.container.innerHTML = `
      <div class="tournament-screen">
        <header class="tourn-topbar">
          <div class="tourn-title">
            <span class="trophy-icon">🏆</span>
            <div>
              <h2>${this.tournamentName}</h2>
              <small>ROAD TO GLORY // KNOCKOUT BRACKET</small>
            </div>
          </div>
          <button class="fc-btn secondary" id="tournExitBtn">EXIT TO MENU <span>✕</span></button>
        </header>

        <main class="bracket-stage" id="bracketStage">
          <!-- Populated by renderBracket() -->
        </main>
      </div>
    `;

    document.getElementById('tournExitBtn').onclick = () => {
      this.sound.playUIClick();
      if (this.onBack) this.onBack();
    };

    this.renderBracket();
  }

  renderBracket() {
    const stage = document.getElementById('bracketStage');
    stage.innerHTML = `
      <div class="bracket-grid">
        <!-- Quarter Finals Column -->
        <div class="bracket-col">
          <div class="col-header">QUARTER-FINALS</div>
          <div class="fixture-stack">
            ${this.bracket.qf.map((m, i) => this.renderMatchCard(m, 'qf', i)).join('')}
          </div>
        </div>

        <!-- Semi Finals Column -->
        <div class="bracket-col">
          <div class="col-header">SEMI-FINALS</div>
          <div class="fixture-stack">
            ${this.bracket.sf.map((m, i) => this.renderMatchCard(m, 'sf', i)).join('')}
          </div>
        </div>

        <!-- Grand Final Column -->
        <div class="bracket-col final-col">
          <div class="col-header">GRAND FINAL</div>
          <div class="fixture-stack">
            ${this.renderMatchCard(this.bracket.final, 'final', 0)}
          </div>
          <div class="trophy-pedestal">
            <div class="trophy-glow"></div>
            <div class="big-trophy">🏆</div>
            <strong>THE CHAMPIONS TROPHY</strong>
          </div>
        </div>
      </div>
    `;

    this.bindMatchActions();
  }

  renderMatchCard(match, round, index) {
    const isReady = match.home && match.away;
    const isCompleted = match.winner !== null;

    return `
      <div class="tourn-match-card ${isCompleted ? 'completed' : ''}" data-round="${round}" data-idx="${index}">
        <div class="match-team-row ${(match.winner === match.home && isCompleted) ? 'winner' : ''}">
          <span class="m-crest">${match.home ? match.home.shortName : 'TBD'}</span>
          <span class="m-name">${match.home ? match.home.name : 'To Be Decided'}</span>
          <span class="m-score">${match.scoreHome !== null ? match.scoreHome : '-'}</span>
        </div>
        <div class="match-team-row ${(match.winner === match.away && isCompleted) ? 'winner' : ''}">
          <span class="m-crest">${match.away ? match.away.shortName : 'TBD'}</span>
          <span class="m-name">${match.away ? match.away.name : 'To Be Decided'}</span>
          <span class="m-score">${match.scoreAway !== null ? match.scoreAway : '-'}</span>
        </div>
        ${isReady && !isCompleted ? `
          <div class="match-action-btns">
            <button class="fc-btn primary btn-play-bracket" data-round="${round}" data-idx="${index}">PLAY <span>▶</span></button>
            <button class="fc-btn secondary btn-sim-bracket" data-round="${round}" data-idx="${index}">SIM <span>⚡</span></button>
          </div>
        ` : ''}
      </div>
    `;
  }

  bindMatchActions() {
    this.container.querySelectorAll('.btn-play-bracket').forEach(btn => {
      btn.onclick = () => {
        this.sound.playUISelect();
        const round = btn.dataset.round;
        const idx = parseInt(btn.dataset.idx, 10);
        const match = (round === 'qf') ? this.bracket.qf[idx] :
                      (round === 'sf') ? this.bracket.sf[idx] : this.bracket.final;

        if (this.onStartMatch) {
          this.onStartMatch(match.home, match.away);
        }
      };
    });

    this.container.querySelectorAll('.btn-sim-bracket').forEach(btn => {
      btn.onclick = () => {
        this.sound.playWhistle('short');
        const round = btn.dataset.round;
        const idx = parseInt(btn.dataset.idx, 10);
        this.simulateMatch(round, idx);
      };
    });
  }

  simulateMatch(round, idx) {
    const match = (round === 'qf') ? this.bracket.qf[idx] :
                  (round === 'sf') ? this.bracket.sf[idx] : this.bracket.final;

    const hScore = Math.floor(Math.random() * 4);
    let aScore = Math.floor(Math.random() * 4);
    if (hScore === aScore) aScore++; // guarantee winner in knockout

    match.scoreHome = hScore;
    match.scoreAway = aScore;
    match.winner = (hScore > aScore) ? match.home : match.away;

    // Advance to next round
    if (round === 'qf') {
      const sfIdx = Math.floor(idx / 2);
      if (idx % 2 === 0) this.bracket.sf[sfIdx].home = match.winner;
      else this.bracket.sf[sfIdx].away = match.winner;
    } else if (round === 'sf') {
      if (idx === 0) this.bracket.final.home = match.winner;
      else this.bracket.final.away = match.winner;
    } else if (round === 'final') {
      this.sound.playGoalCheer();
      alert(`CHAMPIONS! ${match.winner.name.toUpperCase()} LIFT THE CONTINENTAL TROPHY!`);
    }

    this.renderBracket();
  }
}
