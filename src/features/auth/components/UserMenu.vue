<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import type { DropdownMenuOption } from '@/components/Dropdown/props'
import { useAuthStore } from '@/stores/auth'
import { getUserInitial } from '../utils'
import ChangePasswordDialog from './ChangePasswordDialog.vue'
import ProfileDialog from './ProfileDialog.vue'

type UserDialog = 'profile' | 'password'

const menuOptions: DropdownMenuOption[] = [
  { label: '个人信息', value: 'profile', icon: 'user' },
  { label: '修改密码', value: 'password', icon: 'key' },
  { label: '退出登录', value: 'logout', icon: 'right-from-bracket', divided: true },
]

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const activeDialog = ref<UserDialog | null>(null)
const loggingOut = ref(false)

const handleLogout = async () => {
  if (loggingOut.value) return
  loggingOut.value = true
  const redirect = route.fullPath
  authStore.logout()
  try {
    await router.replace({ name: 'login', query: { redirect } })
  } finally {
    loggingOut.value = false
  }
}

const handleSelect = (option: DropdownMenuOption) => {
  if (option.value === 'profile' || option.value === 'password') {
    activeDialog.value = option.value
  } else if (option.value === 'logout') {
    void handleLogout()
  }
}
</script>

<template>
  <div v-if="user" class="user-menu">
    <el-like-dropdown
      :menu-options="menuOptions"
      placement="bottom"
      popper-class="user-menu__dropdown"
      hide-after-click
      @select="handleSelect"
    >
      <button
        class="user-menu__trigger"
        type="button"
        aria-label="打开用户菜单"
        aria-haspopup="menu"
        :disabled="loggingOut"
      >
        <img v-if="user.avatarUrl" class="user-menu__avatar" :src="user.avatarUrl" alt="" />
        <span v-else class="user-menu__avatar" aria-hidden="true">
          {{ getUserInitial(user) }}
        </span>
        <span class="user-menu__name">{{ user.nickname || user.username }}</span>
        <el-like-icon class="user-menu__arrow" icon="angle-down" size="xs" aria-hidden="true" />
      </button>
    </el-like-dropdown>

    <ProfileDialog :visible="activeDialog === 'profile'" @close="activeDialog = null" />
    <ChangePasswordDialog :visible="activeDialog === 'password'" @close="activeDialog = null" />
  </div>
</template>

<style scoped lang="scss">
.user-menu {
  flex-shrink: 0;
  margin-left: 16px;

  &__trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 4px 8px 4px 4px;
    border: 1px solid transparent;
    border-radius: var(--el-border-radius-round);
    outline: none;
    background-color: transparent;
    color: var(--el-text-color-regular);
    font: inherit;
    cursor: pointer;
    transition:
      background-color var(--el-transition-duration-fast),
      border-color var(--el-transition-duration-fast);

    &:hover,
    &:focus-visible {
      border-color: var(--el-border-color-lighter);
      background-color: var(--el-fill-color-light);
    }

    &:focus-visible {
      outline: 2px solid var(--el-color-primary-light-5);
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.6;
      cursor: wait;
    }
  }

  &__avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: var(--el-border-radius-circle);
    background-color: var(--el-color-primary);
    color: var(--el-color-white);
    font-size: var(--el-font-size-small);
    font-weight: 600;
    object-fit: cover;
  }

  &__name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__arrow {
    color: var(--el-text-color-secondary);
  }
}

@media (max-width: 640px) {
  .user-menu {
    margin-left: 8px;

    &__name {
      display: none;
    }
  }
}
</style>
