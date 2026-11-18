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
const submitting = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  if (submitting.value) return
  errorMessage.value = ''
  if (!form.account.trim() || !form.password) {
    errorMessage.value = '请输入用户名 / 邮箱和密码'
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
      />
      <AuthFormField
        v-model="form.password"
        label="密码"
        name="password"
        type="password"
        autocomplete="current-password"
        placeholder="请输入密码"
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
  gap: 20px;

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
    margin-top: -4px;
    color: var(--el-text-color-regular);
    cursor: pointer;

    input {
      width: 15px;
      height: 15px;
      margin: 0;
      accent-color: var(--el-color-primary);
      cursor: pointer;
    }
  }

  &__submit {
    width: 100%;
  }
}
</style>
