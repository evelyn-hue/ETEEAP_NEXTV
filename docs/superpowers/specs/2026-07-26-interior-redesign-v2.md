# Interior Pages Full Redesign — v2

## Overview
Standardize all 30 interior pages (public, admin, auth, landing) with a consistent warm visual system: `bg-surface-warm` + subtle radial gradient, glass-effect white cards, Playfair Display section headings with blue accent bar, scroll-triggered Reveal animations, all guarded by `useReducedMotion()`.

## Page Architecture

Four page variants, each with its own wrapper component:

| Variant | Wrapper | Pages | Header | Footer / SideNav |
|---------|---------|-------|--------|-----------------|
| `public` | `<InteriorPage>` | 17 pages (overview, courses x5, FAQ, alumni, form x7, alumniform, myprofile) | ✅ Header | ✅ Footer |
| `auth` | `<InteriorPage variant="auth">` | 5 pages (signin, signup, forgot-pw, reset-pw, verify-otp) | signin/signup only | ❌ no footer |
| `admin` | `<AdminPage>` | 7 pages (dashboard, applications, application, adminalumni, activitylogs, setting, sidenav) | ❌ SideNav instead | ❌ no footer |
| `landing` | current `<PageTransition>` | 1 page (/) | ✅ Header | ✅ Footer |

## Design Tokens

### Added to `globals.css`
```css
--bg-interior: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(30, 58, 95, 0.04) 0%, transparent 60%);
```

### Card styles
- **Public interior cards**: `bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30`
- **Admin detail/list cards**: `bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/30`
- **Admin table cards**: `bg-white rounded-3xl shadow-sm ring-1 ring-slate-200/30`
- **Auth glass cards**: `bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl` (on campus image bg)
- **Auth minor forms** (forgot/reset/verify): `bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl` — matching signin/signup

### Typography
- **Page h1/h2**: `<SectionHeading>` component — Playfair Display `font-display`, `text-primary`, with `h-1 w-12 bg-primary rounded-full` accent bar beneath
- **Body**: existing Geist Sans (no change)

### Colors
- Page bg: `bg-surface-warm` (#f8f6f3) + radial gradient
- Cards: white (`bg-white` or `bg-white/80` for auth blur)
- Headings: `text-primary` (#1e3a5f), accent bar same
- Buttons: `bg-blue-600 hover:bg-blue-700` (already done on auth; extend to all)
- Focus rings: `ring-blue-600/30` (already done on auth; extend to all)

## New Components to Create

### 1. `<InteriorPage>`
Client component at `src/components/shared/InteriorPage.tsx`
- Runs JWT verify on mount → `showProfile`/`email` state
- Renders: `bg-surface-warm` + `radial-gradient` overlay
- Wraps children in `<Header>`, `<PageTransition>`, optional `<Footer>`
- Props: `children`, `variant` (`"public"` | `"auth"`), `showFooter` (default true)
- Auth variant: no warm bg (keeps campus image from child component)

### 2. `<AdminPage>`
Client component at `src/components/shared/AdminPage.tsx`
- Runs JWT verify on mount → redirect to `/` if invalid
- Renders: `bg-surface-warm` + radial gradient
- Wraps children in two-column: `<SideNav>` + `<PageTransition>`
- Special case: `/admin/sidenav` does NOT use AdminPage (manual `<SideNav />` in warm bg)

### 3. `<SectionHeading>`
Client component at `src/components/shared/SectionHeading.tsx`
- Renders Playfair Display heading + blue accent bar beneath
- Props: `children`, `level` (`"h1"` | `"h2"` | `"h3"`, defaults `"h2"`), `className`

### 4. Auth form components (3 new)
- `src/components/auth/forgot-password.tsx`
- `src/components/auth/reset-password.tsx`
- `src/components/auth/verify-otp.tsx`
- Each matches signin/signup glass card pattern

## Page-Level Changes

### All 30 `page.tsx` files
Replace the repetitive `PageTransition` + `Header` + `Footer` + JWT verify boilerplate with one-line wrapper:
```tsx
// Before (overview)
<PageTransition>
  <Header showProfile={showProfile} email={email} />
  <OverView />
  <Footer />
</PageTransition>

// After
<InteriorPage>
  <OverView />
</InteriorPage>
```

### Auth pages (signin, signup)
Already use campus bg overlay — keep that. Just update wrapper:
```tsx
// Before
<PageTransition>
  <Header showProfile={showProfile} email={email} />
  <SignIn />
</PageTransition>

// After
<InteriorPage variant="auth" showFooter={false}>
  <SignIn />
</InteriorPage>
```

### Forgot-password, reset-password, verify-otp
Extract inline form JSX into separate component files. Page.tsx becomes:
```tsx
<InteriorPage variant="auth" showFooter={false}>
  <ForgotPasswordForm />
</InteriorPage>
```

### Admin pages
```tsx
// Before
<PageTransition className="flex min-h-screen bg-gray-100">
  <div className="md:w-64 shrink-0"><SideNav /></div>
  <div className="flex-1 overflow-hidden"><Admin /></div>
</PageTransition>

// After
<AdminPage>
  <Admin />
</AdminPage>
```

## Content Component Changes (21 files)

### For each content component:
1. **Remove top-level bg class** — delete `bg-gray-50`, `bg-slate-50`, `bg-gray-100`, `bg-slate-100`, `from-blue-50 to-white` from the root wrapper
2. **Replace heading classes** with `<SectionHeading level="h2">Section Title</SectionHeading>`
3. **Wrap sections** in `<Reveal>` for scroll-triggered entrance
4. **Standardize card wrappers** to the glass card pattern per type

### Specific component changes:

**Course detail pages** (BSHM, BAELS, BSBA-HRM, BSBA-MM):
- Remove `bg-linear-to-b from-blue-50 to-white` wrapper
- Keep hero section (image overlay) as-is
- Section cards below hero → glass card pattern

**FAQ page**:
- Remove `bg-gray-50` from wrapper
- FAQ accordion items → glass card with reveal

**Alumni home**:
- Remove `bg-gray-100` from wrapper
- Filter bar, alumni cards → glass card with reveal

**Form pages** (all):
- Remove `bg-gray-50`, `bg-slate-50`, `bg-gray-100` from wrappers
- Form cards → glass card pattern (already close)
- File upload areas → keep dashed border, just remove explicit bg

**Admin pages** (all):
- Remove `bg-gray-100` from dashboard wrapper
- Remove `bg-slate-100` from applications/application/adminalumni wrapper
- Cards stay `rounded-2xl`/`rounded-3xl` but remove `ring-slate-200` in favor of subtle `ring-1 ring-slate-200/30`

**Banner (landing page sub-sections)**:
- Hero section (`bg-blue-800`) stays as-is — distinct landing hero
- "About LCCB ETEEAP" section (`bg-blue-50`) → warm bg, glass cards, SectionHeading, Reveal
- "Why Choose LCCB ETEEAP" section (`bg-white`) → warm bg, glass cards, SectionHeading, Reveal
- CTA section (`bg-blue-600`) stays as-is

**MyProfile**:
- No content component changes needed (it's mostly a card already)
- Just swap page wrapper

## Reduced Motion
- All `Reveal` wrappers already guard with `useReducedMotion()` — no change needed
- `PageTransition` already guards — no change needed
- New `SectionHeading` is a pure visual component with no motion

## Files Changed

### Create (7 files)
- `src/components/shared/InteriorPage.tsx`
- `src/components/shared/AdminPage.tsx`
- `src/components/shared/SectionHeading.tsx`
- `src/components/auth/forgot-password.tsx`
- `src/components/auth/reset-password.tsx`
- `src/components/auth/verify-otp.tsx`

### Modify CSS (1 file)
- `src/app/globals.css` — add `--bg-interior` token

### Modify page.tsx (30 files)
All under `src/app/` — replace boilerplate with wrapper

### Modify content components (21 files)
Card backgrounds, heading standardization, Reveal wrappers
