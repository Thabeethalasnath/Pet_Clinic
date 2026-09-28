import React, { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import {
  Mail,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Package,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface ContactFormData {
  fullName: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  category?: string;
  subject?: string;
  message?: string;
}

const COMMON_REASONS = [
  {
    label: 'Order & Pickup Status',
    category: 'Orders & In-Store Pickup',
    subject: 'Question about my in-store pickup order',
    icon: Package,
  },
  {
    label: 'Appointment Rescheduling',
    category: 'Service Appointments',
    subject: 'Request to reschedule pet care appointment',
    icon: Calendar,
  },
  {
    label: 'Pet Profile / Health Records',
    category: 'Pet Profile & Account',
    subject: 'Need help updating my pet profile details',
    icon: Sparkles,
  },
  {
    label: 'Pharmacy & Stock Inquiry',
    category: 'Pharmacy & Essentials',
    subject: 'Inquiry regarding pharmacy item availability',
    icon: ShieldCheck,
  },
];

export const ContactSupportPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    category: 'General Support',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submittedViaMailto, setSubmittedViaMailto] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Please enter your full name.';
    }
    if (!formData.email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email format (e.g. name@example.com).';
    }
    if (!formData.subject.trim()) {
      errs.subject = 'Please specify a subject for your inquiry.';
    }
    if (!formData.message.trim()) {
      errs.message = 'Please provide details about your inquiry.';
    } else if (formData.message.trim().length < 15) {
      errs.message = 'Please describe your request in at least 15 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleShortcutClick = (category: string, subject: string) => {
    setFormData((prev) => ({
      ...prev,
      category,
      subject,
    }));
    // Clear field-specific errors if set
    setErrors((prev) => ({ ...prev, category: undefined, subject: undefined }));

    const formElement = document.getElementById('contact-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Direct mailto generation with fields
    const supportEmail = 'support@pawfectly.com';
    const emailSubject = `[${formData.category}] ${formData.subject.trim()}`;
    const emailBody = `Sender Name: ${formData.fullName.trim()}
Sender Email: ${formData.email.trim()}
Category: ${formData.category}

Message:
${formData.message.trim()}

------------------------------------
Sent via Pawfectly Web Contact Support Assistant`;

    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

    setSubmittedViaMailto(true);

    // Launch mail client
    window.location.href = mailtoUrl;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@pawfectly.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F2] text-[#16241B]">
      <Navbar />

      <main className="flex-1 pb-12">
        {/* Top Header Banner */}
        <section className="bg-gradient-to-b from-[#1F4B43] to-[#16241B] text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-[#23382A]">
          <div className="max-w-5xl mx-auto text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Need Help? <span className="text-[#EF7C3C]">We're Here For You.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#CBDAC6] max-w-2xl mx-auto leading-relaxed">
              Have questions about your in-store pickup, service appointments, or pet care profile? Our dedicated care team is ready to assist you.
            </p>
          </div>
        </section>

        {/* 2-Column Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Conversational Form */}
            <div
              id="contact-form-section"
              className="lg:col-span-7 bg-white rounded-2xl border border-[#CBDAC6]/60 shadow-xs p-5 sm:p-7 space-y-5"
            >
              <div className="border-b border-[#CBDAC6]/40 pb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1F4B43] flex items-center gap-2.5">
                  <Send className="w-5 h-5 text-[#EF7C3C]" />
                  Send Our Team a Message
                </h2>
                <p className="text-xs sm:text-sm text-[#445548] mt-1">
                  Fill out the form below. Submitting will pre-format and open your message in your default email client.
                </p>
              </div>

              {submittedViaMailto && (
                <div className="p-4 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Email Client Triggered!</p>
                    <p className="text-xs text-[#166534] mt-0.5">
                      Your message has been pre-formatted for <strong>support@pawfectly.com</strong>. If your email app did not open automatically, you can copy our email address from the quick contact card on the right.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1F4B43] mb-1.5">
                    Your Name <span className="text-[#EF7C3C]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maya Lin"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 bg-[#F6F7F2]/50 ${
                      errors.fullName
                        ? 'border-[#EF7C3C] focus:ring-[#EF7C3C]/20'
                        : 'border-[#CBDAC6] focus:border-[#1F4B43] focus:ring-[#1F4B43]/15'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-[#EF7C3C] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1F4B43] mb-1.5">
                    Email Address <span className="text-[#EF7C3C]">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. maya@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 bg-[#F6F7F2]/50 ${
                      errors.email
                        ? 'border-[#EF7C3C] focus:ring-[#EF7C3C]/20'
                        : 'border-[#CBDAC6] focus:border-[#1F4B43] focus:ring-[#1F4B43]/15'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-[#EF7C3C] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Inquiry Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1F4B43] mb-1.5">
                    Inquiry Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[#CBDAC6] text-sm text-[#16241B] bg-[#F6F7F2]/50 focus:outline-hidden focus:border-[#1F4B43] focus:ring-2 focus:ring-[#1F4B43]/15 transition-all"
                  >
                    <option value="General Support">General Inquiries</option>
                    <option value="Orders & In-Store Pickup">
                      Orders & In-Store Pickup
                    </option>
                    <option value="Service Appointments">
                      Service Appointments & Grooming
                    </option>
                    <option value="Pet Profile & Account">
                      Pet Profile & Account Management
                    </option>
                    <option value="Pharmacy & Essentials">
                      Pharmacy Supplies & Restock Questions
                    </option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1F4B43] mb-1.5">
                    Subject <span className="text-[#EF7C3C]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Brief summary of what you need help with"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 bg-[#F6F7F2]/50 ${
                      errors.subject
                        ? 'border-[#EF7C3C] focus:ring-[#EF7C3C]/20'
                        : 'border-[#CBDAC6] focus:border-[#1F4B43] focus:ring-[#1F4B43]/15'
                    }`}
                  />
                  {errors.subject && (
                    <p className="text-xs text-[#EF7C3C] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1F4B43] mb-1.5">
                    Message Details <span className="text-[#EF7C3C]">*</span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Please include relevant order numbers, appointment dates, or pet names to help us respond faster..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 bg-[#F6F7F2]/50 ${
                      errors.message
                        ? 'border-[#EF7C3C] focus:ring-[#EF7C3C]/20'
                        : 'border-[#CBDAC6] focus:border-[#1F4B43] focus:ring-[#1F4B43]/15'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-xs text-[#EF7C3C] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.message}
                    </p>
                  )}
                </div>

                {/* Submission notice */}
                <div className="p-3.5 bg-[#FAF6EE] rounded-xl border border-[#CBDAC6]/60 text-xs text-[#445548] leading-relaxed">
                  <span className="font-bold text-[#1F4B43]">Routing Notice:</span> Inquiries are directly routed to our central care desk. Clicking <em>Submit Inquiry</em> will generate your pre-filled message in your default email application.
                </div>

                {/* Submit button */}
                <div>
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-[#009E66] hover:bg-[#008756] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-[#EF7C3C]" />
                    Submit Inquiry (Open Email)
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Quick Contact Cards & Shortcuts */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 1: Direct Support Channels */}
              <div className="bg-white rounded-2xl border border-[#CBDAC6]/60 shadow-xs p-6 space-y-5">
                <h3 className="text-base font-bold text-[#1F4B43] flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#EF7C3C]" />
                  Direct Contact Information
                </h3>

                <div className="space-y-4 text-sm text-[#445548]">
                  {/* Email */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F6F7F2] border border-[#CBDAC6]/40">
                    <Mail className="w-5 h-5 text-[#1F4B43] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#1F4B43] uppercase tracking-wider">
                        Support Desk Email
                      </p>
                      <p className="font-semibold text-[#16241B] truncate">
                        support@pawfectly.com
                      </p>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="text-xs text-[#1F4B43] font-bold hover:underline mt-1 inline-flex items-center gap-1"
                      >
                        {copiedEmail ? '✓ Copied to clipboard' : 'Copy email address'}
                      </button>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F6F7F2] border border-[#CBDAC6]/40">
                    <Clock className="w-5 h-5 text-[#1F4B43] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#1F4B43] uppercase tracking-wider">
                        Care Center Hours
                      </p>
                      <p className="text-xs text-[#16241B] font-medium mt-0.5">
                        Mon – Fri: 8:00 AM – 8:00 PM
                      </p>
                      <p className="text-xs text-[#16241B] font-medium">
                        Sat – Sun: 9:00 AM – 6:00 PM
                      </p>
                      <p className="text-[11px] text-[#5E6E62] mt-0.5">
                        (Pickup desk is staffed during all operating hours)
                      </p>
                    </div>
                  </div>

                  {/* Physical Center */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F6F7F2] border border-[#CBDAC6]/40">
                    <MapPin className="w-5 h-5 text-[#1F4B43] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#1F4B43] uppercase tracking-wider">
                        Care Center & Pickup Counter
                      </p>
                      <p className="text-xs text-[#16241B] font-medium mt-0.5">
                        104 Wellness Boulevard, Indiranagar
                      </p>
                      <p className="text-xs text-[#5E6E62]">
                        Bengaluru, Karnataka 560038, India
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Quick Reason Shortcuts */}
              <div className="bg-white rounded-2xl border border-[#CBDAC6]/60 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#1F4B43] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#EF7C3C]" />
                    Quick Fill Shortcuts
                  </h3>
                  <span className="text-[11px] font-semibold text-[#5E6E62]">
                    Click to pre-fill
                  </span>
                </div>

                <p className="text-xs text-[#445548] leading-relaxed">
                  Select a common topic below to instantly load the category and subject into the form:
                </p>

                <div className="space-y-2.5">
                  {COMMON_REASONS.map((r, i) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleShortcutClick(r.category, r.subject)}
                        className="w-full text-left p-3 rounded-xl border border-[#CBDAC6]/60 bg-[#FAF6EE] hover:bg-[#F6F7F2] hover:border-[#1F4B43] transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-[#1F4B43] group-hover:text-[#EF7C3C] transition-colors" />
                          <span className="text-xs font-bold text-[#1F4B43] group-hover:text-[#16241B]">
                            {r.label}
                          </span>
                        </div>
                        <span className="text-xs text-[#EF7C3C] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          Apply →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
