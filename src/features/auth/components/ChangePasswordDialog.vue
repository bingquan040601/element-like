<template>
  <el-like-dialog
    :visible="props.visible"
    title="修改密码"
    width="460px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="succeeded" class="password-success" role="status">
      <el-like-icon icon="circle-check" type="success" size="2x" aria-hidden="true" />
      <h3>密码修改成功</h3>
      <p>登录状态已更新，下次登录请使用新密码。</p>
    </div>

    <form v-else :id="formId" class="password-form" novalidate @submit.prevent="handleSubmit">
      <p v-if="formError" class="password-form__error" role="alert">{{ formError }}</p>
      <AuthFormField
        v-model="form.currentPassword"
        label="当前密码"
        name="current-password"
        type="password"
        autocomplete="current-password"
        placeholder="请输入当前密码"
        :error="errors.currentPassword"
      />
      <AuthFormField
        v-model="form.newPassword"
        label="新密码"
        name="new-password"
        type="password"
        autocomplete="new-password"
        placeholder="8-72 位"
        :maxlength="72"
        :error="errors.newPassword"
      />
      <AuthFormField
        v-model="form.confirmPassword"
        label="确认新密码"
        name="confirm-password"
        type="password"
        autocomplete="new-password"
        placeholder="请再次输入新密码"
        :maxlength="72"
        :error="errors.confirmPassword"
      />
    </form>

    <template #footer>
      <div v-if="succeeded" class="password-form__actions">
        <el-like-button type="primary" @click="handleClose">完成</el-like-button>
      </div>
      <div v-else class="password-form__actions">
        <el-like-button :disabled="submitting" @click="handleClose">取消</el-like-button>
        <el-like-button type="primary" native-type="submit" :form="formId" :loading="submitting">
          确认修改
        </el-like-button>
      </div>
    </template>
  </el-like-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, useId, watch } from 'vue'
import { ApiError } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import { validateNewPassword } from '../passwordRules'
import AuthFormField from './AuthFormField.vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const formId = `change-password-${useId()}`
const form = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const errors = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const formError = ref('')
const submitting = ref(false)
const succeeded = ref(false)

const resetForm = () => {
  Object.assign(form, { currentPassword: '', newPassword: '', confirmPassword: '' })
  Object.assign(errors, { currentPassword: '', newPassword: '', confirmPassword: '' })
  formError.value = ''
  submitting.value = false
  succeeded.value = false
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) resetForm()
  },
)

const validate = (): boolean => {
  Object.assign(errors, { currentPassword: '', newPassword: '', confirmPassword: '' })
  formError.value = ''

  if (!form.currentPassword) errors.currentPassword = '请输入当前密码'
  errors.newPassword = form.newPassword ? validateNewPassword(form.newPassword) : '请输入新密码'
  if (!errors.newPassword && form.newPassword === form.currentPassword) {
    errors.newPassword = '新密码不能与当前密码相同'
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = '请再次输入新密码'
  } else if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = '两次输入的新密码不一致'
  }

  return !errors.currentPassword && !errors.newPassword && !errors.confirmPassword
}

const applyApiError = (error: ApiError): void => {
  if (error.code === 'INVALID_OLD_PASSWORD') {
    errors.currentPassword = error.message
    return
  }
  if (error.code === 'SAME_PASSWORD') {
    errors.newPassword = error.message
    return
  }

  let hasFieldError = false
  for (const detail of error.details) {
    if (detail.field === 'oldPassword') {
      errors.currentPassword = detail.message
      hasFieldError = true
    } else if (detail.field === 'newPassword') {
      errors.newPassword = detail.message
      hasFieldError = true
    }
  }
  if (!hasFieldError) formError.value = error.message
}

const handleSubmit = async () => {
  if (submitting.value || !validate()) return

  submitting.value = true
  try {
    await authStore.changePassword({
      oldPassword: form.currentPassword,
      newPassword: form.newPassword,
    })
    Object.assign(form, { currentPassword: '', newPassword: '', confirmPassword: '' })
    succeeded.value = true
  } catch (error) {
    if (error instanceof ApiError) applyApiError(error)
    else formError.value = '密码修改失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  if (!submitting.value) emit('close')
}
</script>

<style scoped lang="scss">
.password-form {
  display: grid;
  gap: 18px;

  &__error {
    margin: 0;
    padding: 10px 12px;
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-color-danger-light-9);
    color: var(--el-color-danger);
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.password-success {
  padding: 12px 0 20px;
  text-align: center;

  .el-like-icon {
    color: var(--el-color-success);
  }

  h3 {
    margin: 16px 0 8px;
    color: var(--el-text-color-primary);
  }

  p {
    margin: 0;
    color: var(--el-text-color-secondary);
  }
}
</style>
