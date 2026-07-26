# ETEEAP NEXTV — Future Revisions Plan

> ⚠️ DO NOT COMMIT. DO NOT PUSH. For review only.
> All changes are local — verify first before implementing.

---

## Phase 1 — Quick Wins (~30 mins)

### #5: Limit file upload to 5MB

**What client wants:** I-limit ang file uploads sa 5MB max instead of current 10MB.

**Files to change:**

| File | Line(s) | Change |
|---|---|---|
| `src/components/form/programdetails.tsx` | 148 | `10 * 1024 * 1024` → `5 * 1024 * 1024` |
| `src/components/form/programdetails.tsx` | 149 | `"exceeds the 10MB file size limit."` → `"exceeds the 5MB file size limit."` |
| `src/components/form/applicationstatus.tsx` | 138 | `10 * 1024 * 1024` → `5 * 1024 * 1024` |
| `src/components/form/applicationstatus.tsx` | 139 | `"File must be 10MB or smaller."` → `"File must be 5MB or smaller."` |
| `src/components/form/applicationstatus.tsx` | 664 | `"Max 10MB"` → `"Max 5MB"` |
| `src/app/services/supabase/form/submit/route.ts` | 78 | `10 * 1024 * 1024` → `5 * 1024 * 1024` |
| `src/app/services/supabase/form/submit/route.ts` | 80 | `"10MB"` → `"5MB"` |

**Note:** `programdetails.tsx:359` already says "5MB per file" — no change needed.

**Verification:**
- Upload a file 4.9MB → should succeed
- Upload a file 5.1MB → should be rejected with "exceeds the 5MB file size limit"

---

### #8: Text-based logo in header + Image logo above welcome text

**What client wants:**
- (a) Header logo becomes text-based ("LCCB" + "ETEEAP" in styled text) instead of PNG images
- (b) The image logo moves ABOVE the "Welcome to LCCB ETEEAP" headline on the landing page banner

**Files to change:**

| File | Line(s) | Change |
|---|---|---|
| `src/components/landpage/header.tsx` | 98-112 | Replace two `<Image>` tags with text-based logo `<div>` |
| `src/components/landpage/header.tsx` | 6 | Remove `import imgSrc from "@/config/img_src.json"` (no longer used in header) |
| `src/components/landpage/banner.tsx` | After line 17 | Insert logo `<Image>` div before `<h1>` |
| `src/components/landpage/footer.tsx` | 15-29 | (Optional) Same text-based logo for consistency |

**Exact replacement — header.tsx lines 98-112:**

Current:
```tsx
<Image src={imgSrc.lccblogo} alt="LCCB Logo" width={65} height={65} className="object-contain" />
<Image src={imgSrc.eteeapLogo} alt="ETEEAP Logo" width={65} height={65} className="object-contain" />
```

Replace with:
```tsx
{/* Text-based logo */}
<div className="flex items-center gap-2">
  <span className="text-lg font-bold text-blue-800">LCCB</span>
  <span className="text-sm font-semibold text-blue-600 border-l border-blue-300 pl-2">ETEEAP</span>
</div>
```

**Exact insertion — banner.tsx after line 17:**

```tsx
{/* Logo above welcome text */}
<div className="mb-6">
  <Image src="/ETEEAP_LOGO.png" alt="ETEEAP Logo" width={100} height={100} className="object-contain" />
</div>
<h1 className="text-4xl lg:text-5xl font-bold mb-4">
  Welcome to LCCB ETEEAP<br />
  Online Application
</h1>
```

**Verification:**
- All 18 pages show text-based logo in header
- Homepage shows ETEEAP image logo above welcome text

---

### #1: ETEEAP Google Form link — prominent location

**What client wants:** The Google Form link should be easily visible "under application form" — not buried inside a file upload field.

**Files to change:**

| File | Line(s) | Change |
|---|---|---|
| `src/components/form/programdetails.tsx` | After line 348 | Add callout section "Step 1: Complete ETEEAP Google Form" |

**Exact insertion after line 348 (after business owner section, before document upload):**

```tsx
{/* ETEEAP External Form Callout */}
<div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-6">
  <p className="font-semibold text-amber-900 mb-2">
    Step 1: Complete the ETEEAP Google Form
  </p>
  <p className="text-sm text-amber-700 mb-3">
    Before uploading documents, you must fill out the official ETEEAP application form on Google Forms.
  </p>
  <Link
    href={eteeapFormUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm font-medium"
  >
    Open ETEEAP Form <FaExternalLinkAlt size={12} />
  </Link>
</div>
```

Keep the existing link inside the `applicationForm` field (lines 471-480) as a secondary reminder.

**Verification:**
- Navigate to `/form?program=...` — see the amber callout before document upload section
- Click "Open ETEEAP Form" — opens Google Form in new tab

---

## Phase 2 — Medium Complexity (~15 hours)

### #3: Email notifications for every admin action

**What client wants:** Every time admin accepts/rejects/verifies alumni/applications, send an email to the user. Currently only activity logs (in-app notifications).

**Files to change:**

| File | Line(s) | Change |
|---|---|---|
| `src/lib/resend.ts` | After line 45 | Add new `sendStatusEmail()` function using nodemailer |
| `src/app/services/supabase/retrieve_data/route.ts` | Line 1 | Add `import { sendStatusEmail } from "@/lib/resend"` |
| `src/app/services/supabase/retrieve_data/route.ts` | After line 403 | Call `sendStatusEmail()` after auth status update |
| `src/app/services/supabase/alumni_profiles/update/route.ts` | Line 1 | Add `import { sendStatusEmail } from "@/lib/resend"` |
| `src/app/services/supabase/alumni_profiles/update/route.ts` | After line 20 | Call `sendStatusEmail()` after alumni status update |

**New function — `sendStatusEmail` in `src/lib/resend.ts`:**

```typescript
export async function sendStatusEmail(
  email: string,
  applicantName: string,
  action: "approved" | "rejected" | "on_hold" | "differed" | "under_review" | "deleted",
  details?: string
): Promise<void> {
  const actionLabels: Record<string, string> = {
    approved: "Application Approved",
    rejected: "Application Rejected",
    on_hold: "Application On Hold",
    differed: "Application Sent Back for Revision",
    under_review: "Application Under Review",
    deleted: "Application Deleted",
  };

  const actionColors: Record<string, string> = {
    approved: "#16a34a", rejected: "#dc2626", on_hold: "#f59e0b",
    differed: "#7c3aed", under_review: "#2563eb", deleted: "#64748b",
  };

  const label = actionLabels[action] || "Application Status Update";
  const color = actionColors[action] || "#1e3a5f";

  await transporter.sendMail({
    from: `"ETEEAP NEXTV" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `ETEEAP NEXTV - ${label}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1e3a5f;">ETEEAP NEXTV</h1>
        <p style="font-size: 16px;">Dear ${applicantName},</p>
        <div style="background: #f0f4ff; border-radius: 12px; padding: 24px; margin: 16px 0;">
          <p style="font-size: 18px; font-weight: bold; color: ${color}; margin: 0;">${label}</p>
          ${details ? `<p style="margin-top: 12px; color: #475569; font-size: 14px;">${details}</p>` : ""}
        </div>
        <p style="color: #64748b; font-size: 14px;">
          You can check your status by logging into the ETEEAP portal.
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
          This is an automated notification. Please do not reply to this email.
        </p>
      </div>
    `,
  });
}
```

**Call in `retrieve_data/route.ts` after line 403:**

```typescript
if (currentRow.email) {
  const emailAction = nextStatus === "Approve" ? "approved"
    : nextStatus === "Reject" ? "rejected"
    : nextStatus === "On Hold" ? "on_hold"
    : nextStatus === "Differ" ? "differed"
    : nextStatus === "Under Review" ? "under_review"
    : nextStatus === "Delete" ? "deleted"
    : "under_review";

  await sendStatusEmail(
    currentRow.email,
    String(currentRow.applicantName || "Applicant"),
    emailAction,
    `Your application (Form #${rowId}) status has been updated to ${nextStatus}.`
  ).catch((err) => console.error("Failed to send status email:", err));
}
```

**Call in `alumni_profiles/update/route.ts` after line 20:**

```typescript
if (data && data.length > 0 && data[0].email) {
  const emailAction = verification_status === "verified" ? "approved" : "rejected";
  await sendStatusEmail(
    data[0].email,
    data[0].full_name || "Alumni",
    emailAction,
    `Your alumni profile has been ${verification_status} by the admin.`
  ).catch((err) => console.error("Failed to send alumni status email:", err));
}
```

**⚠️ Important:** `alumni_profiles/update/route.ts` currently does NOT fetch the email. Need to either:
- Fetch alumni email from DB before updating, OR
- Accept `email` as a body parameter (frontend sends it)

**Recommended:** Frontend sends email. In `adminalumni.tsx`, the `updateStatus` function already has `profile?.email`. Pass it as a body parameter to the update route.

**Verification:**
- Admin accepts an application → check applicant's email inbox for notification
- Admin rejects alumni profile → check alumni's email inbox

---

### #4: Approve / On Hold / Differ buttons

**What client wants:** Instead of just Accept/Reject, admin should have "On Hold" (pause) and "Differ" (send back for revision).

**All files requiring FormStatus type changes:**

| # | File | Line(s) | Change |
|---|---|---|---|
| 1 | `src/app/services/supabase/retrieve_data/route.ts` | 4 | Add `"On Hold" \| "Differ"` to FormStatus type |
| 2 | `src/app/services/supabase/retrieve_data/route.ts` | 99-112 | Add cases in `resolveNextStatus()` |
| 3 | `src/app/services/supabase/retrieve_data/route.ts` | 164-176 | Add entries in `statusOrder` |
| 4 | `src/app/services/supabase/retrieve_data/route.ts` | 342-369 | Add `statusAction` cases |
| 5 | `src/app/services/supabase/retrieve_data/route.ts` | 389-398 | Add `applicantStatusForAuth` cases |
| 6 | `src/components/admin/application.tsx` | 19 | Add to FormStatus type |
| 7 | `src/components/admin/application.tsx` | 114-121 | Add to `normalizeFormStatus` |
| 8 | `src/components/admin/application.tsx` | 170-187 | Add CSS in `StatusPill` |
| 9 | `src/components/admin/application.tsx` | 189-262 | Add buttons in `ApplicationActions` |
| 10 | `src/components/admin/application.tsx` | 682-696 | Update `requestApplicationStatusChange` |
| 11 | `src/components/admin/application.tsx` | 755-765 | Add filter dropdown options |
| 12 | `src/components/admin/application.tsx` | 841-849, 896-904 | Add call sites for new props |
| 13 | `src/components/form/applicationstatus.tsx` | 44 | Add to form_status union type |
| 14 | `src/components/form/applicationstatus.tsx` | 395-406 | Add CSS in `getStatusBadgeClass` |
| 15 | `src/components/form/reviewapplication.tsx` | 159-162, 239 | Add status checks |

**New status semantics:**

| Status | Meaning | Admin can... | Applicant can... |
|---|---|---|---|
| **On Hold** | Paused. Not rejected. Waiting for external factor. | Move back to Under Review, Approve, Reject, Delete | View status, cannot edit |
| **Differ** | Sent back for revision. Fix and resubmit. | Move back to Under Review after resubmit | Resubmit documents, view remarks |

**New buttons in `ApplicationActions` (insert after Reject button):**

```tsx
{/* On Hold */}
<button type="button" onClick={onHold} disabled={!isUnderReview}
  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
  <PauseCircle size={16} /> On Hold
</button>

{/* Differ (Send back for revision) */}
<button type="button" onClick={onDiffer} disabled={!isUnderReview}
  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
  <RotateCcw size={16} /> Differ
</button>
```

**Verification:**
- Admin opens an Under Review application → sees Accept, On Hold, Differ, Reject, Delete buttons
- Admin clicks "On Hold" → status changes, applicant sees "On Hold" badge
- Admin clicks "Differ" → status changes, applicant can resubmit documents

---

### #2: No View Button — Inline Document Preview

**What client wants:** Instead of "View File" button opening a new tab, show PDF/images directly on the page inline.

**Approach:** Create a reusable `DocumentPreview` component. Use native browser iframe for PDFs, `<img>` for images. No external PDF viewer library needed.

**Files to change:**

| File | Line(s) | Change |
|---|---|---|
| `src/components/shared/DocumentPreview.tsx` | **NEW** | Reusable inline preview component |
| `src/components/form/applicationstatus.tsx` | 605-621 | Replace `<a>` buttons with `<DocumentPreview>` |
| `src/components/form/reviewapplication.tsx` | 433-441, 452-461 | Replace `<a>` links with inline preview |
| `src/components/admin/application.tsx` | 302-310 | Replace "View uploaded file" link with inline preview |

**New file — `src/components/shared/DocumentPreview.tsx`:**

```tsx
import { FileText, ExternalLink } from "lucide-react";

type DocumentPreviewProps = {
  url: string;
  label: string;
  className?: string;
};

export default function DocumentPreview({ url, label, className = "" }: DocumentPreviewProps) {
  const lower = url.split("?")[0].toLowerCase();

  // Image
  if (lower.match(/\.(jpg|jpeg|png)(\?|$)/) || (url.startsWith("data:") && url.includes("image/"))) {
    return (
      <img
        src={url}
        alt={label}
        className={`max-w-full max-h-64 rounded-lg object-contain border border-slate-200 ${className}`}
      />
    );
  }

  // PDF via native browser viewer
  if (lower.endsWith(".pdf") || (url.startsWith("data:") && url.includes("application/pdf"))) {
    return (
      <iframe
        src={url}
        className={`w-full h-64 rounded-lg border border-slate-200 ${className}`}
        title={label}
      />
    );
  }

  // Unknown type — fallback link
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 text-sm font-medium text-blue-700 underline hover:text-blue-900 ${className}`}
    >
      <ExternalLink size={14} />
      View File
    </a>
  );
}
```

**Usage in `applicationstatus.tsx` lines 605-621:**

Replace existing View File link + Download button:
```tsx
{val ? (
  <div className="mb-4 space-y-2">
    <DocumentPreview url={val} label={d.label} />
    <a href={val} download className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">
      <Download className="w-4 h-4" /> Download
    </a>
  </div>
) : (
  <div className="mb-4 p-3 bg-gray-100 rounded-lg text-center text-sm text-gray-600">
    Not uploaded yet
  </div>
)}
```

**Verification:**
- Application status: uploaded PDF shows inline in iframe
- Application status: uploaded JPG/PNG shows inline as image
- Review application: uploaded files show inline
- Admin view: uploaded documents show inline

---

## Phase 3 — Major Features (~50 hours)

### #6: Mark Applicants as Graduates

**What client wants:** Admin checkbox to mark accepted applicants as "Graduated" — then auto-appears on alumni feed with filter.

**Technical plan:**

| Step | Details |
|---|---|
| 1 | Add `is_graduate` boolean column to `form` table (or `alumni_profiles`) |
| 2 | Add checkbox in admin Applications page detail modal |
| 3 | When checked, auto-create alumni_profiles entry (or bridge record) |
| 4 | Modify alumni `retrieve-all` to include graduates |
| 5 | Add "Graduates" filter on alumni home page |
| 6 | Add graduate badge on alumni cards |

**Files to change (~12 files):**
- Supabase migration: new column
- `src/components/admin/application.tsx`: checkbox UI
- `src/app/services/supabase/retrieve_data/route.ts`: handle graduate status
- `src/app/services/supabase/alumni_profiles/retrieve-all/route.ts`: include graduates
- `src/components/alumni/home.tsx`: filter dropdown

---

### #9: Alumni Tracer Study

**What client wants:** Track alumni after graduation — employment status, current job, industry, salary range, how long to get hired.

**Existing fields in alumni_profiles:**
- `work_experiences`: company, role, years (already collected)
- `certificates`: licenses (already collected)
- `experience`: reflection text

**New fields needed:**

| Field | Type | In alumni form? |
|---|---|---|
| `employment_status` | text (employed/unemployed/self-employed) | ✅ Add |
| `current_job_title` | text | ✅ Add |
| `current_company` | text | ✅ Add |
| `employment_type` | text (regular/contractual/etc.) | ✅ Add |
| `salary_range` | text | ✅ Add |
| `job_related_to_degree` | boolean | ✅ Add |
| `months_to_first_job` | integer | ✅ Add |

**Files to change (~8 files):**
- Supabase migration: new columns
- `src/components/alumni/alumniform.tsx`: new form fields
- `src/components/alumni/home.tsx`: show tracer data
- `src/components/admin/adminalumni.tsx`: show tracer in detail view
- Admin dashboard: tracer statistics charts

---

### #7: Admin CMS (Blogs/Events/Videos)

**What client wants:** Admin can create/edit/delete blog posts, events, and videos. Displayed publicly.

**Technical plan:**

| Step | Details |
|---|---|
| 1 | Create `blogs` table: id, title, content, type (blog/event/video), video_url, image_url, created_at, author_email |
| 2 | Create CRUD routes: `/services/supabase/cms/create`, `/update`, `/delete`, `/retrieve`, `/retrieve-all` |
| 3 | Create admin CMS page: list view + create/edit form with rich text editor |
| 4 | Create public display pages: `/blog`, `/events` |
| 5 | Add navigation links: "News & Events" in header |

**New files (~15 files):**
- Supabase migration: `cms` table
- `src/app/services/supabase/cms/create/route.ts`
- `src/app/services/supabase/cms/update/route.ts`
- `src/app/services/supabase/cms/delete/route.ts`
- `src/app/services/supabase/cms/retrieve/route.ts`
- `src/app/services/supabase/cms/retrieve-all/route.ts`
- `src/app/(pages)/admin/cms/page.tsx`
- `src/components/admin/cms.tsx`
- `src/app/(pages)/cms/page.tsx` (public display)
- `src/components/cms/cmslist.tsx`

---

## Complete File Manifest

| Phase | Files Modified | New Files | Total Lines |
|---|---|---|---|
| 1 | 3 | 0 | ~7 lines |
| 2 | 6 | 1 | ~150 lines |
| 3 | ~20 | ~15 | ~2000+ lines |
| **Total** | **~29** | **~16** | **~2157+ lines** |

---

## Implementation Checklist

### Phase 1 — Quick Wins
- [ ] #5 — Limit file upload to 5MB (3 files)
- [ ] #8 — Text-based logo in header + image logo above welcome (2 files)
- [ ] #1 — ETEEAP form link callout (1 file)

### Phase 2 — Medium
- [ ] #3 — Email notifications for admin actions (3 files)
- [ ] #4 — Approve / On Hold / Differ buttons (5 files)
- [ ] #2 — Inline document preview (4 files)

### Phase 3 — Major
- [ ] #6 — Mark applicants as graduates (8-12 files)
- [ ] #9 — Alumni tracer study (8 files)
- [ ] #7 — Admin CMS blogs/events/videos (15+ files)

---

*Generated: July 1, 2026 | NOT COMMITTED — REVIEW ONLY*
