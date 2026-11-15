/**
 * FC 27 - Master Match Simulation Engine
 * Manages 3D ball physics, goal/boundary collision detection, 22 player entities,
 * input processing (passes, power shots, crosses, tackles), match clock, commentary, and officiating.
 */

import { Player3D } from '../graphics/Player3D.js';
import { Goalkeeper3D } from '../graphics/Goalkeeper3D.js';
import { Ball3D } from '../graphics/Ball3D.js';
import { Referee3D } from '../graphics/Referee3D.js';
import { AIController } from './AIController.js';
import { CommentarySystem } from '../audio/CommentarySystem.js';
import { FORMATIONS } from '../data/TeamsData.js';

export class MatchSimulation {
  constructor(scene, soundSystem, options = {}) {
    this.scene = scene;
    this.sound = soundSystem;

    // Configuration
    this.homeTeamData = options.homeTeam;
    this.awayTeamData = options.awayTeam;
    this.stadiumData = options.stadium;
    this.homeRoster = this.homeTeamData.roster.slice(0, 11);
    this.homeBench = (this.homeTeamData.subs || []).slice();
    this.substitutionsUsed = 0;
    this.playerMatchStats = new Map();
    this.allMatchPlayers = new Set();
    this.replayFrames = [];
    this.replayAccumulator = 0;
    this.replayTime = 0;
    this.isReplaying = false;
    this.replayElapsed = 0;
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
    this.referee = new Referee3D(this.scene);
    this.commentary = new CommentarySystem(this.sound);
    this.commentary.onLine = line => {
      if (this.onCommentary) this.onCommentary(line);
    };

    // Lineup presentation state
    this.lineupPhase = 'walkout'; // 'walkout', 'goalkeeper_cam', 'intro_done'
    this.lineupTimer = 0;
    this.lineupTotalDuration = 7.5; // seconds for full lineup presentation
    this.lineupDone = false;

    // Callbacks for UI updates
    this.onScoreUpdate = null;
    this.onClockUpdate = null;
    this.onMatchEvent = null;
    this.onCommentary = null;
    this.onStaminaUpdate = null;
    this.onPowerUpdate = null;
    this.onHalfTime = null;
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
    this.homeRoster.forEach((info, idx) => {
      const isGK = idx === 0;
      const kit = isGK ? (this.homeTeamData.gkKit || this.homeTeamData.homeKit) : this.homeTeamData.homeKit;
      const player = isGK
        ? new Goalkeeper3D(this.scene, info, kit)
        : new Player3D(this.scene, info, kit, false);
      player.team = 'home';
      player.teamData = this.homeTeamData;
      player.isGoalkeeper = isGK;

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
      const kit = isGK ? (this.awayTeamData.gkKit || this.awayTeamData.awayKit) : this.awayTeamData.awayKit;
      const player = isGK
        ? new Goalkeeper3D(this.scene, info, kit)
        : new Player3D(this.scene, info, kit, false);
      player.team = 'away';
      player.teamData = this.awayTeamData;
      player.isGoalkeeper = isGK;

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
    this.allMatchPlayers = new Set([...this.homePlayers, ...this.awayPlayers]);

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

    // If this is the first kickoff, run the lineup presentation
    if (!this.lineupDone) {
      this.matchState = 'lineup';
      this.lineupPhase = 'walkout';
      this.lineupTimer = 0;

      // Place players in tunnel for walkout animation
      this.homePlayers.forEach((p, idx) => {
        p.walkoutTarget = p.position.clone();
        p.position.set(-8 - idx * 1.2, 0, -42);
        p.rotation = Math.PI / 2;
      });
      this.awayPlayers.forEach((p, idx) => {
        p.walkoutTarget = p.position.clone();
        p.position.set(8 + idx * 1.2, 0, -42);
        p.rotation = Math.PI / 2;
      });

      // Trigger commentary intro
      this.commentary.commentIntro(
        this.homeTeamData.name,
        this.awayTeamData.name,
        this.stadiumData.name
      );

      this.notify(`LINEUP · ${this.homeTeamData.name.toUpperCase()} vs ${this.awayTeamData.name.toUpperCase()}`);
      return;
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

  recordPlayerStat(player, stat, amount = 1) {
    if (!player) return;
    const stats = this.playerMatchStats.get(player) || {
      goals: 0,
      assists: 0,
      shots: 0,
      saves: 0,
      tackles: 0,
      passes: 0
    };
    stats[stat] = (stats[stat] || 0) + amount;
    this.playerMatchStats.set(player, stats);
  }

  getPlayerOfMatch() {
    const players = [...this.allMatchPlayers];
    if (!players.length) return null;

    return players
      .map(player => {
        const stats = this.playerMatchStats.get(player) || {};
        const impact = (stats.goals || 0) * 10 +
          (stats.assists || 0) * 7 +
          (stats.saves || 0) * 8 +
          (stats.tackles || 0) * 2 +
          (stats.shots || 0) * 0.4;
        const rating = Math.min(10, Math.round((6 + impact * 0.1) * 10) / 10);
        return { player, stats, rating };
      })
      .sort((a, b) =>
        b.rating - a.rating ||
        (b.player.info.ovr || 0) - (a.player.info.ovr || 0)
      )[0];
  }

  performSubstitution(outgoingNumber, incomingNumber) {
    if (this.substitutionsUsed >= 5) {
      return { success: false, message: 'Five substitutions have already been used.' };
    }

    const outgoingIndex = this.homePlayers.findIndex(player => player.info.num === outgoingNumber);
    const incomingIndex = this.homeBench.findIndex(player => player.num === incomingNumber);
    if (outgoingIndex < 0 || incomingIndex < 0) {
      return { success: false, message: 'Choose a player on the pitch and one on the bench.' };
    }

    const outgoing = this.homePlayers[outgoingIndex];
    const incomingInfo = this.homeBench[incomingIndex];
    const incomingIsGoalkeeper = incomingInfo.role === 'GK';
    if (outgoing.isGoalkeeper !== incomingIsGoalkeeper) {
      return { success: false, message: 'A goalkeeper can only replace the goalkeeper.' };
    }

    const incoming = incomingIsGoalkeeper
      ? new Goalkeeper3D(this.scene, incomingInfo, this.homeTeamData.gkKit || this.homeTeamData.homeKit)
      : new Player3D(this.scene, incomingInfo, this.homeTeamData.homeKit);
    incoming.team = 'home';
    incoming.teamData = this.homeTeamData;
    incoming.position.copy(outgoing.position);
    incoming.rotation = outgoing.rotation;
    incoming.baseFormationSpot = outgoing.baseFormationSpot.clone();
    this.homePlayers[outgoingIndex] = incoming;
    this.homeRoster[outgoingIndex] = incomingInfo;
    this.homeBench.splice(incomingIndex, 1);
    this.homeBench.push(outgoing.info);
    this.allMatchPlayers.add(incoming);

    if (this.activeUserPlayer === outgoing) {
      this.selectPlayer(incoming);
    }

    outgoing.dispose();
    this.substitutionsUsed++;
    this.notify(`SUBSTITUTION · ${incoming.info.name.toUpperCase()} ON FOR ${outgoing.info.name.toUpperCase()}`);
    return { success: true, message: `${incoming.info.name} is on for ${outgoing.info.name}.` };
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

    if (input.skillTriggered && hasBall && player.stamina >= 12 && player.triggerSkill()) {
      const skillDir = moveLen > 0.05
        ? new THREE.Vector3(moveX / moveLen, 0, moveZ / moveLen)
        : new THREE.Vector3(Math.sin(player.rotation), 0, Math.cos(player.rotation));
      player.position.addScaledVector(skillDir, 0.8);
      player.stamina -= 12;
      this.sound.playUIClick();
      this.notify(`${player.info.name.toUpperCase()} BEATS THE DEFENDER`);
    }

    if (moveLen > 0.05) {
      const dirX = moveX / moveLen;
      const dirZ = moveZ / moveLen;

      // Sprint logic
      const isSprinting = input.sprint && player.stamina > 5;
      const maxSpeed = player.skillBurst > 0 ? 11 : isSprinting ? 9.2 : 6.0;

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
    this.recordPlayerStat(player, 'shots');

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
    this.commentary.commentShot(player.info.name, power);
    this.notify(`POWER SHOT · ${player.info.name.toUpperCase()}`);
  }

  executeAIShot(player, target) {
    this.ball.owner = null;
    this.awayShots++;
    this.recordPlayerStat(player, 'shots');
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
    this.recordPlayerStat(player, 'passes');

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
      this.commentary.commentCross(player.info.name);
      this.notify('CROSS DELIVERED');
    } else if (type === 'through') {
      this.sound.playKick(0.65);
      this.commentary.commentThroughBall(player.info.name);
      this.notify('THROUGH BALL');
    } else {
      this.sound.playKick(0.5);
      this.commentary.commentPass(player.info.name);
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
    this.recordPlayerStat(player, 'passes');
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
          this.recordPlayerStat(player, 'tackles');
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
        this.recordPlayerStat(aiPlayer, 'tackles');
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
          this.commentary.commentWoodwork();
        }
        // Check Crossbar (Y = 2.44, Z between -3.66 and 3.66)
        if (Math.abs(ball.position.y - 2.44) < 0.28 && Math.abs(ball.position.z) < 3.66) {
          ball.velocity.y = -ball.velocity.y * 0.7;
          ball.velocity.x = -ball.velocity.x * 0.7;
          this.sound.playPostHit();
          this.notify('OFF THE CROSSBAR!');
          this.commentary.commentWoodwork();
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

  triggerSave(gk, isSpectacular = false) {
    this.recordPlayerStat(gk, 'saves');
    gk.triggerDive(this.ball.velocity.x > 0 ? -1 : 1, this.ball.velocity.z > 0 ? 1 : -1);
    this.sound.playSave();
    this.commentary.commentSave(gk.info.name);
    if (isSpectacular) {
      this.commentary.commentGreatSave(gk.info.name, true);
    }
    this.notify(`SAVE! ${gk.info.name.toUpperCase()}`);
  }

  triggerGoal(scoringTeam) {
    this.matchState = 'goal_celebration';
    this.lastScoringTeam = scoringTeam;
    this.goalCelebrationTimer = 4.2;
    this.sound.playNetRustle();
    this.sound.playGoalCheer();
    if (window.fcEngine?.music) window.fcEngine.music.duckVolume(0.12, 4.2);

    let scorer = null;
    if (scoringTeam === 'home') {
      this.homeScore++;
      scorer = this.activeUserPlayer || this.homePlayers[10];
      scorer.triggerCelebrate();
      this.notify(`GOAL! ${this.homeTeamData.name.toUpperCase()} SCORE!`);
    } else {
      this.awayScore++;
      scorer = this.awayPlayers[10];
      scorer.triggerCelebrate();
      this.notify(`GOAL! ${this.awayTeamData.name.toUpperCase()} SCORE!`);
    }
    this.recordPlayerStat(scorer, 'goals');

    this.commentary.commentGoal(
      scoringTeam === 'home' ? this.homeTeamData.name : this.awayTeamData.name,
      scorer.info.name
    );

    if (window.fcEngine?.cameraSystem) {
      window.fcEngine.cameraSystem.triggerCelebration(scorer);
    }

    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.homeScore, this.awayScore);
    }

  }

  update(dt, input) {
    if (this.isReplaying) {
      this.updateReplay(dt);
      return;
    }
    if (this.matchState === 'paused') return;
    if (this.matchState === 'goal_celebration') {
      this.goalCelebrationTimer -= dt;
      this.ball.update(dt);
      this.homePlayers.forEach(player => player.update(dt));
      this.awayPlayers.forEach(player => player.update(dt));
      if (this.goalCelebrationTimer <= 0) {
        window.fcEngine?.cameraSystem.setMode('broadcast');
        this.resetToKickoff(this.lastScoringTeam === 'home' ? 'away' : 'home');
      }
      return;
    }

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
      this.commentary.commentHalfTime(this.homeScore, this.awayScore);
      this.notify('HALF TIME · TEAMS HEAD TO THE DRESSING ROOMS');
      if (this.onHalfTime) this.onHalfTime(this.homeScore, this.awayScore);
      return;
    }

    // Full time check (at 90')
    if (simulatedMinute >= 90 && this.matchState === 'playing') {
      this.matchState = 'fulltime';
      this.sound.playWhistle('triple');
      this.notify('FULL TIME · THE FINAL WHISTLE BLOWS');
      const winner = this.homeScore > this.awayScore ? this.homeTeamData.name :
                     this.awayScore > this.homeScore ? this.awayTeamData.name : "nobody";
      this.commentary.commentFullTime(winner, this.homeScore, this.awayScore);
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
    if (this.matchState === 'playing') this.recordReplayFrame(dt);
  }

  recordReplayFrame(dt) {
    this.replayTime += dt;
    this.replayAccumulator += dt;
    if (this.replayAccumulator < 0.1) return;
    this.replayAccumulator -= 0.1;
    this.replayFrames.push({
      time: this.replayTime,
      ball: this.ball.position.clone(),
      ballVelocity: this.ball.velocity.clone(),
      home: this.homePlayers.map(player => ({
        position: player.position.clone(),
        velocity: player.velocity.clone(),
        rotation: player.rotation
      })),
      away: this.awayPlayers.map(player => ({
        position: player.position.clone(),
        velocity: player.velocity.clone(),
        rotation: player.rotation
      }))
    });
    if (this.replayFrames.length > 121) this.replayFrames.shift();
  }

  startReplay() {
    if (this.isReplaying || this.replayFrames.length < 2) return false;

    this.replayRestoreState = {
      ballPosition: this.ball.position.clone(),
      ballVelocity: this.ball.velocity.clone(),
      ballOwner: this.ball.owner,
      home: this.homePlayers.map(player => ({
        position: player.position.clone(),
        velocity: player.velocity.clone(),
        rotation: player.rotation,
        animation: this.capturePlayerAnimation(player)
      })),
      away: this.awayPlayers.map(player => ({
        position: player.position.clone(),
        velocity: player.velocity.clone(),
        rotation: player.rotation,
        animation: this.capturePlayerAnimation(player)
      }))
    };
    this.replayElapsed = 0;
    this.replayDuration = this.replayFrames[this.replayFrames.length - 1].time -
      this.replayFrames[0].time;
    this.replayCameraMode = window.fcEngine?.cameraSystem.mode || 'broadcast';
    window.fcEngine?.cameraSystem.setMode('broadcast');
    this.matchState = 'paused';
    this.isReplaying = true;
    return true;
  }

  updateReplay(dt) {
    this.replayElapsed += dt;
    const frames = this.replayFrames;
    const startTime = frames[0].time;
    const replayTime = startTime + this.replayElapsed;
    let nextIndex = frames.findIndex(frame => frame.time >= replayTime);
    if (nextIndex < 0) {
      this.stopReplay();
      return;
    }

    const previousIndex = Math.max(0, nextIndex - 1);
    const previous = frames[previousIndex];
    const next = frames[nextIndex];
    const span = next.time - previous.time || 1;
    const progress = Math.max(0, Math.min(1, (replayTime - previous.time) / span));

    this.ball.position.lerpVectors(previous.ball, next.ball, progress);
    this.ball.velocity.lerpVectors(previous.ballVelocity || this.ball.velocity, next.ballVelocity || this.ball.velocity, progress);
    this.ball.owner = null;
    this.homePlayers.forEach((player, index) => {
      player.position.lerpVectors(previous.home[index].position, next.home[index].position, progress);
      player.velocity.lerpVectors(previous.home[index].velocity, next.home[index].velocity, progress);
      player.rotation = previous.home[index].rotation +
        (next.home[index].rotation - previous.home[index].rotation) * progress;
      player.update(dt);
    });
    this.awayPlayers.forEach((player, index) => {
      player.position.lerpVectors(previous.away[index].position, next.away[index].position, progress);
      player.velocity.lerpVectors(previous.away[index].velocity, next.away[index].velocity, progress);
      player.rotation = previous.away[index].rotation +
        (next.away[index].rotation - previous.away[index].rotation) * progress;
      player.update(dt);
    });
    this.ball.update(dt);
    if (this.onReplayProgress) {
      this.onReplayProgress(this.replayDuration ? this.replayElapsed / this.replayDuration : 1);
    }
  }

  stopReplay() {
    if (!this.isReplaying || !this.replayRestoreState) return false;

    this.ball.position.copy(this.replayRestoreState.ballPosition);
    this.ball.velocity.copy(this.replayRestoreState.ballVelocity);
    this.ball.owner = this.replayRestoreState.ballOwner;
    this.homePlayers.forEach((player, index) => {
      player.position.copy(this.replayRestoreState.home[index].position);
      player.velocity.copy(this.replayRestoreState.home[index].velocity);
      player.rotation = this.replayRestoreState.home[index].rotation;
      this.restorePlayerAnimation(player, this.replayRestoreState.home[index].animation);
      player.update(0);
    });
    this.awayPlayers.forEach((player, index) => {
      player.position.copy(this.replayRestoreState.away[index].position);
      player.velocity.copy(this.replayRestoreState.away[index].velocity);
      player.rotation = this.replayRestoreState.away[index].rotation;
      this.restorePlayerAnimation(player, this.replayRestoreState.away[index].animation);
      player.update(0);
    });
    this.ball.update(0);
    this.replayRestoreState = null;
    this.isReplaying = false;
    this.matchState = 'paused';
    window.fcEngine?.cameraSystem.setMode(this.replayCameraMode || 'broadcast');
    if (this.onReplayEnd) this.onReplayEnd();
    return true;
  }

  capturePlayerAnimation(player) {
    const animation = {};
    [
      'state', 'animTime', 'kickProgress', 'tackleProgress', 'skillProgress',
      'skillCooldown', 'skillBurst', 'diveProgress', 'celebrateProgress',
      'catchProgress', 'throwProgress', 'punchProgress', 'isHoldingBall', 'saveCount'
    ].forEach(key => {
      if (key in player) {
        animation[key] = player[key] instanceof THREE.Vector3
          ? player[key].clone()
          : player[key];
      }
    });
    if (player.diveDirection !== undefined) {
      animation.diveDirection = player.diveDirection instanceof THREE.Vector3
        ? player.diveDirection.clone()
        : player.diveDirection;
    }
    return animation;
  }

  restorePlayerAnimation(player, animation) {
    Object.entries(animation).forEach(([key, value]) => {
      if (player[key] instanceof THREE.Vector3) player[key].copy(value);
      else player[key] = value;
    });
    player.bodyGroup.rotation.set(0, 0, 0);
    player.bodyGroup.position.set(0, 0, 0);
    if (player.resetLimbs) player.resetLimbs();
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
    this.ball.dispose();
  }
}
