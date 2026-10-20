import type { InjectionKey, PropType, Ref } from 'vue'

/** Collapse 组件属性 */
export const collapseProps = {
  /** 当前展开的 CollapseItem name 数组，由父组件通过 v-model 维护 */
  modelValue: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  /** 是否开启手风琴模式：同一时间最多展开一个面板 */
  accordion: {
    type: Boolean,
    default: false,
  },
}

/** CollapseItem 组件属性 */
export const collapseItemProps = {
  /** 面板唯一标识（必填）；未设置 title 时也作为标题文案展示 */
  name: {
    type: String,
    // as const 防止 required 被拓宽为 boolean，确保 ExtractPropTypes 推导出必填 string
    required: true as const,
  },
  /** 面板标题；缺省时回退展示 name */
  title: {
    type: String,
    default: '',
  },
  /** 是否禁用：禁用面板不可展开或收起 */
  disabled: {
    type: Boolean,
    default: false,
  },
}

/** Collapse 通过 provide/inject 下发给子项的上下文 */
export interface CollapseContext {
  /** 当前展开的 name 数组（内部状态，与 modelValue 双向同步） */
  activeNames: Ref<string[]>
  /** 点击面板头部时切换该面板的展开状态 */
  handleItemClick: (name: string) => void
}

export const collapseContextKey: InjectionKey<CollapseContext> = Symbol('collapseContextKey')
