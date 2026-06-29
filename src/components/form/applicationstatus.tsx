"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api_links from "@/config/api_link.json";
import {
  FileText,
  File,
  Image,
  CheckCircle,
  Upload,
  ArrowLeft,
  Trash2,
  Loader,
  AlertCircle,
  Download,
  Lock,
  BarChart3,
  Clock,
} from "lucide-react";

const DOCUMENTS = [
  { key: "letterOfIntent", label: "Letter of Intent", required: true },
  { key: "resume", label: "Résumé / CV", required: true },
  { key: "picture", label: "Formal Picture", required: true },
  { key: "applicationForm", label: "Application Form", required: true },
  { key: "recommendationLetter", label: "Recommendation Letter", required: false },
  { key: "schoolCredentials", label: "School Credentials", required: true },
  { key: "highSchoolDiploma", label: "High School Diploma / PEPT", required: true },
  { key: "transcript", label: "Transcript", required: true },
  { key: "birthCertificate", label: "Birth Certificate", required: true },
  { key: "employmentCertificate", label: "Certificate of Employment", required: false },
  { key: "nbiClearance", label: "NBI Clearance", required: false },
  { key: "marriageCertificate", label: "Marriage Certificate", required: false },
  { key: "businessRegistration", label: "Business Registration", required: false },
  { key: "certificates", label: "Certificates", required: false },
];

interface Application {
  id: string;
  email: string;
  applicantName: string;
  program: string;
  form_status: "draft" | "Under Review" | "accepted" | "rejected";
  businessName?: string;
  isBusinessOwner?: string;
  created_at?: string;
  [key: string]: string | undefined;
}

interface Toast {
  message: string;
  type: "success" | "error" | "info";
}

interface MyApplicationResponse {
  success: boolean;
  data: Application | null;
  remarks?: Record<string, { remark: string }>;
  verified?: Record<string, boolean>;
  meta?: {
    requiredDocumentCount: number;
    requiredUploadedCount: number;
  };
  error?: string;
}

export default function ApplicationStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [app, setApp] = useState<Application | null>(null);
  const [remarks, setRemarks] = useState<Record<string, { remark: string }>>({});
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [fileInputs, setFileInputs] = useState<Record<string, File | null>>({});
  const [toast, setToast] = useState<Toast | null>(null);
  const [loading, setLoading] = useState(true);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  const isValidFile = (file: File) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return "File must be a PDF, JPG, or PNG.";
    }
    if (file.size > 10 * 1024 * 1024) {
      return "File must be 10MB or smaller.";
    }
    return null;
  };

  const fetchDetails = async (signal: AbortSignal) => {
    try {
      setLoading(true);
      const response = await fetch(
        "/services/supabase/form/my-application",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
          signal,
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.error || `HTTP error ${response.status}`;
        throw new Error(message);
      }

      const payload = (await response.json()) as MyApplicationResponse;
      if (!payload.success) {
        throw new Error(payload.error || "Failed to load application");
      }

      if (!payload.data) {
        showToast("No current application found.", "info");
        setApp(null);
        return;
      }

      setApp(payload.data);
      setRemarks(payload.remarks || {});
      setVerified(payload.verified || {});
    } catch (err) {
      if ((err as DOMException).name === "AbortError") {
        return;
      }
      console.error("Fetch error:", err);
      showToast((err as Error).message || "Failed to load application", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchDetails(controller.signal);

    const doc = searchParams.get("doc");
    if (doc) {
      setTimeout(() => {
        const el = document.getElementById(`doc-${doc}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }

    return () => controller.abort();
  }, [searchParams]);

  const handleFileChange = (key: string, file: File | null) => {
    if (!file) {
      setFileInputs((prev) => ({ ...prev, [key]: null }));
      return;
    }

    const validationError = isValidFile(file);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    setFileInputs((prev) => ({ ...prev, [key]: file }));
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDraggedOver(key);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDraggedOver(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const validationError = isValidFile(files[0]);
      if (validationError) {
        showToast(validationError, "error");
        return;
      }
      handleFileChange(key, files[0]);
    }
  };

  const handleResubmit = async (key: string) => {
    const file = fileInputs[key];
    if (!file) {
      showToast("Choose a file to upload", "error");
      return;
    }

    const validationError = isValidFile(file);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    if (!app?.id) {
      showToast("Application not available for upload.", "error");
      return;
    }

    setUploadingDoc(key);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("formId", app.id);
      formData.append("documentType", key);

      const response = await fetch("/services/supabase/form/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.error || "Upload failed";
        throw new Error(message);
      }

      showToast("Document uploaded successfully", "success");
      setFileInputs((p) => ({ ...p, [key]: null }));
      const controller = new AbortController();
      await fetchDetails(controller.signal);
    } catch (err) {
      showToast((err as Error).message || "Upload failed. Please try again.", "error");
      console.error(err);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this application? This action cannot be undone.")) {
      return;
    }

    if (!app?.id) {
      showToast("Application ID is not available.", "error");
      return;
    }

    try {
      const response = await fetch(api_links.form.delete, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(app.id), email: app.email }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      showToast("Application deleted successfully", "success");
      setTimeout(() => router.push("/form"), 2000);
    } catch (err) {
      showToast("Failed to delete application", "error");
      console.error(err);
    }
  };

  // Calculate statistics
  const requiredDocuments = DOCUMENTS.filter((document) => document.required);
  const requiredUploadedCount = requiredDocuments.filter((document) => app?.[document.key]).length;
  const uploadedCount = DOCUMENTS.filter((document) => app?.[document.key]).length;
  const missingCount = DOCUMENTS.filter((document) => !app?.[document.key]).length;
  const verifiedCount = Object.values(verified).filter(Boolean).length;
  const progressPercentage = requiredDocuments.length > 0
    ? Math.round((requiredUploadedCount / requiredDocuments.length) * 100)
    : 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center p-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </main>
    );
  }

  if (!app) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-600 mb-4">Application not found</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  const statusLower = String(app.form_status || "").toLowerCase();
  const readOnly = statusLower.includes("accept") || statusLower.includes("reject");

  const getStatusBadgeClass = () => {
    switch (statusLower) {
      case "under review":
        return "bg-blue-50 border border-blue-200 text-blue-700";
      case "accepted":
        return "bg-green-50 border border-green-200 text-green-700";
      case "rejected":
        return "bg-red-50 border border-red-200 text-red-700";
      default:
        return "bg-amber-50 border border-amber-200 text-amber-700";
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg text-white z-50 ${
            toast.type === "success"
              ? "bg-green-500"
              : toast.type === "error"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {app.program}
                </h1>
                <p className="text-lg text-gray-600 mb-4">{app.applicantName}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>
                    Submitted:{" "}
                    {app.created_at
                      ? new Date(app.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
              <div className="md:col-span-1">
                <div className="sticky top-8">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
                    <div
                      className={`inline-flex px-4 py-2 rounded-full font-semibold text-sm ${getStatusBadgeClass()}`}
                    >
                      {app.form_status || "Pending"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Progress Overview</h2>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium text-gray-700">Documents Uploaded</p>
                <p className="text-sm font-semibold text-blue-600">{progressPercentage}%</p>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {uploadedCount} of {DOCUMENTS.length} documents uploaded
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-medium text-blue-600 uppercase mb-2">Uploaded</p>
                <p className="text-3xl font-bold text-blue-900">{uploadedCount}</p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-xs font-medium text-red-600 uppercase mb-2">Missing</p>
                <p className="text-3xl font-bold text-red-900">{missingCount}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <p className="text-xs font-medium text-emerald-600 uppercase mb-2">Verified</p>
                <p className="text-3xl font-bold text-emerald-900">{verifiedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Read-only Mode Banner */}
        {readOnly && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 mb-1">Application Read-Only</p>
              <p className="text-sm text-amber-800">
                This application is now read-only. Document uploads have been disabled.
              </p>
            </div>
          </div>
        )}

        {/* Documents Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Documents & Status</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {DOCUMENTS.map((d) => {
              const val = app[d.key];
              const remark = remarks[d.key]?.remark || null;
              const isVerified = verified[`${d.key}_verified`];

              const getDocIcon = () => {
                if (d.key.includes("picture")) return <Image className="w-5 h-5" />;
                if (
                  d.key.includes("pdf") ||
                  d.key.includes("transcript") ||
                  d.key.includes("form")
                )
                  return <File className="w-5 h-5" />;
                return <FileText className="w-5 h-5" />;
              };

              return (
                <div
                  id={`doc-${d.key}`}
                  key={d.key}
                  className={`rounded-xl border transition-all duration-300 ${
                    isVerified
                      ? "bg-emerald-50 border-emerald-200"
                      : val
                      ? "bg-white border-gray-200 hover:shadow-md"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="p-6">
                    {/* Document Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isVerified
                              ? "bg-emerald-100 text-emerald-600"
                              : val
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {getDocIcon()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{d.label}</h3>
                          <p className="text-xs text-gray-500">
                            {d.required ? "Required" : "Optional"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : val ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          Uploaded
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Missing
                        </span>
                      )}
                      {remark && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          Needs Revision
                        </span>
                      )}
                    </div>

                    {/* File Actions */}
                    {val ? (
                      <div className="flex gap-2 mb-4">
                        <a
                          href={val}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition flex items-center justify-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          View File
                        </a>
                        <a
                          href={val}
                          download
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-gray-100 rounded-lg text-center text-sm text-gray-600">
                        Not uploaded yet
                      </div>
                    )}

                    {/* Remarks */}
                    {remark && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">{remark}</p>
                      </div>
                    )}

                    {/* Upload Section */}
                    {!readOnly && !isVerified ? (
                      <div
                        onDragOver={(e) => handleDragOver(e, d.key)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, d.key)}
                        className={`border-2 border-dashed rounded-lg p-4 transition ${
                          draggedOver === d.key
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        <label className="block cursor-pointer">
                          <input
                            id={`file-input-${d.key}`}
                            className="hidden"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              handleFileChange(d.key, e.target.files?.[0] || null)
                            }
                          />
                          <div className="text-center py-2">
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-700">
                              {fileInputs[d.key]?.name || "Drop file or click to select"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PDF, JPG, JPEG, PNG (Max 10MB)
                            </p>
                          </div>
                        </label>
                      </div>
                    ) : isVerified ? (
                      <div className="flex items-center gap-2 p-3 bg-emerald-100 rounded-lg text-sm font-medium text-emerald-700">
                        <Lock className="w-4 h-4" />
                        Document verified. Editing disabled.
                      </div>
                    ) : null}

                    {/* Upload Button */}
                    {!readOnly && !isVerified && (
                      <button
                        disabled={!fileInputs[d.key] || uploadingDoc === d.key}
                        onClick={() => handleResubmit(d.key)}
                        className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
                      >
                        {uploadingDoc === d.key ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            {val ? "Resubmit" : "Upload"}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Applications
          </button>

          <div>
            {(statusLower.includes("reject") || statusLower.includes("draft")) && (
              <button
                onClick={handleDelete}
                className="px-6 py-3 rounded-lg border-2 border-red-600 text-red-600 font-medium hover:bg-red-50 transition flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete Application
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

