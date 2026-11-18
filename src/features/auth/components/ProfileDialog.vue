<template>
  <el-like-dialog
    :visible="props.visible"
    title="个人信息"
    width="720px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="user" class="profile">
      <aside class="profile__summary" aria-label="账号摘要">
        <img v-if="user.avatarUrl" class="profile__avatar" :src="user.avatarUrl" alt="" />
        <span v-else class="profile__avatar" aria-hidden="true">{{ getUserInitial(user) }}</span>
        <div class="profile__identity">
          <h3 class="profile__name">{{ user.nickname || user.username }}</h3>
          <span class="profile__username">@{{ user.username }}</span>
        </div>
        <p class="profile__summary-note">管理你的账号资料与联系方式，变更会同步到当前登录状态。</p>
      </aside>

      <form :id="formId" class="profile__form" novalidate @submit.prevent="handleSubmit">
        <div class="profile__section-heading">
          <h3>基本资料</h3>
          <p>昵称和邮箱可修改，其他账号信息由系统维护。</p>
        </div>

        <p v-if="formError" class="profile__error" role="alert">{{ formError }}</p>

        <div class="profile__fields">
          <AuthFormField
            v-model="form.nickname"
            label="昵称"
            name="nickname"
            autocomplete="nickname"
            placeholder="请输入昵称"
            :maxlength="50"
            :disabled="submitting"
            :error="errors.nickname"
          />
          <AuthFormField
            v-model="form.email"
            label="邮箱"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="请输入邮箱"
            :maxlength="255"
            :disabled="submitting"
            :error="errors.email"
          />
        </div>

        <section class="profile__readonly" aria-label="只读账号信息">
          <div class="profile__readonly-heading">
            <h3>账号信息</h3>
            <span>不可修改</span>
          </div>
          <dl class="profile__details">
            <div class="profile__row">
              <dt>用户名</dt>
              <dd>{{ user.username }}</dd>
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
        </section>
      </form>
    </div>

    <template #footer>
      <div class="profile__footer">
        <span class="profile__footer-hint">
          {{ hasChanges ? '资料已变更，记得保存' : '昵称和邮箱可编辑' }}
        </span>
        <div class="profile__actions">
          <el-like-button :disabled="submitting" @click="handleClose">取消</el-like-button>
          <el-like-button
            type="primary"
            native-type="submit"
            :form="formId"
            :disabled="!hasChanges || submitting"
            :loading="submitting"
          >
            保存修改
          </el-like-button>
        </div>
      </div>
    </template>
  </el-like-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, useId, watch } from 'vue'
import { ApiError } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import { getUserInitial } from '../utils'
import AuthFormField from './AuthFormField.vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const formId = `profile-${useId()}`
const form = reactive({ nickname: '', email: '' })
const errors = reactive({ nickname: '', email: '' })
const formError = ref('')
const submitting = ref(false)

const hasChanges = computed(() => {
  if (!user.value) return false
  return (
    form.nickname.trim() !== user.value.nickname ||
    form.email.trim().toLowerCase() !== user.value.email.toLowerCase()
  )
})

const resetForm = () => {
  Object.assign(form, {
    nickname: user.value?.nickname ?? '',
    email: user.value?.email ?? '',
  })
  Object.assign(errors, { nickname: '', email: '' })
  formError.value = ''
  submitting.value = false
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) resetForm()
  },
  { immediate: true },
)

const validate = (): boolean => {
  Object.assign(errors, { nickname: '', email: '' })
  formError.value = ''

  const nickname = form.nickname.trim()
  const email = form.email.trim()
  if (!nickname) errors.nickname = '请输入昵称'
  else if (nickname.length > 50) errors.nickname = '昵称不能超过 50 位'
  if (!email) errors.email = '请输入邮箱'
  else if (email.length > 255) errors.email = '邮箱不能超过 255 位'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = '请输入有效的邮箱地址'

  return !errors.nickname && !errors.email
}

const applyApiError = (error: ApiError): void => {
  let hasFieldError = false
  for (const detail of error.details) {
    if (detail.field === 'nickname' || detail.field === 'email') {
      errors[detail.field] = detail.message
      hasFieldError = true
    }
  }
  if (error.code === 'EMAIL_EXISTS') {
    errors.email = error.message
    hasFieldError = true
  }
  if (!hasFieldError) formError.value = error.message
}

const handleSubmit = async () => {
  if (submitting.value || !hasChanges.value || !validate()) return

  submitting.value = true
  try {
    await authStore.updateProfile({ nickname: form.nickname, email: form.email })
    emit('close')
  } catch (error) {
    if (error instanceof ApiError) applyApiError(error)
    else formError.value = '资料保存失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  if (!submitting.value) emit('close')
}

const formatDate = (value: string): string => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
</script>

<style scoped lang="scss">
.profile {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  margin: -8px -20px -20px;

  &__summary {
    min-width: 0;
    padding: 32px 24px;
    border-right: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-extra-light);
    text-align: center;
  }

  &__avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border: 4px solid var(--el-bg-color);
    border-radius: var(--el-border-radius-circle);
    background-color: var(--el-color-primary-light-8);
    color: var(--el-color-primary);
    font-size: 30px;
    font-weight: 600;
    object-fit: cover;
    box-shadow: 0 0 0 1px var(--el-border-color-lighter);
  }

  &__identity {
    min-width: 0;
    margin-top: 16px;
  }

  &__name {
    margin: 0 0 6px;
    color: var(--el-text-color-primary);
    font-size: var(--el-font-size-large);
    overflow-wrap: anywhere;
  }

  &__username {
    display: block;
    overflow: hidden;
    color: var(--el-text-color-secondary);
    font-size: var(--el-font-size-small);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__summary-note {
    margin: 28px 0 0;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    color: var(--el-text-color-secondary);
    font-size: var(--el-font-size-extra-small);
    line-height: 1.8;
    text-align: left;
  }

  &__form {
    min-width: 0;
    padding: 24px;
  }

  &__section-heading {
    margin-bottom: 18px;

    h3 {
      margin: 0 0 4px;
      color: var(--el-text-color-primary);
      font-size: var(--el-font-size-medium);
    }

    p {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: var(--el-font-size-small);
    }
  }

  &__error {
    margin: 0 0 16px;
    padding: 10px 12px;
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-color-danger-light-9);
    color: var(--el-color-danger);
    font-size: var(--el-font-size-small);
  }

  &__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  &__readonly {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  &__readonly-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    h3 {
      margin: 0;
      color: var(--el-text-color-primary);
      font-size: var(--el-font-size-base);
    }

    span {
      padding: 2px 8px;
      border-radius: var(--el-border-radius-round);
      background-color: var(--el-fill-color-light);
      color: var(--el-text-color-secondary);
      font-size: var(--el-font-size-extra-small);
    }
  }

  &__details {
    display: grid;
    gap: 8px;
    margin: 12px 0 0;
  }

  &__row {
    display: grid;
    grid-template-columns: 72px minmax(0, 1fr);
    gap: 12px;
    padding: 8px 10px;
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-fill-color-light);

    dt {
      color: var(--el-text-color-secondary);
    }

    dd {
      min-width: 0;
      margin: 0;
      color: var(--el-text-color-regular);
      overflow-wrap: anywhere;
    }
  }

  &__footer,
  &__actions {
    display: flex;
    align-items: center;
  }

  &__footer {
    justify-content: space-between;
    gap: 16px;
  }

  &__footer-hint {
    color: var(--el-text-color-secondary);
    font-size: var(--el-font-size-extra-small);
  }

  &__actions {
    flex-shrink: 0;
    gap: 12px;
  }
}

@media (max-width: 640px) {
  .profile {
    grid-template-columns: minmax(0, 1fr);

    &__summary {
      display: grid;
      grid-template-columns: 64px minmax(0, 1fr);
      align-items: center;
      gap: 16px;
      padding: 20px;
      border-right: 0;
      border-bottom: 1px solid var(--el-border-color-lighter);
      text-align: left;
    }

    &__avatar {
      width: 64px;
      height: 64px;
      font-size: var(--el-font-size-extra-large);
    }

    &__identity {
      margin-top: 0;
    }

    &__summary-note {
      display: none;
    }

    &__form {
      padding: 20px;
    }
  }
}

@media (max-width: 480px) {
  .profile {
    &__fields {
      grid-template-columns: minmax(0, 1fr);
    }

    &__footer-hint {
      display: none;
    }

    &__footer {
      justify-content: flex-end;
    }
  }
}
</style>
