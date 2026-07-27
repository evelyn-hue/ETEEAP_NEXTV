"use client";

import React, { useState } from "react";
import { FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";
import SectionHeading from "@/components/shared/SectionHeading";
import SectionEyebrow from "@/components/shared/SectionEyebrow";
import Reveal from "@/components/shared/Reveal";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { question: "What is ETEEAP?", answer: "ETEEAP (Expanded Tertiary Education Equivalency and Accreditation Program) allows working professionals to earn a college degree based on their work experience, skills, and competencies." },
    { question: "Who is eligible for ETEEAP?", answer: "Applicants must be at least high school graduates with a minimum of 5 years relevant work experience in their chosen field." },
    { question: "Can I apply online for ETEEAP?", answer: "Yes. The entire application process is done online including form submission, uploading requirements, and tracking application status." },
    { question: "What are the common requirements for ETEEAP?", answer: "PSA Birth Certificate, Resume/CV, Certificate of Employment, NBI Clearance, Transcript or Diploma, training certificates, and recommendation letter." },
    { question: "Can I save my application as draft?", answer: "Yes. You can save your application as draft and continue editing it anytime before final submission." },
    { question: "Can I edit my application after submitting?", answer: "No. Once submitted, applications cannot be edited unless returned for revision by the admin." },
    { question: "How long does application review take?", answer: "The evaluation usually takes 3–5 business days depending on document completeness and verification." },
    { question: "How do I become part of the alumni list?", answer: "You must create an account, go to the Alumni page, and fill out the alumni registration form." },
    { question: "What happens after submitting the alumni form?", answer: "After submission, you will choose whether to publish your information publicly or keep it private. Your application will then be sent for admin verification." },
    { question: "What is the difference between Public and Private alumni profile?", answer: "Public means your profile will be visible on the alumni page. Private means your data is stored but not shown publicly." },
    { question: "Do I need admin approval for alumni registration?", answer: "Yes. All alumni submissions must be reviewed and approved by the administrator before becoming official." },
    { question: "Can I change my public/private setting later?", answer: "Yes, but changes must still be reviewed and approved by the administrator." },
    { question: "Can I be automatically added after graduation?", answer: "No. Alumni registration is manual. Users must actively submit their alumni form." },
    { question: "What happens if my alumni application is rejected?", answer: "You will receive feedback from the admin and may update and resubmit your application." },
    { question: "Why can't I submit my application?", answer: "Most likely required fields or documents are missing. Make sure all required inputs and files are uploaded before submitting." },
    { question: "Why is my file upload not working?", answer: "Ensure your file is in the correct format (PDF, JPG, PNG) and is not corrupted or too large." },
    { question: "How do I track my application status?", answer: "You can check your dashboard or applications page to see if your status is pending, approved, or rejected." },
    { question: "What should I do if the system is not working?", answer: "Try refreshing the page, clearing your browser cache, or using a different browser." },
    { question: "Who do I contact for help?", answer: "You can contact the ETEEAP coordinator or system administrator for assistance." },
  ];

  const filteredFAQs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main>
      {/* Hero */}
      <section className="relative w-full h-64 md:h-72 flex items-center justify-center overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center px-6">
          <SectionEyebrow className="text-white/80">Help Center</SectionEyebrow>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display">
            ETEEAP &amp; Alumni System FAQ
          </h1>
          <p className="text-white/70 mt-4 max-w-xl mx-auto">
            Find answers to the most common questions about applications and the alumni system.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-20 space-y-10">

        {/* Search */}
        <Reveal>
          <div className="flex items-center bg-white rounded-full shadow-sm ring-1 ring-slate-200/30 px-5 py-3">
            <FiSearch className="text-gray-500 text-xl mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search a question..."
              className="w-full outline-none text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </Reveal>

        {/* FAQ List */}
        <Reveal>
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 p-5 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800 pr-4">
                      {faq.question}
                    </h2>
                    {openIndex === index ? (
                      <FiChevronUp className="text-blue-600 text-2xl shrink-0" />
                    ) : (
                      <FiChevronDown className="text-gray-400 text-2xl shrink-0" />
                    )}
                  </div>
                  <div
                    className={`mt-2 text-gray-600 overflow-hidden transition-all duration-300 ${
                      openIndex === index
                        ? "max-h-40 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="mt-3 leading-relaxed border-t pt-3 border-gray-100">{faq.answer}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 mt-10">
                No results found.
              </p>
            )}
          </div>
        </Reveal>

      </div>
    </main>
  );
};

export default FAQ;
