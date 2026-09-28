import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import {
  Shield,
  FileText,
  Clock,
  AlertTriangle,
  ChevronRight,
  Lock,
  UserCheck,
  Eye,
  Database,
  Share2,
  Cookie,
  Mail,
} from 'lucide-react';

interface PolicySection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

export const PrivacyPolicyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('intro');

  const sections: PolicySection[] = useMemo(() => [
    {
      id: 'intro',
      title: '1. Introduction & Scope',
      icon: Shield,
      content: (
        <div className="space-y-3 text-sm sm:text-base text-[#445548] leading-relaxed">
          <p>
            Welcome to Pawfectly ("we," "our," or "us"). We are dedicated to maintaining the trust and confidence of our pet parents and visitors. This Privacy Policy explains how Pawfectly collects, uses, protects, and discloses personal information when you use our website, customer portal, wellness appointment booking tools, pet profile management features, and in-store product reservation system.
          </p>
          <p>
            By accessing or using our platform, you acknowledge that you have read and understood the practices described herein. If you have any questions or require clarification regarding your privacy rights, please reach out to us at{' '}
            <a
              href="mailto:privacy@pawfectly.com"
              className="text-[#009E66] font-bold underline hover:text-[#EF7C3C]"
            >
              privacy@pawfectly.com
            </a>
            .
          </p>
        </div>
      ),
    },
    {
      id: 'info-collected',
      title: '2. Information We Collect',
      icon: Database,
      content: (
        <div className="space-y-4 text-sm sm:text-base text-[#445548] leading-relaxed">
          <p>
            We collect information you directly provide when registering an account, creating pet wellness records, booking clinic services, or requesting product reservations:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-[#445548]">
            <li>
              <strong>Account & Profile Details:</strong> Your full name, email address, phone number, and encrypted authentication credentials.
            </li>
            <li>
              <strong>Pet Companion Records:</strong> Pet name, species (canine, feline, etc.), breed, date of birth / age, gender, weight, allergy history, and health notes you choose to log.
            </li>
            <li>
              <strong>Service Appointment Data:</strong> Selected care services (e.g., wellness exams, grooming, behavioral consultations), preferred appointment dates, times, and special handling instructions.
            </li>
            <li>
              <strong>Product Reservation Records:</strong> Items reserved for in-store collection, item quantities, and pickup confirmation identifiers.
            </li>
            <li>
              <strong>Wishlist & Restock Requests:</strong> Products saved to your favorites list and your email preferences for out-of-stock restock notifications.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'how-we-use',
      title: '3. How We Use Your Data',
      icon: Eye,
      content: (
        <div className="space-y-3 text-sm sm:text-base text-[#445548] leading-relaxed">
          <p>We use the collected information strictly for legitimate operational purposes:</p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-[#445548]">
            <li>To schedule and fulfill pet care and grooming appointments at our physical care center.</li>
            <li>To manage product reservations, prepare in-store collection bags, and notify you when orders are ready.</li>
            <li>To tailor preventative wellness tips and educational health articles in Fur & Facts to your pet's life stage and species.</li>
            <li>To alert you when previously out-of-stock pharmacy medications or store essentials are back on store shelves.</li>
            <li>To protect our platform against spam, abusive submissions, or security vulnerabilities.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'orders-payment',
      title: '4. In-Store Pickup & Payment Privacy',
      icon: Lock,
      content: (
        <div className="space-y-3 text-sm sm:text-base text-[#445548] leading-relaxed">
          <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#CBDAC6]/80 text-xs sm:text-sm text-[#009E66] font-medium leading-relaxed">
            <strong>Important Payment Clarity:</strong> Pawfectly operates exclusively on an <em>In-Store Collection & Payment</em> model. Our web application does not process, charge, or store credit card or debit card numbers online.
          </div>
          <p>
            When you complete an order on Pawfectly, you are placing a physical product reservation. Transactions and payment settlements are handled in-person at our physical store counter at the time of pickup. Consequently, no payment card credentials ever transit or reside on our web servers.
          </p>
        </div>
      ),
    },
    {
      id: 'data-sharing',
      title: '5. Data Sharing & Third Parties',
      icon: Share2,
      content: (
        <div className="space-y-3 text-sm sm:text-base text-[#445548] leading-relaxed">
          <p>
            <strong>We do not sell, rent, or trade your personal or pet information to third parties or advertising brokers.</strong>
          </p>
          <p>We only disclose information under the following limited scenarios:</p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-[#445548]">
            <li>
              <strong>Internal Care Staff & Specialists:</strong> Licensed veterinary staff, groomers, and care center managers who require pet history to deliver safe care.
            </li>
            <li>
              <strong>Essential Infrastructure Providers:</strong> Secure cloud hosting and transactional email services that operate under strict non-disclosure and privacy agreements.
            </li>
            <li>
              <strong>Legal Compliance:</strong> When required by enforceable governmental requests, court orders, or veterinary board regulations.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'cookies',
      title: '6. Cookies & Browser Storage',
      icon: Cookie,
      content: (
        <div className="space-y-3 text-sm sm:text-base text-[#445548] leading-relaxed">
          <p>
            Pawfectly utilizes minimal, essential browser local storage and session tokens to preserve your shopping bag, active login state, pet comparison tray, and theme preferences across visits.
          </p>
          <p>
            We do not employ third-party cross-site behavioral tracking cookies. You may disable cookies in your browser settings, though doing so may prevent you from staying logged in or saving items in your cart.
          </p>
        </div>
      ),
    },
    {
      id: 'security-retention',
      title: '7. Data Security & Retention',
      icon: UserCheck,
      content: (
        <div className="space-y-3 text-sm sm:text-base text-[#445548] leading-relaxed">
          <p>
            We enforce industry-standard security safeguards including TLS/SSL encryption for all data in transit, salted password hashing, and role-based administrative access controls.
          </p>
          <p>
            We retain account data for as long as your customer profile remains active. If you choose to close your account, we will delete or anonymize your personal records within 30 days, unless longer retention is required for tax, legal, or veterinary compliance records.
          </p>
        </div>
      ),
    },
    {
      id: 'user-rights',
      title: '8. Your Rights & Choices',
      icon: FileText,
      content: (
        <div className="space-y-3 text-sm sm:text-base text-[#445548] leading-relaxed">
          <p>As a valued pet parent on Pawfectly, you have full ownership of your data:</p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-[#445548]">
            <li><strong>Access & Review:</strong> View and export the personal and pet records stored in your Customer Profile.</li>
            <li><strong>Correction & Update:</strong> Modify pet weight, age, allergy notes, or your phone number anytime via the profile dashboard.</li>
            <li><strong>Deletion:</strong> Request permanent removal of your account and associated records by emailing our privacy team.</li>
            <li><strong>Communication Opt-Out:</strong> Unsubscribe from restock notifications or newsletter tips with a single click.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'contact',
      title: '9. Contacting Our Privacy Team',
      icon: Mail,
      content: (
        <div className="space-y-3 text-sm sm:text-base text-[#445548] leading-relaxed">
          <p>
            If you have questions, complaints, or requests regarding this Privacy Policy or how your pet's wellness records are managed, please contact our Data Protection Officer:
          </p>
          <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#CBDAC6]/60 text-sm space-y-1.5">
            <p className="font-bold text-[#009E66]">Pawfectly Privacy & Compliance Office</p>
            <p className="text-[#445548]">Email: <a href="mailto:privacy@pawfectly.com" className="text-[#009E66] font-semibold underline">privacy@pawfectly.com</a></p>
            <p className="text-[#445548]">Address: 104 Wellness Boulevard, Indiranagar, Bengaluru, Karnataka 560038, India</p>
            <p className="text-xs text-[#5E6E62] pt-1">Response time: Typically within 2 business days.</p>
          </div>
        </div>
      ),
    },
  ], []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        const el = document.getElementById(sec.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sec.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F2] text-[#16241B]">
      <Navbar />

      <main className="flex-1 pb-14">
        {/* Top Header Banner */}
        <section className="bg-gradient-to-b from-[#1F4B43] to-[#16241B] text-white py-5 sm:py-7 px-4 sm:px-6 lg:px-8 border-b border-[#23382A]">
          <div className="max-w-5xl mx-auto text-center space-y-2.5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Privacy <span className="text-[#EF7C3C]">Policy</span>
            </h1>
            <div className="flex items-center justify-center gap-3 text-xs sm:text-sm text-[#CBDAC6]/80 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#EF7C3C]" />
                Last Updated: September 24, 2026
              </span>
              <span>•</span>
              <span className="text-[#EF7C3C] font-semibold">
                Draft Documentation
              </span>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {/* Draft Disclaimer Box */}
          <div className="mb-10 p-5 rounded-2xl bg-[#FAF6EE] border-l-4 border-[#EF7C3C] border-y border-r border-[#CBDAC6]/60 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-[#EF7C3C] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-[#445548] leading-relaxed">
              <p className="font-bold text-[#1F4B43] text-sm sm:text-base">
                Legal Notice & Draft Version Disclaimer
              </p>
              <p className="mt-1">
                This document represents an operational privacy policy draft tailored specifically to Pawfectly's appointment booking and in-store pickup platform architecture. This copy should be reviewed and approved by qualified legal counsel prior to formal regulatory reliance.
              </p>
            </div>
          </div>

          {/* Mobile TOC Select Bar */}
          <div className="lg:hidden mb-8 bg-white p-4 rounded-xl border border-[#CBDAC6]/60 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1F4B43] mb-2">
              Jump to Section:
            </label>
            <select
              value={activeSection}
              onChange={(e) => scrollToSection(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#CBDAC6] text-sm text-[#1F4B43] font-medium bg-[#F6F7F2]"
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.title}
                </option>
              ))}
            </select>
          </div>

          {/* 2-Column Sticky Layout on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Sticky Table of Contents Sidebar */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-4">
              <div className="bg-white rounded-2xl border border-[#CBDAC6]/60 shadow-xs p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F4B43] mb-4 pb-2 border-b border-[#CBDAC6]/40 flex items-center justify-between">
                  <span>Table of Contents</span>
                  <span className="text-[10px] font-normal text-[#5E6E62]">
                    {sections.length} sections
                  </span>
                </h3>
                <nav className="space-y-1">
                  {sections.map((sec) => {
                    const isCurrent = activeSection === sec.id;
                    const Icon = sec.icon;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => scrollToSection(sec.id)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between group cursor-pointer ${
                          isCurrent
                            ? 'bg-[#009E66] text-white shadow-xs'
                            : 'text-[#445548] hover:bg-[#F6F7F2] hover:text-[#009E66]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isCurrent ? 'text-[#EF7C3C]' : 'text-[#5E6E62]'
                            }`}
                          />
                          <span className="truncate">{sec.title}</span>
                        </div>
                        <ChevronRight
                          className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                            isCurrent
                              ? 'text-[#EF7C3C] translate-x-0.5'
                              : 'text-[#CBDAC6] opacity-0 group-hover:opacity-100'
                          }`}
                        />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Privacy Support Tile */}
              <div className="p-5 rounded-2xl bg-[#1F4B43] text-white text-xs space-y-2">
                <p className="font-bold text-[#EF7C3C] text-sm">Have Data Questions?</p>
                <p className="text-[#CBDAC6] leading-relaxed">
                  You have the right to request a full copy of your pet's records or request account removal anytime.
                </p>
                <a
                  href="mailto:privacy@pawfectly.com"
                  className="inline-flex items-center gap-1 text-[#EF7C3C] font-bold hover:underline pt-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email Privacy Desk →
                </a>
              </div>
            </aside>

            {/* Right Column: Policy Document Sections */}
            <div className="lg:col-span-8 space-y-8">
              {sections.map((sec) => {
                const Icon = sec.icon;
                return (
                  <section
                    key={sec.id}
                    id={sec.id}
                    className="bg-white rounded-2xl border border-[#CBDAC6]/60 shadow-xs p-6 sm:p-8 scroll-mt-28 transition-all hover:border-[#CBDAC6]"
                  >
                    <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#CBDAC6]/40">
                      <div className="w-9 h-9 rounded-xl bg-[#009E66]/10 text-[#009E66] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#009E66]" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#009E66]">
                        {sec.title}
                      </h2>
                    </div>
                    {sec.content}
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
