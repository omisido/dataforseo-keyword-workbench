# Keyword Workbench Design System

## Tokens

**Colour:** Navy `#101827`, ink `#172235`, muted `#647087`, canvas `#f5f7fb`, surface `#ffffff`, line `#e1e6ef`, primary `#086de8`, primary-hover `#075ad7`, accent `#f6c94c`, success `#13866f`, error `#c43d4d`.

**Typography:** Inter/system sans for UI; ui-monospace for data. Scale: 12, 14, 16, 18, 24, 32 px. Weights: 400, 500, 600, 700. Letter spacing is `0`.

**Spacing:** 4 px base; steps 4, 8, 12, 16, 24, 32, 48.

**Radius:** 0, 4, 6, 8 px. Cards and framed tools use 8 px maximum.

**Shadows:** subtle `0 1px 2px rgba(24,33,29,.08)` and overlay `0 12px 30px rgba(24,33,29,.16)`.

**Breakpoints:** 640, 900, 1200 px.

**Layers:** base 0, sticky 20, overlay 40, toast 60.

## Components

- Button: primary, secondary, ghost; icon support; visible focus and loading states.
- Textarea: labelled, error-described and monospace keyword input.
- Select: labelled market controls.
- Alert: info, warning and error states with live-region semantics.
- Data table: sortable headers, stable columns and horizontal overflow.
- Status badge: configured, volume and competition states.
- Toolbar: market selectors, submit action and CSV export.

## Accessibility

All controls use native elements and labels. Focus indicators are never removed. Status changes use an ARIA live region. Table sorting exposes `aria-sort`. Colour is never the only status signal.
