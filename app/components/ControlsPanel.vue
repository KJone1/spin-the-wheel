<script setup lang="ts">
import type { RespinConfig } from '~~/shared/types/wheel'

const props = defineProps<{
  respin: RespinConfig
  isSpinning: boolean
  canShuffle: boolean
}>()

const emit = defineEmits<{
  'add-entry': [text: string]
  'toggle-respin': [active: boolean]
  shuffle: []
  'open-presets': []
  'open-settings': []
}>()

function onToggleRespin(checked: boolean): void {
  if (props.isSpinning) {
    return
  }
  emit('toggle-respin', checked)
}

function onShuffle(): void {
  if (props.isSpinning || !props.canShuffle) {
    return
  }
  emit('shuffle')
}
</script>

<template>
  <section class="controls-column">
    <div class="column-header">
      <h2>CONTROLS</h2>
    </div>

    <AddEntryForm
      id="entry-text"
      :is-spinning="isSpinning"
      @add-entry="emit('add-entry', $event)"
    />

    <slot />

    <div class="brutalist-card border-red respin-card">
      <div class="respin-header">
        <div class="respin-header-row">
          <label
            for="respin-toggle"
            class="card-title respin-title"
            :class="{ 'is-locked': isSpinning }"
          >
            ADD RESPIN
          </label>
          <SwitchRoot
            id="respin-toggle"
            class="brutalist-switch"
            :class="{ 'is-locked': isSpinning }"
            :disabled="isSpinning"
            :model-value="props.respin.active"
            @update:model-value="onToggleRespin"
          >
            <SwitchThumb class="brutalist-switch-thumb" />
          </SwitchRoot>
        </div>
        <p class="card-desc respin-subtitle">Landing on this triggers auto-respin</p>
      </div>
    </div>

    <div class="button-row">
      <button
        type="button"
        class="brutalist-btn btn-yellow"
        :class="{ 'is-locked': isSpinning || !canShuffle }"
        @click="onShuffle"
      >
        SHUFFLE
      </button>
      <button
        type="button"
        class="brutalist-btn btn-yellow"
        @click="emit('open-presets')"
      >
        PRESETS
      </button>
      <button
        type="button"
        class="brutalist-btn btn-yellow"
        @click="emit('open-settings')"
      >
        SETTINGS
      </button>
    </div>
  </section>
</template>

<style scoped>
.controls-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  height: 100%;
  min-height: 0;
}

.column-header {
  flex-shrink: 0;
  border-bottom: var(--border);
  padding-bottom: 0.5rem;
}

.column-header h2 {
  font-family: var(--font-heading);
  font-size: 2rem;
  line-height: 1;
  text-transform: uppercase;
}

.respin-card {
  flex-shrink: 0;
  padding: 0.9rem 1.25rem;
  gap: 0.75rem;
}

.respin-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.respin-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.respin-title {
  margin-bottom: 0;
  font-weight: 700;
  line-height: 1.1;
  cursor: pointer;
}

.respin-title.is-locked {
  cursor: not-allowed;
}

.respin-subtitle {
  font-size: 0.8rem;
  line-height: 1.25;
}

.brutalist-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 60px;
  height: 30px;
  background-color: var(--white);
  border: var(--border);
  cursor: pointer;
  padding: 0;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.brutalist-switch.is-locked {
  cursor: not-allowed;
}

.brutalist-switch[data-state='checked'] {
  background-color: var(--accent-yellow);
}

.brutalist-switch-thumb {
  display: block;
  height: 20px;
  width: 20px;
  background-color: var(--primary);
  transform: translateX(3px);
  transition: transform 0.2s;
}

.brutalist-switch-thumb[data-state='checked'] {
  transform: translateX(31px);
}

.button-row {
  flex-shrink: 0;
  display: flex;
  gap: 1rem;
}

.button-row .brutalist-btn {
  flex: 1;
}

@media (max-width: 900px) {
  .controls-column {
    display: none;
  }
}
</style>
