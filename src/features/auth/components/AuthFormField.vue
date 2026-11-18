<template>
  <div class="auth-form-field">
    <label class="auth-form-field__label" :for="inputId">{{ props.label }}</label>
    <input
      :id="inputId"
      class="auth-form-field__input"
      :class="{ 'is-invalid': props.error, 'is-shaking': isShaking }"
      :name="props.name"
      :type="props.type"
      :value="props.modelValue"
      :autocomplete="props.autocomplete"
      :placeholder="props.placeholder"
      :maxlength="props.maxlength"
      :aria-invalid="Boolean(props.error)"
      :aria-describedby="props.error ? errorId : undefined"
      :required="props.required"
      :disabled="props.disabled"
      @animationend="isShaking = false"
      @input="handleInput"
    />
    <p v-if="props.error" :id="errorId" class="auth-form-field__error" role="alert">
      {{ props.error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, useId, watch } from 'vue'

interface Props {
  label: string
  name: string
  modelValue: string
  type?: 'text' | 'password' | 'email'
  autocomplete?: string
  placeholder?: string
  maxlength?: number
  required?: boolean
  disabled?: boolean
  error?: string
  shakeKey?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  autocomplete: 'off',
  placeholder: '',
  required: true,
  disabled: false,
  error: '',
  shakeKey: 0,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = useId()
const errorId = `${inputId}-error`
const isShaking = ref(false)

watch(
  () => props.shakeKey,
  async () => {
    if (!props.error) return
    isShaking.value = false
    await nextTick()
    isShaking.value = Boolean(props.error)
  },
)

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<style scoped lang="scss">
.auth-form-field {
  display: grid;
  gap: 7px;

  &__label {
    color: var(--el-text-color-primary);
    font-size: var(--el-font-size-small);
    font-weight: var(--el-font-weight-primary);
    line-height: 20px;
  }

  &__input {
    box-sizing: border-box;
    width: 100%;
    height: 44px;
    padding: 0 14px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    outline: none;
    background-color: var(--el-fill-color-extra-light);
    color: var(--el-text-color-primary);
    caret-color: var(--el-color-primary);
    font: inherit;
    transition:
      border-color var(--el-transition-duration-fast),
      background-color var(--el-transition-duration-fast),
      box-shadow var(--el-transition-duration-fast);

    &::placeholder {
      color: var(--el-text-color-placeholder);
    }

    &:hover:not(:disabled):not(.is-invalid) {
      border-color: var(--el-color-primary-light-5);
    }

    &:focus {
      border-color: var(--el-color-primary);
      background-color: var(--el-bg-color);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--el-color-primary) 12%, transparent);
    }

    &.is-invalid {
      border-color: var(--el-color-danger);

      &:focus {
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--el-color-danger) 10%, transparent);
      }
    }

    &:disabled {
      background-color: var(--el-disabled-bg-color);
      color: var(--el-disabled-text-color);
      cursor: not-allowed;
    }

    &.is-shaking {
      animation: auth-field-shake 360ms cubic-bezier(0.36, 0.07, 0.19, 0.97);
    }
  }

  &__error {
    margin: 0;
    color: var(--el-color-danger);
    font-size: var(--el-font-size-extra-small);
    line-height: 1.5;
  }
}

@keyframes auth-field-shake {
  0%,
  100% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-5px);
  }

  40% {
    transform: translateX(4px);
  }

  60% {
    transform: translateX(-3px);
  }

  80% {
    transform: translateX(2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-form-field__input.is-shaking {
    animation: none;
  }
}
</style>
