"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Eye,
  Search,
  Trash2,
  XCircle,
  X,
} from "lucide-react";

type DocumentStatus = "Pending" | "Verified" | "Rejected";

type DocumentItem = {
  id: string;
  label: string;
  required?: boolean;
  note?: string;
  fileType?: string;
  status: DocumentStatus;
  remark: string;
};

type ApplicationRecord = {
  id: number;
  applicant: string;
  email: string;
  program: string;
  date: string;
  status: "Pending" | "Accepted" | "Rejected" | "Draft";
  businessOwner: "Yes" | "No";
  businessName: string;
  documents: DocumentItem[];
};

const baseDocuments: DocumentItem[] = [
  { id: "letterOfIntent", label: "A. Letter of Intent", required: true, status: "Pending", remark: "" },
  { id: "resume", label: "B. Resume / CV", required: true, status: "Pending", remark: "" },
  { id: "picture", label: "C. Formal Picture", required: true, status: "Pending", remark: "" },
  { id: "applicationForm", label: "D. ETEEAP Application Form", required: true, note: "Screenshot of completed Google Form", status: "Pending", remark: "" },
  { id: "recommendationLetter", label: "E. Recommendation Letter", required: true, status: "Pending", remark: "" },
  { id: "schoolCredentials", label: "F. School Credentials", required: true, status: "Pending", remark: "" },
  { id: "highSchoolDiploma", label: "G. High School Diploma / PEPT", required: true, status: "Pending", remark: "" },
  { id: "transcript", label: "H. Transcript", required: true, status: "Pending", remark: "" },
  { id: "birthCertificate", label: "I. Birth Certificate", required: true, status: "Pending", remark: "" },
  { id: "marriageCertificate", label: "J. Marriage Certificate", status: "Pending", remark: "" },
  { id: "employmentCertificate", label: "K. Certificate of Employment (4 max)", required: true, note: "Up to 4 files", status: "Pending", remark: "" },
  { id: "nbiClearance", label: "L. NBI Clearance", required: true, status: "Pending", remark: "" },
  { id: "businessRegistration", label: "M. Business Registration", status: "Pending", remark: "" },
  { id: "certificates", label: "N. Certificates (10 max)", note: "Up to 10 files", status: "Pending", remark: "" },
];

const initialApplications: ApplicationRecord[] = [
  {
    id: 1,
    applicant: "Juan Dela Cruz",
    email: "juan.delacruz@email.com",
    program: "BSBA - Human Resource Management",
    date: "2025-05-20",
    status: "Pending",
    businessOwner: "No",
    businessName: "",
    documents: baseDocuments.map((doc, index) => ({
      ...doc,
      status: index < 8 ? "Verified" : "Pending",
      remark: index === 3 ? "Form screenshot is clear." : "",
    })),
  },
  {
    id: 2,
    applicant: "Maria Santos",
    email: "maria.santos@email.com",
    program: "Bachelor of Arts in English Language Studies",
    date: "2025-05-15",
    status: "Accepted",
    businessOwner: "Yes",
    businessName: "MSS Tutorial Center",
    documents: baseDocuments.map((doc, index) => ({
      ...doc,
      status: index === 9 || index === 12 ? "Pending" : "Verified",
      remark: index === 12 ? "Business registration uploaded." : "",
    })),
  },
  {
    id: 3,
    applicant: "Carlos Miguel",
    email: "carlos.miguel@email.com",
    program: "BS Business Administration - Marketing Management",
    date: "2025-05-10",
    status: "Rejected",
    businessOwner: "No",
    businessName: "",
    documents: baseDocuments.map((doc, index) => ({
      ...doc,
      status: index < 5 ? "Rejected" : "Pending",
      remark: index === 0 ? "Missing signature." : "",
    })),
  },
];

function StatusPill({ status }: { status: DocumentStatus | ApplicationRecord["status"] }) {
  const styles =
    status === "Verified" || status === "Accepted"
      ? "bg-green-100 text-green-800"
      : status === "Rejected"
        ? "bg-red-100 text-red-800"
        : "bg-yellow-100 text-yellow-800";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
}

function ApplicationActions({
  // item,
  onView,
  onAccept,
  onReject,
  onDelete,
}: {
  item: ApplicationRecord;
  onView: () => void;
  onAccept: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
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
      <button
        type="button"
        onClick={onAccept}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 sm:w-auto"
      >
        <Check size={16} />
        Accept
      </button>
      <button
        type="button"
        onClick={onReject}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 sm:w-auto"
      >
        <XCircle size={16} />
        Reject
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
      >
        <Trash2 size={16} />
        Delete
      </button>
    </div>
  );
}

function DocumentCard({
  document,
  onStatusChange,
  onRemarkChange,
}: {
  document: DocumentItem;
  onStatusChange: (status: DocumentStatus) => void;
  onRemarkChange: (remark: string) => void;
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

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onStatusChange("Verified")}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          <Check size={16} />
          Verify
        </button>
        <button
          type="button"
          onClick={() => onStatusChange("Rejected")}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
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
          placeholder="Add a remark for this document..."
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
        />
      </label>
    </div>
  );
}

export default function Application() {
  const [applications, setApplications] = useState(initialApplications);
  const [query, setQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("All Programs");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationRecord | null>(null);

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
    return [
      "All Programs",
      "Bachelor of Science in Hospitality Management",
      ...new Set(applications.map((item) => item.program)),
    ];
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
    status: ApplicationRecord["status"]
  ) => {
    setApplications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );

    setSelectedApplication((prev) =>
      prev && prev.id === id ? { ...prev, status } : prev
    );
  };

  const updateDocumentStatus = (
    applicationId: number,
    documentId: string,
    status: DocumentStatus
  ) => {
    setApplications((prev) =>
      prev.map((item) =>
        item.id === applicationId
          ? {
              ...item,
              documents: item.documents.map((doc) =>
                doc.id === documentId ? { ...doc, status } : doc
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
              doc.id === documentId ? { ...doc, status } : doc
            ),
          }
        : prev
    );
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

  const deleteApplication = (id: number) => {
    setApplications((prev) => prev.filter((item) => item.id !== id));
    setSelectedApplication((prev) => (prev && prev.id === id ? null : prev));
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
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
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
                  item={item}
                  onView={() => setSelectedApplication(item)}
                  onAccept={() => updateApplicationStatus(item.id, "Accepted")}
                  onReject={() => updateApplicationStatus(item.id, "Rejected")}
                  onDelete={() => deleteApplication(item.id)}
                />
              </div>
            </article>
          ))}
        </section>

        <section className="hidden overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">Applicant</th>
                  <th className="px-6 py-4 font-semibold">Program</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Documents</th>
                  <th className="px-6 py-4 font-semibold">
                    <div className="flex items-center justify-between gap-3">
                      <span>Action</span>
                      <Trash2 size={16} className="text-slate-500" />
                    </div>
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
                      {item.documents.length} documents
                    </td>
                    <td className="px-6 py-5">
                      <ApplicationActions
                        item={item}
                        onView={() => setSelectedApplication(item)}
                        onAccept={() => updateApplicationStatus(item.id, "Accepted")}
                        onReject={() => updateApplicationStatus(item.id, "Rejected")}
                        onDelete={() => deleteApplication(item.id)}
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
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-0 py-0 sm:items-center sm:px-4 sm:py-8"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedApplication(null);
              }
            }}
          >
            <div className="w-full max-w-7xl overflow-y-auto rounded-none bg-white shadow-2xl h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:rounded-3xl">
              <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close application review"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
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
                      <DetailRow label="Application Status" value={selectedApplication.status} />
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
                          updateDocumentStatus(
                            selectedApplication.id,
                            document.id,
                            status
                          )
                        }
                        onRemarkChange={(remark) =>
                          updateDocumentRemark(
                            selectedApplication.id,
                            document.id,
                            remark
                          )
                        }
                      />
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : null}
      </div>
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
