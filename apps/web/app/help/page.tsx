"use client";

import { useState } from "react";
import LandingNav from "../components/LandingNav";
import Footer from "../components/Footer";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const faqSections: FAQSection[] = [
  {
    title: "Getting Started",
    items: [
      {
        question: "What is Capvista?",
        answer:
          "Capvista is a private markets platform that connects verified African startups with qualified global investors. We provide the infrastructure for structured, transparent cross-border investment into Africa\u2019s most promising private companies.",
      },
      {
        question: "Who can use Capvista?",
        answer:
          "Capvista serves two audiences. Founders of African companies can apply to list their company and raise capital through standardized instruments. Investors worldwide can sign up, complete our qualification process, and browse verified investment opportunities.",
      },
      {
        question: "How do I create an account?",
        answer:
          "Click \u201CSign Up\u201D on the homepage and select whether you\u2019re joining as an Investor or a Founder. You\u2019ll verify your email, then complete an onboarding process specific to your role. Investors complete a qualification and accreditation flow. Founders submit their company details for verification.",
      },
      {
        question: "Is Capvista free to use?",
        answer:
          "Creating an account and browsing companies is free. Capvista charges a platform fee on completed investments. Founders are not charged to list their company. Specific fee structures are disclosed during the investment process.",
      },
    ],
  },
  {
    title: "For Investors",
    items: [
      {
        question: 'What does it mean to be a "qualified investor"?',
        answer:
          "Qualification requirements depend on your country of residence. In the US, you must meet SEC accredited investor standards. In the UK, you must qualify as a High Net Worth or Sophisticated Investor under FCA guidelines. In Nigeria, we apply our own Capvista Qualified Investor Policy based on financial capacity and investment experience. Our onboarding process determines your qualification based on your jurisdiction.",
      },
      {
        question: "How do I invest in a company?",
        answer:
          "Once your profile is verified, browse companies and review their full profiles including traction, team, risks, and deal terms. When you find a deal you\u2019re interested in, click \u201CView Deal\u201D to see the full terms and commit your investment through the platform.",
      },
      {
        question: "What are Yield and Ventures lanes?",
        answer:
          "These are our two investment categories. The Yield Lane offers cash-flow backed instruments like Revenue Share Notes for companies already generating revenue. The Ventures Lane offers equity-oriented instruments like SAFEs and Convertible Notes for high-growth startups. Each deal falls into one lane based on the company\u2019s stage and the instrument type.",
      },
      {
        question: "Can I invest from outside Nigeria?",
        answer:
          "Yes. Capvista is designed for global investors. Our jurisdiction-aware onboarding adapts to your country of residence and applies the appropriate accreditation and compliance standards.",
      },
      {
        question: "How do I track my investments?",
        answer:
          "Your investor dashboard shows all active investments, their current status, and portfolio metrics. Each investment is monitored and you\u2019ll receive updates on company performance.",
      },
      {
        question: "What are the risks?",
        answer:
          "All investments on Capvista are in private securities and carry significant risk, including the potential loss of your entire investment. There is no guarantee of returns and no liquidity \u2014 these are not publicly traded. Every deal includes detailed risk disclosures that you must review and acknowledge before investing.",
      },
    ],
  },
  {
    title: "For Founders",
    items: [
      {
        question: "How do I list my company on Capvista?",
        answer:
          "Sign up as a Founder and complete the company onboarding process. This includes submitting your company identity, team information, traction data, capital history, risk disclosures, and fundraising intent. Once submitted, our team reviews your application.",
      },
      {
        question: "What is the verification process?",
        answer:
          "We verify companies through multiple layers including CAC registration checks, founder identity verification (NIN/BVN in Nigeria), bank account verification, and document review. This process builds credibility with investors and is a core part of what makes Capvista different.",
      },
      {
        question: "How long does approval take?",
        answer:
          "Most company reviews are completed within 5\u201310 business days. If additional information is needed, our team will reach out. You can track your application status from your founder dashboard.",
      },
      {
        question: "What types of deals can I create?",
        answer:
          "Depending on your company\u2019s stage and needs, you can create deals in either the Yield Lane (Revenue Share Notes, Asset-Backed Participation) or the Ventures Lane (Convertible Notes, SAFEs, SPV Equity). Our team can help you determine the best instrument for your raise.",
      },
      {
        question: "Does Capvista take equity in my company?",
        answer:
          "Capvista Holdings receives a standardized 1% equity position from each company that lists on the platform. This aligns our long-term interests with yours.",
      },
    ],
  },
  {
    title: "Account & Security",
    items: [
      {
        question: "How is my personal information protected?",
        answer:
          "Your personal and financial information is encrypted and stored securely. Identity verification data (NIN, BVN, SSN, etc.) is handled with the highest level of security and is only visible to authorized compliance personnel.",
      },
      {
        question: "Can I delete my account?",
        answer:
          "Yes. You can deactivate your account from the Manage Profile page under Account Settings. If you have active investments, your investment records will be preserved for regulatory compliance even after account deactivation.",
      },
      {
        question: "Who do I contact for support?",
        answer:
          "Email us at support@capvista.com for any questions or issues. We aim to respond within 24 hours on business days.",
      },
    ],
  },
];

function AccordionItem({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
      >
        <span className="text-[#111827] font-semibold pr-4">
          {item.question}
        </span>
        <svg
          className={`w-5 h-5 text-[#6B7280] flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-[#6B7280] leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      <LandingNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0A1F44] to-[#1A3A6B] py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Help Center
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Find answers to common questions about using Capvista
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {faqSections.map((section) => (
            <div key={section.title} className="mb-12">
              <h2 className="text-xl font-bold text-[#0A1F44] mb-4">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <AccordionItem key={item.question} item={item} />
                ))}
              </div>
            </div>
          ))}

          {/* Bottom CTA */}
          <div className="mt-16 text-center bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-8">
            <p className="text-[#111827] font-semibold text-lg mb-2">
              Can&apos;t find what you&apos;re looking for?
            </p>
            <p className="text-[#6B7280]">
              Contact us at{" "}
              <a
                href="mailto:support@capvista.com"
                className="text-[#0A1F44] font-semibold hover:underline"
              >
                support@capvista.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
