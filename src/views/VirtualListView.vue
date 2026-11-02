<script setup lang="ts">
import { computed, ref } from 'vue'
import type { VirtualListExpose, VirtualListRange } from '@/components/VirtualList/types'

interface OperationRecord {
  id: number
  orderNo: string
  region: string
  channel: string
  revenue: number
  status: '已完成' | '履约中' | '待处理'
  note: string
}

const regions = ['华东', '华南', '华北', '西南', '华中']
const channels = ['自营商城', '直播电商', '线下门店', '第三方平台']
const statuses: OperationRecord['status'][] = ['已完成', '履约中', '待处理']

const records: OperationRecord[] = Array.from({ length: 100_000 }, (_, index) => ({
  id: index + 1,
  orderNo: `SO-${String(100_000 - index).padStart(8, '0')}`,
  region: regions[index % regions.length] ?? '华东',
  channel: channels[index % channels.length] ?? '自营商城',
  revenue: 299 + ((index * 137) % 28_000) / 10,
  status: statuses[index % statuses.length] ?? '待处理',
  note:
    index % 3 === 0
      ? '包含跨区域履约与库存调拨信息。此扩展区域用于验证不同内容长度下的动态高度测量。'
      : '',
}))

const listRef = ref<VirtualListExpose>()
const jumpIndex = ref(50_000)
const renderedRange = ref<VirtualListRange>({ startIndex: 0, endIndex: 0 })
const renderedCount = computed(() => renderedRange.value.endIndex - renderedRange.value.startIndex)
const currencyFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 2,
})

function getRecordKey(record: OperationRecord): number {
  return record.id
}

function jumpTo(row: number): void {
  if (!Number.isFinite(row)) return
  const target = Math.max(1, Math.min(Math.floor(row), records.length))
  listRef.value?.scrollToIndex(target - 1, 'start')
}
</script>

<template>
  <div class="virtual-list-page">
    <h1>虚拟列表 VirtualList</h1>
    <p class="virtual-list-page__intro">
      仅渲染可视区与缓冲区中的行，支持动态行高、10 万条数据和按索引快速定位。
    </p>

    <dl class="virtual-list-stats">
      <div>
        <dt>数据总量</dt>
        <dd>100,000</dd>
      </div>
      <div>
        <dt>当前 DOM 行数</dt>
        <dd>{{ renderedCount }}</dd>
      </div>
      <div>
        <dt>高度查询复杂度</dt>
        <dd>O(log n)</dd>
      </div>
    </dl>

    <section class="virtual-list-demo" aria-label="运营订单明细">
      <div class="virtual-list-demo__heading">
        <div>
          <h2>运营订单明细</h2>
          <p>每 3 行包含一条扩展信息，滚动时自动测量并缓存实际行高。</p>
        </div>
        <div class="virtual-list-demo__controls">
          <label for="virtual-list-jump">跳转至行号</label>
          <input
            id="virtual-list-jump"
            v-model.number="jumpIndex"
            type="number"
            min="1"
            max="100000"
            @keyup.enter="jumpTo(jumpIndex)"
          />
          <el-like-button type="primary" @click="jumpTo(jumpIndex)">定位</el-like-button>
          <el-like-button @click="jumpTo(1)">回到顶部</el-like-button>
        </div>
      </div>

      <div class="virtual-list-demo__table-header" aria-hidden="true">
        <span>订单</span>
        <span>区域 / 渠道</span>
        <span>实收金额</span>
        <span>履约状态</span>
      </div>

      <el-like-virtual-list
        ref="listRef"
        :items="records"
        :get-key="getRecordKey"
        :estimated-item-height="92"
        :overscan="8"
        :height="540"
        @range-change="renderedRange = $event"
      >
        <template #item="{ item, index }">
          <article class="virtual-list-record">
            <div class="virtual-list-record__order">
              <strong>{{ item.orderNo }}</strong>
              <span>第 {{ index + 1 }} 行</span>
            </div>
            <div class="virtual-list-record__channel">
              <strong>{{ item.region }}</strong>
              <span>{{ item.channel }}</span>
            </div>
            <strong class="virtual-list-record__revenue">
              {{ currencyFormatter.format(item.revenue) }}
            </strong>
            <div>
              <span class="virtual-list-record__status" :data-status="item.status">
                {{ item.status }}
              </span>
            </div>
            <p v-if="item.note" class="virtual-list-record__note">{{ item.note }}</p>
          </article>
        </template>
      </el-like-virtual-list>

      <footer class="virtual-list-demo__footer">
        <span>可视区上下各缓冲 8 行</span>
        <span>当前范围：{{ renderedRange.startIndex }}–{{ renderedRange.endIndex }}</span>
      </footer>
    </section>
  </div>
</template>

<style scoped lang="scss">
.virtual-list-page__intro {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
}

.virtual-list-stats {
  display: flex;
  gap: 40px;
  margin: 24px 0;

  dt {
    margin-bottom: 6px;
    color: var(--el-text-color-secondary);
    font-size: var(--el-font-size-extra-small);
  }

  dd {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: var(--el-font-size-extra-large);
    font-weight: 600;
  }
}

.virtual-list-demo {
  overflow: hidden;
  border: var(--el-border);
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-bg-color);

  &__heading {
    display: flex;
    gap: 24px;
    align-items: center;
    justify-content: space-between;
    padding: 20px;

    h2 {
      margin: 0 0 6px;
      font-size: var(--el-font-size-large);
    }

    p {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: var(--el-font-size-small);
    }
  }

  &__controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;

    label {
      color: var(--el-text-color-regular);
      font-size: var(--el-font-size-small);
    }

    input {
      box-sizing: border-box;
      width: 110px;
      height: 32px;
      padding: 0 10px;
      color: var(--el-text-color-primary);
      border: var(--el-border);
      border-radius: var(--el-border-radius-base);
      outline: none;

      &:focus {
        border-color: var(--el-color-primary);
      }
    }
  }

  &__table-header,
  .virtual-list-record {
    display: grid;
    grid-template-columns: minmax(180px, 1.5fr) minmax(130px, 1fr) minmax(120px, 0.8fr) 100px;
    gap: 20px;
    align-items: center;
  }

  &__table-header {
    padding: 12px 20px;
    color: var(--el-text-color-secondary);
    border-top: 1px solid var(--el-border-color-lighter);
    border-bottom: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-light);
    font-size: var(--el-font-size-extra-small);
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    padding: 12px 20px;
    color: var(--el-text-color-secondary);
    border-top: 1px solid var(--el-border-color-lighter);
    font-size: var(--el-font-size-extra-small);
  }
}

.virtual-list-record {
  min-height: 72px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  font-size: var(--el-font-size-base);

  &:hover {
    background-color: var(--el-fill-color-extra-light);
  }

  &__order,
  &__channel {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;

    span {
      overflow: hidden;
      color: var(--el-text-color-secondary);
      font-size: var(--el-font-size-extra-small);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__revenue {
    font-weight: var(--el-font-weight-primary);
  }

  &__status {
    display: inline-flex;
    padding: 4px 9px;
    color: var(--el-color-success);
    border-radius: var(--el-border-radius-round);
    background-color: var(--el-color-success-light-9);
    font-size: var(--el-font-size-extra-small);
    white-space: nowrap;

    &[data-status='履约中'] {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    &[data-status='待处理'] {
      color: var(--el-color-warning);
      background-color: var(--el-color-warning-light-9);
    }
  }

  &__note {
    grid-column: 1 / -1;
    margin: 0;
    padding: 8px 12px;
    color: var(--el-text-color-regular);
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-fill-color-light);
    font-size: var(--el-font-size-extra-small);
    line-height: 1.6;
  }
}

@media (max-width: 800px) {
  .virtual-list-demo__heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .virtual-list-demo__table-header,
  .virtual-list-record {
    grid-template-columns: minmax(160px, 1.5fr) minmax(100px, 1fr) 110px;
  }

  .virtual-list-demo__table-header span:last-child,
  .virtual-list-record > div:last-of-type {
    display: none;
  }
}
</style>
