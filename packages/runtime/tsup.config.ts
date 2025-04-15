import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/main.ts",
    "src/jsx-runtime.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
