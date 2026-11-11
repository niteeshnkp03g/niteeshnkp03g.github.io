"use strict";

const hasMatchMedia = typeof window.matchMedia === "function";
const finePointer = hasMatchMedia ? window.matchMedia("(hover: hover) and (pointer: fine)").matches : false;
const reduceMotion = hasMatchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
const canSubmitHttpForm = () => window.location.protocol === "http:" || window.location.protocol === "https:";
const hasIntersectionObserver = typeof window.IntersectionObserver === "function";

/* ═══════════════════════════════
   CUSTOM CURSOR
═══════════════════════════════ */
const cursor    = document.getElementById("cursor");
const cursorDot = document.getElementById("cursorDot");
let mx = -200, my = -200, cx = -200, cy = -200;

if (cursor && cursorDot) {
  let cursorFramePending = false;
  const animateCursor = () => {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.left = cx + "px";
    cursor.style.top  = cy + "px";
    if (Math.abs(mx - cx) > .5 || Math.abs(my - cy) > .5) {
      requestAnimationFrame(animateCursor);
    } else {
      cx = mx;
      cy = my;
      cursorFramePending = false;
    }
  };

  if (finePointer && !reduceMotion) {
    document.addEventListener("mousemove", e => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.left = mx + "px";
      cursorDot.style.top  = my + "px";
      if (!cursorFramePending) {
        cursorFramePending = true;
        requestAnimationFrame(animateCursor);
      }
    });

    document.querySelectorAll("a,button,.cert-card,.project-card,.stat-card,.interest-item,.achieve-card").forEach(el => {
      el.addEventListener("mouseenter", () => {
        cursor.style.width  = "54px";
        cursor.style.height = "54px";
        cursor.style.borderColor = "rgba(99,102,241,.5)";
      });
      el.addEventListener("mouseleave", () => {
        cursor.style.width  = "36px";
        cursor.style.height = "36px";
        cursor.style.borderColor = "";
      });
    });
  }
}

/* ═══════════════════════════════
   NAV SCROLL
═══════════════════════════════ */
const nav = document.getElementById("nav");
/* ═══════════════════════════════
   MOBILE MENU
═══════════════════════════════ */
const navToggle  = document.getElementById("navToggle");
const mobileMenu = document.getElementById("mobileMenu");
const setMenu = open => {
  if (!mobileMenu || !navToggle) return;
  mobileMenu.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
};
if (navToggle && mobileMenu) {
  navToggle.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
  document.querySelectorAll(".mob-link").forEach(l =>
    l.addEventListener("click", () => setMenu(false))
  );
}


/* ═══════════════════════════════
   SMOOTH SCROLL
═══════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});


/* ═══════════════════════════════
   ACTIVE NAV ON SCROLL
═══════════════════════════════ */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

const syncScrollState = () => {
  let current = "";
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 130) current = s.id; });
  navLinks.forEach(l => l.classList.toggle("active", l.dataset.section === current));
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 60);
};
let scrollUpdatePending = false;
const scheduleScrollUpdate = () => {
  if (scrollUpdatePending) return;
  scrollUpdatePending = true;
  requestAnimationFrame(() => {
    syncScrollState();
    scrollUpdatePending = false;
  });
};
window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
syncScrollState();


/* ═══════════════════════════════
   HERO CANVAS — PARTICLE NETWORK
═══════════════════════════════ */
(function heroCanvas() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  let W, H, pts, glow;
  let resizePending = false;
  const MAX_COUNT = 85, DIST = 130, DIST_SQUARED = DIST * DIST;
  const FRAME_INTERVAL = 1000 / 30;

  const resize = () => {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    if (width === W && height === H) return;
    W = canvas.width = width;
    H = canvas.height = height;
    if (!W || !H) return;
    const count = Math.max(28, Math.min(MAX_COUNT, Math.round(W / 12)));
    pts = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .38,
      vy: (Math.random() - .5) * .38,
    }));
    glow = ctx.createRadialGradient(W * .3, H * .4, 0, W * .3, H * .4, W * .55);
    glow.addColorStop(0, "rgba(99,102,241,.06)");
    glow.addColorStop(1, "transparent");
  };
  window.addEventListener("resize", () => {
    if (resizePending) return;
    resizePending = true;
    requestAnimationFrame(() => {
      resizePending = false;
      resize();
    });
  }, { passive: true });
  resize();

  let mouseX = W / 2, mouseY = H / 2;
  canvas.addEventListener("mousemove", e => {
    const r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });

  let lastFrame = 0;
  const tick = timestamp => {
    if (!W || !H || !pts) return;
    if (timestamp && timestamp - lastFrame < FRAME_INTERVAL) {
      if (running) rafId = requestAnimationFrame(tick);
      return;
    }
    if (timestamp) lastFrame = timestamp;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x - mouseX, dy = p.y - mouseY;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared > 0 && distanceSquared < 8100) {
        const d = Math.sqrt(distanceSquared);
        p.vx += dx / d * .055; p.vy += dy / d * .055;
        const sp = Math.sqrt(p.vx**2 + p.vy**2);
        if (sp > 1.4) { p.vx /= sp; p.vy /= sp; }
      }
    });

    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < DIST_SQUARED) {
          const d = Math.sqrt(distanceSquared);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(99,102,241,${(1 - d/DIST) * .32})`;
          ctx.lineWidth = .7;
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y, 2, 0, Math.PI*2);
      ctx.fillStyle = "rgba(165,180,252,.5)";
      ctx.fill();
    }
    if (running) rafId = requestAnimationFrame(tick);
  };

  // Run only while the hero is visible and the tab is active.
  let running = false, rafId = 0, inView = true;
  const setRunning = on => {
    if (on && !running) { running = true; lastFrame = 0; rafId = requestAnimationFrame(tick); }
    else if (!on) { running = false; cancelAnimationFrame(rafId); }
  };
  if (reduceMotion || !hasIntersectionObserver) {
    tick();                       // one static frame, no loop
  } else {
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; setRunning(inView && !document.hidden); }).observe(canvas);
    document.addEventListener("visibilitychange", () => setRunning(inView && !document.hidden));
  }
})();


/* ═══════════════════════════════
   TYPED ROLE
═══════════════════════════════ */
(function typedRole() {
  const el = document.getElementById("typedRole");
  if (!el) return;

  const roles = [
    "Site Reliability Engineer",
    "Cloud Engineer",
    "Cloud Support Engineer",
    "Observability Specialist",
    "Product Support Engineer",
    "DevOps Practitioner",
  ];
  if (reduceMotion) { el.textContent = roles[0]; return; }
  let ri = 0, ci = 0, deleting = false;
  const type = () => {
    const word = roles[ri];
    el.textContent = deleting ? word.slice(0, --ci) : word.slice(0, ++ci);
    if (!deleting && ci === word.length) { deleting = true; setTimeout(type, 1800); return; }
    if (deleting && ci === 0)  { deleting = false; ri = (ri + 1) % roles.length; }
    setTimeout(type, deleting ? 48 : 88);
  };
  type();
})();


/* ═══════════════════════════════
   STAT COUNTERS
═══════════════════════════════ */
if (hasIntersectionObserver) {
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const targetValue = el.dataset.target;
      if (!targetValue) return;

      const end = parseFloat(targetValue);
      const dec = (targetValue.split(".")[1] || "").length;
      const sfx = el.dataset.suffix || "+";
      const dur = 1600;
      const start = performance.now();
      const tick = now => {
        const pct = Math.min((now - start) / dur, 1);
        const nextValue = pct === 1 ? end : Math.floor(pct * end * 10 ** dec) / 10 ** dec;
        el.textContent = nextValue.toFixed(dec) + (pct === 1 ? sfx : "");
        if (pct < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObs.unobserve(el);
    });
  }, { threshold: .5 });
  document.querySelectorAll(".stat-num").forEach(el => counterObs.observe(el));


  /* ═══════════════════════════════
     SKILL BAR ANIMATION
  ════════════════════════════════ */
  const skillObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fill = entry.target.querySelector(".skill-fill");
      if (fill && fill.dataset.w) fill.style.width = fill.dataset.w + "%";
      skillObs.unobserve(entry.target);
    });
  }, { threshold: .3 });
  document.querySelectorAll(".skill-bar").forEach(el => skillObs.observe(el));
}


/* ═══════════════════════════════
   SKILLS CATEGORY FILTER
═══════════════════════════════ */
document.querySelectorAll(".skill-cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".skill-cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const cat = btn.dataset.cat;

    document.querySelectorAll(".skill-bar").forEach(bar => {
      const show = cat === "all" || bar.dataset.cat === cat;
      bar.classList.toggle("hidden", !show);

      if (show) {
        const fill = bar.querySelector(".skill-fill");
        if (fill && fill.dataset.w && (fill.style.width === "0%" || fill.style.width === "")) {
          setTimeout(() => { fill.style.width = fill.dataset.w + "%"; }, 50);
        }
      }
    });
  });
});


/* ═══════════════════════════════
   REVEAL ON SCROLL
═══════════════════════════════ */
if (hasIntersectionObserver) {
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: .1 });
  document.querySelectorAll(".reveal-up,.reveal-left,.reveal-right").forEach(el => revealObs.observe(el));
}


/* ═══════════════════════════════
   PROJECT CARD TILT
═══════════════════════════════ */
document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("mousemove", e => {
    const r = card.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = ((e.clientX - r.left) / r.width - .5) * 8;
    const y = ((e.clientY - r.top) / r.height - .5) * -8;
    card.style.transform = `translateY(-5px) perspective(600px) rotateX(${y}deg) rotateY(${x}deg)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});


/* ═══════════════════════════════
   CONTACT FORM  (Netlify Forms, mailto fallback)
═══════════════════════════════ */
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = form.elements?.cName?.value?.trim?.() || "";
    const email = form.elements?.cEmail?.value?.trim?.() || "";
    const subject = form.elements?.cSubject?.value?.trim?.() || "";
    const message = form.elements?.cMessage?.value?.trim?.() || "";
    const status = document.getElementById("formStatus");
    const btn = document.getElementById("submitBtn");

    const show = (type, text) => { if (status) { status.className = "form-status " + type; status.textContent = text; } };
    if (status) status.className = "form-status";

    if (!name || !email || !subject || !message) return show("error", "Please fill in all fields.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return show("error", "Please enter a valid email address.");

    if (!canSubmitHttpForm()) {
      form.reset();
      return show("success", "Form submission is disabled when viewing this file locally. Please use the email link below.");
    }

    if (btn) btn.disabled = true;
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      form.reset();
      show("success", "Message sent. I'll get back to you soon.");
    } catch (err) {
      const body = `From: ${name} (${email})\n\n${message}`;
      window.location.href = `mailto:niteeshnkp03@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      show("success", "Opening your mail app…");
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}
