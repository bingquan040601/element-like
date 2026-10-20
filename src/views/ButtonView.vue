<script setup lang="ts">
import {
  buttonSizes,
  buttonTypes,
  type ButtonSize,
  type ButtonType,
} from '@/components/Button/props'
import { ref } from 'vue'

const typeLabels: Record<ButtonType, string> = {
  default: '默认按钮',
  primary: '主要按钮',
  success: '成功按钮',
  warning: '警告按钮',
  danger: '危险按钮',
  info: '信息按钮',
}

const sizeLabels: Record<ButtonSize, string> = {
  large: '大型按钮',
  default: '默认按钮',
  small: '小型按钮',
}

const clickCount = ref(0)
const btnRef = ref<{ ref: HTMLButtonElement | null } | null>(null)

function clickHandler() {
  clickCount.value++
  console.log(btnRef.value?.ref)
}
</script>

<template>
  <div class="button-page">
    <h1>按钮 Button</h1>
    <p class="button-page__intro">
      支持语义主题、三种尺寸、朴素/圆角/圆形形态，以及图标、禁用和加载状态。
    </p>

    <section class="button-section">
      <h2>基础用法</h2>
      <div class="button-row">
        <el-like-button v-for="type in buttonTypes" :key="type" :type="type">
          {{ typeLabels[type] }}
        </el-like-button>
      </div>
    </section>

    <section class="button-section">
      <h2>朴素按钮 plain</h2>
      <div class="button-row">
        <el-like-button v-for="type in buttonTypes" :key="type" :type="type" plain>
          {{ typeLabels[type] }}
        </el-like-button>
      </div>
    </section>

    <section class="button-section">
      <h2>圆角与圆形 round / circle</h2>
      <div class="button-row">
        <el-like-button v-for="type in buttonTypes" :key="type" :type="type" round>
          {{ typeLabels[type] }}
        </el-like-button>
      </div>
      <div class="button-row">
        <el-like-button
          v-for="type in buttonTypes"
          :key="type"
          :type="type"
          icon="paper-plane"
          circle
          :aria-label="typeLabels[type]"
        />
      </div>
    </section>

    <section class="button-section">
      <h2>尺寸 size</h2>
      <div class="button-row">
        <el-like-button v-for="size in buttonSizes" :key="size" type="primary" :size="size">
          {{ sizeLabels[size] }}
        </el-like-button>
      </div>
    </section>

    <section class="button-section">
      <h2>图标 icon</h2>
      <div class="button-row">
        <el-like-button type="primary" icon="paper-plane">发送</el-like-button>
        <el-like-button type="success" icon="check">完成</el-like-button>
        <el-like-button type="danger" icon="trash">删除</el-like-button>
      </div>
    </section>

    <section class="button-section">
      <h2>禁用与加载 disabled / loading</h2>
      <div class="button-row">
        <el-like-button disabled>禁用按钮</el-like-button>
        <el-like-button type="primary" disabled>禁用按钮</el-like-button>
        <el-like-button type="primary" plain disabled>朴素禁用</el-like-button>
        <el-like-button type="primary" loading>加载中</el-like-button>
      </div>
    </section>

    <section class="button-section">
      <h2>点击事件 click</h2>
      <div class="button-row">
        <el-like-button ref="btnRef" type="primary" icon="hand-pointer" @click="clickHandler">
          点击次数：{{ clickCount }}
        </el-like-button>
        <el-like-button disabled @click="clickCount++">禁用后不会计数</el-like-button>
        <el-like-button loading @click="clickCount++">加载中不会计数</el-like-button>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.button-page__intro {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
}

.button-section {
  margin-top: 32px;

  h2 {
    margin-bottom: 16px;
  }
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;

  & + & {
    margin-top: 16px;
  }
}
</style>
