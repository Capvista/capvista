"use client";

import { useState } from "react";

const foundersSteps = [
  {
    number: "01",
    title: "Create Your Profile",
    description:
      "Set up your company profile with key business details, financials, and growth metrics. Our structured onboarding ensures your company is presented professionally to institutional investors.",
  },
  {
    number: "02",
    title: "Get Verified",
    description:
      "Undergo Capvista's multi-step verification process covering corporate identity, beneficial ownership, and financial documentation. Verification builds investor confidence and unlocks deal creation.",
  },
  {
    number: "03",
    title: "Raise Capital",
    description:
      "Create standardized investment instruments — from revenue share notes to convertible SAFEs — and access a curated network of qualified global investors ready to deploy capital.",
  },
];

const investorsSteps = [
  {
    number: "01",
    title: "Browse Opportunities",
    description:
      "Explore verified African companies across two structured investment lanes — Yield and Ventures. Each listing includes standardized disclosures, financials, and deal terms.",
  },
  {
    number: "02",
    title: "Due Diligence",
    description:
      "Access comprehensive company profiles, financial data, risk disclosures, and instrument details. Every offering has been pre-screened through Capvista's capital governance framework.",
  },
  {
    number: "03",
    title: "Invest & Track",
    description:
      "Subscribe to offerings, fund through secure escrow, and monitor your portfolio with real-time reporting, covenant tracking, and structured distributions — all in one platform.",
  },
];

export default function HowCapvistaWorks() {
  const [activeTab, setActiveTab] = useState<"founders" | "investors">(
    "founders"
  );

  const steps = activeTab === "founders" ? foundersSteps : investorsSteps;

  return (
    <section id="how-it-works" className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A1F44] mb-4">
            How Capvista Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Whether you&apos;re raising capital or deploying it, Capvista makes
            private market investing straightforward and transparent.
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex justify-center mb-14">
          <div className="inline-flex rounded-full border border-gray-200 p-1 bg-white">
            <button
              onClick={() => setActiveTab("founders")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                activeTab === "founders"
                  ? "bg-[#0A1F44] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              For Founders
            </button>
            <button
              onClick={() => setActiveTab("investors")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                activeTab === "investors"
                  ? "bg-[#0A1F44] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              For Investors
            </button>
          </div>
        </div>

        {/* Step Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.number + activeTab}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center mb-6">
                {step.number === "01" && (
                  <svg
                    className="w-6 h-6 text-[#10B981]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    {activeTab === "founders" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z"
                      />
                    )}
                  </svg>
                )}
                {step.number === "02" && (
                  <svg
                    className="w-6 h-6 text-[#10B981]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    {activeTab === "founders" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                      />
                    )}
                  </svg>
                )}
                {step.number === "03" && (
                  <svg
                    className="w-6 h-6 text-[#10B981]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    {activeTab === "founders" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                      />
                    )}
                  </svg>
                )}
              </div>

              {/* Step Number */}
              <div className="text-5xl font-bold text-gray-100 mb-4">
                {step.number}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-[#0A1F44] mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {step.description}
              </p>

              {/* Green accent line */}
              <div className="w-12 h-1 bg-[#10B981] rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
