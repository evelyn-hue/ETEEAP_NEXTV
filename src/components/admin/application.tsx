import { Check, Eye, Trash2, Upload, XCircle } from "lucide-react";

export default function Application() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">
            Applications
          </h1>
          <p className="text-gray-600">
            Review submitted ETEEAP applications and document status.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
          <Upload size={18} />
          Export
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
          <input
            type="text"
            placeholder="Search applicant..."
            className="border px-3 py-2 rounded-lg shadow-sm"
          />
          <select className="border px-3 py-2 rounded-lg shadow-sm">
            <option>All Status</option>
            <option>Pending</option>
            <option>Accepted</option>
            <option>Rejected</option>
            <option>Draft</option>
          </select>
          <select className="border px-3 py-2 rounded-lg shadow-sm">
            <option>All Programs</option>
            <option>
              Bachelor of Science in Business Administration - Human Resource
              Management
            </option>
            <option>Bachelor of Arts in English Language Studies</option>
            <option>
              Bachelor of Science in Business Administration - Marketing
              Management
            </option>
            <option>Bachelor of Science in Hospitality Management</option>
          </select>
          <input type="date" className="border px-3 py-2 rounded-lg shadow-sm" />
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="p-3">Applicant</th>
                <th className="p-3">Program</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Documents</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr className="border-b hover:bg-gray-50 transition">
                <td className="p-3">
                  <div className="font-semibold text-gray-900">
                    Juan Dela Cruz
                  </div>
                  <div className="text-sm text-gray-500">
                    juan.delacruz@email.com
                  </div>
                </td>
                <td className="p-3 text-sm">
                  Bachelor of Science in Business Administration - Human
                  Resource Management
                </td>
                <td className="p-3">2025-05-20</td>
                <td className="p-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-600">6 submitted</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700">
                      <Eye size={16} />
                      View
                    </button>
                    <button className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700">
                      <Check size={16} />
                      Accept
                    </button>
                    <button className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700">
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </td>
              </tr>

              <tr className="border-b hover:bg-gray-50 transition">
                <td className="p-3">
                  <div className="font-semibold text-gray-900">
                    Maria Santos
                  </div>
                  <div className="text-sm text-gray-500">
                    maria.santos@email.com
                  </div>
                </td>
                <td className="p-3 text-sm">
                  Bachelor of Arts in English Language Studies
                </td>
                <td className="p-3">2025-05-15</td>
                <td className="p-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Accepted
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-600">7 submitted</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700">
                      <Eye size={16} />
                      View
                    </button>
                    <button className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-gray-600 text-white hover:bg-gray-700">
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition">
                <td className="p-3">
                  <div className="font-semibold text-gray-900">
                    Carlos Miguel
                  </div>
                  <div className="text-sm text-gray-500">
                    carlos.miguel@email.com
                  </div>
                </td>
                <td className="p-3 text-sm">
                  Bachelor of Science in Business Administration - Marketing
                  Management
                </td>
                <td className="p-3">2025-05-10</td>
                <td className="p-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                    Rejected
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-600">3 submitted</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700">
                      <Eye size={16} />
                      View
                    </button>
                    <button className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-gray-600 text-white hover:bg-gray-700">
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <h2 className="text-xl font-bold text-blue-800 mb-4">
          Document Checklist
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 text-sm">
          <div className="border rounded-lg p-3">Letter of Intent</div>
          <div className="border rounded-lg p-3">Resume</div>
          <div className="border rounded-lg p-3">Picture</div>
          <div className="border rounded-lg p-3">Application Form</div>
          <div className="border rounded-lg p-3">Recommendation Letter</div>
          <div className="border rounded-lg p-3">School Credentials</div>
          <div className="border rounded-lg p-3">High School Diploma</div>
          <div className="border rounded-lg p-3">Transcript</div>
          <div className="border rounded-lg p-3">Birth Certificate</div>
          <div className="border rounded-lg p-3">Employment Certificate</div>
          <div className="border rounded-lg p-3">NBI Clearance</div>
          <div className="border rounded-lg p-3">Certificates</div>
        </div>
      </div>
    </div>
  );
}
