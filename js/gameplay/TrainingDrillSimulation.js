/**
 * FC 27 - Specialized Training Drills Engine
 * Implements dedicated mechanics for:
 * 1. Free Kick Mastery (defensive wall, curl trajectory, target rings, jumping wall)
 * 2. Penalty Shootout Duel (penalty spot, pressure reticle, goalkeeper dive anticipation, best-of-5)
 * 3. 1v1 Practice Arena (goalkeeper rush-out, chip shots, finesse finishes)
 */

import { Player3D } from '../graphics/Player3D.js';
import { Ball3D } from '../graphics/Ball3D.js';

export class TrainingDrillSimulation {
  constructor(scene, soundSystem, mode = 'free_kick', userTeam, oppTeam) {
    this.scene = scene;
    this.sound = soundSystem;
    this.mode = mode; // 'free_kick', 'penalty', '1v1'
    this.userTeam = userTeam;
    this.oppTeam = oppTeam;

    // Entities
    this.ball = new Ball3D(this.scene);
    this.striker = null;
    this.goalkeeper = null;
    this.wallPlayers = [];
    this.targetRings = [];

    // Free Kick & Penalty Mechanics
    this.targetAim = new THREE.Vector3(52.5, 1.8, 1.5); // inside goal
    this.curlAmount = 0; // -1 to +1 (bend left or right)
    this.isAiming = true;
    this.shotCharged = 0;
    this.charging = false;

    // Scoring & Rounds
    this.score = 0;
    this.attempts = 0;
    this.goalsScored = 0;
    this.penaltyRound = 0;
    this.penaltyResults = []; // true/false

    // Callbacks
    this.onDrillUpdate = null;
    this.onDrillEvent = null;

    this.initDrill();
  }

  initDrill() {
    // Clear existing
    if (this.striker) this.striker.dispose();
    if (this.goalkeeper) this.goalkeeper.dispose();
    this.wallPlayers.forEach(p => p.dispose());
    this.wallPlayers = [];
    this.targetRings.forEach(r => this.scene.remove(r));
    this.targetRings = [];

    // Striker (Home star forward/CAM)
    const strikerInfo = this.userTeam.roster.find(p => p.num === 10) || this.userTeam.roster[10];
    this.striker = new Player3D(this.scene, strikerInfo, this.userTeam.homeKit, false);
    this.striker.setSelected(true);

    // Goalkeeper (Away GK)
    const gkInfo = this.oppTeam.roster[0];
    this.goalkeeper = new Player3D(this.scene, gkInfo, this.oppTeam.gkKit || this.oppTeam.awayKit, true);

    if (this.mode === 'free_kick') {
      this.setupFreeKick();
    } else if (this.mode === 'penalty') {
      this.setupPenalty();
    } else {
      this.setup1v1();
    }
  }

  setupFreeKick() {
    this.isAiming = true;
    this.shotCharged = 0;
    this.curlAmount = 0.45; // default subtle inside bend

    // Ball 24m out from goal (X = 52.5 - 24 = 28.5)
    this.ball.position.set(28.5, this.ball.radius, 5.0);
    this.ball.velocity.set(0, 0, 0);
    this.ball.owner = null;

    // Striker run-up position
    this.striker.position.set(26.5, 0, 6.2);
    this.striker.rotation = Math.PI / 2 - 0.2;

    // Goalkeeper on goal line
    this.goalkeeper.position.set(51.5, 0, -1.2);
    this.goalkeeper.rotation = -Math.PI / 2;

    // 4-Man Defensive Wall at 9.15m (X = 37.65)
    [-1.2, -0.4, 0.4, 1.2].forEach((offsetZ, i) => {
      const oppPlayerInfo = this.oppTeam.roster[i + 2] || this.oppTeam.roster[1];
      const wallP = new Player3D(this.scene, oppPlayerInfo, this.oppTeam.awayKit, false);
      wallP.position.set(37.65, 0, 4.2 + offsetZ);
      wallP.rotation = -Math.PI / 2;
      this.wallPlayers.push(wallP);
    });

    // 3D Target Bullseye Rings in top corners of the goal
    this.createTargetRings();

    this.notify('FREE KICK DRILL · AIM AT THE TOP CORNERS');
  }

  createTargetRings() {
    // Left top corner target & Right top corner target
    const targetPositions = [
      [52.4, 2.0, -2.6], // Top Left
      [52.4, 2.0, 2.6]   // Top Right
    ];

    targetPositions.forEach(([x, y, z]) => {
      const ringGeo = new THREE.TorusGeometry(0.42, 0.05, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff87 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(x, y, z);
      ringMesh.rotation.y = Math.PI / 2;
      this.scene.add(ringMesh);
      this.targetRings.push(ringMesh);
    });
  }

  setupPenalty() {
    this.isAiming = true;
    this.shotCharged = 0;

    // Penalty Spot: 11m from goal (X = 52.5 - 11 = 41.5, Z = 0)
    this.ball.position.set(41.5, this.ball.radius, 0);
    this.ball.velocity.set(0, 0, 0);
    this.ball.owner = null;

    // Striker
    this.striker.position.set(39.5, 0, 0);
    this.striker.rotation = Math.PI / 2;

    // Goalkeeper
    this.goalkeeper.position.set(51.8, 0, 0);
    this.goalkeeper.rotation = -Math.PI / 2;

    this.notify(`PENALTY SHOOTOUT · ROUND ${this.penaltyRound + 1} OF 5`);
  }

  setup1v1() {
    this.isAiming = false;

    // Ball at midfield
    this.ball.position.set(22.0, this.ball.radius, 0);
    this.ball.velocity.set(0, 0, 0);
    this.ball.owner = this.striker;

    this.striker.position.set(22.0, 0, 0);
    this.striker.rotation = Math.PI / 2;

    this.goalkeeper.position.set(50.5, 0, 0);
    this.goalkeeper.rotation = -Math.PI / 2;

    this.notify('1-ON-1 PRACTICE · DRIBBLE & TAKE YOUR CHANCE');
  }

  adjustAim(dx, dy) {
    if (!this.isAiming) return;
    this.targetAim.z = Math.max(-3.4, Math.min(3.4, this.targetAim.z + dx));
    this.targetAim.y = Math.max(0.4, Math.min(2.35, this.targetAim.y + dy));
  }

  setShotCharging(charging) {
    if (!this.isAiming) return;
    this.charging = charging;
  }

  strikeFreeKick(power, curl = 0.5) {
    if (!this.isAiming) return;
    this.isAiming = false;
    this.attempts++;

    this.striker.triggerKick();
    this.sound.playKick(power);

    // Wall jumps!
    this.wallPlayers.forEach(p => {
      p.bodyGroup.position.y = 0.65;
      setTimeout(() => { p.bodyGroup.position.y = 0; }, 600);
    });

    // Calculate trajectory towards targetAim with Magnus curl
    const dx = 52.5 - this.ball.position.x;
    const dz = this.targetAim.z - this.ball.position.z;
    const dy = this.targetAim.y - this.ball.position.y;
    const dist = Math.hypot(dx, dz);

    const speed = 24 + power * 10;
    this.ball.velocity.set(
      (dx / dist) * speed,
      dy * 1.8 + 4.5,
      (dz / dist) * speed
    );

    // Store active curl force applied during flight
    this.activeCurl = (curl - 0.5) * 22; // left or right curve

    // Goalkeeper AI reaction
    setTimeout(() => {
      const diveDir = (this.targetAim.z > 0) ? 1 : -1;
      this.goalkeeper.triggerDive(diveDir);
      // Check if saved
      if (power < 0.35 || Math.abs(this.targetAim.z) < 0.8) {
        // Keeper saves
        setTimeout(() => {
          this.ball.velocity.set(-6, 4, (Math.random() - 0.5) * 8);
          this.sound.playPostHit();
          this.notify('SAVED BY THE GOALKEEPER!');
          setTimeout(() => this.setupFreeKick(), 2500);
        }, 300);
      } else {
        // Goal scored!
        setTimeout(() => {
          if (this.ball.position.x >= 52.0 && this.ball.position.y < 2.44) {
            this.sound.playGoalCheer();
            this.sound.playNetRustle();
            this.goalsScored++;
            this.score += 500;
            if (this.targetAim.y > 1.8 && Math.abs(this.targetAim.z) > 2.2) {
              this.score += 500; // Top corner bonus
              this.notify('GOAL! UPPER 90 TOP CORNER BLASTER! (+1000 PTS)');
            } else {
              this.notify('GOAL! STUNNING FREE KICK! (+500 PTS)');
            }
            this.striker.triggerCelebrate();
            setTimeout(() => this.setupFreeKick(), 3200);
          }
        }, 700);
      }
    }, 280);
  }

  strikePenalty(targetZ, power) {
    if (!this.isAiming) return;
    this.isAiming = false;
    this.attempts++;

    this.striker.triggerKick();
    this.sound.playKick(power);

    const speed = 22 + power * 12;
    const loft = 1.2 + power * 3.2;

    this.ball.velocity.set(
      speed,
      loft,
      targetZ * 4.2
    );

    // Goalkeeper guess dive (-1: Left, 0: Center, 1: Right)
    const keeperDive = [-1, 0, 1][Math.floor(Math.random() * 3)];
    setTimeout(() => {
      if (keeperDive !== 0) this.goalkeeper.triggerDive(keeperDive);

      const targetDir = (targetZ > 0.3) ? 1 : (targetZ < -0.3) ? -1 : 0;
      const isSaved = (keeperDive === targetDir && Math.abs(targetZ) < 0.7);

      if (isSaved) {
        this.ball.velocity.set(-4, 3, (Math.random() - 0.5) * 6);
        this.sound.playPostHit();
        this.notify('PENALTY SAVED!');
        this.penaltyResults.push(false);
      } else {
        this.sound.playGoalCheer();
        this.sound.playNetRustle();
        this.goalsScored++;
        this.score += 300;
        this.notify('GOAL! CLINICAL PENALTY!');
        this.striker.triggerCelebrate();
        this.penaltyResults.push(true);
      }

      this.penaltyRound++;
      if (this.penaltyRound < 5) {
        setTimeout(() => this.setupPenalty(), 2800);
      } else {
        setTimeout(() => {
          this.notify(`SHOOTOUT COMPLETE! ${this.goalsScored} / 5 PENALTIES SCORED`);
          this.penaltyRound = 0;
          this.setupPenalty();
        }, 3200);
      }
    }, 220);
  }

  update(dt, input) {
    // Charging logic
    if (this.charging) {
      this.shotCharged = Math.min(1.0, this.shotCharged + dt * 1.8);
      if (this.onDrillUpdate) {
        this.onDrillUpdate({ power: this.shotCharged, aim: this.targetAim, curl: this.curlAmount });
      }
    }

    // In 1v1 mode, handle free user dribbling
    if (this.mode === '1v1') {
      this.update1v1Mode(dt, input);
    }

    // Apply Magnus aerodynamic curl force if airborne
    if (this.activeCurl && Math.abs(this.ball.velocity.x) > 4) {
      this.ball.velocity.z += this.activeCurl * dt;
    }

    // Ball physics
    if (!this.ball.owner) {
      this.ball.velocity.y -= 9.81 * dt;
      this.ball.position.addScaledVector(this.ball.velocity, dt);

      // Bounce
      if (this.ball.position.y <= this.ball.radius) {
        this.ball.position.y = this.ball.radius;
        if (Math.abs(this.ball.velocity.y) > 0.6) {
          this.ball.velocity.y = -this.ball.velocity.y * 0.55;
        } else {
          this.ball.velocity.y = 0;
        }
        this.ball.velocity.x *= (1 - 0.8 * dt);
        this.ball.velocity.z *= (1 - 0.8 * dt);
      }
    }

    // Update visuals
    this.ball.update(dt);
    this.striker.update(dt);
    this.goalkeeper.update(dt);
    this.wallPlayers.forEach(p => p.update(dt));

    // Spin Target Rings
    this.targetRings.forEach(r => {
      r.rotation.z += dt * 2;
    });
  }

  update1v1Mode(dt, input) {
    const moveX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const moveZ = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    const len = Math.hypot(moveX, moveZ);

    if (len > 0.05) {
      const speed = input.sprint ? 9.2 : 6.0;
      this.striker.position.x += (moveX / len) * speed * dt;
      this.striker.position.z += (moveZ / len) * speed * dt;
      this.striker.rotation = Math.atan2(moveX, moveZ);

      if (this.ball.owner === this.striker) {
        this.ball.position.set(
          this.striker.position.x + (moveX / len) * 0.7,
          this.ball.radius,
          this.striker.position.z + (moveZ / len) * 0.7
        );
      }
    }

    // Goalkeeper rush-out AI if striker gets close
    if (this.striker.position.x > 36) {
      const dirX = this.striker.position.x - this.goalkeeper.position.x;
      const dirZ = this.striker.position.z - this.goalkeeper.position.z;
      const d = Math.hypot(dirX, dirZ);
      if (d > 1.4) {
        this.goalkeeper.position.x += (dirX / d) * 4.8 * dt;
        this.goalkeeper.position.z += (dirZ / d) * 4.8 * dt;
      }
    }

    // Shoot in 1v1
    if (input.shootHeld && this.ball.owner === this.striker) {
      this.ball.owner = null;
      this.striker.triggerKick();
      this.sound.playKick(0.9);

      const dx = 52.5 - this.ball.position.x;
      const dz = (Math.random() - 0.5) * 5.0 - this.ball.position.z;
      const d = Math.hypot(dx, dz);

      this.ball.velocity.set((dx / d) * 26, 2.5, (dz / d) * 26);

      // Check if goal
      setTimeout(() => {
        if (this.ball.position.x > 52.0 && Math.abs(this.ball.position.z) < 3.66) {
          this.sound.playGoalCheer();
          this.sound.playNetRustle();
          this.notify('GOAL! SUPERB FINISH IN 1-ON-1 PRACTICE!');
          this.striker.triggerCelebrate();
          setTimeout(() => this.setup1v1(), 2800);
        }
      }, 700);
    }
  }

  notify(msg) {
    if (this.onDrillEvent) this.onDrillEvent(msg);
  }

  dispose() {
    this.striker.dispose();
    this.goalkeeper.dispose();
    this.wallPlayers.forEach(p => p.dispose());
    this.targetRings.forEach(r => this.scene.remove(r));
    this.ball.dispose();
  }
}

