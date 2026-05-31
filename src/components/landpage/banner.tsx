import imgSrc from "@/config/img_src.json";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Award,
  Users,
  GraduationCap,
  Briefcase,
} from "lucide-react";

export default function Banner() {
  return (
    <div className="font-sans text-gray-800 bg-white">
      {/* Hero Section */}
      <section className="bg-blue-800 text-white relative overflow-hidden mt-16">
        <div className="max-w-10xl mx-auto px-10 py-39 flex flex-col lg:flex-row items-center relative z-10">
          <div className="lg:w-1/2">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Welcome to LCCB ETEEAP
              <br />
              Online Application
            </h1>
            <p className="text-lg mb-2 italic">
              Achieve Your Degree, Recognize Your Experience
            </p>
            <p className="mb-6 text-lg">
              Streamline your application process and submit your requirements
              online. Join the ETEEAP community today!
            </p>
            <div className="flex gap-4">
              <Link
                href="/programs"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition inline-block"
              >
                Apply Now
              </Link>
              <Link
                href="/overview"
                className="bg-blue-500 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition inline-block"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 mt-10 lg:mt-0">
            <Image
              src={imgSrc.heroImage}
              alt="ETEEAP Hero"
              width={1000}
              height={1000}
              style={{ borderRadius: "10px" }}
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">About ETEEAP</h2>
          <p className="text-lg mb-4">
            The Expanded Tertiary Education Equivalency and Accreditation
            Program (ETEEAP) provides an opportunity for working adults to earn
            a baccalaureate degree in just 10 months through recognition of
            prior learning and work experience.
          </p>
          <p className="text-lg">
            Deputized Higher Education Institutions, like LCC Bacolod, conduct
            competency-based assessments using written tests, interviews, and
            practical evaluations to award appropriate degrees. Programs include
            Business Administration, Liberal Arts, and Hospitality Management,
            with Saturday classes for working professionals.
          </p>
        </div>
      </section>

      {/* Why Choose ETEEAP */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose ETEEAP?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          <div className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-lg transition text-center">
            <Clock className="text-blue-600 w-8 h-8 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Fast Degree Completion
            </h3>
            <p>Earn your baccalaureate degree within a 10-month period.</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-lg transition text-center">
            <Award className="text-blue-600 w-8 h-8 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Competency-Based Assessment
            </h3>
            <p>
              Recognize prior learning through tests, interviews, and practical
              evaluations.
            </p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-lg transition text-center">
            <Users className="text-blue-600 w-8 h-8 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Flexible Schedule</h3>
            <p>Saturday classes make it convenient for working adults.</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-lg transition text-center">
            <GraduationCap className="text-blue-600 w-8 h-8 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Recognized Programs</h3>
            <p>
              Offered in Business, Liberal Arts, and Hospitality, accredited by
              CHED.
            </p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-lg transition text-center">
            <Briefcase className="text-blue-600 w-8 h-8 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Career Advancement</h3>
            <p>
              Enhance your skills and professional opportunities with a
              recognized degree.
            </p>
          </div>
        </div>
      </section>

      {/* Admission Highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Admission Qualification</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold mb-2">Age Requirement</h3>
              <p>At least 23 years old</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold mb-2">Education</h3>
              <p>High school graduate or PEPT equivalent to 1st-year college</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold mb-2">Experience</h3>
              <p>At least 5 years relevant work experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <p className="italic mb-4">
                &quot;ETEEAP helped me complete my degree while working full-time.
                Highly recommended!&quot;
              </p>
              <h3 className="font-semibold">– Jane D., BSBA Graduate</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <p className="italic mb-4">
                &quot;The competency-based assessment really recognized my experience
                and skills. It was a life-changing program.&quot;
              </p>
              <h3 className="font-semibold">
                – Mark R., Hospitality Management Graduate
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-6">
          Ready to Start Your ETEEAP Journey at LCCB?
        </h2>
        <p className="mb-6">
          Apply today and take the next step in your career while earning your
          degree.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/programs"
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition inline-block"
          >
            Apply Now
          </Link>
          <Link
            href="/overview"
            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition inline-block"
          >
            Learn More
          </Link>
        </div>
      </section>

    </div>
  );
}
