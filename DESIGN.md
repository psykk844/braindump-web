# BrainDump Design System — Near-Exact Taskbook Web Clone

## Visual Direction
Near-exact web adaptation of Taskbook CLI. The interface should feel like a terminal task manager first, and a web app second: dark monochrome canvas, dense rows, minimal chrome, almost no decoration, and command-like language.

## Core Fidelity Rules
1. Monospace everywhere, no mixed font families.
2. High information density (tight vertical rhythm, compact controls).
3. Flat UI only: no shadows, no gradients, no glassmorphism.
4. Command-oriented copy (`[a] add`, `[b] board`, `@bucket`, `p:1`).
5. Row-first interaction model: task rows are the primary surface.
6. Navigation and actions must appear as terminal command rows, not mobile app chrome.

## Color Tokens
```css
--bg: #101010;
--bg-muted: #151515;
--surface: #1b1b1b;
--text: #e8e8e8;
--text-dim: #b5b5b5;
--text-muted: #8a8a8a;
--border: #2a2a2a;
--accent: #7cc7ff;
--accent-success: #8fd18a;
--accent-warn: #f2c37a;
--accent-danger: #ef8f8f;
```

## Typography
- Font stack: `SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace`
- Body: 14px / 1.35
- Small/meta: 12px / 1.3
- Section headers: 13px / 600
- No decorative font weights; use weight to indicate state only.

## Layout and Spacing
- Max content width: ~960px
- Global spacing rhythm: 4 / 8 / 12 / 16px
- Task row vertical padding: 6–8px
- Section spacing: 12px
- Border radius: 0–2px only

## Component Rules
### Command Row
- Textual command affordances (`[a] add task`, `[i] inbox`, `[r] refresh`)
- Active route visually emphasized through subtle background and text contrast

### Section Header
- ASCII bullet + lowercase label + count: `● top 5 (3)`
- Expand/collapse indicator at right (`+` / `−`)

### Task Row
- Left: `[ ]` / `[x]`
- Body: title
- Right metadata: `@top5`, optional `p:1..3`, drag marker (`::`)
- Notes indicator should be textual (`[note]`), not emoji

### Dialog
- Terminal panel with hard border, no blur effect
- Inputs are flat bordered fields
- Buttons are command-like (`[esc] cancel`, `[enter] add`)

## Do
- Keep copy concise and command-oriented
- Preserve keyboard-friendly focus states
- Prefer textual cues over iconography

## Don't
- No floating action button
- No bottom mobile tab bar
- No rounded "card" visual language
- No colorful badge-heavy UI
