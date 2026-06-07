"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Fetch_toFile from "@/utilities/Fetch_toFile";
import api_link from "@/config/api_link.json";

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

function getStatusBadgeClass(status?: string) {
  const normalizedStatus = status?.toLowerCase().trim();

  switch (normalizedStatus) {
    case "draft":
      return "bg-gray-100 text-gray-700";
    case "under review":
      return "bg-blue-100 text-blue-800";
    case "success":
      return "bg-green-100 text-green-800";
    case "reject":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Submission failed.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-20 mt-10">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">
        {selectedApplication ? "Application Review" : "Review Your Application"}
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-blue-700">
            Personal Info
          </h2>

          <p>
            <strong>Name:</strong> {selectedApplication?.applicantName || fullname || draft?.applicantName || "-"}
          </p>
          <p>
            <strong>Email:</strong> {selectedApplication?.email || email || draft?.email || "-"}
          </p>
          <p>
            <strong>Phone #:</strong> {phone}
          </p>
          <p>
            <strong>Marital Status:</strong> {status}
          </p>
          <p>
            <strong>Business Owner:</strong> {selectedApplication?.isBusinessOwner || draft?.isBusinessOwner || "No"}
          </p>
          <p>
            <strong>Business Name:</strong> {selectedApplication?.businessName || draft?.businessName || "-"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(
                selectedApplication?.form_status || draft?.form_status,
              )}`}
            >
              {selectedApplication?.form_status || "-"}
            </span>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-blue-700">Documents</h2>

          <table className="w-full text-sm mt-2">
            <tbody>
              {Object.entries(fileLabels).map(([key, label]) => {
                const files = draft?.files?.[key] ?? [];
                const submittedValue = selectedApplication?.[key as keyof SelectedApplication];

                return (
                  <tr key={key}>
                    <td className="py-2">
                      <strong>{label}:</strong>
                      {files.length > 0 ? (
                        <ul className="list-disc list-inside mt-1">
                          {files.map((file) => (
                            <li key={`${key}-${file.name}`}>
                              <a
                                href={file.dataUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 underline"
                              >
                                {file.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : submittedValue ? (
                        <a
                          href={String(submittedValue)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-700 underline"
                        >
                          {shortenLinkLabel(String(submittedValue))}
                        </a>
                      ) : (
                        <span className="ml-2 text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {submitting ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>{progressLabel || "Working..."}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-blue-700 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}

        {submitError ? (
          <p className="mt-4 text-sm text-red-600">{submitError}</p>
        ) : null}
        {submitSuccess ? (
          <p className="mt-4 text-sm text-green-600">{submitSuccess}</p>
        ) : null}

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              void handleSubmit("draft");
            }}
            style={{ display: submitting || isUnderReview ? "none" : "block" }}
            className="px-6 py-2 rounded-md bg-blue-700 text-white cursor-pointer"
            disabled={submitting || isUnderReview}
          >
            Draft
          </button>

          <button
            type="button"
            onClick={() => {
              void handleSubmit("Under Review");
            }}
            style={{ display: isUnderReview || submitting ? "none" : "block" }}
            disabled={submitting}
            className="px-6 py-2 rounded-md bg-blue-800 text-white disabled:opacity-60 cursor-pointer"
          >
            {isDraft ? "Apply Again" : "Submit"}
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Files are stored temporarily in your browser until the final submit
          step.
        </p>
        <div className="mt-4">
          <p onClick={() => {router.back(); window.localStorage.clear();}} className="text-blue-700 underline text-sm cursor-pointer">
            Back
          </p>
        </div>
      </div>
    </main>
  );
}
