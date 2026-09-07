/* ============================================================
   Animations — scroll reveals, project in-view, custom cursor, lightbox
   ============================================================ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll(".reveal, .pj, .line-grow");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ---- Services accordion ---- */
  document.querySelectorAll(".svc").forEach((svc) => {
    const head = svc.querySelector(".svc__head");
    head.addEventListener("click", () => {
      const isOpen = svc.classList.contains("is-open");
      document.querySelectorAll(".svc.is-open").forEach((o) => {
        if (o !== svc) { o.classList.remove("is-open"); o.querySelector(".svc__head").setAttribute("aria-expanded", "false"); }
      });
      svc.classList.toggle("is-open", !isOpen);
      head.setAttribute("aria-expanded", String(!isOpen));
    });
    head.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); head.click(); }
    });
  });

  /* ---- Custom cursor (desktop / fine pointer only) ---- */
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine && !prefersReduced) {
    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    dot.style.opacity = "0";
    ring.style.opacity = "0";
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let cursorShown = false;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (!cursorShown) { cursorShown = true; dot.style.opacity = "1"; ring.style.opacity = "1"; }
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();

    const hoverSel = "a, button, .pj, .svc__head, .menu-btn, [data-cursor]";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverSel)) ring.classList.add("is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverSel)) ring.classList.remove("is-hover");
    });
    document.addEventListener("mouseleave", () => { dot.style.opacity = "0"; ring.style.opacity = "0"; });
    document.addEventListener("mouseenter", () => { dot.style.opacity = "1"; ring.style.opacity = "1"; });
  }

  /* ---- Lightbox ---- */
  const LB = {
    el: document.getElementById("lightbox"),
    img: document.querySelector(".lightbox__img"),
    title: document.querySelector("[data-lb-title]"),
    cat: document.querySelector("[data-lb-cat]"),
    current: document.querySelector("[data-lb-current]"),
    total: document.querySelector("[data-lb-total]"),
    index: 0,
    items: []
  };

  function collectItems() {
    LB.items = Array.from(document.querySelectorAll(".pj")).map((pj) => ({
      src: pj.getAttribute("data-full"),
      title: pj.getAttribute("data-title"),
      cat: pj.getAttribute("data-cat")
    }));
    if (LB.total) LB.total.textContent = String(LB.items.length).padStart(2, "0");
  }

  function show(i) {
    if (!LB.items.length) return;
    LB.index = (i + LB.items.length) % LB.items.length;
    const item = LB.items[LB.index];
    LB.img.classList.remove("loaded");
    const pre = new Image();
    pre.onload = () => { LB.img.src = item.src; LB.img.classList.add("loaded"); };
    pre.src = item.src;
    // fallback if cached
    LB.img.src = item.src;
    requestAnimationFrame(() => LB.img.classList.add("loaded"));
    if (LB.title) LB.title.textContent = item.title || "";
    if (LB.cat) LB.cat.textContent = item.cat || "";
    if (LB.current) LB.current.textContent = String(LB.index + 1).padStart(2, "0");
  }

  function openLB(i) {
    collectItems();
    show(i);
    LB.el.classList.add("is-open");
    LB.el.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }
  function closeLB() {
    LB.el.classList.remove("is-open");
    LB.el.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  // Bind project clicks
  document.addEventListener("click", (e) => {
    const pj = e.target.closest(".pj");
    if (pj) {
      const all = Array.from(document.querySelectorAll(".pj"));
      openLB(all.indexOf(pj));
    }
  });
  // keyboard open on project
  document.querySelectorAll(".pj").forEach((pj) => {
    pj.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const all = Array.from(document.querySelectorAll(".pj"));
        openLB(all.indexOf(pj));
      }
    });
  });

  document.querySelectorAll("[data-lb-close]").forEach((b) => b.addEventListener("click", closeLB));
  document.querySelector("[data-lb-prev]").addEventListener("click", () => show(LB.index - 1));
  document.querySelector("[data-lb-next]").addEventListener("click", () => show(LB.index + 1));
  LB.el.addEventListener("click", (e) => { if (e.target === LB.el || e.target.classList.contains("lightbox__stage")) closeLB(); });

  document.addEventListener("keydown", (e) => {
    if (!LB.el.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLB();
    else if (e.key === "ArrowLeft") show(LB.index - 1);
    else if (e.key === "ArrowRight") show(LB.index + 1);
  });

  // Touch swipe
  let tsx = 0, tsy = 0;
  LB.el.addEventListener("touchstart", (e) => { tsx = e.changedTouches[0].clientX; tsy = e.changedTouches[0].clientY; }, { passive: true });
  LB.el.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - tsx;
    const dy = e.changedTouches[0].clientY - tsy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) show(LB.index + 1); else show(LB.index - 1);
    }
  }, { passive: true });

  window.__openLightbox = openLB;
})();
