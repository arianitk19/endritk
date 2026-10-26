import { ui, defaultLang, type Lang, type UIKey } from "./ui";

/** Extract the active language from a URL pathname. */
export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split("/");
  if (seg === "en" || seg === "sq") return seg;
  return defaultLang;
}

/** Returns a translator bound to a language, with fallback to German. */
export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/** Home path for a given language (default locale is unprefixed). */
export function homePath(lang: Lang): string {
  return lang === defaultLang ? "/" : `/${lang}`;
}

/** A section anchor href for a given language. */
export function anchor(lang: Lang, id: string): string {
  return `${homePath(lang)}#${id}`;
}

/** All languages, used for the language switcher and hreflang tags. */
export const allLangs: Lang[] = ["de", "en", "sq"];
