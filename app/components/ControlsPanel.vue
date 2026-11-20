<script setup lang="ts">
import type { RespinConfig } from '~~/shared/types/wheel'

const props = defineProps<{
  respin: RespinConfig
  isSpinning: boolean
  canShuffle: boolean
}>()

const emit = defineEmits<{
  'add-entry': [payload: { text: string; replicas: number }]
  'toggle-respin': [active: boolean]
  'update-respin-replicas': [replicas: number]
  shuffle: []
  'open-presets': []
  'open-settings': []
}>()

const entryText = ref('')
const entryReplicas = ref<number>(1)
const textError = ref(false)
const textInputRef = ref<HTMLInputElement | null>(null)

function onSubmitEntry(): void {
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

function onRespinReplicasUpdate(value: number): void {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    emit('update-respin-replicas', Math.min(100, Math.max(1, Math.round(value))))
  }
}

function onToggleRespin(checked: boolean): void {
  emit('toggle-respin', checked)
}
</script>

<template>
  <section class="controls-column">
    <div class="column-header">
      <h2>CONTROLS</h2>
    </div>

    <div class="brutalist-card border-blue">
      <h3 class="card-title">NEW ENTRY</h3>
      <form class="entry-form" novalidate @submit.prevent="onSubmitEntry">
        <div class="input-group">
          <label for="entry-text">LABEL</label>
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

        <NumberFieldRoot
          id="entry-replicas"
          class="input-group"
          :model-value="entryReplicas"
          :min="1"
          :max="100"
          :step="1"
          @update:model-value="onEntryReplicasUpdate"
        >
          <label for="entry-replicas">REPLICAS</label>
          <div class="number-field-row">
            <NumberFieldInput class="number-field-input" />
            <div class="number-field-steppers">
              <NumberFieldDecrement
                class="brutalist-btn btn-small btn-yellow stepper-btn"
                aria-label="Decrease replicas"
              >
                -
              </NumberFieldDecrement>
              <NumberFieldIncrement
                class="brutalist-btn btn-small btn-yellow stepper-btn"
                aria-label="Increase replicas"
              >
                +
              </NumberFieldIncrement>
            </div>
          </div>
        </NumberFieldRoot>

        <button type="submit" class="brutalist-btn btn-yellow">ADD TO WHEEL</button>
      </form>
    </div>

    <div class="brutalist-card border-red">
      <h3 class="card-title">ADD RESPIN</h3>
      <p class="card-desc">Landing on this triggers auto-respin</p>

      <div class="respin-config">
        <div class="toggle-container">
          <SwitchRoot
            id="respin-toggle"
            class="brutalist-switch"
            :model-value="props.respin.active"
            :disabled="isSpinning"
            @update:model-value="onToggleRespin"
          >
            <SwitchThumb class="brutalist-switch-thumb" />
          </SwitchRoot>
          <label for="respin-toggle" class="toggle-label">ACTIVATE RESPIN SLICE</label>
        </div>

        <NumberFieldRoot
          id="respin-replicas"
          class="input-group"
          :class="{ disabled: !props.respin.active }"
          :model-value="props.respin.replicas"
          :min="1"
          :max="100"
          :step="1"
          :disabled="!props.respin.active || isSpinning"
          @update:model-value="onRespinReplicasUpdate"
        >
          <label for="respin-replicas">RESPIN REPLICAS</label>
          <div class="number-field-row">
            <NumberFieldInput class="number-field-input" />
            <div class="number-field-steppers">
              <NumberFieldDecrement
                class="brutalist-btn btn-small btn-yellow stepper-btn"
                aria-label="Decrease respin replicas"
              >
                -
              </NumberFieldDecrement>
              <NumberFieldIncrement
                class="brutalist-btn btn-small btn-yellow stepper-btn"
                aria-label="Increase respin replicas"
              >
                +
              </NumberFieldIncrement>
            </div>
          </div>
        </NumberFieldRoot>
      </div>
    </div>

    <div class="button-row">
      <button
        type="button"
        class="brutalist-btn btn-yellow"
        :disabled="isSpinning || !canShuffle"
        @click="emit('shuffle')"
      >
        SHUFFLE
      </button>
      <button
        type="button"
        class="brutalist-btn btn-yellow"
        :disabled="isSpinning"
        @click="emit('open-presets')"
      >
        PRESETS
      </button>
      <button
        type="button"
        class="brutalist-btn btn-yellow"
        :disabled="isSpinning"
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
  gap: 2rem;
}

.column-header {
  border-bottom: var(--border);
  padding-bottom: 0.5rem;
}

.column-header h2 {
  font-family: var(--font-heading);
  font-size: 2rem;
  text-transform: uppercase;
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.number-field-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.number-field-input {
  flex: 1;
}

.number-field-steppers {
  display: inline-flex;
  gap: 0.35rem;
  flex-shrink: 0;
}

.stepper-btn {
  width: 30px;
  height: 30px;
  padding: 0;
  font-size: 1rem;
  line-height: 1;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.toggle-label {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  text-transform: uppercase;
  font-weight: 700;
  cursor: pointer;
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

.brutalist-switch[data-state='checked'] {
  background-color: var(--accent-yellow);
}

.brutalist-switch[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
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
  display: flex;
  gap: 1rem;
}

.button-row .brutalist-btn {
  flex: 1;
}

@media (max-width: 900px) {
  .button-row {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
