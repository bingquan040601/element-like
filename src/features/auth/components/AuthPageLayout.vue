<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()
</script>

<template>
  <main class="auth-page">
    <section class="auth-card" :aria-label="title">
      <div class="auth-brand">
        <span class="auth-brand__logo" aria-hidden="true"></span>
        <span>Element-Like</span>
      </div>

      <div class="auth-card__heading">
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>

      <slot />

      <div v-if="$slots.footer" class="auth-card__footer">
        <slot name="footer" />
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.auth-page {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 32px 16px;
  background:
    radial-gradient(circle at 15% 15%, var(--el-color-primary-light-8), transparent 38%),
    radial-gradient(circle at 85% 85%, var(--el-color-primary-light-9), transparent 42%),
    var(--el-bg-color-page);
}

.auth-card {
  box-sizing: border-box;
  width: min(100%, 440px);
  padding: 36px;
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 12px;
  background-color: var(--el-bg-color);
  box-shadow: 0 16px 48px rgb(0 0 0 / 8%);

  &__heading {
    margin: 32px 0 24px;

    h1 {
      margin: 0 0 8px;
      color: var(--el-text-color-primary);
      font-size: 28px;
      font-weight: 600;
      line-height: 1.4;
    }

    p {
      margin: 0;
      color: var(--el-text-color-secondary);
    }
  }

  &__footer {
    margin-top: 24px;
    color: var(--el-text-color-secondary);
    text-align: center;

    a {
      margin-left: 6px;
    }
  }
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--el-text-color-primary);
  font-size: var(--el-font-size-large);
  font-weight: 600;

  &__logo {
    width: 24px;
    height: 24px;
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-color-primary);
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 28px 24px;
  }
}
</style>
