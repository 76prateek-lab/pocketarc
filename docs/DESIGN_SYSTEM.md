# Design System

[`DESIGN.md`](../DESIGN.md) is the authoritative visual reference. PocketArc's
implementation lives in `src/styles` and `src/components/ui`.

## Foundations

- `tokens.css` defines the color, spacing, radius, layout, shadow, focus, and
  motion values. Product code should use these variables instead of literals.
- `typography.css` loads bundled Geist Sans and Geist Mono variable fonts and
  defines the six approved typography classes.
- `reset.css` provides predictable sizing and reduced-motion behavior.
- `global.css` applies the base canvas, text, selection, and focus behavior.
- `utilities.css` contains layout and accessibility helpers.

The interface is achromatic. Blue is reserved for interaction and visible
focus. Status colors are restricted to the `StatusDot` primitive. Containers
use shadow boundaries instead of CSS borders. Functional radii are limited to
6px and 12px, with pill radii reserved for badges and switch tracks.

PocketArc supports `system`, `light`, and `dark` appearance settings. Dark mode
uses the same semantic color and elevation tokens through the
`data-theme="dark"` root attribute; components must not introduce a separate
dark-mode visual language. IndexedDB is the source of truth, while a small
local preference mirror prevents a light flash before React starts.

## Primitives

The public primitive exports are available from `@/components/ui`:

- `Button` and `IconButton`
- `Input`, `Select`, and `Switch`
- `Badge` and `StatusDot`
- `Dialog` and `Sheet`
- `Dropdown` and `Tooltip`
- `Skeleton` and `EmptyState`

All interactive primitives expose semantic HTML, keyboard access, and visible
focus. Dialogs and sheets close with Escape, contain keyboard focus while open,
and restore focus when closed. Dropdown menus support Arrow Up, Arrow Down,
Escape, and Tab behavior.

## Development preview

During Vite development, `/__design-system` renders every primitive and key
state. Its route is guarded by `import.meta.env.DEV`, so it is absent from
production builds and is never included in product navigation.
