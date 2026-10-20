<script setup lang="ts">
import { ref } from 'vue'

const basicVisible = ref(false)
const sizeVisible = ref(false)
const modalVisible = ref(false)
const customVisible = ref(false)
const closeOnClickModal = ref(false)

const releaseName = ref('v1.0.0')
const releaseNotes = ref('优化页面交互体验，修复已知问题。')
</script>

<template>
  <div class="dialog-page">
    <h1>对话框 Dialog</h1>
    <p class="dialog-page__intro">
      通过 visible 控制显示状态，close 事件统一处理关闭；默认插槽、title 插槽和 footer
      插槽支持自定义主体、标题与底部操作区。
    </p>

    <section class="dialog-section">
      <h2>基础用法</h2>
      <p class="dialog-section__description">
        使用 title 设置标题，默认插槽放置正文，footer 插槽放置操作按钮。
      </p>
      <el-like-button type="primary" @click="basicVisible = true">打开基础对话框</el-like-button>
      <el-like-dialog :visible="basicVisible" title="操作提示" @close="basicVisible = false">
        <p>这是一个基础对话框。点击关闭按钮、遮罩或按下 Esc 都会触发 close 事件。</p>
        <template #footer>
          <div class="dialog-actions">
            <el-like-button @click="basicVisible = false">取消</el-like-button>
            <el-like-button type="primary" @click="basicVisible = false">确定</el-like-button>
          </div>
        </template>
      </el-like-dialog>
    </section>

    <section class="dialog-section">
      <h2>自定义尺寸</h2>
      <p class="dialog-section__description">
        width 与 top 接收 CSS 字符串，分别控制对话框宽度和顶部间距。
      </p>
      <el-like-button @click="sizeVisible = true">打开自定义尺寸对话框</el-like-button>
      <el-like-dialog
        :visible="sizeVisible"
        title="自定义尺寸"
        width="640px"
        top="8vh"
        @close="sizeVisible = false"
      >
        <p>当前宽度为 640px，距离视口顶部 8vh；窄屏下会自动限制最大宽度。</p>
      </el-like-dialog>
    </section>

    <section class="dialog-section">
      <h2>遮罩点击关闭</h2>
      <p class="dialog-section__description">
        closeOnClickModal 控制点击遮罩是否触发 close；关闭按钮和 Esc 不受影响。
      </p>
      <div class="dialog-section__controls">
        <el-like-button @click="modalVisible = true">打开遮罩配置对话框</el-like-button>
        <label class="dialog-option">
          <input v-model="closeOnClickModal" type="checkbox" />
          允许点击遮罩关闭
        </label>
      </div>
      <el-like-dialog
        :visible="modalVisible"
        :close-on-click-modal="closeOnClickModal"
        title="遮罩关闭配置"
        @close="modalVisible = false"
      >
        <p>
          当前{{ closeOnClickModal ? '允许' : '禁止' }}点击遮罩关闭。请点击遮罩验证，关闭按钮和 Esc
          始终可用。
        </p>
      </el-like-dialog>
    </section>

    <section class="dialog-section">
      <h2>自定义内容</h2>
      <p class="dialog-section__description">
        title 插槽可组合图标与文本，默认插槽可承载表单等复杂内容。
      </p>
      <el-like-button type="success" @click="customVisible = true">打开发布对话框</el-like-button>
      <el-like-dialog
        :visible="customVisible"
        width="520px"
        top="10vh"
        @close="customVisible = false"
      >
        <template #title>
          <span class="custom-dialog__title">
            <el-like-icon icon="paper-plane" type="primary" />
            发布新版本
          </span>
        </template>

        <div class="dialog-form">
          <label class="dialog-field">
            <span>版本名称</span>
            <input v-model="releaseName" type="text" placeholder="请输入版本名称" />
          </label>
          <label class="dialog-field">
            <span>版本说明</span>
            <textarea v-model="releaseNotes" placeholder="请输入版本说明"></textarea>
          </label>
        </div>

        <template #footer>
          <div class="dialog-actions">
            <el-like-button @click="customVisible = false">取消</el-like-button>
            <el-like-button type="primary" @click="customVisible = false">完成</el-like-button>
          </div>
        </template>
      </el-like-dialog>
    </section>
  </div>
</template>

<style scoped lang="scss">
.dialog-page__intro {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
}

.dialog-section {
  margin-top: 32px;

  h2 {
    margin-bottom: 12px;
  }

  &__description {
    margin-top: 0;
    margin-bottom: 16px;
    color: var(--el-text-color-secondary);
  }

  &__controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
  }
}

.dialog-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-regular);
  cursor: pointer;

  input {
    margin: 0;
    accent-color: var(--el-color-primary);
    cursor: pointer;
  }
}

.dialog-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
}

.custom-dialog__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.dialog-form {
  display: grid;
  gap: 16px;
}

.dialog-field {
  display: grid;
  gap: 8px;
  color: var(--el-text-color-primary);
  font-weight: var(--el-font-weight-primary);

  input,
  textarea {
    box-sizing: border-box;
    width: 100%;
    padding: 8px 12px;
    border: var(--el-border);
    border-radius: var(--el-border-radius-base);
    outline: none;
    background-color: var(--el-bg-color);
    color: var(--el-text-color-regular);
    font: inherit;
    font-weight: 400;
    transition: border-color var(--el-transition-duration-fast);

    &:focus {
      border-color: var(--el-color-primary);
    }
  }

  textarea {
    min-height: 96px;
    resize: vertical;
  }
}
</style>
