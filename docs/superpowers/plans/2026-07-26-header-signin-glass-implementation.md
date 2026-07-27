# Header & Sign-In Glass Effect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply frosted glass aesthetic to header and auth pages, unify palette to blue-600, and add animated nav link underlines.

**Architecture:** Modify 3 existing components (header, signin, signup) with glass CSS classes, blue-600 color tokens, and framer-motion animated underlines/entrances. No new components, no new dependencies.

**Tech Stack:** Next.js, Tailwind CSS, framer-motion, lucide-react, react-icons

## Global Constraints

- All animations guarded by `useReducedMotion()` — never animate without the guard
- Glass effect uses Tailwind's `backdrop-blur` utilities only (no custom CSS)
- Blue-600 = `#2563eb`, Blue-700 = `#1d4ed8`
- No new npm packages added
- Existing motion components (`Reveal`, `PageTransition`, etc.) are NOT used — inline framer-motion per existing pattern in signin.tsx

---

### Task 1: Header — Glass Background & Animated Nav Links

**Files:**
- Modify: `src/components/landpage/header.tsx`

**Interfaces:**
- Consumes: same props (`showProfile`, `email`)
- Produces: updated header with glass background + animated nav underlines

- [ ] **Step 1: Change header background to glass**

Replace `bg-white shadow-md` with glass classes:

```tsx
<header className="w-full bg-white/85 backdrop-blur-md border-b border-white/20 fixed top-0 left-0 z-50">
```

- [ ] **Step 2: Update mobile sidebar to glass**

Replace:

```tsx
<aside className="fixed left-0 top-0 z-50 h-dvh w-[30dvw] min-w-55 bg-white shadow-2xl">
```

With:

```tsx
<aside className="fixed left-0 top-0 z-50 h-dvw w-[30dvw] min-w-55 bg-white/90 backdrop-blur-lg shadow-2xl">
```

- [ ] **Step 3: Add framer-motion animated underline to nav links**

Import framer-motion at top:

```tsx
import { motion } from "framer-motion";
```

Replace the nav `<ul>` contents with:

```tsx
<ul className="flex gap-8">
  {[
    { label: "Home", path: "/" },
    { label: "About", path: "/overview" },
    { label: "Programs", path: "/courses" },
    { label: "Alumni", path: "/alumni" },
    { label: "FAQ's", path: "/question" },
  ].map((item) => (
    <li key={item.path} className="relative group cursor-pointer" onClick={() => { router.push(item.path); }}>
      <span className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
        {item.label}
      </span>
      <motion.span
        className="absolute -bottom-0.5 left-0 h-0.5 bg-blue-600 rounded-full"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.2 }}
        style={{ originX: 0, width: "100%" }}
      />
    </li>
  ))}
</ul>
```

- [ ] **Step 4: Verify**

Run `npm run dev` and confirm header shows frosted glass effect, nav links have animated blue underlines on hover, mobile sidebar has glass background.

- [ ] **Step 5: Commit**

```bash
git add src/components/landpage/header.tsx
git commit -m "feat: glass header with animated nav underlines"
```

---

### Task 2: Sign-In Page — Glass Card & Blue-600 Palette

**Files:**
- Modify: `src/components/auth/signin.tsx`

**Interfaces:**
- Consumes: same imports, hooks, form state
- Produces: glass card with blue-600 accents, darker overlay

- [ ] **Step 1: Darken background overlay**

Replace:

```tsx
<div className="absolute inset-0 bg-black/30" />
```

With:

```tsx
<div className="absolute inset-0 bg-black/40" />
```

- [ ] **Step 2: Make card glass**

Replace:

```tsx
<div className="bg-surface-warm/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
```

With:

```tsx
<div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
```

- [ ] **Step 3: Change top bar to blue-600**

Replace:

```tsx
<div className="h-1.5 bg-primary" />
```

With:

```tsx
<div className="h-1.5 bg-blue-600" />
```

- [ ] **Step 4: Change icon badge to blue-600**

Replace:

```tsx
<div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-4">
```

With:

```tsx
<div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
```

- [ ] **Step 5: Change CTA button to blue-600**

Replace:

```tsx
className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
```

With:

```tsx
className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
```

- [ ] **Step 6: Change focus rings to blue-600**

Replace both email and password input focus classes:

```tsx
className="... focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
```

With:

```tsx
className="... focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition"
```

- [ ] **Step 7: Change links to blue-600**

Replace:

```tsx
<Link href="/auth/forgot-password" className="text-primary-light hover:text-primary font-medium transition">
```

With:

```tsx
<Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium transition">
```

Replace:

```tsx
<Link href="/auth/signup" className="text-primary-light hover:text-primary font-semibold transition">
```

With:

```tsx
<Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition">
```

- [ ] **Step 8: Change checkbox accent to blue-600**

Replace:

```tsx
className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/40"
```

With:

```tsx
className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/40"
```

- [ ] **Step 9: Verify**

Run dev server, navigate to `/auth/signin`, confirm glass card, blue-600 top bar/badge/button/links/focus rings, darker overlay.

- [ ] **Step 10: Commit**

```bash
git add src/components/auth/signin.tsx
git commit -m "feat: glass sign-in card with blue-600 palette"
```

---

### Task 3: Sign-Up Page — Glass Card, Blue-600, Animations

**Files:**
- Modify: `src/components/auth/signup.tsx`

**Interfaces:**
- Consumes: same imports, hooks, form state
- Produces: glass card matching sign-in with blue-600 accents, top bar, icon badge, staggered entrance

- [ ] **Step 1: Add framer-motion and lucide imports**

Replace existing imports:

```tsx
import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { Fetch_to } from "@/utilities";
import apiLink from "@/config/api_link.json";
import { useAuth } from "@/context/AuthContext";
```

With:

```tsx
import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { GraduationCap } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { Fetch_to } from "@/utilities";
import apiLink from "@/config/api_link.json";
import { useAuth } from "@/context/AuthContext";
```

- [ ] **Step 2: Add reduced motion and fadeUp inside SignUp component**

Inside the `SignUp` function, after `const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);`:

```tsx
const reduced = useReducedMotion();
const fadeUp = reduced ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };
```

- [ ] **Step 3: Wrap card with glass styling, top bar, and animated entrance**

Replace the outer section and card wrapper:

```tsx
return (
    <section className="min-h-screen bg-[url('/lccbBG.jpg')] bg-cover bg-center flex items-center justify-center mt-16">
      <div className="absolute inset-0 bg-black/30" />
      <div className="bg-white/90 p-8 rounded-lg shadow-lg">
```

With:

```tsx
return (
    <section className="relative min-h-screen bg-[url('/lccbBG.jpg')] bg-cover bg-center flex items-center justify-center mt-16 overflow-hidden">
      <div className="absolute inset-0 bg-black/40" />
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative w-full max-w-lg mx-4"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1.5 bg-blue-600" />
          <div className="p-8 sm:p-10">
            <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-primary">
                Create Account
              </h1>
              <p className="text-muted mt-1.5 text-sm">
                Join the LCCB ETEEAP community
              </p>
            </motion.div>
```

- [ ] **Step 4: Add staggered animation to form sections**

Wrap the form's submit button in staggered motion div:

Find the submit button and wrap it:

```tsx
              <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {submitting ? "Creating Account..." : "Sign Up"}
                </button>
              </motion.div>
```

Wrap the "Already have an account?" link:

```tsx
              <motion.p {...fadeUp} transition={{ delay: 0.35 }} className="text-center text-sm text-muted mt-6">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-semibold transition">
                  Sign In
                </Link>
              </motion.p>
```

- [ ] **Step 5: Close the new wrapper tags**

Make sure the card properly closes at the end of the return. The closing should be:

```tsx
          </div>
        </div>
      </motion.div>
    </section>
```

Instead of just `</div>` (remove the old single closing div).

- [ ] **Step 6: Change the CTA button color in the existing button**

If the button uses `bg-blue-600` already, confirm. If not, change it to `bg-blue-600 hover:bg-blue-700`.

- [ ] **Step 7: Change focus rings on input fields to blue-600**

Find:

```tsx
className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
```

Update to match sign-in pattern if needed (blue-500 is close but keep blue-600 for consistency).

- [ ] **Step 8: Verify**

Run dev server, navigate to `/auth/signup`, confirm glass card, blue-600 top bar, icon badge, Playfair heading, staggered entrance animation, darker overlay.

- [ ] **Step 9: Commit**

```bash
git add src/components/auth/signup.tsx
git commit -m "feat: glass sign-up card with blue-600 and animations"
```
