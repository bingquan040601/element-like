import { readFileSync } from 'node:fs'
import { compileString } from 'sass-embedded'
import { describe, expect, it } from 'vitest'
import { neutralGroups, neutralSwatches, semanticColors, semanticSwatches } from '../tokens'

// vars.scss 是 token 的唯一定义处，tokens.ts 只是它的 TS 投影（浏览器无法
// 枚举自定义属性，目录只能由组件携带）。本测试把投影拼出的每一条变量名
// 拿到 vars.scss 的编译产物里核对：改动变量名却忘了同步投影时，这里会红。
// 路径相对 cwd（vitest 从项目根运行）。
const compiled = compileString(readFileSync('src/styles/vars.scss', 'utf8')).css

const allSwatches = [
  ...semanticColors.flatMap((color) => semanticSwatches(color.name)),
  ...neutralGroups.flatMap((group) => neutralSwatches(group)),
]

describe('token 目录投影与 vars.scss 同步', () => {
  it('目录中的每条 token 都在 vars.scss 中有定义', () => {
    const missing = allSwatches
      .filter((swatch) => !new RegExp(`${swatch.varName}\\s*:`).test(compiled))
      .map((swatch) => swatch.varName)
    expect(missing).toEqual([])
  })

  it('匹配按完整变量名进行，长名前缀不会误命中', () => {
    // --el-color 是所有色板变量的前缀，但它本身并不是已定义的 token
    expect(/--el-color\s*:/.test(compiled)).toBe(false)
  })

  it('不存在的 token 不会被误判为已定义', () => {
    // light-2 不在 vars.scss 的生成档位（3/5/7/9 + light-8 + dark-2）里
    expect(/--el-color-primary-light-2\s*:/.test(compiled)).toBe(false)
  })
})
