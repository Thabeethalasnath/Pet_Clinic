import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { StickyCartBar } from '../../components/layout/StickyCartBar';
import { ErrorState } from '../../components/feedback/ErrorState';
import { useWishlistIds } from '../../hooks/useWishlistIds';
import { useCart } from '../../hooks/useCart';
import { usePharmacyProducts } from '../../hooks/usePharmacyProducts';
import { ProductCard, type ProductItemData } from '../../components/products/ProductCard';
import { ProductDetailModal } from '../../components/products/ProductDetailModal';
import { springs } from '../../lib/motion';
import {
  PHARMACY_CATEGORIES,
  HEALTH_CONCERNS,
  matchesPharmacyCategory,
} from '../../lib/pharmacy';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Scroll reveal animation variants
const sectionRevealVariants: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const containerStagger = (stagger: number = 0.08, delay: number = 0.05): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const PharmacyPage: React.FC = () => {
  const { products, loading, error, refetch } = usePharmacyProducts();
  const carouselRef = useRef<HTMLDivElement>(null);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItemData | null>(null);

  // Hooks
  const { isSaved } = useWishlistIds();
  const { addToCart, items: cartItems, isUpdating } = useCart();

  // Filter for Medications products for "Most Purchased Medicines"
  const medicationProducts = useMemo(() => {
    return products.filter((p) => matchesPharmacyCategory(p, 'medications'));
  }, [products]);

  // Hero Banner Slider state
  const [currentBannerIndex, setCurrentBannerIndex] = useState<number>(0);
  const [isBannerHovered, setIsBannerHovered] = useState<boolean>(false);
  const banners = [
    {
      id: 'banner-1',
      image: '/images/pharmacy/banner-1.jpg',
      label: 'Pet Meds Today! - 12% OFF Pharmacy Banner',
      title: 'Pet Meds Today!',
      subtitle: 'Quality Care For Your Pets, Now At A Discount.',
      discount: '12% OFF',
      link: '/pharmacy/medications',
    },
    {
      id: 'banner-2',
      image: '/images/pharmacy/banner-2.jpg',
      label: 'Flea & Tick Defense - Protect Your Pets Banner',
      title: 'Parasite Protection',
      subtitle: 'Top Rated Spot-ons & Collars for Dogs & Cats.',
      discount: '15% OFF',
      link: '/pharmacy/flea-and-tick',
    },
    {
      id: 'banner-3',
      image: '/images/pharmacy/banner-3.jpg',
      label: 'Daily Supplements & Nutrition Boosters Banner',
      title: 'Daily Vitality Boost',
      subtitle: 'Multivitamins & Joint Support for Every Life Stage.',
      discount: '20% OFF',
      link: '/pharmacy/supplements-and-care',
    },
    {
      id: 'banner-4',
      image: '/images/pharmacy/banner-4.jpg',
      label: 'Veterinary Prescriptions & Emergency Care Banner',
      title: 'Prescription Care',
      subtitle: 'Certified Medicines Formulated by Licensed Vets.',
      discount: '10% OFF',
      link: '/pharmacy/medications',
    },
  ];

  // Automatic Banner Slideshow (Advances every 4 seconds, pauses on hover)
  useEffect(() => {
    if (isBannerHovered) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [isBannerHovered, banners.length]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F2] text-[#16241B] font-sans flex flex-col selection:bg-[#009E66]/20">
      {/* 1. Navbar */}
      <Navbar activePage="pharmacy" />

      <main className="flex-grow space-y-10 sm:space-y-14 pb-14">
        {/* =========================================================================
            TASK 1 — HERO BANNER (SLIDER WITH PEAKING SIDES)
            ========================================================================= */}
        <motion.section
          id="pharmacy-hero"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerStagger(0.1, 0)}
          className="w-full pt-4 sm:pt-6 overflow-hidden"
        >
          {/* Centered Heading */}
          <motion.div
            variants={sectionRevealVariants}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#16241B] tracking-tight">
              Online Pet Pharmacy for All Your Pet's <span className="text-[#EF7C3C]">Health Needs</span>
            </h1>
          </motion.div>

          {/* Banner Carousel with Side Previews & Floating Offset Arrows */}
          <motion.div
            variants={sectionRevealVariants}
            onMouseEnter={() => setIsBannerHovered(true)}
            onMouseLeave={() => setIsBannerHovered(false)}
            className="relative w-full max-w-[1440px] mx-auto px-3 sm:px-12 md:px-16"
          >
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl">
              <motion.div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
              >
                {banners.map((banner) => (
                  <div key={banner.id} className="w-full shrink-0 px-1">
                    <Link
                      to={banner.link}
                      className="group block relative w-full aspect-[16/7] sm:aspect-[21/9] md:aspect-[2.35/1] max-h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#CBDAC6]/60 shadow-sm hover:shadow-md transition-all bg-[#F3EFE6]"
                    >
                      <img
                        src={banner.image}
                        alt={banner.label}
                        className="w-full h-full object-cover object-center select-none"
                      />
                    </Link>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Slider Navigation Arrows - Floating cleanly outside the image */}
            <button
              type="button"
              onClick={() =>
                setCurrentBannerIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
              }
              aria-label="Previous Slide"
              className="absolute left-0 sm:left-2 md:left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-[#F8F6F0] text-[#009E66] hover:text-[#008756] shadow-md hover:shadow-lg border border-[#CBDAC6] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer z-20 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentBannerIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
              }
              aria-label="Next Slide"
              className="absolute right-0 sm:right-2 md:right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-[#F8F6F0] text-[#009E66] hover:text-[#008756] shadow-md hover:shadow-lg border border-[#CBDAC6] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer z-20 active:scale-95"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Centered Pagination Indicator Pill */}
            <div className="flex justify-center mt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border border-[#CBDAC6] shadow-xs">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentBannerIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      currentBannerIndex === i
                        ? 'w-6 bg-[#009E66]'
                        : 'w-2 bg-[#CBDAC6] hover:bg-[#88998C]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* =========================================================================
            TASK 2 — "EXPLORE OUR PET PHARMACY CATEGORIES"
            ========================================================================= */}
        <motion.section
          id="categories"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={containerStagger(0.08, 0.05)}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
        >
          <motion.div
            variants={sectionRevealVariants}
            className="text-center max-w-3xl mx-auto space-y-2"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-[#16241B] tracking-tight">
              Explore Our <span className="text-[#EF7C3C]">Pet Pharmacy</span> Categories
            </h2>
            <p className="text-xs sm:text-sm text-[#556658] font-medium max-w-xl mx-auto">
              Find trusted medications and supplements tailored to meet the unique needs of your dog or cat.
            </p>
          </motion.div>

          {/* 5-Column Compact Organic Category Cards Row */}
          <motion.div
            variants={containerStagger(0.07, 0.1)}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 justify-center items-start"
          >
            {PHARMACY_CATEGORIES.map((category) => (
              <motion.div
                key={category.slug}
                variants={itemFadeUp}
                className="flex justify-center"
              >
                <Link
                  to={`/pharmacy/${category.slug}`}
                  className="group flex flex-col items-center text-center w-full max-w-[210px] transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer"
                >
                  {/* Soft Organic Card Shape with Generated Category Image */}
                  <div className="relative w-full aspect-[4/5] rounded-[30px] overflow-hidden p-2.5 flex items-center justify-center bg-white border border-[#CBDAC6]/60 shadow-2xs group-hover:shadow-md group-hover:border-[#009E66]/50 transition-all duration-300">
                    {/* Organic Pastel Background Tint */}
                    <div
                      className={`absolute inset-2 rounded-[22px] ${category.color.bg} opacity-90 group-hover:opacity-100 transition-opacity`}
                    />

                    {/* Centered Image */}
                    <div className="relative z-10 w-[90%] h-[90%] rounded-xl overflow-hidden shadow-2xs">
                      <img
                        src={category.imageUrl}
                        alt={`${category.name} category`}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                  </div>

                  {/* Category Title & Tagline */}
                  <div className="mt-3.5 space-y-1 px-1">
                    <h3 className="text-sm sm:text-base font-black text-[#16241B] group-hover:text-[#009E66] transition-colors leading-snug">
                      {category.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#556658] font-normal leading-relaxed line-clamp-2">
                      {category.tagline}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* =========================================================================
            TASK 3 — "ADDRESSING YOUR PET'S HEALTH CONCERNS"
            ========================================================================= */}
        <motion.section
          id="health-concerns"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={containerStagger(0.06, 0.05)}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10"
        >
          <motion.div
            variants={sectionRevealVariants}
            className="text-center max-w-3xl mx-auto space-y-2"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#16241B] tracking-tight">
              Addressing Your Pet's <span className="text-[#EF7C3C]">Health Concerns</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#556658] font-medium max-w-xl mx-auto">
              Expert Guidance and Quality Products to Help Manage Your Pet's Health Concerns for a Happier Life.
            </p>
          </motion.div>

          {/* Grid of 8 Health Concern Cards (4 cols x 2 rows) */}
          <motion.div
            variants={containerStagger(0.06, 0.1)}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            {HEALTH_CONCERNS.map((concern) => (
              <motion.div
                key={concern.id}
                variants={itemFadeUp}
                whileHover={{ y: -5 }}
                transition={springs.snappy}
                className="flex justify-center"
              >
                <Link
                  to={`/pharmacy/concern/${concern.slug}`}
                  className="group flex flex-col items-center text-center w-full max-w-[290px] cursor-pointer"
                >
                  {/* Rounded Image Container */}
                  <div className="relative w-full aspect-square rounded-[28px] sm:rounded-[32px] overflow-hidden bg-white border border-[#CBDAC6]/60 shadow-xs group-hover:shadow-md group-hover:border-[#009E66]/50 transition-all duration-300 mb-4 p-2 sm:p-2.5">
                    <div className="w-full h-full rounded-[22px] sm:rounded-[24px] overflow-hidden bg-[#F6F7F2]">
                      <img
                        src={concern.imageUrl}
                        alt={`${concern.title} health concern`}
                        className="w-full h-full object-cover rounded-[20px]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                  </div>

                  {/* Concern Title & Exact Tagline */}
                  <div className="space-y-1.5 px-2">
                    <h3 className="text-base sm:text-lg font-black text-[#16241B] group-hover:text-[#009E66] transition-colors leading-snug">
                      {concern.title}
                    </h3>
                    <p className="text-xs text-[#556658] font-normal leading-relaxed max-w-[260px]">
                      {concern.tagline}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* =========================================================================
            TASK 4 — "MOST PURCHASED MEDICINES"
            ========================================================================= */}
        <motion.section
          id="most-purchased"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={containerStagger(0.08, 0.05)}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10"
        >
          {/* Centered Heading & Subtitle */}
          <motion.div
            variants={sectionRevealVariants}
            className="text-center max-w-3xl mx-auto space-y-2"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#16241B] tracking-tight">
              Most Purchased <span className="text-[#EF7C3C]">Medicines</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#556658] font-medium max-w-xl mx-auto">
              Promote your pet’s digestive & overall health with the most trusted medications.
            </p>
          </motion.div>

          {/* Product Carousel with Side Floating Arrows (Offset outside the cards) */}
          <motion.div variants={sectionRevealVariants} className="relative w-full px-2 sm:px-12 md:px-14">
            {/* Left Chevron Arrow - Floats cleanly in outer margin without overlapping card */}
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              aria-label="Previous Products"
              className="absolute left-0 sm:left-1 md:left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-[#F8F6F0] text-[#3FA65C] hover:text-[#2D5A38] shadow-md hover:shadow-lg border border-[#CBDAC6] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Right Chevron Arrow - Floats cleanly in outer margin without overlapping card */}
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              aria-label="Next Products"
              className="absolute right-0 sm:right-1 md:right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-[#F8F6F0] text-[#3FA65C] hover:text-[#2D5A38] shadow-md hover:shadow-lg border border-[#CBDAC6] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Product Cards Row */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#FAF7F0] rounded-[24px] p-4 sm:p-5 border border-[#EDE7D9] space-y-3.5 shadow-2xs"
                  >
                    <div className="w-full aspect-square skeleton-shimmer rounded-2xl" />
                    <div className="h-4 w-3/4 skeleton-shimmer rounded-md" />
                    <div className="h-5 w-1/3 skeleton-shimmer rounded-md" />
                    <div className="h-10 w-full skeleton-shimmer rounded-xl" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : (
              <div
                ref={carouselRef}
                className="flex gap-5 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-3 px-1"
              >
                {medicationProducts.slice(0, 10).map((product) => {
                  const cartItem = cartItems.find((i) => i.productId === product.id);
                  const isItemSaved = isSaved('PRODUCT', product.id);

                  return (
                    <div
                      key={product.id}
                      className="w-[280px] sm:w-[300px] shrink-0 snap-start flex flex-col h-full"
                    >
                      <ProductCard
                        product={product}
                        isSaved={isItemSaved}
                        onQuickView={(p) => setQuickViewProduct(p)}
                        onAddToCart={(p, e) => addToCart(p, e)}
                        isAddingToCart={isUpdating[product.id]}
                        quantityInCart={cartItem?.quantity || 0}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.section>
      </main>

      {/* Product Detail Modal */}
      {quickViewProduct && (
        <ProductDetailModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          isSaved={isSaved('PRODUCT', quickViewProduct.id)}
        />
      )}

      <Footer />
      <StickyCartBar />
    </div>
  );
};

export default PharmacyPage;
