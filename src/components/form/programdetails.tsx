"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaExternalLinkAlt } from "react-icons/fa";

const eteeapFormId = [
  "1FAIpQLScTWK7hH2",
  "lg8nYs6eVl7_",
  "Usj0R7opwjJs",
  "OMAPb3HF7qs",
  "-ZcBg",
].join("");

const eteeapFormUrl = `https://docs.google.com/forms/d/e/${eteeapFormId}/viewform?usp=pp_url`;
const DRAFT_KEY = "eteeap-application-draft";
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

async function filesToStoredFiles(files: FileList | null) {
  if (!files || files.length === 0) return [];
  return Promise.all(Array.from(files).map(fileToDataUrl));
}

type ProgramDetailsProps = {
  programName: string;
  applicantName: string;
  email: string;
  statusMarital: boolean;
};

function ProgramDetails({ programName, applicantName, email, statusMarital }: ProgramDetailsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isBus, setIsBus] = useState("");
  const [isBusStatus, setIsBusStatus] = useState(false);
  const router = useRouter();

  useEffect(() => { 
    if (isBus === "Yes") {
      return setIsBusStatus(true);
    } else {
      return setIsBusStatus(false);
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
      const files = await Promise.all(
        fileEntries.map(async (key) => {
          const input = formElement.elements.namedItem(key);
          const fileList =
            input instanceof HTMLInputElement ? input.files : null;

          return [key, await filesToStoredFiles(fileList)] as const;
        }),
      );

      const draft: DraftApplication = {
        applicantName,
        email,
        isBusinessOwner:
          (
            formElement.elements.namedItem(
              "isBusinessOwner",
            ) as HTMLSelectElement | null
          )?.value ?? "No",
        businessName:
          (
            formElement.elements.namedItem(
              "businessName",
            ) as HTMLInputElement | null
          )?.value ?? "",
        files: Object.fromEntries(files),
      };

      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
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
        className="inline-block mb-8 px-4 py-2 rounded-md bg-blue-800 text-white hover:bg-blue-700"
      >
        Back to Programs
      </Link>

      <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center">
        Apply for {programName}
      </h1>
      <p className="text-center text-sm text-gray-600 mb-6">
        Applicant: {applicantName || "Unnamed user"}
      </p>

      <form ref={formRef} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="font-semibold" htmlFor="isBusinessOwner">
              Business Owner? *
            </label>
            <select
              id="isBusinessOwner"
              name="isBusinessOwner"
              className="w-full border rounded-md px-4 py-2 mt-1 cursor-pointer"
              defaultValue="No"
              onChange={(e) => {setIsBus(e.target.value);}}
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
          <h2 className="text-xl font-semibold text-blue-800">
            Upload Documents
          </h2>
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="font-semibold text-blue-900 mb-2">Requirements:</p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>All required documents must be submitted</li>
              <li>Accepted file formats: PDF, JPG, PNG</li>
              <li>Maximum file size: 5MB per file</li>
              <li>Marriage certificate required for married applicants</li>
              <li>Business registration required for business owners</li>
            </ul>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: "letterOfIntent", multiple: false, note: "Click to select file", show: true },
            { id: "resume", multiple: false, note: "Click to select file", show: true },
            { id: "picture", multiple: false, note: "Click to select file", accept: "image/*", show: true },
            { id: "applicationForm", multiple: false, note: "Submit a screenshot of your completed Google Form.", showForm: true, show: true },
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
            <div
              key={field.id}
              style={{ display: field.show ? "block" : "none" }}
              className="border-dashed border-2 rounded-md p-4 text-center flex flex-col h-36 border-gray-300 cursor-pointer"
            >
              <label className="font-medium block mb-2" htmlFor={field.id}>
                {fileLabels[field.id]}
                {["letterOfIntent", "resume", "picture", "applicationForm", "recommendationLetter", "schoolCredentials", "highSchoolDiploma", "transcript", "birthCertificate", "nbiClearance"].includes(field.id) ? (
                  <span className="text-red-500"> *</span>
                ) : null}
                {field.id === "employmentCertificate" ? " (4 max)" : null}
                {field.id === "certificates" ? " (10 max)" : null}
              </label>
              <input
                id={field.id}
                name={field.id}
                type="file"
                multiple={field.multiple}
                accept={field.accept ?? ".pdf, .jpg, .jpeg, .png"}
                className="mx-auto text-sm cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-2">{field.note}</p>
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
              
            </div>
          ))}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={saveDraft}
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
