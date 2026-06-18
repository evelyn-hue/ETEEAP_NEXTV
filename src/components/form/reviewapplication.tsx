"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Fetch_toFile from "@/utilities/Fetch_toFile";
import api_link from "@/config/api_link.json";
import { CheckCircle, FileText, AlertCircle, Loader2 } from "lucide-react";

const DRAFT_KEY = "eteeap-application-draft";

type StoredFile = {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

type DraftApplication = {
  applicantName: string;
  email?: string;
  isBusinessOwner: string;
  businessName: string;
  files: Record<string, StoredFile[]>;
  form_status?: string;
  programName?: string;
};

type SelectedApplication = {
  id?: number;
  created_at?: string;
  isBusinessOwner?: string;
  letterOfIntent?: string | null;
  resume?: string | null;
  picture?: string | null;
  applicationForm?: string | null;
  recommendationLetter?: string | null;
  schoolCredentials?: string | null;
  highSchoolDiploma?: string | null;
  transcript?: string | null;
  birthCertificate?: string | null;
  marriageCertificate?: string | null;
  employmentCertificate?: string | null;
  nbiClearance?: string | null;
  businessRegistration?: string | null;
  certificates?: string | null;
  email?: string;
  applicantName?: string;
  businessName?: string | null;
  program?: string | null;
  form_status?: string;
};

type JWTProps = {
  fullname: string;
  email: string;
  phone: string;
  status: string;
};

const fileLabels: Record<string, string> = {
  letterOfIntent: "Letter of Intent",
  resume: "Resume / CV",
  picture: "Formal Picture",
  applicationForm: "ETEEAP Application Form",
  recommendationLetter: "Recommendation Letter",
  schoolCredentials: "School Credentials",
  highSchoolDiploma: "High School Diploma / PEPT",
  transcript: "Transcript",
  birthCertificate: "Birth Certificate",
  marriageCertificate: "Marriage Certificate",
  employmentCertificate: "Certificate of Employment",
  nbiClearance: "NBI Clearance",
  businessRegistration: "Business Registration",
  certificates: "Certificates",
};

function shortenLinkLabel(value: string) {
  if (!value) return "-";
  if (value.length <= 20) return value;
  return `${value.slice(0, 50)}..`;
}

function getDraft() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DraftApplication;
  } catch {
    return null;
  }
}

function dataUrlToFile(dataUrl: string, name: string, type: string) {
  const [header, base64] = dataUrl.split(",");
  const mime = type || header.match(/data:(.*?);base64/)?.[1] || "application/octet-stream";
  const binary = atob(base64 ?? "");
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new File([bytes], name, { type: mime });
}

export default function ReviewApplication({ fullname, email, phone, status }: JWTProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftApplication | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<SelectedApplication | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const currentStatus = (selectedApplication?.form_status || draft?.form_status || "").toLowerCase().trim();
  const isUnderReview = currentStatus === "under review";
  const isDraft = currentStatus === "draft";
  const isReject = currentStatus === "reject";

  useEffect(() => {
    setDraft(getDraft());
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem("selected-application");
    if (!raw) return;

    try {
      setSelectedApplication(JSON.parse(raw) as SelectedApplication);
    } catch {
      setSelectedApplication(null);
    }
  }, []);

  const handleSubmit = async (nextStatus: string) => {
    if (isDraft || isReject) return router.push("/courses");
    const currentDraft = draft ?? getDraft();
    if (!currentDraft) {
      setSubmitError("No Data found in local storage.");
      return;
    }

    const submitEmail = currentDraft.email || email;
    if (!submitEmail) {
      setSubmitError("Email is required before submission.");
      return;
    }

    setSubmitting(true);
    setProgress(0);
    setProgressLabel("Preparing files...");
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const uploads: Array<{ file: File; documentType: string }> = [];
      for (const [documentType, files] of Object.entries(currentDraft.files)) {
        for (const file of files) {
          uploads.push({
            file: dataUrlToFile(file.dataUrl, file.name, file.type),
            documentType,
          });
        }
      }

      setProgressLabel(`Submitting ${uploads.length} file${uploads.length === 1 ? "" : "s"}...`);

      const response = await Fetch_toFile(
        api_link.form.submit,
        {
          files: uploads.map(({ file }) => file),
          documentTypes: uploads.map(({ documentType }) => documentType),
          fields: {
            email: submitEmail,
            applicantName: currentDraft.applicantName || fullname || "",
            businessName: currentDraft.businessName || "",
            isBusinessOwner: currentDraft.isBusinessOwner || "No",
            programName: currentDraft.programName || "",
            form_status: nextStatus,
          },
        },
        {
          onProgress: (value, message) => {
            setProgress(value);
            setProgressLabel(message);
          },
        },
      );

      if (!response.success) {
        throw new Error(response.message || "Submission failed.");
      }

      setProgress(100);
      setProgressLabel("Finalizing...");
      window.localStorage.clear();
      setSubmitSuccess(response.message);
      
      // Navigate to my applications page after successful submission
      setTimeout(() => {
        router.push("/form");
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Submission failed.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const applicantName = selectedApplication?.applicantName || fullname || draft?.applicantName || "-";
  const applicantEmail = selectedApplication?.email || email || draft?.email || "-";
  const programName = selectedApplication?.program || draft?.programName || "ETEEAP Program";

  return (
    <main className="min-h-screen bg-slate-50 mt-16">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-16">
        {/* Application Summary Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">
                  Application Review
                </h1>
                <p className="text-slate-600 text-lg">{programName}</p>
              </div>
              <div className="flex items-center justify-start md:justify-end">
                <div className="flex items-center gap-3 bg-green-50 px-6 py-3 rounded-full border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-green-700 font-semibold">Ready for Submission</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Personal Information</h2>
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-b md:border-b-0 pb-6 md:pb-0">
                <p className="text-slate-500 text-sm font-medium mb-2">Full Name</p>
                <p className="text-slate-900 font-semibold">{applicantName}</p>
              </div>
              <div className="border-b md:border-b-0 pb-6 md:pb-0">
                <p className="text-slate-500 text-sm font-medium mb-2">Email Address</p>
                <p className="text-slate-900 font-semibold">{applicantEmail}</p>
              </div>
              <div className="border-b md:border-b-0 pb-6 md:pb-0">
                <p className="text-slate-500 text-sm font-medium mb-2">Phone Number</p>
                <p className="text-slate-900 font-semibold">{phone || "-"}</p>
              </div>
              <div className="border-b md:border-b-0 pb-6 md:pb-0">
                <p className="text-slate-500 text-sm font-medium mb-2">Marital Status</p>
                <p className="text-slate-900 font-semibold">{status || "-"}</p>
              </div>
              <div className="border-b md:border-b-0 pb-6 md:pb-0">
                <p className="text-slate-500 text-sm font-medium mb-2">Business Owner</p>
                <p className="text-slate-900 font-semibold">{selectedApplication?.isBusinessOwner || draft?.isBusinessOwner || "No"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium mb-2">Business Name</p>
                <p className="text-slate-900 font-semibold">{selectedApplication?.businessName || draft?.businessName || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Documents Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Uploaded Documents</h2>
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="grid gap-6 md:gap-8">
              {Object.entries(fileLabels).map(([key, label]) => {
                const files = draft?.files?.[key] ?? [];
                const submittedValue = selectedApplication?.[key as keyof SelectedApplication];

                if (files.length === 0 && !submittedValue) {
                  return null;
                }

                return (
                  <div key={key} className="border-b last:border-b-0 pb-6 last:pb-0">
                    <p className="text-slate-500 text-sm font-medium mb-4">{label}</p>
                    <div className="flex flex-wrap gap-3">
                      {files.length > 0 ? (
                        files.map((file) => (
                          <a
                            key={`${key}-${file.name}`}
                            href={file.dataUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-4 py-2 text-sm font-medium hover:bg-blue-100 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            <span className="truncate max-w-xs">{file.name}</span>
                          </a>
                        ))
                      ) : submittedValue ? (
                        <a
                          href={String(submittedValue)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-4 py-2 text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="truncate max-w-xs">{shortenLinkLabel(String(submittedValue))}</span>
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Review Notice Section */}
        <div className="mb-8">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8 flex gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
            <div>
              <p className="text-amber-900 font-semibold mb-2">Review Your Application</p>
              <p className="text-amber-800 text-sm">
                Please review all information and uploaded documents carefully before submitting. Once submitted, your application will proceed to verification and evaluation.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {submitting ? (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="w-5 h-5 text-blue-700 animate-spin" />
              <span className="text-blue-700 font-semibold">{progressLabel || "Processing..."}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-blue-700 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-500 text-xs mt-3">{progress}% Complete</p>
          </div>
        ) : null}

        {/* Error Message */}
        {submitError ? (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6 md:p-8 flex gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
            <div>
              <p className="text-red-900 font-semibold mb-2">Submission Error</p>
              <p className="text-red-800 text-sm">{submitError}</p>
            </div>
          </div>
        ) : null}

        {/* Success Message */}
        {submitSuccess ? (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6 md:p-8 flex gap-4">
            <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-1" />
            <div>
              <p className="text-green-900 font-semibold mb-2">Application Submitted</p>
              <p className="text-green-800 text-sm">{submitSuccess}</p>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="sticky bottom-0 md:sticky md:bottom-auto bg-white md:bg-transparent rounded-t-2xl md:rounded-none shadow-2xl md:shadow-none p-6 md:p-0 flex flex-col-reverse md:flex-row md:justify-end gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => {
              router.back();
              window.localStorage.clear();
            }}
            disabled={submitting}
            className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          <button
            type="button"
            onClick={() => {
              void handleSubmit("Under Review");
            }}
            disabled={submitting}
            style={{ display: isUnderReview || submitting ? "none" : "block" }}
            className="px-6 py-3 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>{submitting ? "Submitting Application..." : "Submit"}</span>
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 md:mt-12 text-center">
          <p className="text-slate-500 text-xs md:text-sm">
            Files are stored temporarily in your browser until final submission
          </p>
        </div>
      </div>
    </main>
  );
}
