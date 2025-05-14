import { defineConfig } from "vite"

export default defineConfig({
  build: {
    target: ['es2022', 'edge89', 'firefox89', 'chrome89', 'safari15']
  }
});