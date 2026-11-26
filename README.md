# Sparkwire Console

An ops console built on [Sparkwire](https://github.com/phoenix-am/spark-ui), installed from npm like any other app. It exists to test the library the way its users meet it: install, types, CSS, real pages, real browsers, screen-reader text and bundle size.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build && npm run test:e2e
```

## What it uses

| Page | Components |
|---|---|
| Overview | Card, Badge, Progress, LineChart, DonutChart, BarChart |
| Services | DataTable (search, sort, multi-select, bulk action, paging), Modal, Toast with Undo |
| New deployment | Combobox, Textfield, Dropdown, NumberField, DatePicker, TimePicker, Switch, Textarea, validation |
| Everywhere | Sidebar (drawer on phones), CommandPalette, ToggleGroup, Tooltip, ThemeProvider, SparkProvider (energy, language) |

Settings (light/dark, energy, language) are kept in `localStorage`.

## Checks

- **Typecheck** against the published `.d.ts` files, with `skipLibCheck: false`.
- **Browser tests** in Chromium, Firefox, WebKit and an iPhone viewport: user flows, plus axe on every page in dark and light.
- **Bundle size** of the built app against `scripts/size-budget.json`.
- **Weekly run**, so a new Sparkwire release that breaks the app is caught even when the app hasn't changed.

