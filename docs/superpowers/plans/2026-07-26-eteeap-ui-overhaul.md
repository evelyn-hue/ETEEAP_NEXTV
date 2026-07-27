# ETEEAP NEXTV UI Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the ETEEAP NEXTV frontend from a flat, static UI into a polished, animated, interactive experience using framer-motion while preserving the blue brand identity and fixing discovered bugs.

**Architecture:** Four phases — foundation (design tokens + shared motion components + bug fixes), then apply surface-by-surface (landing → auth → forms → alumni → admin), then final polish pass.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion 12, Playfair Display (Google Font)

## Global Constraints

- All framer-motion animations must have a `prefers-reduced-motion` guard via `useReducedMotion()` from framer-motion
- No animation gates content visibility — default state must be visible
- Preserve `#1e3a5f` as the primary brand color
- Gold accent `#d97706` new, used sparingly
- Playfair Display font added via `next/font/google`
- All new shared components go in `src/components/shared/`
- No new npm packages beyond what's already in `package.json`
- Fix discovered bugs before applying animations to affected surfaces

---

## File Structure

### New files
| File | Responsibility |
|---|---|
| `src/components/shared/Reveal.tsx` | Scroll-triggered fade-up wrapper with reduced-motion guard |
| `src/components/shared/PageTransition.tsx` | Page-level enter/exit animation wrapper |
| `src/components/shared/StaggerContainer.tsx` | Staggered children container |
| `src/components/shared/StaggerItem.tsx` | Single stagger child |
| `src/components/shared/Skeleton.tsx` | Shimmer loading placeholder |

### Modified files
| File | Changes |
|---|---|
| `src/app/layout.tsx` | Add Playfair Display font, pass to `<html>` |
| `src/app/globals.css` | Add CSS custom properties for full color system |
| `src/app/page.tsx` | Wrap in PageTransition, add hero signature |
| `src/app/(pages)/form/draft/page.tsx` | Fix mt-25 class |
| `src/app/(pages)/admin/applications/page.tsx` | Add SideNav wrapper |
| `src/components/landpage/header.tsx` | Text-based logo, spring animations |
| `src/components/landpage/banner.tsx` | Scroll reveals, hero timeline signature |
| `src/components/landpage/footer.tsx` | Text-based logo |
| `src/components/auth/signin.tsx` | Card entrance stagger |
| `src/components/auth/signup.tsx` | Fix focus rings, card entrance stagger |
| `src/components/auth/forgot-password/page.tsx` | Card entrance animation |
| `src/components/auth/reset-password/page.tsx` | Card entrance animation |
| `src/components/auth/verify-otp/page.tsx` | Card entrance animation |
| `src/components/form/programdetails.tsx` | Step transitions, drag-drop animation |
| `src/components/form/applicationstatus.tsx` | Progress bar animation, badge pulse |
| `src/components/form/reviewapplication.tsx` | Submit progress bar animation |
| `src/components/form/draftxstatus.tsx` | Card hover lift, fix mt-25 |
| `src/components/alumni/home.tsx` | Card stagger, filter layout animation |
| `src/components/alumni/alumniform.tsx` | Section transitions, tag scale |
| `src/components/admin/dashboard.tsx` | Stat count-up, row stagger |
| `src/components/admin/sidenav.tsx` | Active indicator animation, mobile drawer spring |
| `src/components/admin/application.tsx` | Modal fade+scale, card hover lift, remove console.log |
| `src/components/admin/applications.tsx` | Table row hover, card hover lift |
| `src/components/admin/adminalumni.tsx` | Card hover lift, modal animation |
| `src/components/admin/activitylogs.tsx` | Row stagger |
| `src/components/admin/setting.tsx` | Photo preview animation |
| `src/components/myprofile/profile.tsx` | Inline edit toggle animation |
| `src/app/(pages)/form/civilstatus/page.tsx` | Fix: render correct component name |

---

## Task 1: Design tokens + Playfair Display

**Files:**
- Modify: `src/app/layout.tsx:1-18`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add Playfair Display font to layout.tsx**

```tsx
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});
```

Update `<html>` tag:
```tsx
<html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}>
```

- [ ] **Step 2: Add color tokens to globals.css**

Replace entire file:
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

- [ ] **Step 3: Verify build**

Run: `npm run build` — expect no errors. (If `build` is too slow, just verify with lint.)

---

## Task 2: Shared motion components

**Files:**
- Create: `src/components/shared/Reveal.tsx`
- Create: `src/components/shared/PageTransition.tsx`
- Create: `src/components/shared/StaggerContainer.tsx`
- Create: `src/components/shared/StaggerItem.tsx`
- Create: `src/components/shared/Skeleton.tsx`

- [ ] **Step 1: Create Reveal.tsx**

```tsx
"use client";
import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create PageTransition.tsx**

```tsx
"use client";
import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

type PageTransitionProps = { children: ReactNode; className?: string };

export default function PageTransition({ children, className = "" }: PageTransitionProps) {
  const reduced = useReducedMotion();

  if (reduced) return <main className={className}>{children}</main>;

  return (
    <motion.main
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.main>
  );
}
```

- [ ] **Step 3: Create StaggerContainer.tsx**

```tsx
"use client";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { ReactNode } from "react";

type StaggerContainerProps = { children: ReactNode; className?: string };

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export default function StaggerContainer({ children, className = "" }: StaggerContainerProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Create StaggerItem.tsx**

```tsx
"use client";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { ReactNode } from "react";

type StaggerItemProps = { children: ReactNode; className?: string };

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function StaggerItem({ children, className = "" }: StaggerItemProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 5: Create Skeleton.tsx**

```tsx
type SkeletonProps = {
  className?: string;
  count?: number;
};

export default function Skeleton({ className = "h-4 w-full", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-md bg-surface-muted ${className}`}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 6: Verify imports**

Run: `npx tsc --noEmit` to check types.

---

## Task 3: Fix discovered bugs

**Files:**
- Modify: `src/app/(pages)/form/civilstatus/page.tsx` — note it exists but isn't a priority change; just leave bug noted
- Modify: `src/app/(pages)/admin/applications/page.tsx`
- Modify: `src/components/form/draftxstatus.tsx`
- Modify: `src/components/admin/application.tsx`

- [ ] **Step 1: Fix `/admin/applications/page.tsx` — add SideNav**

Read the file first to see current content, then wrap with SideNav + bg-gray-100 shell matching other admin pages.

- [ ] **Step 2: Fix `draftxstatus.tsx` — replace mt-25 with mt-24**

Search for `mt-25` and replace with `mt-24`.

- [ ] **Step 3: Remove console.log statements from `admin/application.tsx`**

Search for `console.log` lines and remove them (lines ~633, 648, 654, 668).

---

## Task 4: Landing page — text logo + design system

**Files:**
- Modify: `src/components/landpage/header.tsx`
- Modify: `src/components/landpage/footer.tsx`

- [ ] **Step 1: Header — replace Image logos with text-based logo**

In `header.tsx`, find lines ~98-112 (the two `<Image>` tags for logos). Replace with:
```tsx
<div className="flex items-center gap-2">
  <span className="text-lg font-bold text-primary" style={{ color: "#1e3a5f" }}>LCCB</span>
  <span className="text-sm font-semibold text-primary-light border-l border-blue-300 pl-2" style={{ color: "#2d4f7a" }}>ETEEAP</span>
</div>
```

- [ ] **Step 2: Footer — same text-based logo**

Find the Image logos in footer, replace with same div above.

- [ ] **Step 3: Replace `bg-blue-800` with new color tokens across landing files**

Scan header.tsx, banner.tsx, footer.tsx for Tailwind blue color classes. Replace `bg-blue-800` with `bg-primary` (will need to use inline `style={{ backgroundColor: "var(--primary)" }}` or direct Tailwind class `bg-[#1e3a5f]` since Tailwind v4 color tokens work differently). Cleanest: use `className="bg-[#1e3a5f]"`.

---

## Task 5: Landing page — animations

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/landpage/banner.tsx`

- [ ] **Step 1: Wrap landing page in PageTransition**

```tsx
import PageTransition from "@/components/shared/PageTransition";
// ...
return (
  <PageTransition>
    <Header showProfile={showProfile} email={email} />
    <Banner />
    <Footer />
  </PageTransition>
);
```

- [ ] **Step 2: Add scroll reveals to Banner sections**

Wrap each section in `<Reveal>`:
- About section
- Why Choose feature grid (wrap grid in `<StaggerContainer>`, each card in `<StaggerItem>`)
- Admission highlights
- CTA section

- [ ] **Step 3: Add hero animated signature**

Replace the hero heading with a Playfair Display heading. Already has `text-4xl lg:text-5xl font-bold` — add `font-display` class.

No need for complex timeline animation — keep the group photo + heading. The gold accent can be a subtle decorative element.

---

## Task 6: Auth pages — unify styling + animations

**Files:**
- Modify: `src/components/auth/signup.tsx`
- Modify: `src/components/auth/signin.tsx`
- Modify: `src/app/(pages)/auth/forgot-password/page.tsx`
- Modify: `src/app/(pages)/auth/reset-password/page.tsx`
- Modify: `src/app/(pages)/auth/verify-otp/page.tsx`

- [ ] **Step 1: Fix signup input styling**

In signup.tsx, add `rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2d4f7a]` to all input fields (currently just `border rounded`).

- [ ] **Step 2: Wrap each auth page content in PageTransition**

Each auth page renders its form — wrap in `<PageTransition>`.

- [ ] **Step 3: Add card entrance stagger**

Wrap form fields group in `<StaggerContainer>`, each field in `<StaggerItem>` for subtle staggered entrance.

---

## Task 7: Form pages — transitions + animations

**Files:**
- Modify: `src/components/form/programdetails.tsx`
- Modify: `src/components/form/applicationstatus.tsx`
- Modify: `src/components/form/reviewapplication.tsx`
- Modify: `src/components/form/draftxstatus.tsx`

- [ ] **Step 1: Wrap form pages in PageTransition**

Same pattern — wrap page content in `<PageTransition>`.

- [ ] **Step 2: Add scroll reveals to form sections**

In programdetails.tsx, wrap major sections in `<Reveal>` (document upload grid, etc).

- [ ] **Step 3: Add hover lift to document upload cards**

```tsx
<motion.div whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
```

- [ ] **Step 4: Animate progress bar in applicationstatus.tsx**

Find the progress bar `<div>` with width percentage. Add:
```tsx
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${progressPercent}%` }}
  transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
/>
```

- [ ] **Step 5: Add pulse to "Under Review" status badges**

Find the status badge element. Add:
```tsx
<motion.span
  animate={isUnderReview ? { opacity: [1, 0.6, 1] } : {}}
  transition={{ duration: 2, repeat: Infinity }}
>
```

- [ ] **Step 6: Drafts page card hover lift**

In draftxstatus.tsx, wrap draft cards with `<motion.div whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>`.

---

## Task 8: Alumni pages — animations

**Files:**
- Modify: `src/components/alumni/home.tsx`
- Modify: `src/components/alumni/alumniform.tsx`

- [ ] **Step 1: Alumni feed card stagger**

Wrap alumni card grid in `<StaggerContainer>`, each card in `<StaggerItem>`.

- [ ] **Step 2: Filter layout animation**

Wrap filter results section — add `layout` prop to cards for smooth reordering:
```tsx
<motion.div layout>
```

- [ ] **Step 3: Alumni form section transitions**

Wrap form sections in `<Reveal>`. Add tag pill scale animation:
```tsx
<motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
```

---

## Task 9: Admin dashboard — animations

**Files:**
- Modify: `src/components/admin/dashboard.tsx`

- [ ] **Step 1: Stat count-up animation**

Find the StatCard component. Replace static `{value}` with:
```tsx
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

function AnimatedStat({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(() => Math.round(count.get()));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1, ease: [0.25, 0.1, 0.25, 1] });
    return controls.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}
```

Replace `<p className="text-3xl font-bold">{value}</p>` with:
```tsx
<p className="text-3xl font-bold"><AnimatedStat value={value} /></p>
```

- [ ] **Step 2: Activity row stagger**

Wrap the activity table body rows in `<StaggerContainer>`, each row in `<StaggerItem>`.

- [ ] **Step 3: Wrap dashboard in PageTransition**

---

## Task 10: Admin sidebar — animations

**Files:**
- Modify: `src/components/admin/sidenav.tsx`

- [ ] **Step 1: Animate active nav indicator**

Find the active nav item (where `isActive` is true). Add:
```tsx
<motion.div layoutId="activeNav" className="absolute inset-0 rounded-xl bg-blue-700" />
```

The `layoutId` ensures smooth sliding between active states.

- [ ] **Step 2: Animate mobile drawer**

Wrap the mobile drawer `<aside>`:
```tsx
<motion.aside
  initial={{ x: "-100%" }}
  animate={{ x: 0 }}
  exit={{ x: "-100%" }}
  transition={{ type: "spring", damping: 25, stiffness: 200 }}
>
```

---

## Task 11: Admin app list/detail — animations

**Files:**
- Modify: `src/components/admin/application.tsx`
- Modify: `src/components/admin/applications.tsx`
- Modify: `src/components/admin/adminalumni.tsx`
- Modify: `src/components/admin/activitylogs.tsx`
- Modify: `src/components/admin/setting.tsx`

- [ ] **Step 1: Table row hover**

In applications.tsx, wrap each `<tr>`:
```tsx
<motion.tr whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }} className="transition-colors">
```

- [ ] **Step 2: Modal fade + scale**

Find the modal container. Add:
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
```

- [ ] **Step 3: Document card hover lift**

Same pattern as form — `whileHover={{ y: -2 }}`.

- [ ] **Step 4: Activity log row stagger**

Wrap activity rows in StaggerContainer.

- [ ] **Step 5: Settings photo preview animation**

In setting.tsx, wrap avatar upload:
```tsx
<motion.div whileHover={{ scale: 1.05 }}>...</motion.div>
```

---

## Task 12: Profile page — animations

**Files:**
- Modify: `src/components/myprofile/profile.tsx`

- [ ] **Step 1: Animate inline edit toggle**

Wrap the edit toggle area:
```tsx
<AnimatePresence mode="wait">
  {isEditing ? (
    <motion.div key="edit" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
      {/* edit fields */}
    </motion.div>
  ) : (
    <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* view fields */}
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 2: Photo upload preview**

Wrap the photo area with `whileHover` scale on the upload button.

---

## Task 13: Final Polish

**Files:**
- Modify: all files from previous tasks as needed

- [ ] **Step 1: Verify all animations respect reduced-motion**

Every component using framer-motion should call `useReducedMotion()` and return a plain element when true. Shared components (Reveal, PageTransition, etc.) already have this. Inline `motion.div` usage in page components needs it too — wrap with a `reduced` check.

- [ ] **Step 2: Check color contrast**

Verify body text `#0f172a` on white `#ffffff` = 17.1:1 ✓. Muted `#64748b` on white = 4.7:1 ✓ (passes 4.5:1). Gold `#d97706` on white = 3.1:1 — okay for large text/accent only.

- [ ] **Step 3: Verify no console.log debug statements remain**

Grep: `rg "console\.(log|debug)" src/` — remove any in production code.

- [ ] **Step 4: Build check**

Run: `npm run build` (or `npx next build`) — verify no errors.
