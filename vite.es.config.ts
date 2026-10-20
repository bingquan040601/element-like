// ES Module 格式的组件库打包配置。
// 产物：dist/es/element-like.js + dist/es/style.css，供支持 ESM 的构建工具消费。
// 解决的问题：ES 产物必须把运行时对等依赖（vue、fontawesome）标记为 external，
// 由使用方自行安装，否则会出现「库内嵌一份 Vue」导致的实例/上下文不一致问题。
import { fileURLToPath, URL } from 'node:url'
import { resolve, dirname } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 组件库打包不需要复制 public 目录（演示应用才有静态资源）
  publicDir: false,
  build: {
    outDir: 'dist/es',
    lib: {
      entry: resolve(__dirname, 'src/bundle.ts'),
      name: 'ElementLike',
      fileName: 'element-like',
      // 显式固定 CSS 产物名为 style.css：与 package.json exports 中的
      // "./style.css" 路径（dist/style.css / dist/umd/style.css）保持一致
      cssFileName: 'style',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'vue',
        '@fortawesome/fontawesome-svg-core',
        '@fortawesome/free-solid-svg-icons',
        '@fortawesome/vue-fontawesome',
      ],
    },
  },
})
