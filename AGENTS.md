# Developer & AI Agent Guidelines (High Signal / Low Token)

## Architecture

- **Tech Stack**: Nuxt 4, Vue 3, TypeScript, Reka UI (`reka-ui/nuxt`), Lucide Vue (`@lucide/vue`), Cloudflare Workers (`cloudflare_module`), Cloudflare D1 (raw SQL).
- **File Roles**:
  - `app/app.vue` -> Root layout, SSR bootstrap state, slice interleaving, desktop/mobile coordination
  - `app/assets/css/theme.css` -> Bauhaus Neo-Brutalist CSS variables and shared primitives (cards, buttons, modals, drawer)
  - `app/components/WheelCanvas.vue` -> Client-only Canvas rendering, easing physics, center-hub click, mystery mode, auto-respin
  - `app/components/ControlsPanel.vue` -> Desktop (`> 900px`) controls column: `AddEntryForm`, slot for `EntriesList`, Respin Reka Switch, action buttons
  - `app/components/MobileEntriesDrawer.vue` -> Mobile (`<= 900px`) Reka Drawer bottom sheet with `AddEntryForm`, embedded `EntriesList`, Respin Reka Switch, action buttons
  - `app/components/AddEntryForm.vue` -> Shared add-entry text form with custom validation bubble
  - `app/components/EntriesList.vue` -> Scrollable Reka ScrollArea entry list (standalone or embedded) with `EntryColorPicker` and `BauhausCounter`
  - `app/components/EntryColorPicker.vue` -> Reka Popover + ColorSwatchPicker for per-entry slice color selection
  - `app/components/BauhausCounter.vue` -> Shared Reka NumberField stepper (normal and compact modes)
  - `app/components/*Modal.vue` -> Reka Dialog modals (`PresetsModal`, `SettingsModal`, `WinnerModal`)
  - `app/utils/sound.ts` -> Web Audio API tick synth and global mute state (`setSoundMuted`)
  - `server/utils/d1.ts` -> Cloudflare D1 binding helper (`getD1Database`)
  - `server/api/bootstrap.get.ts` -> Read-only D1 presets and settings loader (no fallback)
  - `server/api/settings.patch.ts` -> Validated D1 `app_settings` write endpoint (`spinDuration`, `soundMuted`, `mysteryMode`)
  - `shared/types/wheel.ts` -> Shared TypeScript interfaces for app and server
  - `db/migrations/` & `db/seed.sql` -> D1 SQLite schema, migrations, and seed data

## Code Standards

- **Style Rules**: Strictly follow [DESIGN.md](DESIGN.md). Plain scoped CSS + theme tokens. No soft shadows, gradients, or border-radius. Use `3px` solid borders and `6px` offset shadows.
- **Comments Policy**: Do NOT write single-line or block comments. Keep source code completely self-documenting and raw.
- **Asset Policy**: Avoid external media files (images, audio). Use `@lucide/vue` icons, local/inline SVG (`public/favicon.svg`), and Web Audio API synthetic ticks (fonts load from Google Fonts in `nuxt.config.ts`).

## Mechanics

- **Physics**: Time-based easing (`easeOutQuint`) inside `WheelCanvas.vue` for frame-rate independence.
- **Interleaving**: Replicas are interleaved in `buildInterleavedSlices()` to alternate sectors (e.g., YES, NO, YES, NO).
- **Auto-Respin**: When landing on the Respin sector, bypass modals, flash button red (`HERE WE GO AGAIN...`), and automatically trigger next spin after `autoRespinDelayMs`.
- **Mystery Mode & Sound Mute**: Persisted in D1 via `PATCH /api/settings`. Mystery mode hides slice colors and labels behind `?` icons while spinning, and mute silences Web Audio ticks.
