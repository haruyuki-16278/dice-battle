import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: process.env.GITHUB_PAGES ? "/dice-battle/" : "/",
  build: {
    target: "ESNext",
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      injectRegister: "auto",
      manifest: {
        name: "dice-battle",
        short_name: "dice-battle",
        description: "shake device -> roll dice",
        theme_color: "#000",
        background_color: "#FFF",
        icons: [
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
