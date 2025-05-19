import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/jsx-dev-runtime.ts",
    "src/jsx-runtime.ts",
    "src/main.ts",
    "src/reactivity.ts",
    "src/runtime.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
