import type { PropType } from 'vue'

/** Button 主题类型：default 为中性按钮，其余值对应全局语义色 */
export const buttonTypes = ['default', 'primary', 'success', 'warning', 'danger', 'info'] as const
export type ButtonType = (typeof buttonTypes)[number]

/** Button 尺寸：default 使用基础尺寸，不额外生成尺寸修饰类 */
export const buttonSizes = ['large', 'default', 'small'] as const
export type ButtonSize = (typeof buttonSizes)[number]

export const buttonNativeTypes = ['button', 'submit', 'reset'] as const
export type ButtonNativeType = (typeof buttonNativeTypes)[number]

export const buttonProps = {
  /** 主题类型 */
  type: {
    type: String as PropType<ButtonType>,
    default: 'default',
  },
  /** 尺寸；不传或为 default 时使用基础尺寸 */
  size: {
    type: String as PropType<ButtonSize>,
  },
  /** 原生按钮类型；默认 button，表单提交按钮可显式设为 submit */
  nativeType: {
    type: String as PropType<ButtonNativeType>,
    default: 'button',
    validator: (value: string) => buttonNativeTypes.includes(value as ButtonNativeType),
  },
  /** 是否为朴素按钮 */
  plain: Boolean,
  /** 是否为圆角按钮 */
  round: Boolean,
  /** 是否为圆形按钮 */
  circle: Boolean,
  /** 是否禁用 */
  disabled: Boolean,
  /** 是否加载中；加载中会显示旋转图标并禁止点击 */
  loading: Boolean,
  /** 图标名称，不含 fa- 前缀；loading 时由加载图标替代 */
  icon: {
    type: String,
    default: '',
  },
}
