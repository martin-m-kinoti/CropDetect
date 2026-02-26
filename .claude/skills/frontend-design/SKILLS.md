---
name: react-frontend-design
description: Build distinctive, production-grade ReactJS components, pages, and applications with high design quality and clean architecture. Use this skill whenever the user asks to create, build, design, or improve any React UI — including components, dashboards, landing pages, forms, data visualizations, interactive apps, or any other React-based interface. Also trigger when the user says things like "make this look better in React", "build me a React app", "create a component", or "I need a React UI for X". Always use this skill over generic responses for React frontend work.
---

# React Frontend Design Skill

Build beautiful, production-ready React applications and components with a clear aesthetic identity and clean, modern architecture. Avoid generic AI-generated code and design patterns.

---

## Step 1: Design Thinking (Before You Code)

Before writing a single line of JSX, define the direction:

**Context**
- What is this component/page for? Who is the user?
- What emotion or experience should it evoke?
- What are the technical constraints (React version, Tailwind, libraries)?

**Aesthetic Commitment**
Pick a clear visual direction and execute it with precision. Options include:
- **Minimal/Swiss**: Clean grid, precise spacing, one or two typefaces, pure function
- **Brutalist/Raw**: Bold type, stark contrast, unexpected layouts, exposed structure
- **Soft/Organic**: Rounded corners, muted pastels, gentle motion, approachable
- **Dark/Premium**: Deep backgrounds, glowing accents, refined typography, drama
- **Retro/Nostalgic**: Pixel hints, warm palettes, familiar-but-twisted UI patterns
- **Editorial/Magazine**: Expressive type hierarchy, asymmetry, journalistic layout
- **Playful/Toy-like**: Bright colors, bouncy micro-interactions, fun typography

> **The key**: Commit hard to one direction. The worst designs are indecisive.

---

## Step 2: Architecture Decisions

### Component Structure
```
ComponentName/
├── index.jsx          ← main component
├── components/        ← sub-components (if complex)
├── hooks/             ← custom hooks
└── utils.js           ← helpers
```

For single-file artifacts, organize top-to-bottom:
1. Imports
2. Constants / config
3. Sub-components (small, internal)
4. Main component
5. `export default`

### State Management Strategy
| Scope | Solution |
|-------|----------|
| Local UI state | `useState`, `useReducer` |
| Side effects / data | `useEffect`, custom hooks |
| Shared across siblings | Lift state up |
| Global / cross-page | Context API or Zustand |
| Server state | React Query / SWR |

### When to Extract a Custom Hook
- Logic is reused in 2+ places
- Logic is complex enough to be tested independently
- It has its own state + effects (e.g., `useFetch`, `useDebounce`, `useLocalStorage`)

---

## Step 3: React Implementation Standards

### JSX Principles
- One component per conceptual concern
- Props should be explicit; avoid catch-all objects
- Prefer composition over configuration
- Use semantic HTML inside JSX (`<nav>`, `<main>`, `<section>`, `<article>`)

### Styling Approach (in priority order)
1. **Tailwind CSS** — use core utility classes only (no arbitrary values unless needed)
2. **CSS-in-JS** — styled-components or emotion for complex dynamic styles
3. **CSS Modules** — for scoped styles in file-based projects
4. **Inline styles** — only for truly dynamic computed values (e.g., animation progress)

### Animations & Motion
- Use **Framer Motion** (`framer-motion`) for complex animations in React
- Use **CSS transitions** for simple hover/focus states
- Use `useReducedMotion()` to respect accessibility preferences
- Stagger children with `variants` and `staggerChildren` for lists

```jsx
// Example: Framer Motion staggered list
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(i => <motion.li key={i.id} variants={item}>{i.name}</motion.li>)}
</motion.ul>
```

### Performance Patterns
- `useMemo` for expensive computations (don't overuse)
- `useCallback` for functions passed as props to memoized children
- `React.memo()` for pure components that re-render too often
- `React.lazy()` + `Suspense` for code-splitting large components
- Avoid anonymous functions in render when passed to memoized children

---

## Step 4: Design System & Visual Quality

### Typography
- Import from Google Fonts via `@import` in CSS or via a `<link>` tag
- Pair a **display font** (headings) with a **text font** (body)
- Avoid Inter, Roboto, Arial, system-ui as primary typefaces — use something memorable
- Use `clamp()` for fluid type sizes: `font-size: clamp(1rem, 2.5vw, 1.5rem)`

**Good pairings:**
- `Playfair Display` + `Source Serif 4` (editorial)
- `DM Serif Display` + `DM Sans` (modern/clean)
- `Space Mono` + `IBM Plex Sans` (technical/developer)
- `Cormorant Garamond` + `Lato` (luxury/refined)
- `Syne` + `Outfit` (futuristic/bold)

### Color Strategy
- Define a CSS custom properties palette at `:root`
- Use a **dominant** color + **accent** + **neutrals** structure
- Dominant colors with sharp accents > even distribution
- Don't default to purple gradients — be specific and intentional

```css
:root {
  --color-bg: #0a0a0f;
  --color-surface: #14141f;
  --color-accent: #e8ff3c;
  --color-text: #f0f0f0;
  --color-muted: #6b6b7a;
}
```

### Spacing & Layout
- Use consistent spacing scale (multiples of 4px or 8px)
- Prefer `gap` over margins for flex/grid children
- Use CSS Grid for page-level layouts, Flexbox for component-level
- Consider **asymmetry** — off-center compositions are more memorable

### Interactive States
Every interactive element needs:
- `:hover` — visual feedback
- `:focus-visible` — keyboard accessibility (don't use `:focus` alone)
- `:active` — tactile press feedback
- Disabled state — muted, not-allowed cursor

---

## Step 5: Accessibility (Non-Negotiable)

- All images need `alt` text (empty `alt=""` for decorative images)
- Form inputs need associated `<label>` elements
- Interactive elements must be keyboard-accessible
- Color contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Use ARIA roles only when semantic HTML doesn't cover it
- Modals/dialogs: trap focus, `aria-modal="true"`, close on Escape

---

## Step 6: Available Libraries in Artifacts

When building **React artifacts** (`.jsx`), these libraries are importable:

| Library | Import |
|---------|--------|
| Framer Motion | `import { motion } from 'framer-motion'` |
| Recharts | `import { LineChart, BarChart, ... } from 'recharts'` |
| Lucide React | `import { Star, ArrowRight, ... } from 'lucide-react'` |
| D3 | `import * as d3 from 'd3'` |
| Lodash | `import _ from 'lodash'` |
| Shadcn/ui | `import { Button, Card, ... } from '@/components/ui/...'` |
| Three.js | `import * as THREE from 'three'` |
| Tone.js | `import * as Tone from 'tone'` |
| MathJS | `import * as math from 'mathjs'` |

> ⚠️ **No localStorage/sessionStorage** in artifacts — use `useState`/`useReducer` for all state.

---

## Step 7: Code Quality Standards

```jsx
// ✅ Good: Descriptive, single-purpose, clean props
function ProductCard({ title, price, imageUrl, onAddToCart }) {
  return (
    <article className="product-card">
      <img src={imageUrl} alt={title} />
      <h3>{title}</h3>
      <span>${price}</span>
      <button onClick={onAddToCart}>Add to Cart</button>
    </article>
  )
}

// ❌ Bad: Vague, prop-spreads, no semantics
function Card({ data, ...props }) {
  return <div {...props}>{data.stuff}</div>
}
```

### Checklist Before Finalizing
- [ ] No `console.log` left in production code
- [ ] No hardcoded colors — use CSS variables or Tailwind tokens
- [ ] All lists have stable `key` props (not array index if list can reorder)
- [ ] No missing `useEffect` dependencies
- [ ] Loading and error states handled for async operations
- [ ] Mobile responsive (test at 375px, 768px, 1280px)
- [ ] Semantic HTML throughout
- [ ] Focus states visible

---

## Common Patterns Reference

See `references/patterns.md` for reusable implementations of:
- Animated page transitions
- Infinite scroll
- Drag-and-drop
- Modal/dialog with portal
- Toast notifications
- Data table with sort/filter
- Form validation with React Hook Form
- Dark mode toggle with CSS variables
- Skeleton loading screens

---

## Anti-Patterns to Avoid

| ❌ Don't | ✅ Do Instead |
|---------|--------------|
| `useEffect` for derived state | Compute it inline during render |
| Storing component in state | Store data, derive component in render |
| Index as `key` in dynamic lists | Use stable unique IDs |
| Prop drilling 3+ levels | Context or component composition |
| Giant monolithic components | Split at 100-150 lines max |
| Anonymous arrow functions in JSX for memoized children | `useCallback` |
| `any` type or unchecked data | PropTypes or TypeScript |
| Generic placeholder content | Real, context-appropriate copy |

---

## Final Output Standard

Deliver code that is:
1. **Functional** — works correctly with no console errors
2. **Beautiful** — striking, intentional visual design
3. **Accessible** — keyboard-navigable, screen-reader friendly  
4. **Clean** — readable, well-structured, easy to extend
5. **Responsive** — works on mobile, tablet, desktop

> Remember: The goal is work that could ship to production and that someone would be proud to have built. Every pixel, every interaction, every prop name matters.