
/* ==========================================
   VANS H CYBER PORTFOLIO
   Terminal + digital rain + particle network
   ========================================== */

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/* Terminal typing effect */
const phrases = [
  "nmap -sV authorized-lab",
  "learning web security",
  "python3 security_tool.py",
  "analyzing network traffic",
  "solving CTF challenges",
  "understanding how things work"
];

const output = document.querySelector("#typed");

if (output) {
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let typingTimer;

  function type() {
    const phrase = phrases[phraseIndex];
    output.textContent = phrase.slice(0, charIndex);

    if (!deleting && charIndex < phrase.length) {
      charIndex++;
      typingTimer = setTimeout(type, 65);
    } else if (!deleting) {
      deleting = true;
      typingTimer = setTimeout(type, 1250);
    } else if (charIndex > 0) {
      charIndex--;
      typingTimer = setTimeout(type, 28);
    } else {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingTimer = setTimeout(type, 350);
    }
  }

  if (reduceMotion) {
    output.textContent = phrases[0];
  } else {
    type();
  }
}

/* Current year */
const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

/* Linux-style system HUD */
const hero = document.querySelector(".hero");
const terminal = document.querySelector(".terminal");

if (hero && terminal) {
  const hud = document.createElement("div");
  hud.className = "system-hud";
  hud.innerHTML = `
    <span class="hud-item">
      <i class="hud-dot"></i> SYSTEM ONLINE
    </span>
    <span class="hud-item">ENV: PORTFOLIO</span>
    <span class="hud-item hud-clock" id="hud-clock">--:--:--</span>
  `;

  terminal.before(hud);

  const clock = hud.querySelector("#hud-clock");

  function updateClock() {
    if (clock) {
      clock.textContent = new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }).format(new Date());
    }
  }

  updateClock();

  if (!reduceMotion) {
    setInterval(updateClock, 1000);
  }
}

/* Scroll reveal */
const revealElements = document.querySelectorAll(
  ".section, .project-card, .journey-list > div"
);

revealElements.forEach((element) => {
  element.classList.add("reveal");
});

if ("IntersectionObserver" in window && !reduceMotion) {
  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observerInstance.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
}

/* ==========================================
   DIGITAL RAIN + INTERACTIVE PARTICLE NETWORK
   Canvas is confined to the hero section.
   ========================================== */

if (hero && !reduceMotion) {
  const canvas = document.createElement("canvas");
  canvas.className = "cyber-canvas";
  canvas.setAttribute("aria-hidden", "true");

  const glow = document.createElement("div");
  glow.className = "hero-glow";
  glow.setAttribute("aria-hidden", "true");

  hero.prepend(canvas);
  hero.prepend(glow);

  const ctx = canvas.getContext("2d");

  if (ctx) {
    let width = 0;
    let height = 0;
    let animationId;
    let lastFrame = 0;
    const frameInterval = 1000 / 30;

    const characters =
      "01アイウエオカキクケコABCDEFGHIJKLMNOPQRSTUVWXYZ#$%";

    let drops = [];
    let particles = [];
    const mouse = { x: -1000, y: -1000 };

    function resizeCanvas() {
      const rect = hero.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const columnWidth = width < 650 ? 20 : 17;
      const columns = Math.ceil(width / columnWidth);

      drops = Array.from({ length: columns }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.5 + Math.random() * 1.4,
        length: 4 + Math.floor(Math.random() * 10)
      }));

      const particleCount = Math.min(
        65,
        Math.max(20, Math.floor(width / 15))
      );

      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: 0.8 + Math.random() * 1.4
      }));
    }

    function drawRain() {
      ctx.save();
      ctx.font = "12px monospace";

      drops.forEach((drop) => {
        const char = characters[
          Math.floor(Math.random() * characters.length)
        ];

        ctx.fillStyle = Math.random() > 0.94
          ? "rgba(180, 235, 255, 0.8)"
          : "rgba(47, 153, 255, 0.38)";

        ctx.fillText(char, drop.x, drop.y);

        drop.y += drop.speed * 2.2;

        if (drop.y > height + Math.random() * 100) {
          drop.y = -20;
          drop.x = Math.random() * width;
        }
      });

      ctx.restore();
    }

    function drawNetwork() {
      const maxDistance = width < 650 ? 75 : 115;

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > width) {
          particle.vx *= -1;
        }

        if (particle.y < 0 || particle.y > height) {
          particle.vy *= -1;
        }

        /* Gentle attraction around the pointer */
        const dxMouse = mouse.x - particle.x;
        const dyMouse = mouse.y - particle.y;
        const mouseDistance = Math.hypot(dxMouse, dyMouse);

        if (mouseDistance < 125 && mouseDistance > 0) {
          particle.x -= dxMouse * 0.0007;
          particle.y -= dyMouse * 0.0007;
        }

        ctx.beginPath();
        ctx.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = "#8bdfff";
        ctx.fill();

        particles.forEach((other) => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.hypot(dx, dy);

          if (distance < maxDistance && distance > 0) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);

            ctx.strokeStyle =
              `rgba(50, 151, 255, ${0.15 * (1 - distance / maxDistance)})`;

            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        });
      });
    }

    function animate(timestamp) {
      if (document.hidden) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      if (timestamp - lastFrame < frameInterval) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      lastFrame = timestamp;
      ctx.clearRect(0, 0, width, height);

      drawRain();
      drawNetwork();

      animationId = requestAnimationFrame(animate);
    }

    hero.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    });

    hero.addEventListener("pointerleave", () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    window.addEventListener("resize", resizeCanvas);

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && !animationId) {
        animationId = requestAnimationFrame(animate);
      }
    });

    resizeCanvas();
    animationId = requestAnimationFrame(animate);
  }
}
