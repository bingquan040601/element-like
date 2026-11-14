<script setup lang="ts">
import { ref } from 'vue'
import type {
  CascaderConfig,
  CascaderLazyLoad,
  CascaderOption,
  CascaderValue,
} from '@/components/Cascader/props'

const options: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [
          { value: 'xihu', label: '西湖' },
          { value: 'xixi', label: '西溪湿地' },
          { value: 'liangzhu', label: '良渚', disabled: true },
        ],
      },
      {
        value: 'ningbo',
        label: '宁波',
        children: [
          { value: 'dongqianhu', label: '东钱湖' },
          { value: 'tianyige', label: '天一阁' },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      {
        value: 'nanjing',
        label: '南京',
        children: [
          { value: 'xuanwuhu', label: '玄武湖' },
          { value: 'zhongshanling', label: '中山陵' },
        ],
      },
      {
        value: 'suzhou',
        label: '苏州',
        children: [
          { value: 'zhuozhengyuan', label: '拙政园' },
          { value: 'hanshansi', label: '寒山寺' },
        ],
      },
    ],
  },
  { value: 'disabled', label: '禁用省份', disabled: true },
]

const basicValue = ref<CascaderValue>(['zhejiang', 'hangzhou', 'xihu'])
const strictValue = ref<CascaderValue>(null)
const multipleValue = ref<CascaderValue>([
  ['zhejiang', 'hangzhou', 'xihu'],
  ['jiangsu', 'nanjing', 'xuanwuhu'],
])
const filterValue = ref<CascaderValue>(null)
const lazyValue = ref<CascaderValue>(null)
const lazyError = ref('')

const strictConfig: CascaderConfig = {
  checkStrictly: true,
  expandTrigger: 'hover',
}
const multipleConfig: CascaderConfig = {
  multiple: true,
}

const lazyOptions: CascaderOption[] = [
  { value: 'guide', label: '指南', leaf: true },
  { value: 'component', label: '组件' },
  { value: 'resource', label: '资源' },
]

const lazyLoad: CascaderLazyLoad = (node, resolve) => {
  window.setTimeout(() => {
    if (node.level === 1 && node.value === 'component') {
      resolve([
        { value: 'basic', label: '基础组件' },
        { value: 'form', label: '表单组件' },
      ])
      return
    }
    if (node.level === 1 && node.value === 'resource') {
      resolve([
        { value: 'axure', label: 'Axure 组件', leaf: true },
        { value: 'sketch', label: 'Sketch 模板', leaf: true },
      ])
      return
    }
    if (node.level === 2) {
      const prefix = node.value === 'basic' ? '基础' : '表单'
      resolve([
        { value: 'button', label: `${prefix} Button`, leaf: true },
        { value: 'cascader', label: `${prefix} Cascader`, leaf: true },
      ])
      return
    }
    resolve([])
  }, 500)
}
</script>

<template>
  <div class="cascader-page">
    <h1>级联选择器 Cascader</h1>
    <p class="cascader-page__intro">
      从一组关联数据中选择完整路径，支持单选、多选、任意级选择、搜索和异步懒加载。
    </p>

    <section class="cascader-demo">
      <h2>基础用法</h2>
      <p>点击父级展开下一列，选择叶子节点后返回完整路径；可清空、自定义尺寸。</p>
      <el-like-cascader v-model="basicValue" :options="options" clearable aria-label="选择目的地" />
      <output class="cascader-demo__value">{{ JSON.stringify(basicValue) }}</output>
    </section>

    <section class="cascader-demo">
      <h2>任意级选择与 hover 展开</h2>
      <p>设置 checkStrictly 后可选择任意一级，父级显示单选框；鼠标悬停即可展开。</p>
      <el-like-cascader
        v-model="strictValue"
        :options="options"
        :props="strictConfig"
        clearable
        placeholder="请选择任意节点"
      />
      <output class="cascader-demo__value">{{ JSON.stringify(strictValue) }}</output>
    </section>

    <section class="cascader-demo">
      <h2>多选与折叠标签</h2>
      <p>父级复选框联动所有可用叶子，半选状态表示部分选中；Backspace 可移除最后一项。</p>
      <el-like-cascader
        v-model="multipleValue"
        :options="options"
        :props="multipleConfig"
        :max-collapse-tags="2"
        collapse-tags
        clearable
      />
      <output class="cascader-demo__value">{{ JSON.stringify(multipleValue) }}</output>
    </section>

    <section class="cascader-demo">
      <h2>可搜索</h2>
      <p>
        输入节点名称或完整路径进行搜索，支持方向键切换、Enter 选择；自定义 filterMethod
        可改变匹配规则。
      </p>
      <el-like-cascader
        v-model="filterValue"
        :options="options"
        :debounce="0"
        filterable
        clearable
        placeholder="输入“杭州”或“西湖”"
      />
      <output class="cascader-demo__value">{{ JSON.stringify(filterValue) }}</output>
    </section>

    <section class="cascader-demo">
      <h2>动态加载</h2>
      <p>开启 lazy 后，在展开节点时调用 lazyLoad；可回调 resolve，也可直接返回 Promise。</p>
      <el-like-cascader
        v-model="lazyValue"
        :options="lazyOptions"
        :props="{ lazy: true, lazyLoad }"
        clearable
        placeholder="展开“组件”查看异步加载"
        @load-error="lazyError = '加载失败，请重试'"
      />
      <output class="cascader-demo__value">{{ JSON.stringify(lazyValue) }}</output>
      <p v-if="lazyError" class="cascader-demo__error">{{ lazyError }}</p>
    </section>
  </div>
</template>

<style scoped lang="scss">
.cascader-page {
  max-width: 760px;

  &__intro {
    margin: 8px 0 32px;
    color: var(--el-text-color-secondary);
    line-height: 1.7;
  }
}

.cascader-demo {
  margin-bottom: 32px;

  h2 {
    margin-bottom: 10px;
    font-size: var(--el-font-size-large);
  }

  p {
    margin: 0 0 16px;
    color: var(--el-text-color-secondary);
    line-height: 1.7;
  }

  &__value {
    display: block;
    box-sizing: border-box;
    width: 100%;
    margin-top: 12px;
    padding: 10px 12px;
    overflow-x: auto;
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-regular);
    font-family: monospace;
    font-size: var(--el-font-size-extra-small);
    white-space: nowrap;
  }

  p.cascader-demo__error {
    margin-top: 8px;
    color: var(--el-color-danger);
  }
}
</style>
