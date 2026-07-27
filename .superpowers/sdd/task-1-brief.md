# Task 1: CSS Foundation + Shared Components

## Files
- Modify: `src/app/globals.css`
- Create: `src/components/shared/InteriorPage.tsx`
- Create: `src/components/shared/AdminPage.tsx`
- Create: `src/components/shared/SectionHeading.tsx`

## Dependencies
- Consumes: `Header`, `Footer` from `@/components/landpage`; `SideNav` from `@/components/admin`; `PageTransition` from `@/components/shared`
- Consumes: `Fetch_to` from `@/utilities`; `api_link` from `@/config/api_link.json`
- Produces: `<InteriorPage variant="public"|"auth" showFooter={true|false}>`, `<AdminPage>`, `<SectionHeading level="h1"|"h2"|"h3">`

## Step 1: Add `--bg-interior` token to globals.css

Add to the `:root` block in `src/app/globals.css`:
```css
--bg-interior: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(30, 58, 95, 0.04) 0%, transparent 60%);
```

## Step 2: Create `<SectionHeading>` component

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

## Step 3: Create `<InteriorPage>` component

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

## Step 4: Create `<AdminPage>` component

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

## Verification
```bash
npx tsc --noEmit --pretty 2>&1 | Select-String -Pattern "InteriorPage|AdminPage|SectionHeading"
```

## Commit
```bash
git add src/app/globals.css src/components/shared/InteriorPage.tsx src/components/shared/AdminPage.tsx src/components/shared/SectionHeading.tsx
git commit -m "feat: add interior design tokens and shared page wrapper components"
```
