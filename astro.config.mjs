import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import AstroPWA from "@vite-pwa/astro";
import compress from "@playform/compress";

// https://astro.build
export default defineConfig({
  site: "https://endritk.com",
  trailingSlash: "ignore",
  prefetch: { prefetchAll: true, defaultStrategy: "viewport" },
  i18n: {
    defaultLocale: "de",
    locales: ["de", "en", "sq"],
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  build: { inlineStylesheets: "auto" },
  image: { responsiveStyles: true },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "de",
        locales: { de: "de-DE", en: "en", sq: "sq" },
      },
    }),
    AstroPWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: ["icons/*.png"],
      manifest: {
        name: "Endrit Krasniqi — Grundrisse, Pläne & 3D-Visualisierungen",
        short_name: "Endrit Krasniqi",
        description:
          "Grundrisse, Pläne, Aufmaß und 3D-Visualisierungen – individuell und präzise.",
        lang: "de",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#F4F1EA",
        theme_color: "#F4F1EA",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{html,css,js,svg,woff2,png,jpg,webp,avif,xml,json}"],
        navigateFallback: "/offline",
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        cleanupOutdatedCaches: true,
      },
    }),
    compress({ CSS: true, HTML: true, JavaScript: true, Image: false, SVG: true }),
  ],
});
