import './style.css'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const canvas = document.getElementById("hero-canvas");
const context = canvas.getContext("2d");

// Ensure canvas resolution matches window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const firstFrameCount = 270;
const secondFrameCount = 269;
const frameCount = firstFrameCount + secondFrameCount;

const currentFrame = index => {
  if (index < firstFrameCount) {
    return `/first_frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`;
  } else {
    const secondIndex = index - firstFrameCount;
    return `/second_frames/ezgif-frame-${(secondIndex + 1).toString().padStart(3, '0')}.jpg`;
  }
};

const images = []
const coffee = {
  frame: 0
};

// Create a placeholder promise array for loading
const loadPromises = [];

for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  const promise = new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
  img.src = currentFrame(i);
  images.push(img);
  loadPromises.push(promise);
}

// Function to draw image covering the canvas (like object-fit: cover)
function drawImageProp(ctx, img) {
    const canvas = ctx.canvas;
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const centerShift_x = (canvas.width - img.width * ratio) / 2;
    const centerShift_y = (canvas.height - img.height * ratio) / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height,
                      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
}

function render() {
  if (images[coffee.frame] && images[coffee.frame].complete) {
      drawImageProp(context, images[coffee.frame]);
  }
}

// Initial draw after first image loads
if(images[0]) {
    images[0].onload = render;
}

// Wait for all images to load before setting up animation (or at least first few)
// But setting up GSAP early is fine, it will just re-render with loaded frames.
gsap.to(coffee, {
  frame: frameCount - 1,
  snap: "frame",
  ease: "none",
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 0.5,
  },
  onUpdate: render
});

// --- Scroll Reveal Animations ---
const revealElements = document.querySelectorAll('.gsap-reveal');
revealElements.forEach((el) => {
  gsap.to(el, {
    scrollTrigger: {
      trigger: el,
      start: "top 85%", // Trigger when top of element hits 85% down viewport
    },
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power3.out",
    stagger: 0.2 // If they are grouped, stagger them
  });
});

// --- Custom Cursor Logic ---
const cursor = document.querySelector('.cursor');
const hoverTargets = document.querySelectorAll('.hover-target');

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

hoverTargets.forEach(target => {
  target.addEventListener('mouseenter', () => {
    cursor.classList.add('hovered');
  });
  target.addEventListener('mouseleave', () => {
    cursor.classList.remove('hovered');
  });
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  render();
});
