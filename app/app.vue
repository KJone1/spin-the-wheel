<script setup lang="ts">
import type {
  BootstrapPayload,
  Preset,
  RespinConfig,
  WheelEntry,
  WheelSlice
} from '~~/shared/types/wheel'

const { data: bootstrap, error } = await useFetch<BootstrapPayload>('/api/bootstrap')

if (error.value || !bootstrap.value) {
  throw createError({
    statusCode: 500,
    statusMessage: error.value?.statusMessage || 'Failed to load wheel configuration from D1'
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
const autoRespinDelayMs = initialSettings.autoRespinDelayMs
const sliceColors = initialSettings.sliceColors
const colorIndex = ref<number>(entries.value.length % sliceColors.length)
const isDefaultState = ref<boolean>(defaultPreset.isDefault)
const isSpinning = ref<boolean>(false)
const slices = ref<WheelSlice[]>([])

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

const lastWinner = ref<WheelSlice | null>(null)

function handleWinner(slice: WheelSlice): void {
  lastWinner.value = slice
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
            @update:spinning="isSpinning = $event"
            @winner="handleWinner"
          />
          <template #fallback>
            <div class="wheel-placeholder" />
          </template>
        </ClientOnly>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.app-header {
  border: var(--border);
  background-color: var(--white);
  padding: 1.5rem 2rem;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.logo-text {
  font-family: var(--font-heading);
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1px;
  text-transform: uppercase;
}

.main-layout {
  display: grid;
  grid-template-columns: 1.8fr 1.2fr;
  gap: 2rem;
  align-items: stretch;
}

.wheel-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: flex-start;
  align-items: center;
  border: var(--border);
  background-color: var(--white);
  padding: 2.5rem;
  box-shadow: var(--shadow);
}

.wheel-placeholder {
  width: 600px;
  max-width: 100%;
  aspect-ratio: 1 / 1;
  border: var(--border);
  background-color: var(--background);
}

@media (max-width: 900px) {
  .main-layout {
    grid-template-columns: 1fr;
  }

  .logo-text {
    font-size: 2.5rem;
  }

  .wheel-column {
    padding: 1.5rem;
  }
}
</style>
