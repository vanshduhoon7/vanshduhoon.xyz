/* ==========================================
   VANSH: portfolio script
   Each feature is wrapped in safe(), so one failure
   cannot break the rest of the page.
   ========================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  function safe(fn) { try { fn(); } catch (e) { /* keep going */ } }

  /* ---------- Year + clock (real browser local time) ---------- */
  safe(function () {
    var y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());

    var c = $("#clock");
    if (!c) return;
    var fmt = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    function tick() { c.textContent = fmt.format(new Date()); }
    tick();
    setInterval(tick, 15000);
  });

  /* ---------- Highlight current workspace link ---------- */
  safe(function () {
    if (!("IntersectionObserver" in window)) return;
    var links = $$(".ws a");
    var map = {};
    links.forEach(function (a) { map[(a.getAttribute("href") || "").slice(1)] = a; });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || !map[en.target.id]) return;
        links.forEach(function (a) { a.classList.remove("active"); a.removeAttribute("aria-current"); });
        var a = map[en.target.id];
        a.classList.add("active");
        a.setAttribute("aria-current", "location");
        if (a.scrollIntoView && a.parentNode.scrollWidth > a.parentNode.clientWidth) {
          a.parentNode.scrollLeft = a.offsetLeft - 20;
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });
  });

  /* ---------- Scroll reveal (hidden state only after JS is ready) ---------- */
  safe(function () {
    var items = $$(".reveal");
    if (!items.length) return;
    function showAll() { items.forEach(function (el) { el.classList.add("visible"); }); }
    if (reduceMotion || !("IntersectionObserver" in window)) { showAll(); return; }

    var fired = false;
    var io = new IntersectionObserver(function (entries) {
      fired = true;
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    root.classList.add("js-reveal");
    items.forEach(function (el) { io.observe(el); });
    setTimeout(function () { if (!fired) showAll(); }, 1500);
  });

  /* ---------- Window interactions: click to focus, red dot to collapse ---------- */
  safe(function () {
    var wins = $$("[data-win]");
    function focusWin(w) {
      wins.forEach(function (x) { x.classList.remove("focused"); });
      w.classList.add("focused");
    }
    wins.forEach(function (w) {
      w.addEventListener("pointerdown", function () { focusWin(w); });
      w.addEventListener("focusin", function () { focusWin(w); });
      var btn = w.querySelector("button.wdot");
      if (btn) btn.addEventListener("click", function () {
        var collapsed = w.classList.toggle("collapsed");
        btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
        btn.setAttribute("aria-label", collapsed ? "Expand window" : "Collapse window");
      });
    });
    var term = $("#term");
    if (term) term.classList.add("focused");
  });

  /* ---------- Anime-style sky: falling petals, moon parallax, pause off-screen ---------- */
  safe(function () {
    var hero = $("#home");
    var sky = $(".sky");
    if (!hero || !sky || reduceMotion) return;

    var count = window.innerWidth < 640 ? 7 : 13;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      p.className = "petal";
      p.style.left = (Math.random() * 100).toFixed(1) + "%";
      p.style.setProperty("--t", (14 + Math.random() * 12).toFixed(1) + "s");
      p.style.setProperty("--dl", (-Math.random() * 20).toFixed(1) + "s");
      p.style.setProperty("--dx", ((Math.random() - 0.3) * 160).toFixed(0) + "px");
      p.style.transform = "scale(" + (0.7 + Math.random() * 0.8).toFixed(2) + ")";
      sky.appendChild(p);
    }

    var pending = false, nx = 0, ny = 0;
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      nx = (e.clientX - r.left) / r.width - 0.5;
      ny = (e.clientY - r.top) / r.height - 0.5;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        hero.style.setProperty("--px", nx.toFixed(3));
        hero.style.setProperty("--py", ny.toFixed(3));
      });
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        hero.classList.toggle("paused", !en[0].isIntersecting);
      }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () {
      hero.classList.toggle("paused", document.hidden);
    });
  });

  /* ---------- Simulated terminal: pre-written output only, nothing is executed ---------- */
  safe(function () {
    var out = $("#term-out");
    var form = $("#term-form");
    var input = $("#term-in");
    var chips = $("#term-chips");
    if (!out || !form || !input) return;

    var GH = "https://github.com/vanshduhoon7";
    var LI = "https://www.linkedin.com/in/vanshduhoon7/";

    var COMMANDS = {
      help: [
        "Available commands:",
        "  help      list commands",
        "  about     who I am",
        "  projects  what I'm building",
        "  skills    what I'm learning",
        "  journey   where I've been practicing",
        "  contact   where to find me",
        "  whoami, motto, clear",
        "",
        "All output is pre-written text. Nothing runs on your device."
      ],
      about: [
        "Vansh: B.Tech student in AI & ML (expected graduation 2029).",
        "Beginner cybersecurity learner, sampling every domain to see what sticks.",
        "Leaning toward web security and bug bounty hunting.",
        "Also into CTFs, Linux ricing, hackathons, tech communities and gaming."
      ],
      projects: [
        "01  Hashcam: hackathon team project.",
        "    Monitors AI-agent activity to stop agents from harming user data, credentials or funds.",
        ["    ", { t: "github.com/vanshduhoon7/hashcam ↗", href: GH + "/hashcam" }],
        "",
        "02  Compete-Hub: in development (not finished, not deployed).",
        "    Meant to gather CTFs, hackathons and competitions in one place.",
        "    Built with AI-assisted development.",
        ["    ", { t: "github.com/vanshduhoon7/Compete-hub ↗", href: GH + "/Compete-hub" }]
      ],
      skills: [
        "Learning / Exploring (no proficiency bars, I'm a beginner):",
        "  system     Linux, Kali Linux, networking, Linux rice",
        "  web        web security, Burp Suite, PortSwigger labs",
        "  challenges CTF practice, forensics, reverse engineering",
        "  code       Python, AI/ML (through my degree)",
        "  building   hackathon team projects, AI-assisted development"
      ],
      journey: [
        "PortSwigger labs: solved with hints and learning resources, up to business logic vulnerabilities.",
        "CTFs: easy-level challenges completed.",
        "Reverse engineering: hard for me right now, and the area I most want to improve.",
        "Currently learning: Linux/Kali, networking, Python, web security, Burp Suite, forensics, reverse engineering, CTF practice."
      ],
      contact: [
        ["GitHub:   ", { t: "github.com/vanshduhoon7 ↗", href: GH }],
        ["LinkedIn: ", { t: "linkedin.com/in/vanshduhoon7 ↗", href: LI }],
        "No public email listed yet."
      ],
      whoami: ["vansh: student, beginner, serial rabbit-hole explorer."],
      motto: ["Everything is temporary."]
    };

    function addLine(parts, cls) {
      var div = document.createElement("div");
      div.className = "line" + (cls ? " " + cls : "");
      [].concat(parts).forEach(function (p) {
        if (typeof p === "string") {
          div.appendChild(document.createTextNode(p));
        } else {
          var a = document.createElement("a");
          a.href = p.href;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.textContent = p.t;
          div.appendChild(a);
        }
      });
      out.appendChild(div);
    }

    function run(raw) {
      var cmd = raw.trim().toLowerCase();
      var echo = document.createElement("div");
      echo.className = "line";
      var pr = document.createElement("span");
      pr.className = "prompt";
      pr.textContent = "$";
      echo.appendChild(pr);
      echo.appendChild(document.createTextNode(" " + raw.trim()));
      out.appendChild(echo);

      if (!cmd) return;
      if (cmd === "clear") { out.textContent = ""; return; }

      if (COMMANDS[cmd]) {
        COMMANDS[cmd].forEach(function (l) { addLine(l, ""); });
      } else if (cmd.split(" ")[0] === "sudo") {
        addLine("Nice try. This is a static website; there is nothing to root.", "dim");
      } else {
        addLine("command not found: " + cmd.slice(0, 40) + ". Try 'help'.", "dim");
      }
      out.scrollTop = out.scrollHeight;
    }

    /* Enable the interactive parts (they stay hidden if JS never runs) */
    form.hidden = false;
    if (chips) chips.hidden = false;

    var history = [], hIdx = 0;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value;
      if (v.trim()) { history.push(v); hIdx = history.length; }
      run(v);
      input.value = "";
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp" && history.length) {
        e.preventDefault();
        hIdx = Math.max(0, hIdx - 1);
        input.value = history[hIdx];
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        hIdx = Math.min(history.length, hIdx + 1);
        input.value = history[hIdx] || "";
      } else if (e.key === "Tab") {
        var typed = input.value.trim().toLowerCase();
        if (!typed) return;
        var names = Object.keys(COMMANDS).concat("clear");
        var hits = names.filter(function (n) { return n.indexOf(typed) === 0; });
        if (hits.length === 1) { e.preventDefault(); input.value = hits[0]; }
      }
    });

    if (chips) {
      chips.addEventListener("click", function (e) {
        var b = e.target.closest ? e.target.closest("button[data-cmd]") : null;
        if (b) run(b.getAttribute("data-cmd"));
      });
    }

    out.addEventListener("click", function () {
      var sel = window.getSelection ? String(window.getSelection()) : "";
      if (!sel) input.focus();
    });
  });
})();
