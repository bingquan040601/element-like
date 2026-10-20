<script setup lang="ts">
import type { DropdownMenuOption } from '@/components/Dropdown/props'
import { ref } from 'vue'

// 基础选项：查看 / 编辑 / 删除
const basicOptions: DropdownMenuOption[] = [
  { label: '查看', value: 'view' },
  { label: '编辑', value: 'edit' },
  { label: '删除', value: 'delete' },
]

// 带禁用与分割线的选项
const statusOptions: DropdownMenuOption[] = [
  { label: '查看', value: 'view' },
  { label: '编辑', value: 'edit' },
  { label: '上传', value: 'upload', divided: true },
  { label: '删除', value: 'delete', disabled: true },
]

// 带图标的选项
const iconOptions: DropdownMenuOption[] = [
  { label: '编辑', value: 'edit', icon: 'pen-to-square' },
  { label: '下载', value: 'download', icon: 'download' },
  { label: '删除', value: 'delete', icon: 'trash-can' },
]

// 手动控制：v-model:visible 接管显示状态
const manualVisible = ref(false)

const eventLog = ref<string[]>([])
const recordSelect = (option: DropdownMenuOption) => {
  eventLog.value.push(`选中:${option.label}`)
}
const recordVisibility = (visible: boolean) => {
  eventLog.value.push(visible ? '显示' : '隐藏')
}
</script>

<template>
  <div class="dropdown-page">
    <h1>下拉菜单 Dropdown</h1>
    <p class="dropdown-page__intro">
      在触发元素附近展示选项菜单；复用 Tooltip 的显示与定位机制并继承其全部属性， 选择条目触发
      select 事件。
    </p>

    <section class="dropdown-section">
      <h2>基础用法</h2>
      <p class="dropdown-section__description">
        默认 click 触发、向下展开；hideAfterClick 默认 false，选择后菜单保持打开：
      </p>
      <div class="dropdown-section__row">
        <el-like-dropdown :menu-options="basicOptions" @select="recordSelect">
          <el-like-button>操作</el-like-button>
        </el-like-dropdown>
      </div>
    </section>

    <section class="dropdown-section">
      <h2>点击后隐藏</h2>
      <p class="dropdown-section__description">
        hideAfterClick 为 true 时，点击条目后立即关闭下拉：
      </p>
      <div class="dropdown-section__row">
        <el-like-dropdown :menu-options="basicOptions" hide-after-click @select="recordSelect">
          <el-like-button>选择后关闭</el-like-button>
        </el-like-dropdown>
      </div>
    </section>

    <section class="dropdown-section">
      <h2>禁用与分割线</h2>
      <p class="dropdown-section__description">
        disabled 条目不触发 select、点击不会关闭下拉；divided 条目上方显示分割线：
      </p>
      <div class="dropdown-section__row">
        <el-like-dropdown :menu-options="statusOptions" hide-after-click @select="recordSelect">
          <el-like-button>带状态条目</el-like-button>
        </el-like-dropdown>
      </div>
    </section>

    <section class="dropdown-section">
      <h2>带图标条目</h2>
      <p class="dropdown-section__description">
        条目设置 icon 后展示 fontawesome 图标，颜色跟随条目文字状态：
      </p>
      <div class="dropdown-section__row">
        <el-like-dropdown :menu-options="iconOptions" hide-after-click @select="recordSelect">
          <el-like-button>图标菜单</el-like-button>
        </el-like-dropdown>
      </div>
    </section>

    <section class="dropdown-section">
      <h2>继承 Tooltip 属性</h2>
      <p class="dropdown-section__description">
        trigger / placement / 延时 / manual 等 Tooltip 属性全部可用，仅默认值不同 （trigger 默认
        click、placement 默认 bottom）：
      </p>
      <div class="dropdown-section__row">
        <el-like-dropdown
          trigger="hover"
          placement="right"
          :menu-options="basicOptions"
          hide-after-click
          @select="recordSelect"
        >
          <el-like-button>hover 触发</el-like-button>
        </el-like-dropdown>
        <el-like-dropdown
          manual
          v-model:visible="manualVisible"
          :menu-options="basicOptions"
          @select="recordSelect"
        >
          <el-like-button @click="manualVisible = !manualVisible">
            manual 切换（当前{{ manualVisible ? '显示' : '隐藏' }}）
          </el-like-button>
        </el-like-dropdown>
      </div>
    </section>

    <section class="dropdown-section">
      <h2>事件</h2>
      <p class="dropdown-section__description">
        select 在选择条目后触发，参数为完整条目对象；visible-change 在显示状态改变后触发：
      </p>
      <div class="dropdown-section__row">
        <el-like-dropdown
          :menu-options="basicOptions"
          hide-after-click
          @select="recordSelect"
          @visible-change="recordVisibility"
        >
          <el-like-button>观察事件</el-like-button>
        </el-like-dropdown>
      </div>
      <p class="dropdown-section__description">事件记录：{{ eventLog.join(' → ') || '暂无' }}</p>
    </section>
  </div>
</template>

<style scoped lang="scss">
.dropdown-page__intro {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
}

.dropdown-section {
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
