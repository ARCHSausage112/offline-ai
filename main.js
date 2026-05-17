import '../styles.css';
import * as THREE from 'three';

const canvas = document.querySelector('#webgl');
const progressBar = document.querySelector('#progressBar');
const phaseLabel = document.querySelector('#phaseLabel');

const phases = [
  'Tunnel di particelle in accelerazione',
  'Nebulosa liquida in ricostruzione',
  'Città orbitale a gravità variabile',
  'Frattale di cristalli e cubi',
  'Rientro nel continuum infinito',
];

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x03030a, 0.035);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 180);
const cameraRig = new THREE.Group();
cameraRig.add(camera);
scene.add(cameraRig);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;

const clock = new THREE.Clock();
const pointer = new THREE.Vector2();
let scrollProgress = 0;
let smoothProgress = 0;
let loopLock = false;

const gradientTexture = makeGradientTexture();
scene.background = gradientTexture;

const ambient = new THREE.AmbientLight(0x8aa7ff, 0.45);
scene.add(ambient);

const cyanLight = new THREE.PointLight(0x32f6ff, 55, 42);
cyanLight.position.set(-5, 4, 6);
scene.add(cyanLight);

const pinkLight = new THREE.PointLight(0xff3fe8, 60, 48);
pinkLight.position.set(5, -2, -4);
scene.add(pinkLight);

const goldLight = new THREE.PointLight(0xffe66d, 25, 40);
goldLight.position.set(0, 5, -10);
scene.add(goldLight);

const tunnel = createTunnel();
const particleCloud = createParticleCloud();
const orbitSystem = createOrbitSystem();
const crystalField = createCrystalField();
const ribbon = createRibbon();

scene.add(tunnel, particleCloud, orbitSystem, crystalField, ribbon);

function makeGradientTexture() {
  const gradientCanvas = document.createElement('canvas');
  gradientCanvas.width = 32;
  gradientCanvas.height = 512;
  const context = gradientCanvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, 0, gradientCanvas.height);
  gradient.addColorStop(0, '#120526');
  gradient.addColorStop(0.45, '#03030a');
  gradient.addColorStop(1, '#080d2f');
  context.fillStyle = gradient;
  context.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);
  const texture = new THREE.CanvasTexture(gradientCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createTunnel() {
  const group = new THREE.Group();
  const ringGeometry = new THREE.TorusGeometry(4.8, 0.018, 10, 160);
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x32f6ff,
    emissive: 0x1648ff,
    emissiveIntensity: 1.4,
    roughness: 0.24,
    metalness: 0.72,
  });

  for (let i = 0; i < 80; i += 1) {
    const ring = new THREE.Mesh(ringGeometry, ringMaterial.clone());
    ring.position.z = -i * 1.35;
    ring.rotation.z = i * 0.22;
    ring.scale.setScalar(1 + Math.sin(i * 0.41) * 0.13);
    ring.material.emissive = new THREE.Color(i % 3 === 0 ? 0xff3fe8 : 0x32f6ff);
    group.add(ring);
  }

  return group;
}

function createParticleCloud() {
  const count = 4200;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    const radius = 3 + Math.random() * 11;
    const angle = Math.random() * Math.PI * 2;
    const depth = -Math.random() * 110;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius;
    positions[i * 3 + 2] = depth;

    color.setHSL(0.52 + Math.random() * 0.35, 0.95, 0.62);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.86,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

function createOrbitSystem() {
  const group = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.7, 4),
    new THREE.MeshStandardMaterial({ color: 0x8d5cff, emissive: 0x3311ff, emissiveIntensity: 1.1, roughness: 0.18, metalness: 0.45 })
  );
  group.add(core);

  for (let i = 0; i < 7; i += 1) {
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.16 + i * 0.025, 24, 24),
      new THREE.MeshStandardMaterial({ color: i % 2 ? 0xff3fe8 : 0x32f6ff, emissive: i % 2 ? 0xff0faf : 0x00bcd4, emissiveIntensity: 1.7 })
    );
    moon.userData = { radius: 2.6 + i * 0.42, speed: 0.35 + i * 0.09, tilt: i * 0.37 };
    group.add(moon);
  }

  group.position.set(0, 0, -28);
  return group;
}

function createCrystalField() {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  for (let i = 0; i < 96; i += 1) {
    const material = new THREE.MeshStandardMaterial({
      color: i % 2 ? 0x32f6ff : 0xff3fe8,
      emissive: i % 2 ? 0x063dff : 0x6a005d,
      emissiveIntensity: 0.75,
      roughness: 0.19,
      metalness: 0.74,
      transparent: true,
      opacity: 0.82,
    });
    const cube = new THREE.Mesh(geometry, material);
    const angle = i * 0.62;
    const radius = 5 + (i % 12) * 0.38;
    cube.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.7) * 3.1, -42 - i * 0.42);
    cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    cube.scale.setScalar(0.35 + Math.random() * 1.25);
    group.add(cube);
  }

  return group;
}

function createRibbon() {
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 18 }, (_, i) => new THREE.Vector3(Math.sin(i * 0.9) * 3.8, Math.cos(i * 0.55) * 2.1, -i * 5.8)),
    false,
    'catmullrom',
    0.45
  );
  const geometry = new THREE.TubeGeometry(curve, 520, 0.045, 10, false);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffe66d,
    emissive: 0xff7a00,
    emissiveIntensity: 1.2,
    roughness: 0.2,
    metalness: 0.55,
  });
  return new THREE.Mesh(geometry, material);
}

function updateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress = max <= 0 ? 0 : window.scrollY / max;
  progressBar.style.width = `${(scrollProgress * 100).toFixed(2)}%`;

  const index = Math.min(phases.length - 1, Math.floor(scrollProgress * phases.length));
  phaseLabel.textContent = phases[index];

  if (loopLock) return;
  if (window.scrollY < window.innerHeight * 0.75) {
    loopLock = true;
    window.scrollTo(0, max * 0.55);
  } else if (window.scrollY > max - window.innerHeight * 0.75) {
    loopLock = true;
    window.scrollTo(0, max * 0.45);
  }
  if (loopLock) requestAnimationFrame(() => { loopLock = false; });
}

function animate() {
  const time = clock.getElapsedTime();
  smoothProgress += (scrollProgress - smoothProgress) * 0.075;
  const travel = smoothProgress * 92;
  const wave = Math.sin(smoothProgress * Math.PI * 2);

  cameraRig.position.set(
    Math.sin(travel * 0.13) * 1.45 + pointer.x * 0.85,
    Math.cos(travel * 0.11) * 0.95 - pointer.y * 0.55,
    travel * -1
  );
  cameraRig.rotation.set(pointer.y * 0.06 + Math.sin(time * 0.35) * 0.02, pointer.x * -0.08 + Math.cos(time * 0.3) * 0.03, wave * 0.12);
  camera.lookAt(cameraRig.position.x * 0.24, cameraRig.position.y * 0.18, cameraRig.position.z - 10);

  tunnel.rotation.z = time * 0.12 + smoothProgress * Math.PI * 8;
  tunnel.children.forEach((ring, index) => {
    ring.scale.setScalar(1 + Math.sin(time * 2 + index * 0.3 + smoothProgress * 18) * 0.12);
    ring.material.emissiveIntensity = 0.75 + Math.sin(time * 4 + index) * 0.45 + smoothProgress * 0.8;
  });

  const positions = particleCloud.geometry.attributes.position;
  for (let i = 2; i < positions.array.length; i += 3) {
    positions.array[i] += 0.035 + smoothProgress * 0.08;
    if (positions.array[i] > 6) positions.array[i] = -110;
  }
  positions.needsUpdate = true;
  particleCloud.rotation.z = time * 0.035 + smoothProgress * Math.PI * 3;

  orbitSystem.position.z = -24 - Math.sin(smoothProgress * Math.PI) * 16;
  orbitSystem.rotation.y = time * 0.28 + smoothProgress * Math.PI * 3;
  orbitSystem.children.slice(1).forEach((moon) => {
    const { radius, speed, tilt } = moon.userData;
    const angle = time * speed + smoothProgress * Math.PI * 4 + tilt;
    moon.position.set(Math.cos(angle) * radius, Math.sin(angle + tilt) * 1.1, Math.sin(angle) * radius);
  });

  crystalField.position.z = 8 + Math.sin(smoothProgress * Math.PI * 2) * 10;
  crystalField.rotation.set(time * 0.09, time * 0.13 + smoothProgress * 4, time * 0.04);
  crystalField.children.forEach((cube, index) => {
    cube.rotation.x += 0.006 + index * 0.00003;
    cube.rotation.y += 0.009;
    cube.scale.setScalar(0.3 + ((index % 9) / 9) + Math.abs(Math.sin(time + index)) * 0.18);
  });

  ribbon.rotation.z = time * 0.16;
  ribbon.material.emissiveIntensity = 0.7 + Math.abs(wave) * 1.5;

  cyanLight.position.x = Math.sin(time * 0.9) * 8;
  pinkLight.position.y = Math.cos(time * 0.7) * 5;
  goldLight.intensity = 18 + Math.abs(wave) * 42;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', resize);
window.addEventListener('scroll', updateScroll, { passive: true });
window.addEventListener('pointermove', (event) => {
  pointer.x = event.clientX / window.innerWidth - 0.5;
  pointer.y = event.clientY / window.innerHeight - 0.5;
});

updateScroll();
requestAnimationFrame(() => window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) * 0.5));
animate();
