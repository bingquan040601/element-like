// vars.scss token 目录的 TS 投影。
// 之所以需要这份「第二份目录」：浏览器无法枚举 :root 上的自定义属性
// （getComputedStyle 只能按名查询），SCSS 也无法导入 TS——色板类组件
// 只能自行携带目录。防漂移保障：styles/__tests__/tokens.spec.ts 会把
// 这里拼出的每条变量名拿去 vars.scss 编译产物里核对，改名漏同步时测试会红。

// 语义色：与 vars.scss 的 $colors map 保持一致，primary 为主色，其余为辅助色
export const semanticColors = [
  { name: 'primary', label: 'Primary', isPrimary: true },
  { name: 'success', label: 'Success', isPrimary: false },
  { name: 'warning', label: 'Warning', isPrimary: false },
  { name: 'danger', label: 'Danger', isPrimary: false },
  { name: 'info', label: 'Info', isPrimary: false },
] as const

// 语义色亮度档位：与 vars.scss 的生成公式一致（base + light-3/5/7/8/9 + dark-2）
export const semanticVariants = [
  'base',
  'light-3',
  'light-5',
  'light-7',
  'light-8',
  'light-9',
  'dark-2',
] as const

// 中性色分组：与 vars.scss 的中性色 token 一致
export const neutralGroups = [
  {
    title: '文字颜色',
    prefix: '--el-text-color',
    variants: ['primary', 'regular', 'secondary', 'placeholder', 'disabled'],
  },
  {
    title: '边框颜色',
    prefix: '--el-border-color',
    variants: ['base', 'light', 'lighter', 'extra-light', 'dark', 'darker'],
  },
  {
    title: '填充颜色',
    prefix: '--el-fill-color',
    variants: ['base', 'light', 'lighter', 'extra-light', 'dark', 'darker', 'blank'],
  },
  {
    title: '背景颜色',
    prefix: '--el-bg-color',
    variants: ['base', 'page', 'overlay'],
  },
] as const

export interface Swatch {
  /** 完整变量名，如 --el-color-primary-light-3 */
  varName: string
  /** 展示名，如 light-3 */
  label: string
}

// 变量名拼接规则与 vars.scss 的生成写法一一对应（base 不带后缀）
function semanticVar(name: string, variant: string) {
  return `--el-color-${name}${variant === 'base' ? '' : `-${variant}`}`
}

export function semanticSwatches(name: string): Swatch[] {
  return semanticVariants.map((variant) => ({
    varName: semanticVar(name, variant),
    label: variant,
  }))
}

export function neutralSwatches(group: { prefix: string; variants: readonly string[] }): Swatch[] {
  return group.variants.map((variant) => ({
    varName: variant === 'base' ? group.prefix : `${group.prefix}-${variant}`,
    label: variant,
  }))
}
