<script setup lang="ts">
import type { RespinConfig, WheelEntry } from '~~/shared/types/wheel'

const props = defineProps<{
  entries: WheelEntry[]
  respin: RespinConfig
  totalSlices: number
  isSpinning: boolean
}>()

const emit = defineEmits<{
  'add-entry': [payload: { text: string; replicas: number }]
  'update-replicas': [id: string, replicas: number]
  'delete-entry': [id: string]
  'toggle-respin': [active: boolean]
  'update-respin-replicas': [replicas: number]
  'disable-respin': []
}>()

const isOpen = ref(false)
const entryText = ref('')
const textError = ref(false)
const textInputRef = ref<HTMLInputElement | null>(null)

let desktopMediaQuery: MediaQueryList | null = null

function onDesktopMediaChange(event: MediaQueryListEvent): void {
  if (event.matches) {
    isOpen.value = false
  }
}

onMounted(() => {
  desktopMediaQuery = window.matchMedia('(min-width: 901px)')
  desktopMediaQuery.addEventListener('change', onDesktopMediaChange)
})

onBeforeUnmount(() => {
  desktopMediaQuery?.removeEventListener('change', onDesktopMediaChange)
})

watch(isOpen, open => {
  if (!open) {
    textError.value = false
  }
})

function openDrawer(): void {
  if (!isOpen.value) {
    isOpen.value = true
  }
}

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

  emit('add-entry', { text: trimmed, replicas: 1 })
  entryText.value = ''
  textError.value = false
}

function onEntryTextInput(): void {
  if (textError.value) {
    textError.value = false
  }
}

function onToggleRespin(checked: boolean): void {
  if (props.isSpinning) {
    return
  }
  if (checked) {
    emit('update-respin-replicas', 1)
  }
  emit('toggle-respin', checked)
}
</script>

<template>
  <div class="mobile-drawer-dock">
    <DrawerRoot v-model:open="isOpen" swipe-direction="down">
      <DrawerSwipeArea class="mobile-sheet-bar" @click="openDrawer">
        <span class="sheet-bar-label">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="square"
            stroke-linejoin="miter"
            aria-hidden="true"
          >
            <polyline points="3 11 8 5 13 11" />
          </svg>
          <span>CONTROLS</span>
        </span>
        <DrawerTrigger class="sheet-bar-cta" @click.stop>
          OPEN
        </DrawerTrigger>
      </DrawerSwipeArea>

      <DrawerVirtualKeyboardProvider>
        <DrawerPortal>
          <DrawerOverlay class="drawer-overlay" />
          <DrawerViewport class="drawer-viewport">
            <DrawerContent class="drawer-content" :initial-focus="false">
              <div class="drawer-shell">
                <div class="drawer-header">
                  <DrawerHandle class="drawer-handle" />
                  <div class="drawer-header-row">
                    <div class="drawer-title-group">
                      <DrawerTitle as="h2" class="drawer-title">CONTROLS</DrawerTitle>
                      <span class="badge">{{ totalSlices }} SLICES</span>
                    </div>
                    <DrawerClose
                      class="modal-close brutalist-btn btn-red"
                      aria-label="Close controls"
                    >
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
                    </DrawerClose>
                  </div>
                </div>

                <DrawerDescription class="sr-only">
                  Add wheel entries, edit slice replicas, or toggle auto-respin.
                </DrawerDescription>

                <div class="drawer-body">
                  <form
                    class="mobile-add-form"
                    data-reka-swipe-ignore
                    novalidate
                    @submit.prevent="onSubmitEntry"
                  >
                    <input
                      id="mobile-entry-text"
                      ref="textInputRef"
                      v-model="entryText"
                      type="text"
                      class="mobile-add-input"
                      placeholder="TYPE NEW ENTRY..."
                      aria-label="New entry name"
                      autocomplete="off"
                      :aria-invalid="textError"
                      :aria-describedby="textError ? 'mobile-entry-text-error' : undefined"
                      @input="onEntryTextInput"
                    >
                    <button
                      type="submit"
                      class="brutalist-btn btn-yellow mobile-add-btn"
                      :class="{ 'is-locked': isSpinning }"
                      @mousedown.prevent
                    >
                      + ADD
                    </button>
                    <div
                      v-if="textError"
                      id="mobile-entry-text-error"
                      role="alert"
                      class="custom-validation-bubble"
                    >
                      PLEASE GIVE A NAME TO YOUR ENTRY
                    </div>
                  </form>

                  <ActiveEntries
                    :entries="entries"
                    :respin="respin"
                    :total-slices="totalSlices"
                    :disabled="isSpinning"
                    embedded
                    @update-replicas="(id, replicas) => emit('update-replicas', id, replicas)"
                    @delete-entry="id => emit('delete-entry', id)"
                    @update-respin-replicas="replicas => emit('update-respin-replicas', replicas)"
                    @disable-respin="emit('disable-respin')"
                  />

                  <div class="brutalist-card border-red mobile-respin-card">
                    <div class="respin-header">
                      <div class="respin-header-row">
                        <label
                          for="mobile-respin-toggle"
                          class="card-title respin-title"
                          :class="{ 'is-locked': isSpinning }"
                        >
                          ADD RESPIN
                        </label>
                        <SwitchRoot
                          id="mobile-respin-toggle"
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
                </div>
              </div>
            </DrawerContent>
          </DrawerViewport>
        </DrawerPortal>
      </DrawerVirtualKeyboardProvider>
    </DrawerRoot>
  </div>
</template>

<style scoped>
.mobile-drawer-dock {
  display: none;
  flex-shrink: 0;
}

.mobile-sheet-bar {
  width: 100%;
  background-color: var(--primary);
  color: var(--accent-yellow);
  border: var(--border);
  box-shadow: var(--shadow);
  padding: 0.65rem 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  touch-action: none;
}

.sheet-bar-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  min-width: 0;
  white-space: nowrap;
}

.sheet-bar-cta {
  flex-shrink: 0;
  background-color: var(--accent-yellow);
  color: var(--primary);
  border: 2px solid var(--accent-yellow);
  padding: 0.3rem 0.65rem;
  font-family: var(--font-heading);
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  cursor: pointer;
  outline: none;
}

.sheet-bar-cta:active {
  background-color: var(--white);
  border-color: var(--white);
}

.drawer-shell {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.drawer-header {
  flex-shrink: 0;
  background-color: var(--accent-yellow);
  border-bottom: var(--border);
  padding: 0.5rem 0.9rem 0.7rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  user-select: none;
}

.drawer-handle {
  width: 44px;
  height: 5px;
  background-color: var(--primary);
  align-self: center;
}

.drawer-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.drawer-title-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.drawer-title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: -0.5px;
}

.drawer-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0.9rem 0.9rem max(0.9rem, env(safe-area-inset-bottom));
  overflow: hidden;
}

.mobile-add-form {
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--white);
  border: var(--border);
  box-shadow: 4px 4px 0px 0px var(--primary);
  padding: 0.4rem 0.45rem 0.4rem 0.75rem;
}

.mobile-add-form:focus-within {
  box-shadow: 0 0 0 3px var(--accent-blue), 4px 4px 0px 0px var(--primary);
}

.mobile-add-input {
  flex: 1;
  min-width: 0;
  border: none;
  background-color: transparent;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary);
  outline: none;
  padding: 0.25rem 0;
}

.mobile-add-btn {
  flex-shrink: 0;
  padding: 0.45rem 0.85rem;
  font-size: 0.85rem;
  box-shadow: 3px 3px 0px 0px var(--primary);
}

.mobile-add-btn:active:not(:disabled):not(.is-locked) {
  transform: translate(3px, 3px);
  box-shadow: 0px 0px 0px 0px var(--primary);
}

.mobile-respin-card {
  flex-shrink: 0;
  padding: 0.75rem 0.9rem;
  gap: 0.65rem;
}

.respin-header {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.respin-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.respin-title {
  margin-bottom: 0;
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.1;
  cursor: pointer;
}

.respin-title.is-locked {
  cursor: not-allowed;
}

.respin-subtitle {
  font-size: 0.78rem;
  line-height: 1.25;
}

.brutalist-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 56px;
  height: 28px;
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
  height: 18px;
  width: 18px;
  background-color: var(--primary);
  transform: translateX(3px);
  transition: transform 0.2s;
}

.brutalist-switch-thumb[data-state='checked'] {
  transform: translateX(29px);
}

@media (max-width: 900px) {
  .mobile-drawer-dock {
    display: block;
  }
}
</style>
