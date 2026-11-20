<script setup lang="ts">
const props = defineProps<{
  open: boolean
  spinDuration: number
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: [spinDuration: number]
}>()

const draftDuration = ref<number>(props.spinDuration)
const errorMessage = ref<string | null>(null)
const isSaving = ref(false)

watch(
  () => props.open,
  isOpen => {
    if (isOpen) {
      draftDuration.value = props.spinDuration
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

async function onSubmit(): Promise<void> {
  const val = draftDuration.value
  if (typeof val !== 'number' || !Number.isInteger(val) || val < 1 || val > 60) {
    errorMessage.value = 'ENTER A VALUE BETWEEN 1 AND 60.'
    return
  }

  isSaving.value = true
  errorMessage.value = null

  try {
    const response = await $fetch<{ spinDuration: number }>('/api/settings', {
      method: 'PATCH',
      body: { spinDuration: val }
    })
    emit('saved', response.spinDuration)
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
            X
          </DialogClose>
        </div>

        <DialogDescription class="sr-only">
          Update and save the wheel spin duration in seconds.
        </DialogDescription>

        <div class="modal-body">
          <form class="settings-form" novalidate @submit.prevent="onSubmit">
            <NumberFieldRoot
              id="spin-duration"
              class="input-group"
              :model-value="draftDuration"
              :min="1"
              :max="60"
              :step="1"
              :disabled="isSaving"
              @update:model-value="onDurationUpdate"
            >
              <label for="spin-duration">SPIN DURATION (SECONDS)</label>
              <div class="duration-row">
                <NumberFieldInput
                  class="duration-input"
                  :aria-invalid="Boolean(errorMessage)"
                  :aria-describedby="errorMessage ? 'spin-duration-error' : undefined"
                />
                <div class="duration-steppers">
                  <NumberFieldDecrement
                    class="brutalist-btn btn-small btn-yellow stepper-btn"
                    aria-label="Decrease spin duration"
                  >
                    -
                  </NumberFieldDecrement>
                  <NumberFieldIncrement
                    class="brutalist-btn btn-small btn-yellow stepper-btn"
                    aria-label="Increase spin duration"
                  >
                    +
                  </NumberFieldIncrement>
                </div>
              </div>
              <div
                v-if="errorMessage"
                id="spin-duration-error"
                role="alert"
                class="custom-validation-bubble"
              >
                {{ errorMessage }}
              </div>
            </NumberFieldRoot>

            <button type="submit" class="brutalist-btn btn-yellow save-btn" :disabled="isSaving">
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

.duration-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.duration-input {
  flex: 1;
}

.duration-steppers {
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

.save-btn {
  margin-top: 1rem;
}
</style>
