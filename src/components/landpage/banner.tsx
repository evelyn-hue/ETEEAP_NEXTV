"use client";

import imgSrc from "@/config/img_src.json";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Award,
  Users,
  GraduationCap,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import Reveal from "@/components/shared/Reveal";
import SectionHeading from "@/components/shared/SectionHeading";
import SectionEyebrow from "@/components/shared/SectionEyebrow";
import StaggerContainer from "@/components/shared/StaggerContainer";
import StaggerItem from "@/components/shared/StaggerItem";

const features = [
  { icon: Clock, title: "Fast Degree Completion", desc: "Earn your baccalaureate degree within a 10-month period." },
  { icon: Award, title: "Competency-Based Assessment", desc: "Recognize prior learning through tests, interviews, and practical evaluations." },
  { icon: Users, title: "Flexible Schedule", desc: "Saturday classes make it convenient for working adults." },
  { icon: GraduationCap, title: "Recognized Programs", desc: "Offered in Business, Liberal Arts, and Hospitality, accredited by CHED." },
  { icon: Briefcase, title: "Career Advancement", desc: "Enhance your skills and professional opportunities with a recognized degree." },
];

const qualifications = [
  { title: "Age Requirement", desc: "At least 23 years old" },
  { title: "Education", desc: "High school graduate or PEPT equivalent to 1st-year college" },
  { title: "Experience", desc: "At least 5 years relevant work experience" },
];

export default function Banner() {
  return (
    <>
      {/* Hero Section — full-viewport campus photo */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Image
          src={imgSrc.heroImage}
          alt="LCC Bacolod Campus"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 mx-6 max-w-2xl">
          <div className="bg-black/30 backdrop-blur-sm border border-blue-300/25 rounded-2xl p-8 md:p-10 shadow-xl text-center">
            <p className="text-eyebrow text-blue-200 mb-4">LCC Bacolod ETEEAP</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-display leading-tight mb-4">
              Your Experience.
              <br />
              <span className="text-blue-300">Your Degree.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/85 mb-8 max-w-xl mx-auto">
              Earn your college degree in just 10 months by recognizing your work experience and prior learning.
            </p>
            <Link
              href="/courses"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-lg"
            >
              Apply Now
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="text-white/60 w-6 h-6" />
        </div>
      </section>

      {/* About Section */}
      <Reveal>
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <SectionEyebrow>About the Program</SectionEyebrow>
            <SectionHeading>What is ETEEAP?</SectionHeading>
            <p className="text-lg text-gray-700 leading-relaxed">
              The Expanded Tertiary Education Equivalency and Accreditation Program (ETEEAP) provides an opportunity for working adults to earn a baccalaureate degree in just 10 months through recognition of prior learning and work experience. Deputized Higher Education Institutions, like LCC Bacolod, conduct competency-based assessments to award appropriate degrees.
            </p>
            <Link href="/overview" className="inline-block mt-6 text-blue-600 hover:text-blue-700 font-semibold">
              Learn more about ETEEAP &rarr;
            </Link>
          </div>
        </section>
      </Reveal>

      {/* Why Choose ETEEAP — bento grid */}
      <Reveal>
        <section className="py-20 bg-section-warm">
          <div className="max-w-6xl mx-auto px-6">
            <SectionEyebrow className="text-center">Why Choose ETEEAP</SectionEyebrow>
            <SectionHeading className="text-center mb-12">Five Reasons to Apply</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
              {features.map((f, i) => {
                const isTall = i === 0;
                const Card = (
                  <div className={`bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 p-6 hover:shadow-lg transition group ${isTall ? "md:row-span-2 flex flex-col justify-center" : ""}`}>
                    <f.icon className="text-blue-600 w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                    <p className="text-gray-600">{f.desc}</p>
                  </div>
                );
                return <div key={i}>{Card}</div>;
              })}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Qualifications */}
      <Reveal>
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <SectionEyebrow>Eligibility</SectionEyebrow>
            <SectionHeading>Admission Qualification</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {qualifications.map((q, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 p-6 hover:shadow-lg transition">
                  <h3 className="font-semibold text-primary mb-2">{q.title}</h3>
                  <p className="text-gray-600">{q.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* CTA */}
      <Reveal>
        <section className="py-20 bg-section-navy text-center">
          <h2 className="text-3xl font-bold font-display mb-4">
            Ready to Start Your ETEEAP Journey at LCCB?
          </h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">
            Apply today and take the next step in your career while earning your degree.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/courses"
              className="bg-white text-primary hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition inline-block"
            >
              Apply Now
            </Link>
            <Link
              href="/overview"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition inline-block"
            >
              Learn More
            </Link>
          </div>
        </section>
      </Reveal>
    </>
  );
}
