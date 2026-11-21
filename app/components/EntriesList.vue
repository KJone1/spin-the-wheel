<script setup lang="ts">
import { RotateCw, X } from '@lucide/vue'
import type { RespinConfig, WheelEntry } from '~~/shared/types/wheel'

const props = withDefaults(
  defineProps<{
    entries: WheelEntry[]
    respin: RespinConfig
    sliceColors: string[]
    totalSlices: number
    disabled: boolean
    embedded?: boolean
  }>(),
  {
    embedded: false
  }
)

const emit = defineEmits<{
  'update-replicas': [id: string, replicas: number]
  'update-color': [id: string, color: string]
  'delete-entry': [id: string]
  'update-respin-replicas': [replicas: number]
  'disable-respin': []
}>()

function onEntryColorUpdate(id: string, color: string): void {
  if (props.disabled) {
    return
  }
  emit('update-color', id, color)
}

function onEntryReplicasUpdate(id: string, value: number): void {
  if (props.disabled) {
    return
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    emit('update-replicas', id, Math.min(100, Math.max(1, Math.round(value))))
  }
}

function deleteEntry(id: string): void {
  if (props.disabled) {
    return
  }
  emit('delete-entry', id)
}

function onRespinReplicasUpdate(value: number): void {
  if (props.disabled) {
    return
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    emit('update-respin-replicas', Math.min(100, Math.max(1, Math.round(value))))
  }
}

function disableRespin(): void {
  if (props.disabled) {
    return
  }
  emit('disable-respin')
}

function formatRespinLabel(text: string): string {
  return text.replace(/↻/g, '').trim()
}
</script>

<template>
  <div
    class="entries-card"
    :class="embedded ? 'is-embedded' : 'brutalist-card border-black'"
  >
    <div v-if="!embedded" class="card-header-row">
      <h3 class="card-title">ENTRIES</h3>
      <span class="badge">{{ totalSlices }} SLICES</span>
    </div>

    <p v-if="entries.length === 0 && !respin.active" class="empty-entries-note">
      NO ENTRIES YET
    </p>

    <ScrollAreaRoot v-else type="auto" class="entries-scroll-root">
      <ScrollAreaViewport class="entries-scroll-viewport">
        <ul class="entries-list">
        <li v-for="entry in entries" :key="entry.id" class="entry-item">
          <div class="entry-item-info">
            <EntryColorPicker
              :model-value="entry.color"
              :colors="sliceColors"
              :entry-label="entry.text"
              :disabled="disabled"
              :mode="embedded ? 'modal' : 'popover'"
              @update:model-value="onEntryColorUpdate(entry.id, $event)"
            />
            <span class="entry-label" :title="entry.text">{{ entry.text.toUpperCase() }}</span>
          </div>

          <div class="entry-item-actions">
            <BauhausCounter
              :id="`${embedded ? 'mobile-' : ''}entry-replicas-${entry.id}`"
              compact
              :model-value="entry.replicas"
              :min="1"
              :max="100"
              :step="1"
              :readonly="disabled"
              :aria-label="`${entry.text} replicas`"
              :decrement-label="`Decrease ${entry.text} replicas`"
              :increment-label="`Increase ${entry.text} replicas`"
              @update:model-value="onEntryReplicasUpdate(entry.id, $event)"
            />

            <button
              type="button"
              class="brutalist-btn btn-small btn-red action-icon-btn"
              :class="{ 'is-locked': disabled }"
              :aria-label="`Delete ${entry.text}`"
              @click="deleteEntry(entry.id)"
            >
              <X :size="18" :stroke-width="3" aria-hidden="true" />
            </button>
          </div>
        </li>

        <li v-if="respin.active" class="entry-item">
          <div class="entry-item-info">
            <span
              class="entry-color-indicator respin-color-indicator"
              :style="{ backgroundColor: respin.color }"
            >
              <RotateCw :size="16" :stroke-width="2.5" aria-hidden="true" />
            </span>
            <span class="entry-label respin-label">{{ formatRespinLabel(respin.text) }}</span>
          </div>

          <div class="entry-item-actions">
            <BauhausCounter
              :id="`${embedded ? 'mobile-' : ''}respin-replicas`"
              compact
              :model-value="respin.replicas"
              :min="1"
              :max="100"
              :step="1"
              :readonly="disabled"
              aria-label="Respin replicas"
              decrement-label="Decrease respin replicas"
              increment-label="Increase respin replicas"
              @update:model-value="onRespinReplicasUpdate"
            />

            <button
              type="button"
              class="brutalist-btn btn-small btn-red action-icon-btn"
              :class="{ 'is-locked': disabled }"
              aria-label="Disable respin slice"
              @click="disableRespin"
            >
              <X :size="18" :stroke-width="3" aria-hidden="true" />
            </button>
          </div>
        </li>
      </ul>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="vertical" class="entries-scrollbar">
        <ScrollAreaThumb class="entries-scroll-thumb" />
      </ScrollAreaScrollbar>
    </ScrollAreaRoot>
  </div>
</template>

<style scoped>
.entries-card {
  flex: 0 1 auto;
  min-height: 0;
  width: 100%;
  min-width: 0;
  padding: 1rem 1.25rem;
  gap: 0.65rem;
}

.entries-card.is-embedded {
  display: flex;
  flex-direction: column;
  padding: 0;
  gap: 0;
}

.card-header-row {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: var(--border);
  padding-bottom: 0.5rem;
}

.card-header-row .card-title {
  margin-bottom: 0;
}

.empty-entries-note {
  flex-shrink: 0;
  border: 2px solid var(--primary);
  background-color: var(--white);
  padding: 0.85rem;
  text-align: center;
  font-family: var(--font-heading);
  font-size: 0.9rem;
  font-weight: 700;
  color: #555;
  text-transform: uppercase;
}

.entries-scroll-root {
  flex: 0 1 auto;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid var(--primary);
  background-color: var(--background);
}

.entries-scroll-root :deep(.entries-scroll-viewport) {
  width: 100%;
  flex: 0 1 auto;
  min-height: 0;
}

.entries-scroll-root :deep(.entries-scroll-viewport > div) {
  width: 100%;
  min-width: 0;
}

.entries-card :deep(.entries-scroll-root:has(.entries-scrollbar[data-state='visible']) .entries-scroll-viewport) {
  padding-right: 14px;
}

.entries-scroll-root :deep(.entries-scrollbar) {
  display: flex;
  user-select: none;
  touch-action: none;
  width: 14px;
  background-color: var(--background);
  border-left: 2px solid var(--primary);
}

.entries-scroll-root :deep(.entries-scroll-thumb) {
  flex: 1;
  background-color: var(--primary);
  position: relative;
}

.entries-list {
  list-style: none;
  display: flex;
  flex-direction: column;
}

.entry-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border-bottom: 2px solid var(--primary);
  background-color: var(--white);
  gap: 1rem;
}

.entry-item:last-child {
  border-bottom: none;
}

.respin-color-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
}

.respin-label {
  color: var(--accent-red);
  font-weight: 800;
}

.entry-item-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-grow: 1;
  min-width: 0;
}

.entry-color-indicator {
  width: 24px;
  height: 24px;
  border: 2px solid var(--primary);
  flex-shrink: 0;
}

.entry-label {
  font-weight: 700;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-icon-btn {
  width: 34px;
  height: 34px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-icon-btn svg {
  pointer-events: none;
  display: inline-block;
}

@media (max-width: 900px) {
  .entries-card:not(.is-embedded) {
    flex: none;
    min-height: auto;
    padding: 1rem;
  }

  .entries-card:not(.is-embedded) .entries-scroll-root {
    flex: none;
  }

  .entries-card:not(.is-embedded) .entries-scroll-root :deep(.entries-scroll-viewport) {
    height: auto;
    max-height: 250px;
  }

  .entry-item {
    padding: 0.35rem 0.75rem;
    gap: 0.5rem;
  }

  .entry-item-info {
    gap: 0.5rem;
  }

  .action-icon-btn {
    width: 36px;
    height: 36px;
  }
}
</style>
