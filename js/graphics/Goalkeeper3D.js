/**
 * FC 27 - 3D Goalkeeper Entity with Special Animations
 * Features: Dive saves, glove catching, wall positioning, and unique visual style
 */

export class Goalkeeper3D {
  constructor(scene, playerInfo, teamKit) {
    this.scene = scene;
    this.info = playerInfo;
    this.teamKit = teamKit;
    this.isGoalkeeper = true;

    this.group = new THREE.Group();
    this.group.scale.set(1.6, 1.6, 1.6);
    this.scene.add(this.group);

    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.targetPos = new THREE.Vector3(0, 0, 0);
    this.rotation = 0;
    this.speed = 0;
    this.stamina = 100;
    this.isSelected = false;
    this.state = 'idle';
    this.animTime = Math.random() * 10;
    this.diveProgress = 0;
    this.diveDirection = new THREE.Vector3(0, 0, 0);
    this.catchProgress = 0;
    this.throwProgress = 0;
    this.punchProgress = 0;

    this.gloveColor = 0xffffff;
    this.isHoldingBall = false;
    this.saveCount = 0;
    this.cleanSheet = true;

    this.build();
  }

  build() {
    const kit = this.teamKit.gkKit || this.teamKit;
    const shirtColor = parseInt((kit.shirt || '#0077b6').replace('#', '0x'), 16);
    const shortsColor = parseInt((kit.shorts || '#000000').replace('#', '0x'), 16);
    const socksColor = parseInt((kit.socks || '#ffffff').replace('#', '0x'), 16);
    const gloveColor = parseInt((kit.accent || '#ffffff').replace('#', '0x'), 16);
    this.gloveColor = gloveColor;

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

    this.shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5, metalness: 0.12 });
    this.shortsMat = new THREE.MeshStandardMaterial({ color: shortsColor, roughness: 0.6 });
    this.socksMat = new THREE.MeshStandardMaterial({ color: socksColor, roughness: 0.6 });
    this.skinMat = new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.7 });
    this.hairMat = new THREE.MeshStandardMaterial({ color: hairHex, roughness: 0.85 });
    this.gloveMat = new THREE.MeshStandardMaterial({ color: gloveColor, roughness: 0.4, metalness: 0.15 });

    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    const torsoGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.75, 8);
    this.torso = new THREE.Mesh(torsoGeo, this.shirtMat);
    this.torso.position.y = 1.3;
    this.torso.castShadow = true;
    this.bodyGroup.add(this.torso);

    const backPlateGeo = new THREE.PlaneGeometry(0.45, 0.52);
    const backPlate = new THREE.Mesh(backPlateGeo, this.createJerseyBackTexture(kit.shirt || '#0077b6', kit.accent || '#ffffff'));
    backPlate.position.set(0, 1.32, -0.25);
    backPlate.rotation.y = Math.PI;
    this.bodyGroup.add(backPlate);

    const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.16, 8);
    const neck = new THREE.Mesh(neckGeo, this.skinMat);
    neck.position.y = 1.68;
    this.bodyGroup.add(neck);

    const headGeo = new THREE.SphereGeometry(0.21, 16, 16);
    this.head = new THREE.Mesh(headGeo, this.skinMat);
    this.head.position.y = 1.92;
    this.head.castShadow = true;
    this.bodyGroup.add(this.head);

    const eyeGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xfafafa });
    const pupilGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });

    const leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    leftEye.position.set(-0.075, 1.94, 0.18);
    this.bodyGroup.add(leftEye);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.075, 1.94, 0.21);
    this.bodyGroup.add(leftPupil);

    const rightEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    rightEye.position.set(0.075, 1.94, 0.18);
    this.bodyGroup.add(rightEye);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.075, 1.94, 0.21);
    this.bodyGroup.add(rightPupil);

    const jawGeo = new THREE.BoxGeometry(0.1, 0.06, 0.08);
    const jawMat = new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.7 });
    const jaw = new THREE.Mesh(jawGeo, jawMat);
    jaw.position.set(0, 1.84, 0.16);
    this.bodyGroup.add(jaw);

    const mouthGeo = new THREE.BoxGeometry(0.08, 0.02, 0.03);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 1.82, 0.19);
    this.bodyGroup.add(mouth);

    const hairGeo = new THREE.SphereGeometry(0.22, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hair = new THREE.Mesh(hairGeo, this.hairMat);
    hair.position.y = 1.94;
    this.bodyGroup.add(hair);

    const capGeo = new THREE.CylinderGeometry(0.23, 0.21, 0.08, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(0, 1.98, 0);
    cap.rotation.x = Math.PI / 2;
    this.bodyGroup.add(cap);

    const upperArmGeo = new THREE.CylinderGeometry(0.085, 0.075, 0.38, 8);
    const forearmGeo = new THREE.CylinderGeometry(0.07, 0.065, 0.34, 8);

    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.4, 1.55, 0);
    const leftUpperArm = new THREE.Mesh(upperArmGeo, this.shirtMat);
    leftUpperArm.position.y = -0.16;
    leftUpperArm.castShadow = true;
    this.leftArm.add(leftUpperArm);
    const leftForearm = new THREE.Mesh(forearmGeo, this.shirtMat);
    leftForearm.position.y = -0.42;
    this.leftArm.add(leftForearm);
    this.leftGlove = this.createGlove();
    this.leftGlove.position.set(0, -0.65, 0);
    this.leftArm.add(this.leftGlove);
    this.bodyGroup.add(this.leftArm);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.4, 1.55, 0);
    const rightUpperArm = new THREE.Mesh(upperArmGeo, this.shirtMat);
    rightUpperArm.position.y = -0.16;
    rightUpperArm.castShadow = true;
    this.rightArm.add(rightUpperArm);
    const rightForearm = new THREE.Mesh(forearmGeo, this.shirtMat);
    rightForearm.position.y = -0.42;
    this.rightArm.add(rightForearm);
    this.rightGlove = this.createGlove();
    this.rightGlove.position.set(0, -0.65, 0);
    this.rightArm.add(this.rightGlove);
    this.bodyGroup.add(this.rightArm);

    const hipsGeo = new THREE.CylinderGeometry(0.28, 0.26, 0.28, 8);
    const hips = new THREE.Mesh(hipsGeo, this.shortsMat);
    hips.position.y = 0.95;
    this.bodyGroup.add(hips);

    const hipPadGeo = new THREE.BoxGeometry(0.32, 0.1, 0.12);
    const hipPadMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
    const hipPad = new THREE.Mesh(hipPadGeo, hipPadMat);
    hipPad.position.set(0, 0.9, -0.08);
    this.bodyGroup.add(hipPad);

    const thighGeo = new THREE.CylinderGeometry(0.12, 0.095, 0.45, 8);
    const calfGeo = new THREE.CylinderGeometry(0.095, 0.075, 0.42, 8);

    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.18, 0.82, 0);
    const leftThigh = new THREE.Mesh(thighGeo, this.shortsMat);
    leftThigh.position.y = -0.2;
    leftThigh.castShadow = true;
    this.leftLeg.add(leftThigh);
    const leftCalf = new THREE.Mesh(calfGeo, this.socksMat);
    leftCalf.position.y = -0.52;
    leftCalf.castShadow = true;
    this.leftLeg.add(leftCalf);
    this.createBoot(this.leftLeg, 0);
    this.bodyGroup.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.18, 0.82, 0);
    const rightThigh = new THREE.Mesh(thighGeo, this.shortsMat);
    rightThigh.position.y = -0.2;
    rightThigh.castShadow = true;
    this.rightLeg.add(rightThigh);
    const rightCalf = new THREE.Mesh(calfGeo, this.socksMat);
    rightCalf.position.y = -0.52;
    rightCalf.castShadow = true;
    this.rightLeg.add(rightCalf);
    this.createBoot(this.rightLeg, 1);
    this.bodyGroup.add(this.rightLeg);

    this.createNameplate();
    this.createReadyAura();
    this.createBallHoldingEffect();
  }

  createGlove() {
    const gloveGroup = new THREE.Group();
    const handGeo = new THREE.BoxGeometry(0.08, 0.07, 0.1);
    const hand = new THREE.Mesh(handGeo, this.gloveMat);
    gloveGroup.add(hand);

    const fingerGeo = new THREE.CylinderGeometry(0.015, 0.012, 0.08, 6);
    for (let i = 0; i < 4; i++) {
      const finger = new THREE.Mesh(fingerGeo, this.gloveMat);
      finger.position.set(-0.03 + i * 0.02, 0.04, 0.04);
      finger.rotation.x = -0.3;
      gloveGroup.add(finger);
    }

    const thumbGeo = new THREE.CylinderGeometry(0.018, 0.015, 0.06, 6);
    const thumb = new THREE.Mesh(thumbGeo, this.gloveMat);
    thumb.position.set(-0.045, 0.02, 0.02);
    thumb.rotation.x = -0.5;
    thumb.rotation.z = -0.3;
    gloveGroup.add(thumb);

    const cuffGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.06, 8);
    const cuffMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    const cuff = new THREE.Mesh(cuffGeo, cuffMat);
    cuff.position.set(0, -0.04, 0);
    cuff.rotation.x = Math.PI / 2;
    gloveGroup.add(cuff);

    return gloveGroup;
  }

  createJerseyBackTexture(shirtColorStr, accentColorStr) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = shirtColorStr;
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 256; i += 4) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
    }
    const surname = this.info.name.split(' ').pop().toUpperCase();
    ctx.fillStyle = accentColorStr;
    ctx.font = 'bold 24px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(surname, 128, 85);
    ctx.font = 'bold 76px "Arial Black", sans-serif';
    ctx.fillText(String(this.info.num), 128, 175);
    ctx.font = 'bold 20px "Arial Black", sans-serif';
    ctx.fillText('GK', 128, 210);
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  createBoot(legGroup, side) {
    const soleMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.2 });
    const upperMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.35, metalness: 0.25 });
    const bootGeo = new THREE.BoxGeometry(0.12, 0.09, 0.26);
    const boot = new THREE.Mesh(bootGeo, upperMat);
    boot.position.set(0, -0.78, 0.06);
    legGroup.add(boot);
    const soleGeo = new THREE.BoxGeometry(0.13, 0.035, 0.28);
    const sole = new THREE.Mesh(soleGeo, soleMat);
    sole.position.set(0, -0.84, 0.06);
    legGroup.add(sole);
    const studGeo = new THREE.CylinderGeometry(0.014, 0.01, 0.03, 6);
    const studMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 });
    for (let i = 0; i < 4; i++) {
      const stud = new THREE.Mesh(studGeo, studMat);
      stud.position.set(0.05 - i * 0.04, -0.855, 0.02 + i * 0.05);
      legGroup.add(stud);
    }
  }

  createNameplate() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(6, 12, 20, 0.88)';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    const r = 24;
    ctx.beginPath();
    ctx.roundRect(8, 8, canvas.width - 16, canvas.height - 16, r);
    ctx.fill();
    ctx.stroke();
    ctx.font = 'bold 28px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(String(this.info.num), 24, 42);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    const shortName = this.info.name.split(' ').pop().toUpperCase();
    ctx.fillText(shortName, 68, 41);
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillText('GK', 210, 42);
    const nameTex = new THREE.CanvasTexture(canvas);
    const nameGeo = new THREE.PlaneGeometry(1.3, 0.35);
    const nameMat = new THREE.MeshBasicMaterial({ map: nameTex, transparent: true, side: THREE.DoubleSide });
    this.nameplate = new THREE.Mesh(nameGeo, nameMat);
    this.nameplate.position.set(0, 2.6, 0);
    this.nameplate.visible = false;
    this.group.add(this.nameplate);
  }

  createReadyAura() {
    const ringGeo = new THREE.RingGeometry(0.8, 1.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00bfff, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    this.readyRing = new THREE.Mesh(ringGeo, ringMat);
    this.readyRing.rotation.x = -Math.PI / 2;
    this.readyRing.position.y = 0.05;
    this.readyRing.visible = false;
    this.group.add(this.readyRing);
  }

  createBallHoldingEffect() {
    const glowGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
    this.ballGlow = new THREE.Mesh(glowGeo, glowMat);
    this.ballGlow.position.set(0, 0.8, 0.3);
    this.ballGlow.visible = false;
    this.group.add(this.ballGlow);
  }

  setSelected(selected) {
    this.isSelected = selected;
    this.nameplate.visible = selected;
    this.readyRing.visible = selected;
  }

  triggerDive(directionX, directionZ) {
    this.state = 'dive';
    this.diveProgress = 1.0;
    this.diveDirection.set(directionX, 0, directionZ);
    this.isHoldingBall = false;
    this.ballGlow.visible = false;
  }

  triggerCatch() {
    this.state = 'catch';
    this.catchProgress = 1.0;
    this.isHoldingBall = true;
    this.ballGlow.visible = true;
    this.saveCount++;
  }

  triggerPunch() {
    this.state = 'punch';
    this.punchProgress = 1.0;
    this.isHoldingBall = false;
    this.ballGlow.visible = false;
  }

  triggerThrow() {
    this.state = 'throw';
    this.throwProgress = 1.0;
    this.isHoldingBall = false;
    this.ballGlow.visible = false;
  }

  triggerCelebrate() {
    this.state = 'celebrate';
    this.animTime = 0;
  }

  triggerReady() {
    this.state = 'ready';
  }

  update(dt) {
    this.animTime += dt;
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotation;

    if (this.isSelected) {
      this.readyRing.rotation.z = this.animTime * 2.5;
      if (this.nameplate) {
        this.nameplate.rotation.y = -this.rotation;
        this.nameplate.rotation.x = -0.35;
      }
    }

    if (this.isHoldingBall && this.ballGlow.visible) {
      this.ballGlow.scale.setScalar(1 + Math.sin(this.animTime * 8) * 0.1);
    }

    if (this.diveProgress > 0) {
      this.diveProgress -= dt * 2.2;
      const progress = 1 - Math.max(0, this.diveProgress);
      const diveArc = Math.sin(progress * Math.PI);
      this.bodyGroup.position.y = diveArc * 0.6;
      this.bodyGroup.position.x = this.diveDirection.x * diveArc * 1.2;
      this.bodyGroup.position.z = this.diveDirection.z * diveArc * 1.2;
      this.bodyGroup.rotation.z = -this.diveDirection.x * diveArc * 1.5;
      this.bodyGroup.rotation.x = this.diveDirection.z * diveArc * 0.8;
      this.leftArm.rotation.z = -diveArc * 1.8;
      this.rightArm.rotation.z = diveArc * 1.8;
      this.leftArm.rotation.x = diveArc * 0.5;
      this.rightArm.rotation.x = diveArc * 0.5;
      this.leftLeg.rotation.x = diveArc * 1.2;
      this.rightLeg.rotation.x = diveArc * 1.2;
      if (this.diveProgress <= 0) {
        this.resetLimbs();
        this.bodyGroup.position.set(0, 0, 0);
        this.bodyGroup.rotation.set(0, 0, 0);
        this.state = 'idle';
      }
      return;
    }

    if (this.catchProgress > 0) {
      this.catchProgress -= dt * 3.0;
      const progress = 1 - Math.max(0, this.catchProgress);
      const catchPhase = Math.sin(progress * Math.PI);
      this.leftArm.rotation.z = -catchPhase * 1.5;
      this.rightArm.rotation.z = catchPhase * 1.5;
      this.leftArm.rotation.x = -catchPhase * 0.8;
      this.rightArm.rotation.x = -catchPhase * 0.8;
      if (this.catchProgress <= 0) {
        this.resetLimbs();
        this.state = 'idle';
      }
      return;
    }

    if (this.punchProgress > 0) {
      this.punchProgress -= dt * 2.8;
      const progress = 1 - Math.max(0, this.punchProgress);
      const punchPhase = Math.sin(progress * Math.PI);
      this.rightArm.rotation.x = -punchPhase * 2.0;
      this.leftArm.rotation.z = punchPhase * 0.5;
      if (this.punchProgress <= 0) {
        this.resetLimbs();
        this.state = 'idle';
      }
      return;
    }

    if (this.throwProgress > 0) {
      this.throwProgress -= dt * 2.5;
      const progress = 1 - Math.max(0, this.throwProgress);
      const throwPhase = Math.sin(progress * Math.PI);
      this.rightArm.rotation.x = -throwPhase * 2.2;
      this.leftArm.rotation.z = -throwPhase * 0.8;
      if (this.throwProgress <= 0) {
        this.resetLimbs();
        this.state = 'idle';
      }
      return;
    }

    if (this.state === 'celebrate') {
      const slidePhase = Math.sin(this.animTime * 4);
      this.bodyGroup.position.y = -0.35;
      this.torso.rotation.x = -0.2;
      this.leftLeg.rotation.x = 1.3;
      this.rightLeg.rotation.x = 1.3;
      this.leftArm.rotation.z = 2.2 + Math.sin(this.animTime * 8) * 0.2;
      this.rightArm.rotation.z = -2.2 - Math.sin(this.animTime * 8) * 0.2;
      this.head.rotation.x = -0.3;
      return;
    }

    if (this.state === 'ready') {
      this.leftLeg.rotation.x = 0.4;
      this.rightLeg.rotation.x = 0.4;
      this.leftArm.rotation.z = -0.3;
      this.rightArm.rotation.z = 0.3;
      this.leftArm.rotation.x = -0.2;
      this.rightArm.rotation.x = -0.2;
      this.bodyGroup.position.y = -0.15;
      return;
    }

    this.bodyGroup.position.y = Math.sin(this.animTime * 2.5) * 0.02;
    this.leftArm.rotation.z = 0.08 + Math.sin(this.animTime * 2.5) * 0.04;
    this.rightArm.rotation.z = -0.08 - Math.sin(this.animTime * 2.5) * 0.04;
  }

  resetLimbs() {
    this.leftLeg.rotation.set(0, 0, 0);
    this.rightLeg.rotation.set(0, 0, 0);
    this.leftArm.rotation.set(0, 0, 0);
    this.rightArm.rotation.set(0, 0, 0);
    this.torso.rotation.set(0, 0, 0);
    this.head.rotation.set(0, 0, 0);
    this.bodyGroup.position.set(0, 0, 0);
    this.bodyGroup.rotation.set(0, 0, 0);
  }

  dispose() {
    this.scene.remove(this.group);
  }
}
