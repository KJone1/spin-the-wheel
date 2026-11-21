<script setup lang="ts">
import type { Preset } from '~~/shared/types/wheel'

const props = defineProps<{
  open: boolean
  presets: Preset[]
  respinColor: string
  respinLabel: string
  isSpinning: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  apply: [preset: Preset]
}>()

function formatRespinLabel(text: string): string {
  return text.replace(/↻/g, '').trim().toUpperCase()
}

function getChipTextColor(hex: string): string {
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

function selectPreset(preset: Preset): void {
  if (props.isSpinning) {
    return
  }
  emit('apply', preset)
  emit('update:open', false)
}
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="modal-overlay" />
      <DialogContent class="modal-content brutalist-card border-yellow">
        <div class="modal-header">
          <DialogTitle as="h2">PRESETS</DialogTitle>
          <DialogClose class="modal-close brutalist-btn btn-red" aria-label="Close presets">
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
          Choose a preset wheel configuration from the database.
        </DialogDescription>

        <div class="modal-body">
          <ScrollAreaRoot type="auto" class="presets-scroll-root">
            <ScrollAreaViewport class="presets-scroll-viewport">
              <div class="presets-grid">
                <div
                  v-for="preset in presets"
                  :key="preset.id"
                  class="brutalist-card border-black preset-item"
                >
                  <div class="preset-info">
                    <h4 class="preset-title">{{ preset.title }}</h4>
                    <ul class="preset-entries">
                      <li
                        v-for="entry in preset.entries"
                        :key="entry.id"
                        class="preset-chip"
                        :style="{
                          backgroundColor: entry.color,
                          color: getChipTextColor(entry.color)
                        }"
                      >
                        <span class="preset-chip-count">{{ entry.replicas }}X</span>
                        <span class="preset-chip-label">{{ entry.label.toUpperCase() }}</span>
                      </li>
                      <li
                        v-if="preset.respinActive"
                        class="preset-chip"
                        :style="{
                          backgroundColor: respinColor,
                          color: getChipTextColor(respinColor)
                        }"
                      >
                        <span class="preset-chip-count">{{ preset.respinReplicas }}X</span>
                        <svg
                          class="preset-chip-icon"
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.5"
                          stroke-linecap="square"
                          stroke-linejoin="miter"
                          aria-hidden="true"
                        >
                          <path d="M13 8a5 5 0 1 1-1.5-3.5" />
                          <polyline points="12.5 1.8 12.5 5.2 9.1 5.2" />
                        </svg>
                        <span class="preset-chip-label">{{ formatRespinLabel(respinLabel) }}</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    class="brutalist-btn btn-yellow btn-small"
                    :class="{ 'is-locked': isSpinning }"
                    @click="selectPreset(preset)"
                  >
                    APPLY
                  </button>
                </div>
              </div>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar orientation="vertical" class="presets-scrollbar">
              <ScrollAreaThumb class="presets-scroll-thumb" />
            </ScrollAreaScrollbar>
          </ScrollAreaRoot>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.presets-scroll-root {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.presets-scroll-root :deep(.presets-scroll-viewport) {
  width: 100%;
  max-height: min(720px, calc(100dvh - 11rem));
}

.presets-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 4px 4px 8px 4px;
}

.modal-body :deep(.presets-scroll-root:has(.presets-scrollbar[data-state='visible']) .presets-grid) {
  padding-right: 22px;
}

.presets-scroll-root :deep(.presets-scrollbar) {
  display: flex;
  user-select: none;
  touch-action: none;
  width: 14px;
  background-color: var(--background);
  border: var(--border);
}

.presets-scroll-root :deep(.presets-scroll-thumb) {
  flex: 1;
  background-color: var(--primary);
  position: relative;
}

.preset-item {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  box-shadow: 4px 4px 0px 0px var(--primary);
}

.preset-item > button {
  flex-shrink: 0;
}

.preset-info {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
  min-width: 0;
}

.preset-title {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  text-transform: uppercase;
}

.preset-entries {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preset-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.22rem 0.5rem 0.22rem 0.25rem;
  border: 2px solid var(--primary);
  box-shadow: 2px 2px 0px 0px var(--primary);
  font-family: var(--font-heading);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  max-width: 100%;
}

.preset-chip-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.14rem 0.34rem;
  background-color: var(--white);
  color: var(--primary);
  border: 2px solid var(--primary);
  font-family: var(--font-heading);
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1;
  flex-shrink: 0;
}

.preset-chip-icon {
  display: block;
  flex-shrink: 0;
}

.preset-chip-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .preset-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}
</style>
