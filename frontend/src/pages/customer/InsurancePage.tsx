import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { getCloudinaryImageUrl } from '../../lib/utils';
import { useAuth } from '../../features/auth/AuthContext';
import api from '../../lib/axios';
import {
  ShieldCheck,
  Clock,
  Heart,
  Users,
  FileText,
  Receipt,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Shield,
  Zap,
  X,
  Send,
  Loader2,
} from 'lucide-react';

export const InsurancePage: React.FC = () => {
  const { user } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({
    customerName: '',
    petName: '',
    petType: 'Dog',
    ageYears: '2',
    email: '',
    phone: '',
  });
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenQuote = (planName: string) => {
    setSelectedPlan(planName);
    setQuoteFormData({
      customerName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      petName: '',
      petType: 'Dog',
      ageYears: '2',
    });
    setIsQuoteModalOpen(true);
    setQuoteSubmitted(false);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !quoteFormData.email.trim() ||
      !quoteFormData.petName.trim() ||
      !quoteFormData.customerName.trim() ||
      !quoteFormData.phone.trim()
    ) {
      showToast('Please fill in all required fields including phone number.');
      return;
    }
    setQuoteSubmitting(true);
    try {
      await api.post('/insurance/quote', {
        customerName: quoteFormData.customerName.trim(),
        customerEmail: quoteFormData.email.trim(),
        customerPhone: quoteFormData.phone.trim(),
        petName: quoteFormData.petName.trim(),
        petSpecies: quoteFormData.petType.trim(),
        petAge: parseInt(quoteFormData.ageYears, 10) || 0,
        selectedPlan: selectedPlan || 'Standard',
      });
      setQuoteSubmitted(true);
      showToast(`Quote request for ${quoteFormData.petName} submitted successfully!`);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).join(', ')
          : 'Failed to submit quote request. Please try again.');
      showToast(errorMsg);
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const plans = [
    {
      id: 'plan-basic',
      name: 'Basic',
      badge: 'Accident Only',
      price: '₹499',
      period: '/month',
      description: 'Essential emergency protection for accidental injuries and sudden trauma.',
      isPopular: false,
      cardBg: 'bg-white',
      border: 'border-[#EDE7D9]',
      accentBg: 'bg-[#F3E8FF]',
      accentText: 'text-[#7E22CE]',
      features: [
        'Accident & emergency surgery coverage',
        'X-rays, ultrasounds & trauma diagnostics',
        'Prescription medications for accidents',
        '24/7 emergency veterinary hotline',
      ],
      ctaText: 'Get Started',
      ctaStyle: 'bg-white hover:bg-[#FFF0E6] hover:border-[#EF7C3C]/40 hover:text-[#EF7C3C] text-[#16241B] border border-[#E5DFCE]',
    },
    {
      id: 'plan-standard',
      name: 'Standard',
      badge: 'Most Popular',
      price: '₹999',
      period: '/month',
      description: 'Complete accident and comprehensive illness coverage for complete peace of mind.',
      isPopular: true,
      cardBg: 'bg-white',
      border: 'border-2 border-[#3FA65C]',
      accentBg: 'bg-[#E6F9EC]',
      accentText: 'text-[#009E66]',
      features: [
        'Everything in Basic coverage',
        'Chronic illness & infection treatments',
        'Hospitalization & specialized intensive care',
        'Prescription medications & therapies',
        'Diagnostic lab tests & specialist visits',
      ],
      ctaText: 'Get Started',
      ctaStyle: 'bg-[#009E66] hover:bg-[#008757] text-white shadow-md',
    },
    {
      id: 'plan-comprehensive',
      name: 'Comprehensive',
      badge: 'Full Wellness',
      price: '₹1,799',
      period: '/month',
      description: 'Total protection combining illness, accidents, routine wellness, and dental care.',
      isPopular: false,
      cardBg: 'bg-white',
      border: 'border-[#EDE7D9]',
      accentBg: 'bg-[#FEF9C3]',
      accentText: 'text-[#B45309]',
      features: [
        'Everything in Standard coverage',
        'Annual wellness exams & bloodwork',
        'Core vaccinations & parasite preventatives',
        'Dental cleaning & periodontal care',
        'Microchipping & behavioral therapy support',
      ],
      ctaText: 'Get Started',
      ctaStyle: 'bg-white hover:bg-[#FFF0E6] hover:border-[#EF7C3C]/40 hover:text-[#EF7C3C] text-[#16241B] border border-[#E5DFCE]',
    },
  ];

  const valueFeatures = [
    {
      icon: ShieldCheck,
      bg: 'bg-[#E6F9EC]',
      text: 'text-[#009E66]',
      title: 'Accident & Illness Coverage',
      description: 'Protection against unexpected vet bills, trauma, and chronic conditions.',
    },
    {
      icon: Heart,
      bg: 'bg-[#FFE4E6]',
      text: 'text-[#E11D48]',
      title: 'Peace of Mind',
      description: "Focus purely on your pet's recovery and health, not hospital costs.",
    },
    {
      icon: Clock,
      bg: 'bg-[#FEF9C3]',
      text: 'text-[#B45309]',
      title: 'Fast Claims',
      description: 'Quick digital claims processing with direct reimbursement in days.',
    },
    {
      icon: Users,
      bg: 'bg-[#E0F2FE]',
      text: 'text-[#0284C7]',
      title: 'Trusted Network',
      description: 'Works with any licensed veterinarian, specialist, or emergency clinic.',
    },
  ];

  const howItWorksSteps = [
    {
      step: '01',
      icon: FileText,
      title: 'Choose a Plan',
      description: 'Pick the coverage tier that fits your pet’s lifestyle and budget.',
    },
    {
      step: '02',
      icon: Heart,
      title: 'Visit Any Vet',
      description: 'Take your pet to any licensed clinic, hospital, or emergency center.',
    },
    {
      step: '03',
      icon: Receipt,
      title: 'Submit a Claim',
      description: 'Snap a photo of your paid vet invoice and upload it in seconds.',
    },
    {
      step: '04',
      icon: CheckCircle2,
      title: 'Get Reimbursed',
      description: 'Receive your claim payout directly into your bank account quickly.',
    },
  ];

  const faqs = [
    {
      question: 'What does Pawfectly pet insurance cover?',
      answer:
        'Pawfectly plans cover accidents, unexpected illnesses, surgeries, diagnostic tests, hospital stays, and prescription medications. Our Comprehensive plan also includes preventative wellness care, vaccinations, and dental checkups.',
    },
    {
      question: 'Are pre-existing conditions covered?',
      answer:
        'Like standard pet insurance policies, pre-existing conditions that showed symptoms before enrollment or during waiting periods are not covered. However, curable conditions that have been symptom-free for 12 months may be eligible for coverage.',
    },
    {
      question: 'How long does a claim take to process?',
      answer:
        'Most claims submitted with all required medical records and itemized invoices are reviewed and approved within 2 to 5 business days, with payouts transferred directly to your registered bank account.',
    },
    {
      question: 'Can I visit any veterinarian of my choice?',
      answer:
        'Yes! You are free to visit any licensed veterinarian, emergency veterinary hospital, or board-certified specialist anywhere in India without network restrictions.',
    },
    {
      question: 'Is there a waiting period before coverage begins?',
      answer:
        'Accident coverage typically starts 48 hours after plan enrollment. Illness coverage begins after a 14-day waiting period, and cruciate ligament coverage begins after 6 months.',
    },
    {
      question: 'Can I change or cancel my plan anytime?',
      answer:
        'Yes, you can upgrade, downgrade, or cancel your pet insurance policy at any time through your customer portal account with no hidden cancellation fees.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] text-[#16241B] font-sans flex flex-col">
        <Navbar activePage="insurance" />
        <main className="flex-grow flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#E6F9EC] border border-[#C3ECD0] flex items-center justify-center text-[#009E66] shadow-sm animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-[#009E66]" />
          </div>
          <p className="text-sm font-black text-[#16241B] tracking-tight">
            Loading Pet Insurance Options...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#16241B] font-sans flex flex-col">
      <Navbar activePage="insurance" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#16241B] text-white px-4 py-2.5 rounded-full shadow-lg text-xs font-bold flex items-center gap-2 transition-all">
          <Check className="w-4 h-4 text-[#3FA65C]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-grow space-y-16 lg:space-y-24 pb-20">
        {/* 2. Hero Section */}
        <section id="insurance-hero" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            <div className="lg:col-span-5 space-y-6 text-left z-20">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E6F9EC] text-[#009E66] text-xs font-black uppercase tracking-wider shadow-2xs border border-[#C3ECD0]">
                <Shield className="w-3.5 h-3.5 text-[#009E66]" />
                <span>PET INSURANCE</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#16241B] tracking-tight leading-[1.15]">
                Protect Them Today, For{' '}
                <span className="text-[#009E66]">Every Tomorrow</span>
                <span className="text-[#16241B]">.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#556658] max-w-xl font-medium leading-relaxed">
                Comprehensive coverage for accidents, illness, and routine care
                — because peace of mind shouldn't be optional.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => handleOpenQuote('Standard')}
                  className="px-8 py-3.5 bg-[#009E66] hover:bg-[#008757] text-white font-black rounded-full shadow-md transition-all flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  Get a Quote
                </button>
                <a
                  href="#how-it-works"
                  className="px-7 py-3.5 bg-white hover:bg-[#FFF0E6] hover:border-[#EF7C3C]/40 hover:text-[#EF7C3C] text-[#16241B] border border-[#E5DFCE] font-bold rounded-full shadow-xs transition-all flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  How It Works
                </a>
              </div>

              {/* Trust Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#E6F9EC] text-[#009E66] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#16241B]">No Hidden Fees</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#16241B]">Fast Claim Approval</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#16241B]">24/7 Support</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#FEF9C3] text-[#B45309] flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#16241B]">25,000+ Pet Parents</span>
                </div>
              </div>
            </div>

            {/* Right Column: Large hero image (7 cols) - Moved right */}
            <div className="lg:col-span-7 relative flex justify-center lg:justify-end items-center lg:translate-x-4 xl:translate-x-8 z-10">
              <div className="relative w-full max-w-[800px] lg:max-w-[1000px] xl:max-w-[1180px] overflow-visible py-2 sm:py-4">
                <img
                  src={getCloudinaryImageUrl('insurance_hero')}
                  alt="Pet Insurance Protection"
                  className="w-full h-auto object-contain drop-shadow-2xl pointer-events-none scale-105 sm:scale-110"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Choose Your Plan */}
        <section id="plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF0E6] text-[#EF7C3C] text-xs font-black uppercase tracking-wider">
                PLANS & PRICING
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#16241B] tracking-tight">
                Choose the Right Coverage for Your Pet
              </h2>
              <p className="text-xs sm:text-sm text-[#556658] font-medium">
                Transparent monthly plans designed to protect your pet through every adventure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-[28px] p-6 sm:p-8 flex flex-col justify-between transition-all relative ${plan.cardBg
                    } ${plan.border} ${plan.isPopular
                      ? 'shadow-xl ring-4 ring-[#3FA65C]/10 scale-102 lg:-translate-y-2'
                      : 'shadow-xs hover:shadow-md'
                    }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#3FA65C] text-white px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-xs">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="text-xl font-black text-[#16241B]">{plan.name}</h3>
                      {!plan.isPopular && (
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${plan.accentBg} ${plan.accentText}`}
                        >
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#556658] font-medium mb-6 leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="mb-6 pb-6 border-b border-[#F0EAE1]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-[#16241B]">
                          {plan.price}
                        </span>
                        <span className="text-xs font-semibold text-[#88998C]">
                          {plan.period}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <span className="text-xs font-black uppercase text-[#16241B] tracking-wider block">
                        What's Included:
                      </span>
                      {plan.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs text-[#334437]">
                          <div className="w-4 h-4 rounded-full bg-[#E6F9EC] text-[#009E66] flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="font-medium leading-snug">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenQuote(plan.name)}
                    className={`w-full py-3.5 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer ${plan.ctaStyle}`}
                  >
                    {plan.ctaText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Why Pet Insurance Matters */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#16241B] tracking-tight">
                Why Pet Insurance Matters
              </h2>
              <p className="text-xs sm:text-sm text-[#556658] font-medium">
                Never let treatment costs stand in the way of providing the best healthcare for your pets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {valueFeatures.map((feat, idx) => {
                const FeatIcon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-[24px] p-6 border border-[#EDE7D9] shadow-xs hover:shadow-md transition-all flex flex-col items-start"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl ${feat.bg} ${feat.text} flex items-center justify-center mb-4 shadow-xs`}
                    >
                      <FeatIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black text-[#16241B] mb-2">{feat.title}</h3>
                    <p className="text-xs text-[#556658] font-medium leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. How It Works */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF0E6] text-[#EF7C3C] text-xs font-black uppercase tracking-wider">
              HOW IT WORKS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#16241B] tracking-tight">
              Simple Steps to Full Protection
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative items-start">
            {howItWorksSteps.map((stepItem, index) => {
              const StepIcon = stepItem.icon;
              return (
                <div
                  key={stepItem.step}
                  className="flex flex-col items-center text-center relative group"
                >
                  <div className="relative mb-5">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-2 border-dashed border-[#3FA65C] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                      <StepIcon className="w-8 h-8 text-[#3FA65C]" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#16241B] text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                      {stepItem.step}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#16241B]">{stepItem.title}</h3>
                  <p className="text-xs text-[#556658] font-medium max-w-[220px] leading-relaxed mt-1.5">
                    {stepItem.description}
                  </p>

                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden md:flex absolute top-10 -right-4 lg:-right-6 w-8 lg:w-12 items-center justify-center pointer-events-none z-10 text-[#3FA65C]">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#16241B] tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-[#556658] font-medium">
                Clear answers to help you choose with total confidence.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-[#EDE7D9] overflow-hidden shadow-2xs transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left gap-4 cursor-pointer hover:bg-[#FAF6EE]/50 transition-colors"
                    >
                      <span className="text-sm sm:text-base font-black text-[#16241B]">
                        {faq.question}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-[#FAF6EE] flex items-center justify-center text-[#16241B] shrink-0">
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-[#556658] font-medium leading-relaxed border-t border-[#F0EAE1]">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. CTA Banner */}
        <section id="cta" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-[#FFCA28] rounded-[36px] p-6 sm:p-10 lg:p-12 relative overflow-visible shadow-[0_20px_50px_rgba(255,202,40,0.28)] border border-[#F5C222]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#16241B] tracking-tight leading-[1.15]">
                  Give Them the Protection{' '}
                  <span
                    className="text-[#EF7C3C]"
                    style={{ WebkitTextStroke: '0.75px #16241B' }}
                  >
                    They Deserve
                  </span>
                  <span className="text-[#16241B]">.</span>
                </h2>

                <p className="text-base sm:text-lg text-[#3E3A1A] max-w-xl font-medium leading-relaxed">
                  Get a personalized quote in under 2 minutes.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => handleOpenQuote('Comprehensive')}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#009E66] hover:bg-[#008757] text-white font-black rounded-full shadow-md transition-all text-sm sm:text-base cursor-pointer"
                  >
                    Get Your Free Quote
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center items-center relative z-20 overflow-visible">
                <div className="relative w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[420px] h-[220px] sm:h-[280px] lg:h-[310px] flex justify-center items-center overflow-visible">
                  <img
                    src={getCloudinaryImageUrl('insurance_cta')}
                    alt="Pet Insurance Protection"
                    className="relative z-10 w-[140%] max-w-[520px] sm:max-w-[480px] lg:max-w-[550px] h-auto object-contain scale-105 lg:scale-100 -mt-12 sm:-mt-15 -mb-2 -translate-y-[3px] rounded-br-[36px] pointer-events-none drop-shadow-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quote Consultation Request Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#EDE7D9] shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#16241B]">
                  {quoteSubmitted ? 'Quote Request Received!' : `Get a Quote (${selectedPlan} Plan)`}
                </h3>
                <p className="text-xs text-[#556658] mt-0.5">
                  {quoteSubmitted
                    ? 'Our pet coverage specialist will reach out with customized estimates.'
                    : 'Fill in your pet details to receive immediate personalized rates.'}
                </p>
              </div>
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#FAF6EE] text-[#88998C] hover:text-[#16241B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quoteSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#E6F9EC] text-[#009E66] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#16241B]">
                    Thank you! We have sent a confirmation to {quoteFormData.email}.
                  </p>
                  <p className="text-xs text-[#556658]">
                    We will prepare policy options for {quoteFormData.petName} with zero obligation.
                  </p>
                </div>
                <button
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-6 py-2.5 bg-[#3FA65C] hover:bg-[#348e4e] text-white font-bold text-xs rounded-full shadow-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuote} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#16241B] mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={quoteFormData.customerName}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, customerName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#E5DFCE] text-sm text-[#16241B] focus:outline-hidden focus:ring-2 focus:ring-[#3FA65C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#16241B] mb-1">
                    Pet Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leo"
                    value={quoteFormData.petName}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, petName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#E5DFCE] text-sm text-[#16241B] focus:outline-hidden focus:ring-2 focus:ring-[#3FA65C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#16241B] mb-1">
                      Species
                    </label>
                    <select
                      value={quoteFormData.petType}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, petType: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#E5DFCE] text-sm text-[#16241B] focus:outline-hidden focus:ring-2 focus:ring-[#3FA65C]"
                    >
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Rabbit">Rabbit</option>
                      <option value="Bird">Bird</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#16241B] mb-1">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="25"
                      required
                      value={quoteFormData.ageYears}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, ageYears: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#E5DFCE] text-sm text-[#16241B] focus:outline-hidden focus:ring-2 focus:ring-[#3FA65C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#16241B] mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={quoteFormData.email}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#E5DFCE] text-sm text-[#16241B] focus:outline-hidden focus:ring-2 focus:ring-[#3FA65C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#16241B] mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={quoteFormData.phone}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#E5DFCE] text-sm text-[#16241B] focus:outline-hidden focus:ring-2 focus:ring-[#3FA65C]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQuoteModalOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-[#FAF6EE] text-[#16241B] font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={quoteSubmitting}
                    className="px-6 py-2.5 rounded-full bg-[#009E66] hover:bg-[#008757] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-70"
                  >
                    {quoteSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Submit Quote Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
