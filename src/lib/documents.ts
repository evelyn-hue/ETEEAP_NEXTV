/**
 * Single source of truth for all ETEEAP application documents.
 * Harmonizes definitions across:
 * - src/components/form/programdetails.tsx
 * - src/components/form/reviewapplication.tsx
 * - src/components/form/applicationstatus.tsx
 * - src/components/admin/application.tsx
 * - src/app/services/supabase/retrieve_data/route.ts
 * - src/app/services/supabase/form/my-application/route.ts
 */

export type DocumentDefinition = {
  key: string;
  label: string;
  shortLabel: string;
  required: boolean;
  conditionalNote?: string;
  maxFiles: number;
  note?: string;
};

export const ALL_DOCUMENTS: DocumentDefinition[] = [
  {
    key: "letterOfIntent",
    label: "Letter of Intent",
    shortLabel: "Letter of Intent",
    required: true,
    maxFiles: 1,
    note: "Addressed to the ETEEAP Director",
  },
  {
    key: "resume",
    label: "Comprehensive Curriculum Vitae / Resume",
    shortLabel: "Resume / CV",
    required: true,
    maxFiles: 1,
    note: "Detailed resume highlighting relevant work experience",
  },
  {
    key: "picture",
    label: "Formal 2x2 Picture",
    shortLabel: "Formal Picture",
    required: true,
    maxFiles: 1,
    note: "Recent 2x2 photo in white background",
  },
  {
    key: "applicationForm",
    label: "ETEEAP Application Form",
    shortLabel: "Application Form",
    required: true,
    maxFiles: 1,
    note: "Completed official ETEEAP Google Form",
  },
  {
    key: "recommendationLetter",
    label: "Recommendation Letter",
    shortLabel: "Recommendation Letter",
    required: true,
    maxFiles: 1,
    note: "From current or previous employer / supervisor",
  },
  {
    key: "schoolCredentials",
    label: "School Credentials",
    shortLabel: "School Credentials",
    required: true,
    maxFiles: 1,
    note: "Honorable dismissal / Form 137 / TOR from previous schools",
  },
  {
    key: "highSchoolDiploma",
    label: "High School Diploma / PEPT / ALS Certificate",
    shortLabel: "High School Diploma",
    required: true,
    maxFiles: 1,
    note: "Proving secondary education completion",
  },
  {
    key: "transcript",
    label: "Official Transcript of Records (TOR)",
    shortLabel: "Transcript",
    required: true,
    maxFiles: 1,
    note: "If college units were completed previously",
  },
  {
    key: "birthCertificate",
    label: "PSA Birth Certificate",
    shortLabel: "Birth Certificate",
    required: true,
    maxFiles: 1,
    note: "PSA authenticated copy",
  },
  {
    key: "employmentCertificate",
    label: "Certificate of Employment (with Job Description)",
    shortLabel: "Certificate of Employment",
    required: true,
    maxFiles: 4,
    note: "Certifying at least 5 years of relevant industry experience (up to 4 files)",
  },
  {
    key: "nbiClearance",
    label: "NBI Clearance",
    shortLabel: "NBI Clearance",
    required: true,
    maxFiles: 1,
    note: "Valid government clearance",
  },
  {
    key: "marriageCertificate",
    label: "PSA Marriage Certificate",
    shortLabel: "Marriage Certificate",
    required: false,
    conditionalNote: "Required for married female applicants",
    maxFiles: 1,
  },
  {
    key: "businessRegistration",
    label: "Business Registration / Permits (DTI, SEC, Mayor's Permit)",
    shortLabel: "Business Registration",
    required: false,
    conditionalNote: "Required if applying as a business owner",
    maxFiles: 1,
  },
  {
    key: "certificates",
    label: "Certificates of Training / Seminars / Awards",
    shortLabel: "Certificates",
    required: false,
    maxFiles: 10,
    note: "Professional seminars, certifications, and awards (up to 10 files)",
  },
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

export const DOCUMENT_KEY_TO_LABEL: Record<string, string> = Object.fromEntries(
  ALL_DOCUMENTS.map((doc) => [doc.key, doc.label])
);

export const DOCUMENT_KEY_TO_SHORT_LABEL: Record<string, string> = Object.fromEntries(
  ALL_DOCUMENTS.map((doc) => [doc.key, doc.shortLabel])
);

export const DOCUMENT_MAX_FILES: Record<string, number> = Object.fromEntries(
  ALL_DOCUMENTS.map((doc) => [doc.key, doc.maxFiles])
);

export function isDocumentRequired(
  key: string,
  options?: { isMarried?: boolean; isBusinessOwner?: boolean }
): boolean {
  if (key === "marriageCertificate") {
    return Boolean(options?.isMarried);
  }
  if (key === "businessRegistration") {
    return Boolean(options?.isBusinessOwner);
  }
  const found = ALL_DOCUMENTS.find((d) => d.key === key);
  return found ? found.required : false;
}

export function getRequiredDocumentKeys(options?: {
  isMarried?: boolean;
  isBusinessOwner?: boolean;
}): string[] {
  return ALL_DOCUMENTS.filter((doc) => isDocumentRequired(doc.key, options)).map(
    (doc) => doc.key
  );
}
