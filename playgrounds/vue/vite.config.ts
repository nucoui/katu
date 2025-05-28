import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue({
    template: {
      compilerOptions: {
        // すべてのハイフンを含むタグ名をカスタム要素として認識
        isCustomElement: (tag) => tag.includes('-'),
      },
    },
  })],
})
