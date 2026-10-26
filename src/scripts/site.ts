/* ============================================================
   Client behaviours — re-initialised on every view transition.
   Header · progress · reveals · menu · back-to-top · showcase ·
   lightbox · custom select · form · scroll-spy
   ============================================================ */
type Item = { num: string; title: string; cat: string; fit: string; full: string };

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = <T extends Element = Element>(s: string, r: ParentNode = document) =>
  r.querySelector<T>(s);
const $$ = <T extends Element = Element>(s: string, r: ParentNode = document) =>
  Array.from(r.querySelectorAll<T>(s));

let ac: AbortController | null = null;
let observers: IntersectionObserver[] = [];
let scTimer: number | undefined;

function boot() {
  if (ac) ac.abort();
  ac = new AbortController();
  const signal = ac.signal;
  observers.forEach((o) => o.disconnect());
  observers = [];
  window.clearTimeout(scTimer);

  /* ---- Header scrolled + scroll progress ---- */
  {
    const header = $(".header");
    const prog = $<HTMLElement>(".scroll-progress");
    let tick = false;
    const run = () => {
      const y = window.scrollY;
      if (header) header.classList.toggle("is-scrolled", y > 12);
      if (prog) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        prog.style.transform = `scaleX(${h > 0 ? Math.min(1, y / h) : 0})`;
      }
      tick = false;
    };
    window.addEventListener("scroll", () => { if (!tick) { requestAnimationFrame(run); tick = true; } }, { passive: true, signal });
    run();
  }

  /* ---- Reveal on scroll ---- */
  {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduce) {
      els.forEach((e) => e.classList.add("in-view"));
    } else {
      const io = new IntersectionObserver((ents, obs) => {
        ents.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("in-view"); obs.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
      els.forEach((e) => io.observe(e));
      observers.push(io);
    }
  }

  /* ---- Overlay menu ---- */
  {
    const menu = document.getElementById("overlayMenu");
    const openBtn = $<HTMLButtonElement>("[data-menu-open]");
    const closeBtn = $<HTMLButtonElement>("[data-menu-close]");
    if (menu && openBtn) {
      const open = () => {
        menu.classList.add("is-open"); menu.setAttribute("aria-hidden", "false");
        openBtn.setAttribute("aria-expanded", "true"); document.body.classList.add("menu-open");
      };
      const close = () => {
        menu.classList.remove("is-open"); menu.setAttribute("aria-hidden", "true");
        openBtn.setAttribute("aria-expanded", "false"); document.body.classList.remove("menu-open");
      };
      openBtn.addEventListener("click", open, { signal });
      closeBtn?.addEventListener("click", close, { signal });
      $$("[data-menu-link]", menu).forEach((a) => a.addEventListener("click", close, { signal }));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menu.classList.contains("is-open")) close();
      }, { signal });
    }
  }

  /* ---- Back to top ---- */
  {
    const btn = $<HTMLButtonElement>("[data-to-top]");
    if (btn) {
      const prog = $<SVGCircleElement>(".to-top__prog", btn);
      let len = 0;
      if (prog) { len = prog.getTotalLength(); prog.style.strokeDasharray = `${len}`; }
      let tick = false;
      const run = () => {
        const y = window.scrollY;
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const p = h > 0 ? Math.min(1, y / h) : 0;
        btn.classList.toggle("is-visible", y > window.innerHeight * 0.6);
        if (prog) prog.style.strokeDashoffset = `${len * (1 - p)}`;
        tick = false;
      };
      window.addEventListener("scroll", () => { if (!tick) { requestAnimationFrame(run); tick = true; } }, { passive: true, signal });
      btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }), { signal });
      run();
    }
  }

  /* ---- Lightbox ---- */
  const LB = {
    el: document.getElementById("lightbox"),
    img: $<HTMLImageElement>(".lightbox__img"),
    title: $("[data-lb-title]"),
    cat: $("[data-lb-cat]"),
    cur: $("[data-lb-current]"),
    tot: $("[data-lb-total]"),
    index: 0,
    items: [] as { src: string; title: string; cat: string }[],
  };
  function lbShow(i: number) {
    if (!LB.items.length || !LB.img) return;
    LB.index = (i + LB.items.length) % LB.items.length;
    const it = LB.items[LB.index];
    LB.img.classList.remove("loaded");
    const pre = new Image();
    pre.onload = () => { LB.img!.src = it.src; LB.img!.classList.add("loaded"); };
    pre.src = it.src;
    LB.img.src = it.src;
    requestAnimationFrame(() => LB.img!.classList.add("loaded"));
    if (LB.title) LB.title.textContent = it.title;
    if (LB.cat) LB.cat.textContent = it.cat;
    if (LB.cur) LB.cur.textContent = String(LB.index + 1).padStart(2, "0");
  }
  function lbOpen(i: number) {
    if (!LB.el) return;
    lbShow(i);
    LB.el.classList.add("is-open"); LB.el.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }
  function lbClose() {
    if (!LB.el) return;
    LB.el.classList.remove("is-open"); LB.el.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }
  if (LB.el) {
    $$("[data-lb-close]").forEach((b) => b.addEventListener("click", lbClose, { signal }));
    $("[data-lb-prev]")?.addEventListener("click", () => lbShow(LB.index - 1), { signal });
    $("[data-lb-next]")?.addEventListener("click", () => lbShow(LB.index + 1), { signal });
    LB.el.addEventListener("click", (e) => {
      const t = e.target as HTMLElement;
      if (t === LB.el || t.classList.contains("lightbox__stage")) lbClose();
    }, { signal });
    document.addEventListener("keydown", (e) => {
      if (!LB.el!.classList.contains("is-open")) return;
      if (e.key === "Escape") lbClose();
      else if (e.key === "ArrowLeft") lbShow(LB.index - 1);
      else if (e.key === "ArrowRight") lbShow(LB.index + 1);
    }, { signal });
    let tsx = 0, tsy = 0;
    LB.el.addEventListener("touchstart", (e) => { tsx = e.changedTouches[0].clientX; tsy = e.changedTouches[0].clientY; }, { passive: true, signal });
    LB.el.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - tsx;
      const dy = e.changedTouches[0].clientY - tsy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { if (dx < 0) lbShow(LB.index + 1); else lbShow(LB.index - 1); }
    }, { passive: true, signal });
  }

  /* ---- Showcase (elegant curtain reveal) ---- */
  {
    const grid = document.getElementById("projectsGrid");
    const dataEl = $("[data-showcase]");
    if (grid && dataEl) {
      let items: Item[] = [];
      try { items = JSON.parse(dataEl.textContent || "[]"); } catch { items = []; }
      if (items.length) {
        LB.items = items.map((i) => ({ src: i.full, title: i.title, cat: i.cat }));
        if (LB.tot) LB.tot.textContent = String(items.length).padStart(2, "0");

        const slides = $$<HTMLElement>(".showcase__slide", grid);
        const thumbs = $$("[data-thumb]", grid);
        const stage = $<HTMLElement>("[data-stage]", grid);
        const elNum = $("[data-num]", grid);
        const elTitle = $("[data-title]", grid);
        const elCat = $("[data-cat]", grid);
        const elCur = $("[data-cur]", grid);
        const prog = $<HTMLElement>("[data-progress]", grid);
        const INTERVAL = 5200;
        let idx = 0, inView = false, hovering = false;

        const runProgress = () => {
          if (!prog) return;
          prog.classList.remove("run");
          void prog.offsetWidth;
          if (!reduce && inView && !hovering) { prog.style.setProperty("--sc-int", INTERVAL + "ms"); prog.classList.add("run"); }
        };
        const swap = (el: Element | null) => {
          if (!el) return;
          el.classList.remove("is-swap"); void (el as HTMLElement).offsetWidth; el.classList.add("is-swap");
        };
        const go = (i: number) => {
          idx = (i + items.length) % items.length;
          slides.forEach((s, k) => s.classList.toggle("is-active", k === idx));
          thumbs.forEach((t, k) => { t.classList.toggle("is-active", k === idx); t.setAttribute("aria-current", k === idx ? "true" : "false"); });
          const at = thumbs[idx] as HTMLElement | undefined;
          if (at && at.parentElement) {
            const rail = at.parentElement;
            rail.scrollTo({ left: Math.max(0, at.offsetLeft - (rail.clientWidth - at.clientWidth) / 2), behavior: reduce ? "auto" : "smooth" });
          }
          const it = items[idx];
          if (elNum) elNum.textContent = it.num;
          if (elTitle) elTitle.textContent = it.title;
          if (elCat) elCat.textContent = it.cat;
          if (elCur) elCur.textContent = String(idx + 1).padStart(2, "0");
          if (!reduce) { swap(elTitle); swap(elCat); swap(elNum); }
          runProgress();
        };
        const schedule = () => {
          window.clearTimeout(scTimer);
          if (reduce || !inView || hovering) return;
          scTimer = window.setTimeout(() => { go(idx + 1); schedule(); }, INTERVAL);
        };
        const next = () => { go(idx + 1); schedule(); };
        const prev = () => { go(idx - 1); schedule(); };

        $("[data-prev]", grid)?.addEventListener("click", (e) => { e.stopPropagation(); prev(); }, { signal });
        $("[data-next]", grid)?.addEventListener("click", (e) => { e.stopPropagation(); next(); }, { signal });
        thumbs.forEach((t, k) => t.addEventListener("click", () => { go(k); schedule(); }, { signal }));
        stage?.addEventListener("click", () => lbOpen(idx), { signal });
        stage?.addEventListener("keydown", (e) => {
          if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
          else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
          else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); lbOpen(idx); }
        }, { signal });
        grid.addEventListener("mouseenter", () => { hovering = true; window.clearTimeout(scTimer); runProgress(); }, { signal });
        grid.addEventListener("mouseleave", () => { hovering = false; schedule(); runProgress(); }, { signal });
        grid.addEventListener("focusin", () => { hovering = true; window.clearTimeout(scTimer); }, { signal });
        grid.addEventListener("focusout", () => { hovering = false; schedule(); }, { signal });
        if ("IntersectionObserver" in window) {
          const io = new IntersectionObserver((ents) => {
            ents.forEach((en) => { inView = en.isIntersecting; if (inView) schedule(); else window.clearTimeout(scTimer); runProgress(); });
          }, { threshold: 0.25 });
          io.observe(grid); observers.push(io);
        } else { inView = true; schedule(); }
        document.addEventListener("visibilitychange", () => { if (document.hidden) window.clearTimeout(scTimer); else schedule(); }, { signal });
        go(0);
      }
    }
  }

  /* ---- Custom select ---- */
  {
    const wrap = $<HTMLElement>("[data-select]");
    if (wrap) {
      const trigger = $<HTMLButtonElement>(".select__trigger", wrap)!;
      const valueEl = $<HTMLElement>(".select__value", wrap)!;
      const panel = $<HTMLUListElement>(".select__panel", wrap)!;
      const native = $<HTMLSelectElement>("select", wrap)!;
      const opts = Array.from(native.options);
      panel.innerHTML = "";
      opts.forEach((o, i) => {
        if (i === 0) return;
        const li = document.createElement("li");
        li.className = "select__option";
        li.setAttribute("role", "option");
        li.dataset.value = o.value;
        li.innerHTML = `<span class="select__num">${String(i).padStart(2, "0")}</span><span class="select__label">${o.textContent}</span><span class="select__check" aria-hidden="true"></span>`;
        li.addEventListener("click", () => pick(i), { signal });
        panel.appendChild(li);
      });
      const lis = $$<HTMLLIElement>(".select__option", panel);
      const openP = () => { wrap.classList.add("is-open"); trigger.setAttribute("aria-expanded", "true"); };
      const closeP = () => { wrap.classList.remove("is-open"); trigger.setAttribute("aria-expanded", "false"); };
      function pick(i: number) {
        native.selectedIndex = i;
        native.dispatchEvent(new Event("change", { bubbles: true }));
        valueEl.textContent = opts[i].textContent;
        valueEl.classList.remove("is-placeholder");
        lis.forEach((li, k) => li.classList.toggle("is-selected", k === i - 1));
        wrap.closest(".field")?.classList.remove("has-error");
        closeP(); trigger.focus();
      }
      trigger.addEventListener("click", () => (wrap.classList.contains("is-open") ? closeP() : openP()), { signal });
      document.addEventListener("click", (e) => { if (!wrap.contains(e.target as Node)) closeP(); }, { signal });
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") { e.preventDefault(); openP(); }
        else if (e.key === "Escape") closeP();
      }, { signal });
    }
  }

  /* ---- Contact form → WhatsApp ---- */
  {
    const form = document.getElementById("contactForm") as HTMLFormElement | null;
    if (form) {
      const success = document.getElementById("formSuccess");
      const spinner = $<HTMLElement>(".form__spinner", form);
      const msgs = { name: form.dataset.errName || "", type: form.dataset.errType || "", msg: form.dataset.errMsg || "" };
      const WA = "4917622844303";
      const setErr = (field: HTMLElement, text: string) => { field.classList.add("has-error"); const e = $(".field__err", field); if (e) e.textContent = text; };
      const clearErr = (field: HTMLElement) => { field.classList.remove("has-error"); const e = $(".field__err", field); if (e) e.textContent = ""; };
      $$(".field input, .field textarea", form).forEach((el) =>
        el.addEventListener("input", () => clearErr(el.closest(".field") as HTMLElement), { signal }));
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = form.querySelector<HTMLInputElement>("#name")!;
        const phone = form.querySelector<HTMLInputElement>("#phone")!;
        const ptype = form.querySelector<HTMLSelectElement>("#ptype")!;
        const message = form.querySelector<HTMLTextAreaElement>("#message")!;
        let ok = true;
        if (!name.value.trim()) { setErr(name.closest(".field") as HTMLElement, msgs.name); ok = false; }
        if (!ptype.value) { setErr(ptype.closest(".field") as HTMLElement, msgs.type); ok = false; }
        if (!message.value.trim()) { setErr(message.closest(".field") as HTMLElement, msgs.msg); ok = false; }
        if (!ok) { ($(".has-error input, .has-error textarea", form) as HTMLElement | null)?.focus(); return; }
        const typeLabel = ptype.options[ptype.selectedIndex].textContent || ptype.value;
        const lines = [
          `Name: ${name.value.trim()}`,
          phone.value.trim() ? `Telefon: ${phone.value.trim()}` : "",
          `Projektart: ${typeLabel}`, "", message.value.trim(),
        ].filter(Boolean);
        const url = `https://wa.me/${WA}?text=${encodeURIComponent(lines.join("\n"))}`;
        if (spinner) spinner.classList.add("is-active");
        window.setTimeout(() => {
          window.open(url, "_blank", "noopener");
          if (spinner) spinner.classList.remove("is-active");
          form.hidden = true; if (success) success.hidden = false;
        }, 500);
      }, { signal });
      $("[data-form-again]")?.addEventListener("click", () => {
        form.reset();
        const val = $<HTMLElement>(".select__value", form);
        if (val) { val.textContent = val.dataset.placeholder || "—"; val.classList.add("is-placeholder"); }
        $$(".select__option", form).forEach((o) => o.classList.remove("is-selected"));
        if (success) success.hidden = true; form.hidden = false;
      }, { signal });
    }
  }

  /* ---- Scroll-spy for the desktop nav ---- */
  {
    const links = $$<HTMLAnchorElement>(".nav-desktop a[href^='#']");
    if (links.length && "IntersectionObserver" in window) {
      const map = new Map<string, HTMLAnchorElement>();
      const sections: Element[] = [];
      links.forEach((a) => {
        const id = a.getAttribute("href")!.slice(1);
        const sec = document.getElementById(id);
        if (sec) { map.set(id, a); sections.push(sec); }
      });
      let current = "";
      const io = new IntersectionObserver((ents) => {
        ents.forEach((en) => {
          if (en.isIntersecting) {
            const id = (en.target as HTMLElement).id;
            if (id !== current) {
              current = id;
              links.forEach((l) => l.classList.remove("is-active"));
              map.get(id)?.classList.add("is-active");
            }
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      sections.forEach((s) => io.observe(s));
      observers.push(io);
    }
  }
}

document.addEventListener("astro:page-load", boot);
