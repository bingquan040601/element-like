import type { PropType } from 'vue'

/** Pager 主题类型；不传时使用主色作为选中与悬停状态的强调色 */
export const pagerTypes = ['default', 'primary', 'success', 'warning', 'danger', 'info'] as const
export type PagerType = (typeof pagerTypes)[number]

/** Pager 尺寸；不传或为 default 时使用基础尺寸 */
export const pagerSizes = ['large', 'default', 'small'] as const
export type PagerSize = (typeof pagerSizes)[number]

export const pagerProps = {
  /** 总页码数；小于 0 时按 0 处理 */
  total: {
    type: Number,
    default: 0,
  },
  /** 当前页码，由父组件通过 current-change 事件维护 */
  currentPage: {
    type: Number,
    default: 1,
  },
  /** 最多展示的数字页码按钮数量，不包含省略号 */
  pageCount: {
    type: Number,
    default: 10,
  },
  /** 主题类型 */
  type: {
    type: String as PropType<PagerType>,
  },
  /** 尺寸 */
  size: {
    type: String as PropType<PagerSize>,
  },
}
