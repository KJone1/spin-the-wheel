<script setup lang="ts">
import type { RespinConfig } from '~~/shared/types/wheel'

const props = defineProps<{
  respin: RespinConfig
  isSpinning: boolean
}>()

const emit = defineEmits<{
  'add-entry': [payload: { text: string; replicas: number }]
  'toggle-respin': [active: boolean]
  'open-presets': []
  'open-settings': []
}>()

const entryText = ref('')
const entryReplicas = ref<number>(1)
const textError = ref(false)
const textInputRef = ref<HTMLInputElement | null>(null)

function onSubmitEntry(): void {
  if (props.isSpinning) {
    return
  }

  const trimmed = entryText.value.trim().toUpperCase()
  if (!trimmed) {
    textError.value = true
    textInputRef.value?.focus()
    return
  }

  const count =
    typeof entryReplicas.value === 'number' && !Number.isNaN(entryReplicas.value)
      ? Math.min(100, Math.max(1, Math.round(entryReplicas.value)))
      : 1

  emit('add-entry', { text: trimmed, replicas: count })
  entryText.value = ''
  entryReplicas.value = 1
  textError.value = false
  textInputRef.value?.focus()
}

function onEntryTextInput(): void {
  if (textError.value) {
    textError.value = false
  }
}

function onEntryReplicasUpdate(value: number): void {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    entryReplicas.value = Math.min(100, Math.max(1, Math.round(value)))
  }
}

function onToggleRespin(checked: boolean): void {
  if (props.isSpinning) {
    return
  }
  emit('toggle-respin', checked)
}
</script>

<template>
  <section class="controls-column">
    <div class="brutalist-card border-black entry-card">
      <form class="entry-form" novalidate @submit.prevent="onSubmitEntry">
        <div class="input-group">
          <label for="entry-text" class="card-title entry-title-label">NEW ENTRY</label>
          <input
            id="entry-text"
            ref="textInputRef"
            v-model="entryText"
            type="text"
            placeholder="TYPE SOMETHING..."
            autocomplete="off"
            :aria-invalid="textError"
            :aria-describedby="textError ? 'entry-text-error' : undefined"
            @input="onEntryTextInput"
          >
          <div v-if="textError" id="entry-text-error" role="alert" class="custom-validation-bubble">
            PLEASE GIVE A NAME TO YOUR ENTRY
          </div>
        </div>

        <BauhausCounter
          id="entry-replicas"
          label="REPLICAS"
          :model-value="entryReplicas"
          :min="1"
          :max="100"
          :step="1"
          decrement-label="Decrease replicas"
          increment-label="Increase replicas"
          @update:model-value="onEntryReplicasUpdate"
        />

        <button
          type="submit"
          class="brutalist-btn btn-yellow"
          :class="{ 'is-locked': isSpinning }"
        >
          ADD TO WHEEL
        </button>
      </form>
    </div>

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

.entry-card {
  flex-shrink: 0;
  padding: 1.25rem;
}

.input-group .entry-title-label {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
