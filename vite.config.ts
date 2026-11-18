import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { compression } from 'vite-plugin-compression2'
import { codeInspectorPlugin } from 'code-inspector-plugin'

// https://vite.dev/config/
export default defineConfig({
  // 构建/开发流程中启用的 Vite 插件：
  // - vue()：解析 .vue 单文件组件（SFC），处理 <template>/<script>/<style> 的编译与 HMR。
  //     没有它 Vite 不认识 .vue 文件，项目无法运行。
  // - vueJsx()：支持在 Vue 组件中写 JSX/TSX（基于 Babel 转译）。
  //     解决的问题：某些场景（如复杂渲染函数、动态标签）用 template 表达繁琐，JSX 更灵活。
  // - codeInspectorPlugin()：按住 Alt + Shift（Mac 为 Option + Shift）并点击页面元素，
  //     自动打开 IDE 并定位到对应源码。仅在开发服务器且本机 CODE_INSPECTOR=true 时启用，
  //     不参与生产构建，也不会把源码路径注入线上页面。
  // - vueDevTools()：接入 Vue DevTools，开发时可在浏览器中检查组件树、状态和路由。
  //     解决的问题：没有 DevTools 时排查组件层级与响应式数据只能靠打日志，效率低。
  plugins: [
    codeInspectorPlugin({
      bundler: 'vite',
      // Vitest 同样使用 serve 模式，需显式排除，避免测试退出时残留定位服务句柄。
      dev: () => process.env.NODE_ENV === 'development',
      // 组件库内部 DOM 不注入路径，优先使用调用方组件上的定位信息。
      exclude: /[\\/]src[\\/]components[\\/]/,
      // 团队默认关闭；开发者在 .env.local 中设置 CODE_INSPECTOR=true 后按需开启。
      needEnvInspector: true,
    }),
    vue(),
    vueJsx(),
    vueDevTools(),
    // 构建时为文本资源生成 .br 旁文件；保留原文件供不支持 Brotli 的客户端回退。
    compression({
      algorithms: ['brotliCompress'],
      deleteOriginalAssets: false,
    }),
  ],
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
    // 开发环境通过同源 /api 请求后端，避免 CORS；生产环境由网关代理到真实域名。
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // 后端同时校验 Origin；代理后将来源改成后端同源地址，避免开发端口被 CORS 拦截。
        headers: {
          Origin: 'http://localhost:3000',
        },
      },
    },
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
