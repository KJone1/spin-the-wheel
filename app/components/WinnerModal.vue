<script setup lang="ts">
import type { WheelSlice } from '~~/shared/types/wheel'

defineProps<{
  open: boolean
  winner: WheelSlice | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="modal-overlay" />
      <DialogContent class="modal-content brutalist-card border-blue">
        <DialogDescription class="sr-only">
          The winning choice selected by the wheel.
        </DialogDescription>

        <div class="modal-body winner-body">
          <span class="winner-label">AND THE WINNER IS:</span>
          <DialogTitle as="h2" class="winner-text">
            {{ winner ? winner.text.toUpperCase() : '' }}
          </DialogTitle>
          <div class="winner-actions">
            <DialogClose class="brutalist-btn btn-red close-winner-btn">CLOSE</DialogClose>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.winner-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
  padding: 2rem 0;
}

.winner-label {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 2px;
  background-color: var(--primary);
  color: var(--white);
  padding: 0.25rem 0.75rem;
  text-transform: uppercase;
}

.winner-text {
  font-family: var(--font-heading);
  font-size: clamp(1.8rem, 7vw, 3rem);
  line-height: 1.1;
  font-weight: 800;
  text-transform: uppercase;
  overflow-wrap: break-word;
  word-break: normal;
  border: var(--border);
  padding: 1.5rem;
  background-color: var(--accent-yellow);
  box-shadow: 6px 6px 0px 0px var(--primary);
  width: 100%;
}

.winner-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
  margin-top: 1rem;
}

.close-winner-btn {
  flex: 1;
}

@media (max-width: 900px) {
  .winner-body {
    padding: 1rem 0;
    gap: 1rem;
  }

  .winner-text {
    padding: 1rem;
  }
}
</style>
