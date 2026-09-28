import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { CtaBanner } from '../../components/layout/CtaBanner';
import { Testimonials } from '../../components/home/Testimonials';
import { StatsStrip } from '../../components/home/StatsStrip';
import { TrustMarquee } from '../../components/TrustMarquee';
import { ServicesShowcase } from '../../components/home/ServicesShowcase';
import { HowItWorks } from '../../components/home/HowItWorks';
import { VetCarousel } from '../../components/vets/VetCarousel';
import { initialVetsData, type VetData, type PetType } from '../../data/vetsData';
import { getCloudinaryImageUrl, getVetImageUrl } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../lib/axios';
import { Reveal } from '../../components/motion/Reveal';
import { ParallaxLayer } from '../../components/motion/ParallaxLayer';

export const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [vets, setVets] = useState<VetData[]>(initialVetsData);
  const navigate = useNavigate();

  // Cloudinary image assets
  const heroCloudinaryUrl = getCloudinaryImageUrl('hero_dog_cat_green_bg');
  const avatar1Url = getCloudinaryImageUrl('avatar_user_1');
  const avatar2Url = getCloudinaryImageUrl('avatar_user_2');
  const avatar3Url = getCloudinaryImageUrl('avatar_user_3');
  const avatar4Url = getCloudinaryImageUrl('avatar_user_4');

  const fetchHomeData = () => {
    apiClient
      .get('/vets')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped: VetData[] = res.data.map((v: any) => ({
            id: v.id,
            name: v.name,
            specialty: v.specialization || v.specialty || 'General Veterinarian',
            subSpecialty: v.secondarySpecialization || v.subSpecialty || '',
            experienceYears: v.experienceYears || 0,
            fee: v.consultationFee || 500,
            image: getVetImageUrl(v.name, v.photoUrl, v.id),
            petTypes: (v.petTypes ? v.petTypes.toLowerCase().split(/,\s*/) : ['dogs', 'cats']) as PetType[],
            availability: 'available',
            rating: typeof v.rating === 'number' && v.rating > 0 ? v.rating : undefined,
            reviewsCount: typeof v.reviewsCount === 'number' && v.reviewsCount > 0 ? v.reviewsCount : undefined,
          }));
          setVets(mapped);
        }
      })
      .catch(() => {
        setVets(initialVetsData);
      });
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#16241B] flex flex-col font-sans selection:bg-[#EF7C3C]/20 selection:text-[#EF7C3C] overflow-x-clip relative">
      {/* 1. Navbar */}
      <Navbar activePage="home" />

      {/* Decorative Parallax Layers (Positioned safely behind content) */}
      <ParallaxLayer
        speed={0.15}
        size={64}
        type="paw"
        rotate={12}
        className="top-[950px] -left-6 lg:left-8"
      />
      <ParallaxLayer
        speed={0.25}
        size={180}
        type="blob-yellow"
        className="top-[1400px] right-0 sm:right-12"
      />
      <ParallaxLayer
        speed={0.3}
        size={54}
        type="paw-angled"
        rotate={-20}
        className="top-[2100px] left-4 lg:left-20"
      />
      <ParallaxLayer
        speed={0.2}
        size={220}
        type="blob-green"
        className="top-[2800px] -right-12"
      />
      <ParallaxLayer
        speed={0.35}
        size={40}
        type="circle-orange"
        className="top-[3400px] left-8 sm:left-28"
      />

      <main className="flex-1 space-y-16 md:space-y-24 py-8 md:py-12 relative z-10">
        {/* 2. Hero Section */}
        <section id="home" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            {/* Hero Left Content (5 cols) */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left z-20">
              <Badge variant="orange" className="inline-flex">
                ALL THE LOVE. ALL THE CARE.
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#16241B] leading-[1.1] font-sans">
                Because Your Pet Has{' '}
                <span className="text-[#EF7C3C]">Better Taste</span> Than You.
              </h1>

              <p className="text-base sm:text-lg text-[#445548] max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Expert vets, ridiculously good food, toys, treats and everything
                your furry roommate needs — all in one happy place.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#vets"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('vets');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <Button variant="primary" size="lg" showPaw>
                    Find a Vet
                  </Button>
                </a>
                <Link to="/pharmacy">
                  <Button variant="secondary" size="lg">
                    Shop Essentials
                  </Button>
                </Link>
              </div>

              {/* Social Proof Row */}
              <div className="flex items-center justify-center lg:justify-start gap-3 pt-4">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-[#FAF6EE] object-cover object-top shadow-xs"
                    src={avatar1Url}
                    alt="Pet Parent 1"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-[#FAF6EE] object-cover object-top shadow-xs"
                    src={avatar2Url}
                    alt="Pet Parent 2"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-[#FAF6EE] object-cover object-top shadow-xs"
                    src={avatar3Url}
                    alt="Pet Parent 3"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-[#FAF6EE] object-cover object-top shadow-xs"
                    src={avatar4Url}
                    alt="Pet Parent 4"
                  />
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#334437]">
                  Loved by 25,000+<br />
                  pets & parents
                </span>
              </div>
            </div>

            {/* Hero Right Visual Stack */}
            <div className="lg:col-span-7 relative flex justify-center lg:justify-end items-center lg:translate-x-14 xl:translate-x-20">
              <div className="relative w-full max-w-[1000px] lg:max-w-[1350px] flex items-center justify-center lg:justify-end overflow-visible py-6 sm:py-8">
                {/* Main Hero Cutout Image */}
                <div className="w-full relative flex items-center justify-center lg:justify-end overflow-visible z-10">
                  <img
                    src={heroCloudinaryUrl}
                    alt="Dog and Cat"
                    className="w-full max-h-[680px] sm:max-h-[780px] lg:max-h-[880px] scale-110 lg:scale-120 object-contain drop-shadow-2xl origin-right"
                  />
                </div>

                {/* Floating Callout Cards */}
                <div className="absolute -top-6 left-[22%] sm:left-[26%] -translate-x-1/2 bg-[#EE9D1A] border border-[#D98A00] text-[#16241B] px-4 py-2 rounded-2xl rounded-bl-none shadow-xl text-xs sm:text-sm font-bold flex flex-col animate-float-slow z-20">
                  <span className="font-bold text-black leading-tight">Your pet called.</span>
                  <span className="font-medium text-black/90 text-[11px] sm:text-xs">They need a vet.</span>
                </div>

                <div className="absolute top-2 right-2 sm:right-6 lg:right-10 bg-white border border-[#EBE5D6] text-[#16241B] px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 animate-float-delayed z-20 whitespace-nowrap">
                  <div className="w-8 h-8 rounded-full bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-base shrink-0">
                    🍪
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium leading-none mb-0.5">Professional</span>
                    <span className="text-xs sm:text-sm font-bold text-[#16241B] leading-tight">Treat Tester</span>
                  </div>
                </div>

                <div className="absolute top-[36%] sm:top-[38%] -left-6 sm:-left-12 lg:-left-16 -translate-y-1/2 bg-[#C5EAD4] border border-[#A7DBC0] text-[#16241B] px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-xl flex flex-col gap-0.5 animate-float-slow z-20">
                  <span className="text-[11px] sm:text-xs text-[#285A3F] font-medium leading-tight">Always</span>
                  <span className="text-sm sm:text-base font-bold text-[#16241B] leading-tight tracking-tight">Ready For</span>
                  <span className="text-xs sm:text-sm text-[#285A3F] font-bold leading-tight">Treats</span>
                </div>

                <div className="absolute -bottom-4 sm:-bottom-5 left-[6%] sm:left-[10%] bg-[#FDF0AA] border border-[#F3E188] text-[#16241B] px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 animate-float-delayed z-20">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] sm:text-[11px] text-[#6B5A10] font-medium leading-none mb-1">Appointment</span>
                    <span className="text-xs sm:text-sm font-bold text-[#16241B] flex items-center gap-1">
                      Booked <span className="text-[#059669] font-bold">✓</span>
                    </span>
                  </div>
                </div>

                <div className="absolute -bottom-4 sm:-bottom-5 right-4 sm:right-8 lg:right-12 bg-[#FCE3E4] border border-[#F9C3C6] text-[#16241B] px-4 py-2.5 rounded-2xl shadow-xl flex flex-col animate-float-slow z-20">
                  <span className="text-[10px] sm:text-[11px] text-[#9F1239] font-bold mb-0.5">10/10</span>
                  <span className="text-xs sm:text-sm font-bold text-[#9F1239] leading-tight">Good Boy</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3.5. Stats Strip */}
        <Reveal delay={0.08}>
          <StatsStrip />
        </Reveal>

        {/* 3.8. Trusted By Marquee */}
        <Reveal delay={0.1}>
          <TrustMarquee />
        </Reveal>

        {/* 4. Services Showcase Section */}
        <ServicesShowcase />

        {/* 4.5. How It Works Section */}
        <Reveal delay={0.1}>
          <HowItWorks />
        </Reveal>

        {/* 6. Vets Section */}
        <section id="vets" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6 relative">
              <Badge variant="orange" className="inline-flex">
                BEST CARE, RIGHT NEAR YOU
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#16241B] tracking-tight">
                Meet Their New <span className="text-[#EF7C3C]">Favorite</span> Human.
              </h2>
              <p className="text-base text-[#445548] leading-relaxed">
                Verified vets. Happy pets. Less worry for you.
              </p>

              {/* P.S. Badge */}
              <div className="pt-2 relative">
                <div className="relative inline-flex items-center ml-4 sm:ml-12 lg:ml-16">
                  <div className="inline-flex items-center bg-white border border-[#E8E2D4] px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-xs">
                    <span className="text-xs sm:text-sm font-bold text-[#16241B] flex items-center gap-1.5">
                      P.S. They'll get extra treats
                    </span>
                  </div>

                  <div className="hidden sm:block absolute left-[52%] bottom-[80%] w-52 sm:w-60 lg:w-68 h-28 pointer-events-none z-10">
                    <svg
                      className="w-full h-full text-[#14261C] overflow-visible"
                      viewBox="0 0 240 100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M 8,92 C 12,28 50,8 115,10 C 160,12 190,24 225,18" />
                      <path d="M 212,10 L 228,18 L 215,27" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Cards Stack / Slider */}
            <div className="lg:col-span-7 relative">
              <div
                ref={vetScrollRef}
                className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
              >
                {loadingVets ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="w-[300px] sm:w-[320px] shrink-0 bg-white rounded-2xl p-4 border border-[#ECE5D8] space-y-3">
                      <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  ))
                ) : filteredVets.length > 0 ? (
                  filteredVets.map((vet) => {
                    const photo = getVetImageUrl(vet.name, vet.photoUrl, vet.id);
                    return (
                    <Card
                      key={vet.id}
                      onClick={() => navigate(`/vets/${vet.id}`)}
                      className="w-[300px] sm:w-[320px] shrink-0 space-y-4 group bg-white rounded-3xl p-5 border border-[#EDE7D9] shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F4EFE6] flex items-center justify-center">
                        {photo ? (
                          <img
                            src={photo}
                            alt={vet.name}
                            className="w-full h-full object-cover object-[center_20%] rounded-2xl"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-[#F4EFE6] text-[#16241B]">
                            <span className="text-4xl font-black">{vet.name.charAt(0)}</span>
                            <span className="text-xs text-gray-500 font-semibold mt-1">{vet.name}</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-extrabold text-[#16241B] shadow-xs flex items-center gap-1 z-10">
                          {vet.reviewsCount && vet.reviewsCount > 0 && vet.rating ? (
                            <>
                              <span className="text-yellow-500">★</span> {vet.rating.toFixed(1)}
                            </>
                          ) : (
                            <span className="text-gray-400 text-[11px] font-bold">No reviews</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-[#16241B] group-hover:text-[#EF7C3C] transition-colors">
                          {vet.name}
                        </h3>
                        <p className="text-xs font-bold text-[#EF7C3C] mt-0.5">
                          {vet.specialization}
                        </p>
                        {vet.secondarySpecialization && (
                          <p className="text-xs text-[#556658] font-medium mt-0.5">
                            {vet.secondarySpecialization}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1 text-xs text-[#556658]">
                        <div className="flex items-center gap-1.5 flex-wrap font-semibold">
                          {vet.reviewsCount && vet.reviewsCount > 0 && vet.rating ? (
                            <>
                              <span className="text-[#F5A623] font-extrabold flex items-center gap-0.5">
                                ★ {vet.rating.toFixed(1)}
                              </span>
                              <span>({vet.reviewsCount} review{vet.reviewsCount > 1 ? 's' : ''})</span>
                            </>
                          ) : (
                            <span className="text-gray-400">No reviews yet</span>
                          )}
                          <span>•</span>
                          <span>{vet.experienceYears || 7}+ yrs exp</span>
                        </div>
                        <p className="font-bold text-[#009E66] pt-0.5 text-xs">
                          {formatCurrency(vet.consultationFee ?? 500)} / visit
                        </p>
                      </div>
                    </Card>
                    );
                  })
                ) : (
                  <div className="w-full py-8 text-center text-[#5D6F63] text-sm font-semibold">
                    No veterinarians listed for {activeCategory} at this time.
                  </div>
                )}
              </div>
            </Reveal>

            {/* Upgraded Vet Carousel */}
            <Reveal delay={0.12}>
              <VetCarousel
                vets={vets}
                activePetType={activeCategory}
                onSelectPetType={(cat) => setActiveCategory(cat)}
                onBook={(vetId) => navigate(`/vets/${vetId}`)}
              />
            </Reveal>
          </div>
        </section>

        {/* 7. Testimonials Section */}
        <Testimonials />

        {/* 8. Shared CTA Banner */}
        <CtaBanner />

        {/* 8. Feature Strip */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-[#EDE6D8]">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#D8F3DC] flex items-center justify-center text-[#009E66] shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#16241B]">
                  24/7 Vet Support
                </h4>
                <p className="text-xs text-[#556658]">We're always here</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0369A1] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#16241B]">
                  Verified Vets Only
                </h4>
                <p className="text-xs text-[#556658]">100% background checked</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#8C6D00] shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#16241B]">
                  In-Store Pickup Available
                </h4>
                <p className="text-xs text-[#556658]">Ready at your nearest clinic</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FCE7F3] flex items-center justify-center text-[#9D174D] shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#16241B]">
                  Happiness Guarantee
                </h4>
                <p className="text-xs text-[#556658]">Or your money back</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
