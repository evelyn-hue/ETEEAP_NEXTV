"use client";

import React, { useEffect, useContext, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";

import imgSrc from "@/config/img_src.json";

import { UserContext } from "../UserContext";
import Toast from "@/components/Toast";

function About() {
  const { user } = useContext(UserContext);
  const router = useRouter();

  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  type ToastType = "success" | "error";

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  }>({
    message: "",
    type: "success",
  });

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    const checkExistingApplications = async () => {
      if (!user) {
        setHasExistingApplication(false);
        return;
      }

      try {
        const res = await fetch(
          "http://localhost:5000/profile/applications",
          {
            method: "GET",
            credentials: "include",
            headers: { "x-user-id": String(user.id) },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setHasExistingApplication(Array.isArray(data) && data.length > 0);
        }
      } catch (err) {
        console.error("Error checking applications:", err);
      }
    };

    checkExistingApplications();
  }, [user]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-20 space-y-16">
      {/* Hero Section */}
      <section data-aos="fade-down" className="relative">
        <Image
          src={imgSrc.heroImage}
          alt="ETEEAP Students"
          width={1200}
          height={600}
          style={{ marginTop: "4rem" }}
          className="w-full h-64 md:h-96 object-cover rounded-xl shadow-md"
          priority
        />

        <h1 className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl font-bold text-white bg-black/40 rounded-xl">
          About ETEEAP
        </h1>
      </section>

      {/* Overview */}
      <section data-aos="fade-up" className="bg-white shadow-md rounded-xl p-6 md:p-12">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Overview</h2>
        <p className="text-gray-700 leading-relaxed">
          The Expanded Tertiary Education Equivalency and Accreditation Program (ETEEAP) is an alternative education delivery mode, promulgated through Executive Order 330, which promotes access to continuing quality higher education. It is an effective system of academic equivalency and accreditation of prior learning from relevant work experiences and formal/non-formal educational training. Deputized Higher Educational Institutions (HEIs) are authorized to conduct competency-based evaluation and award appropriate degrees to deserving individuals.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          The Commission on Higher Education deputized LCC Bacolod to offer ETEEAP for Bachelor of Science in Business Administration, Liberal Arts in English Language Studies, and the Bachelor of Science in Hospitality Management. The program follows a revised curriculum based on a 10-month timeframe with classes every Saturday.
        </p>
      </section>

      {/* Mission & Vision */}
      <section
        data-aos="fade-up"
        className="bg-blue-50 shadow-md rounded-xl p-6 md:p-12 flex flex-col md:flex-row items-center gap-8"
      >
        <Image
          src={imgSrc.heroImage}
          alt="Mission"
          width={500}
          height={300}
          className="rounded-lg shadow-md object-cover"
        />

        <div className="flex-1 space-y-6">
          <h2 className="text-2xl font-semibold text-blue-700">
            Mission & Vision
          </h2>

          <div>
            <h3 className="font-semibold text-blue-800 mb-2">Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              Guided by the teachings of Christ and inspired by Augustinian and Marian values, LCC Bacolod’s ETEEAP is dedicated to delivering quality, accessible, and transformative academic programs that recognize prior learning and professional experience. It upholds a culture of excellence in instruction, innovation, and nation building to form lifelong learners and professionals who embody integrity, leadership, and service strengthening its role as the leading provider of future and world ready graduates.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-blue-800 mb-2">Vision</h3>
            <p className="text-gray-700 leading-relaxed">
             La Consolacion College Bacolod’s ETEEAP envisions itself as a Catholic academic community committed to excellence and quality education for adult learners. It aspires to be the leading provider of competent, compassionate, and values-driven graduates in the Negros Island Region and beyond who contribute to the creation of a just, humane, and sustainable society.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section data-aos="fade-up" className="bg-white shadow-md rounded-xl p-6 md:p-12">
        <h2 className="text-2xl font-semibold text-blue-700 mb-6">
          Why Choose ETEEAP?
        </h2>

        <ul className="grid md:grid-cols-2 gap-6">
          <li>🎓 Opportunity for working adults to complete a degree within 10 months.</li>
          <li>⏰ Flexible class schedules (every Saturday).</li>
          <li>📄 Competency-based evaluation and recognition of prior learning.</li>
          <li>⭐ Deputized HEIs ensure quality and official degree accreditation.</li>
        </ul>
      </section>

      {/* CTA */}
      <section data-aos="fade-up" className="text-center">
        <button
          onClick={() => {
            if (!user) {
              router.push("/login");
            } else if (hasExistingApplication) {
              setToast({
                message: "One application per account only",
                type: "error",
              });
            } else {
              router.push("/programs");
            }
          }}
          disabled={!!user && hasExistingApplication}
          className={`px-8 py-3 rounded-md text-lg font-semibold transition ${
            user && hasExistingApplication
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-blue-800 text-white hover:bg-blue-700"
          }`}
        >
          {user && hasExistingApplication
            ? "Application Already Submitted"
            : "Apply Now"}
        </button>
      </section>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </main>
  );
}

export default About;