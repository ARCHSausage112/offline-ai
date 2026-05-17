const panels = [...document.querySelectorAll('.panel')];
const stage = document.querySelector('.infinite-stage');
const canvas = document.querySelector('#starfield');
const ctx = canvas.getContext('2d');
let stars = [];
let width = 0;
let height = 0;
let loopLock = false;

const sectionCount = panels.length;
const loopCopies = 5;

function clonePanels() {
  const originals = panels.map((panel) => panel.cloneNode(true));
  for (let i = 0; i < loopCopies; i += 1) {
    originals.forEach((panel) => {
      const clone = panel.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      stage.appendChild(clone);
    });
  }
}

clonePanels();
const allPanels = [...document.querySelectorAll('.panel')];

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-visible', entry.isIntersecting));
  },
  { threshold: 0.22 }
);

allPanels.forEach((panel) => observer.observe(panel));

function resizeStars() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  stars = Array.from({ length: Math.floor((width * height) / 8500) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random() * width,
    speed: 0.9 + Math.random() * 2.8,
    hue: 175 + Math.random() * 130,
  }));
}

function drawStars() {
  ctx.clearRect(0, 0, width, height);
  const cx = width / 2;
  const cy = height / 2;
  const scrollBoost = 1 + Math.min(window.scrollY / 2200, 3);

  for (const star of stars) {
    star.z -= star.speed * scrollBoost;
    if (star.z <= 0) {
      star.x = Math.random() * width;
      star.y = Math.random() * height;
      star.z = width;
    }

    const scale = width / star.z;
    const x = (star.x - cx) * scale + cx;
    const y = (star.y - cy) * scale + cy;
    const radius = Math.max(0, (1 - star.z / width) * 3.4);

    if (x < 0 || x > width || y < 0 || y > height) continue;

    ctx.beginPath();
    ctx.fillStyle = `hsla(${star.hue}, 100%, 75%, ${0.25 + radius / 4})`;
    ctx.shadowColor = `hsl(${star.hue}, 100%, 60%)`;
    ctx.shadowBlur = 14;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  requestAnimationFrame(drawStars);
}

function loopScroll() {
  if (loopLock) return;
  const sectionHeight = window.innerHeight * sectionCount;
  const lowerBound = sectionHeight * 0.55;
  const upperBound = sectionHeight * (loopCopies + 0.8);

  if (window.scrollY < lowerBound) {
    loopLock = true;
    window.scrollTo({ top: window.scrollY + sectionHeight * 2, behavior: 'instant' });
  } else if (window.scrollY > upperBound) {
    loopLock = true;
    window.scrollTo({ top: window.scrollY - sectionHeight * 2, behavior: 'instant' });
  }

  if (loopLock) requestAnimationFrame(() => { loopLock = false; });
}

window.addEventListener('resize', resizeStars);
window.addEventListener('scroll', loopScroll, { passive: true });
resizeStars();
drawStars();
requestAnimationFrame(() => window.scrollTo(0, window.innerHeight * sectionCount * 2));
