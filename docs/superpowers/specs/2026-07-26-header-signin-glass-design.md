# Header & Sign-In Glass Effect Redesign

## Overview
Unify the header and auth pages with a frosted glass aesthetic, consistent blue-600 palette, and improved background image contrast.

## 1. Header — Glass Translucent Bar
- **Background**: `bg-white/85 backdrop-blur-md` replacing solid white bg (balance of frosted effect and text legibility)
- **Border**: subtle `border-b border-white/20` for depth
- **Shadow**: keep existing shadow-md but less harsh against glass
- **Nav links**: framer-motion animated underline on hover (scaleX from 0 to 1)
- **Mobile menu**: sidebar overlay uses same glass bg (`bg-white/90 backdrop-blur-lg`) instead of solid white
- **Sign Up button**: stays `bg-blue-600 text-white`
- **Sign In link**: stays `text-gray-700 hover:text-blue-600`

## 2. Sign-In Page Background
- **Image**: keep `lccbBG.jpg` with `bg-cover bg-center`
- **Overlay**: darken from `bg-black/30` to `bg-black/40` for better card readability

## 3. Sign-In Card — Glass + Blue-600
- **Card background**: `bg-white/80 backdrop-blur-xl` replacing `bg-surface-warm/95 backdrop-blur-sm`
- **Top bar**: `bg-blue-600` (`#2563eb`) replacing `bg-primary`
- **Icon badge**: `bg-blue-600` replacing `bg-primary`
- **CTA button**: `bg-blue-600 hover:bg-blue-700`
- **Focus rings**: `focus:ring-blue-600/30 focus:border-blue-600`
- **Links**: `text-blue-600 hover:text-blue-700`
- **Checkbox**: `text-blue-600 focus:ring-blue-600/40`
- **Layout**: same structure (icon, heading, fields, button, divider, Google button, sign-up link)
- **Animations**: keep existing staggered framer-motion entrance (already guarded by useReducedMotion)

## 4. Sign-Up Page — Full Glass Treatment
- **Card background**: `bg-white/80 backdrop-blur-xl` replacing `bg-white/90`
- **Top bar**: add `h-1.5 bg-blue-600` top rail matching sign-in
- **Heading**: add graduation cap icon in `bg-blue-600` badge, "Create Account" in Playfair Display
- **CTA button**: `bg-blue-600 hover:bg-blue-700`
- **Focus rings**: `focus:ring-blue-600/30 focus:border-blue-600`
- **Animations**: add staggered framer-motion entrance matching sign-in (guarded by useReducedMotion)
- **Layout**: keep existing form fields and validation structure

## Color Reference
| Element | Color |
|---------|-------|
| Header bg | `bg-white/85 backdrop-blur-md` |
| Card bg | `bg-white/80 backdrop-blur-xl` |
| Mobile menu bg | `bg-white/90 backdrop-blur-lg` |
| Button, badge, top bar | `bg-blue-600` (#2563eb) |
| Button hover | `bg-blue-700` (#1d4ed8) |
| Links | `text-blue-600` |
| Nav hover | `hover:text-blue-600` |
| Overlay | `bg-black/40` |

## Reduced Motion
- All framer-motion animations guarded by `useReducedMotion()` (existing pattern for sign-in, new for sign-up)
- Glass effect (CSS-only) remains visible regardless of motion preference

## Files Changed
- `src/components/landpage/header.tsx` — glass bg, animated nav links, glass mobile menu
- `src/components/auth/signin.tsx` — glass card, blue-600 color swap, darker overlay
- `src/components/auth/signup.tsx` — glass card, blue-600 colors, top bar, icon badge, framer-motion entrance
