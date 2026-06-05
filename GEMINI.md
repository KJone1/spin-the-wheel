# Developer & AI Agent Guidelines (High Signal / Low Token)

## Architecture
- **Tech Stack**: Vanilla HTML5, CSS3, ES6 JS. No build tools, bundlers, or frameworks.
- **File Roles**:
  - [index.html](index.html) -> DOM Structure, Modals, Forms
  - [style.css](style.css) -> Design system, fonts, variables, classes
  - [app.js](app.js) -> State, Canvas rendering, easing physics, sound synth

## Code Standards
- **Style Rules**: Strictly follow [DESIGN.md](DESIGN.md). No soft shadows, gradients, or border-radius. Use `3px` solid borders and `6px` offset shadows.
- **Comments Policy**: Do NOT write single-line or block comments. Keep source code completely self-documenting and raw.
- **Asset Policy**: Avoid external files (images, audio). Use inline SVG or Web Audio API (e.g. synthetic ticks) to ensure offline stability.

## Mechanics
- **Physics**: Time-based easing (`easeOutQuint`) for frame-rate independence.
- **Interleaving**: Replicas are interleaved in `updateSlices()` to alternate sectors (e.g., YES, NO, YES, NO).
- **Auto-Respin**: When landing on the Respin sector, bypass modals, flash button red (`HERE WE GO AGAIN...`), and automatically trigger next spin after `1200ms`.
