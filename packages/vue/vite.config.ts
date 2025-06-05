import type { Plugin } from "vite";
import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import preserveDirectives from "rollup-preserve-directives";
import vueMacros from "unplugin-vue-macros/vite";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vueMacros({
      plugins: {
        vue: vue(),
        vueJsx: vueJsx(),
      },
    }),
    preserveDirectives() as Plugin,
    dts({
      include: ["src"],
      outDir: "./dist/types",
      tsconfigPath: resolve(__dirname, "tsconfig.app.json"),
    }),
    tsconfigPaths({
      configNames: ["tsconfig.app.json"],
    }),
  ],

  define: {
    __VUE_OPTIONS_API__: "false",
    __VUE_PROD_DEVTOOLS__: "false",
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
  },

  build: {
    outDir: "./dist",
    cssCodeSplit: true,
    minify: true,
    sourcemap: true,
    lib: {
      entry: [
        "src/components/ChatoraWrapper.vue",
        "src/main.ts",
      ],
      name: "vue",
      fileName: (format, entryName) => {
        if (format === "cjs") {
          return `${entryName}.cjs`;
        }

        if (format === "es") {
          return `${entryName}.js`;
        }

        return `${entryName}.${format}.js`;
      },
      formats: [
        "es",
        "cjs",
      ],
    },
    rollupOptions: {
      external: [
        "vue",
        "vue/jsx-runtime",
        "chatora",
      ],
      output: {
        exports: "named",
        preserveModules: true,
        preserveModulesRoot: "src",
        inlineDynamicImports: false,
        manualChunks: undefined,
        globals: {
          "vue": "Vue",
          "vue-macros": "VueMacros",
        },
      },
    },
    // commonjsOptions: {
    //   strictRequires: true,
    // },
  },
});
