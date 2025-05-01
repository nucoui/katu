import { defineConfig } from "vite"
import { transpile } from "@katu/transpiler";

function katuTranspilerPlugin() {
  return {
    name: 'vite-plugin-katu-transpiler',
    async transform(code, id) {
      if (id.endsWith('.tsx') || id.endsWith('.jsx')) {
        return await transpile(code);
      }
      return code;
    }
  };
}

export default defineConfig({
  build: {
    target: ['es2022', 'edge89', 'firefox89', 'chrome89', 'safari15']
  },
  esbuild: {
    jsx: "preserve",
  },
  plugins: [katuTranspilerPlugin()]
});