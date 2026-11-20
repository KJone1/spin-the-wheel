# Developer & AI Agent Guidelines (High Signal / Low Token)

## Architecture
- **Tech Stack**: Nuxt 4, Vue 3, TypeScript, Reka UI (`reka-ui/nuxt`), Cloudflare Workers (`cloudflare_module`), Cloudflare D1 (raw SQL).
- **File Roles**:
  - `app/app.vue` -> Root layout, SSR bootstrap state, slice interleaving
  - `app/assets/css/theme.css` -> Bauhaus Neo-Brutalist CSS variables and shared primitives
  - `app/components/WheelCanvas.vue` -> Client-only Canvas rendering, easing physics, auto-respin
  - `app/components/ControlsPanel.vue` -> Entry form, Reka Switch, Reka NumberField, action buttons
  - `app/components/ActiveEntries.vue` -> Active slice rows with Reka NumberField steppers
  - `app/components/*Modal.vue` -> Reka Dialog modals (`PresetsModal`, `SettingsModal`, `WinnerModal`)
  - `app/utils/sound.ts` -> Web Audio API tick synth
  - `server/api/bootstrap.get.ts` -> Read-only D1 presets and settings loader (no fallback)
  - `server/api/settings.patch.ts` -> Validated D1 `app_settings` write endpoint
  - `db/migrations/` & `db/seed.sql` -> D1 SQLite schema and seed data

## Code Standards
- **Style Rules**: Strictly follow [DESIGN.md](DESIGN.md). Plain scoped CSS + theme tokens. No soft shadows, gradients, or border-radius. Use `3px` solid borders and `6px` offset shadows.
- **Comments Policy**: Do NOT write single-line or block comments. Keep source code completely self-documenting and raw.
- **Asset Policy**: Avoid external files (images, audio). Use inline SVG or Web Audio API (e.g. synthetic ticks) to ensure offline stability.

## Mechanics
- **Physics**: Time-based easing (`easeOutQuint`) inside `WheelCanvas.vue` for frame-rate independence.
- **Interleaving**: Replicas are interleaved in `buildInterleavedSlices()` to alternate sectors (e.g., YES, NO, YES, NO).
- **Auto-Respin**: When landing on the Respin sector, bypass modals, flash button red (`HERE WE GO AGAIN...`), and automatically trigger next spin after `autoRespinDelayMs`.
