/* ============================================================
   Client behaviours — progressive enhancement over SSR markup.
   Header state · scroll progress · reveals · overlay menu ·
   back-to-top · showcase slider · lightbox · custom select · form
   ============================================================ */
type Item = { num: string; title: string; cat: string; fit: string; full: string };

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = <T extends Element = Element>(s: string, r: ParentNode = document) =>
  r.querySelector<T>(s);
const $$ = <T extends Element = Element>(s: string, r: ParentNode = document) =>
  Array.from(r.querySelectorAll<T>(s));

/* ---------- Header scrolled + scroll progress ---------- */
(() => {
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
  window.addEventListener(
    "scroll",
    () => { if (!tick) { requestAnimationFrame(run); tick = true; } },
    { passive: true }
  );
  run();
})();

/* ---------- Reveal on scroll ---------- */
(() => {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window) || reduce) {
    els.forEach((e) => e.classList.add("in-view"));
    return;
  }
  const io = new IntersectionObserver(
    (ents, obs) => {
      ents.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in-view");
          obs.unobserve(en.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  els.forEach((e) => io.observe(e));
})();

/* ---------- Overlay menu ---------- */
(() => {
  const menu = document.getElementById("overlayMenu");
  const openBtn = $<HTMLButtonElement>("[data-menu-open]");
  const closeBtn = $<HTMLButtonElement>("[data-menu-close]");
  if (!menu || !openBtn) return;
  const open = () => {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    openBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
  };
  const close = () => {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    openBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };
  openBtn.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  $$("[data-menu-link]", menu).forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) close();
  });
})();

/* ---------- Back to top ---------- */
(() => {
  const btn = $<HTMLButtonElement>("[data-to-top]");
  if (!btn) return;
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
  window.addEventListener(
    "scroll",
    () => { if (!tick) { requestAnimationFrame(run); tick = true; } },
    { passive: true }
  );
  btn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
  );
  run();
})();

/* ---------- Lightbox ---------- */
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
  LB.el.classList.add("is-open");
  LB.el.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}
function lbClose() {
  if (!LB.el) return;
  LB.el.classList.remove("is-open");
  LB.el.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}
(() => {
  if (!LB.el) return;
  $$("[data-lb-close]").forEach((b) => b.addEventListener("click", lbClose));
  $("[data-lb-prev]")?.addEventListener("click", () => lbShow(LB.index - 1));
  $("[data-lb-next]")?.addEventListener("click", () => lbShow(LB.index + 1));
  LB.el.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target === LB.el || target.classList.contains("lightbox__stage")) lbClose();
  });
  document.addEventListener("keydown", (e) => {
    if (!LB.el!.classList.contains("is-open")) return;
    if (e.key === "Escape") lbClose();
    else if (e.key === "ArrowLeft") lbShow(LB.index - 1);
    else if (e.key === "ArrowRight") lbShow(LB.index + 1);
  });
  let tsx = 0, tsy = 0;
  LB.el.addEventListener("touchstart", (e) => {
    tsx = e.changedTouches[0].clientX; tsy = e.changedTouches[0].clientY;
  }, { passive: true });
  LB.el.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - tsx;
    const dy = e.changedTouches[0].clientY - tsy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) lbShow(LB.index + 1); else lbShow(LB.index - 1);
    }
  }, { passive: true });
})();

/* ---------- Showcase slider ---------- */
(() => {
  const grid = document.getElementById("projectsGrid");
  const dataEl = $("[data-showcase]");
  if (!grid || !dataEl) return;
  let items: Item[] = [];
  try { items = JSON.parse(dataEl.textContent || "[]"); } catch { return; }
  if (!items.length) return;

  LB.items = items.map((i) => ({ src: i.full, title: i.title, cat: i.cat }));
  if (LB.tot) LB.tot.textContent = String(items.length).padStart(2, "0");

  const track = $<HTMLElement>("[data-track]", grid);
  const thumbs = $$("[data-thumb]", grid);
  const stage = $<HTMLElement>("[data-stage]", grid);
  const elNum = $("[data-num]", grid);
  const elTitle = $("[data-title]", grid);
  const elCat = $("[data-cat]", grid);
  const elCur = $("[data-cur]", grid);
  const prog = $<HTMLElement>("[data-progress]", grid);
  const INTERVAL = 4000;
  let idx = 0, timer: number | undefined, inView = false, hovering = false;

  function runProgress() {
    if (!prog) return;
    prog.classList.remove("run");
    void prog.offsetWidth;
    if (!reduce && inView && !hovering) {
      prog.style.setProperty("--sc-int", INTERVAL + "ms");
      prog.classList.add("run");
    }
  }
  function go(i: number) {
    idx = (i + items.length) % items.length;
    if (track) track.style.transform = `translateX(${-idx * 100}%)`;
    thumbs.forEach((t, k) => {
      t.classList.toggle("is-active", k === idx);
      t.setAttribute("aria-current", k === idx ? "true" : "false");
    });
    const at = thumbs[idx] as HTMLElement | undefined;
    if (at && at.parentElement) {
      const rail = at.parentElement;
      const target = at.offsetLeft - (rail.clientWidth - at.clientWidth) / 2;
      rail.scrollTo({ left: Math.max(0, target), behavior: reduce ? "auto" : "smooth" });
    }
    const it = items[idx];
    if (elNum) elNum.textContent = it.num;
    if (elTitle) elTitle.textContent = it.title;
    if (elCat) elCat.textContent = it.cat;
    if (elCur) elCur.textContent = String(idx + 1).padStart(2, "0");
    runProgress();
  }
  function schedule() {
    window.clearTimeout(timer);
    if (reduce || !inView || hovering) return;
    timer = window.setTimeout(() => { go(idx + 1); schedule(); }, INTERVAL);
  }
  const next = () => { go(idx + 1); schedule(); };
  const prev = () => { go(idx - 1); schedule(); };

  $("[data-prev]", grid)?.addEventListener("click", (e) => { e.stopPropagation(); prev(); });
  $("[data-next]", grid)?.addEventListener("click", (e) => { e.stopPropagation(); next(); });
  thumbs.forEach((t, k) => t.addEventListener("click", () => { go(k); schedule(); }));
  stage?.addEventListener("click", () => lbOpen(idx));
  stage?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); lbOpen(idx); }
  });
  grid.addEventListener("mouseenter", () => { hovering = true; window.clearTimeout(timer); runProgress(); });
  grid.addEventListener("mouseleave", () => { hovering = false; schedule(); runProgress(); });
  grid.addEventListener("focusin", () => { hovering = true; window.clearTimeout(timer); });
  grid.addEventListener("focusout", () => { hovering = false; schedule(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        inView = en.isIntersecting;
        if (inView) schedule(); else window.clearTimeout(timer);
        runProgress();
      });
    }, { threshold: 0.25 }).observe(grid);
  } else { inView = true; schedule(); }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) window.clearTimeout(timer); else schedule();
  });
  go(0);
})();

/* ---------- Custom select ---------- */
(() => {
  const wrap = $<HTMLElement>("[data-select]");
  if (!wrap) return;
  const trigger = $<HTMLButtonElement>(".select__trigger", wrap)!;
  const valueEl = $<HTMLElement>(".select__value", wrap)!;
  const panel = $<HTMLUListElement>(".select__panel", wrap)!;
  const native = $<HTMLSelectElement>("select", wrap)!;
  const opts = Array.from(native.options);
  let activeIdx = -1;

  opts.forEach((o, i) => {
    if (i === 0) return; // placeholder
    const li = document.createElement("li");
    li.className = "select__option";
    li.setAttribute("role", "option");
    li.dataset.value = o.value;
    li.innerHTML = `<span class="select__num">${String(i).padStart(2, "0")}</span><span class="select__label">${o.textContent}</span><span class="select__check" aria-hidden="true"></span>`;
    li.addEventListener("click", () => pick(i));
    panel.appendChild(li);
  });
  const lis = $$<HTMLLIElement>(".select__option", panel);

  function openP() {
    wrap!.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    document.addEventListener("click", outside);
  }
  function closeP() {
    wrap!.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    document.removeEventListener("click", outside);
  }
  function outside(e: MouseEvent) {
    if (!wrap!.contains(e.target as Node)) closeP();
  }
  function pick(i: number) {
    native.selectedIndex = i;
    native.dispatchEvent(new Event("change", { bubbles: true }));
    valueEl.textContent = opts[i].textContent;
    valueEl.classList.remove("is-placeholder");
    lis.forEach((li, k) => li.classList.toggle("is-selected", k === i - 1));
    activeIdx = i;
    wrap!.closest(".field")?.classList.remove("has-error");
    closeP();
    trigger.focus();
  }
  trigger.addEventListener("click", () =>
    wrap.classList.contains("is-open") ? closeP() : openP()
  );
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!wrap.classList.contains("is-open")) openP();
      else if (activeIdx > 0) pick(Math.min(opts.length - 1, activeIdx + 1));
      else pick(1);
    } else if (e.key === "Escape") closeP();
  });
})();

/* ---------- Contact form → WhatsApp ---------- */
(() => {
  const form = document.getElementById("contactForm") as HTMLFormElement | null;
  if (!form) return;
  const success = document.getElementById("formSuccess");
  const spinner = $<HTMLElement>(".form__spinner", form);
  const msgs = {
    name: form.dataset.errName || "",
    type: form.dataset.errType || "",
    msg: form.dataset.errMsg || "",
  };
  const WA = "4917622844303";

  function setErr(field: HTMLElement, text: string) {
    field.classList.add("has-error");
    const e = $(".field__err", field);
    if (e) e.textContent = text;
  }
  function clearErr(field: HTMLElement) {
    field.classList.remove("has-error");
    const e = $(".field__err", field);
    if (e) e.textContent = "";
  }
  $$(".field input, .field textarea", form).forEach((el) =>
    el.addEventListener("input", () => clearErr(el.closest(".field") as HTMLElement))
  );

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
      `Projektart: ${typeLabel}`,
      "",
      message.value.trim(),
    ].filter(Boolean);
    const url = `https://wa.me/${WA}?text=${encodeURIComponent(lines.join("\n"))}`;

    if (spinner) spinner.classList.add("is-active");
    window.setTimeout(() => {
      window.open(url, "_blank", "noopener");
      if (spinner) spinner.classList.remove("is-active");
      form.hidden = true;
      if (success) success.hidden = false;
    }, 500);
  });

  $("[data-form-again]")?.addEventListener("click", () => {
    form.reset();
    const val = $<HTMLElement>(".select__value", form);
    if (val) { val.textContent = val.dataset.placeholder || "—"; val.classList.add("is-placeholder"); }
    $$(".select__option", form).forEach((o) => o.classList.remove("is-selected"));
    if (success) success.hidden = true;
    form.hidden = false;
  });
})();
