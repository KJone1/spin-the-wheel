import type { AppSettings, BootstrapPayload, Preset, PresetEntry } from '~~/shared/types/wheel'

interface SettingRow {
  key: string
  value: string
}

interface PresetRow {
  id: string
  slug: string
  title: string
  is_default: number
  respin_active: number
  respin_replicas: number
}

interface PresetEntryRow {
  id: string
  preset_id: string
  label: string
  replicas: number
  color: string
}

function readRequiredSetting<T>(map: Map<string, string>, key: string): T {
  const raw = map.get(key)
  if (raw === undefined) {
    throw createError({
      statusCode: 500,
      statusMessage: `Missing required app_settings key: ${key}`
    })
  }
  return JSON.parse(raw) as T
}

export default defineEventHandler(async (event): Promise<BootstrapPayload> => {
  const db = getD1Database(event)

  const [settingsResult, presetsResult, entriesResult] = await db.batch([
    db.prepare('SELECT key, value FROM app_settings'),
    db.prepare(
      'SELECT id, slug, title, is_default, respin_active, respin_replicas FROM presets ORDER BY sort_order ASC, id ASC'
    ),
    db.prepare(
      'SELECT id, preset_id, label, replicas, color FROM preset_entries ORDER BY sort_order ASC, id ASC'
    )
  ])

  const settingRows = (settingsResult?.results ?? []) as SettingRow[]
  const presetRows = (presetsResult?.results ?? []) as PresetRow[]
  const entryRows = (entriesResult?.results ?? []) as PresetEntryRow[]

  if (presetRows.length === 0) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database has no seeded presets'
    })
  }

  const settingMap = new Map(settingRows.map(row => [row.key, row.value]))

  const settings: AppSettings = {
    spinDuration: readRequiredSetting<number>(settingMap, 'spin_duration'),
    soundMuted: readRequiredSetting<boolean>(settingMap, 'sound_muted'),
    mysteryMode: readRequiredSetting<boolean>(settingMap, 'mystery_mode'),
    respinLabel: readRequiredSetting<string>(settingMap, 'respin_label'),
    respinColor: readRequiredSetting<string>(settingMap, 'respin_color'),
    autoRespinDelayMs: readRequiredSetting<number>(settingMap, 'auto_respin_delay_ms'),
    sliceColors: readRequiredSetting<string[]>(settingMap, 'slice_colors')
  }

  const entriesByPreset = new Map<string, PresetEntry[]>()
  for (const row of entryRows) {
    const list = entriesByPreset.get(row.preset_id) ?? []
    list.push({
      id: row.id,
      label: row.label,
      replicas: row.replicas,
      color: row.color
    })
    entriesByPreset.set(row.preset_id, list)
  }

  const presets: Preset[] = presetRows.map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    isDefault: row.is_default === 1,
    respinActive: row.respin_active === 1,
    respinReplicas: row.respin_replicas,
    entries: entriesByPreset.get(row.id) ?? []
  }))

  return { settings, presets }
})
