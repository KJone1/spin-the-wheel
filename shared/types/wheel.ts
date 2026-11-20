export interface WheelEntry {
  id: string
  text: string
  replicas: number
  color: string
}

export interface WheelSlice {
  text: string
  color: string
  isRespin: boolean
}

export interface RespinConfig {
  active: boolean
  replicas: number
  text: string
  color: string
}

export interface PresetEntry {
  id: string
  label: string
  replicas: number
  color: string
}

export interface Preset {
  id: string
  slug: string
  title: string
  isDefault: boolean
  respinActive: boolean
  respinReplicas: number
  entries: PresetEntry[]
}

export interface AppSettings {
  spinDuration: number
  respinLabel: string
  respinColor: string
  autoRespinDelayMs: number
  sliceColors: string[]
}

export interface BootstrapPayload {
  settings: AppSettings
  presets: Preset[]
}
