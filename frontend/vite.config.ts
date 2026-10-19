import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["logo.png", "pwa/apple-touch-icon.png"],
      manifest: {
        name: "Aashna — Learn ASL",
        short_name: "Aashna",
        description:
          "An AI-powered compassionate companion bridging the communication gap between deaf and hearing communities.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#14b8a6",
        background_color: "#fdf4ff",
        icons: [
          { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // App shell only — no models, videos, ASL media or the large background image.
        globPatterns: ["**/*.{js,css,html,ico,svg}", "pwa/*.png", "logo.png"],
        globIgnores: ["**/models/**", "**/videos/**", "**/asl/**", "**/bg-pattern.jpg", "eval.html"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//, /^\/eval\.html/, /^\/__\//, /^\/models\//, /^\/videos\//, /^\/asl\//],
        runtimeCaching: [
          { urlPattern: ({ url }) => url.pathname.startsWith("/api/"), handler: "NetworkOnly" },
          {
            urlPattern: ({ url }) =>
              /(^|\.)googleapis\.com$/.test(url.hostname) ||
              /(^|\.)firebaseio\.com$/.test(url.hostname) ||
              /(^|\.)firebaseapp\.com$/.test(url.hostname) ||
              url.hostname.endsWith("gstatic.com") && url.pathname.includes("firebasejs"),
            handler: "NetworkOnly",
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/models/landmark_model/"),
            handler: "CacheFirst",
            options: {
              cacheName: "landmark-model",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === "cdn.jsdelivr.net" && url.pathname.startsWith("/npm/@mediapipe/"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "mediapipe-cdn",
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});