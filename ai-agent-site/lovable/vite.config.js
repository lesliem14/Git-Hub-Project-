/**
 * Lovable uses Vite. This project is static HTML in public/ — build copies public → dist.
 * @see https://docs.lovable.dev/tips-tricks/external-deployment-hosting
 */
import { defineConfig } from "vite";

export default defineConfig({
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    copyPublicDir: true,
    rollupOptions: {
      input: {
        main: "public/index.html",
        ide: "public/open/embed.html",
      },
    },
  },
});
