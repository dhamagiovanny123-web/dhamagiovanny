const host = document.getElementById('three-bg');
if (!host) {
  console.warn('#three-bg tidak ditemukan');
}

// Mouse state
let mouseX = 0, mouseY = 0;
let halfX = window.innerWidth / 2;
let halfY = window.innerHeight / 2;

// Camera, scene, renderer
const camera = new THREE.PerspectiveCamera(33, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.z = 750;

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio)); // batasi DPR
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.inset = '0';
renderer.domElement.style.zIndex = '0';
renderer.domElement.style.pointerEvents = 'none';
host.appendChild(renderer.domElement);

// Group root
const group = new THREE.Group();
group.scale.set(1.35, 1.35, 1.35);
scene.add(group);

// Logo sprites in ring center
const items = [
  { label: 'HTML',  bg: '#ff784e' },
  { label: 'CSS',   bg: '#5a8dee' },
  { label: 'JS',    bg: '#f7df1e', fg: '#111' },
  { label: 'React', bg: '#8bdcf6', fg: '#111' },
  { label: 'Vue',   bg: '#69c39a' },
  { label: 'Node',  bg: '#7bcf64' },
];

const centerZ = 0;
const ringRadius = 110;
const sprites = [];
items.forEach((spec, i) => {
  const sprite = makeSprite(spec.label, spec.bg, spec.fg || '#fff');
  const angle = (i / items.length) * Math.PI * 2;
  sprite.position.set(Math.cos(angle) * ringRadius, Math.sin(angle) * ringRadius, centerZ);
  sprite.renderOrder = 10;
  sprite.material.depthTest = false;
  sprites.push(sprite);
  group.add(sprite);
});

function makeSprite(text, bg = '#a78bfa', fg = '#fff') {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const r = 20;

  ctx.shadowColor = bg;
  ctx.shadowBlur = 10;

  ctx.fillStyle = bg;
  roundRect(ctx, 18, 18, size - 36, size - 36, r);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = fg;
  ctx.font = 'bold 28px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.95 });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(80, 80, 1);
  return sprite;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Particles — gunakan InstancedMesh (lebih cepat)
const particleGeom = new THREE.SphereGeometry(10, 12, 12); // sedikit turunkan segmen
const particleMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.22 });
const COUNT = 600; // lebih banyak, tetap ringan
const instanced = new THREE.InstancedMesh(particleGeom, particleMat, COUNT);

const innerExclusion = 140;
const shellX = 550, shellY = 380, shellZ = 480;
const dummy = new THREE.Object3D();
for (let i = 0; i < COUNT; i++) {
  let x, y, z, tries = 0;
  do {
    x = (Math.random() - 0.5) * shellX;
    y = (Math.random() - 0.5) * shellY;
    z = -120 + (Math.random() - 0.5) * shellZ;
    if (++tries > 10) break;
  } while (Math.sqrt(x*x + y*y + z*z) < innerExclusion);

  dummy.position.set(x, y, z);
  dummy.rotation.y = Math.random() * Math.PI * 2;
  const s = 0.9 + Math.random() * 0.4; // variasi ukuran kecil
  dummy.scale.set(s, s, s);
  dummy.updateMatrix();
  instanced.setMatrixAt(i, dummy.matrix);
}
instanced.instanceMatrix.needsUpdate = true;
group.add(instanced);

// Mouse parallax
document.body.style.touchAction = 'none';
window.addEventListener('pointermove', (event) => {
  if (event.isPrimary === false) return;
  mouseX = event.clientX - halfX;
  mouseY = event.clientY - halfY;
});

window.addEventListener('resize', () => {
  halfX = window.innerWidth / 2;
  halfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(animate);
let isVisible = true;
document.addEventListener('visibilitychange', () => {
  isVisible = !document.hidden;
});
function animate(timeMs) {
  if (!isVisible) return; // hemat saat tab tidak aktif

  camera.position.x += (mouseX - camera.position.x) * 0.04;
  camera.position.y += (-mouseY + 120 - camera.position.y) * 0.04;
  camera.lookAt(scene.position);

  const time = timeMs * 0.0004;
  group.rotation.y = time;

  // Rotasi ringan pada instanced
  instanced.rotation.y = time * 1.1;

  sprites.forEach(s => s.lookAt(camera.position));
  renderer.render(scene, camera);
}