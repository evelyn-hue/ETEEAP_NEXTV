# ETEEAP NEXTV — UI Overhaul Design

**Date:** 2026-07-26
**Status:** Design approved

---

## Grounding

**Product:** ETEEAP NEXTV — Online Application & Alumni Management System for LCC Bacolod's Expanded Tertiary Education Equivalency and Accreditation Program (ETEEAP).

**Audience:** Working adults (23–50), busy professionals seeking a degree through recognition of prior learning. Admin staff who manage applications, alumni, and content.

**The interface's single job:** Make the application process feel **legitimate, professional, and that their experience matters** — while giving admin staff efficient tools to manage the pipeline.

---

## Color System

| Role | Color | Hex | Usage |
|---|---|---|---|
| Primary | Deep navy | `#1e3a5f` | Header bg, footer bg, hero bg, sidebar bg, primary buttons |
| Primary light | Derived navy tint | `#2d4f7a` | Interactive elements: links, secondary buttons, focus rings, active states |
| Accent | Warm gold | `#d97706` | Achievement markers, "experience counts" visuals, highlights, badges |
| Surface | White | `#ffffff` | Cards, modals, content areas |
| Surface warm | Warm off-white | `#f8f6f3` | Section backgrounds (replacing cold `bg-gray-50` / `bg-slate-50`) |
| Surface muted | Lighter warm | `#f0ede8` | Hover states, subtle dividers |
| Ink | Near-black | `#0f172a` | Body text, headings |
| Muted | Muted slate | `#64748b` | Secondary text, labels, placeholders |
| Success | Forest green | `#16a34a` | Verified, approved, success states |
| Error | Red | `#dc2626` | Rejected, error states, delete actions |

### Color strategy: Committed

One saturated color (navy) carries 30–60% of the surface, with gold as a strategic accent. Warm neutrals replace cold grays to make the app feel more human and academic rather than corporate.

---

## Typography

| Role | Font | Weight | Details |
|---|---|---|---|
| Display | Playfair Display | 600–700 | Hero headings, section titles, major landmarks. Serif for academic weight. |
| Body | Geist Sans | 400–500 | Existing font, kept for consistency. Body text, labels, buttons. |
| Utility | Geist Mono | 400 | Code, data, file names, technical details. |

**Type scale:**
- Hero heading: `clamp(2.25rem, 5vw, 4rem)` — Playfair Display 700, `text-wrap: balance`
- Section title: `clamp(1.5rem, 3vw, 2.25rem)` — Playfair Display 600, `text-wrap: balance`
- Body: `0.9375rem` / `1rem` — Geist Sans 400
- Small/caption: `0.8125rem` — Geist Sans 400
- Label/utility: `0.75rem` — Geist Sans 500, uppercase tracked
- Caps: `0.75rem` tracking `0.08em`

**Body line length:** 65–75ch max-width on prose containers.

---

## Motion System

Using **Framer Motion** (already in `package.json`). All animations built with `prefers-reduced-motion` respect from the start — every `motion` component uses a `useReducedMotion` guard or `shouldReduceMotion` prop. No animation gates content visibility.

### Page transitions
- Page content wraps in `motion.main` with initial `{ opacity: 0, y: 12 }` → animate `{ opacity: 1, y: 0 }` over 300ms
- Exit: fast fade (100ms) before route change

### Scroll reveals
- Sections fade-up with `whileInView={{ opacity: 1, y: 0 }}`, initial `{{ opacity: 0, y: 24 }}`, viewport margin `-80px`
- Stagger children with `staggerChildren: 0.08`
- Only on first reveal — not re-triggered

### Micro-interactions
- **Cards:** `whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}` — subtle lift with larger shadow
- **Buttons:** `whileTap={{ scale: 0.97 }}` — press feedback
- **Links:** hover underline slide-in or color transition
- **Status badges:** pulse animation for "under review", `layout` prop for smooth position transitions in filtered lists

### Loading states
- Skeleton shimmer replaced text spinners on data tables and cards
- Dashboard stat numbers animate from 0 using framer-motion `animate` with `useMotionValue` + `useTransform` for performant counting

### Form interactions
- Step transitions: `AnimatePresence` with slide-left/right between form sections
- Drag-and-drop file upload: visual feedback on drag-over (scale, border color change, opacity)
- Progress bar: animated width transition with `transition: all 0.5s ease-out`

---

## Layout Principles

- **Responsive:** Mobile-first with Tailwind breakpoints (sm: 640, md: 768, lg: 1024, xl: 1280)
- **Spacing:** Consistent 4px base unit, section padding `py-16` to `py-24`
- **Grid:** 12-column implicit grid on content pages. Cards use `auto-fit, minmax(280px, 1fr)`
- **Z-index scale:** header (fixed) 50 → dropdown 60 → modal backdrop 70 → modal 80 → toast 90 → tooltip 100
- Cards stay but reduce nesting (no cards inside cards)

---

## Per-Surface Design

### 1. Landing Page (`/`)

- **Hero signature:** Animated "Your Experience = Academic Credit" visual. A horizontal timeline with milestone nodes (5yr, 10yr, 15yr work experience) that each map to credit equivalency. Counter animates years → credits on scroll into view. Gold accent draw the eye to the transformation. Group photo kept on right side.
- **Sections:** All have scroll-reveal fade-up entrance. Feature cards stagger in.
- **Header:** Text-based logo (LCCB + ETEEAP) in navy. Notification bell + profile dropdown animated with spring transitions.
- **Footer:** Same text-based logo, keep navy `#1e3a5f` bg for visual bookend with header. Text in white/blue-200.

### 2. Auth Pages (`/auth/*`)

- **Unified card style:** All auth forms share same `rounded-xl shadow-lg bg-white/95 backdrop-blur-sm p-8` card on the `lccbBG.jpg` background (can stay).
- **Inputs:** Consistent `rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500` across signin AND signup (signup currently has basic borders — fix).
- **Animations:** Card entrance slide-up on mount, form field stagger, error shake on validation failure.
- **OTP:** Auto-advance inputs, pulse on current input, countdown timer smooth.

### 3. Application Forms (`/form/*`)

- **Multi-step:** AnimatePresence for step transitions — slide left for next, right for back.
- **Document upload:** Drag-drop zone with spring-based scale animation on drag-over, success checkmark animation on upload complete.
- **Progress bar:** Animated fill with status labels.
- **Status badges:** Pulse animation for "Under Review", smooth color transitions between statuses.
- **Drafts page:** Card hover lift, stagger entrance.

### 4. Admin Panel (`/admin/*`)

- **Dashboard:** Stat numbers count up from 0 on mount. Chart recharts already interactive — keep. Recent activity rows stagger in.
- **Sidebar:** Active indicator animated (sliding underline or bg change). Mobile drawer with spring animation.
- **Application list/detail:** Table rows with hover highlight. Modal with fade + scale entrance. Document cards with hover lift.
- **Settings:** Photo upload with preview animation, save feedback.

### 5. Alumni (`/alumni/*`)

- **Feed:** Card grid with stagger entrance. Search/filter results animate with `layout` prop for smooth reordering.
- **Form:** Step-like sections with smooth transitions. Tag pills with scale animation on add/remove.
- **Profile:** Expandable sections with `AnimatePresence`.

### 6. Profile `/myprofile`

- Animated inline edit toggle (slide/fade between view and edit modes)
- Photo upload preview with transition

---

## Accessibility

- All color combinations meet WCAG AA contrast (4.5:1 body, 3:1 large text)
- `prefers-reduced-motion` respected — all framer-motion animations degrade to instant transitions
- Visible keyboard focus on all interactive elements
- `aria-labels` on icon-only buttons
- Semantic heading hierarchy (h1 → h2 → h3)

---

## Implementation Order

### Phase 1 — Foundation (design system + auth + landing)
1. Add Playfair Display font to layout
2. Create CSS custom properties for the color system in `globals.css`
3. Create reusable motion components: `Reveal` (scroll), `PageTransition`, `StaggerContainer`, `StaggerItem` — each with built-in `prefers-reduced-motion` guard
4. Create skeleton loading components with shimmer animation
5. Fix discovered bugs (civilstatus wrong component, missing admin sidenav, mt-25, toast portaling, console.log cleanup)
6. Unify signin/signup input styling + add card entrance animations
7. Apply design system to landing page (header text logo, hero experience timeline, section scroll reveals, footer)

### Phase 2 — Forms + Alumni
8. Wrap form pages in `PageTransition` — animated step transitions with `AnimatePresence`
9. Animate document upload drag-drop zones (spring scale on drag-over, success checkmark)
10. Animate progress bars and status badges (pulse for "Under Review", smooth status color transitions)
11. Drafts page card hover lift + stagger entrance
12. Alumni feed card grid stagger + filter layout animation
13. Alumni form section transitions + tag pill scale animation

### Phase 3 — Admin
14. Dashboard stat count-up animation, activity row stagger, chart polish
15. Sidebar active indicator spring animation + mobile drawer spring transition
16. Application list/detail: table row hover, modal fade+scale, document card hover lift
17. Activity log filter/transition smoothing

### Phase 4 — Polish
18. Accessibility pass (keyboard focus, aria-labels, semantic headings, contrast validation)
19. Cross-browser QA
20. Remove any console.log debug statements found

---

## File Manifest

| Layer | Files |
|---|---|
| Design tokens | `src/app/globals.css` |
| Motion components | `src/components/shared/Reveal.tsx`, `PageTransition.tsx`, `StaggerContainer.tsx` |
| Skeleton components | `src/components/shared/Skeleton.tsx` |
| Landing | `src/app/page.tsx`, `src/components/landpage/header.tsx`, `banner.tsx`, `footer.tsx` |
| Auth | `src/components/auth/signin.tsx`, `signup.tsx`, auth page files |
| Forms | `src/components/form/programdetails.tsx`, `applicationstatus.tsx`, `reviewapplication.tsx`, `draftxstatus.tsx` |
| Admin | `src/components/admin/dashboard.tsx`, `sidenav.tsx`, `applications.tsx`, `application.tsx`, `adminalumni.tsx`, `activitylogs.tsx`, `setting.tsx` |
| Alumni | `src/components/alumni/home.tsx`, `alumniform.tsx` |
| Profile | `src/components/myprofile/profile.tsx` |

---

## UI Bugs to Fix (discovered during survey)

- `/form/civilstatus/page.tsx` renders ApplicationStatus instead of CivilStatus — wrong component
- `/admin/applications/page.tsx` missing SideNav wrapper
- Signup inputs lack focus rings (inconsistent with signin)
- `mt-25` class in `draftxstatus.tsx` is Tailwind v3 holdover
- Toast notifications not portaled — render inside components
- Console.log debug statements in `admin/application.tsx`
