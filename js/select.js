/* ============================================================
   Custom Select — advanced, accessible dropdown that drives a
   hidden native <select> (keeps form value + validation intact).
   Localised: rebuilds from the native options after each language
   switch via window.__syncSelects().
   ============================================================ */
(function () {
  "use strict";

  const instances = [];

  function build(root) {
    const native = root.querySelector("select");
    const trigger = root.querySelector(".select__trigger");
    const valEl = root.querySelector(".select__value");
    const panel = root.querySelector(".select__panel");
    if (!native || !trigger || !valEl || !panel) return;

    function syncLabel() {
      const cur = native.options[native.selectedIndex];
      if (cur && cur.value !== "") {
        valEl.textContent = cur.textContent;
        valEl.classList.remove("is-placeholder");
      } else {
        const ph = native.querySelector('option[value=""]');
        valEl.textContent = ph ? ph.textContent : "";
        valEl.classList.add("is-placeholder");
      }
    }

    function render() {
      panel.innerHTML = "";
      Array.from(native.options).forEach((opt, i) => {
        if (opt.value === "") return; // placeholder is not a row
        const li = document.createElement("li");
        li.className = "select__option";
        li.setAttribute("role", "option");
        li.dataset.value = opt.value;
        const selected = opt.selected && opt.value !== "";
        li.setAttribute("aria-selected", String(selected));
        if (selected) li.classList.add("is-selected");
        li.innerHTML =
          '<span class="select__num num">' + String(i).padStart(2, "0") + "</span>" +
          '<span class="select__label">' + opt.textContent + "</span>" +
          '<span class="select__check" aria-hidden="true"></span>';
        li.addEventListener("click", () => choose(opt.value));
        li.addEventListener("mousemove", () => setActive(li));
        panel.appendChild(li);
      });
      syncLabel();
    }

    function items() { return Array.from(panel.querySelectorAll(".select__option")); }
    function activeItem() { return panel.querySelector(".select__option.is-active"); }
    function setActive(li) {
      items().forEach((i) => i.classList.remove("is-active"));
      if (li) { li.classList.add("is-active"); li.scrollIntoView({ block: "nearest" }); }
    }

    function open() {
      if (root.classList.contains("is-open")) return;
      root.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      setActive(panel.querySelector(".is-selected") || items()[0]);
      document.addEventListener("click", onOutside, true);
    }
    function close() {
      if (!root.classList.contains("is-open")) return;
      root.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      items().forEach((i) => i.classList.remove("is-active"));
      document.removeEventListener("click", onOutside, true);
    }
    function toggle() { root.classList.contains("is-open") ? close() : open(); }
    function onOutside(e) { if (!root.contains(e.target)) close(); }

    function choose(v) {
      native.value = v;
      native.dispatchEvent(new Event("change", { bubbles: true }));
      render();
      close();
      trigger.focus();
    }

    function move(dir) {
      const list = items();
      if (!list.length) return;
      let idx = list.indexOf(activeItem());
      idx = idx < 0 ? (dir > 0 ? 0 : list.length - 1) : idx + dir;
      idx = (idx + list.length) % list.length;
      setActive(list[idx]);
    }

    trigger.addEventListener("click", toggle);
    trigger.addEventListener("keydown", (e) => {
      const isOpen = root.classList.contains("is-open");
      if (e.key === "Escape") { close(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); isOpen ? move(1) : open(); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); isOpen ? move(-1) : open(); return; }
      if (e.key === "Home" && isOpen) { e.preventDefault(); setActive(items()[0]); return; }
      if (e.key === "End" && isOpen) { e.preventDefault(); setActive(items()[items().length - 1]); return; }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isOpen) { open(); return; }
        const a = activeItem();
        if (a) choose(a.dataset.value);
        return;
      }
    });

    root._render = render;
    render();
  }

  document.querySelectorAll("[data-select]").forEach((s) => { build(s); instances.push(s); });

  window.__syncSelects = function () {
    instances.forEach((s) => { if (s._render) s._render(); });
  };
})();
