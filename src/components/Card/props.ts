export const cardProps = {
  /** 卡片宽度，单位为 px；不传时由布局自然撑开 */
  width: {
    type: Number,
  },
  /** 卡片图片地址 */
  imgSrc: {
    type: String,
    required: true,
  },
  /** 图片高度，单位为 px；不传时保持图片原始比例 */
  imgHeight: {
    type: Number,
  },
  /** 卡片摘要；不传或为空字符串时不渲染摘要区域 */
  summary: {
    type: String,
  },
}
