import type { FontAwesomeIconProps } from '@fortawesome/vue-fontawesome'
import type { PropType } from 'vue'

/** Icon 类型：与 vars.scss 中 $colors 的 5 个语义色一一对应 */
export const iconTypes = ['primary', 'success', 'warning', 'danger', 'info'] as const
export type IconType = (typeof iconTypes)[number]

// ElLike-Icon 的 props：type/color 是自有属性（只作用于包装层，不透传），
// 其余属性与 fontawesome 同名，声明后由 Icon.vue 原样透传给 font-awesome-icon
export const iconProps = {
  /**
   * 图标名称，不含 fa- 前缀（如 "user-secret"）。
   * 组件内部固定拼接为 fa-solid fa-user-secret（main.ts 只注册了 solid 图标库）
   */
  icon: {
    type: String,
    required: true,
  },
  /** 类型：映射为 el-like-icon--{type} 修饰类，颜色消费 --el-color-* token；不传则继承父级文字颜色 */
  type: {
    type: String as PropType<IconType>,
    default: '',
  },
  /** 尺寸：透传 fontawesome（如 "lg"、"2x"），类型与其官方定义保持一致 */
  size: {
    type: String as PropType<FontAwesomeIconProps['size']>,
  },
  /** 旋转角度：透传 fontawesome 的 rotation（90 / 180 / 270） */
  rotation: {
    type: [Number, String] as PropType<FontAwesomeIconProps['rotation']>,
  },
  /** 翻转：透传 fontawesome 的 flip（"horizontal" / "vertical" / "both"） */
  flip: {
    type: [String, Boolean] as PropType<FontAwesomeIconProps['flip']>,
  },
  // 以下均为透传 fontawesome 的动画开关，动画 keyframes 由 fontawesome
  // 自动注入的 CSS（autoAddCss）提供，无需额外引入
  /** 旋转 */
  spin: Boolean,
  /** 反向旋转 */
  spinReverse: Boolean,
  /** 步进式旋转（八等分步进） */
  spinPulse: Boolean,
  /** 脉冲式缩放旋转 */
  pulse: Boolean,
  /** 弹跳 */
  bounce: Boolean,
  /** 抖动 */
  shake: Boolean,
  /** 心跳缩放 */
  beat: Boolean,
  /** 淡入淡出 */
  fade: Boolean,
  /** 心跳 + 淡入淡出 */
  beatFade: Boolean,
  /** 闪烁 */
  flash: Boolean,
  /** 自定义颜色：以行内样式作用于包装层，优先级高于 type */
  color: {
    type: String,
    default: '',
  },
}
