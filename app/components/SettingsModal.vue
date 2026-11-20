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
          Update and save the wheel spin duration in seconds.
        </DialogDescription>

        <div class="modal-body">
          <form class="settings-form" novalidate @submit.prevent="onSubmit">
            <BauhausCounter
              id="spin-duration"
              label="SPIN DURATION (SECONDS)"
              :model-value="draftDuration"
              :min="1"
              :max="60"
              :step="1"
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

.save-btn {
  margin-top: 1rem;
}
</style>
