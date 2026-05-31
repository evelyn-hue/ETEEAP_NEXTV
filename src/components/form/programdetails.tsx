"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaExternalLinkAlt } from "react-icons/fa";

// -------------------------
// LOG USER ACTIVITY  ⭐ ADDED
// -------------------------
const logActivity = async (action: string, details: string = "") => {
  try {
    await fetch("http://localhost:5000/log_activity", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, details }),
    });
  } catch (err) {
    console.error("Activity Log Error:", err);
  }
};

// -------------------------
// TOAST NOTIFICATION HELPER
// -------------------------
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) => {
  return { message, type, duration };
};

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  maritalStatus: string;
  isBusinessOwner: string;
  businessName: string;
  letterOfIntent: File | string | null;
  resume: File | string | null;
  picture: File | string | null;
  applicationForm: File | string | null;
  recommendationLetter: File | string | null;
  schoolCredentials: File | string | null;
  highSchoolDiploma: File | string | null;
  transcript: File | string | null;
  birthCertificate: File | string | null;
  employmentCertificate: (File | string)[];
  nbiClearance: File | string | null;
  marriageCertificate: File | string | null;
  businessRegistration: File | string | null;
  certificates: (File | string)[];
}

interface ExternalLink {
  url: string;
  label: string;
}

interface Draft {
  id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  marital_status?: string;
  is_business_owner?: boolean;
  business_name?: string;
  [key: string]: any;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

function ProgramDetails({ programName }: { programName: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ensure the page is scrolled to the top when this component mounts or when the program changes
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch (e) {
      // ignore in non-browser environments
    }
  }, [programName]);

  const initialFormData: FormData = {
    fullName: "",
    email: "",
    phone: "",
    maritalStatus: "Single",
    isBusinessOwner: "No",
    businessName: "",
    letterOfIntent: null,
    resume: null,
    picture: null,
    applicationForm: null,
    recommendationLetter: null,
    schoolCredentials: null,
    highSchoolDiploma: null,
    transcript: null,
    birthCertificate: null,
    employmentCertificate: [],
    nbiClearance: null,
    marriageCertificate: null,
    businessRegistration: null,
    certificates: [],
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [pendingOpenReview, setPendingOpenReview] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const maxFileSize = 50 * 1024 * 1024; // 50MB
  const acceptedTypes = ["application/pdf", "image/jpeg", "image/png"];

  // -------------------------
  // FILE HANDLER (multi-file support)
  // -------------------------
  const handleFileChange = (name: string, files: FileList | null, maxFiles: number = 1) => {
    if (!files || files.length === 0) return;

    let validFiles: File[] = [];
    for (let file of Array.from(files)) {
      if (!acceptedTypes.includes(file.type)) {
        setToast(showToast(`Invalid file type: ${file.name}`, 'error'));
        continue;
      }
      if (file.size > maxFileSize) {
        setToast(showToast(`File too large (max 50MB): ${file.name}`, 'error'));
        continue;
      }
      validFiles.push(file);
    }
    if (validFiles.length === 0) return;

    setErrors((prev) => ({ ...prev, [name]: null }));

    // single file
    if (maxFiles === 1) {
      if (name === "picture") {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(validFiles[0]);
      }
      setFormData((prev) => ({ ...prev, [name]: validFiles[0] }));
      return;
    }

    // multiple files
    const prevFiles = Array.isArray(formData[name as keyof FormData]) 
      ? (formData[name as keyof FormData] as (File | string)[]) 
      : [];
    let updatedFiles = [...prevFiles, ...validFiles];
    if (updatedFiles.length > maxFiles) {
      setToast(showToast(`You can only upload up to ${maxFiles} files.`, 'error'));
      updatedFiles = updatedFiles.slice(0, maxFiles);
    }
    setFormData((prev) => ({ ...prev, [name]: updatedFiles }));
  };

  // -------------------------
  // FILE INPUT RENDER
  // -------------------------
  const renderFileInput = (
    label: string,
    name: string,
    required: boolean = true,
    isImage: boolean = false,
    maxFiles: number = 1,
    externalLink: ExternalLink | null = null
  ) => {
    const isAdjustable = ["picture", "employmentCertificate", "certificates"].includes(name);
    const isMultiFile = maxFiles > 1;
    const fieldValue = formData[name as keyof FormData];

    return (
      <div
        className={`border-dashed border-2 rounded-md p-4 text-center cursor-pointer flex flex-col
        ${isAdjustable ? "min-h-auto" : isMultiFile ? "grow" : "h-36"} 
        ${errors[name] ? "border-red-500" : "border-gray-300"}`}
        onClick={() => document.getElementById(name)?.click()}
      >
        <label className="font-medium cursor-pointer block mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <input
          id={name}
          type="file"
          multiple={maxFiles > 1}
          className="hidden"
          accept={isImage ? "image/*" : ".pdf, .jpg, .jpeg, .png"}
          onChange={(e) => {
            const selected = e.target.files ? Array.from(e.target.files) : [];
            handleFileChange(name, e.target.files, maxFiles);
            e.target.value = "";
          }}
        />

        {/* Image Preview for C */}
        {isImage && fieldValue && (
          <div className="mt-2 flex justify-center">
            {typeof fieldValue === 'string' ? (
              <img
                src={fieldValue.startsWith('http') ? fieldValue : `http://localhost:5000/${fieldValue}`}
                alt="Preview"
                className={`rounded-md border ${isAdjustable ? "max-w-full max-h-48 object-contain" : "w-32 h-32 object-cover"}`}
              />
            ) : (
              <img
                src={name === "picture" ? imagePreview || "" : URL.createObjectURL(fieldValue as File)}
                alt="Preview"
                className={`rounded-md border ${isAdjustable ? "max-w-full max-h-48 object-contain" : "w-32 h-32 object-cover"}`}
              />
            )}
          </div>
        )}

        {/* Multi-file preview for K and N */}
        {isMultiFile && Array.isArray(fieldValue) && fieldValue.length > 0 && (
          <table className="w-full text-left mt-2 text-xs">
            <tbody>
              {fieldValue.map((file, idx) => (
                <tr key={idx}>
                  <td className="py-1 border-b break-all">
                    {typeof file === 'string' ? file.split('/').pop() : file.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Single file preview for non-images */}
        {(!isImage && fieldValue && !Array.isArray(fieldValue)) && (
          <p className="mt-2 text-gray-700 text-sm">
            {typeof fieldValue === 'string' ? fieldValue.split('/').pop() : (fieldValue as File).name}
          </p>
        )}

        <p className="text-xs text-gray-400 mt-2">
          {maxFiles > 1 ? `${maxFiles} files maximum` : "Click to select file"}
        </p>

        {externalLink && (
          <a
            href={externalLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            {externalLink.label} <FaExternalLinkAlt size={12} />
          </a>
        )}
      </div>
    );
  };

  // -------------------------
  // VALIDATION
  // -------------------------
  const validateRequired = (): string[] => {
    const required = [
      "letterOfIntent",
      "resume",
      "picture",
      "applicationForm",
      "recommendationLetter",
      "schoolCredentials",
      "highSchoolDiploma",
      "transcript",
      "birthCertificate",
      "employmentCertificate",
      "nbiClearance",
    ];
    if (formData.maritalStatus === "Married") required.push("marriageCertificate");
    if (formData.isBusinessOwner === "Yes") required.push("businessRegistration");
    
    return required.filter((key) => {
      const val = formData[key as keyof FormData];
      return !val || (Array.isArray(val) && val.length === 0);
    });
  };

  const handleReview = (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    
    if (draftLoading) {
      setPendingOpenReview(true);
      return;
    }

    // Store state in sessionStorage since URL params have limitations
    sessionStorage.setItem('applicationState', JSON.stringify({ formData, draftId, programName }));
    router.push(`/review-application`);
  };

  // -------------------------
  // SUBMISSION
  // -------------------------
  const handleSubmit = async () => {
    const missingFiles = validateRequired();
    if (!formData.phone || formData.phone.trim() === "") {
      setToast(showToast("Please enter your phone number. This field is required.", 'error'));
      return;
    }
    if (!formData.picture) {
      setToast(showToast("Please upload your formal picture (image 2). This field is required.", 'error'));
      return;
    }
    if (missingFiles.length > 0) {
      setToast(showToast("Please fill all required documents before submitting: " + missingFiles.join(", "), 'error'));
      return;
    }

    const data = new FormData();
    data.append("program_name", programName);
    data.append("full_name", formData.fullName);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("marital_status", formData.maritalStatus);
    data.append("is_business_owner", formData.isBusinessOwner);
    data.append("business_name", formData.businessName || "");

    const fileFields: Record<string, string> = {
      letterOfIntent: "letter_of_intent",
      resume: "resume",
      picture: "picture",
      applicationForm: "application_form",
      recommendationLetter: "recommendation_letter",
      schoolCredentials: "school_credentials",
      highSchoolDiploma: "high_school_diploma",
      transcript: "transcript",
      birthCertificate: "birth_certificate",
      employmentCertificate: "employment_certificate",
      nbiClearance: "nbi_clearance",
      marriageCertificate: "marriage_certificate",
      businessRegistration: "business_registration",
      certificates: "certificates",
    };

    Object.keys(fileFields).forEach((key) => {
      const val = formData[key as keyof FormData];
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach((f) => {
          if (f instanceof File) data.append(fileFields[key], f);
        });
      } else if (val instanceof File) {
        data.append(fileFields[key], val);
      }
    });

    try {
      const storedUser = localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      if (draftId) data.append('draft_id', draftId);

      const res = await fetch("http://localhost:5000/submit_application", {
        method: "POST",
        body: data,
        credentials: "include",
        headers: userId ? { "x-user-id": String(userId) } : {},
      });
      const result = await res.json();
      if (!res.ok) {
        setToast(showToast(result.message || "Unknown error", 'error'));
        return;
      }

      await logActivity("Application Submitted", `User submitted application for program: ${programName}`);

      setToast(showToast("Application submitted successfully! Please wait 3–5 business days for verification.", 'success', 0));
      setTimeout(() => router.push("/courses"), 2000);
    } catch (err) {
      setToast(showToast("Submission failed. Please try again.", 'error'));
    }
  };

  // -------------------------
  // SAVE DRAFT
  // -------------------------
  const handleSaveDraft = async () => {
    const data = new FormData();
    data.append("program_name", programName);
    data.append("full_name", formData.fullName);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("marital_status", formData.maritalStatus);
    data.append("is_business_owner", formData.isBusinessOwner);
    data.append("business_name", formData.businessName || "");

    const fileFields: Record<string, string> = {
      letterOfIntent: "letter_of_intent",
      resume: "resume",
      picture: "picture",
      applicationForm: "application_form",
      recommendationLetter: "recommendation_letter",
      schoolCredentials: "school_credentials",
      highSchoolDiploma: "high_school_diploma",
      transcript: "transcript",
      birthCertificate: "birth_certificate",
      employmentCertificate: "employment_certificate",
      nbiClearance: "nbi_clearance",
      marriageCertificate: "marriage_certificate",
      businessRegistration: "business_registration",
      certificates: "certificates",
    };

    Object.keys(fileFields).forEach((key) => {
      const val = formData[key as keyof FormData];
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach((f) => {
          if (f instanceof File) data.append(fileFields[key], f);
        });
      } else if (val instanceof File) {
        data.append(fileFields[key], val);
      }
    });

    try {
      const storedUser = localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      if (draftId) data.append('draft_id', draftId);

      const res = await fetch("http://localhost:5000/submit_application/draft", {
        method: "POST",
        body: data,
        credentials: "include",
        headers: userId ? { "x-user-id": String(userId) } : {},
      });
      const result = await res.json();
      if (!res.ok) {
        setToast(showToast(`Error saving draft: ${result.message || "Unknown error"}`, 'error'));
        return;
      }
      setToast(showToast(result.message || "Draft saved", 'success'));
      setShowModal(false);
      if (result.draftId) setDraftId(result.draftId);
    } catch (err) {
      setToast(showToast("Failed to save draft. Please try again.", 'error'));
    }
  };

  // Load draft from sessionStorage or props
  useEffect(() => {
    const loadDraft = async () => {
      setDraftLoading(true);
      let draft: Draft | null = null;

      // Try to get from sessionStorage first
      const storedState = sessionStorage.getItem('applicationDraft');
      if (storedState) {
        draft = JSON.parse(storedState);
        sessionStorage.removeItem('applicationDraft');
      }

      if (!draft) {
        setDraftLoading(false);
        return;
      }

      let finalDraft = draft;

      if (draft.id) {
        try {
          const stored = localStorage.getItem('user');
          const userId = stored ? JSON.parse(stored).id : null;
          const res = await fetch(`http://localhost:5000/submit_application/drafts/${draft.id}`, {
            credentials: 'include',
            headers: userId ? { 'x-user-id': String(userId) } : {},
          });
          if (res.ok) {
            finalDraft = await res.json();
          }
        } catch (err) {
          console.error('Error fetching draft:', err);
        }
      }

      setDraftId(finalDraft.id || null);
      const map = { ...initialFormData };

      if (finalDraft.full_name) map.fullName = finalDraft.full_name;
      if (finalDraft.email) map.email = finalDraft.email;
      if (finalDraft.phone) map.phone = finalDraft.phone;
      if (finalDraft.marital_status) map.maritalStatus = finalDraft.marital_status;
      if (typeof finalDraft.is_business_owner !== 'undefined') 
        map.isBusinessOwner = finalDraft.is_business_owner ? 'Yes' : 'No';
      if (finalDraft.business_name) map.businessName = finalDraft.business_name;

      const fileMap: Record<string, string> = {
        letter_of_intent: 'letterOfIntent',
        resume: 'resume',
        picture: 'picture',
        application_form: 'applicationForm',
        recommendation_letter: 'recommendationLetter',
        school_credentials: 'schoolCredentials',
        high_school_diploma: 'highSchoolDiploma',
        transcript: 'transcript',
        birth_certificate: 'birthCertificate',
        employment_certificate: 'employmentCertificate',
        nbi_clearance: 'nbiClearance',
        marriage_certificate: 'marriageCertificate',
        business_registration: 'businessRegistration',
        certificates: 'certificates',
      };

      Object.keys(fileMap).forEach(k => {
        if (finalDraft[k]) {
          const target = fileMap[k];
          if (['employment_certificate', 'certificates'].includes(k)) {
            (map as any)[target] = [finalDraft[k]];
          } else {
            (map as any)[target] = finalDraft[k];
          }
        }
      });

      setFormData(map);
      setDraftLoading(false);
    };

    loadDraft();
  }, []);

  // Prefill from URL params or localStorage
  useEffect(() => {
    try {
      const nameParam = searchParams.get('fullname') || searchParams.get('name');
      const emailParam = searchParams.get('email');
      const phoneParam = searchParams.get('phone');

      const stored = localStorage.getItem('user');
      const parsed = stored ? JSON.parse(stored) : null;
      const signupPhone = localStorage.getItem('signup_phone') || "";

      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || nameParam || (parsed && parsed.fullname) || "",
        email: prev.email || emailParam || (parsed && parsed.email) || "",
        phone: prev.phone || phoneParam || (parsed && parsed.phone) || signupPhone || "",
      }));
    } catch (e) {
      // ignore
    }
  }, [searchParams]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      const prevOverflow = document.body.style.overflow;
      const prevPaddingRight = document.body.style.paddingRight;

      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;

      return () => {
        document.body.style.overflow = prevOverflow || '';
        document.body.style.paddingRight = prevPaddingRight || '';
      };
    }
  }, [showModal]);

  // -------------------------
  // UI
  // -------------------------
  return (
    <main className="max-w-5xl mx-auto px-6 py-20 mt-10">
      <button
        onClick={() => router.push("/courses")}
        className="mb-8 px-4 py-2 rounded-md bg-blue-800 text-white hover:bg-blue-700"
      >
        ← Back to Programs
      </button>

      <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center">
        Apply for {programName}
      </h1>

      <form className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Personal Info */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border rounded-md px-4 py-2"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full border rounded-md px-4 py-2"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Phone Number"
            className="w-full border rounded-md px-4 py-2"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <div>
            <label className="font-semibold">Civil Status *</label>
            <select
              className="w-full border rounded-md px-4 py-2 mt-1"
              value={formData.maritalStatus}
              onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">Business Owner? *</label>
            <select
              className="w-full border rounded-md px-4 py-2 mt-1"
              value={formData.isBusinessOwner}
              onChange={(e) => setFormData({ ...formData, isBusinessOwner: e.target.value })}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          {formData.isBusinessOwner === "Yes" && (
            <input
              type="text"
              placeholder="Business Name"
              className="w-full border rounded-md px-4 py-2"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
            />
          )}
        </div>

        {/* Documents */}
        <div className="mt-6 mb-4">
          <h2 className="text-xl font-semibold text-blue-800">Upload Documents</h2>
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="font-semibold text-blue-900 mb-2">Requirements:</p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>All required documents must be submitted</li>
              <li>Accepted file formats: PDF, JPG, PNG</li>
              <li>Maximum file size: 50MB per file</li>
              {formData.maritalStatus === "Married" && <li>Marriage certificate required (Married status)</li>}
              {formData.isBusinessOwner === "Yes" && <li>Business Registration required (Business owner)</li>}
            </ul>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderFileInput("A. Letter of Intent", "letterOfIntent")}
          {renderFileInput("B. Résumé / CV", "resume")}
          {renderFileInput("C. Formal Picture", "picture", true, true)}
          {renderFileInput("D. ETEEAP Application Form", "applicationForm", true, false, 1, {
            url: "https://docs.google.com/forms/d/e/1FAIpQLScTWK7hH2lg8nYs6eVl7_Usj0R7opwjJsOMAPb3HF7qs-ZcBg/viewform?usp=pp_url",
            label: "Fill ETEEAP Form Online"
          })}
          {renderFileInput("E. Recommendation Letter", "recommendationLetter")}
          {renderFileInput("F. School Credentials", "schoolCredentials")}
          {renderFileInput("G. High School Diploma / PEPT", "highSchoolDiploma")}
          {renderFileInput("H. Transcript", "transcript")}
          {renderFileInput("I. Birth Certificate", "birthCertificate")}
          {formData.maritalStatus === "Married" && renderFileInput("J. Marriage Certificate", "marriageCertificate")}
          {renderFileInput("J. Certificate of Employment (4 max)", "employmentCertificate", true, false, 4)}
          {renderFileInput("K. NBI Clearance", "nbiClearance")}
          {formData.isBusinessOwner === "Yes" && renderFileInput("M. Business Registration", "businessRegistration")}
          {renderFileInput("L. Certificates (10 max)", "certificates", false, false, 10)}
        </div>

        <div className="mt-6 text-center">
          {(() => {
            const missing = validateRequired();
            if (missing.length > 0) {
              return (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                >
                  Save Progress
                </button>
              );
            }
            return (
              <button
                type="button"
                onClick={handleReview}
                disabled={draftLoading}
                className={`px-6 py-2 rounded-md bg-blue-800 text-white hover:bg-blue-700 ${draftLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {draftLoading ? 'Loading draft...' : 'Review Application'}
              </button>
            );
          })()}
        </div>
      </form>

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Review Your Application</h2>
            <div className="max-h-[70vh] overflow-y-auto space-y-4 border-t border-b py-4">
              <div>
                <h3 className="font-semibold text-blue-700">Personal Info</h3>
                <p><strong>Name:</strong> {formData.fullName}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Phone:</strong> {formData.phone}</p>
                <p><strong>Marital Status:</strong> {formData.maritalStatus}</p>
                {formData.isBusinessOwner === "Yes" && <p><strong>Business Name:</strong> {formData.businessName}</p>}
              </div>

              <div>
                <h3 className="font-semibold text-blue-700">Documents</h3>
                <table className="w-full text-left text-sm">
                  <tbody>
                    {(() => {
                      const docKeys = [
                        'letterOfIntent',
                        'resume',
                        'picture',
                        'applicationForm',
                        'recommendationLetter',
                        'schoolCredentials',
                        'highSchoolDiploma',
                        'transcript',
                        'birthCertificate',
                        'employmentCertificate',
                        'nbiClearance',
                        'marriageCertificate',
                        'businessRegistration',
                        'certificates',
                      ];

                      const labels: Record<string, string> = {
                        letterOfIntent: 'Letter of Intent',
                        resume: 'Résumé / CV',
                        picture: 'Formal Picture',
                        applicationForm: 'ETEEAP Application Form',
                        recommendationLetter: 'Recommendation Letter',
                        schoolCredentials: 'School Credentials',
                        highSchoolDiploma: 'High School Diploma / PEPT',
                        transcript: 'Transcript',
                        birthCertificate: 'Birth Certificate',
                        employmentCertificate: 'Certificate of Employment',
                        nbiClearance: 'NBI Clearance',
                        marriageCertificate: 'Marriage Certificate',
                        businessRegistration: 'Business Registration',
                        certificates: 'Certificates',
                      };

                      const nameFor = (v: File | string | null): string | null => {
                        if (!v) return null;
                        if (typeof v === 'string') return v.split('/').pop() || null;
                        return (v as File).name || null;
                      };

                      return docKeys.map((key) => {
                        const val = formData[key as keyof FormData];
                        if (!val) return null;

                        if (Array.isArray(val)) {
                          return (
                            <tr key={key}>
                              <td>
                                <strong>{labels[key] || key}:</strong>
                                <ul className="list-disc list-inside mt-1">
                                  {val.map((f, idx) => (
                                    <li key={idx}>{nameFor(f) || `File ${idx + 1}`}</li>
                                  ))}
                                </ul>
                              </td>
                            </tr>
                          );
                        }

                        const nm = nameFor(val as File | string);
                        return nm ? (
                          <tr key={key}>
                            <td><strong>{labels[key] || key}:</strong> {nm}</td>
                          </tr>
                        ) : null;
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button onClick={handleSaveDraft} className="px-6 py-2 rounded-md bg-gray-400 text-white hover:bg-gray-500">Save Draft</button>
              <button onClick={handleSubmit} disabled={draftLoading} className={`px-6 py-2 rounded-md bg-blue-800 text-white ${draftLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>{draftLoading ? 'Loading...' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-md text-white font-medium shadow-lg z-50 animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
          }`}
          onAnimationEnd={() => {
            if (toast.duration !== 0) {
              setTimeout(() => setToast(null), (toast.duration || 3000));
            }
          }}
        >
          {toast.message}
        </div>
      )}
    </main>
  );
}

export default ProgramDetails;
