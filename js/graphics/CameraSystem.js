/**
 * FC 27 - AAA Dynamic Broadcast Camera System (Three.js)
 * Supports TV Broadcast, Tele 3D, End-to-End, Pro Cam, and Cinematic Orbits.
 */

export class CameraSystem {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target; // typically ball or player
    this.mode = 'broadcast'; // 'broadcast', 'tele', 'end_to_end', 'pro_cam', 'cinematic_orbit', 'goal_celebration'
    this.currentPos = new THREE.Vector3(0, 24, 38);
    this.lookAtTarget = new THREE.Vector3(0, 0, 0);
    this.orbitAngle = 0;
    this.smoothDamping = 0.08;
    this.celebratingPlayer = null;
  }

  setMode(mode) {
    this.mode = mode;
  }

  triggerCelebration(player) {
    this.mode = 'goal_celebration';
    this.celebratingPlayer = player;
  }

  update(dt, ballPos, activePlayer) {
    this.orbitAngle += dt * 0.25;

    let desiredPos = new THREE.Vector3();
    let desiredLookAt = new THREE.Vector3();

    switch (this.mode) {
      case 'broadcast': {
        // TV Broadcast Camera: elevated side-line with lead-in and dynamic zoom
        const leadX = (ballPos.x * 0.75);
        const pitchCloseness = Math.abs(ballPos.x) / 52.5; // 0 at center, 1 at goal line
        const zoomY = 22 - pitchCloseness * 4;
        const zoomZ = 36 - pitchCloseness * 5;

        desiredPos.set(leadX, zoomY, zoomZ);
        desiredLookAt.set(ballPos.x * 0.9, ballPos.y * 0.5, ballPos.z * 0.5);
        break;
      }

      case 'tele': {
        // Higher tactical camera
        desiredPos.set(ballPos.x * 0.6, 32, 45);
        desiredLookAt.set(ballPos.x * 0.8, 0, ballPos.z * 0.4);
        break;
      }

      case 'end_to_end': {
        // Behind Home goal looking down length of pitch
        const sideOffset = ballPos.z * 0.35;
        desiredPos.set(ballPos.x - 22, 16, sideOffset);
        desiredLookAt.set(ballPos.x + 10, 0, ballPos.z);
        break;
      }

      case 'pro_cam': {
        // Third-person behind active player
        if (activePlayer) {
          const behindAngle = activePlayer.rotation + Math.PI;
          const dist = 7.5;
          desiredPos.set(
            activePlayer.position.x + Math.sin(behindAngle) * dist,
            activePlayer.position.y + 3.8,
            activePlayer.position.z + Math.cos(behindAngle) * dist
          );
          desiredLookAt.set(
            activePlayer.position.x,
            activePlayer.position.y + 1.2,
            activePlayer.position.z
          );
        } else {
          desiredPos.set(ballPos.x, 20, ballPos.z + 25);
          desiredLookAt.copy(ballPos);
        }
        break;
      }

      case 'cinematic_orbit': {
        // Slow cinematic orbit around stadium center for menus and cutscenes
        const radius = 55;
        desiredPos.set(
          Math.cos(this.orbitAngle) * radius,
          18 + Math.sin(this.orbitAngle * 0.7) * 4,
          Math.sin(this.orbitAngle) * radius
        );
        desiredLookAt.set(0, 2, 0);
        break;
      }

      case 'goal_celebration': {
        // Tight low-angle tracking shot of celebrating player
        const target = this.celebratingPlayer ? this.celebratingPlayer.position : ballPos;
        desiredPos.set(target.x + 3.5, 1.8, target.z + 4);
        desiredLookAt.set(target.x, 1.2, target.z);
        break;
      }
    }

    // Smooth interpolation (lerp)
    this.currentPos.lerp(desiredPos, this.smoothDamping);
    this.lookAtTarget.lerp(desiredLookAt, this.smoothDamping);

    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.lookAtTarget);
  }
}

