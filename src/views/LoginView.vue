<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError } from '@/api/http'
import AuthFormField from '@/features/auth/components/AuthFormField.vue'
import AuthPageLayout from '@/features/auth/components/AuthPageLayout.vue'
import { getSafeRedirect } from '@/features/auth'
import type { LoginCredentials } from '@/features/auth'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const form = reactive<LoginCredentials>({ account: '', password: '', remember: true })
const errors = reactive({ account: '', password: '' })
const validationAttempt = ref(0)
const submitting = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  if (submitting.value) return
  errorMessage.value = ''
  errors.account = form.account.trim() ? '' : '请输入用户名或邮箱'
  errors.password = form.password ? '' : '请输入密码'
  if (errors.account || errors.password) {
    validationAttempt.value += 1
    return
  }

  submitting.value = true
  try {
    await authStore.login(form)
    await router.replace(getSafeRedirect(route.query.redirect))
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '登录失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthPageLayout title="欢迎回来" subtitle="登录后探索 Vue 3 组件示例">
    <form class="login-form" novalidate @submit.prevent="handleSubmit">
      <p v-if="errorMessage" class="login-form__error" role="alert">{{ errorMessage }}</p>

      <AuthFormField
        v-model="form.account"
        label="用户名 / 邮箱"
        name="account"
        autocomplete="username"
        placeholder="请输入用户名或邮箱"
        :error="errors.account"
        :shake-key="validationAttempt"
      />
      <AuthFormField
        v-model="form.password"
        label="密码"
        name="password"
        type="password"
        autocomplete="current-password"
        placeholder="请输入密码"
        :error="errors.password"
        :shake-key="validationAttempt"
      />

      <label class="login-form__remember">
        <input v-model="form.remember" type="checkbox" name="remember" />
        <span>保持登录</span>
      </label>

      <el-like-button
        class="login-form__submit"
        type="primary"
        size="large"
        native-type="submit"
        :loading="submitting"
      >
        {{ submitting ? '登录中…' : '登 录' }}
      </el-like-button>
    </form>

    <template #footer>
      还没有账号？
      <RouterLink :to="{ name: 'register', query: route.query }">立即注册</RouterLink>
    </template>
  </AuthPageLayout>
</template>

<style scoped lang="scss">
.login-form {
  display: grid;
  gap: 18px;

  &__error {
    margin: 0;
    padding: 10px 12px;
    border: 1px solid var(--el-color-danger-light-5);
    border-radius: 8px;
    background-color: var(--el-color-danger-light-9);
    color: var(--el-color-danger);
    font-size: var(--el-font-size-small);
    line-height: 1.5;
  }

  &__remember {
    display: inline-flex;
    align-items: center;
    justify-self: start;
    gap: 8px;
    min-height: 20px;
    color: var(--el-text-color-regular);
    font-size: var(--el-font-size-small);
    cursor: pointer;

    input {
      width: 16px;
      height: 16px;
      margin: 0;
      accent-color: var(--el-color-primary);
      cursor: pointer;
    }
  }

  &__submit {
    width: 100%;
    height: 44px;
    margin-top: 2px;
    border-radius: 8px;
    box-shadow: 0 6px 16px rgb(64 158 255 / 20%);
    font-weight: var(--el-font-weight-primary);
    letter-spacing: 0.04em;
    transition:
      transform var(--el-transition-duration-fast),
      box-shadow var(--el-transition-duration-fast),
      background-color var(--el-transition-duration-fast),
      border-color var(--el-transition-duration-fast);

    &:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: 0 9px 20px rgb(64 158 255 / 26%);
    }

    &:not(:disabled):active {
      transform: translateY(0);
    }
  }
}
</style>
