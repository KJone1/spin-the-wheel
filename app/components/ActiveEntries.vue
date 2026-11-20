<script setup lang="ts">
import type { RespinConfig, WheelEntry } from '~~/shared/types/wheel'

defineProps<{
  entries: WheelEntry[]
  respin: RespinConfig
  totalSlices: number
  disabled: boolean
}>()

const emit = defineEmits<{
  'update-replicas': [id: string, replicas: number]
  'delete-entry': [id: string]
  'update-respin-replicas': [replicas: number]
  'disable-respin': []
}>()

function onEntryReplicasChange(id: string, value: number): void {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    emit('update-replicas', id, Math.min(100, Math.max(1, Math.round(value))))
  }
}

function onRespinReplicasChange(value: number): void {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    emit('update-respin-replicas', Math.min(100, Math.max(1, Math.round(value))))
  }
}
</script>

<template>
  <div class="brutalist-card border-black active-entries-card">
    <div class="card-header-row">
      <h3 class="card-title">ACTIVE ENTRIES</h3>
      <span class="badge">{{ totalSlices }} SLICES</span>
    </div>

    <div class="entries-list-container">
      <ul class="entries-list">
        <li v-for="entry in entries" :key="entry.id" class="entry-item">
          <div class="entry-item-info">
            <span class="entry-color-indicator" :style="{ backgroundColor: entry.color }" />
            <span class="entry-label" :title="entry.text">{{ entry.text.toUpperCase() }}</span>
            <span class="entry-replicas-count">x{{ entry.replicas }}</span>
          </div>

          <div class="entry-item-actions">
            <NumberFieldRoot
              class="inline-stepper"
              :model-value="entry.replicas"
              :min="1"
              :max="100"
              :disabled="disabled"
              @update:model-value="onEntryReplicasChange(entry.id, $event)"
            >
              <NumberFieldIncrement
                class="brutalist-btn btn-small btn-yellow action-icon-btn"
                :aria-label="`Increase ${entry.text} replicas`"
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
              </NumberFieldIncrement>
              <NumberFieldDecrement
                class="brutalist-btn btn-small btn-yellow action-icon-btn"
                :aria-label="`Decrease ${entry.text} replicas`"
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
              </NumberFieldDecrement>
            </NumberFieldRoot>

            <button
              type="button"
              class="brutalist-btn btn-small btn-red action-icon-btn"
              :disabled="disabled"
              :aria-label="`Delete ${entry.text}`"
              @click="emit('delete-entry', entry.id)"
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

        <li
          v-if="respin.active"
          class="entry-item respin-entry-item"
          :style="{ borderLeftColor: respin.color }"
        >
          <div class="entry-item-info respin-info">
            <span class="entry-color-indicator" :style="{ backgroundColor: respin.color }" />
            <span class="entry-label respin-label">{{ respin.text }}</span>
            <span class="entry-replicas-count">x{{ respin.replicas }}</span>
          </div>

          <div class="entry-item-actions">
            <NumberFieldRoot
              class="inline-stepper"
              :model-value="respin.replicas"
              :min="1"
              :max="100"
              :disabled="disabled"
              @update:model-value="onRespinReplicasChange"
            >
              <NumberFieldIncrement
                class="brutalist-btn btn-small btn-yellow action-icon-btn"
                aria-label="Increase respin replicas"
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
              </NumberFieldIncrement>
              <NumberFieldDecrement
                class="brutalist-btn btn-small btn-yellow action-icon-btn"
                aria-label="Decrease respin replicas"
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
              </NumberFieldDecrement>
            </NumberFieldRoot>

            <button
              type="button"
              class="brutalist-btn btn-small btn-red action-icon-btn"
              :disabled="disabled"
              aria-label="Disable respin slice"
              @click="emit('disable-respin')"
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
    </div>
  </div>
</template>

<style scoped>
.active-entries-card {
  flex-grow: 1;
  width: 100%;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: var(--border);
  padding-bottom: 0.75rem;
  margin-bottom: 0.5rem;
}

.entries-list-container {
  max-height: 250px;
  overflow-y: auto;
  border: 2px solid var(--primary);
  background-color: var(--background);
}

.entries-list-container::-webkit-scrollbar {
  width: 12px;
}

.entries-list-container::-webkit-scrollbar-track {
  background: var(--background);
  border-left: var(--border);
}

.entries-list-container::-webkit-scrollbar-thumb {
  background-color: var(--primary);
  border-left: var(--border);
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
  padding: 0.75rem 1rem;
  border-bottom: 2px solid var(--primary);
  background-color: var(--white);
  gap: 1rem;
}

.entry-item:last-child {
  border-bottom: none;
}

.respin-entry-item {
  border-left: 6px solid var(--accent-red);
}

.respin-info {
  padding-left: 4px;
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

.inline-stepper {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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
</style>
