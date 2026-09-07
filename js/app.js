/* ============================================================
   App — i18n engine, project rendering, contact form, PWA
   ============================================================ */
(function () {
  "use strict";

  const LS_KEY = "ek-lang";
  const t = window.translations;
  const langs = ["de", "en", "sq"];

  /* ---------- Language ---------- */
  // German is the intentional default. Only a saved preference overrides it,
  // so every first visit opens in Deutsch regardless of browser locale.
  function initialLang() {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved && langs.includes(saved)) return saved;
    } catch (e) {}
    return "de";
  }
  let lang = initialLang();

  function tr(key) {
    return (t[lang] && t[lang][key]) || (t.de && t.de[key]) || key;
  }

  /* ---------- Render projects ---------- */
  const grid = document.getElementById("projectsGrid");
  function renderProjects() {
    if (!grid) return;
    grid.innerHTML = window.projects.map((p, i) => {
      const num = String(p.id).padStart(2, "0");
      const title = tr(p.titleKey);
      const cat = tr(p.catKey);
      return `
      <article class="pj ${p.span} ${p.fit === "contain" ? "pj--contain" : "pj--cover"}"
               tabindex="0" role="button"
               data-full="${p.image}"
               data-title="${title}" data-cat="${cat}"
               aria-label="${title} — ${cat}">
        <div class="pj__frame ${p.ratio}">
          <img src="${p.image}" alt="${title} — ${cat}" loading="lazy" decoding="async" />
          <span class="pj__reveal" aria-hidden="true"></span>
        </div>
        <div class="pj__meta">
          <div class="pj__meta-left">
            <span class="pj__num num">${num}</span>
            <span>
              <span class="pj__title">${title}</span>
              <span class="pj__cat" style="display:block;margin-top:3px">${cat}</span>
            </span>
          </div>
          <span class="pj__plus" aria-hidden="true"></span>
        </div>
      </article>`;
    }).join("");

    // Re-run reveal observer on new nodes
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in-view"); obs.unobserve(e.target); } });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
      grid.querySelectorAll(".pj").forEach((el) => io.observe(el));
    } else {
      grid.querySelectorAll(".pj").forEach((el) => el.classList.add("in-view"));
    }
  }

  /* ---------- Apply translations ---------- */
  function applyLang(next, save) {
    lang = next;
    document.documentElement.lang = lang;
    if (save) { try { localStorage.setItem(LS_KEY, lang); } catch (e) {} }

    // text nodes
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = tr(key);
      if (el.hasAttribute("data-i18n-html")) el.innerHTML = val;
      else el.textContent = val;
    });
    // attributes: data-i18n-attr="placeholder:form.name.ph|aria-label:..."
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.getAttribute("data-i18n-attr").split("|").forEach((pair) => {
        const [attr, key] = pair.split(":");
        if (attr && key) el.setAttribute(attr, tr(key));
      });
    });
    // document meta
    document.title = tr("meta.title");
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", tr("meta.desc"));
    const ogt = document.querySelector('meta[property="og:title"]');
    if (ogt) ogt.setAttribute("content", tr("meta.title"));
    const ogd = document.querySelector('meta[property="og:description"]');
    if (ogd) ogd.setAttribute("content", tr("meta.desc"));

    // active states on all lang toggles
    document.querySelectorAll("[data-lang]").forEach((b) => {
      b.classList.toggle("is-active", b.getAttribute("data-lang") === lang);
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });

    // re-render projects to localise titles/categories
    renderProjects();
  }

  // Bind language buttons
  document.querySelectorAll("[data-lang]").forEach((b) => {
    b.addEventListener("click", () => applyLang(b.getAttribute("data-lang"), true));
  });

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contactForm");
  if (form) {
    const fileInput = form.querySelector("#file");
    const fileText = form.querySelector("[data-file-text]");
    const defaultFileText = () => fileText && (fileText.dataset.default = tr("form.file.cta"));

    if (fileInput) {
      fileInput.addEventListener("change", () => {
        if (fileInput.files && fileInput.files.length) {
          fileText.innerHTML = "<b>" + fileInput.files[0].name + "</b>";
        } else {
          fileText.textContent = tr("form.file.cta");
        }
      });
    }

    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

    function setError(field, msgKey) {
      const wrap = field.closest(".field");
      if (!wrap) return;
      wrap.classList.add("has-error");
      const err = wrap.querySelector(".field__err");
      if (err) err.textContent = tr(msgKey);
    }
    function clearError(field) {
      const wrap = field.closest(".field");
      if (wrap) wrap.classList.remove("has-error");
    }

    form.querySelectorAll("input, textarea, select").forEach((f) => {
      f.addEventListener("input", () => clearError(f));
      f.addEventListener("change", () => clearError(f));
    });

    var WA_NUMBER = "4917622844303"; // +49 176 22844303

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      const name = form.querySelector("#name");
      const phone = form.querySelector("#phone");
      const type = form.querySelector("#ptype");
      const msg = form.querySelector("#message");

      if (!name.value.trim()) { setError(name, "form.err.name"); ok = false; }
      if (!type.value) { setError(type, "form.err.type"); ok = false; }
      if (!msg.value.trim()) { setError(msg, "form.err.msg"); ok = false; }

      if (!ok) {
        const firstErr = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (firstErr) firstErr.focus();
        return;
      }

      // Compose the request and hand it off to WhatsApp (no email involved)
      const typeLabel = type.options[type.selectedIndex] ? type.options[type.selectedIndex].text : type.value;
      const lines = [
        "Projektanfrage — Endrit Krasniqi",
        "Name: " + name.value.trim(),
        phone.value.trim() ? "Telefon: " + phone.value.trim() : null,
        "Projektart: " + typeLabel,
        "Nachricht: " + msg.value.trim()
      ].filter(Boolean);
      const waUrl = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));

      const btn = form.querySelector("[type='submit']");
      form.classList.add("is-loading");
      btn.disabled = true;
      setTimeout(() => {
        form.classList.remove("is-loading");
        btn.disabled = false;
        window.open(waUrl, "_blank", "noopener");
        form.hidden = true;
        const success = document.getElementById("formSuccess");
        if (success) { success.classList.add("show"); success.hidden = false; }
      }, 650);
    });

    // reset / send another
    const again = document.querySelector("[data-form-again]");
    if (again) {
      again.addEventListener("click", () => {
        form.reset();
        if (fileText) fileText.textContent = tr("form.file.cta");
        form.hidden = false;
        const success = document.getElementById("formSuccess");
        if (success) { success.classList.remove("show"); success.hidden = true; }
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    // drag & drop file
    const fileField = form.querySelector(".file-field");
    if (fileField && fileInput) {
      ["dragover", "dragenter"].forEach((ev) =>
        fileField.addEventListener(ev, (e) => { e.preventDefault(); fileField.style.borderColor = "var(--sand)"; })
      );
      ["dragleave", "drop"].forEach((ev) =>
        fileField.addEventListener(ev, (e) => { e.preventDefault(); fileField.style.borderColor = ""; })
      );
      fileField.addEventListener("drop", (e) => {
        if (e.dataTransfer.files.length) {
          fileInput.files = e.dataTransfer.files;
          fileInput.dispatchEvent(new Event("change"));
        }
      });
    }
  }

  /* ---------- Init ---------- */
  applyLang(lang, false);

  // reveal hero grid lines after load
  window.addEventListener("load", () => document.body.classList.add("is-loaded"));

  /* ---------- PWA: service worker ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(function () { /* offline registration optional */ });
    });
  }

  /* ---------- Footer year ---------- */
  const yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
