import type { PropType } from 'vue'
import { tooltipProps } from '@/components/Tooltip/props'
import type { TooltipPlacement, TooltipTrigger } from '@/components/Tooltip/props'

/** 下拉菜单条目 */
export interface DropdownMenuOption {
  /** 条目显示文本 */
  label: string
  /** 条目值，选中后随 select 事件一起返回 */
  value?: unknown
  /** 是否禁用：禁用条目不触发 select，也不会因点击而关闭下拉 */
  disabled?: boolean
  /** 是否在该条目上方显示分割线 */
  divided?: boolean
  /** 条目图标：fontawesome solid 图标名（不含 fa- 前缀） */
  icon?: string
}

// Dropdown 复用 Tooltip 的显示 / 定位 / 触发机制，属性整体继承。
// 仅覆盖 trigger / placement 的默认值以匹配下拉菜单的常见交互；
// 其余继承属性（content / manual / openDelay / closeDelay / visible / popperClass）
// 语义与 Tooltip 完全一致，在 Dropdown.vue 模板中逐一透传给 Tooltip——
// Tooltip 新增属性时需要同步补充透传。
export const dropdownProps = {
  ...tooltipProps,
  /** 触发方式：默认 click（与 Tooltip 的 hover 默认值不同，菜单需要点击展开） */
  trigger: {
    type: String as PropType<TooltipTrigger>,
    default: 'click' as TooltipTrigger,
    validator: (value: string) => ['hover', 'click', 'focus'].includes(value),
  },
  /** 出现位置：默认 bottom（与 Tooltip 的 left 默认值不同，菜单向下展开） */
  placement: {
    type: String as PropType<TooltipPlacement>,
    default: 'bottom' as TooltipPlacement,
    validator: (value: string) => ['top', 'bottom', 'left', 'right'].includes(value),
  },
  /** 下拉内容条目数组 */
  menuOptions: {
    type: Array as PropType<DropdownMenuOption[]>,
    required: true,
  },
  /** 点击条目后是否隐藏下拉 */
  hideAfterClick: {
    type: Boolean,
    default: false,
  },
}
