/**
 * FC 27 - 3D Ball Entity & Physics Visualizer (Three.js)
 * Constructs the 3D match ball with authentic panels texture, realistic roll rotation,
 * dynamic contact shadow, and high-velocity power shot trail.
 */

export class Ball3D {
  constructor(scene) {
    this.scene = scene;
    this.radius = 0.22; // Size 5 football radius in meters
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Physics parameters
    this.position = new THREE.Vector3(0, this.radius, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.angularVelocity = new THREE.Vector3(0, 0, 0);
    this.owner = null;
    this.isAirborne = false;
    this.trailActive = false;

    this.build();
  }

  build() {
    // Generate procedural football texture (classic black and white hexagons/pentagons)
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Crisp white sphere base
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pentagon / Hexagon pattern grid
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;

    const patches = [
      [128, 128], [384, 128], [256, 256], [128, 384], [384, 384],
      [0, 256], [512, 256], [256, 0], [256, 512]
    ];

    patches.forEach(([cx, cy]) => {
      ctx.beginPath();
      const sides = 5;
      const r = 42;
      for (let i = 0; i < sides; i++) {
        const a = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Volt accent seam highlights for FC 27 branding
    ctx.strokeStyle = '#00ff87';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(256, 256, 120, 0, Math.PI * 2);
    ctx.stroke();

    const ballTexture = new THREE.CanvasTexture(canvas);

    const ballGeo = new THREE.SphereGeometry(this.radius, 24, 24);
    const ballMat = new THREE.MeshStandardMaterial({
      map: ballTexture,
      roughness: 0.35,
      metalness: 0.1
    });

    this.mesh = new THREE.Mesh(ballGeo, ballMat);
    this.mesh.castShadow = true;
    this.group.add(this.mesh);

    // Ground Shadow projection decal
    const shadowGeo = new THREE.PlaneGeometry(0.65, 0.65);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.55
    });
    this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.02;
    this.scene.add(this.shadow);
  }

  update(dt) {
    // Sync mesh position
    this.group.position.copy(this.position);

    // Ball roll rotation according to ground velocity
    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (speed > 0.1 && this.position.y <= this.radius + 0.05) {
      const rollAngle = (speed * dt) / this.radius;
      const rollAxis = new THREE.Vector3(-this.velocity.z, 0, this.velocity.x).normalize();
      this.mesh.rotateOnAxis(rollAxis, rollAngle);
    } else if (speed > 0.1) {
      // Airborne spin
      this.mesh.rotation.x += this.velocity.z * dt * 2;
      this.mesh.rotation.z -= this.velocity.x * dt * 2;
    }

    // Dynamic ground shadow under the ball
    this.shadow.position.x = this.position.x;
    this.shadow.position.z = this.position.z;
    const heightAboveGround = Math.max(0, this.position.y - this.radius);
    const shadowScale = Math.max(0.2, 1.0 - heightAboveGround * 0.15);
    this.shadow.scale.set(shadowScale, shadowScale, shadowScale);
    this.shadow.material.opacity = Math.max(0.1, 0.55 - heightAboveGround * 0.08);
  }
}
