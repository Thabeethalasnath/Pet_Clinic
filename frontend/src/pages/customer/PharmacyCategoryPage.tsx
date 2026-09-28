import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { StickyCartBar } from '../../components/layout/StickyCartBar';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { formatCurrency } from '../../lib/utils';
import { useWishlistIds } from '../../hooks/useWishlistIds';
import { useCart } from '../../hooks/useCart';
import { usePharmacyProducts } from '../../hooks/usePharmacyProducts';
import { ProductCard, type ProductItemData } from '../../components/products/ProductCard';
import { ProductDetailModal } from '../../components/products/ProductDetailModal';
import { springs, staggerContainer, fadeUp } from '../../lib/motion';
import {
  PHARMACY_CATEGORIES,
  resolveCategoryFromSlug,
  matchesPharmacyCategory,
  matchesHealthConcern,
} from '../../lib/pharmacy';
import {
  ChevronRight,
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
  ShieldCheck,
} from 'lucide-react';

export const PharmacyCategoryPage: React.FC = () => {
  const { category: categorySlug } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Load products via shared hook
  const { products, loading, error, refetch } = usePharmacyProducts();

  // Resolve category metadata
  const currentCategory = useMemo(() => {
    return resolveCategoryFromSlug(categorySlug);
  }, [categorySlug]);

  const initialQ = searchParams.get('q') || '';
  const concernParam = searchParams.get('concern') || '';

  // Local filter states
  const [searchQuery, setSearchQuery] = useState<string>(initialQ);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [prescriptionOnly, setPrescriptionOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);

  useEffect(() => {
    if (initialQ) setSearchQuery(initialQ);
  }, [initialQ]);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItemData | null>(null);

  // Hooks
  const { isSaved } = useWishlistIds();
  const { addToCart, items: cartItems, isUpdating } = useCart();

  // Filter products strictly for this category and applied filters
  const categoryProducts = useMemo(() => {
    if (!currentCategory) return [];

    return products.filter((p) => {
      // Must match current category
      if (!matchesPharmacyCategory(p, currentCategory.slug)) return false;

      // Health concern filter if present
      if (concernParam && !matchesHealthConcern(p, concernParam)) return false;

      // Search keyword filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Max price filter
      if (p.price > maxPrice) return false;

      // Prescription filter
      if (prescriptionOnly && !p.prescriptionRequired) return false;

      return true;
    });
  }, [products, currentCategory, concernParam, searchQuery, maxPrice, prescriptionOnly]);

  // Sorted products
  const sortedProducts = useMemo(() => {
    const list = [...categoryProducts];
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [categoryProducts, sortBy]);

  const activeFiltersCount =
    (searchQuery ? 1 : 0) + (maxPrice < 5000 ? 1 : 0) + (prescriptionOnly ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery('');
    setMaxPrice(5000);
    setPrescriptionOnly(false);
    setSortBy('featured');
  };

  // If the slug did not match any known category
  if (!loading && !currentCategory) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] text-[#16241B] font-sans flex flex-col">
        <Navbar activePage="pharmacy" />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <EmptyState
            title="Category Not Found"
            description="The pharmacy collection you requested does not exist. Browse our verified categories below."
            actionLabel="Return to Pharmacy"
            onAction={() => navigate('/pharmacy')}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#16241B] font-sans flex flex-col selection:bg-[#009E66]/20">
      {/* 1. Navbar */}
      <Navbar activePage="pharmacy" />

      <main className="flex-grow space-y-6 sm:space-y-8 pb-14 pt-4 sm:pt-6">
        {/* 2. Breadcrumb, Large Title & Yellow Divider Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb matching Image 1: Home / Category */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-[#556658] font-medium mb-3">
            <Link to="/" className="hover:text-[#009E66] hover:underline">
              Home
            </Link>
            <span className="text-[#88998C]">/</span>
            <Link to="/pharmacy" className="hover:text-[#009E66] hover:underline">
              Pharmacy
            </Link>
            <span className="text-[#88998C]">/</span>
            <span className="text-[#16241B] font-bold">{currentCategory?.name}</span>
          </nav>

          {/* Large Title */}
          <div className="mb-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#16241B] tracking-tight">
              {currentCategory?.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#556658] font-medium mt-1">
              {currentCategory?.description}
            </p>
          </div>

          {/* Yellow/Amber Divider Line */}
          <div className="w-full h-1 bg-[#EF7C3C] rounded-full mb-6" />

          {/* 3. Controls Bar: Sort on left, count on right */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2">
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-[#556658]">Sort:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="pl-3.5 pr-8 py-2 rounded-xl bg-white border border-[#CBDAC6] text-xs sm:text-sm font-bold text-[#16241B] focus:outline-hidden focus:ring-1 focus:ring-[#009E66] shadow-2xs cursor-pointer appearance-none"
                  >
                    <option value="featured">Best selling</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name">Product Name (A-Z)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#556658] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Filter Button */}
              <button
                type="button"
                onClick={() => setShowFiltersPanel((prev) => !prev)}
                className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  showFiltersPanel || activeFiltersCount > 0
                    ? 'bg-[#009E66] text-white border-[#009E66] shadow-xs'
                    : 'bg-white border-[#CBDAC6] text-[#16241B] hover:border-[#009E66]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4.5 h-4.5 rounded-full bg-white text-[#009E66] text-[11px] font-black flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Search input in category */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-[#88998C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${currentCategory?.name}...`}
                  className="pl-8 pr-7 py-2 rounded-xl bg-white border border-[#CBDAC6] text-xs sm:text-sm text-[#16241B] placeholder-[#88998C] focus:outline-hidden focus:ring-1 focus:ring-[#009E66] shadow-2xs w-full sm:w-56"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Showing X products text */}
            <div className="text-xs sm:text-sm font-medium text-[#556658] sm:text-right">
              Showing {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
            </div>
          </div>

          {/* Expandable Filter Drawer */}
          <AnimatePresence>
            {showFiltersPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={springs.soft}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-2xl p-5 border border-[#16241B]/10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center shadow-xs">
                  {/* Price Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="text-[#16241B]/70">Max Price:</span>
                      <span className="text-[#009E66] font-black">{formatCurrency(maxPrice)}</span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="range"
                        min="100"
                        max="5000"
                        step="50"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full h-2 bg-[#16241B]/10 rounded-lg appearance-none cursor-pointer accent-[#009E66]"
                      />
                    </div>
                  </div>

                  {/* Prescription Toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPrescriptionOnly((p) => !p)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        prescriptionOnly
                          ? 'bg-[#EF7C3C] text-white border-[#EF7C3C] shadow-sm'
                          : 'bg-white text-[#16241B]/80 border-[#16241B]/10 hover:border-[#EF7C3C]'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Prescription Only (Rx)</span>
                    </button>
                  </div>

                  {/* Reset All Filters */}
                  <div className="flex justify-start md:justify-end">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Clear All Filters</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filter Chips */}
          <AnimatePresence>
            {activeFiltersCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-wrap items-center gap-2 pt-1"
              >
                <span className="text-xs font-semibold text-[#16241B]/50 mr-1">Active Filters:</span>

                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-[#CBDAC6] text-[#009E66] shadow-2xs">
                    Keyword: "{searchQuery}"
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {maxPrice < 5000 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-[#CBDAC6] text-[#009E66] shadow-2xs">
                    Under {formatCurrency(maxPrice)}
                    <button
                      type="button"
                      onClick={() => setMaxPrice(5000)}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {prescriptionOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-[#EF7C3C]/30 text-[#EF7C3C] shadow-2xs">
                    Rx Required
                    <button
                      type="button"
                      onClick={() => setPrescriptionOnly(false)}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 4. Products Grid Scoped to this Category */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[22px] p-4 border border-[#16241B]/8 space-y-3.5 shadow-sm"
                >
                  <div className="w-full aspect-square skeleton-shimmer rounded-2xl" />
                  <div className="h-4 w-1/3 skeleton-shimmer rounded-md" />
                  <div className="h-5 w-3/4 skeleton-shimmer rounded-md" />
                  <div className="h-4 w-1/2 skeleton-shimmer rounded-md" />
                  <div className="h-9 w-full skeleton-shimmer rounded-xl" />
                </div>
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : sortedProducts.length === 0 ? (
            <div className="py-6 sm:py-8">
              <EmptyState
                title={`No products found in ${currentCategory?.name}`}
                description="Try clearing active search terms or explore our other pharmacy collections."
                actionLabel="Reset Filters"
                onAction={resetFilters}
              />
            </div>
          ) : (
            <motion.div
              layout
              variants={staggerContainer(0.04)}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {sortedProducts.map((product) => {
                  const cartItem = cartItems.find((i) => i.productId === product.id);

                  return (
                    <motion.div
                      layout
                      key={product.id}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      className="h-full flex flex-col"
                    >
                      <ProductCard
                        product={product}
                        isSaved={isSaved('PRODUCT', product.id)}
                        onQuickView={(p) => setQuickViewProduct(p)}
                        onAddToCart={(p, e) => addToCart(p, e)}
                        isAddingToCart={isUpdating[product.id]}
                        quantityInCart={cartItem?.quantity || 0}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {/* 5. Explore Other Categories Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <div className="bg-[#F6F7F2] rounded-[32px] p-5 sm:p-6 border border-[#CBDAC6]/60 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#16241B] tracking-tight">
                  Explore Other Pharmacy Categories
                </h3>
                <p className="text-xs sm:text-sm text-[#556658] font-medium mt-1">
                  Discover curated veterinary medicines, hygiene essentials, and nutrition.
                </p>
              </div>
              <Link
                to="/pharmacy"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#009E66] hover:underline"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {PHARMACY_CATEGORIES.filter((c) => c.slug !== currentCategory?.slug)
                .slice(0, 4)
                .map((cat) => {
                  const IconComp = cat.icon;
                  return (
                    <Link
                      key={cat.slug}
                      to={`/pharmacy/${cat.slug}`}
                      className="group bg-white rounded-2xl p-4 border border-[#16241B]/8 shadow-2xs hover:shadow-md hover:border-[#009E66] transition-all flex flex-col items-start gap-2.5"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl ${cat.color.iconBg} ${cat.color.iconText} flex items-center justify-center`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#16241B] group-hover:text-[#009E66] transition-colors leading-snug">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] text-[#556658] line-clamp-1 mt-0.5 font-normal">
                          {cat.tagline}
                        </p>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </section>
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

export default PharmacyCategoryPage;
