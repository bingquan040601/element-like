<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()
</script>

<template>
  <main class="auth-page">
    <section class="auth-card" :aria-label="title">
      <aside class="auth-visual">
        <div class="auth-brand">
          <span class="auth-brand__logo" aria-hidden="true"></span>
          <span>Element-Like</span>
        </div>

        <div class="auth-visual__intro">
          <p class="auth-visual__eyebrow">BUILD WITH CONFIDENCE</p>
          <h2>把复杂的界面，<br />做得更简单。</h2>
          <p>用一致的组件语言，构建清晰、优雅且可靠的用户体验。</p>
        </div>

        <div class="auth-visual__stack" aria-label="技术栈">
          <span>Vue 3</span>
          <span>TypeScript</span>
          <span>Vite</span>
        </div>
      </aside>

      <div class="auth-card__content">
        <div class="auth-brand auth-brand--mobile">
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
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.auth-page {
  position: relative;
  isolation: isolate;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  min-height: 100vh;
  min-height: 100dvh;
  padding: clamp(24px, 4vw, 56px) 20px;
  overflow: hidden;
  background:
    radial-gradient(circle at 8% 8%, rgb(64 158 255 / 14%), transparent 34%),
    radial-gradient(circle at 92% 88%, rgb(64 158 255 / 10%), transparent 36%),
    linear-gradient(135deg, #f8fbff 0%, #f1f5fa 100%);

  &::before {
    position: absolute;
    z-index: -1;
    inset: 0;
    background-image:
      linear-gradient(rgb(64 158 255 / 4%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(64 158 255 / 4%) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: linear-gradient(to bottom, black, transparent 78%);
    content: '';
    pointer-events: none;
  }
}

.auth-card {
  display: grid;
  grid-template-columns: minmax(300px, 0.9fr) minmax(460px, 1.1fr);
  width: min(100%, 960px);
  min-height: 680px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 85%);
  border-radius: 24px;
  background: var(--el-bg-color);
  box-shadow:
    0 32px 80px -28px rgb(30 64 120 / 26%),
    0 8px 24px rgb(30 64 120 / 6%);
  animation: auth-card-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    padding: 44px clamp(32px, 4vw, 52px);
  }

  &__heading {
    margin-bottom: 26px;

    h1 {
      margin: 0;
      color: var(--el-text-color-primary);
      font-size: 30px;
      font-weight: 600;
      line-height: 1.35;
      letter-spacing: -0.03em;
    }

    p {
      margin: 9px 0 0;
      color: var(--el-text-color-secondary);
      line-height: 1.6;
    }
  }

  &__footer {
    margin-top: 22px;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color-extra-light);
    color: var(--el-text-color-secondary);
    text-align: center;

    a {
      margin-left: 4px;
      border-radius: var(--el-border-radius-small);
      font-weight: var(--el-font-weight-primary);

      &:focus-visible {
        outline: 2px solid var(--el-color-primary-light-5);
        outline-offset: 3px;
      }
    }
  }
}

.auth-visual {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 42px 40px 38px;
  overflow: hidden;
  color: var(--el-color-white);
  background:
    radial-gradient(circle at 12% 90%, rgb(64 158 255 / 55%), transparent 42%),
    linear-gradient(145deg, #0b1f3a 0%, #123d6c 56%, #0969ae 115%);

  > * {
    position: relative;
    z-index: 1;
  }

  &::before {
    position: absolute;
    top: 14%;
    right: -190px;
    width: 380px;
    height: 380px;
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 50%;
    box-shadow:
      0 0 0 64px rgb(255 255 255 / 3%),
      0 0 0 128px rgb(255 255 255 / 2%);
    content: '';
    pointer-events: none;
  }

  &::after {
    position: absolute;
    right: 28px;
    bottom: 96px;
    width: 144px;
    height: 144px;
    background-image: radial-gradient(rgb(255 255 255 / 22%) 1px, transparent 1px);
    background-size: 16px 16px;
    mask-image: linear-gradient(135deg, transparent, black);
    content: '';
    pointer-events: none;
  }

  &__intro {
    margin: auto 0;
    padding: 64px 0 48px;

    h2 {
      margin: 0;
      color: var(--el-color-white);
      font-size: clamp(28px, 3vw, 36px);
      font-weight: 600;
      line-height: 1.45;
      letter-spacing: -0.04em;
    }

    > p:last-child {
      max-width: 280px;
      margin: 20px 0 0;
      color: rgb(226 240 255 / 72%);
      line-height: 1.9;
    }
  }

  &__eyebrow {
    margin: 0 0 18px;
    color: rgb(191 219 254 / 82%);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.5;
    letter-spacing: 0.18em;
  }

  &__stack {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 24px;
    border-top: 1px solid rgb(255 255 255 / 12%);

    span {
      padding: 6px 11px;
      border: 1px solid rgb(255 255 255 / 12%);
      border-radius: var(--el-border-radius-round);
      background: rgb(255 255 255 / 7%);
      color: rgb(255 255 255 / 78%);
      font-size: var(--el-font-size-extra-small);
      line-height: 1.5;
      backdrop-filter: blur(8px);
    }
  }
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  color: inherit;
  font-size: var(--el-font-size-large);
  font-weight: 600;
  letter-spacing: -0.02em;

  &__logo {
    position: relative;
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    border-radius: 9px;
    background: linear-gradient(135deg, #ffffff, #d9edff);
    box-shadow: 0 6px 18px rgb(0 0 0 / 16%);

    &::before,
    &::after {
      position: absolute;
      border-radius: 2px;
      background: #2f8de4;
      content: '';
    }

    &::before {
      top: 7px;
      left: 7px;
      width: 12px;
      height: 12px;
    }

    &::after {
      right: 6px;
      bottom: 6px;
      width: 7px;
      height: 7px;
      background: #78bfff;
    }
  }

  &--mobile {
    display: none;
    color: var(--el-text-color-primary);

    .auth-brand__logo {
      background: linear-gradient(135deg, var(--el-color-primary), #2479c7);
      box-shadow: 0 6px 16px rgb(64 158 255 / 24%);

      &::before {
        background: var(--el-color-white);
      }

      &::after {
        background: var(--el-color-primary-light-5);
      }
    }
  }
}

@keyframes auth-card-enter {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.99);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 820px) {
  .auth-card {
    grid-template-columns: minmax(0, 1fr);
    width: min(100%, 520px);
    min-height: 0;
    border-radius: 20px;

    &__content {
      padding: 36px 40px;
    }

    &__heading {
      margin: 30px 0 26px;
    }
  }

  .auth-visual {
    display: none;
  }

  .auth-brand--mobile {
    display: flex;
  }
}

@media (max-width: 480px) {
  .auth-page {
    padding: 20px 12px;
  }

  .auth-card__content {
    padding: 30px 24px;
  }

  .auth-card__heading h1 {
    font-size: 27px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-card {
    animation: none;
  }
}
</style>
