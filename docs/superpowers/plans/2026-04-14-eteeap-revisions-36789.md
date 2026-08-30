# ETEEAP Revisions 3-4-6-7-8-9 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement revisions 3 (Review Application confirm), 6 (per-file edit lock), 7 (On Hold distinct indicator), 8 (On Hold + Approve enabled + correct notification — mode B), 9 (reminder 3/7-day lifecycle — keep files), and 4 (clickable notifications + email).

**Architecture:** Keep existing `form.form_status` + `forms_approvals` JSONB. Fix root bugs (`submit` never resets approvals; On Hold dead-end). Derive locks from `form_status`, not remarks. Use `act_logs` + `sendStatusEmail` for notifications. Client-gated reminder with `reminder` endpoint rate-limited 24h; 7-day revert keeps files.

**Tech Stack:** Next.js 15 (webpack), Supabase JS 2.108, framer-motion, nodemailer, Tailwind 4, TypeScript 5.

## Global Constraints

- pnpm package manager — `pnpm add`/`pnpm install`, commit `pnpm-lock.yaml`.
- Vercel uses `pnpm-lock.yaml` frozen — keep in sync.
- Read `node_modules/next/dist/docs/` before Next.js API changes.
- Dev server: `next dev --webpack`.
- `form_status` case-sensitive; backend via `resolveNextStatus`.
- `act_logs` keyed by `user` email, free-text `details`.

---

### Task 1: Review Application — Pre-submit confirmation modal (Revision 3)

**Files:**
- Modify: `src/components/form/reviewapplication.tsx:241-343`
- Test: `src/components/form/reviewapplication.test.tsx`

**Interfaces:**
- Consumes: `Fetch_toFile`, `api_link.form.submit`
- Produces: Modal blocks `handleSubmit("Under Review")` until confirmed.

- [ ] **Step 1: Write failing test** — modal appears on Submit.
- [ ] **Step 2: Run test — FAIL.**
- [ ] **Step 3: Implement** — `showConfirm` state, modal verbatim text, Cancel/Submit.
- [ ] **Step 4: Run test — PASS.**
- [ ] **Step 5: Commit** — `feat(review): add pre-submit confirmation modal`.

### Task 2: ApplicationStatus — Only remarked file editable (Revision 6)

**Files:**
- Modify: `src/components/form/applicationstatus.tsx:417-420, 565-769`
- Modify: `src/app/services/supabase/form/submit/route.ts:142-149`

**Interfaces:**
- Consumes: `my-application` remarks/verified
- Produces: `canEditDoc(key) = !!remarks[key] && !verified`, submit resets approval to Pending.

- [ ] **Step 1: Failing test** — only remarked card shows upload.
- [ ] **Step 2: Run — FAIL.**
- [ ] **Step 3: Implement** — per-doc canEdit, submit resets forms_approvals.
- [ ] **Step 4: Run — PASS.**
- [ ] **Step 5: Commit** — `fix(application-status): scope editability per-document`.

### Task 3: On Hold indicator ≠ Reject (Revision 7)

**Files:**
- Modify: `src/components/admin/application.tsx:175-194`
- Modify: `src/app/services/supabase/activity_logs/route.ts:4-19`

- [ ] **Step 1: Failing test** — distinct pills.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Implement** — StatusPill branches, add On Hold Applicant action.
- [ ] **Step 4: PASS.**
- [ ] **Step 5: Commit** — `fix(admin): distinct On Hold vs Rejected`.

### Task 4: On Hold does NOT disable Approve + correct notification (Revision 8 — Mode B)

**Files:**
- Modify: `src/components/admin/application.tsx:196-269`
- Modify: `src/app/services/supabase/retrieve_data/route.ts:362-395`

**Interfaces:**
- Produces: `canApprove = (Under Review && noRejected) || (On Hold && noRejected)` — B mode.

- [ ] **Step 1: Failing test** — Approve disabled when On Hold with pending Rejected.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Implement** — gating + verbatim On Hold email.
- [ ] **Step 4: PASS.**
- [ ] **Step 5: Commit** — `fix(admin): B-gated Approve from On Hold`.

### Task 5: Notifications — clickable + email (Revision 4)

**Files:**
- Modify: `src/components/landpage/header.tsx:167-175`
- Modify: `src/app/services/supabase/retrieve_data/route.ts:16-32, 276-395`

- [ ] **Step 1: Failing test** — link href.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Implement** — notifHref routing, ensure sendStatusEmail on all paths.
- [ ] **Step 4: PASS.**
- [ ] **Step 5: Commit** — `feat(notifications): clickable + email`.

### Task 6: Reminder lifecycle — 3/7 days (Revision 9 — keep files)

**Files:**
- Modify: `src/components/form/applicationstatus.tsx:417-800`
- Create: `src/app/services/supabase/form/reminder/route.ts`
- Modify: `src/app/services/supabase/form/my-application/route.ts:45-49`

- [ ] **Step 1: Failing test** — disabled before 3d.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Implement** — gating, 24h throttle, 7d revert keeps files.
- [ ] **Step 4: PASS.**
- [ ] **Step 5: Commit** — `feat(reminders): 3-day gate, 7-day revert`.

## Verification

- `pnpm tsc --noEmit && pnpm eslint ...`
- `pnpm test`
- Manual flows per task.
