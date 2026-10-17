export const dialogProps = {
  /** 对话框标题；title 插槽可覆盖该内容 */
  title: {
    type: String,
    default: '提示',
  },
  /** 对话框宽度，支持任意有效 CSS 宽度值 */
  width: {
    type: String,
    default: '50%',
  },
  /** 对话框距离视口顶部的距离，支持任意有效 CSS 长度值 */
  top: {
    type: String,
    default: '15vh',
  },
  /** 是否显示对话框；由父组件控制 */
  visible: {
    type: Boolean,
    default: false,
  },
  /** 点击遮罩是否触发关闭；不影响关闭按钮和 Esc */
  closeOnClickModal: {
    type: Boolean,
    default: true,
  },
}
