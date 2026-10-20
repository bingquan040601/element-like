import type { PropType } from 'vue'

/** Tooltip 气泡出现的位置 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

/** Tooltip 触发方式 */
export type TooltipTrigger = 'hover' | 'click' | 'focus'

/** Tooltip 组件属性 */
export const tooltipProps = {
  /** 提示内容；content 插槽可覆盖该内容 */
  content: {
    type: String,
    default: '',
  },
  /** 触发方式：hover 悬停显示、click 点击切换、focus 聚焦显示 */
  trigger: {
    type: String as PropType<TooltipTrigger>,
    default: 'hover',
    validator: (value: string) => ['hover', 'click', 'focus'].includes(value),
  },
  /** 气泡出现位置；首选位置空间不足时自动翻转到对侧 */
  placement: {
    type: String as PropType<TooltipPlacement>,
    default: 'left',
    validator: (value: string) => ['top', 'bottom', 'left', 'right'].includes(value),
  },
  /** 是否手动触发：开启后忽略 trigger，改用 v-model:visible 或组件实例的 open/close/toggle 方法控制 */
  manual: {
    type: Boolean,
    default: false,
  },
  /** 打开延时（毫秒），仅对 hover 触发生效 */
  openDelay: {
    type: Number,
    default: 100,
  },
  /** 关闭延时（毫秒），仅对 hover 触发生效 */
  closeDelay: {
    type: Number,
    default: 100,
  },
  /** 是否显示气泡；通常配合 manual 通过 v-model:visible 控制显示状态 */
  visible: {
    type: Boolean,
    default: undefined,
  },
}
