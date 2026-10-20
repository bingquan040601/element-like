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
      <el-like-tooltip content="这是默认出现在左侧的提示内容" @visible-change="recordVisibility">
        <el-like-button>悬停查看</el-like-button>
      </el-like-tooltip>
    </section>

    <section class="tooltip-section">
      <h2>出现位置</h2>
      <p class="tooltip-section__description">
        placement 支持 top / bottom / left / right；首选位置空间不足时自动翻转到对侧：
      </p>
      <div class="tooltip-section__row">
        <el-like-tooltip placement="top" content="上方提示">
          <el-like-button>top</el-like-button>
        </el-like-tooltip>
        <el-like-tooltip placement="bottom" content="下方提示">
          <el-like-button>bottom</el-like-button>
        </el-like-tooltip>
        <el-like-tooltip placement="left" content="左侧提示">
          <el-like-button>left</el-like-button>
        </el-like-tooltip>
        <el-like-tooltip placement="right" content="右侧提示">
          <el-like-button>right</el-like-button>
        </el-like-tooltip>
      </div>
    </section>

    <section class="tooltip-section">
      <h2>触发方式</h2>
      <p class="tooltip-section__description">
        click 点击切换、点击外部区域关闭；focus 聚焦显示、失焦关闭：
      </p>
      <div class="tooltip-section__row">
        <el-like-tooltip trigger="click" content="点击切换，点击外部关闭">
          <el-like-button>click 触发</el-like-button>
        </el-like-tooltip>
        <el-like-tooltip trigger="focus" content="聚焦显示，失焦关闭">
          <el-like-button>focus 触发</el-like-button>
        </el-like-tooltip>
      </div>
    </section>

    <section class="tooltip-section">
      <h2>延时控制</h2>
      <p class="tooltip-section__description">
        openDelay / closeDelay 仅对 hover 触发生效，单位为毫秒。下方示例打开与关闭均延时 500ms：
      </p>
      <el-like-tooltip content="打开与关闭都延迟 500ms" :open-delay="500" :close-delay="500">
        <el-like-button>延时 500ms</el-like-button>
      </el-like-tooltip>
    </section>

    <section class="tooltip-section">
      <h2>手动控制</h2>
      <p class="tooltip-section__description">
        manual 开启后忽略 trigger，改用 v-model:visible 或组件实例的 open / close / toggle
        方法控制：
      </p>
      <div class="tooltip-section__row">
        <el-like-tooltip manual v-model:visible="manualVisible" content="由 v-model:visible 控制">
          <el-like-button @click="manualVisible = !manualVisible">
            v-model 切换（当前{{ manualVisible ? '显示' : '隐藏' }}）
          </el-like-button>
        </el-like-tooltip>
        <el-like-tooltip ref="methodTooltip" manual content="由实例方法控制">
          <el-like-button @click="methodTooltip?.toggle()">方法 toggle</el-like-button>
        </el-like-tooltip>
        <el-like-button @click="methodTooltip?.open()">方法 open</el-like-button>
        <el-like-button @click="methodTooltip?.close()">方法 close</el-like-button>
      </div>
    </section>

    <section class="tooltip-section">
      <h2>事件</h2>
      <p class="tooltip-section__description">
        visible-change 在气泡显示状态变化时触发，参数为当前是否显示：
      </p>
      <el-like-tooltip content="监听 visible-change 事件" @visible-change="recordVisibility">
        <el-like-button>悬停并观察记录</el-like-button>
      </el-like-tooltip>
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
