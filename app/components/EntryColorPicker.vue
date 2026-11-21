<script setup lang="ts">
import { Check } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    colors: string[]
    entryLabel: string
    disabled?: boolean
    mobile?: boolean
  }>(),
  {
    disabled: false,
    mobile: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [color: string]
}>()

const isOpen = ref(false)

watch(
  () => props.disabled,
  locked => {
    if (locked) {
      isOpen.value = false
    }
  }
)

function onOpenChange(next: boolean): void {
  if (props.disabled && next) {
    return
  }
  isOpen.value = next
}

function onColorSelect(value: string | string[] | undefined): void {
  if (props.disabled || typeof value !== 'string' || !value) {
    return
  }
  if (value !== props.modelValue) {
    emit('update:modelValue', value)
  }
  isOpen.value = false
}

function onItemSelect(color: string): void {
  if (props.disabled) {
    return
  }
  if (color === props.modelValue) {
    isOpen.value = false
  }
}

function getIndicatorColor(hex: string): string {
  const cleaned = hex.trim().replace('#', '')
  const normalized =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map(ch => ch + ch)
          .join('')
      : cleaned

  if (normalized.length !== 6) {
    return '#1a1a1a'
  }

  const r = parseInt(normalized.slice(0, 2), 16) / 255
  const g = parseInt(normalized.slice(2, 4), 16) / 255
  const b = parseInt(normalized.slice(4, 6), 16) / 255

  const toLinear = (channel: number): number =>
    channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)

  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  return luminance <= 0.22 ? '#f5f0e8' : '#1a1a1a'
}
</script>

<template>
  <PopoverRoot :open="isOpen" :modal="mobile" @update:open="onOpenChange">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="color-trigger-btn"
        :class="{ 'is-locked': disabled, 'is-mobile': mobile }"
        :style="{ backgroundColor: modelValue }"
        :aria-label="`Change color for ${entryLabel}`"
      />
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        class="entry-color-popover"
        side="bottom"
        align="start"
        :side-offset="8"
        :collision-padding="12"
      >
        <div class="color-popover-card" :class="{ 'is-mobile': mobile }">
          <ColorSwatchPickerRoot
            class="swatch-grid"
            :model-value="modelValue"
            selection-behavior="replace"
            :disabled="disabled"
            orientation="horizontal"
            aria-label="Slice colors"
            @update:model-value="onColorSelect"
          >
            <ColorSwatchPickerItem
              v-for="color in colors"
              :key="color"
              :value="color"
              class="swatch-item"
              @select="onItemSelect(color)"
            >
              <ColorSwatchPickerItemSwatch class="swatch-fill" />
              <ColorSwatchPickerItemIndicator
                class="swatch-indicator"
                :style="{ color: getIndicatorColor(color) }"
              >
                <Check :size="mobile ? 20 : 18" :stroke-width="3" aria-hidden="true" />
              </ColorSwatchPickerItemIndicator>
            </ColorSwatchPickerItem>
          </ColorSwatchPickerRoot>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped>
.color-trigger-btn {
  position: relative;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 2px solid var(--primary);
  cursor: pointer;
  flex-shrink: 0;
  outline: none;
}

.color-trigger-btn.is-mobile::after {
  content: '';
  position: absolute;
  inset: -8px;
}

.color-trigger-btn:focus-visible {
  outline: 2px solid var(--accent-blue);
  outline-offset: 2px;
}

.color-trigger-btn.is-locked {
  cursor: not-allowed;
}

:global(.entry-color-popover) {
  z-index: 100;
  outline: none;
}

.color-popover-card {
  background-color: var(--white);
  border: var(--border);
  box-shadow: var(--shadow);
  padding: 0.75rem;
}

.color-popover-card :deep(.swatch-grid) {
  display: grid;
  grid-template-columns: repeat(3, 40px);
  gap: 0.55rem;
  outline: none;
}

.color-popover-card.is-mobile :deep(.swatch-grid) {
  grid-template-columns: repeat(3, 44px);
  gap: 0.65rem;
}

.color-popover-card :deep(.swatch-item) {
  position: relative;
  width: 40px;
  height: 40px;
  border: var(--border);
  box-shadow: 3px 3px 0px 0px var(--primary);
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
}

.color-popover-card.is-mobile :deep(.swatch-item) {
  width: 44px;
  height: 44px;
}

@media (hover: hover) {
  .color-popover-card :deep(.swatch-item:hover) {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px 0px var(--primary);
  }
}

.color-popover-card :deep(.swatch-item:active) {
  transform: translate(3px, 3px);
  box-shadow: 0px 0px 0px 0px var(--primary);
  transition: none;
}

.color-popover-card :deep(.swatch-item:focus-visible) {
  outline: 3px solid var(--accent-blue);
  outline-offset: 2px;
}

.color-popover-card :deep(.swatch-fill) {
  position: absolute;
  inset: 0;
  background-color: var(--reka-color-swatch-color);
}

.color-popover-card :deep(.swatch-indicator) {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
</style>
