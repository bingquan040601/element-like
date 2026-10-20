<script setup lang="ts">
import cardImage from '@/assets/card-demo.svg'

const sizeCards = [
  { width: 260, imgHeight: 130 },
  { width: 340, imgHeight: 180 },
]
</script>

<template>
  <div class="card-page">
    <h1>卡片 Card</h1>
    <p class="card-page__intro">
      通过 imgSrc 展示卡片图片，使用 width 和 imgHeight 控制尺寸；summary、默认插槽与 footer
      插槽共同支持文本摘要和自定义内容。
    </p>

    <section class="card-section">
      <h2>基础用法</h2>
      <p class="card-section__description">
        不传 width 时，卡片由父容器控制宽度；图片宽度始终占满卡片。
      </p>
      <div class="card-section__basic">
        <ElLike-Card
          :img-src="cardImage"
          :img-height="180"
          summary="在熟悉的风景里，留一点时间给自己。未设置 width，卡片宽度由父容器决定。"
        />
      </div>
    </section>

    <section class="card-section">
      <h2>自定义尺寸</h2>
      <p class="card-section__description">width 与 imgHeight 接收 Number 类型，单位为 px。</p>
      <div class="card-row">
        <ElLike-Card
          v-for="card in sizeCards"
          :key="card.width"
          :width="card.width"
          :img-src="cardImage"
          :img-height="card.imgHeight"
          :summary="`width = ${card.width}，imgHeight = ${card.imgHeight}`"
        />
      </div>
    </section>

    <section class="card-section">
      <h2>可选摘要</h2>
      <p class="card-section__description">不传 summary 时不会渲染摘要区域，可用于纯图片卡片。</p>
      <div class="card-row">
        <ElLike-Card
          :width="300"
          :img-src="cardImage"
          :img-height="150"
          summary="传入 summary，展示卡片摘要。"
        />
        <ElLike-Card :width="300" :img-src="cardImage" :img-height="150" />
      </div>
    </section>

    <section class="card-section">
      <h2>内容扩展</h2>
      <p class="card-section__description">
        默认插槽用于自定义摘要内容，footer 插槽用于底部操作区；summary 与默认插槽同时存在时优先展示
        summary。
      </p>
      <div class="card-row">
        <ElLike-Card :width="360" :img-src="cardImage" :img-height="170">
          <div>
            <h3 class="custom-card__title">在山野之间</h3>
            <p class="custom-card__description">
              通过默认插槽放置标题、富文本和标签，不再局限于纯文本摘要。
            </p>
            <div class="custom-card__tags">
              <span>旅行</span>
              <span>摄影</span>
              <span>自然</span>
            </div>
          </div>
          <template #footer>
            <div class="custom-card__footer">
              <span>6 分钟阅读</span>
              <ElLike-Button type="primary" size="small">阅读全文</ElLike-Button>
            </div>
          </template>
        </ElLike-Card>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.card-page__intro {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
}

.card-section {
  margin-top: 32px;

  h2 {
    margin-bottom: 12px;
  }

  &__description {
    margin-top: 0;
    margin-bottom: 16px;
    color: var(--el-text-color-secondary);
  }

  &__basic {
    width: 360px;
    max-width: 100%;
  }
}

.card-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 20px;

  // 固定宽度示例在窄屏下收缩，避免横向溢出
  :deep(.el-like-card) {
    max-width: 100%;
  }
}

.custom-card {
  &__title {
    margin: 0 0 8px;
    color: var(--el-text-color-primary);
    font-size: var(--el-font-size-medium);
  }

  &__description {
    margin: 0;
    color: var(--el-text-color-secondary);
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;

    span {
      padding: 2px 8px;
      border-radius: var(--el-border-radius-base);
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      font-size: var(--el-font-size-extra-small);
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: var(--el-text-color-secondary);
    font-size: var(--el-font-size-small);
  }
}
</style>
