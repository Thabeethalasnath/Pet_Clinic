import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { StickyCartBar } from '../../components/layout/StickyCartBar';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { useWishlistIds } from '../../hooks/useWishlistIds';
import { apiClient } from '../../lib/axios';
import {
  type PetType,
} from '../../data/petEssentialsTaxonomy';
import {
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { ProductCard, type ProductItemData } from '../../components/products/ProductCard';
import { ProductDetailModal } from '../../components/products/ProductDetailModal';

import { FALLBACK_PRODUCTS } from '../../data/mockProducts';

// Subcategory Circular Icons map
const SUBCATEGORY_ICON_MAP: Record<string, string> = {
  All: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=120&auto=format&fit=crop&q=80',
  'Dry Food': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=120&auto=format&fit=crop&q=80',
  'Wet Food': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=120&auto=format&fit=crop&q=80',
  'Chew Toys': 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=120&auto=format&fit=crop&q=80',
  'Eye Drops': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&auto=format&fit=crop&q=80',
  'Ear Cleanser': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=120&auto=format&fit=crop&q=80',
  'Ear Drops': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&auto=format&fit=crop&q=80',
  Grooming: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=120&auto=format&fit=crop&q=80',
  Treats: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=120&auto=format&fit=crop&q=80',
  'Walk & Travel': 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=120&auto=format&fit=crop&q=80',
  'Beds & Housing': 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=120&auto=format&fit=crop&q=80',
  'Bowls & Feeders': 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=120&auto=format&fit=crop&q=80',
  'Cat Litter': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=120&auto=format&fit=crop&q=80',
  'Fish Food': 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=120&auto=format&fit=crop&q=80',
  'Bird Food': 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=120&auto=format&fit=crop&q=80',
  'Hamster Food': 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=120&auto=format&fit=crop&q=80',
  'Rabbit Food': 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=120&auto=format&fit=crop&q=80',
};

export const PetEssentialsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isSaved } = useWishlistIds();

  // Multi-select Pet Types from URL or default
  const initialPetTypes = useMemo<PetType[]>(() => {
    const raw = searchParams.get('petType');
    if (raw) {
      return raw.split(',').map((p) => p.trim().toUpperCase() as PetType);
    }
    return ['DOG'];
  }, [searchParams]);

  const [selectedPetTypes, setSelectedPetTypes] = useState<PetType[]>(initialPetTypes);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(searchParams.get('subcategory') || 'All');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brand') && searchParams.get('brand') !== 'All'
      ? searchParams.get('brand')!.split(',')
      : []
  );
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'popularity');
  const [ageFilter, setAgeFilter] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(5000);

  // Detail Modal State
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductItemData | null>(null);

  // Left Sidebar Toggle
  const [showFilters, setShowFilters] = useState<boolean>(true);

  // Accordion Expand/Collapse States for Sidebar
  const [priceAccordionOpen, setPriceAccordionOpen] = useState<boolean>(true);
  const [petTypeAccordionOpen, setPetTypeAccordionOpen] = useState<boolean>(true);
  const [brandAccordionOpen, setBrandAccordionOpen] = useState<boolean>(true);

  // Products State
  const [allProducts, setAllProducts] = useState<ProductItemData[]>(() =>
    FALLBACK_PRODUCTS.filter((p) => p.productType === 'ESSENTIAL')
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync URL search params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedPetTypes.length > 0) {
      params.set('petType', selectedPetTypes.join(','));
    }
    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }
    if (selectedSubcategory && selectedSubcategory !== 'All') {
      params.set('subcategory', selectedSubcategory);
    }
    if (selectedBrands.length > 0) {
      params.set('brand', selectedBrands.join(','));
    }
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    if (sortBy && sortBy !== 'popularity') {
      params.set('sort', sortBy);
    }
    // Only update if search params actually changed to prevent render loops
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [selectedPetTypes, selectedCategory, selectedSubcategory, selectedBrands, searchQuery, sortBy, searchParams, setSearchParams]);

  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);

  // Fetch Full Essentials Catalog from Backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<ProductItemData[]>('/pet-essentials/products');
      if (res.data && res.data.length > 0) {
        setAllProducts(res.data);
      } else {
        setAllProducts(FALLBACK_PRODUCTS.filter((p) => p.productType === 'ESSENTIAL'));
      }
    } catch {
      // Gracefully fallback to rich local essentials catalog
      setAllProducts(FALLBACK_PRODUCTS.filter((p) => p.productType === 'ESSENTIAL'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Pet Type Multi-select toggle (OR logic within group)
  const handleTogglePetType = (pet: PetType) => {
    setSelectedPetTypes((prev) => {
      if (prev.includes(pet)) {
        return prev.filter((p) => p !== pet);
      } else {
        return [...prev, pet];
      }
    });
    setSelectedSubcategory('All');
  };

  // Brand Multi-select toggle (OR logic within group)
  const handleToggleBrand = (brand: string) => {
    setSelectedBrands((prev) => {
      if (prev.includes(brand)) {
        return prev.filter((b) => b !== brand);
      } else {
        return [...prev, brand];
      }
    });
  };

  const clearFilters = () => {
    setSelectedPetTypes([]);
    setSelectedCategory('All');
    setSelectedSubcategory('All');
    setSelectedBrands([]);
    setSearchQuery('');
    setSortBy('popularity');
    setAgeFilter('All');
    setMaxPrice(5000);
  };

  // Dynamic Pet Type Counts across catalog
  const petTypeCounts = useMemo(() => {
    const counts: Record<PetType, number> = { DOG: 0, CAT: 0, SMALL_PET: 0 };
    allProducts.forEach((p) => {
      const type = (p.petType || 'DOG').toUpperCase() as PetType;
      if (counts[type] !== undefined) {
        counts[type]++;
      }
    });
    return counts;
  }, [allProducts]);

  // Dynamic Brand List & Counts based on active pet types
  const brandListWithCounts = useMemo(() => {
    const brandMap: Record<string, number> = {};
    allProducts.forEach((p) => {
      if (!p.brand) return;
      const petMatch =
        selectedPetTypes.length === 0 ||
        selectedPetTypes.includes((p.petType || 'DOG').toUpperCase() as PetType);
      if (petMatch) {
        brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
      }
    });
    return Object.entries(brandMap)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count);
  }, [allProducts, selectedPetTypes]);

  // Horizontal Circular Subcategories for Selected Pet Types
  const subcategoryPills = useMemo(() => {
    const list: { name: string; iconUrl: string }[] = [
      { name: 'All', iconUrl: SUBCATEGORY_ICON_MAP['All'] },
    ];

    const hasDogs = selectedPetTypes.length === 0 || selectedPetTypes.includes('DOG');
    const hasCats = selectedPetTypes.length === 0 || selectedPetTypes.includes('CAT');
    const hasSmall = selectedPetTypes.length === 0 || selectedPetTypes.includes('SMALL_PET');

    const added = new Set<string>();

    if (hasDogs) {
      ['Dry Food', 'Wet Food', 'Chew Toys', 'Treats', 'Bowls & Feeders', 'Grooming', 'Walk & Travel', 'Beds & Housing'].forEach((sub) => {
        if (!added.has(sub)) {
          added.add(sub);
          list.push({
            name: sub,
            iconUrl: SUBCATEGORY_ICON_MAP[sub] || SUBCATEGORY_ICON_MAP['Dry Food'],
          });
        }
      });
    }

    if (hasCats) {
      ['Cat Litter', 'Wet Food', 'Dry Food', 'Treats', 'Grooming'].forEach((sub) => {
        if (!added.has(sub)) {
          added.add(sub);
          list.push({
            name: sub,
            iconUrl: SUBCATEGORY_ICON_MAP[sub] || SUBCATEGORY_ICON_MAP['Cat Litter'],
          });
        }
      });
    }

    if (hasSmall) {
      ['Fish Food', 'Bird Food', 'Hamster Food', 'Rabbit Food'].forEach((sub) => {
        if (!added.has(sub)) {
          added.add(sub);
          list.push({
            name: sub,
            iconUrl: SUBCATEGORY_ICON_MAP[sub] || SUBCATEGORY_ICON_MAP['All'],
          });
        }
      });
    }

    return list;
  }, [selectedPetTypes]);

  // Combined AND/OR Multi-Filter Logic
  const displayedProducts = useMemo(() => {
    return allProducts
      .filter((p) => {
        // 1. Pet Type Filter (OR logic within group)
        if (selectedPetTypes.length > 0) {
          const type = (p.petType || 'DOG').toUpperCase() as PetType;
          if (!selectedPetTypes.includes(type)) return false;
        }

        // 2. Subcategory Filter
        if (selectedSubcategory !== 'All') {
          const pSub = (p.subcategory || '').toLowerCase();
          const pCat = (p.category || '').toLowerCase();
          const target = selectedSubcategory.toLowerCase();
          if (!pSub.includes(target) && !pCat.includes(target) && !target.includes(pSub)) {
            return false;
          }
        }

        // 3. Brand Filter (OR logic within group)
        if (selectedBrands.length > 0) {
          if (!p.brand || !selectedBrands.includes(p.brand)) {
            return false;
          }
        }

        // 4. Price Filter
        if (p.price > maxPrice) return false;

        // 5. Age Filter
        if (ageFilter !== 'All') {
          const text = `${p.name} ${p.description || ''} ${p.subcategory || ''}`.toLowerCase();
          if (ageFilter === 'Puppy / Kitten' && !text.includes('puppy') && !text.includes('kitten')) {
            return false;
          }
          if (ageFilter === 'Adult' && !text.includes('adult') && (text.includes('puppy') || text.includes('kitten'))) {
            return false;
          }
          if (ageFilter === 'Senior' && !text.includes('senior')) {
            return false;
          }
        }

        // 6. Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const searchable = `${p.name} ${p.brand || ''} ${p.category || ''} ${p.subcategory || ''} ${p.description || ''}`.toLowerCase();
          if (!searchable.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low-to-high') return a.price - b.price;
        if (sortBy === 'price-high-to-low') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'newest') return b.id - a.id;
        return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      });
  }, [allProducts, selectedPetTypes, selectedSubcategory, selectedBrands, maxPrice, ageFilter, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#F6F7F2] text-[#16241B] font-sans flex flex-col selection:bg-[#EF7C3C]/30">
      {/* 1. Universal Navbar */}
      <Navbar activePage="pet-essentials" />

      <main className="flex-grow pb-14">
        {/* ===================================================================
            2. TOP FILTER & SORT BAR (Non-Sticky, Natural Scroll)
        =================================================================== */}
        <div className="bg-white border-b border-[#EDE7D9] shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Left Action Chips: FILTERS, Age */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* FILTERS Toggle Button */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF6EE] border border-[#E5DFCE] text-xs font-black text-[#009E66] hover:bg-[#F0EAE1] transition-colors cursor-pointer shadow-2xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#009E66]" />
                <span className="tracking-wide">FILTERS</span>
              </button>

              {/* Age Filter Dropdown Pill */}
              <div className="relative">
                <select
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-2 rounded-xl bg-white border border-[#E5DFCE] text-xs font-bold text-[#16241B] focus:outline-none focus:ring-1 focus:ring-[#009E66] cursor-pointer shadow-2xs"
                >
                  <option value="All">Age: All</option>
                  <option value="Puppy / Kitten">Puppy / Kitten</option>
                  <option value="Adult">Adult</option>
                  <option value="Senior">Senior</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#88998C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Right: Sort By Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#556658] hidden sm:inline">Sort By :</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-white border border-[#E5DFCE] text-xs font-bold text-[#16241B] focus:outline-none focus:ring-1 focus:ring-[#009E66] cursor-pointer shadow-2xs"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price-low-to-high">Price: Low to High</option>
                  <option value="price-high-to-low">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">New Arrivals</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#88998C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            3. MAIN CONTENT WITH LEFT FILTER SIDEBAR & CATALOG GRID
        =================================================================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5">
          <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* ===============================================================
                LEFT SIDEBAR FILTERS (Price, Pet Type, Brand)
            =============================================================== */}
            {showFilters && (
              <aside className="col-span-12 lg:col-span-3 bg-white rounded-2xl border border-[#EDE7D9] p-5 shadow-2xs space-y-6">
                {/* 1. Price Accordion & Slider */}
                <div className="border-b border-[#F0EAE1] pb-5">
                  <button
                    type="button"
                    onClick={() => setPriceAccordionOpen(!priceAccordionOpen)}
                    className="w-full flex items-center justify-between text-sm font-black text-[#009E66] cursor-pointer"
                  >
                    <span>Price</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#88998C] transition-transform ${
                        priceAccordionOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>

                  {priceAccordionOpen && (
                    <div className="mt-4 space-y-3">
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="50"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full h-2 bg-[#CBDAC6] rounded-lg appearance-none cursor-pointer accent-[#009E66]"
                      />
                      <div className="flex items-center justify-between text-xs font-bold text-[#16241B]">
                        <span>₹ 0</span>
                        <span className="px-2.5 py-0.5 rounded-md bg-[#FAF6EE] border border-[#E5DFCE] font-black text-[#009E66]">
                          Up to ₹ {maxPrice}
                        </span>
                        <span>₹ 5,000</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Pet Type Accordion & True Multi-Select Checkboxes */}
                <div className="border-b border-[#F0EAE1] pb-5">
                  <button
                    type="button"
                    onClick={() => setPetTypeAccordionOpen(!petTypeAccordionOpen)}
                    className="w-full flex items-center justify-between text-sm font-black text-[#009E66] cursor-pointer"
                  >
                    <span>Pet Type</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#88998C] transition-transform ${
                        petTypeAccordionOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>

                  {petTypeAccordionOpen && (
                    <div className="mt-3.5 space-y-2.5">
                      {/* Dogs */}
                      <label className="flex items-center gap-3 text-xs font-bold text-[#334437] cursor-pointer hover:text-[#009E66] select-none">
                        <input
                          type="checkbox"
                          checked={selectedPetTypes.includes('DOG')}
                          onChange={() => handleTogglePetType('DOG')}
                          className="w-4 h-4 rounded border-[#CBDAC6] text-[#009E66] focus:ring-0 cursor-pointer accent-[#009E66]"
                        />
                        <span>Dogs ({petTypeCounts.DOG || 0})</span>
                      </label>

                      {/* Cats */}
                      <label className="flex items-center gap-3 text-xs font-bold text-[#334437] cursor-pointer hover:text-[#009E66] select-none">
                        <input
                          type="checkbox"
                          checked={selectedPetTypes.includes('CAT')}
                          onChange={() => handleTogglePetType('CAT')}
                          className="w-4 h-4 rounded border-[#CBDAC6] text-[#009E66] focus:ring-0 cursor-pointer accent-[#009E66]"
                        />
                        <span>Cats ({petTypeCounts.CAT || 0})</span>
                      </label>

                      {/* Small Pets */}
                      <label className="flex items-center gap-3 text-xs font-bold text-[#334437] cursor-pointer hover:text-[#009E66] select-none">
                        <input
                          type="checkbox"
                          checked={selectedPetTypes.includes('SMALL_PET')}
                          onChange={() => handleTogglePetType('SMALL_PET')}
                          className="w-4 h-4 rounded border-[#CBDAC6] text-[#009E66] focus:ring-0 cursor-pointer accent-[#009E66]"
                        />
                        <span>Small Pets ({petTypeCounts.SMALL_PET || 0})</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* 3. Brand Accordion & Multi-Select Checkboxes */}
                <div>
                  <button
                    type="button"
                    onClick={() => setBrandAccordionOpen(!brandAccordionOpen)}
                    className="w-full flex items-center justify-between text-sm font-black text-[#009E66] cursor-pointer"
                  >
                    <span>Brand</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#88998C] transition-transform ${
                        brandAccordionOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>

                  {brandAccordionOpen && (
                    <div className="mt-3.5 space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {brandListWithCounts.length > 0 ? (
                        brandListWithCounts.map(({ brand, count }) => {
                          const isChecked = selectedBrands.includes(brand);
                          return (
                            <label
                              key={brand}
                              className="flex items-center gap-3 text-xs font-bold text-[#334437] cursor-pointer hover:text-[#009E66] select-none"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleBrand(brand)}
                                className="w-4 h-4 rounded border-[#CBDAC6] text-[#009E66] focus:ring-0 cursor-pointer accent-[#009E66]"
                              />
                              <span className="truncate">
                                {brand} ({count})
                              </span>
                            </label>
                          );
                        })
                      ) : (
                        <p className="text-xs text-[#88998C]">No brand filters available</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Reset All Filters Button */}
                <div className="pt-2 border-t border-[#F0EAE1]">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full py-2 px-3 rounded-xl bg-[#FAF6EE] text-xs font-bold text-[#EF7C3C] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer border border-[#E5DFCE]"
                  >
                    Reset All Filters
                  </button>
                </div>
              </aside>
            )}

            {/* ===============================================================
                RIGHT MAIN CONTENT: Circular Subcategories & Grid
            =============================================================== */}
            <div className={`col-span-12 ${showFilters ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-6`}>
              {/* Horizontal Circular Subcategory Carousel */}
              <div className="bg-white rounded-2xl border border-[#EDE7D9] p-4 shadow-2xs">
                <div className="flex items-start gap-6 overflow-x-auto no-scrollbar py-2">
                  {subcategoryPills.map((pill) => {
                    const isSelected =
                      (pill.name === 'All' && selectedSubcategory === 'All') ||
                      selectedSubcategory === pill.name;

                    return (
                      <button
                        key={pill.name}
                        type="button"
                        onClick={() => setSelectedSubcategory(pill.name)}
                        className="flex flex-col items-center group cursor-pointer shrink-0 transition-all focus:outline-none"
                      >
                        {/* Circular Avatar */}
                        <div
                          className={`w-16 h-16 rounded-full overflow-hidden p-1 transition-all ${
                            isSelected
                              ? 'ring-3 ring-[#EF7C3C] ring-offset-2 scale-105 shadow-sm'
                              : 'border border-[#E5DFCE] group-hover:scale-105 group-hover:border-[#009E66]'
                          }`}
                        >
                          <img
                            src={pill.iconUrl}
                            alt={pill.name}
                            className="w-full h-full object-cover rounded-full bg-[#FAF6EE]"
                          />
                        </div>

                        {/* Subcategory Label */}
                        <span
                          className={`text-xs mt-2 text-center whitespace-nowrap font-bold transition-colors ${
                            isSelected
                              ? 'text-[#EF7C3C] font-black'
                              : 'text-[#556658] group-hover:text-[#009E66]'
                          }`}
                        >
                          {pill.name}
                        </span>

                        {/* Active Indicator */}
                        {isSelected && (
                          <div className="w-10 h-0.5 bg-[#EF7C3C] rounded-full mt-1 animate-in fade-in duration-200" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Filters Summary & Dynamic Product Count */}
              <div className="flex items-center justify-between text-xs text-[#556658]">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="font-black text-[#009E66]">
                    {selectedPetTypes.length === 0
                      ? 'All Pets Essentials'
                      : selectedPetTypes.length === 1
                        ? selectedPetTypes[0] === 'DOG'
                          ? 'Dogs Essentials'
                          : selectedPetTypes[0] === 'CAT'
                            ? 'Cats Essentials'
                            : 'Small Pets Essentials'
                        : `${selectedPetTypes.map((p) => (p === 'DOG' ? 'Dogs' : p === 'CAT' ? 'Cats' : 'Small Pets')).join(' & ')} Essentials`}
                  </span>
                  {selectedSubcategory !== 'All' && (
                    <span className="font-bold text-[#EF7C3C]">· {selectedSubcategory}</span>
                  )}
                  {selectedBrands.length > 0 && (
                    <span className="font-bold text-[#009E66]">· {selectedBrands.join(', ')}</span>
                  )}
                </div>

                <span className="font-black text-[#009E66]">
                  {displayedProducts.length} {displayedProducts.length === 1 ? 'product' : 'products'} found
                </span>
              </div>

              {/* Product Grid & States */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-[#EDE7D9] space-y-3">
                      <Skeleton className="w-full aspect-[4/3] rounded-xl bg-[#FAF6EE]" />
                      <Skeleton className="w-20 h-4 rounded bg-[#FAF6EE]" />
                      <Skeleton className="w-3/4 h-5 rounded bg-[#FAF6EE]" />
                      <div className="pt-2 flex justify-between items-center">
                        <Skeleton className="w-20 h-6 rounded bg-[#FAF6EE]" />
                        <Skeleton className="w-24 h-8 rounded-xl bg-[#FAF6EE]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <ErrorState message={error} onRetry={fetchProducts} />
              ) : displayedProducts.length === 0 ? (
                <EmptyState
                  title="No Paw Store products found"
                  description="No items match your selected filter criteria. Try adjusting the price slider or resetting brand and pet type selections."
                  actionLabel="Reset All Filters"
                  onAction={clearFilters}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {displayedProducts.map((product) => (
                    <div key={product.id} className="h-full flex flex-col">
                      <ProductCard
                        product={product}
                        isSaved={isSaved('PRODUCT', product.id)}
                        onQuickView={(p) => setSelectedProductDetail(p)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Product Detail Modal */}
      {selectedProductDetail && (
        <ProductDetailModal
          product={selectedProductDetail}
          onClose={() => setSelectedProductDetail(null)}
          isSaved={isSaved('PRODUCT', selectedProductDetail.id)}
        />
      )}

      {/* Floating Sticky Cart Bar */}
      <StickyCartBar />

      {/* Universal Footer */}
      <Footer />
    </div>
  );
};

export default PetEssentialsPage;
