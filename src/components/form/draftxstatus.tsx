"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Fetch_to } from "@/utilities";
import Reveal from "@/components/shared/Reveal";
import SectionHeading from "@/components/shared/SectionHeading";
import SectionEyebrow from "@/components/shared/SectionEyebrow";

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
  const reduced = useReducedMotion();
  const router = useRouter();
  const { email: userEmail } = useAuth();
  const [appDrafts, setAppDrafts] = useState<DraftType[]>([]);
  const [alumniDraft, setAlumniDraft] = useState<DraftType | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rawApps = window.localStorage.getItem(APP_DRAFTS_KEY);
    if (rawApps) {
      try {
        const parsed = JSON.parse(rawApps);
        if (Array.isArray(parsed)) setAppDrafts(parsed);
      } catch { }
    }
    const rawAlumni = window.localStorage.getItem(ALUMNI_DRAFT_KEY);
    if (rawAlumni) {
      try {
        setAlumniDraft(JSON.parse(rawAlumni));
      } catch { }
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
    router.push(`/form?program=${encodeURIComponent(String(draft.programName ?? ""))}`);
  };

  const handleContinueAlumni = () => {
    router.push("/alumni/alumniform");
  };

  const handleDeleteApp = (index: number) => {
    if (typeof window === "undefined") return;
    const deletedDraft = appDrafts[index];
    const updated = appDrafts.filter((_, i) => i !== index);
    setAppDrafts(updated);
    if (updated.length > 0) {
      window.localStorage.setItem(APP_DRAFTS_KEY, JSON.stringify(updated));
    } else {
      window.localStorage.removeItem(APP_DRAFTS_KEY);
    }
    if (userEmail && deletedDraft) {
      const program = String(deletedDraft.programName || "Unknown Program");
      Fetch_to("/services/supabase/activity_logs", {
        mode: "insert",
        user: userEmail,
        actions: "Draft Applicant",
        details: `Deleted draft application for: ${program}`,
      }).catch(() => {});
    }
  };

  const handleDeleteAlumni = () => {
    if (typeof window === "undefined") return;
    if (userEmail) {
      Fetch_to("/services/supabase/activity_logs", {
        mode: "insert",
        user: userEmail,
        actions: "Draft Applicant",
        details: "Deleted alumni draft application",
      }).catch(() => {});
    }
    window.localStorage.removeItem(ALUMNI_DRAFT_KEY);
    setAlumniDraft(null);
  };

  const hasAny = appDrafts.length > 0 || alumniDraft !== null;

  return (
    <main>
      {/* Hero */}
      <section className="relative w-full h-64 md:h-72 flex items-center justify-center overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center px-6">
          <SectionEyebrow className="text-white/80">Saved Work</SectionEyebrow>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display">
            My Drafts
          </h1>
          <p className="text-white/70 mt-4 max-w-xl mx-auto">
            Continue where you left off or review your saved applications.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-20">
        {!hasAny ? (
          <Reveal>
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 p-12 text-center text-slate-500">
              <p className="text-lg">No saved drafts yet.</p>
              <p className="text-sm mt-2">Start filling out an application form and save it as a draft to see it here.</p>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div className="space-y-4">
              {appDrafts.map((draft, i) => (
                <motion.div
                  key={`app-${i}`}
                  className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 p-5"
                  whileHover={reduced ? undefined : { y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="text-md font-semibold text-slate-900">{getDraftLabel(draft)}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {getDraftName(draft)} &bull; {formatCreatedAt(String(draft.created_at ?? draft.createdAt ?? ""))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleContinueApp(draft)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Continue</button>
                      <button onClick={() => handleDeleteApp(i)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">Delete</button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {alumniDraft && (
                <motion.div
                  className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 p-5"
                  whileHover={reduced ? undefined : { y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="text-md font-semibold text-slate-900">
                        {getDraftLabel(alumniDraft)}
                        <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Alumni</span>
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {getDraftName(alumniDraft)} &bull; {formatCreatedAt(String(alumniDraft.created_at ?? alumniDraft.createdAt ?? ""))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleContinueAlumni()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Continue</button>
                      <button onClick={handleDeleteAlumni} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">Delete</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </main>
  );
}
