<script setup lang="ts">
import { X } from '@lucide/vue'
import type { EditableSettings } from '~~/shared/types/wheel'

const props = defineProps<{
  open: boolean
  spinDuration: number
  soundMuted: boolean
  mysteryMode: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: [settings: EditableSettings]
}>()

const durationFormatOptions: Intl.NumberFormatOptions = {
  style: 'unit',
  unit: 'second',
  unitDisplay: 'narrow'
}

const draftDuration = ref<number>(props.spinDuration)
const draftSoundMuted = ref<boolean>(props.soundMuted)
const draftMysteryMode = ref<boolean>(props.mysteryMode)
const errorMessage = ref<string | null>(null)
const isSaving = ref(false)

watch(
  () => props.open,
  isOpen => {
    if (isOpen) {
      draftDuration.value = props.spinDuration
      draftSoundMuted.value = props.soundMuted
      draftMysteryMode.value = props.mysteryMode
      errorMessage.value = null
    }
  }
)

function onDurationUpdate(value: number): void {
  errorMessage.value = null
  if (typeof value === 'number' && !Number.isNaN(value)) {
    draftDuration.value = value
  }
}

function onSoundMutedUpdate(checked: boolean): void {
  if (isSaving.value) {
    return
  }
  errorMessage.value = null
  draftSoundMuted.value = checked
}

function onMysteryModeUpdate(checked: boolean): void {
  if (isSaving.value) {
    return
  }
  errorMessage.value = null
  draftMysteryMode.value = checked
}

async function onSubmit(): Promise<void> {
  if (isSaving.value) {
    return
  }

  const val = draftDuration.value
  if (typeof val !== 'number' || !Number.isInteger(val) || val < 1 || val > 60) {
    errorMessage.value = 'ENTER A VALUE BETWEEN 1 AND 60.'
    return
  }

  isSaving.value = true
  errorMessage.value = null

  try {
    const response = await $fetch<EditableSettings>('/api/settings', {
      method: 'PATCH',
      body: {
        spinDuration: val,
        soundMuted: draftSoundMuted.value,
        mysteryMode: draftMysteryMode.value
      }
    })
    emit('saved', response)
    emit('update:open', false)
  } catch {
    errorMessage.value = 'FAILED TO SAVE SETTINGS.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="modal-overlay" />
      <DialogContent class="modal-content brutalist-card border-blue">
        <div class="modal-header">
          <DialogTitle as="h2">SETTINGS</DialogTitle>
          <DialogClose class="modal-close brutalist-btn btn-red" aria-label="Close settings">
            <X :size="18" :stroke-width="3" aria-hidden="true" />
          </DialogClose>
        </div>

        <DialogDescription class="sr-only"> Update and save wheel settings. </DialogDescription>

        <div class="modal-body">
          <form class="settings-form" novalidate @submit.prevent="onSubmit">
            <BauhausCounter
              id="spin-duration"
              label="SPIN DURATION"
              :model-value="draftDuration"
              :min="1"
              :max="60"
              :step="1"
              :format-options="durationFormatOptions"
              locale="en-US"
              :readonly="isSaving"
              :aria-invalid="Boolean(errorMessage)"
              :aria-describedby="errorMessage ? 'spin-duration-error' : undefined"
              decrement-label="Decrease spin duration"
              increment-label="Increase spin duration"
              @update:model-value="onDurationUpdate"
            >
              <div
                v-if="errorMessage"
                id="spin-duration-error"
                role="alert"
                class="custom-validation-bubble"
              >
                {{ errorMessage }}
              </div>
            </BauhausCounter>

            <div class="setting-toggle-row">
              <label
                for="mute-sound-toggle"
                class="setting-toggle-label"
                :class="{ 'is-locked': isSaving }"
              >
                MUTE SOUNDS
              </label>
              <SwitchRoot
                id="mute-sound-toggle"
                class="brutalist-switch"
                :class="{ 'is-locked': isSaving }"
                :disabled="isSaving"
                :model-value="draftSoundMuted"
                @update:model-value="onSoundMutedUpdate"
              >
                <SwitchThumb class="brutalist-switch-thumb" />
              </SwitchRoot>
            </div>

            <div class="setting-toggle-row">
              <label
                for="mystery-mode-toggle"
                class="setting-toggle-label"
                :class="{ 'is-locked': isSaving }"
              >
                MYSTERY MODE
              </label>
              <SwitchRoot
                id="mystery-mode-toggle"
                class="brutalist-switch"
                :class="{ 'is-locked': isSaving }"
                :disabled="isSaving"
                :model-value="draftMysteryMode"
                @update:model-value="onMysteryModeUpdate"
              >
                <SwitchThumb class="brutalist-switch-thumb" />
              </SwitchRoot>
            </div>

            <button type="submit" class="brutalist-btn btn-yellow save-btn">
              {{ isSaving ? 'SAVING...' : 'SAVE SETTINGS' }}
            </button>
          </form>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.setting-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: var(--border);
}

.setting-toggle-label {
  font-family: var(--font-heading);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1.2;
  cursor: pointer;
}

.setting-toggle-label.is-locked {
  cursor: not-allowed;
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

.save-btn {
  margin-top: 0.5rem;
}
</style>
