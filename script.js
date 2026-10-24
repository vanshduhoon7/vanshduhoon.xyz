/* ==========================================
   VANSH — Portfolio script
   Every feature is wrapped in safe(), so one failure
   can never stop the rest of the page from working.
   ========================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = !!(window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function $(selector) { return document.querySelector(selector); }

  function safe(name, fn) {
    try { fn(); } catch (err) { /* keep the page working even if one feature fails */ }
  }

  /* ---------- Marks JS as available (enables the mobile menu button) ---------- */
  root.classList.add("js");

  /* ---------- Copyright year ---------- */
  safe("year", function () {
    var year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  });

  /* ---------- HUD clock: real local time from the browser ---------- */
  safe("clock", function () {
    var clock = $("#hud-clock");
    if (!clock) return;

    var formatter = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    });

    function update() { clock.textContent = formatter.format(new Date()); }
    update();
    setInterval(update, 1000);
  });

  /* ---------- Mobile navigation ---------- */
  safe("nav", function () {
    var toggle = $("#nav-toggle");
    var menu = $("#nav-menu");
    if (!toggle || !menu) return;

    function setOpen(open) {
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    toggle.addEventListener("click", function () {
      setOpen(!menu.classList.contains("open"));
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest && event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) setOpen(false);
    });
  });

  /* ---------- Highlight the nav link of the section in view ---------- */
  safe("active-link", function () {
    if (!("IntersectionObserver" in window)) return;

    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
    var map = {};
    links.forEach(function (link) {
      var id = (link.getAttribute("href") || "").replace("#", "");
      if (id) map[id] = link;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.remove("active");
          link.removeAttribute("aria-current");
        });
        var active = map[entry.target.id];
        if (active) {
          active.classList.add("active");
          active.setAttribute("aria-current", "location");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    Object.keys(map).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  });

  /* ---------- Terminal typing effect ---------- */
  safe("typing", function () {
    var output = $("#typed");
    if (!output || reduceMotion) return; // static text stays in place

    var phrases = [
      "whoami",
      "learning web security",
      "python3 security_tool.py",
      "solving CTF challenges",
      "understanding how things work"
    ];

    var phraseIndex = 0;
    var charIndex = 0;
    var deleting = false;

    output.textContent = "";

    function tick() {
      if (document.hidden) { setTimeout(tick, 500); return; }

      var phrase = phrases[phraseIndex];
      output.textContent = phrase.slice(0, charIndex);

      var delay;
      if (!deleting && charIndex < phrase.length) {
        charIndex++;
        delay = 60 + Math.random() * 40;
      } else if (!deleting) {
        deleting = true;
        delay = 1400;
      } else if (charIndex > 0) {
        charIndex--;
        delay = 28;
      } else {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 400;
      }
      setTimeout(tick, delay);
    }

    tick();
  });

  /* ---------- Scroll reveal ---------- */
  safe("reveal", function () {
    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!items.length) return;

    function showAll() {
      items.forEach(function (el) { el.classList.add("visible"); });
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      showAll();
      return;
    }

    var fired = false;

    var observer = new IntersectionObserver(function (entries) {
      fired = true;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    // Hidden state is only switched on now that the observer exists.
    root.classList.add("js-reveal");
    items.forEach(function (el) { observer.observe(el); });

    // Safety net: if the observer never reports back, show everything.
    setTimeout(function () {
      if (!fired) showAll();
    }, 1500);
  });

  /* ---------- Hero: mouse glow + digital rain + particle network ---------- */
  safe("hero-effects", function () {
    if (reduceMotion) return;

    var hero = $("#home");
    var canvas = $("#cyber-canvas");
    if (!hero || !canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var FRAME_MS = 1000 / 30;           // 30 fps cap
    var CHARS = "01ABCDEF0123456789<>/{}[]#$%&*+=";

    var w = 0, h = 0, fontSize = 14, colWidth = 20;
    var columns = [], particles = [];
    var rafId = 0, last = 0, running = false;
    var heroVisible = true;
    var mouse = { x: -9999, y: -9999 };

    function randomChar() { return CHARS.charAt((Math.random() * CHARS.length) | 0); }

    function resetColumn(col, initial) {
      col.len = 8 + ((Math.random() * 10) | 0);
      col.speed = 2.5 + Math.random() * 4;
      col.y = initial ? Math.random() * h : -Math.random() * h * 0.6;
      col.chars = [];
      for (var i = 0; i < col.len; i++) col.chars.push(randomChar());
    }

    function build() {
      var small = w < 560;
      colWidth = small ? 26 : 20;

      columns = [];
      var count = Math.floor(w / colWidth);
      for (var i = 0; i < count; i++) {
        var col = { x: i * colWidth + 3 };
        resetColumn(col, true);
        columns.push(col);
      }

      var total = Math.max(16, Math.min(small ? 28 : 56, Math.floor((w * h) / 20000)));
      particles = [];
      for (var p = 0; p < total; p++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          r: 0.8 + Math.random() * 1.3
        });
      }
    }

    function resize() {
      var rect = hero.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = rect.width;
      h = rect.height;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = fontSize + "px ui-monospace, Menlo, Consolas, monospace";
      ctx.textBaseline = "top";

      build();
    }

    function drawRain() {
      for (var i = 0; i < columns.length; i++) {
        var col = columns[i];
        col.y += col.speed;

        if (Math.random() < 0.15) col.chars[(Math.random() * col.len) | 0] = randomChar();

        for (var k = 0; k < col.len; k++) {
          var y = col.y - k * fontSize;
          if (y < -fontSize || y > h) continue;

          ctx.fillStyle = k === 0
            ? "rgba(190, 238, 255, 0.7)"
            : "rgba(40, 150, 255, " + (0.28 * (1 - k / col.len)).toFixed(3) + ")";
          ctx.fillText(col.chars[k], col.x, y);
        }

        if (col.y - col.len * fontSize > h) resetColumn(col, false);
      }
    }

    function drawNetwork() {
      var maxDist = w < 560 ? 85 : 120;
      var maxSq = maxDist * maxDist;
      var mouseDist = 150;

      for (var i = 0; i < particles.length; i++) {
        var a = particles[i];

        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;

        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(139, 223, 255, 0.85)";
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var b = particles[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var sq = dx * dx + dy * dy;

          if (sq < maxSq) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = "rgba(50, 151, 255, " + (0.2 * (1 - sq / maxSq)).toFixed(3) + ")";
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        var mx = a.x - mouse.x;
        var my = a.y - mouse.y;
        var md = Math.sqrt(mx * mx + my * my);
        if (md < mouseDist) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = "rgba(155, 231, 255, " + (0.28 * (1 - md / mouseDist)).toFixed(3) + ")";
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    function frame(t) {
      rafId = requestAnimationFrame(frame);
      if (t - last < FRAME_MS) return;
      last = t;

      ctx.clearRect(0, 0, w, h);
      drawRain();
      drawNetwork();
    }

    function start() {
      if (running || document.hidden || !heroVisible || !w) return;
      running = true;
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(rafId);
    }

    /* Pointer: moves the glow and feeds the particle network */
    var glowPending = false;
    hero.addEventListener("pointermove", function (event) {
      var rect = hero.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;

      if (!glowPending) {
        glowPending = true;
        requestAnimationFrame(function () {
          glowPending = false;
          hero.style.setProperty("--mx", mouse.x + "px");
          hero.style.setProperty("--my", mouse.y + "px");
        });
      }
    });

    hero.addEventListener("pointerleave", function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    /* Pause when the tab is hidden or the hero is scrolled out of view */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible) start(); else stop();
      }, { threshold: 0 }).observe(hero);
    }

    /* Resize (debounced) */
    var resizeTimer = 0;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    resize();
    start();
  });
})();
