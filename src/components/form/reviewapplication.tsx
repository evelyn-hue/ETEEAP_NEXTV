export default function ReviewApplication() {
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
            <strong>Name:</strong> Applicant Name
          </p>

          <p>
            <strong>Email:</strong> applicant@example.com
          </p>

          <p>
            <strong>Phone:</strong> 0912 345 6789
          </p>

          <p>
            <strong>Marital Status:</strong> Single
          </p>

          <p>
            <strong>Business Owner:</strong> No
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-blue-700">
            Documents
          </h2>

          <table className="w-full text-sm mt-2">
            <tbody>
              <tr>
                <td className="py-2">
                  <strong>Letter of Intent:</strong> letter-of-intent.pdf
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <strong>Resume / CV:</strong> resume.pdf
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <strong>Formal Picture:</strong> formal-picture.jpg
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <strong>ETEEAP Application Form:</strong>{" "}
                  application-form-screenshot.png
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <strong>Recommendation Letter:</strong>{" "}
                  recommendation-letter.pdf
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <strong>School Credentials:</strong>{" "}
                  school-credentials.pdf
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <strong>High School Diploma / PEPT:</strong>{" "}
                  high-school-diploma.pdf
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <strong>Transcript:</strong> transcript.pdf
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <strong>Birth Certificate:</strong> birth-certificate.pdf
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <strong>Certificate of Employment:</strong>
                  <ul className="list-disc list-inside mt-1">
                    <li>employment-certificate-1.pdf</li>
                    <li>employment-certificate-2.pdf</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <strong>NBI Clearance:</strong> nbi-clearance.pdf
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <strong>Marriage Certificate:</strong> -
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <strong>Business Registration:</strong> -
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <strong>Certificates:</strong>
                  <ul className="list-disc list-inside mt-1">
                    <li>training-certificate.pdf</li>
                    <li>award-certificate.pdf</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            className="px-6 py-2 rounded-md bg-blue-700 text-white"
          >
            Save Draft
          </button>

          <button
            type="button"
            className="px-6 py-2 rounded-md bg-blue-800 text-white"
          >
            Submit
          </button>
        </div>
      </div>
    </main>
  );
}
