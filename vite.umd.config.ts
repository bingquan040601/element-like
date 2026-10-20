// UMD 格式的组件库打包配置。
// 产物：dist/umd/element-like.umd.cjs + dist/umd/style.css，供 CDN / <script> 直接引入。
// 解决的问题：UMD 消费方没有模块解析能力，因此除 vue（映射到全局变量 Vue）外，
// fontawesome 等依赖全部打进产物，保证 <script> 引入后开箱即用。
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
    outDir: 'dist/umd',
    lib: {
      entry: resolve(__dirname, 'src/bundle.ts'),
      name: 'ElementLike',
      fileName: 'element-like',
      // 显式固定 CSS 产物名为 style.css：与 package.json exports 中的
      // "./style.css" 路径（dist/style.css / dist/umd/style.css）保持一致
      cssFileName: 'style',
      formats: ['umd'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
