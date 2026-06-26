"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const DRAFT_KEY = "eteeap-application-draft";

type DraftType = {
  applicantName?: string;
  programName?: string;
  created_at?: string;
  createdAt?: string;
  [k: string]: unknown;
};

function formatCreatedAt(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function Draft() {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftType | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return setDraft(null);
    try {
      setDraft(JSON.parse(raw));
    } catch {
      setDraft(null);
    }
  }, []);

  const handleContinue = () => {
    if (!draft || typeof window === "undefined") return;
    try {
      window.localStorage.setItem("selected-application", JSON.stringify(draft));
    } catch {
      // If localStorage fails, try sessionStorage
      try {
        window.sessionStorage.setItem("selected-application", JSON.stringify(draft));
      } catch {
        // If both fail, store in memory fallback
        (window as unknown as { __SELECTED_APPLICATION__?: unknown }).__SELECTED_APPLICATION__ = draft;
      }
    }
    // Navigate to the civil status form with program name
    router.push(`/form/civilstatus?program=${encodeURIComponent(draft.programName ?? "")}`);
  };

  const handleDelete = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(DRAFT_KEY);
    setDraft(null);
  };

  return (
    <div className="p-6 mt-25 mb-20">
      <h1 className="mb-4 text-2xl font-bold">My Drafts</h1>

      <div className="rounded-md bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <div className="text-md font-semibold text-slate-900">{draft?.programName ?? "Bachelor of Arts in English Language Studies"}</div>
            <div className="mt-1 text-sm text-slate-600">{draft?.applicantName ?? "Joey Abundiente"} • {formatCreatedAt(draft?.created_at ?? draft?.createdAt ?? "6/23/2026, 4:06:58 PM")}</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleContinue}
              disabled={!draft}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Continue
            </button>
            <button
              onClick={handleDelete}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}