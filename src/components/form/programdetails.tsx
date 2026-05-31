import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";

const eteeapFormId = [
  "1FAIpQLScTWK7hH2",
  "lg8nYs6eVl7_",
  "Usj0R7opwjJs",
  "OMAPb3HF7qs",
  "-ZcBg",
].join("");

const eteeapFormUrl = `https://docs.google.com/forms/d/e/${eteeapFormId}/viewform?usp=pp_url`;

function ProgramDetails({ programName }: { programName: string }) {
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

      <form className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div className="space-y-4">
          

          <div>
            <label className="font-semibold" htmlFor="isBusinessOwner">
              Business Owner? *
            </label>
            <select
              id="isBusinessOwner"
              name="isBusinessOwner"
              className="w-full border rounded-md px-4 py-2 mt-1"
              defaultValue="No"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Business Name"
            className="w-full border rounded-md px-4 py-2 cursor-pointer"
          />
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
              <li>Maximum file size: 50MB per file</li>
              <li>Marriage certificate required for married applicants</li>
              <li>Business registration required for business owners</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-dashed border-2 rounded-md p-4 text-center flex flex-col h-36 border-gray-300">
            <label className="font-medium block mb-2" htmlFor="letterOfIntent">
              A. Letter of Intent <span className="text-red-500">*</span>
            </label>
            <input
              id="letterOfIntent"
              name="letterOfIntent"
              type="file"
              accept=".pdf, .jpg, .jpeg, .png"
              className="mx-auto text-sm cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">Click to select file</p>
          </div>

          <div className="border-dashed border-2 rounded-md p-4 text-center flex flex-col h-36 border-gray-300">
            <label className="font-medium block mb-2" htmlFor="resume">
              B. Resume / CV <span className="text-red-500">*</span>
            </label>
            <input
              id="resume"
              name="resume"
              type="file"
              accept=".pdf, .jpg, .jpeg, .png"
              className="mx-auto text-sm cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">Click to select file</p>
          </div>

          <div className="border-dashed border-2 rounded-md p-4 text-center flex flex-col min-h-auto border-gray-300">
            <label className="font-medium block mb-2" htmlFor="picture">
              C. Formal Picture <span className="text-red-500">*</span>
            </label>
            <input
              id="picture"
              name="picture"
              type="file"
              accept="image/*"
              className="mx-auto text-sm cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">Click to select file</p>
          </div>

          <div className="border-dashed border-2 rounded-md p-4 text-center flex flex-col min-h-36 border-gray-300">
            <label className="font-medium block mb-2" htmlFor="applicationForm">
              D. ETEEAP Application Form{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="applicationForm"
              name="applicationForm"
              type="file"
              accept=".pdf, .jpg, .jpeg, .png"
              className="mx-auto text-sm cursor-pointer"
            />
            <p className="text-xs text-gray-600 mt-2">
              Submit a screenshot of your completed Google Form.
            </p>
            <Link
              href={eteeapFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Fill ETEEAP Form Online <FaExternalLinkAlt size={12} />
            </Link>
          </div>

          <div className="border-dashed border-2 rounded-md p-4 text-center flex flex-col h-36 border-gray-300">
            <label
              className="font-medium block mb-2"
              htmlFor="recommendationLetter"
            >
              E. Recommendation Letter <span className="text-red-500">*</span>
            </label>
            <input
              id="recommendationLetter"
              name="recommendationLetter"
              type="file"
              accept=".pdf, .jpg, .jpeg, .png"
              className="mx-auto text-sm cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">Click to select file</p>
          </div>

          <div className="border-dashed border-2 rounded-md p-4 text-center flex flex-col h-36 border-gray-300">
            <label
              className="font-medium block mb-2"
              htmlFor="schoolCredentials"
            >
              F. School Credentials <span className="text-red-500">*</span>
            </label>
            <input
              id="schoolCredentials"
              name="schoolCredentials"
              type="file"
              accept=".pdf, .jpg, .jpeg, .png"
              className="mx-auto text-sm cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">Click to select file</p>
          </div>

          <div className="border-dashed border-2 rounded-md p-4 text-center flex flex-col h-36 border-gray-300">
            <label
              className="font-medium block mb-2"
              htmlFor="highSchoolDiploma"
            >
              G. High School Diploma / PEPT{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="highSchoolDiploma"
              name="highSchoolDiploma"
              type="file"
              accept=".pdf, .jpg, .jpeg, .png"
              className="mx-auto text-sm cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">Click to select file</p>
          </div>

          <div className="border-dashed border-2 rounded-md p-4 text-center flex flex-col h-36 border-gray-300">
            <label className="font-medium block mb-2" htmlFor="transcript">
              H. Transcript <span className="text-red-500">*</span>
            </label>
            <input
              id="transcript"
              name="transcript"
              type="file"
              accept=".pdf, .jpg, .jpeg, .png"
              className="mx-auto text-sm cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">Click to select file</p>
          </div>

          <div className="border-dashed border-2 rounded-md p-4 text-center flex flex-col h-36 border-gray-300">
            <label
              className="font-medium block mb-2"
              htmlFor="birthCertificate"
            >
              I. Birth Certificate <span className="text-red-500">*</span>
            </label>
            <input
              id="birthCertificate"
              name="birthCertificate"
              type="file"
              accept=".pdf, .jpg, .jpeg, .png"
              className="mx-auto text-sm cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">Click to select file</p>
          </div>

          <div className="border-dashed border-2 rounded-md p-4 text-center flex flex-col h-36 border-gray-300">
            <label
              className="font-medium block mb-2"
              htmlFor="marriageCertificate"
            >
              J. Marriage Certificate
            </label>
            <input
              id="marriageCertificate"
              name="marriageCertificate"
              type="file"
              accept=".pdf, .jpg, .jpeg, .png"
              className="mx-auto text-sm cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">Click to select file</p>
          </div>

          <div className="border-dashed border-2 rounded-md p-4 text-center flex flex-col min-h-auto border-gray-300">
            <label
              className="font-medium block mb-2"
              htmlFor="employmentCertificate"
            >
              J. Certificate of Employment (4 max){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="employmentCertificate"
              name="employmentCertificate"
              type="file"
              multiple
              accept=".pdf, .jpg, .jpeg, .png"
              className="mx-auto text-sm cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">4 files maximum</p>
          </div>

          <div className="border-dashed border-2 rounded-md p-4 text-center flex flex-col h-36 border-gray-300">
            <label className="font-medium block mb-2" htmlFor="nbiClearance">
              K. NBI Clearance <span className="text-red-500">*</span>
            </label>
            <input
              id="nbiClearance"
              name="nbiClearance"
              type="file"
              accept=".pdf, .jpg, .jpeg, .png"
              className="mx-auto text-sm cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">Click to select file</p>
          </div>

          <div className="border-dashed border-2 rounded-md p-4 text-center flex flex-col h-36 border-gray-300">
            <label
              className="font-medium block mb-2"
              htmlFor="businessRegistration"
            >
              M. Business Registration
            </label>
            <input
              id="businessRegistration"
              name="businessRegistration"
              type="file"
              accept=".pdf, .jpg, .jpeg, .png"
              className="mx-auto text-sm cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">Click to select file</p>
          </div>

          <div className="border-dashed border-2 rounded-md p-4 text-center flex flex-col min-h-auto border-gray-300">
            <label className="font-medium block mb-2" htmlFor="certificates">
              L. Certificates (10 max)
            </label>
            <input
              id="certificates"
              name="certificates"
              type="file"
              multiple
              accept=".pdf, .jpg, .jpeg, .png"
              className="mx-auto text-sm cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">10 files maximum</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            className="px-6 py-2 rounded-md bg-blue-800 text-white hover:bg-blue-700"
          >
            Review Application
          </button>
        </div>
      </form>
    </main>
  );
}

export default ProgramDetails;
