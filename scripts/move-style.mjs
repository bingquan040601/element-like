// 将 ES 构建产出的样式提升到 dist 根目录。
// 解决的问题：package.json exports 中 "./style.css" 的 import 路径指向 dist/style.css，
// 与包体（dist/es）解耦，让「只引入样式」的用法不依赖具体构建格式的目录结构。
// 用 Node 原生 fs 实现而非第三方 CLI，避免为此引入额外依赖（跨平台行为一致）。
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = resolve(fileURLToPath(import.meta.url), '..', '..')

copyFileSync(resolve(base, 'dist/es/style.css'), resolve(base, 'dist/style.css'))
console.log('✔ dist/es/style.css -> dist/style.css')
