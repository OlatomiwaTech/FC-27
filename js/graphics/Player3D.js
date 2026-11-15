/**
 * FC 27 - 3D Player Entity & Skeletal Animation Model (Three.js)
 * Enhanced Heroic Scaling, Overhead Nameplate, Dynamic Speed Aura (User Image 3),
 * Turf Spray Particles, and Knee-Slide Celebrations.
 */

export class Player3D {
  constructor(scene, playerInfo, teamKit, isGoalkeeper = false) {
    this.scene = scene;
    this.info = playerInfo;
    this.teamKit = teamKit;
    this.isGoalkeeper = isGoalkeeper;

    this.group = new THREE.Group();
    // Scale up player to be heroic and clearly visible on pitch
    this.group.scale.set(1.55, 1.55, 1.55);
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
    this.celebrateProgress = 0;
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

    // Skin tones variation
    let skinHex = 0xd4a373;
    let hairHex = 0x2b1d0c;
    if (this.info.face?.includes('black')) {
      skinHex = 0x5a3d28;
      hairHex = 0x111111;
    } else if (this.info.face?.includes('asian')) {
      skinHex = 0xe8c39e;
      hairHex = 0x1a1a1a;
    } else if (this.info.face?.includes('blonde')) {
      skinHex = 0xf5d0b5;
      hairHex = 0xd4af37;
    }

    // Materials with slight emissive accent to pop under lights
    this.shirtMat = new THREE.MeshStandardMaterial({
      color: shirtColor,
      roughness: 0.5,
      metalness: 0.15
    });
    this.shortsMat = new THREE.MeshStandardMaterial({
      color: shortsColor,
      roughness: 0.6
    });
    this.socksMat = new THREE.MeshStandardMaterial({
      color: socksColor,
      roughness: 0.6
    });
    this.skinMat = new THREE.MeshStandardMaterial({
      color: skinHex,
      roughness: 0.75
    });
    this.hairMat = new THREE.MeshStandardMaterial({
      color: hairHex,
      roughness: 0.85
    });
    this.bootMat = new THREE.MeshStandardMaterial({
      color: bootColor,
      roughness: 0.35,
      metalness: 0.2
    });

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

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.55, 8);

    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.35, 1.5, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, this.shirtMat);
    leftArmMesh.position.y = -0.25;
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);
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
    const rightHand = new THREE.Mesh(handGeo, this.skinMat);
    rightHand.position.y = -0.55;
    this.rightArm.add(rightHand);
    this.bodyGroup.add(this.rightArm);

    // Pelvis & Shorts
    const hipsGeo = new THREE.BoxGeometry(0.52, 0.28, 0.3);
    const hips = new THREE.Mesh(hipsGeo, this.shortsMat);
    hips.position.y = 0.88;
    this.bodyGroup.add(hips);

    // Legs
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

    // Overhead Floating Billboard Nameplate (Canvas Texture)
    this.createNameplate();

    // Glowing Speed Aura & Speed Fins (User Image 3 style)
    this.createSpeedAura();

    // Turf Kick-up Particles
    this.createTurfParticles();
  }

  createNameplate() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Rounded dark pill
    ctx.fillStyle = 'rgba(6, 12, 20, 0.88)';
    ctx.strokeStyle = '#00ff87';
    ctx.lineWidth = 4;

    const r = 24;
    ctx.beginPath();
    ctx.roundRect(8, 8, canvas.width - 16, canvas.height - 16, r);
    ctx.fill();
    ctx.stroke();

    // Text: Number + Name
    ctx.font = 'bold 28px "Segoe UI", sans-serif';
    ctx.fillStyle = '#00ff87';
    ctx.fillText(String(this.info.num), 24, 42);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    const shortName = this.info.name.split(' ').pop().toUpperCase();
    ctx.fillText(shortName, 68, 41);

    const nameTex = new THREE.CanvasTexture(canvas);
    const nameGeo = new THREE.PlaneGeometry(1.2, 0.32);
    const nameMat = new THREE.MeshBasicMaterial({
      map: nameTex,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.nameplate = new THREE.Mesh(nameGeo, nameMat);
    this.nameplate.position.set(0, 2.5, 0);
    this.nameplate.visible = false;
    this.group.add(this.nameplate);
  }

  createSpeedAura() {
    // 1. Neon Volt Ground Ring
    const ringGeo = new THREE.RingGeometry(0.7, 0.95, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ff87,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    this.groundRing = new THREE.Mesh(ringGeo, ringMat);
    this.groundRing.rotation.x = -Math.PI / 2;
    this.groundRing.position.y = 0.05;
    this.groundRing.visible = false;
    this.group.add(this.groundRing);

    // 2. Cyan Speed Wings (User Image 3 aura fins)
    const wingGeo = new THREE.RingGeometry(0.95, 1.25, 32, 1, 0, Math.PI * 0.7);
    const wingMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    this.speedWings = new THREE.Mesh(wingGeo, wingMat);
    this.speedWings.rotation.x = -Math.PI / 2;
    this.speedWings.rotation.z = Math.PI * 0.65;
    this.speedWings.position.y = 0.06;
    this.speedWings.visible = false;
    this.group.add(this.speedWings);

    // 3. Floating 3D Pointer Chevron
    const indGeo = new THREE.ConeGeometry(0.24, 0.4, 4);
    const indMat = new THREE.MeshBasicMaterial({ color: 0x00ff87 });
    this.indicator = new THREE.Mesh(indGeo, indMat);
    this.indicator.rotation.x = Math.PI;
    this.indicator.position.set(0, 2.8, 0);
    this.indicator.visible = false;
    this.group.add(this.indicator);
  }

  createTurfParticles() {
    const pCount = 18;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 0.4;
      positions[i + 1] = Math.random() * 0.3;
      positions[i + 2] = -0.4 - Math.random() * 0.6;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0x497346,
      size: 0.12,
      transparent: true,
      opacity: 0
    });
    this.turfParticles = new THREE.Points(pGeo, pMat);
    this.group.add(this.turfParticles);
  }

  setSelected(selected) {
    this.isSelected = selected;
    this.indicator.visible = selected;
    this.groundRing.visible = selected;
    this.speedWings.visible = selected;
    this.nameplate.visible = selected;
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
    this.celebrateProgress = 1.0;
  }

  update(dt) {
    this.animTime += dt;

    // Sync group position
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotation;

    // Active Indicator animations
    if (this.isSelected) {
      this.indicator.position.y = 2.8 + Math.sin(this.animTime * 6) * 0.08;
      this.groundRing.rotation.z = this.animTime * 2.5;
      this.speedWings.rotation.z = this.animTime * 3.5;
      if (this.nameplate) {
        this.nameplate.rotation.y = -this.rotation;
        this.nameplate.rotation.x = -0.35;
      }
    }

    const currentSpeed = this.velocity.length();

    // Turf kick-up particles when sprinting or tackling
    if (currentSpeed > 6.5 || this.tackleProgress > 0) {
      this.turfParticles.material.opacity = Math.min(0.8, this.turfParticles.material.opacity + dt * 4);
    } else {
      this.turfParticles.material.opacity = Math.max(0, this.turfParticles.material.opacity - dt * 4);
    }

    // State machine animations
    if (this.kickProgress > 0) {
      this.kickProgress -= dt * 4.5;
      const progress = 1 - Math.max(0, this.kickProgress);
      const kickPhase = Math.sin(progress * Math.PI);

      this.rightLeg.rotation.x = -kickPhase * 1.35;
      this.leftLeg.rotation.x = 0.2;
      this.torso.rotation.x = 0.35;
      this.leftArm.rotation.x = kickPhase * 0.9;
      this.rightArm.rotation.x = -kickPhase * 0.9;

      if (this.kickProgress <= 0) {
        this.resetLimbs();
        this.state = 'idle';
      }
      return;
    }

    if (this.tackleProgress > 0) {
      this.tackleProgress -= dt * 2.8;
      const progress = 1 - Math.max(0, this.tackleProgress);
      const slide = Math.sin(progress * Math.PI);

      this.bodyGroup.position.y = -slide * 0.55;
      this.torso.rotation.x = -slide * 0.8;
      this.rightLeg.rotation.x = -slide * 1.4;
      this.leftLeg.rotation.x = slide * 0.6;

      if (this.tackleProgress <= 0) {
        this.resetLimbs();
        this.bodyGroup.position.y = 0;
        this.state = 'idle';
      }
      return;
    }

    if (this.diveProgress > 0) {
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

    // Knee-Slide Goal Celebration Animation
    if (this.state === 'celebrate') {
      this.celebrateProgress = Math.max(0, this.celebrateProgress - dt * 0.25);
      const slidePhase = Math.sin((1 - this.celebrateProgress) * Math.PI);

      // Knee slide on turf: body low, knees bent, chest puffed, double fist pump!
      this.bodyGroup.position.y = -0.45;
      this.torso.rotation.x = -0.3;
      this.leftLeg.rotation.x = 1.1;
      this.rightLeg.rotation.x = 1.1;

      // Double fist pump
      this.leftArm.rotation.z = 2.4 + Math.sin(this.animTime * 8) * 0.2;
      this.rightArm.rotation.z = -2.4 - Math.sin(this.animTime * 8) * 0.2;
      this.head.rotation.x = -0.4; // roaring at fans
      return;
    }

    // Locomotion & Dribble Step-overs
    if (currentSpeed > 0.4) {
      const isSprinting = currentSpeed > 6.5;
      const strideFreq = isSprinting ? 14 : 10;
      const strideAmp = isSprinting ? 0.95 : 0.65;

      const legAngle = Math.sin(this.animTime * strideFreq) * strideAmp;
      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;

      // Step-over feint motion when dribbling at high speed
      if (isSprinting) {
        this.leftLeg.rotation.z = Math.cos(this.animTime * strideFreq) * 0.25;
        this.rightLeg.rotation.z = -Math.cos(this.animTime * strideFreq) * 0.25;
      } else {
        this.leftLeg.rotation.z = 0;
        this.rightLeg.rotation.z = 0;
      }

      this.leftArm.rotation.x = -legAngle * 0.85;
      this.rightArm.rotation.x = legAngle * 0.85;

      this.torso.rotation.x = isSprinting ? 0.28 : 0.14;
      this.bodyGroup.position.y = Math.abs(Math.sin(this.animTime * strideFreq)) * 0.08;
    } else {
      this.resetLimbs();
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
    this.bodyGroup.position.y = 0;
  }

  dispose() {
    this.scene.remove(this.group);
  }
}
