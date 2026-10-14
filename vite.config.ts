import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // 构建/开发流程中启用的 Vite 插件：
  // - vue()：解析 .vue 单文件组件（SFC），处理 <template>/<script>/<style> 的编译与 HMR。
  //     没有它 Vite 不认识 .vue 文件，项目无法运行。
  // - vueJsx()：支持在 Vue 组件中写 JSX/TSX（基于 Babel 转译）。
  //     解决的问题：某些场景（如复杂渲染函数、动态标签）用 template 表达繁琐，JSX 更灵活。
  // - vueDevTools()：接入 Vue DevTools，开发时可在浏览器中检查组件树、状态和路由。
  //     解决的问题：没有 DevTools 时排查组件层级与响应式数据只能靠打日志，效率低。
  plugins: [vue(), vueJsx(), vueDevTools()],
  server: {
    // 固定开发服务器端口为 1024。
    // 解决的问题：Vite 默认端口是 5173，且被占用时会自动顺延（5174、5175……），
    // 导致每次启动端口可能不同，书签/浏览器历史/跨端联调地址都得跟着改；
    // 固定后团队成员和设备间联调始终使用同一个地址。
    port: 1024,
    // 端口被占用时直接报错退出，而不是自动换成下一个可用端口。
    // 解决的问题：配合上面的固定端口，避免"以为起在 1024、实际开在别的端口"
    // 的隐蔽问题——端口冲突时立刻暴露，由开发者主动处理（关掉占用进程或改端口）。
    strictPort: true,
  },
  // 模块解析相关配置
  resolve: {
    alias: {
      // 路径别名：'@/xxx' 等价于 './src/xxx'（用 fileURLToPath 拼出绝对路径，跨平台安全）。
      // 解决的问题：避免 ../../../ 式的深层相对导入，移动文件时不用改一长串相对路径；
      // 也让导入来源一目了然。注意需与 tsconfig.app.json 的 paths 保持一致，
      // 否则 TypeScript 类型检查认不出该别名（测试用的 vitest.config.ts 合并了本配置，行为一致）。
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
