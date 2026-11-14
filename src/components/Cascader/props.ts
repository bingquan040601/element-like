import type { PropType } from 'vue'

export type CascaderNodeValue = string | number
export type CascaderValue = CascaderNodeValue | CascaderNodeValue[] | CascaderNodeValue[][] | null

/** 原始选项；通过 props 配置可映射为其他字段名 */
export interface CascaderOption {
  value?: CascaderNodeValue
  label?: string
  disabled?: boolean
  leaf?: boolean
  children?: CascaderOption[]
  [key: string]: unknown
}

/** 组件内部归一化后的节点，也会传给 lazyLoad、filterMethod 和默认插槽 */
export interface CascaderNode {
  data: CascaderOption
  value: CascaderNodeValue
  label: string
  level: number
  leaf: boolean
  disabled: boolean
  loading: boolean
  loaded: boolean
  parent: CascaderNode | null
  children: CascaderNode[]
  pathValues: CascaderNodeValue[]
}

export type CascaderLazyLoad = (
  node: CascaderNode,
  resolve: (data?: CascaderOption[]) => void,
) => void | CascaderOption[] | Promise<void | CascaderOption[]>

export interface CascaderConfig {
  expandTrigger?: 'click' | 'hover'
  multiple?: boolean
  /** 开启后父子节点不再联动，任意层级均可选中 */
  checkStrictly?: boolean
  /** 是否返回完整路径；关闭后仅返回节点 value */
  emitPath?: boolean
  lazy?: boolean
  lazyLoad?: CascaderLazyLoad
  value?: string
  label?: string
  children?: string
  disabled?: string
  leaf?: string
}

export type CascaderSize = 'large' | 'default' | 'small'
export type CascaderPlacement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
export type CascaderFilterMethod = (node: CascaderNode, keyword: string) => boolean
export type CascaderBeforeFilter = (keyword: string) => boolean | Promise<boolean>

export interface CascaderExpose {
  focus: () => void
  blur: () => void
  toggleDropDownVisible: (visible?: boolean) => void
  updatePopperPosition: () => void
  getCheckedNodes: (leafOnly?: boolean) => CascaderNode[]
}

export const defaultCascaderConfig: Required<Omit<CascaderConfig, 'lazyLoad'>> = {
  expandTrigger: 'click',
  multiple: false,
  checkStrictly: false,
  emitPath: true,
  lazy: false,
  value: 'value',
  label: 'label',
  children: 'children',
  disabled: 'disabled',
  leaf: 'leaf',
}

export const cascaderProps = {
  modelValue: {
    type: [Array, String, Number] as PropType<CascaderValue>,
    default: null,
  },
  options: {
    type: Array as PropType<CascaderOption[]>,
    default: () => [],
  },
  /** 选项配置，字段及默认值对齐 Element Plus Cascader */
  props: {
    type: Object as PropType<CascaderConfig>,
    default: () => ({}),
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
  disabled: Boolean,
  clearable: Boolean,
  filterable: Boolean,
  filterMethod: {
    type: Function as PropType<CascaderFilterMethod>,
    default: undefined,
  },
  beforeFilter: {
    type: Function as PropType<CascaderBeforeFilter>,
    default: undefined,
  },
  /** 搜索去抖时间（ms），设为 0 可立即搜索 */
  debounce: {
    type: Number,
    default: 300,
  },
  separator: {
    type: String,
    default: ' / ',
  },
  /** 单选输入框及多选标签是否显示完整路径 */
  showAllLevels: {
    type: Boolean,
    default: true,
  },
  collapseTags: Boolean,
  maxCollapseTags: {
    type: Number,
    default: 1,
    validator: (value: number) => Number.isInteger(value) && value > 0,
  },
  size: {
    type: String as PropType<CascaderSize>,
    default: 'default' as CascaderSize,
    validator: (value: string) => ['large', 'default', 'small'].includes(value),
  },
  placement: {
    type: String as PropType<CascaderPlacement>,
    default: 'bottom-start' as CascaderPlacement,
    validator: (value: string) =>
      ['top-start', 'top-end', 'bottom-start', 'bottom-end'].includes(value),
  },
  popperClass: {
    type: String,
    default: '',
  },
  /** 是否将下拉挂载到 body；关闭后保留在当前 DOM 位置 */
  teleported: {
    type: Boolean,
    default: true,
  },
  emptyText: {
    type: String,
    default: '无匹配数据',
  },
  noDataText: {
    type: String,
    default: '无数据',
  },
  loadingText: {
    type: String,
    default: '加载中',
  },
  ariaLabel: {
    type: String,
    default: '级联选择器',
  },
}
