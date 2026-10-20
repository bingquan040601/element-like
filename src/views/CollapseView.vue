<script setup lang="ts">
import { ref } from 'vue'

const activeNames = ref<string[]>(['1'])
const accordionNames = ref<string[]>(['1'])
const slotNames = ref<string[]>([])
const changeLog = ref<string[]>([])

const recordChange = (value: string[]) => {
  changeLog.value.push(`[${value.join(', ') || '空'}]`)
}
</script>

<template>
  <div class="collapse-page">
    <h1>折叠面板 Collapse</h1>
    <p class="collapse-page__intro">
      通过 v-model 维护展开面板集合；支持手风琴模式、自定义标题与禁用面板，展开/收起带高度过渡。
    </p>

    <section class="collapse-section">
      <h2>基础用法</h2>
      <p class="collapse-section__description">
        点击标题切换展开状态，可同时展开多个面板。当前展开：{{ activeNames.join('、') || '无' }}
      </p>
      <ElLike-Collapse v-model="activeNames" @change="recordChange">
        <ElLike-CollapseItem name="1" title="一致性 Consistency">
          <p>与现实生活流程、逻辑保持一致，遵循用户习惯的语言和概念。</p>
        </ElLike-CollapseItem>
        <ElLike-CollapseItem name="2" title="反馈 Feedback">
          <p>通过界面样式和交互动效让用户清晰地感知自己的操作。</p>
        </ElLike-CollapseItem>
        <ElLike-CollapseItem name="3" title="效率 Efficiency">
          <p>界面简单直白，让用户快速识别而非回忆，减少用户记忆负担。</p>
        </ElLike-CollapseItem>
      </ElLike-Collapse>
      <p class="collapse-section__description">change 事件记录：{{ changeLog.join(' → ') || '暂无' }}</p>
    </section>

    <section class="collapse-section">
      <h2>手风琴模式</h2>
      <p class="collapse-section__description">
        accordion 开启后同时最多展开一个面板，再次点击已展开面板将其收起。当前展开：
        {{ accordionNames.join('、') || '无' }}
      </p>
      <ElLike-Collapse v-model="accordionNames" accordion>
        <ElLike-CollapseItem name="1" title="一致性 Consistency">
          <p>与现实生活流程、逻辑保持一致，遵循用户习惯的语言和概念。</p>
        </ElLike-CollapseItem>
        <ElLike-CollapseItem name="2" title="反馈 Feedback">
          <p>通过界面样式和交互动效让用户清晰地感知自己的操作。</p>
        </ElLike-CollapseItem>
        <ElLike-CollapseItem name="3" title="效率 Efficiency">
          <p>界面简单直白，让用户快速识别而非回忆，减少用户记忆负担。</p>
        </ElLike-CollapseItem>
      </ElLike-Collapse>
    </section>

    <section class="collapse-section">
      <h2>自定义标题</h2>
      <p class="collapse-section__description">
        title 插槽可替换标题内容；未设置 title 时标题回退展示 name。
      </p>
      <ElLike-Collapse v-model="slotNames">
        <ElLike-CollapseItem name="custom">
          <template #title>
            <b>自定义标题</b>
            <span class="collapse-page__tag">#title 插槽</span>
          </template>
          <p>通过 title 插槽自定义标题内容。</p>
        </ElLike-CollapseItem>
        <ElLike-CollapseItem name="回退示例">
          <p>本面板未设置 title，标题回退展示 name 的值。</p>
        </ElLike-CollapseItem>
      </ElLike-Collapse>
    </section>

    <section class="collapse-section">
      <h2>禁用面板</h2>
      <p class="collapse-section__description">disabled 面板不响应点击，保持初始展开状态不变。</p>
      <ElLike-Collapse v-model="activeNames">
        <ElLike-CollapseItem name="locked" title="禁用面板" disabled>
          <p>禁用面板不可展开或收起。</p>
        </ElLike-CollapseItem>
        <ElLike-CollapseItem name="normal" title="普通面板">
          <p>普通面板可以正常展开。</p>
        </ElLike-CollapseItem>
      </ElLike-Collapse>
    </section>
  </div>
</template>

<style scoped lang="scss">
.collapse-page__intro {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
}

.collapse-page__tag {
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: var(--el-border-radius-small);
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: var(--el-font-size-extra-small);
  font-weight: 400;
}

.collapse-section {
  margin-top: 32px;

  h2 {
    margin-bottom: 12px;
  }

  &__description {
    margin-top: 0;
    margin-bottom: 16px;
    color: var(--el-text-color-secondary);
  }
}
</style>
