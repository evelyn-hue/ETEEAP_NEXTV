"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Trash2, Check, XCircle, Eye, Upload } from "lucide-react";

type StatusType = "Pending" | "Accepted" | "Rejected" | "Draft";

interface Applicant {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  program_name?: string;
  status: StatusType;
  created_at?: string;

  letter_of_intent?: string;
  resume?: string;
  picture?: string;
  application_form?: string;
  recommendation_letter?: string;
  school_credentials?: string;
  high_school_diploma?: string;
  transcript?: string;
  birth_certificate?: string;
  employment_certificate?: string;
  nbi_clearance?: string;
  marriage_certificate?: string;
  business_registration?: string;
  certificates?: string;

  [key: string]: any;
}

interface ToastState {
  message: string;
  type: "success" | "error" | "warning";
}

const FILE_COLUMNS = [
  "letter_of_intent",
  "resume",
  "picture",
  "application_form",
  "recommendation_letter",
  "school_credentials",
  "high_school_diploma",
  "transcript",
  "birth_certificate",
  "employment_certificate",
  "nbi_clearance",
  "marriage_certificate",
  "business_registration",
  "certificates",
];

const FILE_LABELS: Record<string, string> = {
  letter_of_intent: "Letter of Intent",
  resume: "Resume",
  picture: "Picture",
  application_form: "Application Form",
  recommendation_letter: "Recommendation Letter",
  school_credentials: "School Credentials",
  high_school_diploma: "High School Diploma",
  transcript: "Transcript",
  birth_certificate: "Birth Certificate",
  employment_certificate: "Employment Certificate",
  nbi_clearance: "NBI Clearance",
  marriage_certificate: "Marriage Certificate",
  business_registration: "Business Registration",
  certificates: "Certificates",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition";

const BTN_SUCCESS = `${BTN_BASE} bg-green-600 text-white hover:bg-green-700`;

const BTN_DANGER = `${BTN_BASE} bg-red-600 text-white hover:bg-red-700`;

const BTN_SECONDARY = `${BTN_BASE} bg-gray-600 text-white hover:bg-gray-700`;

const BTN_PRIMARY = `${BTN_BASE} bg-blue-600 text-white hover:bg-blue-700`;

const PROGRAMS = [
  "Bachelor of Science in Business Administration - Human Resource Management",
  "Bachelor of Arts in English Language Studies",
  "Bachelor of Science in Business Administration - Marketing Management",
  "Bachelor of Science in Hospitality Management",
];

export default function Application() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [programFilter, setProgramFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [showView, setShowView] = useState<Applicant | null>(null);
  const [showApplicationView, setShowApplicationView] = useState<Applicant | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [editingRemarksId, setEditingRemarksId] = useState<number | null>(null);
  const [remarksText, setRemarksText] = useState("");
  const [documentRemarks, setDocumentRemarks] = useState<Record<string, string>>({});
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [documentRemarksText, setDocumentRemarksText] = useState("");

  const [toast, setToast] = useState<ToastState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = "http://localhost:5000";

  // Mock applicants for frontend preview
  const MOCK_APPLICANTS: Applicant[] = [
    {
      id: 1,
      full_name: "Juan Dela Cruz",
      email: "juan.delacruz@email.com",
      phone: "+63 123 456 7890",
      program_name: "Bachelor of Science in Business Administration - Human Resource Management",
      status: "Pending",
      created_at: "2025-05-20",
      picture: "https://i.pravatar.cc/150?img=1",
      letter_of_intent: "uploads/applications/1/letter_of_intent.pdf",
      resume: "uploads/applications/1/resume.pdf",
      application_form: "uploads/applications/1/application_form.pdf",
      transcript: "uploads/applications/1/transcript.pdf",
      birth_certificate: "uploads/applications/1/birth_certificate.pdf",
      nbi_clearance: "uploads/applications/1/nbi_clearance.pdf",
      letter_of_intent_verified: 1,
      resume_verified: 1,
      application_form_verified: 0,
    },
    {
      id: 2,
      full_name: "Maria Santos",
      email: "maria.santos@email.com",
      phone: "+63 987 654 3210",
      program_name: "Bachelor of Arts in English Language Studies",
      status: "Accepted",
      created_at: "2025-05-15",
      picture: "https://i.pravatar.cc/150?img=5",
      letter_of_intent: "uploads/applications/2/letter_of_intent.pdf",
      resume: "uploads/applications/2/resume.pdf",
      application_form: "uploads/applications/2/application_form.pdf",
      recommendation_letter: "uploads/applications/2/recommendation_letter.pdf",
      transcript: "uploads/applications/2/transcript.pdf",
      letter_of_intent_verified: 1,
      resume_verified: 1,
      application_form_verified: 1,
      recommendation_letter_verified: 1,
      transcript_verified: 1,
    },
    {
      id: 3,
      full_name: "Carlos Miguel",
      email: "carlos.miguel@email.com",
      phone: "+63 555 123 4567",
      program_name: "Bachelor of Science in Business Administration - Marketing Management",
      status: "Rejected",
      created_at: "2025-05-10",
      picture: "https://i.pravatar.cc/150?img=3",
      letter_of_intent: "uploads/applications/3/letter_of_intent.pdf",
      resume: "uploads/applications/3/resume.pdf",
      application_form: "uploads/applications/3/application_form.pdf",
      letter_of_intent_verified: 1,
      resume_verified: 0,
    },
    {
      id: 4,
      full_name: "Angela Reyes",
      email: "angela.reyes@email.com",
      phone: "+63 222 888 9999",
      program_name: "Bachelor of Science in Hospitality Management",
      status: "Pending",
      created_at: "2025-05-25",
      picture: "https://i.pravatar.cc/150?img=9",
      letter_of_intent: "uploads/applications/4/letter_of_intent.pdf",
      resume: "uploads/applications/4/resume.pdf",
      application_form: "uploads/applications/4/application_form.pdf",
      high_school_diploma: "uploads/applications/4/high_school_diploma.pdf",
      transcript: "uploads/applications/4/transcript.pdf",
      birth_certificate: "uploads/applications/4/birth_certificate.pdf",
      nbi_clearance: "uploads/applications/4/nbi_clearance.pdf",
    },
  ];

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" = "success"
  ) => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/applications`);
      setApplicants(res.data);
    } catch (error) {
      console.error(error);
      // Use mock data for frontend preview
      setApplicants(MOCK_APPLICANTS);
    }
  };

  const acceptRejectApplicant = async (
    id: number,
    status: StatusType
  ) => {
    try {
      await axios.put(`${API_URL}/admin/applications/${id}/status`, {
        status,
      });

      setApplicants((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status,
              }
            : a
        )
      );

      showToast(`Applicant ${status}`);
    } catch (error) {
      console.error(error);
      showToast("Failed to update status", "error");
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
  };

  const doDelete = async () => {
    try {
      await axios.delete(
        `${API_URL}/admin/applications/${deleteId}`
      );

      setApplicants((prev) =>
        prev.filter((a) => a.id !== deleteId)
      );

      setDeleteId(null);

      showToast("Applicant deleted");
    } catch (error) {
      console.error(error);
      showToast("Delete failed", "error");
    }
  };

  const doReject = async () => {
    if (!rejectId) return;

    await acceptRejectApplicant(rejectId, "Rejected");

    setRejectId(null);
  };

  const saveRemarks = (applicantId: number, text: string) => {
    setRemarks((prev) => ({
      ...prev,
      [applicantId]: text,
    }));
    setEditingRemarksId(null);
    setRemarksText("");
  };

  const saveDocumentRemarks = (documentKey: string, text: string) => {
    setDocumentRemarks((prev) => ({
      ...prev,
      [documentKey]: text,
    }));
    setEditingDocumentId(null);
    setDocumentRemarksText("");
  };

  const verifyFile = async (
    applicantId: number,
    fileKey: string
  ) => {
    try {
      const applicant = applicants.find(
        (a) => a.id === applicantId
      );

      const verified = applicant?.[`${fileKey}_verified`] === 1;

      const newValue = verified ? 0 : 1;

      await axios.put(
        `${API_URL}/admin/applications/${applicantId}/documents/${fileKey}/verify`,
        {
          verified: newValue,
        }
      );

      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicantId
            ? {
                ...a,
                [`${fileKey}_verified`]: newValue,
              }
            : a
        )
      );

      if (showView?.id === applicantId) {
        setShowView({
          ...showView,
          [`${fileKey}_verified`]: newValue,
        });
      }

      showToast(
        newValue === 1
          ? "File verified"
          : "File unverified"
      );
    } catch (error) {
      console.error(error);
      showToast("Verification failed", "error");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(
        `${API_URL}/admin/applications/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showToast("Applications imported successfully");
      fetchApplicants();

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      showToast("Import failed", "error");
    }
  };

  const filtered = applicants.filter((a) => {
    const q = search.toLowerCase();

    const matchesSearch =
      a.full_name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.phone?.toLowerCase().includes(q) ||
      a.program_name?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "All"
        ? true
        : a.status === statusFilter;

    const matchesProgram =
      programFilter === "All"
        ? true
        : a.program_name === programFilter;

    const matchesDate =
      !dateFilter
        ? true
        : a.created_at?.startsWith(dateFilter);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesProgram &&
      matchesDate &&
      a.status !== "Draft"
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">
        Applicant Management
      </h1>

      {/* FILTERS */}

      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-gray-700">
            Applicants: <span className="text-blue-600">{filtered.length}</span> / {applicants.filter(a => a.status !== "Draft").length}
          </h2>
        </div>

        <div className="grid md:grid-cols-6 gap-4 items-end">
          <input
            type="text"
            placeholder="Search..."
            className="border rounded-lg px-4 py-2"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            className="border rounded-lg px-4 py-2"
            value={programFilter}
            onChange={(e) =>
              setProgramFilter(e.target.value)
            }
          >
            <option value="All">
              All Programs
            </option>

            {PROGRAMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg px-4 py-2"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">
              All Status
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Accepted">
              Accepted
            </option>

            <option value="Rejected">
              Rejected
            </option>
          </select>

          <input
            type="date"
            className="border rounded-lg px-4 py-2"
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(e.target.value)
            }
          />

          <button
            className={BTN_PRIMARY}
            onClick={handleImportClick}
          >
            <Upload size={16} />
            Import
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="px-6 py-3 text-left">
                  Picture
                </th>

                <th className="px-6 py-3 text-left">
                  Name
                </th>

                <th className="px-6 py-3 text-left">
                  Email
                </th>

                <th className="px-6 py-3 text-left">
                  Phone
                </th>

                <th className="px-6 py-3 text-left">
                  Program
                </th>

                <th className="px-6 py-3 text-left">
                  Status
                </th>

                <th className="px-6 py-3 text-center">
                  Documents
                </th>

                <th className="px-6 py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8"
                  >
                    No applicants found
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      {a.picture ? (
                        <img
                          src={`${API_URL}/${a.picture}`}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                          {a.full_name?.charAt(0) || "?"}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {a.full_name}
                    </td>

                    <td className="px-6 py-4">
                      {a.email}
                    </td>

                    <td className="px-6 py-4 text-left">
                      {a.phone || "-"}
                    </td>

                    <td className="px-6 py-4">
                      {a.program_name ||
                        "N/A"}
                    </td>

                    <td
                      className={`px-6 py-4 font-semibold ${
                        a.status === "Accepted"
                          ? "text-green-600"
                          : a.status ===
                            "Rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {a.status}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {
                        FILE_COLUMNS.filter(
                          (f) => a[f]
                        ).length
                      }
                    </td>

                    <td
                      className="px-6 py-4"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <div className="flex gap-2 justify-center">
                        <button
                          className="inline-flex items-center justify-center p-2 rounded-md transition bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() =>
                            setShowApplicationView(a)
                          }
                          title="View Application"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className={BTN_SUCCESS}
                          onClick={() =>
                            acceptRejectApplicant(
                              a.id,
                              "Accepted"
                            )
                          }
                        >
                          <Check size={16} />
                          Accept
                        </button>

                        <button
                          className={BTN_DANGER}
                          onClick={() =>
                            setRejectId(a.id)
                          }
                        >
                          <XCircle size={16} />
                          Reject
                        </button>

                        <button
                          className={BTN_SECONDARY}
                          onClick={() =>
                            confirmDelete(a.id)
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW SECTION */}

      {showView && (
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold text-blue-800">
              {showView.full_name}'s Documents
            </h2>

            <button
              className={BTN_SECONDARY}
              onClick={() =>
                setShowView(null)
              }
            >
              Close
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {FILE_COLUMNS.map((f) => {
              const fileURL = showView[f];

              const verified =
                showView[
                  `${f}_verified`
                ] === 1;

              return (
                <div
                  key={f}
                  className="border rounded-xl p-4 bg-gray-50"
                >
                  <div className="font-semibold mb-3">
                    {FILE_LABELS[f]}
                  </div>

                  {fileURL ? (
                    <>
                      <button
                        className="text-blue-600 mb-3"
                        onClick={() =>
                          window.open(
                            `${API_URL}/${fileURL}`,
                            "_blank"
                          )
                        }
                      >
                        <Eye />
                      </button>

                      <div className="text-xs text-gray-500 truncate mb-3">
                        {fileURL
                          .split("/")
                          .pop()}
                      </div>

                      <button
                        className={
                          verified
                            ? BTN_DANGER
                            : BTN_SUCCESS
                        }
                        onClick={() =>
                          verifyFile(
                            showView.id,
                            f
                          )
                        }
                      >
                        {verified
                          ? "Unverify"
                          : "Verify"}
                      </button>
                    </>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      No file uploaded
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL APPLICATION VIEW */}

      {showApplicationView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="sticky top-0 bg-blue-800 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Application Details
              </h2>

              <button
                className="text-white hover:bg-blue-900 p-2 rounded-lg"
                onClick={() =>
                  setShowApplicationView(null)
                }
              >
                ✕
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-6">
              {/* PROFILE SECTION */}
              <div className="mb-8">
                <div className="flex gap-6 mb-6">
                  {/* PROFILE PICTURE */}
                  <div className="flex-shrink-0">
                    {showApplicationView.picture ? (
                      <img
                        src={`${API_URL}/${showApplicationView.picture}`}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-3xl">
                        {showApplicationView.full_name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>

                  {/* BASIC INFO */}
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {showApplicationView.full_name}
                    </h3>

                    <div className="space-y-2 text-gray-600">
                      <p><span className="font-semibold">Email:</span> {showApplicationView.email}</p>
                      <p><span className="font-semibold">Phone:</span> {showApplicationView.phone || "N/A"}</p>
                      <p><span className="font-semibold">Program:</span> {showApplicationView.program_name || "N/A"}</p>
                      <p><span className="font-semibold">Status:</span> <span className={`font-bold ${showApplicationView.status === "Accepted" ? "text-green-600" : showApplicationView.status === "Rejected" ? "text-red-600" : "text-yellow-600"}`}>{showApplicationView.status}</span></p>
                      <p><span className="font-semibold">Applied Date:</span> {showApplicationView.created_at || "N/A"}</p>
                      <div className="mt-4 pt-4 border-t">
                        <p className="mb-2"><span className="font-semibold">Verification Status:</span></p>
                        <div className="flex gap-2">
                          <button
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition bg-green-100 text-green-700 hover:bg-green-200"
                            onClick={() => {
                              // Mark as verified
                              alert(`Application #${showApplicationView.id} marked as verified`);
                            }}
                          >
                            ✓ Verify
                          </button>
                          <button
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            onClick={() => {
                              // Mark as unverified
                              alert(`Application #${showApplicationView.id} marked as unverified`);
                            }}
                          >
                            ✕ Unverify
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DOCUMENTS SECTION */}
              <div className="mb-6">
                <h4 className="text-xl font-bold text-blue-800 mb-4">Documents</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {FILE_COLUMNS.map((f) => {
                    const fileURL = showApplicationView[f];
                    const verified = showApplicationView[`${f}_verified`] === 1;
                    const docKey = `${showApplicationView.id}_${f}`;
                    const docRemarks = documentRemarks[docKey];

                    return (
                      <div
                        key={f}
                        className="border rounded-xl p-4 bg-gray-50"
                      >
                        <div className="font-semibold mb-3 text-sm">
                          {FILE_LABELS[f]}
                        </div>

                        {fileURL ? (
                          <>
                            {/* FILE INFO */}
                            <button
                              className="text-blue-600 mb-3 hover:text-blue-800"
                              onClick={() =>
                                window.open(
                                  `${API_URL}/${fileURL}`,
                                  "_blank"
                                )
                              }
                              title="View document"
                            >
                              <Eye size={20} />
                            </button>

                            <div className="text-xs text-gray-500 truncate mb-3">
                              {fileURL
                                .split("/")
                                .pop()}
                            </div>

                            {/* VERIFICATION STATUS */}
                            <div className="mb-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                {verified ? "✓ Verified" : "Pending"}
                              </span>
                            </div>

                            {/* VERIFY/UNVERIFY BUTTONS */}
                            <div className="flex gap-2 mb-3">
                              <button
                                className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium rounded transition bg-green-600 text-white hover:bg-green-700"
                                onClick={() => verifyFile(showApplicationView.id, f)}
                              >
                                ✓ Verify
                              </button>
                              <button
                                className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium rounded transition bg-yellow-600 text-white hover:bg-yellow-700"
                                onClick={() => verifyFile(showApplicationView.id, f)}
                              >
                                ✕ Unverify
                              </button>
                            </div>

                            {/* DOCUMENT REMARKS */}
                            <div className="border-t pt-3">
                              <p className="text-xs font-semibold text-gray-700 mb-2">Remarks</p>
                              
                              {docRemarks ? (
                                <div className="bg-blue-50 border border-blue-200 p-2 rounded mb-2">
                                  <p className="text-xs text-gray-800 break-words">{docRemarks}</p>
                                  <button
                                    className="mt-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                                    onClick={() => {
                                      setEditingDocumentId(docKey);
                                      setDocumentRemarksText(docRemarks);
                                    }}
                                  >
                                    Edit
                                  </button>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500 mb-2">No remarks</p>
                              )}

                              {editingDocumentId === docKey ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={documentRemarksText}
                                    onChange={(e) =>
                                      setDocumentRemarksText(
                                        e.target.value
                                      )
                                    }
                                    placeholder="Add remarks..."
                                    className="w-full border rounded p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      className="flex-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                      onClick={() =>
                                        saveDocumentRemarks(
                                          docKey,
                                          documentRemarksText
                                        )
                                      }
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="flex-1 text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                                      onClick={() => {
                                        setEditingDocumentId(null);
                                        setDocumentRemarksText("");
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  className="w-full text-xs bg-gray-300 text-gray-800 px-2 py-1 rounded hover:bg-gray-400"
                                  onClick={() => {
                                    setEditingDocumentId(docKey);
                                    setDocumentRemarksText("");
                                  }}
                                >
                                  Add Remarks
                                </button>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-400 text-sm">
                            No file uploaded
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* REMARKS SECTION */}
              <div className="mb-6 border-t pt-6">
                <h4 className="text-xl font-bold text-blue-800 mb-4">Remarks</h4>
                
                {remarks[showApplicationView.id] ? (
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-4">
                    <p className="text-gray-800">{remarks[showApplicationView.id]}</p>
                    <button
                      className="mt-3 text-blue-600 hover:text-blue-800 font-semibold text-sm"
                      onClick={() => {
                        setEditingRemarksId(showApplicationView.id);
                        setRemarksText(remarks[showApplicationView.id]);
                      }}
                    >
                      Edit Remarks
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500 mb-4">No remarks added yet.</p>
                )}

                {editingRemarksId === showApplicationView.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={remarksText}
                      onChange={(e) =>
                        setRemarksText(e.target.value)
                      }
                      placeholder="Add remarks about this application..."
                      className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <button
                        className={BTN_PRIMARY}
                        onClick={() =>
                          saveRemarks(
                            showApplicationView.id,
                            remarksText
                          )
                        }
                      >
                        Save Remarks
                      </button>
                      <button
                        className={BTN_SECONDARY}
                        onClick={() => {
                          setEditingRemarksId(null);
                          setRemarksText("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className={BTN_PRIMARY}
                    onClick={() => {
                      setEditingRemarksId(showApplicationView.id);
                      setRemarksText("");
                    }}
                  >
                    Add Remarks
                  </button>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-3 pt-6 border-t">
                <button
                  className={BTN_SUCCESS}
                  onClick={() => {
                    acceptRejectApplicant(
                      showApplicationView.id,
                      "Accepted"
                    );
                    setShowApplicationView(null);
                  }}
                >
                  <Check size={16} />
                  Accept
                </button>

                <button
                  className={BTN_DANGER}
                  onClick={() => {
                    setRejectId(showApplicationView.id);
                    setShowApplicationView(null);
                  }}
                >
                  <XCircle size={16} />
                  Reject
                </button>

                <button
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    alert(`Application #${showApplicationView.id} verified`);
                  }}
                >
                  ✓ Verify Application
                </button>

                <button
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition bg-yellow-600 text-white hover:bg-yellow-700"
                  onClick={() => {
                    alert(`Application #${showApplicationView.id} unverified`);
                  }}
                >
                  ✕ Unverify Application
                </button>

                <button
                  className={BTN_SECONDARY}
                  onClick={() => setShowView(showApplicationView)}
                >
                  <Eye size={16} />
                  View Documents
                </button>

                <button
                  className="ml-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition bg-gray-400 text-white hover:bg-gray-500"
                  onClick={() =>
                    setShowApplicationView(null)
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE SECTION */}

      {deleteId && (
        <div className="fixed bottom-6 right-6 bg-white shadow-xl rounded-xl p-4 border">
          <p className="mb-3">
            Delete this applicant?
          </p>

          <div className="flex gap-2">
            <button
              className={BTN_SECONDARY}
              onClick={() =>
                setDeleteId(null)
              }
            >
              Cancel
            </button>

            <button
              className={BTN_DANGER}
              onClick={doDelete}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* REJECT SECTION */}

      {rejectId && (
        <div className="fixed bottom-6 left-6 bg-white shadow-xl rounded-xl p-4 border">
          <p className="mb-3">
            Reject this applicant?
          </p>

          <div className="flex gap-2">
            <button
              className={BTN_SECONDARY}
              onClick={() =>
                setRejectId(null)
              }
            >
              Cancel
            </button>

            <button
              className={BTN_DANGER}
              onClick={doReject}
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div
          className={`fixed top-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white z-50 ${
            toast.type === "success"
              ? "bg-green-600"
              : toast.type === "error"
              ? "bg-red-600"
              : "bg-yellow-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}