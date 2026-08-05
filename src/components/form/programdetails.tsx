"use client";

import Link from "next/link";
import { ChangeEvent, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FaExternalLinkAlt } from "react-icons/fa";
import Reveal from "@/components/shared/Reveal";
import SectionHeading from "@/components/shared/SectionHeading";
import SectionEyebrow from "@/components/shared/SectionEyebrow";

const eteeapFormId = [
  "1FAIpQLScTWK7hH2",
  "lg8nYs6eVl7_",
  "Usj0R7opwjJs",
  "OMAPb3HF7qs",
  "-ZcBg",
].join("");

const eteeapFormUrl = `https://docs.google.com/forms/d/e/${eteeapFormId}/viewform?usp=pp_url`;
const DRAFTS_KEY = "eteeap-application-drafts";
const REVIEW_ROUTE = "/form/reviewapplication";

type StoredFile = {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

type DraftApplication = {
  applicantName: string;
  email: string;
  isBusinessOwner: string;
  businessName: string;
  programName: string;
  files: Record<string, StoredFile[]>;
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

function fileToDataUrl(file: File) {
  return new Promise<StoredFile>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: String(reader.result ?? ""),
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function filesToStoredFiles(files: FileList | File[] | null) {
  if (!files || files.length === 0) return [];
  const fileArray = Array.isArray(files) ? files : Array.from(files);
  return Promise.all(fileArray.map(fileToDataUrl));
}

type ProgramDetailsProps = {
  programName: string;
  applicantName: string;
  email: string;
  statusMarital: boolean;
  isBusinessOwner?: string;
};

function ProgramDetails({ programName, applicantName, email, statusMarital, isBusinessOwner }: ProgramDetailsProps) {
  const reduced = useReducedMotion();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isBus, setIsBus] = useState(isBusinessOwner ?? "No");
  const [isBusStatus, setIsBusStatus] = useState((isBusinessOwner ?? "No") === "Yes");
  const [savedFiles, setSavedFiles] = useState<Record<string, StoredFile[]>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File[]>>({});
  const [, setFileCounts] = useState<Record<string, number>>({
    employmentCertificate: 0,
    certificates: 0,
  });
  const router = useRouter();

  const maxFileCount: Record<string, number> = {
    employmentCertificate: 4,
    certificates: 10,
  };

  const updateFileCount = (fieldId: string, savedLength: number, selectedLength: number) => {
    if (!(fieldId in maxFileCount)) return;
    setFileCounts((prev) => ({ ...prev, [fieldId]: savedLength + selectedLength }));
  };

  const handleRemoveSavedFile = (fieldId: string, fileIndex: number) => {
    setSavedFiles((prev) => {
      const fieldFiles = prev[fieldId] ?? [];
      const updatedFiles = fieldFiles.filter((_, index) => index !== fileIndex);
      const next = { ...prev };
      if (updatedFiles.length > 0) {
        next[fieldId] = updatedFiles;
      } else {
        delete next[fieldId];
      }
      updateFileCount(fieldId, updatedFiles.length, selectedFiles[fieldId]?.length ?? 0);
      return next;
    });
  };

  const handleRemoveSelectedFile = (fieldId: string, fileIndex: number) => {
    setSelectedFiles((prev) => {
      const fieldFiles = prev[fieldId] ?? [];
      const updatedFiles = fieldFiles.filter((_, index) => index !== fileIndex);
      const next = { ...prev };
      if (updatedFiles.length > 0) {
        next[fieldId] = updatedFiles;
      } else {
        delete next[fieldId];
      }
      updateFileCount(fieldId, savedFiles[fieldId]?.length ?? 0, updatedFiles.length);
      return next;
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = event.target;
    if (!name || !files) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        setError(`"${file.name}" is not an accepted file type. Please upload PDF, JPG, or PNG files only.`);
        (event.target as HTMLInputElement).value = "";
        return;
      }
if (file.size > 5 * 1024 * 1024) {
    setError(`"${file.name}" exceeds the 5MB file size limit.`);
        (event.target as HTMLInputElement).value = "";
        return;
      }
    }

    const limit = maxFileCount[name as keyof typeof maxFileCount];
    const currentFiles = selectedFiles[name] ?? [];
    const existingSavedFiles = savedFiles[name] ?? [];
    const combinedCount = existingSavedFiles.length + currentFiles.length + fileArray.length;
    const combinedFiles = [...currentFiles, ...fileArray];

    if (limit) {
      if (combinedCount > limit) {
        const allowedNewFiles = combinedFiles.slice(0, Math.max(0, limit - existingSavedFiles.length));
        setSelectedFiles((prev) => ({ ...prev, [name]: allowedNewFiles }));
        setFileCounts((prev) => ({ ...prev, [name]: existingSavedFiles.length + allowedNewFiles.length }));
        setError(`${fileLabels[name as keyof typeof fileLabels] ?? name} supports up to ${limit} files.`);
        const target = event.target as HTMLInputElement;
        target.value = "";
        return;
      }
      setSelectedFiles((prev) => ({ ...prev, [name]: combinedFiles }));
      updateFileCount(name, existingSavedFiles.length, combinedFiles.length);
      setError("");
      const target = event.target as HTMLInputElement;
      target.value = "";
      return;
    }

    setSelectedFiles((prev) => ({ ...prev, [name]: fileArray.slice(0, 1) }));
    setSavedFiles((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (name in maxFileCount) {
      setFileCounts((prev) => ({ ...prev, [name]: fileArray.length }));
    }
    setError("");
    const target = event.target as HTMLInputElement;
    target.value = "";
  };

  // Load saved draft on component mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(DRAFTS_KEY);
    if (!raw) return;
    try {
      const drafts: DraftApplication[] = JSON.parse(raw);
      const draft = drafts.find((d) => d.programName === programName);
      if (!draft) return;
      setSavedFiles(draft.files ?? {});
      setFileCounts({
        employmentCertificate: draft.files?.employmentCertificate?.length ?? 0,
        certificates: draft.files?.certificates?.length ?? 0,
      });
      if (draft.businessName) {
        const businessInput = document.querySelector('input[name="businessName"]') as HTMLInputElement;
        if (businessInput) businessInput.value = draft.businessName;
      }
      if (draft.isBusinessOwner) {
        setIsBus(draft.isBusinessOwner);
      }
    } catch {
      // Silently fail if draft parsing fails
    }
  }, [programName]);

  useEffect(() => {
    if (isBus === "Yes") {
      setIsBusStatus(true);
    } else {
      setIsBusStatus(false);
    }
  }, [isBus]);

  const formRef = useRef<HTMLFormElement>(null);

  const saveDraft = async () => {
    const formElement = formRef.current;
    if (!formElement) return;

    setError("");
    setIsSaving(true);

    try {
      const fileEntries = Object.keys(fileLabels);
      const invalidSelection = fileEntries.find((key) => {
        const limit = maxFileCount[key as keyof typeof maxFileCount];
        const selected = selectedFiles[key] ?? [];
        const saved = savedFiles[key]?.length ?? 0;
        return limit !== undefined && selected.length + saved > limit;
      });

      if (invalidSelection) {
        setError(`${fileLabels[invalidSelection as keyof typeof fileLabels] ?? invalidSelection} can only have up to ${maxFileCount[invalidSelection]} files.`);
        setIsSaving(false);
        return;
      }

      const files = await Promise.all(
        fileEntries.map(async (key) => {
          const input = formElement.elements.namedItem(key);
          const fileList = input instanceof HTMLInputElement ? input.files : null;
          const domFiles = fileList ? Array.from(fileList) : [];
          const existingStored = savedFiles[key] ?? [];
          const selected = selectedFiles[key] ?? domFiles;
          const limit = maxFileCount[key as keyof typeof maxFileCount];
          const selectedStoredFiles = await filesToStoredFiles(selected);
          const combinedStoredFiles = limit
            ? [...existingStored, ...selectedStoredFiles].slice(0, limit)
            : selectedStoredFiles.length > 0
              ? selectedStoredFiles
              : existingStored;

          return [key, combinedStoredFiles.length > 0 ? combinedStoredFiles : existingStored] as const;
        }),
      );

      const draft: DraftApplication = {
        applicantName,
        email,
        programName,
        isBusinessOwner:
          (
            formElement.elements.namedItem("isBusinessOwner") as HTMLSelectElement | null
          )?.value ?? "No",
        businessName:
          (
            formElement.elements.namedItem("businessName") as HTMLInputElement | null
          )?.value ?? "",
        files: Object.fromEntries(files),
      };

      const existing = localStorage.getItem(DRAFTS_KEY);
      const drafts: DraftApplication[] = existing ? JSON.parse(existing) : [];
      const idx = drafts.findIndex((d) => d.programName === draft.programName);
      if (idx >= 0) {
        drafts[idx] = draft;
      } else {
        drafts.push(draft);
      }
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
      localStorage.setItem("selected-application", JSON.stringify(draft));
      router.push(REVIEW_ROUTE);
    } catch (draftError) {
      setError("Unable to save the draft files. Try again with smaller files.");
      console.error(draftError);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-20 mt-10">
      <Link
        href="/courses"
        className="inline-block mb-8 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
      >
        Back to Programs
      </Link>

      <SectionEyebrow className="text-center">Application</SectionEyebrow>
      <SectionHeading>Apply for {programName}</SectionHeading>
      <p className="text-center text-sm text-gray-600 mb-6">
        Applicant: {applicantName || "Unnamed user"}
      </p>

      <form ref={formRef} onSubmit={(event) => { event.preventDefault(); saveDraft(); }} className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="font-semibold" htmlFor="isBusinessOwner">
              Business Owner? *
            </label>
            <select
              id="isBusinessOwner"
              name="isBusinessOwner"
              className="w-full border rounded-md px-4 py-2 mt-1 cursor-pointer"
              value={isBus}
              onChange={(e) => {
                setIsBus(e.target.value);
              }}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          {isBusStatus ? (
            <input
              type="text"
              name="businessName"
              placeholder="Business Name"
              className="w-full border rounded-md px-4 py-2"
            />
          ) : null}
        </div>

        <div className="mt-6 mb-4">
          <SectionEyebrow>Documents</SectionEyebrow>
          <h2 className="text-xl font-semibold text-blue-800">
            Upload Documents
          </h2>
          <Reveal>
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="font-semibold text-blue-900 mb-2">Requirements:</p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>All required documents must be submitted</li>
                <li>Accepted file formats: PDF, JPG, PNG</li>
                <li>Maximum file size: 5MB per file</li>
                <li>Before uploading documents, rename them so the admin can review them properly.</li>
                {statusMarital && <li>Marriage certificate required (you are married)</li>}
                {!statusMarital && <li>Marriage certificate NOT required (you are not married)</li>}
                {isBusStatus && <li>Business registration required (you are a business owner)</li>}
                {!isBusStatus && <li>Business registration NOT required (you are not a business owner)</li>}
              </ul>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: "letterOfIntent", multiple: false, note: "Click to select file", show: true },
            { id: "resume", multiple: false, note: "Click to select file", show: true },
            { id: "picture", multiple: false, note: "Click to select file", accept: "image/*", show: true },
            { id: "applicationForm", multiple: false, note: "Submit a screenshot of your completed Google Form.", showForm: false, show: true },
            { id: "recommendationLetter", multiple: false, note: "Click to select file", show: true },
            { id: "schoolCredentials", multiple: false, note: "Click to select file", show: true },
            { id: "highSchoolDiploma", multiple: false, note: "Click to select file", show: true },
            { id: "transcript", multiple: false, note: "Click to select file", show: true },
            { id: "birthCertificate", multiple: false, note: "Click to select file", show: true },
            { id: "marriageCertificate", multiple: false, note: "Click to select file", show: statusMarital },
            { id: "employmentCertificate", multiple: true, note: "4 files maximum", show: true },
            { id: "nbiClearance", multiple: false, note: "Click to select file", show: true },
            { id: "businessRegistration", multiple: false, note: "Click to select file", show: isBusStatus },
            { id: "certificates", multiple: true, note: "10 files maximum", show: true },
          ].map((field) => (
            <motion.div
              key={field.id}
              style={{ display: field.show ? "block" : "none" }}
              whileHover={reduced ? undefined : { y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
              className="border-dashed border-2 rounded-md p-4 text-left flex flex-col border-gray-300 bg-white"
            >
              <label className="font-medium block mb-2" htmlFor={field.id}>
                {fileLabels[field.id]}
                {["letterOfIntent", "resume", "picture", "applicationForm", "recommendationLetter", "schoolCredentials", "highSchoolDiploma", "transcript", "birthCertificate", "nbiClearance"].includes(field.id) ? (
                  <span className="text-red-500"> *</span>
                ) : null}
                {field.id === "employmentCertificate" ? " (4 max)" : null}
                {field.id === "certificates" ? " (10 max)" : null}
                {savedFiles[field.id]?.length ? <span className="ml-2 text-xs text-green-600 font-semibold">(✓ Saved)</span> : null}
              </label>
              {field.id in maxFileCount ? (
                <>
                  <input
                    id={field.id}
                    name={field.id}
                    type="file"
                    multiple
                    accept={field.accept ?? ".pdf, .jpg, .jpeg, .png"}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById(field.id)?.click()}
                    className="mx-auto rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
                  >
                    Add file(s)
                  </button>
                  <p className="text-xs text-slate-500 mt-2">{(savedFiles[field.id]?.length ?? 0) + (selectedFiles[field.id]?.length ?? 0)}/{maxFileCount[field.id]} selected</p>
                </>
              ) : (
                <>
                  {((savedFiles[field.id]?.length ?? 0) + (selectedFiles[field.id]?.length ?? 0)) === 0 ? (
                    <>
                      <input
                        id={field.id}
                        name={field.id}
                        type="file"
                        multiple={field.multiple}
                        accept={field.accept ?? ".pdf, .jpg, .jpeg, .png"}
                        onChange={handleFileChange}
                        className="mx-auto text-sm cursor-pointer"
                      />
                      <p className="text-xs text-gray-400 mt-2">{field.note}</p>
                    </>
                  ) : null}
                </>
              )}
              {(savedFiles[field.id]?.length ?? 0) > 0 || (selectedFiles[field.id]?.length ?? 0) > 0 ? (
                <div className="mt-3 space-y-2 text-left">
                  {(savedFiles[field.id] ?? []).map((file, index) => (
                    <div key={`saved-${field.id}-${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="truncate block">{file.name}</span>
                        <span className="text-xs text-slate-500">Saved</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSavedFile(field.id, index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {(selectedFiles[field.id] ?? []).map((file, index) => (
                    <div key={`selected-${field.id}-${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="truncate block">{file.name}</span>
                        <span className="text-xs text-slate-500">New</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedFile(field.id, index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              {field.showForm ? (
                <Link
                  href={eteeapFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Fill ETEEAP Form Online <FaExternalLinkAlt size={12} />
                </Link>
              ) : null}
            </motion.div>
          ))}
        </div>
        </Reveal>

        <div className="mt-6 text-center">
          <Link
            href={eteeapFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Fill ETEEAP Form Online <FaExternalLinkAlt size={12} />
          </Link>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 text-center">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 rounded-md bg-blue-800 text-white hover:bg-blue-700 cursor-pointer disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Review Application"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default ProgramDetails;
