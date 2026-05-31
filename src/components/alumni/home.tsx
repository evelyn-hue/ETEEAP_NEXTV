import Link from "next/link";

export default function AlumniFeedPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6 mt-12">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Alumni Feed</h1>
        <p className="text-gray-500">Full slambook profiles from graduates</p>

        <Link
          href="/alumni/alumniform"
          className="inline-block mt-4 bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Join Alumni
        </Link>
      </div>

      <div className="max-w-5xl mx-auto mb-6">
        <input
          className="w-full border p-3 rounded"
          placeholder="Search alumni..."
        />
      </div>

      <div className="max-w-5xl mx-auto mb-6 bg-white p-6 rounded-xl shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">
              Filter by Program
            </h3>
            <select
              multiple
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
              size={5}
            >
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
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-3">
              Filter by Academic Year
            </h3>
            <select
              multiple
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-700"
              size={5}
            >
              <option>2024-2025</option>
              <option>2025-2026</option>
              <option>2026-2027</option>
              <option>2027-2028</option>
              <option>2028-2029</option>
            </select>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Selected Filters:
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              Bachelor of Arts in English Language Studies
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              2025-2026
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold">
              JD
            </div>

            <div>
              <h2 className="text-xl font-bold text-blue-800">
                Juan Dela Cruz
              </h2>
              <p className="text-sm text-gray-500">&quot;JD&quot;</p>
            </div>
          </div>

          <div className="mb-4">
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
              Verified Alumni
            </span>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">
              Personal Info
            </h3>
            <div className="text-sm text-gray-600">
              <p>Birthday: 1998-05-10</p>
              <p>Batch: 2024-2025</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">Education</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                Bachelor&apos;s Degree
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">Programs</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                Bachelor of Science in Business Administration - Human Resource
                Management
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">Certificates</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                TESDA NC II
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">
              Work Experience
            </h3>
            <div className="text-sm text-gray-600">
              <p>Tech Corp</p>
              <p>Software Developer</p>
              <p>2025-Present</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">Experience</h3>
            <div className="text-sm text-gray-600">
              <p>Great journey in ETEEAP program.</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">
              Transformation
            </h3>
            <div className="text-sm text-gray-600">
              <p>It changed my career path completely.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold">
              MS
            </div>

            <div>
              <h2 className="text-xl font-bold text-blue-800">
                Maria Santos
              </h2>
              <p className="text-sm text-gray-500">&quot;MS&quot;</p>
            </div>
          </div>

          <div className="mb-4">
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
              Verified Alumni
            </span>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">
              Personal Info
            </h3>
            <div className="text-sm text-gray-600">
              <p>Birthday: 1999-08-15</p>
              <p>Batch: 2025-2026</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">Education</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                Bachelor&apos;s Degree
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">Programs</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                Bachelor of Arts in English Language Studies
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">Certificates</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                TESDA NC III
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">
              Work Experience
            </h3>
            <div className="text-sm text-gray-600">
              <p>Education Plus</p>
              <p>English Teacher</p>
              <p>2026-Present</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">Experience</h3>
            <div className="text-sm text-gray-600">
              <p>Excellent learning experience at the institution.</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">
              Transformation
            </h3>
            <div className="text-sm text-gray-600">
              <p>Improved my teaching skills significantly.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
