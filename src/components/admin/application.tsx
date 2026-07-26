"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  ExternalLink,
  Loader2,
  RotateCcw,
  Search,
  Trash2,
  XCircle,
  X,
} from "lucide-react";
import apiLinks from "@/config/api_link.json";
import { Fetch_to } from "@/utilities";

type DocumentStatus = "Pending" | "Verified" | "Rejected";
type FormStatus = "Under Review" | "Approve" | "Reject" | "Draft" | "Delete";

type DocumentDefinition = {
  id: string;
  label: string;
  required?: boolean;
  note?: string;
};

type DocumentItem = {
  id: string;
  label: string;
  required?: boolean;
  note?: string;
  fileUrl?: string;
  status: DocumentStatus;
  remark: string;
};

type ApplicationRecord = {
  id: number;
  applicant: string;
  email: string;
  civilStatus: string;
  program: string;
  date: string;
  status: FormStatus;
  businessOwner: "Yes" | "No";
  businessName: string;
  documents: DocumentItem[];
};

type PendingAction = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  execute: () => void;
};

type ApprovalEntry = {
  documentId?: string;
  status?: DocumentStatus;
  remark?: string;
};

type FormRow = {
  id: number;
  created_at?: string;
  email?: string;
  applicantName?: string;
  civil_status?: string;
  program?: string;
  form_status?: string;
  isBusinessOwner?: string;
  businessName?: string;
  forms_approvals?: unknown;
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
};

type Toast = {
  message: string;
  type: "success" | "error" | "info";
};

const baseDocuments: DocumentDefinition[] = [
  { id: "letterOfIntent", label: "A. Letter of Intent", required: true },
  { id: "resume", label: "B. Resume / CV", required: true },
  { id: "picture", label: "C. Formal Picture", required: true },
  { id: "applicationForm", label: "D. ETEEAP Application Form", required: true, note: "Screenshot of completed Google Form" },
  { id: "recommendationLetter", label: "E. Recommendation Letter", required: true },
  { id: "schoolCredentials", label: "F. School Credentials", required: true },
  { id: "highSchoolDiploma", label: "G. High School Diploma / PEPT", required: true },
  { id: "transcript", label: "H. Transcript", required: true },
  { id: "birthCertificate", label: "I. Birth Certificate", required: true },
  { id: "marriageCertificate", label: "J. Marriage Certificate" },
  { id: "employmentCertificate", label: "K. Certificate of Employment (4 max)", required: true, note: "Up to 4 files" },
  { id: "nbiClearance", label: "L. NBI Clearance", required: true },
  { id: "businessRegistration", label: "M. Business Registration" },
  { id: "certificates", label: "N. Certificates (10 max)", note: "Up to 10 files" },
];

function normalizeFormStatus(status?: string): FormStatus {
  const normalized = String(status ?? "").toLowerCase().trim();
  if (normalized === "approve" || normalized === "approved") return "Approve";
  if (normalized === "reject" || normalized === "rejected") return "Reject";
  if (normalized === "under review") return "Under Review";
  if (normalized === "delete") return "Delete";
  return "Draft";
}

function parseApprovals(value: unknown): ApprovalEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is ApprovalEntry => Boolean(entry && typeof entry === "object"));
}

function mapRowToApplication(row: FormRow): ApplicationRecord {
  const approvals = parseApprovals(row.forms_approvals);
  const approvalMap = new Map<string, ApprovalEntry>();
  approvals.forEach((entry) => {
    const key = String(entry.documentId ?? "").trim();
    if (!key) return;
    approvalMap.set(key, entry);
  });

  const documents = baseDocuments.map((doc) => {
    const approval = approvalMap.get(doc.id);
    const rawStatus = approval?.status;
    const status: DocumentStatus =
      rawStatus === "Verified" || rawStatus === "Rejected" || rawStatus === "Pending"
        ? rawStatus
        : "Pending";

    return {
      id: doc.id,
      label: doc.label,
      required: doc.required,
      note: doc.note,
      fileUrl: String(row[doc.id as keyof FormRow] ?? "") || undefined,
      status,
      remark: String(approval?.remark ?? ""),
    };
  });

  return {
    id: row.id,
    applicant: String(row.applicantName ?? "Unknown Applicant"),
    email: String(row.email ?? "-"),
    civilStatus: String(row.civil_status ?? "-"),
    program: String(row.program ?? "-") || "-",
    date: String(row.created_at ?? "-").slice(0, 10) || "-",
    status: normalizeFormStatus(row.form_status),
    businessOwner: String(row.isBusinessOwner ?? "No") === "Yes" ? "Yes" : "No",
    businessName: String(row.businessName ?? ""),
    documents,
  };
}

function StatusPill({ status }: { status: DocumentStatus | FormStatus }) {
  const styles =
    status === "Verified" || status === "Approve"
      ? "bg-green-100 text-green-800"
      : status === "Rejected" || status === "Reject"
        ? "bg-red-100 text-red-800"
        : status === "Delete"
          ? "bg-slate-200 text-slate-700"
        : status === "Under Review"
          ? "bg-blue-100 text-blue-800"
          : "bg-yellow-100 text-yellow-800";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
}

function ApplicationActions({
  onView,
  onAccept,
  onReject,
  onDelete,
  onRestore,
  currentStatus,
  isDeleted,
}: {
  onView: () => void;
  onAccept: () => void;
  onReject: () => void;
  onDelete: () => void;
  onRestore: () => void;
  currentStatus: FormStatus;
  isDeleted: boolean;
}) {
  const isUnderReview = currentStatus === "Under Review";
  const isRejected = currentStatus === "Reject";
  const canDelete = isUnderReview || isRejected;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <button
        type="button"
        onClick={onView}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
      >
        <Eye size={16} />
        View
      </button>
      {isDeleted ? (
        <button
          type="button"
          onClick={onRestore}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 sm:w-auto"
        >
          <RotateCcw size={16} />
          Restore
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={onAccept}
            disabled={!isUnderReview}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Check size={16} />
            Accept
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={!isUnderReview}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <XCircle size={16} />
            Reject
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={!canDelete}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </>
      )}
    </div>
  );
}

function DocumentCard({
  document,
  onStatusChange,
  onRemarkChange,
  onRemarkSave,
  isSaving,
  disabled,
}: {
  document: DocumentItem;
  onStatusChange: (status: DocumentStatus, remark: string) => void;
  onRemarkChange: (remark: string) => void;
  onRemarkSave: (remark: string) => void;
  isSaving?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{document.label}</p>
          {document.note ? (
            <p className="mt-1 text-xs text-slate-500">{document.note}</p>
          ) : null}
          {document.required ? (
            <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-400">
              Required
            </p>
          ) : (
            <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-400">
              Optional
            </p>
          )}
        </div>
        <StatusPill status={document.status} />
      </div>

      <div className="mt-3">
        {document.fileUrl ? (
          <a
            href={document.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 underline"
          >
            <ExternalLink size={14} />
            View uploaded file
          </a>
        ) : (
          <p className="text-xs text-slate-500">No uploaded file for this document yet.</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onStatusChange("Verified", document.remark)}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check size={16} />
          Verify
        </button>
        <button
          type="button"
          onClick={() => onStatusChange("Rejected", document.remark)}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <XCircle size={16} />
          Reject
        </button>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Remark
        </span>
        <textarea
          value={document.remark}
          onChange={(e) => onRemarkChange(e.target.value)}
          rows={3}
          placeholder={disabled ? "Document review is locked." : "Add a remark for this document..."}
          disabled={disabled}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
        <button
          type="button"
          onClick={() => onRemarkSave(document.remark)}
          disabled={disabled || isSaving}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            "Send"
          )}
        </button>
      </label>
    </div>
  );
}

export default function Application() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [query, setQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("All Programs");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationRecord | null>(null);
  const [savingRemark, setSavingRemark] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const syncApplication = (updated: ApplicationRecord) => {
    setApplications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedApplication((prev) => (prev && prev.id === updated.id ? updated : prev));
  };

  const openConfirmation = (action: PendingAction) => {
    setPendingAction(action);
  };

  const closeConfirmation = () => {
    setPendingAction(null);
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  const fetchApplications = async (userEmail: string) => {
    setLoading(true);
    setError("");

    const response = await Fetch_to(apiLinks.retrieve_data, {
      email: userEmail,
      page: 1,
      limit: 200,
    });

    if (!response.success) {
      setError(response.message || "Failed to retrieve applications.");
      setLoading(false);
      return;
    }

    const payload = Array.isArray(response.data?.message) ? response.data.message : [];
    const mapped = payload.map((row: FormRow) => mapRowToApplication(row));

    setApplications(mapped);
    setLoading(false);
  };

  useEffect(() => {
    const verifyAndLoad = async () => {
      const response = await Fetch_to(apiLinks.jwt.verify);
      const resolvedEmail = String(
        response.data?.message?.final_data?.data?.[0]?.email ?? "admin@admin.com",
      );

      setAdminEmail(resolvedEmail);
      await fetchApplications(resolvedEmail);
    };

    void verifyAndLoad();
  }, []);

  const filteredApplications = useMemo(() => {
    const q = query.toLowerCase();
    return applications.filter((item) => {
      const haystack = `${item.applicant} ${item.email} ${item.program} ${item.date} ${item.status}`.toLowerCase();
      const matchesQuery = haystack.includes(q);
      const matchesProgram =
        programFilter === "All Programs" || item.program === programFilter;
      const matchesStatus =
        statusFilter === "All Status" || item.status === statusFilter;
      const matchesDate = !dateFilter || item.date === dateFilter;
      return matchesQuery && matchesProgram && matchesStatus && matchesDate;
    });
  }, [applications, query, programFilter, statusFilter, dateFilter]);

  const programOptions = useMemo(() => {
    const basePrograms = [
      "All Programs",
      "Bachelor of Science in Hospitality Management",
      "Bachelor of Science in Business Administration - Human Resource Management",
    ];

    const applicationPrograms = applications
      .map((item) => item.program)
      .filter((program) => !basePrograms.includes(program));

    return [...basePrograms, ...new Set(applicationPrograms)];
  }, [applications]);

  const downloadPdf = () => {
    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) return;

    const rows = filteredApplications
      .map(
        (item) => `
          <tr>
            <td>${item.applicant}</td>
            <td>${item.email}</td>
            <td>${item.program}</td>
            <td>${item.date}</td>
            <td>${item.status}</td>
            <td>${item.documents.length}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Applications Export</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin: 0 0 8px; font-size: 24px; }
            p { margin: 0 0 20px; color: #475569; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 12px; }
            th { background: #eff6ff; }
          </style>
        </head>
        <body>
          <h1>Applications Export</h1>
          <p>Filtered application list ready for PDF download.</p>
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Email</th>
                <th>Program</th>
                <th>Date</th>
                <th>Status</th>
                <th>Documents</th>
              </tr>
            </thead>
            <tbody>
              ${rows || "<tr><td colspan='6'>No applications found</td></tr>"}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const updateApplicationStatus = (
    id: number,
    status: FormStatus
  ) => {
    const patchStatus = async () => {
      const response = await fetch(apiLinks.retrieve_data, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          form_status: status,
          reviewedBy: adminEmail,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean; message?: FormRow; error?: string }
        | null;

      if (!response.ok || !payload?.success || !payload.message) {
        showToast(payload?.error || "Failed to update form status.", "error");
        return;
      }

      syncApplication(mapRowToApplication(payload.message));
    };

    void patchStatus();
  };

  const updateDocumentStatus = (
    applicationId: number,
    documentId: string,
    status: DocumentStatus,
    remark: string
  ) => {
    const patchDocument = async () => {
      const response = await fetch(apiLinks.retrieve_data, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: applicationId,
          documentId,
          documentStatus: status,
          remark,
          reviewedBy: adminEmail,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean; message?: FormRow; error?: string }
        | null;

      if (!response.ok || !payload?.success || !payload.message) {
        showToast(payload?.error || "Failed to update document status.", "error");
        return;
      }

      syncApplication(mapRowToApplication(payload.message));
    };

    void patchDocument();
  };

  const updateDocumentRemark = (
    applicationId: number,
    documentId: string,
    remark: string
  ) => {
    setApplications((prev) =>
      prev.map((item) =>
        item.id === applicationId
          ? {
              ...item,
              documents: item.documents.map((doc) =>
                doc.id === documentId ? { ...doc, remark } : doc
              ),
            }
          : item
      )
    );

    setSelectedApplication((prev) =>
      prev && prev.id === applicationId
        ? {
            ...prev,
            documents: prev.documents.map((doc) =>
              doc.id === documentId ? { ...doc, remark } : doc
            ),
          }
        : prev
    );
  };

  const saveDocumentRemark = (
    applicationId: number,
    documentId: string,
    remark: string
  ) => {
    const patchRemark = async () => {
      const remarkKey = `${applicationId}-${documentId}`;
      setSavingRemark(remarkKey);

      try {
        const response = await fetch(apiLinks.retrieve_data, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: applicationId,
            documentId,
            remark,
            reviewedBy: adminEmail,
          }),
        });

        const payload = (await response.json().catch(() => null)) as
          | { success?: boolean; message?: FormRow; error?: string }
          | null;

        if (!response.ok || !payload?.success || !payload.message) {
          const errorMsg = payload?.error || "Failed to save remark.";
          console.error("Remark save error:", errorMsg);
          showToast(errorMsg, "error");
          setSavingRemark(null);
          return;
        }

        syncApplication(mapRowToApplication(payload.message));
        showToast("Remark saved successfully!", "success");
        setSavingRemark(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        console.error("Remark save exception:", errorMsg);
        showToast(`Error saving remark: ${errorMsg}`, "error");
        setSavingRemark(null);
      }
    };

    void patchRemark();
  };

  const deleteApplication = (id: number) => {
    updateApplicationStatus(id, "Delete");
  };

  const requestApplicationStatusChange = (
    item: ApplicationRecord,
    status: FormStatus,
  ) => {
    const actionLabel = status === "Approve" ? "Yes" : status === "Reject" ? "Yes" : status === "Under Review" ? "Restore" : "Update";
    const actionVerb = status === "Approve" ? "accept" : status === "Reject" ? "reject" : status === "Under Review" ? "restore" : "update";

    openConfirmation({
      title: `${actionLabel} Application`,
      message: `Are you sure you want to bulk ${actionVerb} the application of ${item.applicant}?`,
      confirmLabel: actionLabel,
      cancelLabel: "Cancel",
      execute: () => updateApplicationStatus(item.id, status),
    });
  };

  const requestApplicationDelete = (item: ApplicationRecord) => {
    openConfirmation({
      title: "Delete Application",
      message: `Are you sure you want to delete the application for ${item.applicant}?`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      execute: () => deleteApplication(item.id),
    });
  };

  const requestDocumentStatusChange = (
    applicationId: number,
    applicantName: string,
    document: DocumentItem,
    status: DocumentStatus,
  ) => {
    // Directly update document status without confirmation
    updateDocumentStatus(applicationId, document.id, status, document.remark);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                Applications
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Review submitted applications
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Open a record to verify, reject, and remark each uploaded document.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 lg:flex-row lg:flex-wrap lg:items-center">
              <Search className="text-slate-500" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search applicant..."
                className="w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 lg:w-64"
              />
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none sm:w-auto"
              >
                {programOptions.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none sm:w-auto"
              >
                <option value="All Status">All Status</option>
                <option value="Under Review">Under Review</option>
                <option value="Approve">Approve</option>
                <option value="Reject">Reject</option>
                <option value="Delete">Delete</option>
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none sm:w-auto"
              />
              <button
                type="button"
                onClick={downloadPdf}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 sm:w-auto"
              >
                Download PDF
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4 md:hidden">
          {loading ? (
            <div className="flex items-center justify-center rounded-3xl bg-white p-8 text-slate-600 shadow-sm ring-1 ring-slate-200">
              <Loader2 className="mr-2 animate-spin" size={18} />
              Loading applications...
            </div>
          ) : null}
          {!loading && error ? (
            <div className="rounded-3xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          ) : null}
          {!loading && !error && filteredApplications.length === 0 ? (
            <div className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
              No applications found.
            </div>
          ) : null}
          {filteredApplications.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {item.applicant}
                  </p>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    {item.email}
                  </p>
                </div>
                <StatusPill status={item.status} />
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Program
                  </p>
                  <p className="mt-1">{item.program}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Date
                    </p>
                    <p className="mt-1">{item.date}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Documents
                    </p>
                    <p className="mt-1">{item.documents.length}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <ApplicationActions
                  onView={() => setSelectedApplication(item)}
                  onAccept={() => requestApplicationStatusChange(item, "Approve")}
                  onReject={() => requestApplicationStatusChange(item, "Reject")}
                  onDelete={() => requestApplicationDelete(item)}
                  onRestore={() => requestApplicationStatusChange(item, "Under Review")}
                  currentStatus={item.status}
                  isDeleted={item.status === "Delete"}
                />
              </div>
            </article>
          ))}
        </section>

        <section className="hidden overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-slate-600">
              <Loader2 className="mr-2 animate-spin" size={18} />
              Loading applications...
            </div>
          ) : null}
          {!loading && error ? (
            <div className="p-4 text-sm font-medium text-red-700">{error}</div>
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full min-w-245 text-left">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">Applicant</th>
                  <th className="px-6 py-4 font-semibold">Program</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Documents</th>
                  <th className="px-6 py-4 font-semibold">
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-semibold text-slate-900">{item.applicant}</p>
                        <p className="text-sm text-slate-500">{item.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-700">{item.program}</td>
                    <td className="px-6 py-5 text-sm text-slate-700">{item.date}</td>
                    <td className="px-6 py-5">
                      <StatusPill status={item.status} />
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-700">
                      {item.documents.filter((doc) => doc.fileUrl).length} documents
                    </td>
                    <td className="px-6 py-5">
                      <ApplicationActions
                        onView={() => setSelectedApplication(item)}
                        onAccept={() => requestApplicationStatusChange(item, "Approve")}
                        onReject={() => requestApplicationStatusChange(item, "Reject")}
                        onDelete={() => requestApplicationDelete(item)}
                        onRestore={() => requestApplicationStatusChange(item, "Under Review")}
                        currentStatus={item.status}
                        isDeleted={item.status === "Delete"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selectedApplication ? (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-0 py-0"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedApplication(null);
              }
            }}
          >
            <div className="w-full h-full rounded-none bg-white shadow-2xl overflow-auto">
              <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4 sticky top-0 bg-white z-10">
                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close application review"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)] h-[calc(100vh-96px)] overflow-y-auto">
                <aside className="space-y-6">
                  <section className="rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                      Applicant Details
                    </h3>
                    <div className="mt-4 space-y-3 text-sm">
                      <DetailRow label="Applicant" value={selectedApplication.applicant} />
                      <DetailRow label="Email" value={selectedApplication.email} />
                      <DetailRow label="Program" value={selectedApplication.program} />
                      <DetailRow label="Date" value={selectedApplication.date} />
                      <DetailRow label="Business Owner" value={selectedApplication.businessOwner} />
                      <DetailRow label="Business Name" value={selectedApplication.businessName || "-"} />
                      <DetailRow label="Civil Status" value={selectedApplication.civilStatus} />
                    </div>
                  </section>

                </aside>

                <section className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Documents
                      </h3>
                      <p className="text-sm text-slate-500">
                        Verify, reject, and add remarks per document.
                      </p>
                    </div>
                    <StatusPill status={selectedApplication.status} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedApplication.documents.map((document) => (
                      <DocumentCard
                        key={document.id}
                        document={document}
                        onStatusChange={(status) =>
                          requestDocumentStatusChange(
                            selectedApplication.id,
                            selectedApplication.applicant,
                            document,
                            status,
                          )
                        }
                        onRemarkChange={(remark) =>
                          updateDocumentRemark(
                            selectedApplication.id,
                            document.id,
                            remark
                          )
                        }
                        onRemarkSave={(remark) =>
                          saveDocumentRemark(
                            selectedApplication.id,
                            document.id,
                            remark
                          )
                        }
                        isSaving={savingRemark === `${selectedApplication.id}-${document.id}`}
                        disabled={
                          selectedApplication.status === "Approve" ||
                          selectedApplication.status === "Reject"
                        }
                      />
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : null}

        {pendingAction ? (
          <div
            className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 px-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeConfirmation();
              }
            }}
          >
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-slate-900">{pendingAction.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{pendingAction.message}</p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeConfirmation}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {pendingAction.cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    pendingAction.execute();
                    closeConfirmation();
                  }}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {pendingAction.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-2xl border p-4 shadow-2xl ring-1 ring-slate-200 bg-white">
          <div className={`flex items-start gap-3 ${toast.type === "success" ? "text-green-900" : toast.type === "error" ? "text-red-900" : "text-slate-900"}`}>
            <div className={`mt-1 h-2.5 w-2.5 rounded-full ${toast.type === "success" ? "bg-green-500" : toast.type === "error" ? "bg-red-500" : "bg-slate-400"}`} />
            <div>
              <p className="font-semibold">{toast.type === "success" ? "Success" : toast.type === "error" ? "Error" : "Info"}</p>
              <p className="mt-1 text-sm leading-6">{toast.message}</p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  );
}
