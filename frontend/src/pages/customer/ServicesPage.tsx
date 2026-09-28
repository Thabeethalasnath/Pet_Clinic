import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { apiClient } from '../../lib/axios';
import { useAuth } from '../../features/auth/AuthContext';
import { GroomingExcellence } from '../../components/services/GroomingExcellence';
import { ServicesGrid } from '../../components/services/ServicesGrid';
import { ServicesFaq } from '../../components/services/ServicesFaq';
import type { ServiceDto } from '../../components/services/services.data';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedServiceId, setHighlightedServiceId] = useState<number | null>(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const prefersReduced = usePrefersReducedMotion();

  const fetchServices = () => {
    setLoading(true);
    setError(null);
    apiClient
      .get('/services')
      .then((res) => {
        setServices(res.data || []);
      })
      .catch(() => {
        setError('Failed to load services. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleBookService = (_service?: ServiceDto) => {
    if (isAuthenticated) {
      navigate('/profile?tab=appointments');
    } else {
      navigate('/login');
    }
  };

  const serviceIconsMap: Record<string, { icon: React.ElementType; bg: string; text: string }> = {
    'Veterinary Care': { icon: Stethoscope, bg: 'bg-[#E6F9EC]', text: 'text-[#009E66]' },
    'Vet Care': { icon: Stethoscope, bg: 'bg-[#E6F9EC]', text: 'text-[#009E66]' },
    'Pet Food & Nutrition': { icon: Utensils, bg: 'bg-[#FEF9C3]', text: 'text-[#B45309]' },
    'Pet Food': { icon: Utensils, bg: 'bg-[#FEF9C3]', text: 'text-[#B45309]' },
    'Professional Grooming': { icon: Scissors, bg: 'bg-[#FFE4E6]', text: 'text-[#E11D48]' },
    'Grooming': { icon: Scissors, bg: 'bg-[#FFE4E6]', text: 'text-[#E11D48]' },
    'Pet Pharmacy & Meds': { icon: Pill, bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]' },
    'Pharmacy': { icon: Pill, bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]' },
    'Toys & Enrichment': { icon: Sparkles, bg: 'bg-[#F3E8FF]', text: 'text-[#7E22CE]' },
    'Boarding & Daycare': { icon: Home, bg: 'bg-[#FFEDD5]', text: 'text-[#C2410C]' },
    'Boarding': { icon: Home, bg: 'bg-[#FFEDD5]', text: 'text-[#C2410C]' },
    'Pet Training & Behaviour': { icon: PawPrint, bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]' },
    'Training': { icon: PawPrint, bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]' },
    'Pet Transport & Ambulance': { icon: Truck, bg: 'bg-[#FCE7F3]', text: 'text-[#BE185D]' },
    'Pet Transport': { icon: Truck, bg: 'bg-[#FCE7F3]', text: 'text-[#BE185D]' },
    'Pet Insurance': { icon: ShieldCheck, bg: 'bg-[#FFEDD5]', text: 'text-[#C2410C]' },
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#16241B] font-sans flex flex-col selection:bg-[#EF7C3C]/20 selection:text-[#EF7C3C] overflow-x-clip relative">
      {/* 1. Sticky Glass Navbar */}
      <Navbar activePage="services" />

      <main className="flex-grow space-y-10 sm:space-y-14 pb-14">
        {/* 2. Hero Section */}
        <section id="services-hero" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            {/* Left Column: Heading & Paragraph (5 cols) */}
            <div className="lg:col-span-5 space-y-6 text-left z-20">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#16241B] tracking-tight leading-[1.15]">
                Services That Make{' '}
                <span className="text-[#EF7C3C]">Tails Wag</span> And Hearts Happy.
              </h1>
              <p className="text-base sm:text-lg text-[#556658] max-w-xl font-medium leading-relaxed">
                Explore our verified range of pet care services designed to keep your furry friends healthy, happy, and loved.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate(isAuthenticated ? '/profile?tab=appointments' : '/login')}
                  className="px-6 py-3 bg-[#009E66] hover:bg-[#008757] text-white font-extrabold rounded-full shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  Book a Vet Visit
                </button>
                <Link to="/pharmacy">
                  <button className="px-6 py-3 bg-white hover:bg-[#FAF6EE] text-[#16241B] border border-[#E5DFCE] font-bold rounded-full shadow-xs transition-all cursor-pointer">
                    Explore Pharmacy
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Column: Large cutout image with light grey messy bg and paw prints (7 cols) */}
            <div className="lg:col-span-7 relative flex justify-center items-center lg:-translate-x-6 xl:-translate-x-10">
              <div className="relative w-full max-w-[700px] lg:max-w-[900px] xl:max-w-[1050px] overflow-visible py-4 sm:py-6 flex justify-center items-center">
                {/* Light grey messy/organic blob backdrop */}
                <div className="absolute inset-2 sm:inset-4 bg-[#E5E7EB]/80 rounded-[42%_58%_70%_30%/45%_45%_55%_55%] transform -rotate-3 scale-105 shadow-inner -z-0" />
                <div className="absolute inset-4 sm:inset-8 bg-[#D1D5DB]/40 rounded-[35%_65%_55%_45%/60%_38%_62%_40%] transform rotate-2 scale-100 blur-xs -z-0" />

                {/* Cat Paw prints around the image */}
                <div className="absolute -top-5 right-14 flex gap-1.5 text-[#6B7280] opacity-50 transform rotate-12 pointer-events-none z-0">
                  <PawPrint className="w-6 h-6 sm:w-8 sm:h-8" />
                  <PawPrint className="w-7 h-7 sm:w-9 sm:h-9 -translate-y-2" />
                </div>
                <div className="absolute top-16 -right-3 sm:-right-8 flex gap-1.5 text-[#9CA3AF] opacity-60 transform -rotate-30 pointer-events-none z-0">
                  <PawPrint className="w-7 h-7 sm:w-9 sm:h-9" />
                  <PawPrint className="w-6 h-6 sm:w-8 sm:h-8 translate-y-2" />
                </div>
                <div className="absolute -bottom-3 left-20 flex gap-1 text-[#6B7280] opacity-50 transform rotate-25 pointer-events-none z-0">
                  <PawPrint className="w-6 h-6 sm:w-8 sm:h-8" />
                  <PawPrint className="w-5 h-5 sm:w-7 sm:h-7 -translate-y-1.5" />
                </div>
                <div className="absolute bottom-4 left-4 sm:left-8 flex gap-1.5 text-[#9CA3AF] opacity-50 transform -rotate-15 pointer-events-none z-0">
                  <PawPrint className="w-7 h-7 sm:w-9 sm:h-9" />
                  <PawPrint className="w-6 h-6 sm:w-8 sm:h-8 translate-y-1.5" />
                </div>

                {/* Main Pets Cutout Image */}
                <img
                  src={getCloudinaryImageUrl('services_hero_cutout')}
                  alt="Pet Care Services"
                  className="w-full h-auto object-contain drop-shadow-xl pointer-events-none relative z-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Our Pet Care Services Dynamic Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF0E6] text-[#EF7C3C] text-xs font-black uppercase tracking-wider">
                  WHAT WE OFFER
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#16241B] tracking-tight">
                  Our Pet Care Services
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-[24px] p-4 border border-[#EDE7D9] space-y-3">
                    <Skeleton className="w-full aspect-[4/3] rounded-[18px]" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <ErrorState message={error} onRetry={fetchServices} />
            ) : services.length === 0 ? (
              <EmptyState
                title="No services found"
                description="We are currently updating our list of available services."
                actionLabel="Check Again"
                onAction={fetchServices}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service) => {
                  const iconConfig = serviceIconsMap[service.name] || {
                    icon: Stethoscope,
                    bg: 'bg-[#E6F9EC]',
                    text: 'text-[#009E66]',
                  };
                  const IconComponent = iconConfig.icon;

                  return (
                    <div
                      key={service.id}
                      className="bg-white rounded-[24px] p-4 border border-[#EDE7D9] shadow-xs hover:shadow-md transition-all flex flex-col group"
                    >
                      <div className="relative w-full aspect-[4/3] rounded-[18px] overflow-hidden bg-[#FAF7F2] border border-[#EAE3D2] p-2">
                        <img
                          src={resolveServiceImageUrl(service)}
                          alt={service.name}
                          className="w-full h-full object-contain rounded-[14px]"
                        />

                        <div
                          className={`absolute top-3 left-3 w-9 h-9 rounded-full ${iconConfig.bg} ${iconConfig.text} flex items-center justify-center shadow-xs border border-white/80`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="pt-4 flex flex-col flex-grow">
                        <h3 className="text-base font-black text-[#16241B] group-hover:text-[#3FA65C] transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-xs text-[#556658] font-medium leading-relaxed mt-1.5 mb-4 flex-grow line-clamp-2">
                          {service.description || service.tagline}
                        </p>
                        <button
                          onClick={() => navigate(isAuthenticated ? '/profile?tab=appointments' : '/login')}
                          className="text-xs font-bold text-[#3FA65C] hover:text-[#2e7d44] transition-colors flex items-center gap-1 mt-auto cursor-pointer"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 4. How It Works Flow */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2.5 mb-6 sm:mb-8">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF0E6] text-[#EF7C3C] text-xs font-black uppercase tracking-wider">
              HOW IT WORKS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#16241B] tracking-tight">
              Simple Steps, Happy Pets
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
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#E6F9EC] border-2 border-dashed border-[#3FA65C] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                      <StepIcon className="w-9 h-9 sm:w-10 sm:h-10 text-[#16241B]" />
                    </div>

                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#16241B] text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                      {stepItem.step}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#16241B]">
                    {stepItem.title}
                  </h3>
                  <p className="text-xs text-[#556658] font-medium max-w-[220px] leading-relaxed mt-1.5">
                    {stepItem.description}
                  </p>

                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden md:flex absolute top-10 -right-4 lg:-right-6 w-8 lg:w-12 items-center justify-center pointer-events-none z-10 text-[#16241B]/40">
                      <ArrowRight className="w-5 h-5 text-[#3FA65C]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        {/* 5. CTA Banner */}
        <section id="cta" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <div className="bg-[#FFCA28] rounded-[36px] p-6 sm:p-8 lg:p-10 relative overflow-visible shadow-[0_20px_50px_rgba(255,202,40,0.28)] border border-[#F5C222]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#16241B] tracking-tight leading-[1.15]">
                  Pamper Your Pet With The{' '}
                  <span
                    className="text-[#EF7C3C]"
                    style={{ WebkitTextStroke: '0.75px #16241B' }}
                  >
                    Best Care
                  </span>{' '}
                  They Deserve!
                </h2>
                <p className="text-base sm:text-lg text-[#3E3A1A] max-w-xl font-medium leading-relaxed">
                  From health to happiness, we're here for every step of your pet's journey.
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  <button
                    onClick={() => navigate('/vets')}
                    className="px-7 py-3.5 bg-[#009E66] hover:bg-[#008757] text-white font-bold rounded-full shadow-md transition-all flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                  >
                    Talk to Vet
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center items-end relative z-20 overflow-visible">
                <div className="relative w-full max-w-[280px] sm:max-w-[330px] lg:max-w-[370px] flex justify-center items-end overflow-visible -mt-20 sm:-mt-28 lg:-mt-36 -mb-6 sm:-mb-10 lg:-mb-12 translate-y-5 sm:translate-y-7 lg:translate-y-8 pointer-events-none">
                  <img
                    src={getCloudinaryImageUrl('services_cta')}
                    alt="Pet Services Care"
                    className="relative z-10 max-w-[220px] sm:max-w-[350px] max-h-[350px] sm:max-h-[500px] w-auto h-auto object-contain -mt-8 sm:-mt-12 pointer-events-none drop-shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <Footer />
    </div>
  );
};

export default ServicesPage;
