/**
 * FC 27 - 3D Player Entity & Skeletal Animation Model (Three.js)
 * Constructs procedural 3D football players with team kits, squad numbers,
 * boots, skin tones, and keyframe/procedural animations for running, striking,
 * slide tackling, goalkeeper diving, and goal celebrations.
 */

export class Player3D {
  constructor(scene, playerInfo, teamKit, isGoalkeeper = false) {
    this.scene = scene;
    this.info = playerInfo;
    this.teamKit = teamKit;
    this.isGoalkeeper = isGoalkeeper;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Gameplay state
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.targetPos = new THREE.Vector3(0, 0, 0);
    this.rotation = 0; // angle in radians
    this.speed = 0;
    this.stamina = 100;
    this.isSelected = false;
    this.state = 'idle'; // 'idle', 'run', 'sprint', 'kick', 'tackle', 'dive', 'celebrate'
    this.animTime = Math.random() * 10;
    this.kickProgress = 0;
    this.tackleProgress = 0;
    this.diveProgress = 0;
    this.diveDirection = 1; // 1 for right, -1 for left

    this.build();
  }

  build() {
    // Colors
    const kit = this.isGoalkeeper ? (this.teamKit.gkKit || this.teamKit) : this.teamKit;
    const shirtColor = parseInt((kit.shirt || '#00b4d8').replace('#', '0x'), 16);
    const shortsColor = parseInt((kit.shorts || '#03045e').replace('#', '0x'), 16);
    const socksColor = parseInt((kit.socks || '#00b4d8').replace('#', '0x'), 16);
    const bootColor = 0x111827;

    // Skin tones variation based on face style
    let skinHex = 0xd4a373;
    let hairHex = 0x2b1d0c;
    if (this.info.face?.includes('black')) {
      skinHex = 0x6f4e37;
      hairHex = 0x111111;
    } else if (this.info.face?.includes('asian')) {
      skinHex = 0xe8c39e;
      hairHex = 0x1a1a1a;
    } else if (this.info.face?.includes('blonde')) {
      skinHex = 0xf5d0b5;
      hairHex = 0xcc9933;
    }

    // Materials
    this.shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.65 });
    this.shortsMat = new THREE.MeshStandardMaterial({ color: shortsColor, roughness: 0.7 });
    this.socksMat = new THREE.MeshStandardMaterial({ color: socksColor, roughness: 0.7 });
    this.skinMat = new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.8 });
    this.hairMat = new THREE.MeshStandardMaterial({ color: hairHex, roughness: 0.9 });
    this.bootMat = new THREE.MeshStandardMaterial({ color: bootColor, roughness: 0.4 });

    // Hierarchy Structure:
    // group -> bodyGroup (for torso, head, arms) -> pelvis -> legs

    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    // Torso / Jersey
    const torsoGeo = new THREE.BoxGeometry(0.55, 0.65, 0.32);
    this.torso = new THREE.Mesh(torsoGeo, this.shirtMat);
    this.torso.position.y = 1.25;
    this.torso.castShadow = true;
    this.bodyGroup.add(this.torso);

    // Head & Neck
    const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.15, 8);
    const neck = new THREE.Mesh(neckGeo, this.skinMat);
    neck.position.y = 1.62;
    this.bodyGroup.add(neck);

    const headGeo = new THREE.SphereGeometry(0.18, 12, 12);
    this.head = new THREE.Mesh(headGeo, this.skinMat);
    this.head.position.y = 1.82;
    this.head.castShadow = true;
    this.bodyGroup.add(this.head);

    // Hair cap
    const hairGeo = new THREE.SphereGeometry(0.19, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hair = new THREE.Mesh(hairGeo, this.hairMat);
    hair.position.y = 1.84;
    this.bodyGroup.add(hair);

    // Arms (Shoulder Pivot)
    const armGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.55, 8);

    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.35, 1.5, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, this.shirtMat);
    leftArmMesh.position.y = -0.25;
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);
    // Left Hand
    const handGeo = new THREE.SphereGeometry(0.07, 6, 6);
    const leftHand = new THREE.Mesh(handGeo, this.skinMat);
    leftHand.position.y = -0.55;
    this.leftArm.add(leftHand);
    this.bodyGroup.add(this.leftArm);

    // Right Arm
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.35, 1.5, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, this.shirtMat);
    rightArmMesh.position.y = -0.25;
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);
    // Right Hand
    const rightHand = new THREE.Mesh(handGeo, this.skinMat);
    rightHand.position.y = -0.55;
    this.rightArm.add(rightHand);
    this.bodyGroup.add(this.rightArm);

    // Pelvis & Shorts
    const hipsGeo = new THREE.BoxGeometry(0.52, 0.28, 0.3);
    const hips = new THREE.Mesh(hipsGeo, this.shortsMat);
    hips.position.y = 0.88;
    this.bodyGroup.add(hips);

    // Legs (Hip Pivot)
    const legGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.5, 8);
    const calfGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.45, 8);
    const footGeo = new THREE.BoxGeometry(0.12, 0.1, 0.26);

    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.16, 0.78, 0);
    const leftThigh = new THREE.Mesh(legGeo, this.shortsMat);
    leftThigh.position.y = -0.22;
    leftThigh.castShadow = true;
    this.leftLeg.add(leftThigh);

    const leftCalf = new THREE.Mesh(calfGeo, this.socksMat);
    leftCalf.position.y = -0.55;
    leftCalf.castShadow = true;
    this.leftLeg.add(leftCalf);

    const leftFoot = new THREE.Mesh(footGeo, this.bootMat);
    leftFoot.position.set(0, -0.78, 0.07);
    this.leftLeg.add(leftFoot);
    this.bodyGroup.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.16, 0.78, 0);
    const rightThigh = new THREE.Mesh(legGeo, this.shortsMat);
    rightThigh.position.y = -0.22;
    rightThigh.castShadow = true;
    this.rightLeg.add(rightThigh);

    const rightCalf = new THREE.Mesh(calfGeo, this.socksMat);
    rightCalf.position.y = -0.55;
    rightCalf.castShadow = true;
    this.rightLeg.add(rightCalf);

    const rightFoot = new THREE.Mesh(footGeo, this.bootMat);
    rightFoot.position.set(0, -0.78, 0.07);
    this.rightLeg.add(rightFoot);
    this.bodyGroup.add(this.rightLeg);

    // Selected Player Floating Indicator (Volt Chevron)
    const indGeo = new THREE.ConeGeometry(0.22, 0.35, 4);
    const indMat = new THREE.MeshBasicMaterial({ color: 0x00ff87 });
    this.indicator = new THREE.Mesh(indGeo, indMat);
    this.indicator.rotation.x = Math.PI; // point downward
    this.indicator.position.set(0, 2.35, 0);
    this.indicator.visible = false;
    this.group.add(this.indicator);

    // Ground Selection Ring (Turf Reticle)
    const ringGeo = new THREE.RingGeometry(0.65, 0.85, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ff87,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    this.groundRing = new THREE.Mesh(ringGeo, ringMat);
    this.groundRing.rotation.x = -Math.PI / 2;
    this.groundRing.position.y = 0.04;
    this.groundRing.visible = false;
    this.group.add(this.groundRing);
  }

  setSelected(selected) {
    this.isSelected = selected;
    this.indicator.visible = selected;
    this.groundRing.visible = selected;
  }

  triggerKick() {
    this.state = 'kick';
    this.kickProgress = 1.0;
  }

  triggerTackle() {
    this.state = 'tackle';
    this.tackleProgress = 1.0;
  }

  triggerDive(direction = 1) {
    this.state = 'dive';
    this.diveProgress = 1.0;
    this.diveDirection = direction;
  }

  triggerCelebrate() {
    this.state = 'celebrate';
  }

  update(dt) {
    this.animTime += dt;

    // Sync group position
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotation;

    // Indicator floating bob
    if (this.isSelected) {
      this.indicator.position.y = 2.35 + Math.sin(this.animTime * 6) * 0.08;
      this.groundRing.rotation.z = this.animTime * 2;
    }

    const currentSpeed = this.velocity.length();

    // State machine animation logic
    if (this.kickProgress > 0) {
      // Striking animation
      this.kickProgress -= dt * 4.5;
      const progress = 1 - Math.max(0, this.kickProgress);
      const kickPhase = Math.sin(progress * Math.PI);

      this.rightLeg.rotation.x = -kickPhase * 1.35; // strike forward
      this.leftLeg.rotation.x = 0.2; // plant foot
      this.torso.rotation.x = 0.35; // lean over the ball
      this.leftArm.rotation.x = kickPhase * 0.9;
      this.rightArm.rotation.x = -kickPhase * 0.9;

      if (this.kickProgress <= 0) {
        this.resetLimbs();
        this.state = 'idle';
      }
      return;
    }

    if (this.tackleProgress > 0) {
      // Slide tackle animation
      this.tackleProgress -= dt * 2.8;
      const progress = 1 - Math.max(0, this.tackleProgress);
      const slide = Math.sin(progress * Math.PI);

      this.bodyGroup.position.y = -slide * 0.55;
      this.torso.rotation.x = -slide * 0.8;
      this.rightLeg.rotation.x = -slide * 1.4; // extended lead leg
      this.leftLeg.rotation.x = slide * 0.6; // tucked trail leg

      if (this.tackleProgress <= 0) {
        this.resetLimbs();
        this.bodyGroup.position.y = 0;
        this.state = 'idle';
      }
      return;
    }

    if (this.diveProgress > 0) {
      // Goalkeeper dive animation
      this.diveProgress -= dt * 2.2;
      const progress = 1 - Math.max(0, this.diveProgress);
      const diveArc = Math.sin(progress * Math.PI);

      this.bodyGroup.position.y = diveArc * 0.8;
      this.bodyGroup.position.x = this.diveDirection * diveArc * 1.5;
      this.bodyGroup.rotation.z = -this.diveDirection * diveArc * 1.25;

      this.leftArm.rotation.z = -this.diveDirection * 1.4;
      this.rightArm.rotation.z = -this.diveDirection * 1.4;

      if (this.diveProgress <= 0) {
        this.resetLimbs();
        this.bodyGroup.position.set(0, 0, 0);
        this.bodyGroup.rotation.z = 0;
        this.state = 'idle';
      }
      return;
    }

    if (this.state === 'celebrate') {
      // Arms up in air celebration
      this.leftArm.rotation.z = 2.4;
      this.rightArm.rotation.z = -2.4;
      this.leftArm.rotation.x = Math.sin(this.animTime * 8) * 0.3;
      this.rightArm.rotation.x = Math.sin(this.animTime * 8) * 0.3;
      this.head.rotation.x = -0.4; // look up at sky
      return;
    }

    // Locomotion (Running / Sprinting)
    if (currentSpeed > 0.4) {
      const isSprinting = currentSpeed > 6.5;
      const strideFreq = isSprinting ? 14 : 10;
      const strideAmp = isSprinting ? 0.95 : 0.65;

      const legAngle = Math.sin(this.animTime * strideFreq) * strideAmp;
      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;

      this.leftArm.rotation.x = -legAngle * 0.85;
      this.rightArm.rotation.x = legAngle * 0.85;

      // Subtle torso forward lean into sprint
      this.torso.rotation.x = isSprinting ? 0.28 : 0.14;
      // Slight vertical head bob
      this.bodyGroup.position.y = Math.abs(Math.sin(this.animTime * strideFreq)) * 0.08;
    } else {
      // Idle state
      this.resetLimbs();
      // Gentle breathing motion
      this.bodyGroup.position.y = Math.sin(this.animTime * 2.5) * 0.02;
      this.leftArm.rotation.z = 0.08 + Math.sin(this.animTime * 2.5) * 0.04;
      this.rightArm.rotation.z = -0.08 - Math.sin(this.animTime * 2.5) * 0.04;
    }
  }

  resetLimbs() {
    this.leftLeg.rotation.set(0, 0, 0);
    this.rightLeg.rotation.set(0, 0, 0);
    this.leftArm.rotation.set(0, 0, 0);
    this.rightArm.rotation.set(0, 0, 0);
    this.torso.rotation.set(0, 0, 0);
    this.head.rotation.set(0, 0, 0);
  }

  dispose() {
    this.scene.remove(this.group);
  }
}

