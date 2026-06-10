/**
 * Kushal Dhoot Portfolio - Three.js Constellation Backdrop
 * High-performance, zero-allocation optimized version.
 */

class CyberdeckBackdrop {
  constructor() {
    this.container = document.getElementById('canvas-container');
    if (!this.container) return;

    try {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) {
      console.warn("WebGL initialization failed: ", e);
      return;
    }
    
    this.particles = null;
    this.connections = null;
    this.coreMesh = null;
    this.corePoints = null;
    
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scroll = { y: 0, targetY: 0 };
    
    this.particleCount = 120; // Slightly reduced count for peak mobile performance
    this.maxDistance = 110;  // Max distance for drawing connection lines
    
    // Theme Colors (stored as THREE.Color objects for zero-allocation rendering)
    this.themeColor1 = new THREE.Color(0x00f5ff); // Cyan
    this.themeColor2 = new THREE.Color(0x7b2fff); // Purple
    this.tempColor = new THREE.Color();
    
    // Pre-allocated vectors for math to avoid GC thrashing
    this.mouse3D = new THREE.Vector3();
    this.pVec = new THREE.Vector3();
    this.dir = new THREE.Vector3();
    
    this.init();
  }

  init() {
    // Renderer settings
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0); // Transparent canvas background
    this.container.appendChild(this.renderer.domElement);

    // Initial Camera Position
    this.camera.position.z = 250;

    // Create Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00f5ff, 2, 350);
    pointLight1.position.set(120, 120, 120);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x7b2fff, 2, 350);
    pointLight2.position.set(-120, -120, 120);
    this.scene.add(pointLight2);

    // Build Scene Objects
    this.createConstellation();
    this.createCore();

    // Event Listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('scroll', this.onScroll.bind(this));

    // Bind animate function once to avoid frame-by-frame GC allocations
    this.animate = this.animate.bind(this);

    // Start Loop
    this.animate(0);
  }

  createConstellation() {
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    this.velocities = [];

    // Distribute particles randomly in a space
    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 450;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 450;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 450;

      this.velocities.push({
        x: (Math.random() - 0.5) * 0.35,
        y: (Math.random() - 0.5) * 0.35,
        z: (Math.random() - 0.5) * 0.35
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom glowing particle texture using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(0, 245, 255, 0.8)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      color: this.themeColor1,
      size: 4.5,
      transparent: true,
      blending: THREE.AdditiveBlending,
      map: particleTexture,
      depthWrite: false
    });

    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particles);

    // Connections Material (Lines) using vertex colors
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });

    // Pre-allocate line segments buffer
    this.maxLines = 400; // Limit total visible connections to keep frame rates extremely high
    const linePositions = new Float32Array(this.maxLines * 2 * 3); // 2 vertices per segment
    const lineColors = new Float32Array(this.maxLines * 2 * 3);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    lineGeometry.setDrawRange(0, 0);

    this.connections = new THREE.LineSegments(lineGeometry, lineMaterial);
    this.scene.add(this.connections);
  }

  createCore() {
    const geom = new THREE.TorusKnotGeometry(32, 8, 120, 16, 3, 4);
    this.coreOriginalPositions = geom.attributes.position.clone();

    const isMobile = window.innerWidth <= 900;

    const coreMaterial = new THREE.MeshBasicMaterial({
      color: this.themeColor2,
      wireframe: true,
      transparent: true,
      opacity: isMobile ? 0.08 : 0.2,
      blending: THREE.AdditiveBlending
    });

    this.coreMesh = new THREE.Mesh(geom, coreMaterial);
    this.coreMesh.position.set(isMobile ? 0 : 80, isMobile ? 10 : 0, isMobile ? -50 : 0);
    if (isMobile) {
      this.coreMesh.scale.set(0.7, 0.7, 0.7);
    }
    this.scene.add(this.coreMesh);

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(123, 79, 255, 0.8)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    
    const corePointTexture = new THREE.CanvasTexture(canvas);

    const pointsMaterial = new THREE.PointsMaterial({
      color: this.themeColor1,
      size: isMobile ? 1.6 : 2.5,
      transparent: true,
      blending: THREE.AdditiveBlending,
      map: corePointTexture,
      depthWrite: false
    });

    this.corePoints = new THREE.Points(geom, pointsMaterial);
    this.corePoints.position.copy(this.coreMesh.position);
    if (isMobile) {
      this.corePoints.scale.set(0.7, 0.7, 0.7);
    }
    this.scene.add(this.corePoints);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    if (this.coreMesh && this.corePoints) {
      const isMobile = window.innerWidth <= 900;
      this.coreMesh.position.set(isMobile ? 0 : 80, isMobile ? 10 : 0, isMobile ? -50 : 0);
      this.corePoints.position.copy(this.coreMesh.position);
      
      const scl = isMobile ? 0.7 : 1.0;
      this.coreMesh.scale.set(scl, scl, scl);
      this.corePoints.scale.set(scl, scl, scl);
      
      this.coreMesh.material.opacity = isMobile ? 0.08 : 0.2;
      this.corePoints.material.size = isMobile ? 1.6 : 2.5;
    }
  }

  onMouseMove(e) {
    this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  onScroll() {
    this.scroll.targetY = window.scrollY;
  }

  updateActiveShape(index) {
    // Simple version fallback hook
  }

  // --- Theme Swapper ---
  updateTheme(themeName) {
    const presets = {
      cyan: { c1: 0x00f5ff, c2: 0x7b2fff },
      green: { c1: 0x00ff88, c2: 0x00f5ff },
      purple: { c1: 0x7b2fff, c2: 0xff2d78 },
      pink: { c1: 0xff2d78, c2: 0xffe600 }
    };
    
    const colors = presets[themeName.toLowerCase()] || presets.cyan;
    this.themeColor1.setHex(colors.c1);
    this.themeColor2.setHex(colors.c2);

    if (this.particles) {
      this.particles.material.color.copy(this.themeColor1);
    }
    if (this.coreMesh) {
      this.coreMesh.material.color.copy(this.themeColor2);
      this.corePoints.material.color.copy(this.themeColor1);
    }
  }

  updateConstellation() {
    if (!this.particles || !this.connections) return;

    const positions = this.particles.geometry.attributes.position.array;
    
    // 1. Move Particles
    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      positions[idx] += this.velocities[i].x;
      positions[idx + 1] += this.velocities[i].y;
      positions[idx + 2] += this.velocities[i].z;

      // Bounce boundaries
      if (Math.abs(positions[idx]) > 220) this.velocities[i].x *= -1;
      if (Math.abs(positions[idx + 1]) > 220) this.velocities[i].y *= -1;
      if (Math.abs(positions[idx + 2]) > 220) this.velocities[i].z *= -1;

      // Mouse interactive push
      if (this.mouse.x !== 0 && this.mouse.y !== 0) {
        this.mouse3D.set(this.mouse.x * 160, this.mouse.y * 160, 0);
        this.pVec.set(positions[idx], positions[idx + 1], positions[idx + 2]);
        const distToMouse = this.pVec.distanceTo(this.mouse3D);
        if (distToMouse < 90) {
          const force = (90 - distToMouse) * 0.015;
          this.dir.copy(this.pVec).sub(this.mouse3D).normalize().multiplyScalar(force);
          positions[idx] += this.dir.x;
          positions[idx + 1] += this.dir.y;
        }
      }
    }
    this.particles.geometry.attributes.position.needsUpdate = true;

    // 2. Find Connections and update pre-allocated buffer (Zero GC Allocation)
    const linePosAttr = this.connections.geometry.attributes.position;
    const lineColAttr = this.connections.geometry.attributes.color;
    const linePositions = linePosAttr.array;
    const lineColors = lineColAttr.array;
    
    let lineCount = 0;

    for (let i = 0; i < this.particleCount; i++) {
      const idxA = i * 3;
      const ax = positions[idxA];
      const ay = positions[idxA + 1];
      const az = positions[idxA + 2];

      for (let j = i + 1; j < this.particleCount; j++) {
        if (lineCount >= this.maxLines) break;

        const idxB = j * 3;
        const bx = positions[idxB];
        const by = positions[idxB + 1];
        const bz = positions[idxB + 2];

        const dx = ax - bx;
        const dy = ay - by;
        const dz = az - bz;
        const distSqr = dx * dx + dy * dy + dz * dz;

        if (distSqr < this.maxDistance * this.maxDistance) {
          const dist = Math.sqrt(distSqr);
          const opacity = 1.0 - (dist / this.maxDistance);
          
          const writeIdx = lineCount * 6;
          
          // Vertices
          linePositions[writeIdx] = ax;
          linePositions[writeIdx + 1] = ay;
          linePositions[writeIdx + 2] = az;
          linePositions[writeIdx + 3] = bx;
          linePositions[writeIdx + 4] = by;
          linePositions[writeIdx + 5] = bz;

          // Colors
          this.tempColor.copy(this.themeColor1).lerp(this.themeColor2, ax / 220 + 0.5);
          
          lineColors[writeIdx] = this.tempColor.r * opacity;
          lineColors[writeIdx + 1] = this.tempColor.g * opacity;
          lineColors[writeIdx + 2] = this.tempColor.b * opacity;
          lineColors[writeIdx + 3] = this.tempColor.r * opacity;
          lineColors[writeIdx + 4] = this.tempColor.g * opacity;
          lineColors[writeIdx + 5] = this.tempColor.b * opacity;

          lineCount++;
        }
      }
      if (lineCount >= this.maxLines) break;
    }

    // Dynamic draw range to only render connected lines
    this.connections.geometry.setDrawRange(0, lineCount * 2);
    linePosAttr.needsUpdate = true;
    lineColAttr.needsUpdate = true;
  }

  updateCore(time) {
    if (!this.coreMesh || !this.corePoints) return;

    this.coreMesh.rotation.x = time * 0.0003;
    this.coreMesh.rotation.y = time * 0.00055;
    this.coreMesh.rotation.z = time * 0.00015;

    this.corePoints.rotation.copy(this.coreMesh.rotation);

    const positionAttribute = this.coreMesh.geometry.attributes.position;
    const originalPositions = this.coreOriginalPositions.array;
    const positions = positionAttribute.array;

    for (let i = 0; i < positionAttribute.count; i++) {
      const idx = i * 3;
      const ox = originalPositions[idx];
      const oy = originalPositions[idx + 1];
      const oz = originalPositions[idx + 2];

      const length = Math.sqrt(ox*ox + oy*oy + oz*oz);
      const wave = Math.sin(length * 0.08 - time * 0.003) * 1.5;
      
      positions[idx] = ox + (ox / length) * wave;
      positions[idx + 1] = oy + (oy / length) * wave;
      positions[idx + 2] = oz + (oz / length) * wave;
    }

    positionAttribute.needsUpdate = true;
  }

  animate(time) {
    requestAnimationFrame(this.animate);

    // Smooth mouse coordinates interpolation
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

    // Smooth scroll interpolation
    this.scroll.y += (this.scroll.targetY - this.scroll.y) * 0.07;

    // Apply scroll depth camera zoom
    const zOffset = this.scroll.y * 0.22;
    this.camera.position.z = 250 - zOffset;

    this.camera.position.x = this.mouse.x * 35;
    this.camera.position.y = this.mouse.y * 35;
    this.camera.lookAt(0, 0, 0);

    // Render updates
    this.updateConstellation();
    this.updateCore(time);

    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  window.cyberdeckBackdrop = new CyberdeckBackdrop();
});
