<script setup lang="ts">
import { ref } from 'vue'

const basicPage = ref(1)
const collapsedPage = ref(25)
const themedPage = ref(3)
const sizedPage = ref(2)

const pagerTypes = ['primary', 'success', 'warning', 'danger', 'info'] as const
const pagerSizes = ['large', 'default', 'small'] as const
</script>

<template>
  <div class="pager-page">
    <h1>页码 Pager</h1>
    <p class="pager-page__intro">
      通过 total 设置总页码数，currentPage 控制当前页；页码过多时自动折叠，并可通过省略号快速跳转。
    </p>

    <section class="pager-section">
      <h2>基础用法</h2>
      <p class="pager-section__description">
        Pager 采用受控模式，在 current-change 事件中更新 currentPage。当前第 {{ basicPage }} 页。
      </p>
      <ElLike-Pager :total="8" :current-page="basicPage" @current-change="basicPage = $event" />
    </section>

    <section class="pager-section">
      <h2>页码折叠</h2>
      <p class="pager-section__description">
        pageCount 限制数字页码按钮数量，点击省略号可按该步长快速跳转。当前第
        {{ collapsedPage }} 页。
      </p>
      <ElLike-Pager
        :total="100"
        :current-page="collapsedPage"
        :page-count="7"
        @current-change="collapsedPage = $event"
      />
    </section>

    <section class="pager-section">
      <h2>主题类型</h2>
      <p class="pager-section__description">type 控制选中、悬停和焦点状态的语义强调色。</p>
      <div class="pager-section__stack">
        <ElLike-Pager
          v-for="type in pagerTypes"
          :key="type"
          :total="8"
          :current-page="themedPage"
          :type="type"
          @current-change="themedPage = $event"
        />
      </div>
    </section>

    <section class="pager-section">
      <h2>不同尺寸</h2>
      <p class="pager-section__description">size 支持 large、default 和 small。</p>
      <div class="pager-section__stack">
        <ElLike-Pager
          v-for="size in pagerSizes"
          :key="size"
          :total="8"
          :current-page="sizedPage"
          :size="size"
          @current-change="sizedPage = $event"
        />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.pager-page__intro {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
}

.pager-section {
  margin-top: 32px;

  h2 {
    margin-bottom: 12px;
  }

  &__description {
    margin-top: 0;
    margin-bottom: 16px;
    color: var(--el-text-color-secondary);
  }

  &__stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
