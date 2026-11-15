/**
 * FC 27 - 3D Match Official / Referee Entity (Three.js)
 * Implements a match official dressed in distinctive neon yellow kit
 * who patrols the pitch following play, maintaining tactical distance,
 * and gesturing for fouls, kick-offs, and goals.
 */

export class Referee3D {
  constructor(scene) {
    this.scene = scene;

    this.group = new THREE.Group();
    this.group.scale.set(1.5, 1.5, 1.5);
    this.scene.add(this.group);

    this.position = new THREE.Vector3(0, 0, 8);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = 0;
    this.animTime = 0;

    this.build();
  }

  build() {
    // Official Referee Colors: Neon Volt Yellow shirt, black shorts, black socks
    const refShirtMat = new THREE.MeshStandardMaterial({ color: 0xffee00, roughness: 0.6 });
    const refShortsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const refSocksMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const refSkinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.75 });
    const refBootMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });

    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    // Torso (Referee Jersey with black chest stripe)
    const torsoGeo = new THREE.BoxGeometry(0.52, 0.62, 0.3);
    const torso = new THREE.Mesh(torsoGeo, refShirtMat);
    torso.position.y = 1.25;
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    // Official Badge patch on chest
    const badgeGeo = new THREE.PlaneGeometry(0.12, 0.12);
    const badgeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(-0.14, 1.35, 0.16);
    this.bodyGroup.add(badge);

    // Head
    const neckGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.14, 8);
    const neck = new THREE.Mesh(neckGeo, refSkinMat);
    neck.position.y = 1.62;
    this.bodyGroup.add(neck);

    const headGeo = new THREE.SphereGeometry(0.17, 12, 12);
    const head = new THREE.Mesh(headGeo, refSkinMat);
    head.position.y = 1.8;
    head.castShadow = true;
    this.bodyGroup.add(head);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.52, 8);
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.33, 1.48, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, refShirtMat);
    leftArmMesh.position.y = -0.24;
    this.leftArm.add(leftArmMesh);
    this.bodyGroup.add(this.leftArm);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.33, 1.48, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, refShirtMat);
    rightArmMesh.position.y = -0.24;
    this.rightArm.add(rightArmMesh);
    this.bodyGroup.add(this.rightArm);

    // Pelvis & Shorts
    const hipsGeo = new THREE.BoxGeometry(0.5, 0.26, 0.28);
    const hips = new THREE.Mesh(hipsGeo, refShortsMat);
    hips.position.y = 0.88;
    this.bodyGroup.add(hips);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.48, 8);
    const calfGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.42, 8);
    const footGeo = new THREE.BoxGeometry(0.11, 0.09, 0.24);

    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.15, 0.76, 0);
    const lThigh = new THREE.Mesh(legGeo, refShortsMat);
    lThigh.position.y = -0.2;
    this.leftLeg.add(lThigh);
    const lCalf = new THREE.Mesh(calfGeo, refSocksMat);
    lCalf.position.y = -0.52;
    this.leftLeg.add(lCalf);
    const lFoot = new THREE.Mesh(footGeo, refBootMat);
    lFoot.position.set(0, -0.74, 0.06);
    this.leftLeg.add(lFoot);
    this.bodyGroup.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.15, 0.76, 0);
    const rThigh = new THREE.Mesh(legGeo, refShortsMat);
    rThigh.position.y = -0.2;
    this.rightLeg.add(rThigh);
    const rCalf = new THREE.Mesh(calfGeo, refSocksMat);
    rCalf.position.y = -0.52;
    this.rightLeg.add(rCalf);
    const rFoot = new THREE.Mesh(footGeo, refBootMat);
    rFoot.position.set(0, -0.74, 0.06);
    this.rightLeg.add(rFoot);
    this.bodyGroup.add(this.rightLeg);
  }

  update(dt, ballPos) {
    this.animTime += dt;

    // Tactical referee positioning:
    // Follow the ball in a diagonal patrol lane, staying ~10 meters away from play
    const targetX = ballPos.x * 0.7;
    const targetZ = ballPos.z > 0 ? (ballPos.z - 9) : (ballPos.z + 9);

    const dx = targetX - this.position.x;
    const dz = targetZ - this.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 1.5) {
      const speed = Math.min(6.5, dist * 1.5);
      this.position.x += (dx / dist) * speed * dt;
      this.position.z += (dz / dist) * speed * dt;
      this.rotation = Math.atan2(dx, dz);

      // Running animation
      const stride = Math.sin(this.animTime * 10) * 0.7;
      this.leftLeg.rotation.x = stride;
      this.rightLeg.rotation.x = -stride;
      this.leftArm.rotation.x = -stride * 0.7;
      this.rightArm.rotation.x = stride * 0.7;
    } else {
      // Idle watching play
      this.leftLeg.rotation.set(0, 0, 0);
      this.rightLeg.rotation.set(0, 0, 0);
      this.leftArm.rotation.set(0, 0, 0);
      this.rightArm.rotation.set(0, 0, 0);

      // Turn to face the ball
      const faceDx = ballPos.x - this.position.x;
      const faceDz = ballPos.z - this.position.z;
      this.rotation = Math.atan2(faceDx, faceDz);
    }

    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotation;
  }

  dispose() {
    this.scene.remove(this.group);
  }
}
