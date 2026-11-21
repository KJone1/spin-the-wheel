# Bauhaus - Neo-Brutalist

## North Star: "Form Follows Function"
Bold, raw, and unapologetic. Inspired by Bauhaus and brutalist architecture. High contrast, strong geometry, deliberate imperfection.

## Colors
- **Primary (`#1a1a1a`):** Near-black for text, borders, and primary elements.
- **Accent Yellow (`#ffcc00`):** High-energy highlight for CTAs, buttons, and active states.
- **Accent Red (`#e63b2e`):** Destructive actions, close buttons, alerts, validation bubbles, and auto-respin highlights.
- **Accent Blue (`#0055ff`):** Interactive focus states and modal outer rings.
- **Background (`#f5f0e8`):** Warm off-white, like aged paper.
- **Surface White (`#ffffff`):** Cards, modals, wheel surface, and inputs.
- Use flat, solid color blocks. No gradients on surfaces.

## Typography
- **Headlines:** Space Grotesk - geometric, bold, oversized (`700`, `800`). Use display sizes aggressively with fluid container-query sizing.
- **Body:** Inter - functional and readable (`400`, `500`, `700`).
- Scale contrast is key: headlines should feel massive relative to body text.

## Elevation
- No soft drop shadows. Use **thick solid borders** (`3px` `#1a1a1a` on cards/controls, `2px` on inner rows, chips, and swatches).
- Depth via **offset shadows**: solid-color block offsets (`6px` down-right in `#1a1a1a` on main containers, `2px`-`4px` on buttons and compact controls).

## Components
- **Buttons:** Solid fill (default yellow, red for destructive/close), thick border, uppercase text. Invert and translate on hover/active; lock cursor and hover effects via `.is-locked` while spinning.
- **Cards:** Thick black borders, zero border-radius, offset shadow, content-dense.
- **Inputs & Counters:** Full-bordered add-entry bar with blue focus ring and red validation bubble; boxed numeric steppers (`BauhausCounter`) with yellow +/- buttons.
- **Switches & Pickers:** Square brutalist Reka Switches (yellow when checked), popover color swatch grid (`EntryColorPicker`), and Reka ScrollArea with a solid black thumb.
- **Modals & Drawer:** Centered Reka Dialog modals with colored outer ring (yellow for Presets, blue for Settings and Winner), plus a swipeable Reka Drawer bottom sheet on mobile (`<= 900px`).

## Layout Structure
- **Desktop (`> 900px`) Two-Column Asymmetric Grid:**
  - **Left Column (`1.8fr`):** Bordered white wheel card containing the Wheel canvas and Spin CTA button.
  - **Right Column (`1.2fr`):** `CONTROLS` panel with `AddEntryForm`, scrollable `EntriesList` card, Respin toggle card, and button row (`SHUFFLE`, `PRESETS`, `SETTINGS`).
- **Mobile (`<= 900px`) Single-Column View:**
  - Full-height wheel card above a bottom yellow `CONTROLS` dock bar that opens `MobileEntriesDrawer` with `AddEntryForm`, embedded `EntriesList`, Respin toggle, and action buttons.

## Rules
- Never use soft shadows, border-radius, or glassmorphism. Keep it raw and graphic.
- Embrace asymmetric layouts and oversized type.
- Limited palette: black + one accent per section.
