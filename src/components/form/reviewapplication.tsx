"use client";

import Link from "next/link";
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
  const [draft, setDraft] = useState<DraftApplication | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    setDraft(getDraft());
  }, []);

  const handleSubmitDraft = async () => {
    const currentDraft = draft ?? getDraft();
    if (!currentDraft) {
      setSubmitError("No draft found in local storage.");
      return;
    }

    const submitEmail = currentDraft.email || email;
    if (!submitEmail) {
      setSubmitError("Email is required before submission.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const fileEntries = Object.entries(currentDraft.files);

      for (const [documentType, files] of fileEntries) {
        for (const file of files) {
          const uploadFile = dataUrlToFile(file.dataUrl, file.name, file.type);

          const response = await Fetch_toFile(
            api_link.form.drafts,
            uploadFile,
            {
              email: submitEmail,
              applicantName: currentDraft.applicantName || fullname || "",
              documentType,
              businessName: currentDraft.businessName || "",
              isBusinessOwner: currentDraft.isBusinessOwner || "No",
            },
          );

          if (!response.success) {
            throw new Error(response.message || `Failed to upload ${file.name}`);
          }
        }
      }

      window.localStorage.clear();
      setSubmitSuccess("Application submitted successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Submission failed.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const currentDraft = draft ?? getDraft();
    if (!currentDraft) {
      setSubmitError("No draft found in local storage.");
      return;
    }

    const submitEmail = currentDraft.email || email;
    if (!submitEmail) {
      setSubmitError("Email is required before submission.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const fileEntries = Object.entries(currentDraft.files);

      for (const [documentType, files] of fileEntries) {
        for (const file of files) {
          const uploadFile = dataUrlToFile(file.dataUrl, file.name, file.type);

          const response = await Fetch_toFile(
            api_link.form.submit,
            uploadFile,
            {
              email: submitEmail,
              applicantName: currentDraft.applicantName || fullname || "",
              documentType,
              businessName: currentDraft.businessName || "",
              isBusinessOwner: currentDraft.isBusinessOwner || "No",
            },
          );

          if (!response.success) {
            throw new Error(response.message || `Failed to upload ${file.name}`);
          }
        }
      }

      window.localStorage.clear();
      setSubmitSuccess("Application submitted successfully.");
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
        Review Your Application
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-blue-700">
            Personal Info
          </h2>

          <p>
            <strong>Name:</strong> {fullname || draft?.applicantName || "-"}
          </p>
          <p>
            <strong>Email:</strong> {email || draft?.email || "-"}
          </p>
          <p>
            <strong>Phone #:</strong> {phone}
          </p>
          <p>
            <strong>Marital Status:</strong> {status}
          </p>
          <p>
            <strong>Business Owner:</strong> {draft?.isBusinessOwner ?? "No"}
          </p>
          <p>
            <strong>Business Name:</strong> {draft?.businessName || "-"}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-blue-700">Documents</h2>

          <table className="w-full text-sm mt-2">
            <tbody>
              {Object.entries(fileLabels).map(([key, label]) => {
                const files = draft?.files?.[key] ?? [];

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

        {submitError ? (
          <p className="mt-4 text-sm text-red-600">{submitError}</p>
        ) : null}
        {submitSuccess ? (
          <p className="mt-4 text-sm text-green-600">{submitSuccess}</p>
        ) : null}

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleSubmitDraft}
            className="px-6 py-2 rounded-md bg-blue-700 text-white"
            disabled={submitting}
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 rounded-md bg-blue-800 text-white disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Files are stored temporarily in your browser until the final submit
          step.
        </p>
        <div className="mt-4">
          <Link href="/form" className="text-blue-700 underline text-sm">
            Back to form
          </Link>
        </div>
      </div>
    </main>
  );
}
