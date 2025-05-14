import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/jsx-runtime.ts",
    "src/jsx-dev-runtime.ts",
    "src/main.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
