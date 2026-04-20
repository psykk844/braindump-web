# BrainDump Design System - Taskbook Inspired

## Visual Direction
Terminal-inspired productivity interface based on Taskbook's CLI aesthetic. Monospace typography, compact layout, minimal chrome, maximum information density. Clean, functional, keyboard-friendly design adapted for web/mobile.

## Color Palette

### Light Terminal Theme
```css
--bg-primary: #fafafa;
--bg-secondary: #f5f5f5;
--bg-tertiary: #eeeeee;

--text-primary: #212121;
--text-secondary: #424242;
--text-tertiary: #757575;
--text-muted: #9e9e9e;

--accent-blue: #2196f3;
--accent-green: #4caf50;
--accent-orange: #ff9800;
--accent-red: #f44336;

--border: #e0e0e0;
--border-dark: #bdbdbd;

--shadow: rgba(0, 0, 0, 0.05);
```

## Typography

### Font Stack
```css
font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro', monospace;
```

### Scale (Compact, Terminal-like)
- **Heading**: 16px / 600 / 1.4
- **Body**: 14px / 400 / 1.5
- **Small**: 13px / 400 / 1.4
- **Tiny**: 12px / 400 / 1.3

## Layout Principles

1. **Compact Density**: Minimal padding, tight spacing
2. **Terminal Width**: Max 800px for readability
3. **List-First**: Everything is a list
4. **No Cards**: Flat, bordered sections only
5. **Monospace Grid**: Align to character grid

## Component Patterns

### Task Item
```
[ ] 1. Task title here                    @board  p:2  ★
```
- Checkbox: `[ ]` or `[✓]`
- ID: Small number
- Title: Monospace, truncate long
- Metadata: Right-aligned (board, priority, star)

### Section Header
```
● Top 5 (3)
```
- Icon: ●, ○, ◌
- Title: Bold
- Count: In parentheses

### Priority Indicators
- p:1 - Normal (no color)
- p:2 - Medium (orange)
- p:3 - High (red)

## Spacing System
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
```

## Do's
✓ Use monospace everywhere
✓ Keep layout compact and dense
✓ Use simple ASCII-style icons
✓ Align metadata to right
✓ Show IDs for keyboard navigation
✓ Minimal borders, flat design

## Don'ts
✗ No rounded corners (except buttons)
✗ No shadows (except subtle on hover)
✗ No gradients
✗ No fancy animations
✗ No card-based layouts
