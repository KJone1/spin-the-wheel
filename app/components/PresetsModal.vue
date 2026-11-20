<script setup lang="ts">
import type { Preset } from '~~/shared/types/wheel'

defineProps<{
  open: boolean
  presets: Preset[]
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
            X
          </DialogClose>
        </div>

        <DialogDescription class="sr-only">
          Choose a preset wheel configuration from the database.
        </DialogDescription>

        <div class="modal-body">
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
                @click="selectPreset(preset)"
              >
                APPLY
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.presets-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 480px;
  overflow-y: auto;
  padding: 4px;
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
