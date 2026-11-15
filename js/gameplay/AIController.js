/**
 * FC 27 - Tactical Artificial Intelligence System
 * Drives teammate supporting runs, passing lane positioning, defensive pressing,
 * opponent decision making, and goalkeeper positioning & diving saves.
 */

export class AIController {
  constructor(simulation) {
    this.sim = simulation;
  }

  update(dt) {
    this.updateGoalkeepers(dt);
    this.updateOutfieldAI(dt);
  }

  updateGoalkeepers(dt) {
    const ball = this.sim.ball;

    // Home Goalkeeper (X = -50)
    const homeGK = this.sim.homePlayers[0];
    if (homeGK) {
      this.positionGoalkeeper(homeGK, -50.5, ball, dt, 1);
    }

    // Away Goalkeeper (X = 50)
    const awayGK = this.sim.awayPlayers[0];
    if (awayGK) {
      this.positionGoalkeeper(awayGK, 50.5, ball, dt, -1);
    }
  }

  positionGoalkeeper(gk, goalX, ball, dt, facingDir) {
    // Standard goal line positioning
    const targetZ = Math.max(-3.4, Math.min(3.4, ball.position.z * 0.45));
    const targetX = goalX + (ball.position.x - goalX) * 0.08;

    // Move smoothly towards target
    const dx = targetX - gk.position.x;
    const dz = targetZ - gk.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 0.1) {
      gk.position.x += (dx / dist) * Math.min(dist, 4.5 * dt);
      gk.position.z += (dz / dist) * Math.min(dist, 4.5 * dt);
    }

    gk.rotation = (facingDir > 0) ? Math.PI / 2 : -Math.PI / 2;

    // Check if shot is incoming towards this goal
    const isShotComing = (facingDir > 0 && ball.velocity.x < -10 && ball.position.x < -18) ||
                         (facingDir < 0 && ball.velocity.x > 10 && ball.position.x > 18);

    if (isShotComing && gk.state !== 'dive') {
      const distToBall = gk.position.distanceTo(ball.position);
      if (distToBall < 6.5) {
        // Calculate dive direction
        const diveDir = (ball.position.z > gk.position.z) ? 1 : -1;
        gk.triggerDive(diveDir);

        // Attempt save if within reach
        setTimeout(() => {
          if (gk.position.distanceTo(ball.position) < 3.2 && ball.position.y < 2.6) {
            // Parried or caught!
            ball.velocity.set(-ball.velocity.x * 0.35, 3.5, (Math.random() - 0.5) * 8);
            this.sim.sound.playPostHit();
            this.sim.notify('SAVE BY THE GOALKEEPER!');
          }
        }, 180);
      }
    }
  }

  updateOutfieldAI(dt) {
    const ball = this.sim.ball;
    const isHomePossession = ball.owner && ball.owner.team === 'home';
    const isAwayPossession = ball.owner && ball.owner.team === 'away';

    // Update Home Teammates (excluding user selected player and goalkeeper)
    this.sim.homePlayers.forEach((p, idx) => {
      if (idx === 0 || p === this.sim.activeUserPlayer) return;

      // Base tactical spot in home half
      const base = p.baseFormationSpot;
      const targetPos = new THREE.Vector3();

      if (isHomePossession) {
        // Team pushes forward in attack
        targetPos.x = base.x + (ball.position.x + 52.5) * 0.35 + 4;
        targetPos.z = base.z + (ball.position.z * 0.2);
      } else {
        // Team recovers shape in defense
        targetPos.x = base.x + (ball.position.x + 52.5) * 0.18 - 2;
        targetPos.z = base.z * 0.85;
      }

      this.movePlayerTowards(p, targetPos, dt, 5.2);
    });

    // Update Away Team (AI opponent)
    const awayBallCarrier = (isAwayPossession) ? ball.owner : null;

    this.sim.awayPlayers.forEach((p, idx) => {
      if (idx === 0) return; // skip GK

      if (p === awayBallCarrier) {
        // AI in possession: advance towards goal, pass, or shoot!
        this.updateAIBallCarrier(p, dt);
      } else {
        // Off-ball AI teammates
        const base = p.baseFormationSpot;
        const targetPos = new THREE.Vector3();

        if (isAwayPossession) {
          // Attack: support ball carrier
          targetPos.x = base.x - (52.5 - ball.position.x) * 0.35 - 3;
          targetPos.z = base.z + (ball.position.z * 0.25);
        } else {
          // Defense: press user ball carrier if closest, otherwise mark
          const distToBall = p.position.distanceTo(ball.position);
          const isClosestDefender = this.getClosestDefender('away', ball.position) === p;

          if (isClosestDefender && distToBall < 18) {
            targetPos.copy(ball.position);
            // Attempt tackle if close
            if (distToBall < 1.8 && Math.random() < dt * 0.8) {
              p.triggerTackle();
              this.sim.tackleAttempt(p);
            }
          } else {
            targetPos.x = base.x - (52.5 - ball.position.x) * 0.2 + 2;
            targetPos.z = base.z * 0.85;
          }
        }

        this.movePlayerTowards(p, targetPos, dt, 5.5 * this.sim.difficultyMultiplier);
      }
    });

    // If ball is loose, closest player from each team pursues it
    if (!ball.owner) {
      const closestHome = this.getClosestPlayer('home', ball.position);
      if (closestHome && closestHome !== this.sim.activeUserPlayer && closestHome !== this.sim.homePlayers[0]) {
        this.movePlayerTowards(closestHome, ball.position, dt, 6.8);
      }

      const closestAway = this.getClosestPlayer('away', ball.position);
      if (closestAway && closestAway !== this.sim.awayPlayers[0]) {
        this.movePlayerTowards(closestAway, ball.position, dt, 6.8 * this.sim.difficultyMultiplier);
      }
    }
  }

  updateAIBallCarrier(p, dt) {
    const ball = this.sim.ball;
    const goalPos = new THREE.Vector3(-52.5, 0, 0);
    const distToGoal = p.position.distanceTo(goalPos);

    // Face and move towards home goal
    const dirToGoal = new THREE.Vector3().subVectors(goalPos, p.position).normalize();
    p.rotation = Math.atan2(dirToGoal.x, dirToGoal.z);

    const speed = 5.2 * this.sim.difficultyMultiplier;
    p.velocity.set(dirToGoal.x * speed, 0, dirToGoal.z * speed);
    p.position.addScaledVector(p.velocity, dt);

    // Keep ball glued to feet
    ball.position.set(
      p.position.x + Math.sin(p.rotation) * 0.7,
      ball.radius,
      p.position.z + Math.cos(p.rotation) * 0.7
    );

    // Check shooting opportunity
    if (distToGoal < 26 && p.position.x < -20) {
      if (Math.random() < dt * 1.5) {
        // Unleash shot!
        p.triggerKick();
        const targetZ = (Math.random() - 0.5) * 5.5;
        this.sim.executeAIShot(p, new THREE.Vector3(-52.5, 1.2, targetZ));
        return;
      }
    }

    // Check pass opportunity to teammate in space
    if (Math.random() < dt * 0.6) {
      const openTeammate = this.sim.awayPlayers.find(t =>
        t !== p && !t.isGoalkeeper && t.position.x < p.position.x - 2
      );
      if (openTeammate) {
        p.triggerKick();
        this.sim.executeAIPass(p, openTeammate);
      }
    }
  }

  movePlayerTowards(player, target, dt, maxSpeed) {
    const dx = target.x - player.position.x;
    const dz = target.z - player.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 0.4) {
      const step = Math.min(dist, maxSpeed * dt);
      player.velocity.set((dx / dist) * maxSpeed, 0, (dz / dist) * maxSpeed);
      player.position.x += (dx / dist) * step;
      player.position.z += (dz / dist) * step;
      player.rotation = Math.atan2(dx, dz);
    } else {
      player.velocity.set(0, 0, 0);
    }
  }

  getClosestPlayer(team, pos) {
    const list = (team === 'home') ? this.sim.homePlayers : this.sim.awayPlayers;
    let closest = null;
    let minDist = Infinity;
    list.forEach(p => {
      const d = p.position.distanceTo(pos);
      if (d < minDist) {
        minDist = d;
        closest = p;
      }
    });
    return closest;
  }

  getClosestDefender(team, pos) {
    const list = (team === 'home') ? this.sim.homePlayers : this.sim.awayPlayers;
    let closest = null;
    let minDist = Infinity;
    list.forEach(p => {
      if (p.isGoalkeeper) return;
      const d = p.position.distanceTo(pos);
      if (d < minDist) {
        minDist = d;
        closest = p;
      }
    });
    return closest;
  }
}
