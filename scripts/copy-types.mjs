// 将公共类型声明拷贝进两种构建产物目录，供 package.json 的 types 字段与
// exports 的 types 条件引用。ES 与 UMD 共用同一份声明（API 一致，差异只在
// 运行时格式）。
// 用 Node 原生 fs 实现而非第三方 CLI，避免为此引入额外依赖（跨平台行为一致）。
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = resolve(fileURLToPath(import.meta.url), '..', '..')

const source = resolve(base, 'src/bundle.d.ts')
for (const format of ['es', 'umd']) {
  copyFileSync(source, resolve(base, `dist/${format}/bundle.d.ts`))
  console.log(`✔ src/bundle.d.ts -> dist/${format}/bundle.d.ts`)
}
