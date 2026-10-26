import type { ImageMetadata } from "astro";
import type { UIKey } from "../i18n/ui";

import p02 from "../assets/images/projekt-02.jpg";
import p03 from "../assets/images/projekt-03.jpg";
import p04 from "../assets/images/projekt-04.jpg";
import p05 from "../assets/images/projekt-05.jpg";
import p06 from "../assets/images/projekt-06.jpg";
import p07 from "../assets/images/projekt-07.jpg";
import p08 from "../assets/images/projekt-08.jpg";
import p09 from "../assets/images/projekt-09.jpg";
import p10 from "../assets/images/projekt-10.jpg";
import p11 from "../assets/images/projekt-11.jpg";
import p12 from "../assets/images/projekt-12.jpg";

export interface Project {
  id: number;
  image: ImageMetadata;
  titleKey: UIKey;
  catKey: UIKey;
  fit: "contain" | "cover";
}

export const projects: Project[] = [
  { id: 1, image: p02, titleKey: "pj.02", catKey: "pj.cat.plan", fit: "contain" },
  { id: 2, image: p03, titleKey: "pj.03", catKey: "pj.cat.flaeche", fit: "contain" },
  { id: 3, image: p04, titleKey: "pj.04", catKey: "pj.cat.schnitt", fit: "contain" },
  { id: 4, image: p05, titleKey: "pj.05", catKey: "pj.cat.interior", fit: "cover" },
  { id: 5, image: p06, titleKey: "pj.06", catKey: "pj.cat.raum", fit: "cover" },
  { id: 6, image: p07, titleKey: "pj.07", catKey: "pj.cat.exterior", fit: "cover" },
  { id: 7, image: p08, titleKey: "pj.08", catKey: "pj.cat.interior", fit: "cover" },
  { id: 8, image: p09, titleKey: "pj.09", catKey: "pj.cat.plan", fit: "contain" },
  { id: 9, image: p10, titleKey: "pj.10", catKey: "pj.cat.bestand", fit: "contain" },
  { id: 10, image: p11, titleKey: "pj.11", catKey: "pj.cat.raum", fit: "contain" },
  { id: 11, image: p12, titleKey: "pj.12", catKey: "pj.cat.schnitt", fit: "contain" },
];
