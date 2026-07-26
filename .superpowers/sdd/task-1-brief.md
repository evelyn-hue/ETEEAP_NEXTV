## Task 1: Design tokens + Playfair Display

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

### Step 1: Add Playfair Display font to layout.tsx

In `layout.tsx`, modify the imports and font definitions:

```tsx
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});
```

Update the `<html>` tag to include the playfair variable:
```tsx
<html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}>
```

### Step 2: Replace globals.css with the full color token system

Replace the entire `src/app/globals.css` with:

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #0f172a;
  --primary: #1e3a5f;
  --primary-light: #2d4f7a;
  --accent: #d97706;
  --surface-warm: #f8f6f3;
  --surface-muted: #f0ede8;
  --muted: #64748b;
  --success: #16a34a;
  --error: #dc2626;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-light: var(--primary-light);
  --color-accent: var(--accent);
  --color-surface-warm: var(--surface-warm);
  --color-surface-muted: var(--surface-muted);
  --color-muted: var(--muted);
  --color-success: var(--success);
  --color-error: var(--error);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --font-display: var(--font-playfair-display);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
}
```

### Verification
- `npx tsc --noEmit` should pass
- `npm run build` should pass (or at minimum lint)
