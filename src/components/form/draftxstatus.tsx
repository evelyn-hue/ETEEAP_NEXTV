"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Fetch_to } from "@/utilities";
import api_links from "@/config/api_link.json";

type HeaderProps = {
  email?: string;
  phone?: string;
}

type ManagerUserProps = {
  id?: string;
  created_at?: string;
  isBusinessOwner?: string;
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
  email?: string;
  applicantName?: string;
  businessName?: string | null;
  program?: string | null;
  form_status?: string;
}

function formatCreatedAt(createdAt?: string) {
  if (!createdAt) return "-";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;

  return date.toLocaleString();
}

function getStatusBadgeClass(status?: string) {
  const normalizedStatus = status?.toLowerCase().trim();

  switch (normalizedStatus) {
    case "draft":
      return "bg-gray-100 text-gray-700";
    case "under review":
      return "bg-blue-100 text-blue-800";
    case "success":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function DraftXStatus({ email, phone } : HeaderProps) {
  const [data, setData] = useState<ManagerUserProps[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const handleOpen = (form: ManagerUserProps) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("selected-application", JSON.stringify(form));
    }

    router.push("/form/reviewapplication");
  };

  useEffect(() => {
    const Fetch_data = async () => {
      const response = await Fetch_to(api_links.retrieve_data, {
        email: email,
        page,
        limit: 10,
      });

      if (response.success) {
        setData(response.data.message ?? []);
        setTotalPages(response.data.pagination?.totalPages ?? 1);
      } else {
        console.log(response.message || "Something Went Wrong");
      }
      
    };
    Fetch_data();
  }, [email, page]);



  return (
    <main className="max-w-6xl mx-auto px-6 py-20 mt-10">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">
        My Applications
      </h1>

      <p className="text-gray-600 mb-8">
        Drafts and application status overview
      </p>

      <div className="grid gap-6">
        {data && data.length > 0 ? (
          data.map((form, index) => (
            <div key={index} className="bg-white shadow-lg rounded-xl p-6 border">
            <div className="flex justify-between items-start gap-4">
              <h2 className="text-xl font-semibold text-blue-700">
                Bachelor of Arts in English Language Studies
              </h2>

              <span
                className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(
                  form.form_status,
                )}`}
              >
                {form.form_status}
              </span>
            </div>

            <div className="mt-3 text-gray-700">
              <p>
                <strong>Name:</strong> {form.applicantName}
              </p>
              <p>
                <strong>Email:</strong> {form.email}
              </p>
              <p>
                <strong>Phone:</strong> {phone}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Saved: {formatCreatedAt(form.created_at)}
              </p>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => handleOpen(form)}
                className="px-5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 cursor-pointer"
              >
                Open
              </button>

              <button
                type="button"
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
          ))
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(current - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-md border bg-white text-gray-700 disabled:opacity-50"
        >
          &lt;
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => setPage(pageNumber)}
            className={`px-4 py-2 rounded-md border ${
              pageNumber === page
                ? "bg-blue-700 text-white border-blue-700"
                : "bg-white text-gray-700"
            }`}
          >
            {pageNumber}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 rounded-md border bg-white text-gray-700 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
    </main>
  );
}
