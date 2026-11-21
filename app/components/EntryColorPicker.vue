<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string
    colors: string[]
    entryLabel: string
    disabled?: boolean
    mode?: 'popover' | 'modal'
  }>(),
  {
    disabled: false,
    mode: 'popover'
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
  <DialogRoot v-if="mode === 'modal'" :open="isOpen" @update:open="onOpenChange">
    <DialogTrigger as-child>
      <button
        type="button"
        class="color-trigger-btn is-mobile"
        :class="{ 'is-locked': disabled }"
        :style="{ backgroundColor: modelValue }"
        :aria-label="`Change color for ${entryLabel}`"
      />
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="modal-overlay" />
      <DialogContent class="modal-content brutalist-card border-yellow color-modal-content">
        <div class="modal-header color-modal-header">
          <DialogTitle as="h2" class="color-modal-title">
            {{ entryLabel.toUpperCase() }}
          </DialogTitle>
          <DialogClose class="modal-close brutalist-btn btn-red" aria-label="Close color picker">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="square"
              aria-hidden="true"
            >
              <line x1="3" y1="3" x2="13" y2="13" />
              <line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          </DialogClose>
        </div>

        <DialogDescription class="sr-only">
          Choose a slice color for {{ entryLabel }}.
        </DialogDescription>

        <div class="modal-body color-modal-body">
          <ColorSwatchPickerRoot
            class="swatch-grid is-modal"
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
              class="swatch-item is-modal"
              @select="onItemSelect(color)"
            >
              <ColorSwatchPickerItemSwatch class="swatch-fill" />
              <ColorSwatchPickerItemIndicator
                class="swatch-indicator"
                :style="{ color: getIndicatorColor(color) }"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="square"
                  stroke-linejoin="miter"
                  aria-hidden="true"
                >
                  <polyline points="2.5 8.5 6.2 12 13.5 4.2" />
                </svg>
              </ColorSwatchPickerItemIndicator>
            </ColorSwatchPickerItem>
          </ColorSwatchPickerRoot>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>

  <PopoverRoot v-else :open="isOpen" @update:open="onOpenChange">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="color-trigger-btn"
        :class="{ 'is-locked': disabled }"
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
        <div class="color-popover-card">
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="square"
                  stroke-linejoin="miter"
                  aria-hidden="true"
                >
                  <polyline points="2.5 8.5 6.2 12 13.5 4.2" />
                </svg>
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
  z-index: 80;
  outline: none;
}

:global(.color-modal-content) {
  max-width: 340px;
  padding: 1.25rem;
}

.color-popover-card {
  background-color: var(--white);
  border: var(--border);
  box-shadow: var(--shadow);
  padding: 0.75rem;
}

.color-modal-header {
  gap: 0.75rem;
  padding-bottom: 0.75rem;
}

.color-modal-header :deep(.color-modal-title) {
  font-size: 1.25rem;
  line-height: 1.1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.color-modal-body {
  padding-top: 0.75rem;
}

.color-popover-card :deep(.swatch-grid),
.color-modal-body :deep(.swatch-grid) {
  display: grid;
  grid-template-columns: repeat(3, 40px);
  gap: 0.55rem;
  outline: none;
}

.color-modal-body :deep(.swatch-grid.is-modal) {
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.color-popover-card :deep(.swatch-item),
.color-modal-body :deep(.swatch-item) {
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

.color-modal-body :deep(.swatch-item.is-modal) {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  box-shadow: 4px 4px 0px 0px var(--primary);
}

@media (hover: hover) {
  .color-popover-card :deep(.swatch-item:hover),
  .color-modal-body :deep(.swatch-item:hover) {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px 0px var(--primary);
  }
}

.color-popover-card :deep(.swatch-item:active),
.color-modal-body :deep(.swatch-item:active) {
  transform: translate(3px, 3px);
  box-shadow: 0px 0px 0px 0px var(--primary);
  transition: none;
}

.color-popover-card :deep(.swatch-item:focus-visible),
.color-modal-body :deep(.swatch-item:focus-visible) {
  outline: 3px solid var(--accent-blue);
  outline-offset: 2px;
}

.color-popover-card :deep(.swatch-fill),
.color-modal-body :deep(.swatch-fill) {
  position: absolute;
  inset: 0;
  background-color: var(--reka-color-swatch-color);
}

.color-popover-card :deep(.swatch-indicator),
.color-modal-body :deep(.swatch-indicator) {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
</style>
