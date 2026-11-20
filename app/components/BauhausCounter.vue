<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    label?: string
    ariaLabel?: string
    modelValue: number
    min?: number
    max?: number
    step?: number
    readonly?: boolean
    compact?: boolean
    ariaInvalid?: boolean
    ariaDescribedby?: string
    decrementLabel: string
    incrementLabel: string
  }>(),
  {
    label: undefined,
    ariaLabel: undefined,
    min: 1,
    max: 100,
    step: 1,
    readonly: false,
    compact: false,
    ariaInvalid: false,
    ariaDescribedby: undefined
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>

<template>
  <NumberFieldRoot
    :id="id"
    :class="compact ? 'compact-counter-root' : 'input-group'"
    :model-value="modelValue"
    :min="min"
    :max="max"
    :step="step"
    :readonly="readonly"
    :focus-on-change="false"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div :class="compact ? 'compact-counter-wrap' : 'counter-row'">
      <label v-if="label" :for="id" class="counter-label">{{ label }}</label>
      <div
        class="bauhaus-counter"
        :class="{
          'is-compact': compact,
          'is-invalid': ariaInvalid,
          'is-locked': readonly
        }"
        data-reka-swipe-ignore
      >
        <NumberFieldDecrement
          class="bauhaus-counter-btn bauhaus-counter-dec"
          :aria-label="decrementLabel"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="square"
          >
            <line x1="2" y1="8" x2="14" y2="8" />
          </svg>
        </NumberFieldDecrement>
        <NumberFieldInput
          class="bauhaus-counter-input"
          :aria-label="label ? undefined : ariaLabel"
          :aria-invalid="ariaInvalid || undefined"
          :aria-describedby="ariaDescribedby"
        />
        <NumberFieldIncrement
          class="bauhaus-counter-btn bauhaus-counter-inc"
          :aria-label="incrementLabel"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="square"
          >
            <line x1="8" y1="2" x2="8" y2="14" />
            <line x1="2" y1="8" x2="14" y2="8" />
          </svg>
        </NumberFieldIncrement>
      </div>
    </div>
    <slot />
  </NumberFieldRoot>
</template>

<style scoped>
.compact-counter-root {
  display: inline-flex;
  flex-shrink: 0;
}

.compact-counter-wrap {
  display: inline-flex;
  align-items: center;
}

.counter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.counter-label {
  flex: 1;
  min-width: 0;
  line-height: 1.2;
}

.bauhaus-counter {
  display: flex;
  align-items: stretch;
  width: 148px;
  height: 38px;
  flex-shrink: 0;
  border: var(--border);
  background-color: var(--white);
  box-shadow: 4px 4px 0px 0px var(--primary);
}

.bauhaus-counter.is-compact {
  width: 120px;
  height: 34px;
  box-shadow: 2px 2px 0px 0px var(--primary);
}

.bauhaus-counter.is-invalid {
  border-color: var(--accent-red);
}

.bauhaus-counter-btn {
  width: 36px;
  border: none;
  background-color: var(--accent-yellow);
  color: var(--primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.1s ease-out, color 0.1s ease-out;
}

.bauhaus-counter.is-compact .bauhaus-counter-btn {
  width: 32px;
}

.bauhaus-counter-btn svg {
  pointer-events: none;
  display: block;
}

.bauhaus-counter-dec {
  border-right: var(--border);
}

.bauhaus-counter-inc {
  border-left: var(--border);
}

@media (hover: hover) {
  .bauhaus-counter-btn:hover:not(:disabled) {
    background-color: var(--primary);
    color: var(--accent-yellow);
  }
}

.bauhaus-counter-btn:active:not(:disabled) {
  background-color: var(--primary);
  color: var(--accent-yellow);
}

.bauhaus-counter-input {
  flex: 1;
  width: 0;
  min-width: 0;
  border: none;
  border-bottom: none;
  border-radius: 0;
  padding: 0 0.25rem;
  text-align: center;
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 800;
  background-color: var(--white);
  color: var(--primary);
}

.bauhaus-counter.is-compact .bauhaus-counter-input {
  padding: 0 0.2rem;
  font-size: 1rem;
}

.bauhaus-counter-input:focus {
  outline: none;
  background-color: var(--background);
}

.bauhaus-counter.is-locked .bauhaus-counter-btn,
.bauhaus-counter.is-locked .bauhaus-counter-input {
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .bauhaus-counter.is-compact {
    width: 128px;
    height: 36px;
  }

  .bauhaus-counter.is-compact .bauhaus-counter-btn {
    width: 34px;
  }
}
</style>
