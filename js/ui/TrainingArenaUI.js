/**
 * FC 27 - Training Arena & Skill Practice Drills
 * Supports 1-on-1 Practice, Free Kick Challenge with curved trajectory,
 * and Penalty Shootout mode against the AI Goalkeeper.
 */

import { TEAMS } from '../data/TeamsData.js';

export class TrainingArenaUI {
  constructor(container, sound, onStartPractice, onBack) {
    this.container = container;
    this.sound = sound;
    this.onStartPractice = onStartPractice;
    this.onBack = onBack;

    this.selectedMode = '1v1'; // '1v1', 'free_kick', 'penalty'
    this.build();
  }

  build() {
    this.container.innerHTML = `
      <div class="training-screen">
        <header class="training-topbar">
          <div class="train-title">
            <span class="train-badge">⚡</span>
            <div>
              <h2>THE TRAINING ARENA</h2>
              <small>REFINE YOUR TECHNIQUE // DRILLS & PRACTICE</small>
            </div>
          </div>
          <button class="fc-btn secondary" id="trainExitBtn">EXIT ARENA <span>✕</span></button>
        </header>

        <main class="training-grid">
          <!-- Mode 1: 1-on-1 Free Practice -->
          <div class="train-card" data-mode="1v1">
            <div class="train-card-hero practice-hero">
              <span class="mode-tag">OPEN PITCH</span>
              <div class="train-card-icon">⚽</div>
            </div>
            <div class="train-card-body">
              <h3>1-ON-1 WITH THE KEEPER</h3>
              <p>Step onto the pitch with your star forward. Dribble anywhere, take long shots, and test your finishing in an open arena.</p>
              <button class="fc-btn primary btn-launch-drill" data-mode="1v1">START PRACTICE <span>▶</span></button>
            </div>
          </div>

          <!-- Mode 2: Free Kick Challenge -->
          <div class="train-card" data-mode="free_kick">
            <div class="train-card-hero freekick-hero">
              <span class="mode-tag">SET PIECE</span>
              <div class="train-card-icon">🎯</div>
            </div>
            <div class="train-card-body">
              <h3>FREE KICK MASTERY</h3>
              <p>Place the ball from 22 to 30 meters out. Curl the ball around the 4-man defensive wall into the top corner netting.</p>
              <button class="fc-btn primary btn-launch-drill" data-mode="free_kick">START DRILL <span>▶</span></button>
            </div>
          </div>

          <!-- Mode 3: Penalty Shootout -->
          <div class="train-card" data-mode="penalty">
            <div class="train-card-hero penalty-hero">
              <span class="mode-tag">HIGH PRESSURE</span>
              <div class="train-card-icon">🥅</div>
            </div>
            <div class="train-card-body">
              <h3>PENALTY SHOOTOUT</h3>
              <p>The ultimate 12-yard psychological duel. Time your shot power, pick your corner, and beat the diving keeper.</p>
              <button class="fc-btn primary btn-launch-drill" data-mode="penalty">START SHOOTOUT <span>▶</span></button>
            </div>
          </div>
        </main>
      </div>
    `;

    document.getElementById('trainExitBtn').onclick = () => {
      this.sound.playUIClick();
      if (this.onBack) this.onBack();
    };

    this.container.querySelectorAll('.btn-launch-drill').forEach(btn => {
      btn.onclick = () => {
        this.sound.playUISelect();
        const mode = btn.dataset.mode;
        if (this.onStartPractice) {
          this.onStartPractice(mode, TEAMS[0]);
        }
      };
    });
  }
}

