<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { getUserInitial } from '../utils'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const formatDate = (value: string): string => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
</script>

<template>
  <el-like-dialog
    :visible="visible"
    title="个人信息"
    width="440px"
    :close-on-click-modal="false"
    @close="emit('close')"
  >
    <div v-if="user" class="profile">
      <div class="profile__summary">
        <img v-if="user.avatarUrl" class="profile__avatar" :src="user.avatarUrl" alt="" />
        <span v-else class="profile__avatar" aria-hidden="true">{{ getUserInitial(user) }}</span>
        <div>
          <h3 class="profile__name">{{ user.nickname || user.username }}</h3>
          <span class="profile__username">@{{ user.username }}</span>
        </div>
      </div>

      <dl class="profile__details">
        <div class="profile__row">
          <dt>用户名</dt>
          <dd>{{ user.username }}</dd>
        </div>
        <div class="profile__row">
          <dt>昵称</dt>
          <dd>{{ user.nickname || user.username }}</dd>
        </div>
        <div class="profile__row">
          <dt>邮箱</dt>
          <dd>{{ user.email }}</dd>
        </div>
        <div class="profile__row">
          <dt>用户 ID</dt>
          <dd>{{ user.id }}</dd>
        </div>
        <div class="profile__row">
          <dt>注册时间</dt>
          <dd>{{ formatDate(user.createdAt) }}</dd>
        </div>
      </dl>
    </div>

    <template #footer>
      <el-like-button type="primary" @click="emit('close')">关闭</el-like-button>
    </template>
  </el-like-dialog>
</template>

<style scoped lang="scss">
.profile__summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.profile__avatar {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--el-border-radius-circle);
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-size: var(--el-font-size-extra-large);
  font-weight: 600;
  object-fit: cover;
}

.profile__name {
  margin: 0 0 6px;
  color: var(--el-text-color-primary);
}

.profile__username {
  color: var(--el-text-color-secondary);
  font-size: var(--el-font-size-small);
}

.profile__details {
  margin: 12px 0 0;
}

.profile__row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 16px;
  padding: 10px 0;

  dt {
    color: var(--el-text-color-secondary);
  }

  dd {
    min-width: 0;
    margin: 0;
    color: var(--el-text-color-primary);
    overflow-wrap: anywhere;
  }
}
</style>
