const root = document.documentElement;
const body = document.body;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const intro = document.querySelector("[data-intro]");
const enterButton = document.querySelector("[data-enter]");
const replayIntroButton = document.querySelector("[data-replay-intro]");
const soundButton = document.querySelector(".sound-toggle");
const designToggle = document.querySelector("[data-design-toggle]");
const teaserVideo = document.querySelector(".teaser-video");
const heroVideo = document.querySelector(".hero-video");
const videoShell = document.querySelector("[data-video-shell]");
const playButton = document.querySelector(".video-play");
const teaserModal = document.querySelector("[data-teaser-modal]");
const openTeaserButton = document.querySelector("[data-open-teaser]");
const closeTeaserButton = document.querySelector("[data-close-teaser]");
const modalVideo = document.querySelector(".modal-video");
const cursorAura = document.querySelector(".cursor-aura");

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let introTimer = null;
let audioContext = null;
let humGain = null;
let pulseTimer = null;

const characters = [
  {
    name: "Bellovore",
    line: "He can shape the hour, but not escape what it demands.",
    power: "Temporal architecture",
    cost: "Every saved moment returns as debt",
    signal: "Gold chronoglyph",
  },
  {
    name: "Anavria",
    line: "Some lives are too small for history and too important for silence.",
    power: "Memory flame",
    cost: "The past answers in fragments",
    signal: "White-gold eclipse",
  },
  {
    name: "Diavore",
    line: "He carries the road between worlds and senses when the hour lies.",
    power: "Realm crossing",
    cost: "No road lets him return unchanged",
    signal: "Blue roadflare",
  },
  {
    name: "Drakkenvorax",
    line: "He does not break truth. He makes it tremble.",
    power: "Fracture dominion",
    cost: "Every victory leaves a wound in reality",
    signal: "Red broken sigil",
  },
];

const characterLines = {
  Bellovore: characters[0].line,
  Anavria: characters[1].line,
  Diavore: characters[2].line,
  Drakkenvorax: characters[3].line,
};

const echoFragments = [
  "The hour does not answer. It remembers.",
  "A sealed world moves when no one is looking.",
  "The first fragment is not lost. It is waiting for cost.",
  "Ask again when the archive has finished breathing.",
  "A crown of clocks bends above a sleeping wound.",
  "The road between worlds opens only for the one who returns changed.",
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function dismissIntro() {
  if (!intro) return;

  clearTimeout(introTimer);
  intro.classList.add("is-dismissed");
  body.classList.remove("intro-active");
}

function replayIntro() {
  if (!intro) return;

  intro.classList.remove("is-dismissed");
  body.classList.add("intro-active");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function setupIntro() {
  if (!intro) return;

  enterButton?.addEventListener("click", dismissIntro);
  replayIntroButton?.addEventListener("click", replayIntro);
  document.querySelectorAll("[data-intro-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.introJump);
      dismissIntro();
      target?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });
}

function updatePointer(event) {
  const halfWidth = window.innerWidth / 2;
  const halfHeight = window.innerHeight / 2;

  targetX = clamp((event.clientX - halfWidth) / halfWidth, -1, 1);
  targetY = clamp((event.clientY - halfHeight) / halfHeight, -1, 1);

  if (cursorAura) {
    cursorAura.style.left = `${event.clientX}px`;
    cursorAura.style.top = `${event.clientY}px`;
  }
}

function updateScrollVars() {
  const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
  const progress = clamp(window.scrollY / maxScroll, 0, 1);

  root.style.setProperty("--scroll-shift", String(Math.min(window.scrollY, 1800)));
  root.style.setProperty("--scroll-progress", progress.toFixed(4));
}

function animationTick() {
  currentX += (targetX - currentX) * 0.08;
  currentY += (targetY - currentY) * 0.08;

  root.style.setProperty("--mx", currentX.toFixed(4));
  root.style.setProperty("--my", currentY.toFixed(4));

  requestAnimationFrame(animationTick);
}

function setupSmoothScroll() {
  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      dismissIntro();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });
}

function setupReveal() {
  const revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -9% 0px" },
  );

  revealItems.forEach((item) => observer.observe(item));
}

function setupTiltCards() {
  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (prefersReducedMotion) return;

      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.setProperty("--tilt-x", `${x * 7}deg`);
      card.style.setProperty("--tilt-y", `${y * -6}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

function setupVideo() {
  if (playButton && teaserVideo && videoShell) {
    playButton.addEventListener("click", async () => {
      try {
        await teaserVideo.play();
        videoShell.classList.add("is-playing");
      } catch {
        videoShell.classList.remove("is-playing");
      }
    });

    teaserVideo.addEventListener("play", () => videoShell.classList.add("is-playing"));
    teaserVideo.addEventListener("pause", () => videoShell.classList.remove("is-playing"));
  }

  openTeaserButton?.addEventListener("click", async () => {
    dismissIntro();
    if (!teaserModal || !modalVideo) return;

    teaserModal.hidden = false;
    try {
      await modalVideo.play();
    } catch {
      modalVideo.pause();
    }
  });

  closeTeaserButton?.addEventListener("click", () => {
    if (!teaserModal || !modalVideo) return;
    modalVideo.pause();
    teaserModal.hidden = true;
  });

  teaserModal?.addEventListener("click", (event) => {
    if (event.target !== teaserModal || !modalVideo) return;
    modalVideo.pause();
    teaserModal.hidden = true;
  });
}

function setupSound() {
  if (!soundButton) return;

  const videos = [heroVideo, teaserVideo, modalVideo].filter(Boolean);

  soundButton.addEventListener("click", () => {
    const shouldMute = soundButton.getAttribute("aria-pressed") === "true";
    videos.forEach((video) => {
      video.muted = shouldMute;
    });
    if (shouldMute) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
    soundButton.setAttribute("aria-pressed", String(!shouldMute));
    soundButton.querySelector("span").textContent = shouldMute ? "Sound Off" : "Sound On";
  });
}

function setupDesignToggle() {
  if (!designToggle) return;

  designToggle.addEventListener("click", () => {
    const isArchive = body.classList.toggle("archive-mode");
    designToggle.setAttribute("aria-pressed", String(isArchive));
    designToggle.textContent = isArchive ? "Portal Mode" : "Archive Mode";
  });
}

function startAmbientSound() {
  if (prefersReducedMotion) return;

  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return;

  if (!audioContext) {
    audioContext = new AudioCtor();
    humGain = audioContext.createGain();
    humGain.gain.value = 0.0001;
    humGain.connect(audioContext.destination);

    const low = audioContext.createOscillator();
    const shimmer = audioContext.createOscillator();
    const shimmerGain = audioContext.createGain();

    low.type = "sine";
    low.frequency.value = 54;
    shimmer.type = "triangle";
    shimmer.frequency.value = 216;
    shimmerGain.gain.value = 0.025;

    low.connect(humGain);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(humGain);
    low.start();
    shimmer.start();
  }

  audioContext.resume();
  humGain.gain.setTargetAtTime(0.075, audioContext.currentTime, 0.18);

  clearInterval(pulseTimer);
  pulseTimer = setInterval(() => {
    if (!audioContext || !humGain) return;
    humGain.gain.setTargetAtTime(0.12, audioContext.currentTime, 0.05);
    humGain.gain.setTargetAtTime(0.075, audioContext.currentTime + 0.16, 0.22);
  }, 3600);
}

function stopAmbientSound() {
  clearInterval(pulseTimer);
  pulseTimer = null;
  if (audioContext && humGain) {
    humGain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.16);
  }
}

function setupCharacters() {
  const cards = Array.from(document.querySelectorAll("[data-character-card]"));
  const name = document.querySelector("[data-dossier-name]");
  const line = document.querySelector("[data-dossier-line]");
  const power = document.querySelector("[data-dossier-power]");
  const cost = document.querySelector("[data-dossier-cost]");
  const signal = document.querySelector("[data-dossier-signal]");
  const prev = document.querySelector("[data-prev-character]");
  const next = document.querySelector("[data-next-character]");
  const openFile = document.querySelector("[data-open-character-file]");
  if (!cards.length || !name || !line || !power || !cost || !signal) return;

  let activeIndex = 0;

  function setActive(index) {
    activeIndex = (index + cards.length) % cards.length;
    const active = characters[activeIndex];

    cards.forEach((card, cardIndex) => {
      const offset = cardIndex - activeIndex;
      const wrappedOffset =
        offset > cards.length / 2
          ? offset - cards.length
          : offset < -cards.length / 2
            ? offset + cards.length
            : offset;

      card.classList.toggle("is-active", cardIndex === activeIndex);
      card.style.setProperty("--x", `${wrappedOffset * 25}%`);
      card.style.setProperty("--z", `${cardIndex === activeIndex ? 160 : 30 - Math.abs(wrappedOffset) * 42}px`);
      card.style.setProperty("--ry", `${wrappedOffset * -10}deg`);
      card.style.setProperty("--scale", String(cardIndex === activeIndex ? 1.06 : 0.84));
      card.style.setProperty("--opacity", String(cardIndex === activeIndex ? 1 : 0.52));
    });

    name.textContent = active.name;
    line.textContent = active.line;
    power.textContent = active.power;
    cost.textContent = active.cost;
    signal.textContent = active.signal;

    name.animate(
      [
        { opacity: 0.25, transform: "translateY(10px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 360, easing: "ease-out" },
    );
  }

  cards.forEach((card, index) => {
    card.addEventListener("click", () => setActive(index));
  });

  prev?.addEventListener("click", () => setActive(activeIndex - 1));
  next?.addEventListener("click", () => setActive(activeIndex + 1));
  openFile?.addEventListener("click", () => {
    const active = characters[activeIndex];
    line.textContent = `${active.name} file opening soon: portrait, voice line, relic, chapter fragments, and realm ties.`;
  });

  setActive(0);
}

function setupRealms() {
  const holder = document.querySelector("[data-sealed-worlds]");
  const core = document.querySelector(".engine-core span");
  if (!holder) return;

  const fragment = document.createDocumentFragment();
  const rings = [165, 225, 285, 340];

  for (let index = 0; index < 91; index += 1) {
    const point = document.createElement("i");
    const angle = index * 137.508;
    const radius = rings[index % rings.length] + Math.sin(index * 1.7) * 16;
    point.style.transform = `rotate(${angle}deg) translateX(${radius}px) rotate(${-angle}deg)`;
    point.style.animationDelay = `${(index % 17) * -0.18}s`;
    point.style.setProperty("--star-opacity", String(0.18 + (index % 7) * 0.065));
    fragment.appendChild(point);
  }

  holder.appendChild(fragment);

  document.querySelectorAll(".world-node").forEach((button) => {
    button.addEventListener("click", () => {
      if (!core) return;
      const label = button.textContent.trim();
      core.textContent = `${label} signal found`;
      core.animate(
        [
          { opacity: 0.3, transform: "translateY(6px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 360, easing: "ease-out" },
      );
    });
  });
}

function setupEcho() {
  const form = document.querySelector("[data-echo-form]");
  const input = document.querySelector("#echo-word");
  const output = document.querySelector("[data-echo-output]");
  const status = document.querySelector("[data-echo-status]");
  if (!form || !input || !output) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const seed = input.value.trim().length || 1;
    const index = (seed + Date.now()) % echoFragments.length;
    typeEcho(output, echoFragments[index]);
    if (status) {
      status.textContent = "Fragment received.";
      setTimeout(() => {
        status.textContent = "The archive is awake.";
      }, 1800);
    }
  });
}

function typeEcho(output, message) {
  output.textContent = "";
  output.classList.add("is-typing");
  let index = 0;
  const speed = prefersReducedMotion ? 0 : 24;

  function write() {
    output.textContent = message.slice(0, index);
    index += 1;

    if (index <= message.length) {
      setTimeout(write, speed);
    } else {
      output.classList.remove("is-typing");
    }
  }

  write();
}

function setupDustCanvas() {
  const canvas = document.querySelector(".dust-canvas");
  if (!canvas || prefersReducedMotion) return;

  const context = canvas.getContext("2d");
  const particles = Array.from({ length: 150 }, () => ({
    x: Math.random(),
    y: Math.random(),
    z: Math.random() * 0.9 + 0.1,
    speed: Math.random() * 0.28 + 0.05,
    hue: Math.random() > 0.8 ? "111, 178, 179" : "255, 217, 120",
  }));

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle) => {
      particle.y -= particle.speed / window.innerHeight;
      particle.x += Math.sin((particle.y + particle.z) * 8) * 0.00035;

      if (particle.y < -0.04) {
        particle.y = 1.04;
        particle.x = Math.random();
      }

      const x = particle.x * window.innerWidth + currentX * particle.z * 34;
      const y = particle.y * window.innerHeight + currentY * particle.z * 22;
      const radius = particle.z * 1.7;
      const alpha = 0.1 + particle.z * 0.34;

      context.beginPath();
      context.fillStyle = `rgba(${particle.hue}, ${alpha})`;
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  draw();
}

document.addEventListener("pointermove", updatePointer, { passive: true });
window.addEventListener("scroll", updateScrollVars, { passive: true });
window.addEventListener("resize", updateScrollVars, { passive: true });

setupIntro();
setupSmoothScroll();
setupReveal();
setupTiltCards();
setupVideo();
setupSound();
setupDesignToggle();
setupCharacters();
setupRealms();
setupEcho();
setupDustCanvas();
updateScrollVars();

if (!prefersReducedMotion) {
  animationTick();
}
