export default function DraftXStatus() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-20 mt-10">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">
        My Applications
      </h1>

      <p className="text-gray-600 mb-8">
        Drafts and application status overview
      </p>

      <div className="grid gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6 border">
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-xl font-semibold text-blue-700">
              Bachelor of Arts in English Language Studies
            </h2>

            <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
              draft
            </span>
          </div>

          <div className="mt-3 text-gray-700">
            <p>
              <strong>Name:</strong> Applicant Name
            </p>
            <p>
              <strong>Email:</strong> applicant@example.com
            </p>
            <p>
              <strong>Phone:</strong> 0912 345 6789
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Saved: May 31, 2026, 10:00 AM
            </p>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              type="button"
              className="px-5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800"
            >
              Open
            </button>

            <button
              type="button"
              className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border">
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-xl font-semibold text-blue-700">
              Bachelor of Science in Hospitality Management
            </h2>

            <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              under_review
            </span>
          </div>

          <div className="mt-3 text-gray-700">
            <p>
              <strong>Name:</strong> Applicant Name
            </p>
            <p>
              <strong>Email:</strong> applicant@example.com
            </p>
            <p>
              <strong>Phone:</strong> 0912 345 6789
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Saved: May 30, 2026, 2:30 PM
            </p>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              type="button"
              className="px-5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800"
            >
              Open
            </button>

            <button
              type="button"
              className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border">
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-xl font-semibold text-blue-700">
              Bachelor of Science in Business Administration - Marketing
              Management
            </h2>

            <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              approved
            </span>
          </div>

          <div className="mt-3 text-gray-700">
            <p>
              <strong>Name:</strong> Applicant Name
            </p>
            <p>
              <strong>Email:</strong> applicant@example.com
            </p>
            <p>
              <strong>Phone:</strong> 0912 345 6789
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Saved: May 29, 2026, 9:15 AM
            </p>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              type="button"
              className="px-5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800"
            >
              Open
            </button>

            <button
              type="button"
              className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
