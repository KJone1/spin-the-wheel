<script setup lang="ts">
import type { Preset } from '~~/shared/types/wheel'

const props = defineProps<{
  open: boolean
  presets: Preset[]
  isSpinning: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  apply: [preset: Preset]
}>()

function describePreset(preset: Preset): string {
  const parts = preset.entries.map(entry => `${entry.replicas} x ${entry.label.toUpperCase()}`)
  if (preset.respinActive) {
    parts.push(`${preset.respinReplicas} x RESPIN`)
    return parts.join(', ')
  }
  return `${parts.join(', ')} (NO RESPIN)`
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
                    <p class="preset-desc">{{ describePreset(preset) }}</p>
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

.presets-scroll-viewport {
  width: 100%;
  max-height: min(480px, 65vh);
}

.presets-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 4px 22px 8px 4px;
}

.presets-scrollbar {
  display: flex;
  user-select: none;
  touch-action: none;
  width: 14px;
  background-color: var(--background);
  border: var(--border);
}

.presets-scroll-thumb {
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

.preset-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preset-title {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  text-transform: uppercase;
}

.preset-desc {
  font-size: 0.85rem;
  color: #666;
}

@media (max-width: 900px) {
  .preset-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}
</style>
