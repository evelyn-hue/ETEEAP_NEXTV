"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ALUMNI_DRAFT_KEY = "eteeap-alumni-draft";
const APP_DRAFTS_KEY = "eteeap-application-drafts";

type DraftType = Record<string, unknown>;

function formatCreatedAt(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function getDraftLabel(draft: DraftType): string {
  if (draft.programName) return String(draft.programName);
  if (draft.fullName || draft.applicantName) return `Alumni - ${draft.fullName || draft.applicantName}`;
  return "Unnamed Draft";
}

function getDraftName(draft: DraftType): string {
  return String(draft.applicantName || draft.fullName || draft.nickname || "-");
}

export default function Draft() {
  const router = useRouter();
  const [appDrafts, setAppDrafts] = useState<DraftType[]>([]);
  const [alumniDraft, setAlumniDraft] = useState<DraftType | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawApps = window.localStorage.getItem(APP_DRAFTS_KEY);
    if (rawApps) {
      try {
        const parsed = JSON.parse(rawApps);
        if (Array.isArray(parsed)) setAppDrafts(parsed);
      } catch {}
    }

    const rawAlumni = window.localStorage.getItem(ALUMNI_DRAFT_KEY);
    if (rawAlumni) {
      try {
        setAlumniDraft(JSON.parse(rawAlumni));
      } catch {}
    }
  }, []);

  const handleContinueApp = (draft: DraftType) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("selected-application", JSON.stringify(draft));
    } catch {
      try {
        window.sessionStorage.setItem("selected-application", JSON.stringify(draft));
      } catch {
        (window as unknown as { __SELECTED_APPLICATION__?: unknown }).__SELECTED_APPLICATION__ = draft;
      }
    }
    router.push(`/form/civilstatus?program=${encodeURIComponent(String(draft.programName ?? ""))}`);
  };

  const handleContinueAlumni = (draft: DraftType) => {
    router.push("/alumni/alumniform");
  };

  const handleDeleteApp = (index: number) => {
    if (typeof window === "undefined") return;
    const updated = appDrafts.filter((_, i) => i !== index);
    setAppDrafts(updated);
    if (updated.length > 0) {
      window.localStorage.setItem(APP_DRAFTS_KEY, JSON.stringify(updated));
    } else {
      window.localStorage.removeItem(APP_DRAFTS_KEY);
    }
  };

  const handleDeleteAlumni = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ALUMNI_DRAFT_KEY);
    setAlumniDraft(null);
  };

  const hasAny = appDrafts.length > 0 || alumniDraft !== null;

  return (
    <div className="p-6 mt-25 mb-20">
      <h1 className="mb-4 text-2xl font-bold">My Drafts</h1>

      {!hasAny ? (
        <div className="rounded-md bg-white shadow-sm p-8 text-center text-slate-500">
          No saved drafts. Start filling out an application form and save it as a draft to see it here.
        </div>
      ) : (
        <div className="space-y-3">
          {appDrafts.map((draft, i) => (
            <div key={`app-${i}`} className="rounded-md bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <div className="text-md font-semibold text-slate-900">{getDraftLabel(draft)}</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {getDraftName(draft)} &bull; {formatCreatedAt(String(draft.created_at ?? draft.createdAt ?? ""))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleContinueApp(draft)}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => handleDeleteApp(i)}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {alumniDraft && (
            <div className="rounded-md bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <div className="text-md font-semibold text-slate-900">
                    {getDraftLabel(alumniDraft)}
                    <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                      Alumni
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {getDraftName(alumniDraft)} &bull; {formatCreatedAt(String(alumniDraft.created_at ?? alumniDraft.createdAt ?? ""))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleContinueAlumni(alumniDraft)}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Continue
                  </button>
                  <button
                    onClick={handleDeleteAlumni}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}