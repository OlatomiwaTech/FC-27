/**
 * FC 27 - 3D Stadium & Environment Generator (Three.js)
 * Constructs the pitch, pitch markings, goalposts, 3D nets, corner flags,
 * spectator tiers, LED ad hoardings, roof trusses, and stadium floodlights.
 */

export class Stadium3D {
  constructor(scene, stadiumData) {
    this.scene = scene;
    this.data = stadiumData;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Stadium Dimensions (in meters)
    this.pitchLength = 105;
    this.pitchWidth = 68;
    this.goalWidth = 7.32;
    this.goalHeight = 2.44;
    this.goalDepth = 2.2;

    this.adMaterials = [];
    this.flagMeshes = [];
    this.spotlights = [];

    this.build();
  }

  build() {
    this.createLights();
    this.createPitch();
    this.createGoals();
    this.createCornerFlags();
    this.createAdBoards();
    this.createGrandstands();
    this.createDugouts();
    this.createAtmosphere();
  }

  createLights() {
    // Deep dark night sky background
    this.scene.background = new THREE.Color(this.data.skyColor || 0x091422);
    this.scene.fog = new THREE.FogExp2(this.data.fogColor || 0x0c1b2c, 0.008);

    // Main Directional "Sun" — simulates broadcast TV key light, warm-white
    const mainSun = new THREE.DirectionalLight(0xffeedd, 1.35);
    mainSun.position.set(15, 55, 30);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 2048;
    mainSun.shadow.mapSize.height = 2048;
    mainSun.shadow.camera.near = 10;
    mainSun.shadow.camera.far = 160;
    mainSun.shadow.camera.left = -65;
    mainSun.shadow.camera.right = 65;
    mainSun.shadow.camera.top = 45;
    mainSun.shadow.camera.bottom = -45;
    mainSun.shadow.bias = -0.0005;
    this.group.add(mainSun);

    // Low-intensity cool blue ambient — gives depth and contrast in shadows
    const ambient = new THREE.AmbientLight(0x334460, 0.55);
    this.group.add(ambient);

    // Hemispheric sky/ground bounce — dark blue sky, dark green turf bounce
    const hemi = new THREE.HemisphereLight(0x1a2a44, 0x0d2610, 0.4);
    hemi.position.set(0, 40, 0);
    this.group.add(hemi);

    // 4 Corner Stadium Floodlight Towers
    const towerCoords = [
      [-65, 32, -45],
      [65, 32, -45],
      [-65, 32, 45],
      [65, 32, 45]
    ];

    towerCoords.forEach((pos) => {
      // Focused floodlight spot with tight penumbra for dramatic contrast
      const spot = new THREE.SpotLight(this.data.floodlightColor || 0xedf4ff, 1.6);
      spot.position.set(pos[0], pos[1], pos[2]);
      spot.target.position.set(pos[0] * 0.15, 0, pos[2] * 0.15);
      spot.angle = Math.PI / 4.5;
      spot.penumbra = 0.65;
      spot.distance = 160;
      spot.decay = 1.2;
      spot.castShadow = true;
      spot.shadow.mapSize.width = 1024;
      spot.shadow.mapSize.height = 1024;
      spot.shadow.bias = -0.001;

      this.group.add(spot);
      this.group.add(spot.target);
      this.spotlights.push(spot);

      // Tower pylon geometry
      const pylonGeo = new THREE.CylinderGeometry(0.5, 1.2, pos[1], 8);
      const pylonMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
      const pylon = new THREE.Mesh(pylonGeo, pylonMat);
      pylon.position.set(pos[0], pos[1] / 2, pos[2]);
      this.group.add(pylon);

      // Floodlight bank grid head
      const headGeo = new THREE.BoxGeometry(4.5, 3.5, 1.2);
      const headMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(pos[0], pos[1], pos[2]);
      head.lookAt(0, 0, 0);
      this.group.add(head);

      // Glowing lens bank — emissive white glow
      const lensGeo = new THREE.PlaneGeometry(4.2, 3.2);
      const lensMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
      });
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.position.set(0, 0, 0.65);
      head.add(lens);
    });
  }

  createPitch() {
    // Generate high-resolution procedural grass canvas texture with stripes
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1360;
    const ctx = canvas.getContext('2d');

    // Base emerald turf
    ctx.fillStyle = '#265828';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mowed lawn vertical stripes (10 stripes across pitch)
    const stripeCount = 14;
    const stripeWidth = canvas.width / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      ctx.fillStyle = (i % 2 === 0) ? '#2c692f' : '#225324';
      ctx.fillRect(i * stripeWidth, 0, stripeWidth, canvas.height);
    }

    // Grass blade subtle noise texture
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 16;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 1.2));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // White Pitch Markings
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';

    const marginX = 80;
    const marginY = 60;
    const w = canvas.width - marginX * 2;
    const h = canvas.height - marginY * 2;

    // Outer touchlines
    ctx.strokeRect(marginX, marginY, w, h);

    // Halfway line
    const midX = canvas.width / 2;
    ctx.beginPath();
    ctx.moveTo(midX, marginY);
    ctx.lineTo(midX, canvas.height - marginY);
    ctx.stroke();

    // Center circle
    const centerRadius = (9.15 / 105) * w;
    ctx.beginPath();
    ctx.arc(midX, canvas.height / 2, centerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Center kick-off spot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(midX, canvas.height / 2, 8, 0, Math.PI * 2);
    ctx.fill();

    // Penalty Boxes and 6-yard boxes on Left & Right
    const penDepth = (16.5 / 105) * w;
    const penWidth = (40.32 / 68) * h;
    const sixDepth = (5.5 / 105) * w;
    const sixWidth = (18.32 / 68) * h;
    const penSpotDist = (11 / 105) * w;

    // Left Goal area
    const penTopY = (canvas.height - penWidth) / 2;
    ctx.strokeRect(marginX, penTopY, penDepth, penWidth);

    const sixTopY = (canvas.height - sixWidth) / 2;
    ctx.strokeRect(marginX, sixTopY, sixDepth, sixWidth);

    // Left penalty spot & arc
    const leftPenSpotX = marginX + penSpotDist;
    ctx.beginPath();
    ctx.arc(leftPenSpotX, canvas.height / 2, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(leftPenSpotX, canvas.height / 2, centerRadius, -0.92, 0.92);
    ctx.stroke();

    // Right Goal area
    ctx.strokeRect(canvas.width - marginX - penDepth, penTopY, penDepth, penWidth);
    ctx.strokeRect(canvas.width - marginX - sixDepth, sixTopY, sixDepth, sixWidth);

    // Right penalty spot & arc
    const rightPenSpotX = canvas.width - marginX - penSpotDist;
    ctx.beginPath();
    ctx.arc(rightPenSpotX, canvas.height / 2, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(rightPenSpotX, canvas.height / 2, centerRadius, Math.PI - 0.92, Math.PI + 0.92);
    ctx.stroke();

    // Corner arcs (1m radius)
    const cornerRadius = (1.5 / 105) * w;
    // Top-left
    ctx.beginPath();
    ctx.arc(marginX, marginY, cornerRadius, 0, Math.PI / 2);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.arc(marginX, canvas.height - marginY, cornerRadius, -Math.PI / 2, 0);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.arc(canvas.width - marginX, marginY, cornerRadius, Math.PI / 2, Math.PI);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.arc(canvas.width - marginX, canvas.height - marginY, cornerRadius, Math.PI, Math.PI * 1.5);
    ctx.stroke();

    const pitchTexture = new THREE.CanvasTexture(canvas);
    pitchTexture.anisotropy = 16;

    // 3D Pitch Plane
    // Scale slightly larger than 105x68 to accommodate run-off margins
    const totalLength = 118;
    const totalWidth = 78;
    const pitchGeo = new THREE.PlaneGeometry(totalLength, totalWidth);
    const pitchMat = new THREE.MeshStandardMaterial({
      map: pitchTexture,
      roughness: 0.75,
      metalness: 0.08
    });

    const pitchMesh = new THREE.Mesh(pitchGeo, pitchMat);
    pitchMesh.rotation.x = -Math.PI / 2;
    pitchMesh.receiveShadow = true;
    this.group.add(pitchMesh);
    this.pitchMesh = pitchMesh;

    // Perimeter concrete walkway
    const borderGeo = new THREE.RingGeometry(55, 68, 4);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.rotation.x = -Math.PI / 2;
    border.position.y = -0.05;
    this.group.add(border);
  }

  createGoals() {
    const postMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.85,
      roughness: 0.15
    });

    const netMat = new THREE.MeshBasicMaterial({
      color: 0xe2e8f0,
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });

    // Create Goal at X = -52.5 and X = +52.5
    [-52.5, 52.5].forEach(xPos => {
      const isLeft = xPos < 0;
      const goalGroup = new THREE.Group();
      goalGroup.position.set(xPos, 0, 0);
      if (!isLeft) {
        goalGroup.rotation.y = Math.PI;
      }

      // Vertical Posts
      const postRadius = 0.08;
      const postGeo = new THREE.CylinderGeometry(postRadius, postRadius, this.goalHeight, 16);

      const post1 = new THREE.Mesh(postGeo, postMat);
      post1.position.set(0, this.goalHeight / 2, -this.goalWidth / 2);
      post1.castShadow = true;
      goalGroup.add(post1);

      const post2 = new THREE.Mesh(postGeo, postMat);
      post2.position.set(0, this.goalHeight / 2, this.goalWidth / 2);
      post2.castShadow = true;
      goalGroup.add(post2);

      // Horizontal Crossbar
      const barGeo = new THREE.CylinderGeometry(postRadius, postRadius, this.goalWidth, 16);
      const crossbar = new THREE.Mesh(barGeo, postMat);
      crossbar.rotation.x = Math.PI / 2;
      crossbar.position.set(0, this.goalHeight, 0);
      crossbar.castShadow = true;
      goalGroup.add(crossbar);

      // Stanchions / Back Support Struts
      const supportGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8);
      const s1 = new THREE.Mesh(supportGeo, postMat);
      s1.position.set(-1.1, this.goalHeight * 0.7, -this.goalWidth / 2);
      s1.rotation.z = Math.PI / 4;
      goalGroup.add(s1);

      const s2 = new THREE.Mesh(supportGeo, postMat);
      s2.position.set(-1.1, this.goalHeight * 0.7, this.goalWidth / 2);
      s2.rotation.z = Math.PI / 4;
      goalGroup.add(s2);

      // 3D Goal Net Box
      const netGeo = new THREE.BoxGeometry(this.goalDepth, this.goalHeight, this.goalWidth, 12, 8, 16);
      const netMesh = new THREE.Mesh(netGeo, netMat);
      netMesh.position.set(-this.goalDepth / 2, this.goalHeight / 2, 0);
      goalGroup.add(netMesh);

      this.group.add(goalGroup);
    });
  }

  createCornerFlags() {
    const corners = [
      [-52.5, -34],
      [-52.5, 34],
      [52.5, -34],
      [52.5, 34]
    ];

    const poleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const flagMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });

    corners.forEach(pos => {
      const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.5, 8);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(pos[0], 0.75, pos[1]);
      this.group.add(pole);

      const flagGeo = new THREE.PlaneGeometry(0.45, 0.32);
      const flag = new THREE.Mesh(flagGeo, flagMat);
      flag.position.set(pos[0] + 0.22, 1.35, pos[1]);
      this.group.add(flag);
      this.flagMeshes.push(flag);
    });
  }

  createAdBoards() {
    // Animated dynamic canvas texture for LED perimeter boards
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    this.adCanvas = canvas;
    this.adCtx = canvas.getContext('2d');

    const adTexture = new THREE.CanvasTexture(canvas);
    adTexture.wrapS = THREE.RepeatWrapping;
    adTexture.wrapT = THREE.ClampToEdgeWrapping;
    this.adTexture = adTexture;

    const adMat = new THREE.MeshBasicMaterial({ map: adTexture });
    this.adMaterials.push(adMat);

    // Perimeter boards along touchlines (Z = ±37) and behind goals (X = ±57)
    const boardHeight = 1.0;

    // Top & Bottom Sidelines
    const sideGeo = new THREE.PlaneGeometry(114, boardHeight);
    const topBoard = new THREE.Mesh(sideGeo, adMat);
    topBoard.position.set(0, boardHeight / 2, -37.5);
    topBoard.rotation.x = 0.15; // slight upward tilt towards cameras
    this.group.add(topBoard);

    const bottomBoard = new THREE.Mesh(sideGeo, adMat);
    bottomBoard.position.set(0, boardHeight / 2, 37.5);
    bottomBoard.rotation.y = Math.PI;
    bottomBoard.rotation.x = 0.15;
    this.group.add(bottomBoard);

    // Behind Left & Right Goals
    const endGeo = new THREE.PlaneGeometry(74, boardHeight);
    const leftBoard = new THREE.Mesh(endGeo, adMat);
    leftBoard.position.set(-57.5, boardHeight / 2, 0);
    leftBoard.rotation.y = Math.PI / 2;
    leftBoard.rotation.x = 0.15;
    this.group.add(leftBoard);

    const rightBoard = new THREE.Mesh(endGeo, adMat);
    rightBoard.position.set(57.5, boardHeight / 2, 0);
    rightBoard.rotation.y = -Math.PI / 2;
    rightBoard.rotation.x = 0.15;
    this.group.add(rightBoard);
  }

  updateAdBoards(time) {
    if (!this.adCtx) return;
    const ctx = this.adCtx;
    const w = this.adCanvas.width;
    const h = this.adCanvas.height;

    // Dark sleek high-tech LED backing
    ctx.fillStyle = '#060d17';
    ctx.fillRect(0, 0, w, h);

    const sponsors = this.data.adBoards || [
      'VOLT ENERGY', 'CYBERBOOST', 'AURA SPORTS', 'NEXUS PAY', 'HYPERBOOTS', 'ORBIT AIRWAYS'
    ];

    const offset = (time * 120) % (w * 2);
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.textBaseline = 'middle';

    sponsors.forEach((brand, idx) => {
      const x = ((idx * 260) - offset + w * 4) % (w * 2) - 100;
      // Gradient glowing text
      const grad = ctx.createLinearGradient(x, 0, x + 200, 0);
      grad.addColorStop(0, '#00ff87');
      grad.addColorStop(1, '#00d2ff');
      ctx.fillStyle = grad;
      ctx.fillText(brand, x, h / 2);

      // Accent tick
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + ctx.measureText(brand).width + 25, h / 2 - 8, 6, 16);
    });

    this.adTexture.needsUpdate = true;

    // Corner flag wind flutter
    this.flagMeshes.forEach((flag, i) => {
      flag.rotation.y = Math.sin(time * 6 + i) * 0.25;
    });
  }

  createGrandstands() {
    // Generate multi-tiered 3D grandstand bowl
    const standColor = 0x111c2a;
    const seatColors = [0x0077b6, 0x023e8a, 0x00b4d8, 0x03045e];

    const tierMat = new THREE.MeshStandardMaterial({
      color: standColor,
      roughness: 0.8,
      metalness: 0.2
    });

    // 4 Grandstands around the pitch (North, South, East, West)
    const stands = [
      { pos: [0, 10, -58], rot: [0, 0, 0], len: 130, depth: 32, height: 22 }, // North Stand
      { pos: [0, 10, 58], rot: [0, Math.PI, 0], len: 130, depth: 32, height: 22 }, // South Stand
      { pos: [-76, 10, 0], rot: [0, Math.PI / 2, 0], len: 90, depth: 32, height: 22 }, // West Kop
      { pos: [76, 10, 0], rot: [0, -Math.PI / 2, 0], len: 90, depth: 32, height: 22 } // East Stand
    ];

    stands.forEach(stand => {
      const standGroup = new THREE.Group();
      standGroup.position.set(stand.pos[0], 0, stand.pos[2]);
      standGroup.rotation.y = stand.rot[1];

      // Tier steps
      const steps = 14;
      for (let s = 0; s < steps; s++) {
        const stepWidth = stand.len;
        const stepDepth = stand.depth / steps;
        const stepHeight = (stand.height / steps) * (s + 1);

        const stepGeo = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
        const stepMesh = new THREE.Mesh(stepGeo, tierMat);
        stepMesh.position.set(0, stepHeight / 2, s * stepDepth);
        stepMesh.receiveShadow = true;
        standGroup.add(stepMesh);

        // Crowd blocks on top of step
        const crowdGeo = new THREE.BoxGeometry(stepWidth * 0.98, 0.8, stepDepth * 0.7);
        const crowdMat = new THREE.MeshLambertMaterial({
          color: seatColors[s % seatColors.length]
        });
        const crowdMesh = new THREE.Mesh(crowdGeo, crowdMat);
        crowdMesh.position.set(0, stepHeight + 0.4, s * stepDepth);
        standGroup.add(crowdMesh);
      }

      // Modern cantilevered roof canopy
      const roofGeo = new THREE.BoxGeometry(stand.len * 1.05, 1.2, stand.depth * 1.25);
      const roofMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.7,
        roughness: 0.3
      });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(0, stand.height + 6, stand.depth * 0.45);
      roof.rotation.x = 0.12;
      standGroup.add(roof);

      this.group.add(standGroup);
    });
  }

  createDugouts() {
    // Technical area benches at midfield sideline (Z = 36, X = ±10)
    [-10, 10].forEach(x => {
      const benchGroup = new THREE.Group();
      benchGroup.position.set(x, 0, 36.5);

      // Glass shelter canopy
      const shelterGeo = new THREE.BoxGeometry(7, 2.4, 2.2);
      const shelterMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.45,
        roughness: 0.1
      });
      const shelter = new THREE.Mesh(shelterGeo, shelterMat);
      shelter.position.set(0, 1.2, 0);
      benchGroup.add(shelter);

      // Bench seats
      const seatGeo = new THREE.BoxGeometry(6.4, 0.4, 0.6);
      const seatMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      const seats = new THREE.Mesh(seatGeo, seatMat);
      seats.position.set(0, 0.6, -0.4);
      benchGroup.add(seats);

      this.group.add(benchGroup);
    });
  }

  createAtmosphere() {
    // Atmospheric fog matching stadium lighting
    this.scene.fog = new THREE.FogExp2(this.data.fogColor || 0x0c1b2c, 0.0075);

    // Subtle floating dust/light particles
    const particleCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 120;
      positions[i + 1] = Math.random() * 25 + 1;
      positions[i + 2] = (Math.random() - 0.5) * 80;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0xedf4ff,
      size: 0.25,
      transparent: true,
      opacity: 0.35
    });

    this.particles = new THREE.Points(pGeo, pMat);
    this.group.add(this.particles);
  }
}

