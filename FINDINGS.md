# What this app found in Sparkwire

Newest first. Each entry: what happened in the app, the cause in the library, and the release that fixed it.

## 0.4.4

| Found | Cause | Fix |
|---|---|---|
| Light mode failed contrast: page text was light-theme dark grey on a still-dark page | `ThemeProvider` only themed its own subtree; `<body>` kept the dark tokens | New `global` prop puts the mode on `<html>` |
| In Hindi, screen readers heard "Select All", "Show suggestions", "Increase Replicas", "Calendar", "Previous", "Next", "Today, …", "Dismiss" | Those labels come from React Aria, which has no Hindi, Gujarati or Tamil | Sparkwire's own translated messages replace them |
| Every row checkbox was announced as just "Select" | The row's name (`aria-labelledby`) was dropped | Named after the row: "Select payments" |
| The sidebar stopped after its last item instead of filling the screen | `height: 100%` with a parent sized by its content | `align-self: stretch` and `min-height: 100%` |
| Uptime of 99.5% showed "100%" | `Progress` rounded to nearest | Rounds down; 100% only when done |

## Not library bugs, worth knowing

- With `skipLibCheck: false` and `lib` below ES2023, a dependency's types (`@internationalized/number`) need `Intl.NumberRangeFormatPart`. Use `"lib": ["ES2023", …]` or `skipLibCheck: true`.
- Change handlers differ: `Textfield` gives an event, `Textarea` gives the string, `Switch` gives a boolean. Worth unifying before 1.0.
- A sticky top bar needs `scroll-padding-top` on `<html>`, or focused fields and open lists slide under it.

## Test tooling

- Running axe-core in headless Firefox on GitHub Actions crashes the page process. Switching themes in Firefox without axe works, so the
  accessibility checks run in Chromium and WebKit only.
- Theme colours fade, so contrast must be checked after the CSS transitions end (WebKit caught a mid-fade frame).
