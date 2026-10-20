<script setup lang="ts">
import { ref } from 'vue'

// 手动控制：v-model:visible 接管显示状态
const manualVisible = ref(false)

// 手动控制：通过组件实例方法 open / close / toggle 触发
interface TooltipMethods {
  open: () => void
  close: () => void
  toggle: () => void
}
const methodTooltip = ref<TooltipMethods | null>(null)

const eventLog = ref<string[]>([])
const recordVisibility = (visible: boolean) => {
  eventLog.value.push(visible ? '显示' : '隐藏')
}
</script>

<template>
  <div class="tooltip-page">
    <h1>文字提示 Tooltip</h1>
    <p class="tooltip-page__intro">
      在触发元素附近展示简短的文字提示；支持 hover / click / focus
      三种触发方式、延时与手动控制，空间不足时自动翻转。
    </p>

    <section class="tooltip-section">
      <h2>基础用法</h2>
      <p class="tooltip-section__description">
        默认 hover 触发、出现在左侧；移入气泡本身不会关闭：
      </p>
      <ElLike-Tooltip content="这是默认出现在左侧的提示内容" @visible-change="recordVisibility">
        <ElLike-Button>悬停查看</ElLike-Button>
      </ElLike-Tooltip>
    </section>

    <section class="tooltip-section">
      <h2>出现位置</h2>
      <p class="tooltip-section__description">
        placement 支持 top / bottom / left / right；首选位置空间不足时自动翻转到对侧：
      </p>
      <div class="tooltip-section__row">
        <ElLike-Tooltip placement="top" content="上方提示">
          <ElLike-Button>top</ElLike-Button>
        </ElLike-Tooltip>
        <ElLike-Tooltip placement="bottom" content="下方提示">
          <ElLike-Button>bottom</ElLike-Button>
        </ElLike-Tooltip>
        <ElLike-Tooltip placement="left" content="左侧提示">
          <ElLike-Button>left</ElLike-Button>
        </ElLike-Tooltip>
        <ElLike-Tooltip placement="right" content="右侧提示">
          <ElLike-Button>right</ElLike-Button>
        </ElLike-Tooltip>
      </div>
    </section>

    <section class="tooltip-section">
      <h2>触发方式</h2>
      <p class="tooltip-section__description">
        click 点击切换、点击外部区域关闭；focus 聚焦显示、失焦关闭：
      </p>
      <div class="tooltip-section__row">
        <ElLike-Tooltip trigger="click" content="点击切换，点击外部关闭">
          <ElLike-Button>click 触发</ElLike-Button>
        </ElLike-Tooltip>
        <ElLike-Tooltip trigger="focus" content="聚焦显示，失焦关闭">
          <ElLike-Button>focus 触发</ElLike-Button>
        </ElLike-Tooltip>
      </div>
    </section>

    <section class="tooltip-section">
      <h2>延时控制</h2>
      <p class="tooltip-section__description">
        openDelay / closeDelay 仅对 hover 触发生效，单位为毫秒。下方示例打开与关闭均延时 500ms：
      </p>
      <ElLike-Tooltip content="打开与关闭都延迟 500ms" :open-delay="500" :close-delay="500">
        <ElLike-Button>延时 500ms</ElLike-Button>
      </ElLike-Tooltip>
    </section>

    <section class="tooltip-section">
      <h2>手动控制</h2>
      <p class="tooltip-section__description">
        manual 开启后忽略 trigger，改用 v-model:visible 或组件实例的 open / close / toggle
        方法控制：
      </p>
      <div class="tooltip-section__row">
        <ElLike-Tooltip manual v-model:visible="manualVisible" content="由 v-model:visible 控制">
          <ElLike-Button @click="manualVisible = !manualVisible">
            v-model 切换（当前{{ manualVisible ? '显示' : '隐藏' }}）
          </ElLike-Button>
        </ElLike-Tooltip>
        <ElLike-Tooltip ref="methodTooltip" manual content="由实例方法控制">
          <ElLike-Button @click="methodTooltip?.toggle()">方法 toggle</ElLike-Button>
        </ElLike-Tooltip>
        <ElLike-Button @click="methodTooltip?.open()">方法 open</ElLike-Button>
        <ElLike-Button @click="methodTooltip?.close()">方法 close</ElLike-Button>
      </div>
    </section>

    <section class="tooltip-section">
      <h2>事件</h2>
      <p class="tooltip-section__description">
        visible-change 在气泡显示状态变化时触发，参数为当前是否显示：
      </p>
      <ElLike-Tooltip content="监听 visible-change 事件" @visible-change="recordVisibility">
        <ElLike-Button>悬停并观察记录</ElLike-Button>
      </ElLike-Tooltip>
      <p class="tooltip-section__description">事件记录：{{ eventLog.join(' → ') || '暂无' }}</p>
    </section>
  </div>
</template>

<style scoped lang="scss">
.tooltip-page__intro {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
}

.tooltip-section {
  margin-top: 32px;

  h2 {
    margin-bottom: 12px;
  }

  &__description {
    margin-top: 0;
    margin-bottom: 16px;
    color: var(--el-text-color-secondary);
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }
}
</style>
