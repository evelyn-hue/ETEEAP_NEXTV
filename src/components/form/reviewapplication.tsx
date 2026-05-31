"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type FileValue = File | Blob | string;

type FormDataType = {
  fullName?: string;
  email?: string;
  phone?: string;
  maritalStatus?: string;
  isBusinessOwner?: string;
  businessName?: string;

  letterOfIntent?: FileValue | FileValue[];
  resume?: FileValue | FileValue[];
  picture?: FileValue | FileValue[];
  applicationForm?: FileValue | FileValue[];
  recommendationLetter?: FileValue | FileValue[];
  schoolCredentials?: FileValue | FileValue[];
  highSchoolDiploma?: FileValue | FileValue[];
  transcript?: FileValue | FileValue[];
  birthCertificate?: FileValue | FileValue[];
  employmentCertificate?: FileValue | FileValue[];
  nbiClearance?: FileValue | FileValue[];
  marriageCertificate?: FileValue | FileValue[];
  businessRegistration?: FileValue | FileValue[];
  certificates?: FileValue | FileValue[];

  [key: string]: any;
};

type PopupType = "success" | "error" | "confirm" | "";

type PopupState = {
  open: boolean;
  type: PopupType;
  title: string;
  message: string;
  onConfirm?: (() => void | Promise<void>) | null;
};

const nameFor = (v: FileValue): string | null => {
  if (!v) return null;

  if (typeof v === "string") {
    return v.split("/").pop() || null;
  }

  if ("name" in v) {
    return v.name;
  }

  return null;
};

const labels: Record<string, string> = {
  letterOfIntent: "Letter of Intent",
  resume: "Résumé / CV",
  picture: "Formal Picture",
  applicationForm: "ETEEAP Application Form",
  recommendationLetter: "Recommendation Letter",
  schoolCredentials: "School Credentials",
  highSchoolDiploma: "High School Diploma / PEPT",
  transcript: "Transcript",
  birthCertificate: "Birth Certificate",
  employmentCertificate: "Certificate of Employment",
  nbiClearance: "NBI Clearance",
  marriageCertificate: "Marriage Certificate",
  businessRegistration: "Business Registration",
  certificates: "Certificates",
};

export default function ReviewApplication() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [popup, setPopup] = useState<PopupState>({
    open: false,
    type: "",
    title: "",
    message: "",
    onConfirm: null,
  });

  const [formData, setFormData] =
    useState<FormDataType>({});

  const [draftId, setDraftId] = useState<
    string | null
  >(null);

  const [programName, setProgramName] =
    useState("");

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    const storedData = JSON.parse(
      sessionStorage.getItem(
        "reviewApplication"
      ) || "{}"
    );

    setFormData(storedData.formData || {});
    setDraftId(storedData.draftId || null);
    setProgramName(
      storedData.programName || ""
    );
  }, []);

  const showPopup = ({
    type,
    title,
    message,
    onConfirm = null,
  }: PopupState) => {
    setPopup({
      open: true,
      type,
      title,
      message,
      onConfirm,
    });
  };

  const closePopup = () => {
    setPopup({
      open: false,
      type: "",
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  const buildFormData = (
    includeDraftId = true
  ) => {
    const data = new FormData();

    data.append(
      "program_name",
      programName || ""
    );

    data.append(
      "full_name",
      formData.fullName || ""
    );

    data.append(
      "email",
      formData.email || ""
    );

    data.append(
      "phone",
      formData.phone || ""
    );

    data.append(
      "marital_status",
      formData.maritalStatus || ""
    );

    data.append(
      "is_business_owner",
      formData.isBusinessOwner || ""
    );

    data.append(
      "business_name",
      formData.businessName || ""
    );

    const fileFields: Record<string, string> = {
      letterOfIntent: "letter_of_intent",
      resume: "resume",
      picture: "picture",
      applicationForm: "application_form",
      recommendationLetter:
        "recommendation_letter",
      schoolCredentials:
        "school_credentials",
      highSchoolDiploma:
        "high_school_diploma",
      transcript: "transcript",
      birthCertificate:
        "birth_certificate",
      employmentCertificate:
        "employment_certificate",
      nbiClearance: "nbi_clearance",
      marriageCertificate:
        "marriage_certificate",
      businessRegistration:
        "business_registration",
      certificates: "certificates",
    };

    Object.keys(fileFields).forEach((key) => {
      const val = formData[key];

      if (!val) return;

      if (Array.isArray(val)) {
        val.forEach((f) => {
          if (
            f instanceof File ||
            f instanceof Blob
          ) {
            data.append(
              fileFields[key],
              f
            );
          }
        });
      } else {
        if (
          val instanceof File ||
          val instanceof Blob
        ) {
          data.append(
            fileFields[key],
            val
          );
        }
      }
    });

    if (includeDraftId && draftId) {
      data.append("draft_id", draftId);
    }

    return data;
  };

  const submitApplication = async () => {
    setLoading(true);

    try {
      const storedUser =
        localStorage.getItem("user");

      const userId = storedUser
        ? JSON.parse(storedUser).id
        : null;

      const data = buildFormData(true);

      const res = await fetch(
        "http://localhost:5000/submit_application",
        {
          method: "POST",
          body: data,
          credentials: "include",
          headers: userId
            ? {
                "x-user-id":
                  String(userId),
              }
            : {},
        }
      );

      const result = await res.json();

      if (!res.ok) {
        showPopup({
          open: true,
          type: "error",
          title: "Error",
          message:
            result.message ||
            "Failed to submit application",
        });

        setLoading(false);
        return;
      }

      showPopup({
        open: true,
        type: "success",
        title: "Success",
        message:
          "Application submitted successfully!",
        onConfirm: () =>
          router.push("/programs"),
      });
    } catch (error) {
      showPopup({
        open: true,
        type: "error",
        title: "Submission Failed",
        message:
          "Please try again.",
      });
    }

    setLoading(false);
  };

  const handleSubmit = () => {
    if (!formData.phone) {
      showPopup({
        open: true,
        type: "error",
        title: "Missing Phone",
        message:
          "Phone number is required.",
      });

      return;
    }

    if (!formData.picture) {
      showPopup({
        open: true,
        type: "error",
        title: "Missing Picture",
        message:
          "Formal picture is required.",
      });

      return;
    }

    showPopup({
      open: true,
      type: "confirm",
      title: "Submit Application?",
      message:
        "Are you sure you want to submit this application?",
      onConfirm: submitApplication,
    });
  };

  const handleSaveDraft = async () => {
    setLoading(true);

    try {
      const data = buildFormData(true);

      const res = await fetch(
        "http://localhost:5000/submit_application/draft",
        {
          method: "POST",
          body: data,
          credentials: "include",
        }
      );

      const result = await res.json();

      if (!res.ok) {
        showPopup({
          open: true,
          type: "error",
          title: "Error",
          message:
            result.message ||
            "Failed to save draft",
        });

        setLoading(false);
        return;
      }

      showPopup({
        open: true,
        type: "success",
        title: "Draft Saved",
        message:
          "Draft saved successfully!",
        onConfirm: () =>
          router.push(
            "/program-details"
          ),
      });
    } catch (error) {
      showPopup({
        open: true,
        type: "error",
        title: "Save Failed",
        message:
          "Failed to save draft",
      });
    }

    setLoading(false);
  };

  const displayedDocs =
    Object.keys(labels);

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
            <strong>Name:</strong>{" "}
            {formData.fullName}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {formData.email}
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {formData.phone}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-blue-700">
            Documents
          </h2>

          <table className="w-full text-sm mt-2">
            <tbody>
              {displayedDocs.map((key) => {
                const val =
                  formData[key];

                if (!val)
                  return null;

                if (
                  Array.isArray(val)
                ) {
                  return (
                    <tr key={key}>
                      <td className="py-2">
                        <strong>
                          {
                            labels[
                              key
                            ]
                          }
                          :
                        </strong>

                        <ul className="list-disc list-inside mt-1">
                          {val.map(
                            (
                              f,
                              idx
                            ) => (
                              <li
                                key={
                                  idx
                                }
                              >
                                {nameFor(
                                  f
                                ) ||
                                  `File ${
                                    idx +
                                    1
                                  }`}
                              </li>
                            )
                          )}
                        </ul>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={key}>
                    <td className="py-2">
                      <strong>
                        {
                          labels[
                            key
                          ]
                        }
                        :
                      </strong>{" "}
                      {nameFor(
                        val
                      ) || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={
              handleSaveDraft
            }
            disabled={loading}
            className="px-6 py-2 rounded-md bg-blue-700 text-white"
          >
            {loading
              ? "Saving..."
              : "Save Draft"}
          </button>

          <button
            onClick={
              handleSubmit
            }
            disabled={loading}
            className="px-6 py-2 rounded-md bg-blue-800 text-white"
          >
            {loading
              ? "Submitting..."
              : "Submit"}
          </button>
        </div>
      </div>

      {/* Popup */}
      {popup.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {popup.title}
            </h2>

            <p>{popup.message}</p>

            <div className="flex justify-end gap-3 mt-6">
              {popup.type ===
                "confirm" && (
                <button
                  onClick={
                    closePopup
                  }
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={async () => {
                  if (
                    popup.onConfirm
                  ) {
                    await popup.onConfirm();
                  }

                  closePopup();
                }}
                className="px-4 py-2 bg-blue-700 text-white rounded"
              >
                {popup.type ===
                "confirm"
                  ? "Confirm"
                  : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}