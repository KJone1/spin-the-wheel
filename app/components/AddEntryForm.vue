<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    id: string
    isSpinning: boolean
    embedded?: boolean
  }>(),
  {
    embedded: false
  }
)

const emit = defineEmits<{
  'add-entry': [text: string]
}>()

const entryText = ref('')
const textError = ref(false)
const textInputRef = ref<HTMLInputElement | null>(null)

function clearError(): void {
  textError.value = false
}

defineExpose({ clearError })

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

  emit('add-entry', trimmed)
  entryText.value = ''
  textError.value = false
  if (!props.embedded) {
    textInputRef.value?.focus()
  }
}

function onEntryTextInput(): void {
  if (textError.value) {
    textError.value = false
  }
}
</script>

<template>
  <form
    class="add-entry-form"
    :class="{ 'is-embedded': embedded }"
    data-reka-swipe-ignore
    novalidate
    @submit.prevent="onSubmitEntry"
  >
    <input
      :id="id"
      ref="textInputRef"
      v-model="entryText"
      type="text"
      class="add-entry-input"
      placeholder="ADD NEW ENTRY..."
      aria-label="Add new entry"
      autocomplete="off"
      :aria-invalid="textError"
      :aria-describedby="textError ? `${id}-error` : undefined"
      @input="onEntryTextInput"
    >
    <button
      type="submit"
      class="brutalist-btn btn-yellow add-entry-btn"
      :class="{ 'is-locked': isSpinning }"
      @mousedown.prevent
    >
      ADD
    </button>
    <div
      v-if="textError"
      :id="`${id}-error`"
      role="alert"
      class="custom-validation-bubble"
    >
      PLEASE GIVE A NAME TO YOUR ENTRY
    </div>
  </form>
</template>

<style scoped>
.add-entry-form {
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: var(--white);
  border: var(--border);
  box-shadow: var(--shadow);
  padding: 0.65rem 0.75rem 0.65rem 1.15rem;
}

.add-entry-form:focus-within {
  box-shadow: 0 0 0 3px var(--accent-blue), var(--shadow);
}

.add-entry-form.is-embedded {
  gap: 0.5rem;
  box-shadow: 4px 4px 0px 0px var(--primary);
  padding: 0.4rem 0.45rem 0.4rem 0.75rem;
}

.add-entry-form.is-embedded:focus-within {
  box-shadow: 0 0 0 3px var(--accent-blue), 4px 4px 0px 0px var(--primary);
}

.add-entry-input {
  flex: 1;
  min-width: 0;
  border: none;
  background-color: transparent;
  font-family: var(--font-body);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--primary);
  outline: none;
  padding: 0.3rem 0;
}

.add-entry-form.is-embedded .add-entry-input {
  font-size: 1rem;
  padding: 0.25rem 0;
}

.add-entry-btn {
  flex-shrink: 0;
  padding: 0.55rem 1rem;
  font-size: 0.95rem;
  box-shadow: 3px 3px 0px 0px var(--primary);
}

.add-entry-form.is-embedded .add-entry-btn {
  padding: 0.45rem 0.85rem;
  font-size: 0.85rem;
}

@media (hover: hover) {
  .add-entry-btn:hover:not(.is-locked) {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px 0px var(--primary);
  }
}

.add-entry-btn:active:not(.is-locked) {
  transform: translate(3px, 3px);
  box-shadow: 0px 0px 0px 0px var(--primary);
}
</style>
