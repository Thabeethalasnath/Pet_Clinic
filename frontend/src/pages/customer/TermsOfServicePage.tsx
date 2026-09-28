import React, { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import {
  Clock,
  AlertTriangle,
  ChevronDown,
  UserCheck,
  Calendar,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Scale,
  Mail,
} from 'lucide-react';

interface TermAccordionItem {
  id: string;
  number: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  content: React.ReactNode;
}

export const TermsOfServicePage: React.FC = () => {
  const termsData: TermAccordionItem[] = [
    {
      id: 'account-terms',
      number: '01',
      title: 'Account Registration & User Eligibility',
      icon: UserCheck,
      summary: 'Rules regarding account creation, accurate pet information, and credential protection.',
      content: (
        <div className="space-y-3 text-sm text-[#445548] leading-relaxed">
          <p>
            By creating an account on Pawfectly, you certify that you are at least 18 years of age or have attained the age of majority in your jurisdiction. You agree to provide accurate, complete, and updated information regarding yourself and any pet companions registered under your profile.
          </p>
          <p>
            You are solely responsible for maintaining the confidentiality of your account credentials and password. Any actions taken through your authenticated account are deemed your responsibility. If you suspect unauthorized access, you must notify Pawfectly immediately at{' '}
            <a
              href="mailto:support@pawfectly.com"
              className="text-[#009E66] font-bold underline"
            >
              support@pawfectly.com
            </a>
            .
          </p>
        </div>
      ),
    },
    {
      id: 'appointments',
      number: '02',
      title: 'Wellness & Grooming Service Appointments',
      icon: Calendar,
      summary: 'Booking protocols, pet health disclosures, and arrival requirements.',
      content: (
        <div className="space-y-3 text-sm text-[#445548] leading-relaxed">
          <p>
            Pawfectly provides an appointment scheduling portal for wellness exams, hygiene grooming, dietary consultations, and behavioral care conducted at our care facility.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#445548]">
            <li><strong>Health Disclosures:</strong> You must accurately report any history of aggression, contagious conditions (e.g. kennel cough), or specialized medical needs prior to your appointment.</li>
            <li><strong>Vaccination Compliance:</strong> Dogs and cats admitted for grooming or in-facility wellness must be up to date on required core vaccines (Rabies, DHPP, FVRCP).</li>
            <li><strong>Arrival Window:</strong> Please arrive 10 minutes before your scheduled appointment slot to allow check-in and pet acclimation.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'orders-pickup',
      number: '03',
      title: 'Product Orders & In-Store Pickup Model',
      icon: ShoppingBag,
      summary: 'Explicit in-store pickup terms: no home delivery, no online payment processing.',
      content: (
        <div className="space-y-3 text-sm text-[#445548] leading-relaxed">
          <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#CBDAC6]/80 text-xs sm:text-sm text-[#009E66] font-semibold leading-relaxed">
            📦 In-Store Collection Policy: All orders placed through Pawfectly are prepared for physical pickup at our designated store location. Pawfectly does not offer shipping or home delivery services.
          </div>
          <p>
            When placing an order on our platform, you are placing a holding reservation for the selected pharmacy supplies, foods, or pet care items.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#445548]">
            <li><strong>Payment Settlement:</strong> Payment is collected directly at our in-store customer service desk at the time you collect your items. We do not charge payment cards online.</li>
            <li><strong>Hold Duration:</strong> Reserved orders are held for a maximum of 5 business days after fulfillment confirmation. Unclaimed orders are returned to general shelf inventory.</li>
            <li><strong>Verification:</strong> Present your Order Confirmation Number or account email at the collection desk upon arrival.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'cancellations',
      number: '04',
      title: 'Cancellations, Rescheduling & No-Shows',
      icon: RotateCcw,
      summary: 'Guidelines for modifying appointments and order reservations.',
      content: (
        <div className="space-y-3 text-sm text-[#445548] leading-relaxed">
          <p>
            We understand plans can change. To respect the schedules of our veterinary and grooming professionals:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#445548]">
            <li><strong>Appointment Notice:</strong> Please provide at least 24 hours advance notice if you need to reschedule or cancel an appointment via your customer dashboard or phone.</li>
            <li><strong>Order Reservation Cancellation:</strong> You may cancel an in-store pickup reservation at any time prior to collection without penalty.</li>
            <li><strong>Repeated No-Shows:</strong> Accounts with repeated unnotified appointment no-shows may require advance in-person deposit for future bookings.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'health-disclaimer',
      number: '05',
      title: 'Pet Health Information & Fur & Facts Disclaimer',
      icon: Sparkles,
      summary: 'Educational content in Fur & Facts is not a substitute for direct veterinary diagnosis.',
      content: (
        <div className="space-y-3 text-sm text-[#445548] leading-relaxed">
          <p>
            The articles, guides, dietary suggestions, and health tips provided under Fur & Facts and on product pages are curated for general pet parent education and preventative wellness awareness only.
          </p>
          <p>
            <strong>Content is not veterinary medical diagnosis:</strong> Always seek the direct guidance of a licensed veterinarian regarding any acute illness, emergency symptoms, medication dosages, or serious clinical conditions.
          </p>
        </div>
      ),
    },
    {
      id: 'prohibited-conduct',
      number: '06',
      title: 'Prohibited Activities & Account Security',
      icon: ShieldAlert,
      summary: 'Platform acceptable use rules and restrictions.',
      content: (
        <div className="space-y-3 text-sm text-[#445548] leading-relaxed">
          <p>You agree not to engage in any of the following prohibited behaviors:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#445548]">
            <li>Submitting false or fictitious appointment requests or bulk reserving inventory without intent to collect.</li>
            <li>Attempting to probe, scan, or reverse engineer any security mechanisms of the Pawfectly web application.</li>
            <li>Using automated scrapers or bots to harvest product catalogs, prices, or health articles.</li>
            <li>Impersonating another customer or veterinary professional.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'liability',
      number: '07',
      title: 'Limitation of Liability & Warranty Disclaimers',
      icon: Scale,
      summary: 'Standard legal liability bounds regarding web platform operation.',
      content: (
        <div className="space-y-3 text-sm text-[#445548] leading-relaxed">
          <p>
            Pawfectly provides this web application on an "as is" and "as available" basis. To the fullest extent permissible by applicable law, Pawfectly disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
          </p>
          <p>
            In no event shall Pawfectly, its founders, veterinarians, or staff be liable for indirect, incidental, or consequential damages resulting from your use of the website or minor inventory scheduling discrepancies.
          </p>
        </div>
      ),
    },
    {
      id: 'modifications',
      number: '08',
      title: 'Changes to Terms & Legal Inquiries',
      icon: Mail,
      summary: 'How updates to these terms are announced and how to contact our legal desk.',
      content: (
        <div className="space-y-3 text-sm text-[#445548] leading-relaxed">
          <p>
            We may revise these Terms of Service periodically to reflect changes in our service offerings, in-store pickup procedures, or regulatory guidelines. Revisions will be posted here with an updated revision date.
          </p>
          <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#CBDAC6]/60 text-xs sm:text-sm space-y-1">
            <p className="font-bold text-[#009E66]">Pawfectly Legal Department</p>
            <p className="text-[#445548]">Email: <a href="mailto:terms@pawfectly.com" className="text-[#009E66] font-semibold underline">terms@pawfectly.com</a></p>
            <p className="text-[#445548]">Postal Address: 104 Wellness Boulevard, Indiranagar, Bengaluru, Karnataka 560038, India</p>
          </div>
        </div>
      ),
    },
  ];

  // State to track open accordions (default first two open)
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'account-terms': true,
    'orders-pickup': true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExpandAll = () => {
    const allOpen = termsData.reduce((acc, item) => {
      acc[item.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setOpenItems(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenItems({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F2] text-[#16241B]">
      <Navbar />

      <main className="flex-1 pb-14">
        {/* Header Hero */}
        <section className="bg-gradient-to-b from-[#1F4B43] to-[#16241B] text-white py-5 sm:py-7 px-4 sm:px-6 lg:px-8 border-b border-[#23382A]">
          <div className="max-w-5xl mx-auto text-center space-y-2.5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Terms of <span className="text-[#EF7C3C]">Service</span>
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
          {/* Draft Disclaimer Notice */}
          <div className="mb-8 p-5 rounded-2xl bg-[#FAF6EE] border-l-4 border-[#EF7C3C] border-y border-r border-[#CBDAC6]/60 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-[#EF7C3C] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-[#445548] leading-relaxed">
              <p className="font-bold text-[#1F4B43] text-sm sm:text-base">
                Operational Draft Notice
              </p>
              <p className="mt-1">
                These terms describe the operating model of Pawfectly's digital appointment booking and in-store pickup platform. This copy is a draft subject to professional legal review and customization before formal enactment.
              </p>
            </div>
          </div>

          {/* Accordion Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#CBDAC6]/60">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1F4B43]">
                Platform Agreement Sections
              </h2>
              <p className="text-xs text-[#5E6E62]">
                Click any section below to expand and review terms details.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExpandAll}
                className="px-3 py-1.5 rounded-lg bg-[#009E66] text-white border border-[#009E66] text-xs font-bold hover:bg-[#008757] transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#CBDAC6] text-xs font-bold text-[#009E66] hover:bg-[#F6F7F2] transition-colors cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Expandable Accordion List */}
          <div className="space-y-4">
            {termsData.map((item) => {
              const isOpen = !!openItems[item.id];
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-white border-[#1F4B43]/50 shadow-sm ring-1 ring-[#1F4B43]/10'
                      : 'bg-white border-[#CBDAC6]/60 hover:border-[#CBDAC6] shadow-2xs'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer focus:outline-hidden"
                  >
                    <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-[#1F4B43]/10 text-[#1F4B43] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {item.number}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-[#1F4B43] shrink-0" />
                          <h3 className="text-base sm:text-lg font-bold text-[#1F4B43]">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-[#5E6E62] mt-1 font-normal line-clamp-1">
                          {item.summary}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full bg-[#F6F7F2] border border-[#CBDAC6]/60 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 bg-[#1F4B43] text-white border-transparent' : 'text-[#1F4B43]'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#CBDAC6]/30 animate-fadeIn">
                      {item.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Help Box */}
          <div className="mt-12 p-6 rounded-2xl bg-white border border-[#CBDAC6]/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-[#009E66]">
                Questions About Our Terms?
              </h4>
              <p className="text-xs text-[#5E6E62]">
                Our support and administration staff are available to assist with any clarification.
              </p>
            </div>
            <a
              href="mailto:terms@pawfectly.com"
              className="px-5 py-2.5 rounded-xl bg-[#009E66] text-white text-xs font-bold hover:bg-[#008756] transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <Mail className="w-3.5 h-3.5 text-[#EF7C3C]" />
              Contact Legal Desk
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
