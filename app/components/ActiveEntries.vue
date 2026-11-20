<script setup lang="ts">
import type { RespinConfig, WheelEntry } from '~~/shared/types/wheel'

const props = withDefaults(
  defineProps<{
    entries: WheelEntry[]
    respin: RespinConfig
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
  'delete-entry': [id: string]
  'update-respin-replicas': [replicas: number]
  'disable-respin': []
}>()

function incrementEntry(entry: WheelEntry): void {
  if (props.disabled || entry.replicas >= 100) {
    return
  }
  emit('update-replicas', entry.id, entry.replicas + 1)
}

function decrementEntry(entry: WheelEntry): void {
  if (props.disabled || entry.replicas <= 1) {
    return
  }
  emit('update-replicas', entry.id, entry.replicas - 1)
}

function deleteEntry(id: string): void {
  if (props.disabled) {
    return
  }
  emit('delete-entry', id)
}

function incrementRespin(current: number): void {
  if (props.disabled || current >= 100) {
    return
  }
  emit('update-respin-replicas', current + 1)
}

function decrementRespin(current: number): void {
  if (props.disabled || current <= 1) {
    return
  }
  emit('update-respin-replicas', current - 1)
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
    class="active-entries-card"
    :class="embedded ? 'is-embedded' : 'brutalist-card border-black'"
  >
    <div v-if="!embedded" class="card-header-row">
      <h3 class="card-title">ACTIVE ENTRIES</h3>
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
            <span class="entry-color-indicator" :style="{ backgroundColor: entry.color }" />
            <span class="entry-label" :title="entry.text">{{ entry.text.toUpperCase() }}</span>
            <span class="entry-replicas-count">x{{ entry.replicas }}</span>
          </div>

          <div class="entry-item-actions">
            <button
              type="button"
              class="brutalist-btn btn-small btn-yellow action-icon-btn"
              :class="{ 'is-locked': disabled }"
              :aria-label="`Decrease ${entry.text} replicas`"
              @click="decrementEntry(entry)"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="square"
              >
                <line x1="2" y1="8" x2="14" y2="8" />
              </svg>
            </button>

            <button
              type="button"
              class="brutalist-btn btn-small btn-yellow action-icon-btn"
              :class="{ 'is-locked': disabled }"
              :aria-label="`Increase ${entry.text} replicas`"
              @click="incrementEntry(entry)"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="square"
              >
                <line x1="8" y1="2" x2="8" y2="14" />
                <line x1="2" y1="8" x2="14" y2="8" />
              </svg>
            </button>

            <button
              type="button"
              class="brutalist-btn btn-small btn-red action-icon-btn"
              :class="{ 'is-locked': disabled }"
              :aria-label="`Delete ${entry.text}`"
              @click="deleteEntry(entry.id)"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="square"
              >
                <line x1="3" y1="3" x2="13" y2="13" />
                <line x1="13" y1="3" x2="3" y2="13" />
              </svg>
            </button>
          </div>
        </li>

        <li v-if="respin.active" class="entry-item">
          <div class="entry-item-info">
            <span
              class="entry-color-indicator respin-color-indicator"
              :style="{ backgroundColor: respin.color }"
            >
              <svg
                width="10"
                height="10"
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
            </span>
            <span class="entry-label respin-label">{{ formatRespinLabel(respin.text) }}</span>
            <span class="entry-replicas-count">x{{ respin.replicas }}</span>
          </div>

          <div class="entry-item-actions">
            <button
              type="button"
              class="brutalist-btn btn-small btn-yellow action-icon-btn"
              :class="{ 'is-locked': disabled }"
              aria-label="Decrease respin replicas"
              @click="decrementRespin(respin.replicas)"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="square"
              >
                <line x1="2" y1="8" x2="14" y2="8" />
              </svg>
            </button>

            <button
              type="button"
              class="brutalist-btn btn-small btn-yellow action-icon-btn"
              :class="{ 'is-locked': disabled }"
              aria-label="Increase respin replicas"
              @click="incrementRespin(respin.replicas)"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="square"
              >
                <line x1="8" y1="2" x2="8" y2="14" />
                <line x1="2" y1="8" x2="14" y2="8" />
              </svg>
            </button>

            <button
              type="button"
              class="brutalist-btn btn-small btn-red action-icon-btn"
              :class="{ 'is-locked': disabled }"
              aria-label="Disable respin slice"
              @click="disableRespin"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="square"
              >
                <line x1="3" y1="3" x2="13" y2="13" />
                <line x1="13" y1="3" x2="3" y2="13" />
              </svg>
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
.active-entries-card {
  flex: 0 1 auto;
  min-height: 0;
  width: 100%;
  min-width: 0;
  padding: 1rem 1.25rem;
  gap: 0.65rem;
}

.active-entries-card.is-embedded {
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

.active-entries-card :deep(.entries-scroll-root:has(.entries-scrollbar[data-state='visible']) .entries-scroll-viewport) {
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
  padding: 0.5rem 0.85rem;
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
  overflow: hidden;
}

.entry-color-indicator {
  width: 16px;
  height: 16px;
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

.entry-replicas-count {
  font-size: 0.85rem;
  color: #666;
  background-color: var(--background);
  padding: 0.1rem 0.4rem;
  border: 1px solid var(--primary);
  font-weight: 500;
  flex-shrink: 0;
}

.entry-item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-icon-btn {
  width: 28px;
  height: 28px;
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
  .active-entries-card:not(.is-embedded) {
    flex: none;
    min-height: auto;
    padding: 1rem;
  }

  .active-entries-card:not(.is-embedded) .entries-scroll-root {
    flex: none;
  }

  .active-entries-card:not(.is-embedded) .entries-scroll-root :deep(.entries-scroll-viewport) {
    height: auto;
    max-height: 250px;
  }

  .entry-item {
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
  }

  .entry-item-info {
    gap: 0.5rem;
  }
}
</style>
