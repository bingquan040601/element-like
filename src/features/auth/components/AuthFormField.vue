<script setup lang="ts">
import { useId } from 'vue'

interface Props {
  label: string
  name: string
  modelValue: string
  type?: 'text' | 'password' | 'email'
  autocomplete?: string
  placeholder?: string
  maxlength?: number
  required?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  autocomplete: 'off',
  placeholder: '',
  required: true,
  error: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = useId()
const errorId = `${inputId}-error`

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="auth-form-field">
    <label class="auth-form-field__label" :for="inputId">{{ props.label }}</label>
    <input
      :id="inputId"
      class="auth-form-field__input"
      :class="{ 'is-invalid': props.error }"
      :name="props.name"
      :type="props.type"
      :value="props.modelValue"
      :autocomplete="props.autocomplete"
      :placeholder="props.placeholder"
      :maxlength="props.maxlength"
      :aria-invalid="Boolean(props.error)"
      :aria-describedby="props.error ? errorId : undefined"
      :required="props.required"
      @input="handleInput"
    />
    <p v-if="props.error" :id="errorId" class="auth-form-field__error" role="alert">
      {{ props.error }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.auth-form-field {
  display: grid;
  gap: 8px;

  &__label {
    color: var(--el-text-color-primary);
    font-weight: var(--el-font-weight-primary);
  }

  &__input {
    box-sizing: border-box;
    width: 100%;
    height: 42px;
    padding: 0 12px;
    border: var(--el-border);
    border-radius: var(--el-border-radius-base);
    outline: none;
    background-color: var(--el-bg-color);
    color: var(--el-text-color-regular);
    font: inherit;
    transition:
      border-color var(--el-transition-duration-fast),
      box-shadow var(--el-transition-duration-fast);

    &::placeholder {
      color: var(--el-text-color-placeholder);
    }

    &:focus {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 3px var(--el-color-primary-light-8);
    }

    &.is-invalid {
      border-color: var(--el-color-danger);
    }
  }

  &__error {
    margin: -2px 0 0;
    color: var(--el-color-danger);
    font-size: var(--el-font-size-extra-small);
    line-height: 1.5;
  }
}
</style>
