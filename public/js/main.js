(() => {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------- mobile nav ---------------- */
  const navToggle = document.getElementById("navToggle");
  const navMobile = document.getElementById("navMobile");
  navToggle.addEventListener("click", () => {
    const open = navMobile.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navMobile.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navMobile.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------------- constellation starfield ---------------- */
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let stars = [];
  let width, height, dpr;
  const LINK_DIST = 130;
  const mouse = { x: null, y: null };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
  }

  function seedStars() {
    const density = Math.max(40, Math.floor((width * height) / 14000));
    stars = Array.from({ length: density }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.3 + 0.4,
      vx: (Math.random() - 0.5) * 0.06,
      vy: (Math.random() - 0.5) * 0.06,
      twinklePhase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, width, height);

    // update + draw stars
    for (const s of stars) {
      if (!prefersReducedMotion) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;
      }
      const twinkle = 0.55 + 0.45 * Math.sin(t / 900 + s.twinklePhase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(233,235,242,${0.35 + twinkle * 0.5})`;
      ctx.fill();
    }

    // links between nearby stars (network / constellation motif)
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const a = stars[i], b = stars[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(108,134,224,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      // link toward pointer for a subtle live-navigation feel
      if (mouse.x !== null) {
        const dx = stars[i].x - mouse.x, dy = stars[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST * 1.4) {
          const alpha = (1 - dist / (LINK_DIST * 1.4)) * 0.35;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(201,162,39,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener("pointerleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  resize();
  requestAnimationFrame(draw);

  /* ---------------- scroll reveal ---------------- */
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealTargets = document.querySelectorAll(
      ".cap-card, .work-card, .path__step, .about__grid, .section-title"
    );
    revealTargets.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach((el) => io.observe(el));
  }

  /* ---------------- contact form ---------------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    status.textContent = "";
    status.removeAttribute("data-state");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await res.json();

      if (res.ok && payload.ok) {
        status.textContent = payload.message || "Message received.";
        status.setAttribute("data-state", "ok");
        form.reset();
      } else {
        status.textContent = payload.error || "Something went wrong. Please try again.";
        status.setAttribute("data-state", "error");
      }
    } catch (err) {
      // Static preview (no Node server running) falls back to a mailto link
      status.innerHTML =
        'Could not reach the server. You can email us directly at <a href="mailto:hello@astera.cg">hello@astera.cg</a>.';
      status.setAttribute("data-state", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";
    }
  });
})();
