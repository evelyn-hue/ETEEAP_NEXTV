

export default function Footer() {
  return (
    <footer className="bg-[#1e3a5f] text-white pt-12 pb-6 relative overflow-hidden">

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">

        {/* LEFT: LOGOS + DESCRIPTION */}
        <div className="flex-1 flex flex-col items-start justify-start gap-4">

          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">LCCB</span>
            <span className="text-sm font-semibold text-blue-200 border-l border-blue-400 pl-2">ETEEAP</span>
          </div>

          <p className="text-gray-300 leading-relaxed max-w-sm mt-2">
            Empowering working adults to earn a degree through recognition of prior learning and professional experience.
          </p>

        </div>

        {/* CENTER: CONTACT US */}
        <div className="flex-1 flex flex-col items-center text-center mt-4 md:mt-6">

          <h4 className="text-xl font-semibold mb-2">Contact Us</h4>

          <p className="text-gray-300 hover:text-white transition">
            📧 eteeap@lccbonline.edu.ph
          </p>

          <p className="text-gray-300 hover:text-white transition">
            ☎ (034) 434–9661 local 317
          </p>

          <a
            href="https://www.facebook.com/people/LCC-B-Eteeap/100063975547608/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-gray-300 hover:text-white transition"
          >
            Visit our facebook page
          </a>

        </div>

        {/* RIGHT: SPACER (KEEP BALANCE) */}
        <div className="flex" />

      </div>

      {/* DIVIDER + COPYRIGHT */}
      <div className="mt-12 border-t border-blue-700 pt-4 text-center text-gray-400 text-sm">
        © 2025 LCCB ETEEAP. All rights reserved.
      </div>

    </footer>
  );
}
