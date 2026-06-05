# WHEEL DECIDES DESTINY

A responsive, high-performance, and mathematically precise "Spin the Wheel" static website designed in a bold **Bauhaus / Neo-Brutalist** style.

## Stack
- Vanilla HTML5
- Vanilla CSS3 Custom Properties
- Vanilla ES6 JavaScript (zero dependencies)

## Features
- **Alternating Wheel Sectors**: Dynamic slice generator automatically interleaves entry weights (e.g., YES, NO, YES, NO) to distribute duplicates evenly around the wheel.
- **Synthesized Audio Engine**: Uses the browser's native **Web Audio API** to generate physical mechanical ticks as slice boundaries cross the ticker pin. Pitch scales down dynamically with rotation speed.
- **Configurable Easing Physics**: Utilizes a frame-rate-independent Quintic Ease-Out curve to spin for the exact duration defined in Settings.
- **Automatic Respins**: Landing on a red "RESPIN" slice immediately displays "HERE WE GO AGAIN...", flashes red, and spins again automatically after 1.2s without modal prompting.
- **Custom Presets**: Load pre-configured wheels from the Presets panel (including *Yes or No*, *Who Pays*, *Food Category*, *Wolt or No Wolt*).
- **Responsive Layout**: Asymmetric two-column desktop grid that scales down gracefully to a single-column block layout on mobile screens.

## Getting Started

Since it is a 100% static application with no build steps or dependencies, you can run it instantly by double-clicking the `index.html` file in your browser.

Alternatively, if you have `just` installed, launch it from your terminal:

```bash
just run
```
