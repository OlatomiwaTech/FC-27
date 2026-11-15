/**
 * FC 27 - Master Match Simulation Engine
 * Manages 3D ball physics, goal/boundary collision detection, 22 player entities,
 * input processing (passes, power shots, crosses, tackles), match clock, and officiating.
 */

import { Player3D } from '../graphics/Player3D.js';
import { Ball3D } from '../graphics/Ball3D.js';
import { AIController } from './AIController.js';
import { FORMATIONS } from '../data/TeamsData.js';

export class MatchSimulation {
  constructor(scene, soundSystem, options = {}) {
    this.scene = scene;
    this.sound = soundSystem;

    // Configuration
    this.homeTeamData = options.homeTeam;
    this.awayTeamData = options.awayTeam;
    this.stadiumData = options.stadium;
    this.matchDurationMinutes = options.duration || 4; // match duration in real-world minutes
    this.difficulty = options.difficulty || 'standard';
    this.difficultyMultiplier = (this.difficulty === 'amateur') ? 0.75 :
                               (this.difficulty === 'professional') ? 1.2 :
                               (this.difficulty === 'legendary') ? 1.45 : 1.0;

    // Match State
    this.matchState = 'kickoff'; // 'kickoff', 'playing', 'goal_celebration', 'halftime', 'fulltime', 'paused'
    this.elapsedRealSeconds = 0;
    this.homeScore = 0;
    this.awayScore = 0;
    this.homeShots = 0;
    this.awayShots = 0;
    this.homePossessionTime = 0;
    this.awayPossessionTime = 0;
    this.isSecondHalf = false;

    // Power meters
    this.chargingShot = false;
    this.shotPower = 0; // 0 to 1
    this.chargingPass = false;
    this.passPower = 0;

    // Entities
    this.homePlayers = [];
    this.awayPlayers = [];
    this.activeUserPlayer = null;
    this.ball = new Ball3D(this.scene);
    this.ai = new AIController(this);

    // Callbacks for UI updates
    this.onScoreUpdate = null;
    this.onClockUpdate = null;
    this.onMatchEvent = null;
    this.onStaminaUpdate = null;
    this.onPowerUpdate = null;
    this.onMatchEnd = null;

    this.initTeams();
  }

  initTeams() {
    // Clear any existing players
    this.homePlayers.forEach(p => p.dispose());
    this.awayPlayers.forEach(p => p.dispose());
    this.homePlayers = [];
    this.awayPlayers = [];

    // Formation setups
    const homeForm = FORMATIONS[this.homeTeamData.defaultFormation || '4-3-3'] || FORMATIONS['4-3-3'];
    const awayForm = FORMATIONS[this.awayTeamData.defaultFormation || '4-3-3'] || FORMATIONS['4-3-3'];

    // Spawn 11 Home Players
    this.homeTeamData.roster.slice(0, 11).forEach((info, idx) => {
      const isGK = idx === 0;
      const player = new Player3D(this.scene, info, this.homeTeamData.homeKit, isGK);
      player.team = 'home';
      player.teamData = this.homeTeamData;

      // Base formation coordinates (mapped from 0..105, 0..68 to -52.5..52.5, -34..34)
      const formCoord = homeForm.home[idx].pos;
      const x = formCoord[0] - 52.5;
      const z = formCoord[1] - 34;
      player.baseFormationSpot = new THREE.Vector3(x, 0, z);
      player.position.copy(player.baseFormationSpot);

      this.homePlayers.push(player);
    });

    // Spawn 11 Away Players (mirrored onto positive X side)
    this.awayTeamData.roster.slice(0, 11).forEach((info, idx) => {
      const isGK = idx === 0;
      const player = new Player3D(this.scene, info, this.awayTeamData.awayKit, isGK);
      player.team = 'away';
      player.teamData = this.awayTeamData;

      const formCoord = awayForm.home[idx].pos;
      // Mirror X and Z for opponent
      const x = -(formCoord[0] - 52.5);
      const z = -(formCoord[1] - 34);
      player.baseFormationSpot = new THREE.Vector3(x, 0, z);
      player.position.copy(player.baseFormationSpot);

      this.awayPlayers.push(player);
    });

    // Default user player: Home Team Captain / Attacking Mid / Striker
    this.activeUserPlayer = this.homePlayers.find(p => p.info.num === 10) || this.homePlayers[10];
    this.activeUserPlayer.setSelected(true);

    this.resetToKickoff('home');
  }

  resetToKickoff(kickingTeam = 'home') {
    this.ball.position.set(0, this.ball.radius, 0);
    this.ball.velocity.set(0, 0, 0);
    this.ball.owner = null;

    // Reset player positions to tactical spots
    this.homePlayers.forEach(p => {
      p.position.copy(p.baseFormationSpot);
      p.velocity.set(0, 0, 0);
      p.rotation = Math.PI / 2;
    });

    this.awayPlayers.forEach(p => {
      p.position.copy(p.baseFormationSpot);
      p.velocity.set(0, 0, 0);
      p.rotation = -Math.PI / 2;
    });

    // Place kick-off player at center circle
    const kickoffPlayer = (kickingTeam === 'home') ? this.homePlayers[10] : this.awayPlayers[10];
    kickoffPlayer.position.set((kickingTeam === 'home' ? -0.8 : 0.8), 0, 0);
    this.ball.owner = kickoffPlayer;

    if (kickingTeam === 'home') {
      this.selectPlayer(kickoffPlayer);
    }

    this.sound.playWhistle('short');
    this.notify(`KICK-OFF · ${(kickingTeam === 'home' ? this.homeTeamData.name : this.awayTeamData.name).toUpperCase()}`);
    this.matchState = 'playing';
  }

  selectPlayer(player) {
    if (this.activeUserPlayer) {
      this.activeUserPlayer.setSelected(false);
    }
    this.activeUserPlayer = player;
    player.setSelected(true);
    if (this.onStaminaUpdate) {
      this.onStaminaUpdate(player.stamina, player.info);
    }
  }

  switchActivePlayer() {
    // Switch to teammate closest to ball
    const ballPos = this.ball.position;
    const candidates = this.homePlayers.filter(p => !p.isGoalkeeper && p !== this.activeUserPlayer);
    let closest = candidates[0];
    let minDist = Infinity;
    candidates.forEach(p => {
      const d = p.position.distanceTo(ballPos);
      if (d < minDist) {
        minDist = d;
        closest = p;
      }
    });

    if (closest) {
      this.selectPlayer(closest);
      this.sound.playUIClick();
    }
  }

  handleInput(input, dt) {
    if (this.matchState !== 'playing' || !this.activeUserPlayer) return;

    const player = this.activeUserPlayer;
    const hasBall = (this.ball.owner === player);

    // Movement Vector
    const moveX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const moveZ = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    const moveLen = Math.hypot(moveX, moveZ);

    if (moveLen > 0.05) {
      const dirX = moveX / moveLen;
      const dirZ = moveZ / moveLen;

      // Sprint logic
      const isSprinting = input.sprint && player.stamina > 5;
      const maxSpeed = isSprinting ? 9.2 : 6.0;

      player.velocity.set(dirX * maxSpeed, 0, dirZ * maxSpeed);
      player.position.x += dirX * maxSpeed * dt;
      player.position.z += dirZ * maxSpeed * dt;
      player.rotation = Math.atan2(dirX, dirZ);

      // Drain or recover stamina
      if (isSprinting) {
        player.stamina = Math.max(0, player.stamina - dt * 14);
      } else {
        player.stamina = Math.min(100, player.stamina + dt * 4);
      }

      // Ball follows player feet if possessed
      if (hasBall) {
        const leadDist = isSprinting ? 1.05 : 0.65;
        this.ball.position.set(
          player.position.x + dirX * leadDist,
          this.ball.radius,
          player.position.z + dirZ * leadDist
        );
      }
    } else {
      player.velocity.set(0, 0, 0);
      player.stamina = Math.min(100, player.stamina + dt * 8);
    }

    // Keep players inside pitch boundary
    player.position.x = Math.max(-52.0, Math.min(52.0, player.position.x));
    player.position.z = Math.max(-33.5, Math.min(33.5, player.position.z));

    if (this.onStaminaUpdate) {
      this.onStaminaUpdate(player.stamina, player.info);
    }

    // Charging Shot
    if (input.shootHeld) {
      if (hasBall) {
        this.chargingShot = true;
        this.shotPower = Math.min(1.0, this.shotPower + dt * 1.8);
        if (this.onPowerUpdate) this.onPowerUpdate(this.shotPower, 'SHOOT');
      }
    } else if (this.chargingShot) {
      // Released Shoot key
      this.executeUserShot(player, this.shotPower);
      this.chargingShot = false;
      this.shotPower = 0;
      if (this.onPowerUpdate) this.onPowerUpdate(0, 'SHOOT');
    }

    // Charging Pass / Short Pass
    if (input.passTriggered) {
      if (hasBall) {
        this.executeUserPass(player, 'short');
      } else {
        // Standing tackle attempt if defending
        this.executeTackle(player);
      }
    }

    // Through Ball
    if (input.throughTriggered && hasBall) {
      this.executeUserPass(player, 'through');
    }

    // Lob / Cross
    if (input.crossTriggered && hasBall) {
      this.executeUserPass(player, 'cross');
    }

    // Slide Tackle
    if (input.slideTriggered && !hasBall) {
      player.triggerTackle();
      this.sound.playTackle();
      this.executeTackle(player, true);
    }

    // Switch Player
    if (input.switchTriggered) {
      this.switchActivePlayer();
    }
  }

  executeUserShot(player, power) {
    this.ball.owner = null;
    player.triggerKick();
    this.homeShots++;

    // Aim towards away goal (X = 52.5) with corner placement
    const goalX = 52.5;
    const targetZ = (Math.random() - 0.5) * 5.8; // inside 7.32m goal frame
    const shotSpeed = 22 + power * 15; // 22 to 37 m/s!
    const loft = 2.5 + power * 4.5;

    const dirX = goalX - this.ball.position.x;
    const dirZ = targetZ - this.ball.position.z;
    const len = Math.hypot(dirX, dirZ) || 1;

    this.ball.velocity.set(
      (dirX / len) * shotSpeed,
      loft,
      (dirZ / len) * shotSpeed
    );

    this.sound.playKick(power);
    this.sound.setCrowdIntensity(0.9);
    this.notify(`POWER SHOT · ${player.info.name.toUpperCase()}`);
  }

  executeAIShot(player, target) {
    this.ball.owner = null;
    this.awayShots++;
    const shotSpeed = 20 + Math.random() * 8;

    const dirX = target.x - this.ball.position.x;
    const dirZ = target.z - this.ball.position.z;
    const len = Math.hypot(dirX, dirZ) || 1;

    this.ball.velocity.set(
      (dirX / len) * shotSpeed,
      2.8 + Math.random() * 2.5,
      (dirZ / len) * shotSpeed
    );

    this.sound.playKick(0.85);
    this.sound.setCrowdIntensity(0.85);
  }

  executeUserPass(player, type = 'short') {
    this.ball.owner = null;
    player.triggerKick();

    // Find best target teammate
    let candidates = this.homePlayers.filter(p => p !== player && !p.isGoalkeeper);

    if (type === 'through') {
      // Prioritize teammates further upfield
      candidates.sort((a, b) => b.position.x - a.position.x);
    } else {
      // Prioritize teammates in facing direction
      const facing = new THREE.Vector3(Math.sin(player.rotation), 0, Math.cos(player.rotation));
      candidates.sort((a, b) => {
        const da = new THREE.Vector3().subVectors(a.position, player.position).normalize();
        const db = new THREE.Vector3().subVectors(b.position, player.position).normalize();
        return db.dot(facing) - da.dot(facing);
      });
    }

    const target = candidates[0] || this.homePlayers[10];
    const targetPos = target.position.clone();

    if (type === 'through') {
      // Lead the pass forward
      targetPos.x += 6.5;
    }

    const dirX = targetPos.x - this.ball.position.x;
    const dirZ = targetPos.z - this.ball.position.z;
    const dist = Math.hypot(dirX, dirZ) || 1;

    let passSpeed = Math.min(26, Math.max(14, dist * 1.4));
    let loft = 0.5;

    if (type === 'cross') {
      loft = 7.5;
      passSpeed = 19;
      this.sound.playKick(0.8);
      this.notify('CROSS DELIVERED');
    } else {
      this.sound.playKick(0.5);
      this.notify('PASS INTO SPACE');
    }

    this.ball.velocity.set(
      (dirX / dist) * passSpeed,
      loft,
      (dirZ / dist) * passSpeed
    );
  }

  executeAIPass(player, target) {
    this.ball.owner = null;
    const dx = target.position.x - this.ball.position.x;
    const dz = target.position.z - this.ball.position.z;
    const dist = Math.hypot(dx, dz) || 1;
    const speed = Math.min(22, Math.max(12, dist * 1.3));

    this.ball.velocity.set(
      (dx / dist) * speed,
      0.8,
      (dz / dist) * speed
    );
    this.sound.playKick(0.6);
  }

  executeTackle(player, isSlide = false) {
    const oppTeam = (player.team === 'home') ? this.awayPlayers : this.homePlayers;
    const reach = isSlide ? 2.8 : 1.9;

    oppTeam.forEach(opp => {
      if (this.ball.owner === opp) {
        const dist = player.position.distanceTo(opp.position);
        if (dist < reach) {
          // Clean tackle dispossession!
          this.ball.owner = player;
          this.sound.playTackle();
          this.notify('CRISP TACKLE WON!');
        }
      }
    });
  }

  tackleAttempt(aiPlayer) {
    if (this.ball.owner && this.ball.owner.team === 'home') {
      const dist = aiPlayer.position.distanceTo(this.ball.owner.position);
      if (dist < 1.9) {
        this.ball.owner = aiPlayer;
        this.sound.playTackle();
        this.notify('POSSESSION WON BY OPPONENT');
      }
    }
  }

  updatePhysics(dt) {
    const ball = this.ball;

    if (ball.owner) {
      // Ball is attached to carrier feet
      return;
    }

    // Apply gravity
    ball.velocity.y -= 9.81 * dt;

    // Apply air drag
    ball.velocity.x *= (1 - 0.12 * dt);
    ball.velocity.z *= (1 - 0.12 * dt);

    // Integrate position
    ball.position.addScaledVector(ball.velocity, dt);

    // Turf bounce & friction
    if (ball.position.y <= ball.radius) {
      ball.position.y = ball.radius;
      if (Math.abs(ball.velocity.y) > 0.6) {
        ball.velocity.y = -ball.velocity.y * 0.58; // bounce restitution
      } else {
        ball.velocity.y = 0;
      }
      // Turf rolling friction
      ball.velocity.x *= (1 - 0.72 * dt);
      ball.velocity.z *= (1 - 0.72 * dt);
    }

    // Goal Post & Crossbar Collision check
    [-52.5, 52.5].forEach(goalX => {
      const isAtGoalLine = Math.abs(ball.position.x - goalX) < 0.45;
      if (isAtGoalLine) {
        // Check Left & Right Posts (Z = ±3.66)
        if (Math.abs(Math.abs(ball.position.z) - 3.66) < 0.28 && ball.position.y < 2.5) {
          ball.velocity.x = -ball.velocity.x * 0.75;
          ball.velocity.z = (ball.position.z > 0 ? 6 : -6);
          this.sound.playPostHit();
          this.notify('OFF THE WOODWORK!');
        }
        // Check Crossbar (Y = 2.44, Z between -3.66 and 3.66)
        if (Math.abs(ball.position.y - 2.44) < 0.28 && Math.abs(ball.position.z) < 3.66) {
          ball.velocity.y = -ball.velocity.y * 0.7;
          ball.velocity.x = -ball.velocity.x * 0.7;
          this.sound.playPostHit();
          this.notify('OFF THE CROSSBAR!');
        }
      }
    });

    // Check Loose Ball Pickup by nearest player
    if (Math.hypot(ball.velocity.x, ball.velocity.z) < 18 && ball.position.y < 1.4) {
      const allPlayers = [...this.homePlayers, ...this.awayPlayers];
      for (const p of allPlayers) {
        if (!p.isGoalkeeper && p.position.distanceTo(ball.position) < 1.35) {
          ball.owner = p;
          ball.velocity.set(0, 0, 0);
          if (p.team === 'home' && p !== this.activeUserPlayer) {
            this.selectPlayer(p);
          }
          break;
        }
      }
    }

    // Goal Detection (X beyond ±52.5 between Z [-3.66, 3.66] and Y [0, 2.44])
    if (this.matchState === 'playing') {
      // Home Goal scored at Away Net (X > 52.5)
      if (ball.position.x > 52.5 && Math.abs(ball.position.z) < 3.66 && ball.position.y < 2.44) {
        this.triggerGoal('home');
      }
      // Away Goal scored at Home Net (X < -52.5)
      else if (ball.position.x < -52.5 && Math.abs(ball.position.z) < 3.66 && ball.position.y < 2.44) {
        this.triggerGoal('away');
      }
      // Out of bounds / touchline
      else if (Math.abs(ball.position.z) > 34.5 || Math.abs(ball.position.x) > 53.5) {
        // Reset out of bounds ball back in play
        ball.position.x = Math.max(-50, Math.min(50, ball.position.x));
        ball.position.z = Math.max(-32, Math.min(32, ball.position.z));
        ball.velocity.set(0, 0, 0);
      }
    }
  }

  triggerGoal(scoringTeam) {
    this.matchState = 'goal_celebration';
    this.sound.playNetRustle();
    this.sound.playGoalCheer();

    if (scoringTeam === 'home') {
      this.homeScore++;
      const scorer = this.activeUserPlayer || this.homePlayers[10];
      scorer.triggerCelebrate();
      this.notify(`GOAL! ${this.homeTeamData.name.toUpperCase()} SCORE!`);
    } else {
      this.awayScore++;
      this.awayPlayers[10].triggerCelebrate();
      this.notify(`GOAL! ${this.awayTeamData.name.toUpperCase()} SCORE!`);
    }

    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.homeScore, this.awayScore);
    }

    // Celebrate for 4 seconds then restart kickoff
    setTimeout(() => {
      if (this.matchState === 'goal_celebration') {
        this.resetToKickoff(scoringTeam === 'home' ? 'away' : 'home');
      }
    }, 4200);
  }

  update(dt, input) {
    if (this.matchState === 'paused') return;

    // Track elapsed time & match clock (0' to 90')
    this.elapsedRealSeconds += dt;
    const totalMatchSec = this.matchDurationMinutes * 60;
    const matchProgress = Math.min(1.0, this.elapsedRealSeconds / totalMatchSec);
    const simulatedMinute = Math.floor(matchProgress * 90);

    // Track possession
    if (this.ball.owner) {
      if (this.ball.owner.team === 'home') this.homePossessionTime += dt;
      else this.awayPossessionTime += dt;
    }

    // Half time check (at 45')
    if (simulatedMinute >= 45 && !this.isSecondHalf && this.matchState === 'playing') {
      this.isSecondHalf = true;
      this.matchState = 'halftime';
      this.sound.playWhistle('triple');
      this.notify('HALF TIME · TEAMS HEAD TO THE DRESSING ROOMS');
      return;
    }

    // Full time check (at 90')
    if (simulatedMinute >= 90 && this.matchState === 'playing') {
      this.matchState = 'fulltime';
      this.sound.playWhistle('triple');
      this.notify('FULL TIME · THE FINAL WHISTLE BLOWS');
      if (this.onMatchEnd) {
        const totalPoss = this.homePossessionTime + this.awayPossessionTime || 1;
        const homePossPct = Math.round((this.homePossessionTime / totalPoss) * 100);
        this.onMatchEnd({
          homeScore: this.homeScore,
          awayScore: this.awayScore,
          homeShots: this.homeShots,
          awayShots: this.awayShots,
          homePossession: homePossPct,
          awayPossession: 100 - homePossPct
        });
      }
      return;
    }

    if (this.onClockUpdate) {
      this.onClockUpdate(simulatedMinute, this.isSecondHalf);
    }

    // Handle user inputs
    this.handleInput(input, dt);

    // Run AI Controller
    this.ai.update(dt);

    // Update 3D Physics
    this.updatePhysics(dt);

    // Update 3D Entity Visuals
    this.ball.update(dt);
    this.homePlayers.forEach(p => p.update(dt));
    this.awayPlayers.forEach(p => p.update(dt));
  }

  startSecondHalf() {
    this.matchState = 'playing';
    this.resetToKickoff('away');
  }

  notify(msg) {
    if (this.onMatchEvent) {
      this.onMatchEvent(msg);
    }
  }

  dispose() {
    this.homePlayers.forEach(p => p.dispose());
    this.awayPlayers.forEach(p => p.dispose());
    this.scene.remove(this.ball.group);
  }
}

