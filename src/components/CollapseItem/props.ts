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
