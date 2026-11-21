<script setup lang="ts">
import type {
  BootstrapPayload,
  EditableSettings,
  Preset,
  RespinConfig,
  WheelEntry,
  WheelSlice
} from '~~/shared/types/wheel'
import { playTickSound, setSoundMuted } from '~/utils/sound'

const { data: bootstrap, error } = await useFetch<BootstrapPayload>('/api/bootstrap')

if (error.value || !bootstrap.value) {
  throw createError({
    status: 500,
    statusText: error.value?.statusText || 'Failed to load wheel configuration from D1'
  })
}

const initialSettings = bootstrap.value.settings
const presets = computed(() => bootstrap.value!.presets)
const defaultPreset =
  presets.value.find(preset => preset.isDefault) ?? presets.value[0]!

function mapPresetEntries(preset: Preset): WheelEntry[] {
  return preset.entries.map((entry, idx) => ({
    id: `${preset.slug}-${idx + 1}`,
    text: entry.label,
    replicas: entry.replicas,
    color: entry.color
  }))
}

const entries = ref<WheelEntry[]>(mapPresetEntries(defaultPreset))
const respin = reactive<RespinConfig>({
  active: defaultPreset.respinActive,
  replicas: defaultPreset.respinReplicas,
  text: initialSettings.respinLabel,
  color: initialSettings.respinColor
})

const spinDuration = ref<number>(initialSettings.spinDuration)
const soundMuted = ref<boolean>(initialSettings.soundMuted)
const mysteryMode = ref<boolean>(initialSettings.mysteryMode)
const autoRespinDelayMs = initialSettings.autoRespinDelayMs

watch(
  soundMuted,
  muted => {
    if (import.meta.client) {
      setSoundMuted(muted)
    }
  },
  { immediate: true }
)
const sliceColors = initialSettings.sliceColors
const colorIndex = ref<number>(entries.value.length % sliceColors.length)
const isDefaultState = ref<boolean>(defaultPreset.isDefault)
const isSpinning = ref<boolean>(false)
const slices = ref<WheelSlice[]>([])

const mobileDrawerOpen = ref(false)
const presetsOpen = ref(false)
const settingsOpen = ref(false)
const winnerOpen = ref(false)
const currentWinner = ref<WheelSlice | null>(null)

function buildInterleavedSlices(): WheelSlice[] {
  const buckets: WheelSlice[][] = []

  for (const entry of entries.value) {
    const list: WheelSlice[] = []
    for (let i = 0; i < entry.replicas; i++) {
      list.push({
        text: entry.text,
        color: entry.color,
        isRespin: false
      })
    }
    if (list.length > 0) {
      buckets.push(list)
    }
  }

  if (respin.active) {
    const list: WheelSlice[] = []
    for (let i = 0; i < respin.replicas; i++) {
      list.push({
        text: respin.text,
        color: respin.color,
        isRespin: true
      })
    }
    if (list.length > 0) {
      buckets.push(list)
    }
  }

  const nextSlices: WheelSlice[] = []
  let hasMore = true
  while (hasMore) {
    hasMore = false
    for (const list of buckets) {
      const slice = list.shift()
      if (slice) {
        nextSlices.push(slice)
        hasMore = true
      }
    }
  }

  return nextSlices
}

watch(
  [entries, respin],
  () => {
    slices.value = buildInterleavedSlices()
  },
  { deep: true, immediate: true }
)

function addEntry(payload: { text: string; replicas: number }): void {
  if (isSpinning.value) {
    return
  }

  if (isDefaultState.value) {
    entries.value = []
    isDefaultState.value = false
  }

  const color = sliceColors[colorIndex.value] ?? '#ffcc00'
  colorIndex.value = (colorIndex.value + 1) % sliceColors.length

  entries.value.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text: payload.text,
    replicas: payload.replicas,
    color
  })
}

function updateEntryReplicas(id: string, replicas: number): void {
  if (isSpinning.value) {
    return
  }
  const target = entries.value.find(entry => entry.id === id)
  if (!target) {
    return
  }
  target.replicas = replicas
  isDefaultState.value = false
}

function updateEntryColor(id: string, color: string): void {
  if (isSpinning.value) {
    return
  }
  const target = entries.value.find(entry => entry.id === id)
  if (!target) {
    return
  }
  target.color = color
  isDefaultState.value = false
}

function deleteEntry(id: string): void {
  if (isSpinning.value) {
    return
  }
  entries.value = entries.value.filter(entry => entry.id !== id)
  isDefaultState.value = false
}

function toggleRespin(active: boolean): void {
  if (isSpinning.value) {
    return
  }
  respin.active = active
}

function updateRespinReplicas(replicas: number): void {
  if (isSpinning.value) {
    return
  }
  respin.replicas = replicas
}

function disableRespin(): void {
  if (isSpinning.value) {
    return
  }
  respin.active = false
}

function shuffleSlices(): void {
  if (isSpinning.value || slices.value.length <= 1) {
    return
  }

  const next = [...slices.value]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = next[i]!
    next[i] = next[j]!
    next[j] = temp
  }

  slices.value = next
  playTickSound(1200, 0.08)
  setTimeout(() => playTickSound(1500, 0.08), 50)
}

function applyPreset(preset: Preset): void {
  if (isSpinning.value) {
    return
  }
  entries.value = mapPresetEntries(preset)
  respin.active = preset.respinActive
  respin.replicas = preset.respinReplicas
  isDefaultState.value = preset.isDefault
  colorIndex.value = entries.value.length % sliceColors.length
  mobileDrawerOpen.value = false

  playTickSound(1000, 0.1)
  setTimeout(() => playTickSound(1300, 0.15), 100)
}

function handleSettingsSaved(nextSettings: EditableSettings): void {
  spinDuration.value = nextSettings.spinDuration
  soundMuted.value = nextSettings.soundMuted
  mysteryMode.value = nextSettings.mysteryMode
  mobileDrawerOpen.value = false
}

function handleWinner(slice: WheelSlice): void {
  currentWinner.value = slice
  winnerOpen.value = true
}
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="logo-text">WHEEL DECIDES DESTINY</h1>
    </header>

    <main class="main-layout">
      <section class="wheel-column">
        <ClientOnly>
          <WheelCanvas
            :slices="slices"
            :spin-duration="spinDuration"
            :auto-respin-delay-ms="autoRespinDelayMs"
            :mystery-mode="mysteryMode"
            @update:spinning="isSpinning = $event"
            @winner="handleWinner"
          />
          <template #fallback>
            <div class="wheel-placeholder" />
          </template>
        </ClientOnly>
      </section>

      <ControlsPanel
        :respin="respin"
        :is-spinning="isSpinning"
        :can-shuffle="slices.length > 1"
        @add-entry="addEntry"
        @toggle-respin="toggleRespin"
        @shuffle="shuffleSlices"
        @open-presets="presetsOpen = true"
        @open-settings="settingsOpen = true"
      >
        <EntriesList
          :entries="entries"
          :respin="respin"
          :slice-colors="sliceColors"
          :total-slices="slices.length"
          :disabled="isSpinning"
          @update-replicas="updateEntryReplicas"
          @update-color="updateEntryColor"
          @delete-entry="deleteEntry"
          @update-respin-replicas="updateRespinReplicas"
          @disable-respin="disableRespin"
        />
      </ControlsPanel>
    </main>

    <MobileEntriesDrawer
      v-model:open="mobileDrawerOpen"
      :entries="entries"
      :respin="respin"
      :slice-colors="sliceColors"
      :total-slices="slices.length"
      :is-spinning="isSpinning"
      :can-shuffle="slices.length > 1"
      @add-entry="addEntry"
      @update-replicas="updateEntryReplicas"
      @update-color="updateEntryColor"
      @delete-entry="deleteEntry"
      @toggle-respin="toggleRespin"
      @update-respin-replicas="updateRespinReplicas"
      @disable-respin="disableRespin"
      @shuffle="shuffleSlices"
      @open-presets="presetsOpen = true"
      @open-settings="settingsOpen = true"
    />

    <PresetsModal
      v-model:open="presetsOpen"
      :presets="presets"
      :respin-color="respin.color"
      :respin-label="respin.text"
      :is-spinning="isSpinning"
      @apply="applyPreset"
    />

    <SettingsModal
      v-model:open="settingsOpen"
      :spin-duration="spinDuration"
      :sound-muted="soundMuted"
      :mystery-mode="mysteryMode"
      @saved="handleSettingsSaved"
    />

    <WinnerModal
      v-model:open="winnerOpen"
      :winner="currentWinner"
    />
  </div>
</template>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100dvh - 2.5rem);
  min-height: 620px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.app-header {
  flex-shrink: 0;
  border: var(--border);
  background-color: var(--white);
  padding: 1.5rem 2rem;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  container-type: inline-size;
}

.logo-text {
  font-family: var(--font-heading);
  font-size: clamp(1rem, 6.8cqi, 3.5rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1px;
  text-transform: uppercase;
  white-space: nowrap;
}

.main-layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr);
  grid-template-rows: minmax(0, 1fr);
  gap: 1.5rem;
  align-items: stretch;
}

.wheel-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  min-width: 0;
  min-height: 0;
  border: var(--border);
  background-color: var(--white);
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

.wheel-placeholder {
  width: min(100%, max(320px, calc(100dvh - 320px)));
  aspect-ratio: 1 / 1;
  border: var(--border);
  background-color: var(--background);
}

@media (max-width: 900px) {
  .app-container {
    height: calc(100dvh - 0.65rem - max(0.65rem, env(safe-area-inset-bottom)));
    min-height: 540px;
    gap: 0.75rem;
  }

  .app-header {
    padding: 0.9rem 0.65rem;
    text-align: center;
  }

  .logo-text {
    font-size: clamp(1.15rem, 7.9cqi, 3.5rem);
    letter-spacing: -0.03em;
  }

  .main-layout {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .wheel-column {
    flex: 1;
    min-height: 0;
    padding: 0.75rem 0.65rem;
    gap: 0.65rem;
  }

  .wheel-placeholder {
    width: min(100%, 520px, max(220px, calc(100dvh - 390px)));
  }
}
</style>
