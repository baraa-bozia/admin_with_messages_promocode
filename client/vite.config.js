import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "./",                // client folder is already root now
  plugins: [react()],
  build: {
    outDir: "../dist",       // build outside client/ into dist/
    emptyOutDir: true
  }
});
