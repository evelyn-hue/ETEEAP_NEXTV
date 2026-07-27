# Interior Pages Full Redesign — Implementation Plan v2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize all 30 interior pages with warm bg, glass-effect cards, Playfair Display section headings with blue accent bar, and scroll-triggered Reveal animations.

**Architecture:** Four page wrapper components (InteriorPage, InteriorPage variant="auth", AdminPage, PageTransition) replace repetitive boilerplate in all page.tsx files. Content components get standardized card backgrounds, heading components, and Reveal wrappers. Auth form pages get extracted into proper components with glass cards matching signin/signup.

**Tech Stack:** Next.js, Tailwind CSS, framer-motion, lucide-react

## Global Constraints

- All animations guarded by `useReducedMotion()` — never animate without the guard
- Card backgrounds on interior pages (solid warm bg) use `bg-white` — no `backdrop-blur` (invisible on solid bg)
- Auth pages with campus image bg use `bg-white/80 backdrop-blur-xl` for glass effect
- Blue-600 = `#2563eb`, Blue-700 = `#1d4ed8`
- `--bg-interior` CSS variable: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(30, 58, 95, 0.04) 0%, transparent 60%)`
- SectionHeading level defaults to h2 if not specified
- `<AdminPage>` wraps content in `<SideNav>` + children — callers must NOT include SideNav
- `/admin/sidenav` is a special case — uses plain warm bg, not `<AdminPage>`

---

### Task 1: CSS Foundation + Shared Components

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/shared/InteriorPage.tsx`
- Create: `src/components/shared/AdminPage.tsx`
- Create: `src/components/shared/SectionHeading.tsx`

**Interfaces:**
- Consumes: `Header`, `Footer` from `@/components/landpage`; `SideNav` from `@/components/admin`; `PageTransition` from `@/components/shared`
- Produces: `<InteriorPage variant="public"|"auth" showFooter={true|false}>`, `<AdminPage>`, `<SectionHeading level="h1"|"h2"|"h3">`

- [ ] **Step 1: Add `--bg-interior` token to globals.css**

```css
--bg-interior: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(30, 58, 95, 0.04) 0%, transparent 60%);
```

- [ ] **Step 2: Create `<SectionHeading>` component**

File: `src/components/shared/SectionHeading.tsx`:

```tsx
"use client";
import { ReactNode } from "react";

type SectionHeadingProps = {
  children: ReactNode;
  level?: "h1" | "h2" | "h3";
  className?: string;
};

export default function SectionHeading({ children, level = "h2", className = "" }: SectionHeadingProps) {
  const Tag = level;
  const sizeMap = { h1: "text-3xl sm:text-4xl", h2: "text-2xl sm:text-3xl", h3: "text-xl sm:text-2xl" };
  return (
    <div className={`mb-6 ${className}`}>
      <Tag className={`font-display font-bold text-primary ${sizeMap[level]}`}>
        {children}
      </Tag>
      <div className="mt-2 h-1 w-12 bg-primary rounded-full" />
    </div>
  );
}
```

- [ ] **Step 3: Create `<InteriorPage>` component**

File: `src/components/shared/InteriorPage.tsx`:

```tsx
"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Fetch_to } from "@/utilities";
import api_link from "@/config/api_link.json";
import { Header, Footer } from "@/components/landpage";
import PageTransition from "@/components/shared/PageTransition";
import { usePathname } from "next/navigation";

type Props = { children: ReactNode; variant?: "public" | "auth"; showFooter?: boolean };

export default function InteriorPage({ children, variant = "public", showFooter = true }: Props) {
  const [showProfile, setShowProfile] = useState(false);
  const [email, setEmail] = useState("");
  const pathname = usePathname();
  const isSigninOrSignup = pathname === "/auth/signin" || pathname === "/auth/signup";

  useEffect(() => {
    const verify = async () => {
      const response = await Fetch_to(api_link.jwt.verify);
      if (response.success) {
        const data = response.data.message.final_data.data[0];
        setShowProfile(true);
        setEmail(data.email);
      } else {
        setShowProfile(false);
      }
    };
    verify();
  }, []);

  return (
    <PageTransition>
      {variant === "public" ? (
        <div className="min-h-screen bg-surface-warm" style={{ backgroundImage: "var(--bg-interior)" }}>
          <Header showProfile={showProfile} email={email} />
          {children}
          {showFooter && <Footer />}
        </div>
      ) : (
        <>
          {isSigninOrSignup && <Header showProfile={showProfile} email={email} />}
          {children}
        </>
      )}
    </PageTransition>
  );
}
```

- [ ] **Step 4: Create `<AdminPage>` component**

File: `src/components/shared/AdminPage.tsx`:

```tsx
"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Fetch_to } from "@/utilities";
import api_link from "@/config/api_link.json";
import { SideNav } from "@/components/admin";
import PageTransition from "@/components/shared/PageTransition";

type Props = { children: ReactNode };

export default function AdminPage({ children }: Props) {
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      const response = await Fetch_to(api_link.jwt.verify);
      if (!response.success) router.push("/");
    };
    verify();
  }, [router]);

  return (
    <PageTransition className="flex min-h-screen bg-surface-warm" style={{ backgroundImage: "var(--bg-interior)" }}>
      <div className="md:w-64 shrink-0">
        <SideNav />
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </PageTransition>
  );
}
```

- [ ] **Step 5: Verify TypeScript compilation**

```bash
npx tsc --noEmit --pretty 2>&1 | Select-String -Pattern "InteriorPage|AdminPage|SectionHeading"
```
Expected: zero errors related to new components.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/components/shared/InteriorPage.tsx src/components/shared/AdminPage.tsx src/components/shared/SectionHeading.tsx
git commit -m "feat: add interior design tokens and shared page wrapper components"
```

---

### Task 2: Auth Form Components (3 new)

**Files:**
- Create: `src/components/auth/forgot-password.tsx`
- Create: `src/components/auth/reset-password.tsx`
- Create: `src/components/auth/verify-otp.tsx`

**Interfaces:**
- Consumes: `Fetch_to`, glass card classes, blue-600 button pattern
- Produces: 3 auth form components matching signin/signup glass card style

- [ ] **Step 1: Create forgot-password component**

File: `src/components/auth/forgot-password.tsx`:

```tsx
"use client";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import Fetch_to from "@/utilities/Fetch_to";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await Fetch_to("/services/supabase/auth/forgot-password", { email: email.trim() });
      setSent(true);
      setMessage(response.message || "If the email exists, a reset link has been sent.");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen bg-[url('/lccbBG.jpg')] bg-cover bg-center flex items-center justify-center mt-16 overflow-hidden">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1.5 bg-blue-600" />
          <div className="p-8 sm:p-10">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-primary mb-2">Forgot Password</h1>
              <p className="text-muted text-sm">Enter your email to receive a reset link</p>
            </div>
            {sent ? (
              <div className="text-center">
                <p className="text-green-700 mb-4">{message}</p>
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-semibold">Return to Sign In</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition" />
                </div>
                {error ? <p className="text-red-600 text-sm">{error}</p> : null}
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50">
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <div className="text-center">
                  <Link href="/auth/signin" className="inline-flex items-center gap-1 text-sm text-muted hover:text-blue-600">
                    <ArrowLeft size={16} /> Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create reset-password component**

File: `src/components/auth/reset-password.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Fetch_to from "@/utilities/Fetch_to";
import { Lock } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!token) router.push("/auth/signin"); }, [token, router]);

  const validate = (pw: string) => {
    if (pw.length < 8) return "At least 8 characters";
    if (!/[A-Z]/.test(pw)) return "Need an uppercase letter";
    if (!/[a-z]/.test(pw)) return "Need a lowercase letter";
    if (!/[0-9]/.test(pw)) return "Need a number";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const err = validate(password);
    if (err) { setError(err); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const response = await Fetch_to("/services/supabase/auth/reset-password", { token, password });
      if (response.success) {
        setSuccess("Password reset. Redirecting...");
        setTimeout(() => router.push("/auth/signin"), 2000);
      } else {
        setError(response.message || "Failed");
      }
    } catch { setError("Something went wrong"); }
    finally { setLoading(false); }
  };

  return (
    <section className="relative min-h-screen bg-[url('/lccbBG.jpg')] bg-cover bg-center flex items-center justify-center mt-16 overflow-hidden">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1.5 bg-blue-600" />
          <div className="p-8 sm:p-10">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-primary mb-2">Reset Password</h1>
              <p className="text-muted text-sm">Enter your new password</p>
            </div>
            {success ? <p className="text-green-700 text-center">{success}</p> : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition" />
                </div>
                {error ? <p className="text-red-600 text-sm">{error}</p> : null}
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50">
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}
            <div className="text-center mt-4">
              <Link href="/auth/signin" className="text-sm text-muted hover:text-blue-600">Back to Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create verify-otp component**

File: `src/components/auth/verify-otp.tsx`: (same glass card pattern with OTP input layout)

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Fetch_to from "@/utilities/Fetch_to";
import { useAuth } from "@/context/AuthContext";

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { refreshAuth } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { if (!email) router.push("/auth/signin"); }, [email, router]);
  useEffect(() => {
    if (resendTimer > 0) { const t = setInterval(() => setResendTimer((p) => p - 1), 1000); return () => clearInterval(t); }
  }, [resendTimer]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const n = [...otp]; n[i] = v; setOtp(n);
    if (v && i < 5) inputsRef.current[i + 1]?.focus();
  };
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };
  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length !== 6) { setError("Enter the complete 6-digit code"); return; }
    setLoading(true); setError("");
    try {
      const response = await Fetch_to("/services/supabase/auth/verify-otp", { email, otp: code });
      if (response.success) {
        if (response.data?.token && typeof window !== "undefined") localStorage.setItem("authToken", response.data.token);
        await refreshAuth();
        router.push("/");
      } else setError(response.message || "Invalid code");
    } catch { setError("Something went wrong"); }
    finally { setLoading(false); }
  };
  const handleResend = async () => {
    if (resendTimer > 0) return; setError("");
    try { await Fetch_to("/services/supabase/auth/send-otp", { email }); setResendTimer(60); }
    catch { setError("Failed to resend"); }
  };

  return (
    <section className="relative min-h-screen bg-[url('/lccbBG.jpg')] bg-cover bg-center flex items-center justify-center mt-16 overflow-hidden">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1.5 bg-blue-600" />
          <div className="p-8 sm:p-10">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-primary mb-2">Verify Your Email</h1>
              <p className="text-muted text-sm">We sent a 6-digit code to <span className="font-semibold">{email}</span></p>
            </div>
            <div className="flex gap-2 justify-center mb-6">
              {otp.map((d, i) => (
                <input key={i} ref={(el) => { inputsRef.current[i] = el; }} type="text" inputMode="numeric" maxLength={1}
                  value={d} onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 outline-none transition" />
              ))}
            </div>
            {error ? <p className="text-red-600 text-sm text-center mb-4">{error}</p> : null}
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50">
              {loading ? "Verifying..." : "Verify"}
            </button>
            <p className="text-center text-sm text-muted mt-4">
              Didn&apos;t receive the code?{" "}
              <button type="button" onClick={handleResend} disabled={resendTimer > 0}
                className="text-blue-600 font-semibold disabled:text-gray-400">
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify TypeScript compilation**

```bash
npx tsc --noEmit --pretty 2>&1 | Select-String -Pattern "forgot-password|reset-password|verify-otp"
```
Expected: zero errors related to these components.

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/forgot-password.tsx src/components/auth/reset-password.tsx src/components/auth/verify-otp.tsx
git commit -m "feat: auth form components with glass card styling"
```

---

### Task 3: Public Page Wrapper Migration (17 page.tsx files)

**Files:** Modify 17 page.tsx files:
- `src/app/(pages)/overview/page.tsx`
- `src/app/(pages)/courses/page.tsx`
- `src/app/(pages)/courses/BSHM/page.tsx`
- `src/app/(pages)/courses/BAELS/page.tsx`
- `src/app/(pages)/courses/BSBA-HRM/page.tsx`
- `src/app/(pages)/courses/BSBA-MM/page.tsx`
- `src/app/(pages)/question/page.tsx`
- `src/app/(pages)/alumni/page.tsx`
- `src/app/(pages)/form/page.tsx`
- `src/app/(pages)/form/draft/page.tsx`
- `src/app/(pages)/form/reviewapplication/page.tsx`
- `src/app/(pages)/form/applicationstatus/page.tsx`
- `src/app/(pages)/form/applicationstatus/[id]/page.tsx`
- `src/app/(pages)/form/civilstatus/page.tsx`
- `src/app/(pages)/form/civilstatus/[id]/page.tsx`
- `src/app/(pages)/alumni/alumniform/page.tsx`
- `src/app/(pages)/myprofile/page.tsx`

**Interfaces:**
- Consumes: `<InteriorPage>` from Task 1
- Produces: all 17 pages wrapped in `<InteriorPage>`

For each file:
1. Remove `Header`, `Footer` imports (they're now in InteriorPage)
2. Remove `Fetch_to`, `api_link` imports and the entire `useEffect` JWT verify block
3. Remove `useState`, `useEffect` imports if no longer needed
4. Replace wrapper with `<InteriorPage showFooter={true|false}>`
   - All pages except myprofile: `showFooter={true}` (default)
   - myprofile: `showFooter={false}`

Example (overview):

```tsx
"use client";
import { OverView } from "@/components/overview";
import InteriorPage from "@/components/shared/InteriorPage";

export default function LandPage() {
  return (
    <InteriorPage>
      <OverView />
    </InteriorPage>
  );
}
```

- [ ] **Step 1: Migrate overview page.tsx**
- [ ] **Step 2: Migrate courses page.tsx**
- [ ] **Step 3: Migrate courses/BSHM page.tsx**
- [ ] **Step 4: Migrate courses/BAELS page.tsx**
- [ ] **Step 5: Migrate courses/BSBA-HRM page.tsx**
- [ ] **Step 6: Migrate courses/BSBA-MM page.tsx**
- [ ] **Step 7: Migrate question (FAQ) page.tsx**
- [ ] **Step 8: Migrate alumni page.tsx**
- [ ] **Step 9: Migrate form page.tsx** (has Suspense wrapper — keep it, wrap InteriorPage inside)
- [ ] **Step 10: Migrate form/draft page.tsx**
- [ ] **Step 11: Migrate form/reviewapplication page.tsx**
- [ ] **Step 12: Migrate form/applicationstatus page.tsx** (has Suspense — keep it)
- [ ] **Step 13: Migrate form/applicationstatus/[id] page.tsx**
- [ ] **Step 14: Migrate form/civilstatus page.tsx**
- [ ] **Step 15: Migrate form/civilstatus/[id] page.tsx**
- [ ] **Step 16: Migrate alumni/alumniform page.tsx**
- [ ] **Step 17: Migrate myprofile page.tsx** (`showFooter={false}`)

- [ ] **Step 18: Verify**

```bash
npx tsc --noEmit --pretty 2>&1 | Select-String -Pattern "error TS"
```
Expected: no new errors (pre-existing ones are acceptable).

- [ ] **Step 19: Commit**

```bash
git add src/app/\(pages\)/overview/page.tsx src/app/\(pages\)/courses/page.tsx ... (all 17 files)
git commit -m "feat: migrate 17 public pages to InteriorPage wrapper"
```

---

### Task 4: Auth + Admin Page Wrapper Migration (12 page.tsx files)

**Files:** Modify 12 page.tsx files:
- `src/app/(pages)/auth/signin/page.tsx`
- `src/app/(pages)/auth/signup/page.tsx`
- `src/app/(pages)/auth/forgot-password/page.tsx`
- `src/app/(pages)/auth/reset-password/page.tsx`
- `src/app/(pages)/auth/verify-otp/page.tsx`
- `src/app/(pages)/admin/page.tsx`
- `src/app/(pages)/admin/application/page.tsx`
- `src/app/(pages)/admin/applications/page.tsx`
- `src/app/(pages)/admin/activitylogs/page.tsx`
- `src/app/(pages)/admin/adminalumni/page.tsx`
- `src/app/(pages)/admin/setting/page.tsx`
- `src/app/(pages)/admin/sidenav/page.tsx`

**Interfaces:**
- Consumes: `<InteriorPage variant="auth">`, `<AdminPage>`, auth form components
- Produces: auth pages use InteriorPage(auth), admin pages use AdminPage

Auth pages migration pattern:

```tsx
// signin — remove JWT boilerplate, replace with wrapper
import { SignIn } from "@/components/auth";
import InteriorPage from "@/components/shared/InteriorPage";

export default function SignInPage() {
  return (
    <InteriorPage variant="auth" showFooter={false}>
      <SignIn />
    </InteriorPage>
  );
}
```

```tsx
// forgot-password — extract to component, use wrapper
import ForgotPasswordForm from "@/components/auth/forgot-password";
import InteriorPage from "@/components/shared/InteriorPage";

export default function ForgotPasswordPage() {
  return (
    <InteriorPage variant="auth" showFooter={false}>
      <ForgotPasswordForm />
    </InteriorPage>
  );
}
```

Admin pages migration pattern:

```tsx
// Before
<PageTransition className="flex min-h-screen bg-gray-100">
  <div className="md:w-64 shrink-0"><SideNav /></div>
  <div className="flex-1 overflow-hidden"><Admin /></div>
</PageTransition>

// After
import AdminPage from "@/components/shared/AdminPage";

<AdminPage>
  <Admin />
</AdminPage>
```

Admin sidenav special case — should NOT use AdminPage (avoid double SideNav):

```tsx
import { SideNav } from "@/components/admin";
import PageTransition from "@/components/shared/PageTransition";

export default function SideNavPage() {
  return (
    <PageTransition className="flex min-h-screen bg-surface-warm" style={{ backgroundImage: "var(--bg-interior)" } as React.CSSProperties}>
      <div className="md:w-64 shrink-0">
        <SideNav />
      </div>
    </PageTransition>
  );
}
```

- [ ] **Step 1: Migrate signin page**
- [ ] **Step 2: Migrate signup page**
- [ ] **Step 3: Migrate forgot-password page** (use new component)
- [ ] **Step 4: Migrate reset-password page** (use new component, keep Suspense)
- [ ] **Step 5: Migrate verify-otp page** (use new component, keep Suspense)
- [ ] **Step 6-11: Migrate 6 admin pages** (all except sidenav)
- [ ] **Step 12: Migrate admin/sidenav** (special case — no AdminPage)

- [ ] **Step 13: Verify**

```bash
npx tsc --noEmit --pretty 2>&1 | Select-String -Pattern "error TS"
```

- [ ] **Step 14: Commit**

```bash
git add ...(all 12 files)
git commit -m "feat: migrate auth and admin pages to new wrappers"
```

---

### Task 5: Public Content Components Update (8 info pages)

**Files:** Modify 8 components:
- `src/components/overview/about.tsx`
- `src/components/courses/program.tsx`
- `src/components/courses/bshm.tsx`
- `src/components/courses/baels.tsx`
- `src/components/courses/bsba_hrm.tsx`
- `src/components/courses/bsba_mm.tsx`
- `src/components/question/faq.tsx`
- `src/components/alumni/home.tsx`

For each component:
1. Remove any page-level bg class from the root wrapper (e.g., `bg-gray-50`, `bg-gray-100`, `from-blue-50 to-white`, `bg-slate-50`)
2. Replace heading classes with `<SectionHeading level="h2|h3">Title</SectionHeading>`
3. Import `SectionHeading` from `@/components/shared/SectionHeading`
4. Standardize card wrappers: `bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30`
5. Wrap major sections in `<Reveal>` from `@/components/shared/Reveal`
6. Change any `bg-blue-700` buttons to `bg-blue-600`

**Pattern:**

```tsx
// Before
<section className="py-20 bg-blue-50">
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="text-2xl font-semibold text-blue-700 mb-4">Section Title</h2>

// After
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";

<Reveal>
  <section className="py-20">
    <div className="max-w-6xl mx-auto px-6">
      <SectionHeading>Section Title</SectionHeading>
```

- [ ] **Step 1: Update about.tsx**
  - Remove: no wrapper bg needed (already clean)
  - Mission/Vision cards: `bg-blue-50` → keep as accent variant but use `bg-blue-50/50` for subtlety
  - Section cards: `bg-white shadow-md rounded-xl` → `bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30`
  - h2: `text-2xl font-semibold text-blue-700 mb-4` → `<SectionHeading>`
  - Wrap sections in `<Reveal>`
- [ ] **Step 2: Update program.tsx**
  - Hero section stays as-is
  - Section cards → glass pattern
  - h1/h2 → SectionHeading
- [ ] **Step 3-6: Update 4 course detail pages** (bshm, baels, bsba_hrm, bsba_mm)
  - Remove `bg-linear-to-b from-blue-50 to-white` wrapper
  - Keep hero section as-is
  - Section cards → glass pattern
  - Headings → SectionHeading
- [ ] **Step 7: Update faq.tsx**
  - Remove `bg-gray-50` from wrapper
  - FAQ items → glass card with Reveal
  - h1 → SectionHeading level="h1"
- [ ] **Step 8: Update alumni/home.tsx**
  - Remove `bg-gray-100` from wrapper
  - Filter bar, alumni cards → glass pattern
  - Headings → SectionHeading

- [ ] **Step 9: Verify TypeScript compilation**
- [ ] **Step 10: Commit**

---

### Task 6: Form + Profile Content Components Update (6 components)

**Files:** Modify 6 components:
- `src/components/form/programdetails.tsx`
- `src/components/form/draftxstatus.tsx`
- `src/components/form/applicationstatus.tsx`
- `src/components/form/reviewapplication.tsx`
- `src/components/alumni/alumniform.tsx`
- `src/components/myprofile/profile.tsx`

Same pattern as Task 5. Additionally:
- `programdetails.tsx`: already has `<Reveal>` — keep those, just update card bg
- `applicationstatus.tsx`: remove `bg-gray-50` from wrapper
- `reviewapplication.tsx`: remove `bg-slate-50` from wrapper
- `alumniform.tsx`: remove `bg-gray-100` from wrapper
- `myprofile/profile.tsx`: no bg changes needed (already clean)

- [ ] **Step 1-6: Update each component**
- [ ] **Step 7: Verify TypeScript compilation**
- [ ] **Step 8: Commit**

---

### Task 7: Admin Content Components Update (6 components)

**Files:** Modify 6 components:
- `src/components/admin/dashboard.tsx`
- `src/components/admin/applications.tsx`
- `src/components/admin/application.tsx`
- `src/components/admin/adminalumni.tsx`
- `src/components/admin/activitylogs.tsx`
- `src/components/admin/setting.tsx`

For each:
1. Remove page-level bg class (`bg-gray-100`, `bg-slate-100`)
2. Card wrappers: keep `rounded-2xl`/`rounded-3xl`, change `ring-slate-200` → `ring-1 ring-slate-200/30`
3. Replace heading classes with `<SectionHeading>` where applicable
4. Wrap sections in `<Reveal>`
5. Any `bg-blue-700` → `bg-blue-600`
6. Any `focus:ring-blue-500` → `focus:ring-blue-600/30`

- [ ] **Step 1: Update dashboard.tsx**
- [ ] **Step 2: Update applications.tsx**
- [ ] **Step 3: Update application.tsx**
- [ ] **Step 4: Update adminalumni.tsx**
- [ ] **Step 5: Update activitylogs.tsx**
- [ ] **Step 6: Update setting.tsx**
- [ ] **Step 7: Verify TypeScript compilation**
- [ ] **Step 8: Commit**

---

### Task 8: Landing Page Banner Update

**Files:** Modify: `src/components/landpage/banner.tsx`

- [ ] **Step 1: Update "About LCCB ETEEAP" section**
  - Change `bg-blue-50` section bg → remove, let page warm bg show through
  - Feature cards: `bg-blue-50 p-6 rounded-xl shadow` → `bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30`
  - Heading → `<SectionHeading>`
  - Wrap in `<Reveal>`

- [ ] **Step 2: Update "Why Choose LCCB ETEEAP" section**
  - Change `bg-white` section bg → remove, let page warm bg show
  - Cards: `bg-blue-50 p-6 rounded-xl shadow` → `bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30`
  - Heading → `<SectionHeading>`
  - Wrap in `<Reveal>`

- [ ] **Step 3: Keep hero section** (`bg-blue-800`) as-is
- [ ] **Step 4: Keep CTA section** (`bg-blue-600`) as-is

- [ ] **Step 5: Verify TypeScript compilation**
- [ ] **Step 6: Commit**

---

### Task 9: Animation Integration

**Files:** Modify: same 21 content components (verify Reveal is applied)

This task is a pass over all content components to ensure `<Reveal>` is applied consistently. Most should already be wrapped from Tasks 5-8.

- [ ] **Step 1: Audit all 21 content components for Reveal coverage**
  - Check each component's major sections are wrapped in `<Reveal>`
  - Confirm `useReducedMotion()` is built into Reveal (already is — no change needed)
  - Confirm import: `import Reveal from "@/components/shared/Reveal"`
  - If any sections missing Reveal, add wrappers

- [ ] **Step 2: Verify**
  - Spot-check 3-4 pages in the browser (webpack mode)
  - Confirm warm bg, glass cards, SectionHeading, Reveal animations
  - Confirm reduced motion preference disables animations
