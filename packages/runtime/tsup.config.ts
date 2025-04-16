import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/main.ts",
    "src/jsx-runtime/jsx-runtime.ts",
    "src/jsx-runtime/jsx-dev-runtime.ts",
    "src/types/JSX.namespace.d.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
