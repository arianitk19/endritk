/* ============================================================
   Menu — fullscreen navigation, header behaviour, smooth anchors
   ============================================================ */
(function () {
  "use strict";

  const body = document.body;
  const header = document.querySelector(".header");
  const menu = document.getElementById("overlayMenu");
  const openBtns = document.querySelectorAll("[data-menu-open]");
  const closeBtns = document.querySelectorAll("[data-menu-close]");
  let lastFocused = null;

  function openMenu() {
    lastFocused = document.activeElement;
    menu.classList.add("is-open");
    body.classList.add("menu-open");
    menu.setAttribute("aria-hidden", "false");
    const first = menu.querySelector("[data-menu-close]");
    if (first) setTimeout(() => first.focus(), 60);
  }
  function closeMenu() {
    menu.classList.remove("is-open");
    body.classList.remove("menu-open");
    menu.setAttribute("aria-hidden", "true");
    if (lastFocused) lastFocused.focus();
  }

  openBtns.forEach((b) => b.addEventListener("click", openMenu));
  closeBtns.forEach((b) => b.addEventListener("click", closeMenu));

  // Close on nav item click inside overlay
  menu.querySelectorAll("a[href^='#']").forEach((a) => {
    a.addEventListener("click", () => setTimeout(closeMenu, 120));
  });

  // ESC closes menu
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) closeMenu();
  });

  // Focus trap
  menu.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || !menu.classList.contains("is-open")) return;
    const focusables = menu.querySelectorAll(
      "a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  // Header scroll state + top progress + back-to-top
  const progress = document.querySelector(".scroll-progress");
  const toTop = document.querySelector("[data-to-top]");
  const toTopProg = document.querySelector(".to-top__prog");
  const RING = 207.35; // 2π·33
  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    header.classList.toggle("is-scrolled", y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? Math.min(y / h, 1) : 0;
    if (progress) progress.style.transform = "scaleX(" + p.toFixed(4) + ")";
    if (toTop) {
      toTop.classList.toggle("is-visible", y > window.innerHeight * 0.6);
      if (toTopProg) toTopProg.style.strokeDashoffset = (RING * (1 - p)).toFixed(2);
    }
  }

  // Back-to-top: smooth scroll + magnetic hover
  if (toTop) {
    toTop.addEventListener("click", () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const strength = 0.32;
      toTop.addEventListener("mousemove", (e) => {
        const r = toTop.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        toTop.style.transform = "translate(" + (mx * strength).toFixed(1) + "px," + (my * strength).toFixed(1) + "px)";
      });
      toTop.addEventListener("mouseleave", () => { toTop.style.transform = ""; });
    }
  }
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  // Active section highlight in desktop nav
  const navLinks = Array.from(document.querySelectorAll(".nav-desktop a[href^='#']"));
  const sections = navLinks
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = "#" + entry.target.id;
          navLinks.forEach((l) =>
            l.classList.toggle("is-active", l.getAttribute("href") === id)
          );
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach((s) => spy.observe(s));
  }
})();
