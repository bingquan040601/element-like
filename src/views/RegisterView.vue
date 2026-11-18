<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError } from '@/api/http'
import AuthFormField from '@/features/auth/components/AuthFormField.vue'
import AuthPageLayout from '@/features/auth/components/AuthPageLayout.vue'
import { getSafeRedirect, validateNewPassword } from '@/features/auth'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const form = reactive({
  username: '',
  email: '',
  password: '',
  nickname: '',
  confirmPassword: '',
  remember: true,
})
const errors = reactive({ username: '', email: '', password: '', nickname: '' })
const formError = ref('')
const submitting = ref(false)

const validate = (): boolean => {
  Object.assign(errors, { username: '', email: '', password: '', nickname: '' })
  formError.value = ''

  if (!/^[A-Za-z][A-Za-z0-9_]{2,49}$/.test(form.username)) {
    errors.username = '用户名需为 3-50 位，以字母开头，仅含字母、数字、下划线'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = '请输入有效的邮箱地址'
  }
  errors.password = validateNewPassword(form.password)
  if (form.nickname.trim().length > 50) errors.nickname = '昵称不能超过 50 位'
  if (form.confirmPassword !== form.password) formError.value = '两次输入的密码不一致'

  return !Object.values(errors).some(Boolean) && !formError.value
}

const applyApiErrors = (error: ApiError): void => {
  let hasFieldError = false
  for (const detail of error.details) {
    if (detail.field in errors) {
      errors[detail.field as keyof typeof errors] = detail.message
      hasFieldError = true
    }
  }
  if (error.code === 'USERNAME_EXISTS') {
    errors.username = error.message
    hasFieldError = true
  } else if (error.code === 'EMAIL_EXISTS') {
    errors.email = error.message
    hasFieldError = true
  }
  if (!hasFieldError) formError.value = error.message
}

const handleSubmit = async () => {
  if (submitting.value || !validate()) return
  submitting.value = true
  formError.value = ''
  try {
    await authStore.register({
      username: form.username,
      email: form.email,
      password: form.password,
      nickname: form.nickname,
      remember: form.remember,
    })
    await router.replace(getSafeRedirect(route.query.redirect))
  } catch (error) {
    if (error instanceof ApiError) applyApiErrors(error)
    else formError.value = '注册失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthPageLayout title="创建账号" subtitle="注册成功后自动登录">
    <form class="register-form" novalidate @submit.prevent="handleSubmit">
      <p v-if="formError" class="register-form__error" role="alert">{{ formError }}</p>

      <AuthFormField
        v-model="form.username"
        label="用户名"
        name="username"
        autocomplete="username"
        placeholder="3-50 位，字母开头"
        :maxlength="50"
        :error="errors.username"
      />
      <AuthFormField
        v-model="form.email"
        label="邮箱"
        name="email"
        type="email"
        autocomplete="email"
        placeholder="请输入邮箱"
        :error="errors.email"
      />
      <AuthFormField
        v-model="form.nickname"
        label="昵称（选填）"
        name="nickname"
        autocomplete="nickname"
        placeholder="默认使用用户名"
        :maxlength="50"
        :required="false"
        :error="errors.nickname"
      />
      <AuthFormField
        v-model="form.password"
        label="密码"
        name="new-password"
        type="password"
        autocomplete="new-password"
        placeholder="8-72 位"
        :maxlength="72"
        :error="errors.password"
      />
      <AuthFormField
        v-model="form.confirmPassword"
        label="确认密码"
        name="confirm-password"
        type="password"
        autocomplete="new-password"
        placeholder="请再次输入密码"
        :maxlength="72"
      />

      <label class="register-form__remember">
        <input v-model="form.remember" type="checkbox" name="remember" />
        <span>保持登录</span>
      </label>

      <el-like-button
        class="register-form__submit"
        type="primary"
        size="large"
        native-type="submit"
        :loading="submitting"
      >
        {{ submitting ? '注册中…' : '注册并登录' }}
      </el-like-button>
    </form>

    <template #footer>
      已有账号？
      <RouterLink :to="{ name: 'login', query: route.query }">返回登录</RouterLink>
    </template>
  </AuthPageLayout>
</template>

<style scoped lang="scss">
.register-form {
  display: grid;
  gap: 16px;

  &__error {
    margin: 0;
    padding: 10px 12px;
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-color-danger-light-9);
    color: var(--el-color-danger);
    line-height: 1.5;
  }

  &__remember {
    display: inline-flex;
    align-items: center;
    justify-self: start;
    gap: 8px;
    color: var(--el-text-color-regular);
    cursor: pointer;

    input {
      width: 15px;
      height: 15px;
      margin: 0;
      accent-color: var(--el-color-primary);
    }
  }

  &__submit {
    width: 100%;
    margin-top: 4px;
  }
}
</style>
