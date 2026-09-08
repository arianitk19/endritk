/* ============================================================
   Projects — single source of truth for the 8 works.
   `fit` decides object-fit (contain preserves technical plans).
   `span` + `ratio` drive the asymmetric editorial grid.
   i18n keys map to translations.js so titles/categories localise.
   ============================================================ */
const projects = [
  {
    id: 1,
    image: "assets/images/projekt-01.jpg",
    titleKey: "pj.01",
    catKey: "pj.cat.bestand",
    fit: "contain",
    span: "pj--wide",
    ratio: "ar-plan",
    year: "—"
  },
  {
    id: 2,
    image: "assets/images/projekt-02.jpg",
    titleKey: "pj.02",
    catKey: "pj.cat.plan",
    fit: "contain",
    span: "pj--third",
    ratio: "ar-3-4",
    year: "—"
  },
  {
    id: 3,
    image: "assets/images/projekt-03.jpg",
    titleKey: "pj.03",
    catKey: "pj.cat.flaeche",
    fit: "contain",
    span: "pj--half",
    ratio: "ar-4-3",
    year: "—"
  },
  {
    id: 4,
    image: "assets/images/projekt-04.jpg",
    titleKey: "pj.04",
    catKey: "pj.cat.schnitt",
    fit: "contain",
    span: "pj--half",
    ratio: "ar-4-3",
    year: "—"
  },
  {
    id: 5,
    image: "assets/images/projekt-05.jpg",
    titleKey: "pj.05",
    catKey: "pj.cat.interior",
    fit: "cover",
    span: "pj--wide",
    ratio: "ar-16-9",
    year: "—"
  },
  {
    id: 6,
    image: "assets/images/projekt-06.jpg",
    titleKey: "pj.06",
    catKey: "pj.cat.raum",
    fit: "cover",
    span: "pj--third",
    ratio: "ar-3-4",
    year: "—"
  },
  {
    id: 7,
    image: "assets/images/projekt-07.jpg",
    titleKey: "pj.07",
    catKey: "pj.cat.exterior",
    fit: "cover",
    span: "pj--half",
    ratio: "ar-4-3",
    year: "—"
  },
  {
    id: 8,
    image: "assets/images/projekt-08.jpg",
    titleKey: "pj.08",
    catKey: "pj.cat.interior",
    fit: "cover",
    span: "pj--half",
    ratio: "ar-4-3",
    year: "—"
  }
];

if (typeof window !== "undefined") window.projects = projects;
