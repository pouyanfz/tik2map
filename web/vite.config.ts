import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [
    react(),
    // Self-signed local HTTPS - opt-in via `HTTPS=true npm run dev -- --host`,
    // needed to test browser APIs that require a secure context (e.g.
    // Geolocation) from a phone on the same LAN, since only "localhost" (not
    // a LAN IP) is exempt from that requirement. Off by default so normal
    // dev sessions don't have to click through a cert warning every time.
    ...(process.env.HTTPS === "true" ? [basicSsl()] : []),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      workbox: {
        // mapbox-gl alone pushes the main bundle past the 2 MiB default.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: "Tik2Map",
        short_name: "Tik2Map",
        description: "Paste a TikTok link, drop the place it mentions on a map.",
        theme_color: "#2a78d6",
        background_color: "#f7f3ec",
        display: "standalone",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
});
