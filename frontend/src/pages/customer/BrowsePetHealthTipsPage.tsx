import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { getArticleImageUrl } from '../../lib/utils';
import { apiClient } from '../../lib/axios';
import {
  Search,
  PawPrint,
  Calendar,
  Clock,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface ArticleDto {
  id: number;
  title: string;
  excerpt?: string;
  content?: string;
  category: string;
  petType?: string;
  imageUrl?: string;
  publishedAt?: string;
  readTimeMinutes?: number;
  isFeatured?: boolean;
}

const resolveArticleImageUrl = (photoUrl?: string, title?: string): string => {
  return getArticleImageUrl(title, photoUrl);
};

const computeReadTime = (content?: string, excerpt?: string): number => {
  const text = (content || excerpt || '').trim();
  if (!text) return 3;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const resolveCategory = (title?: string, cat?: string): string => {
  const t = (title || '').toLowerCase();
  const c = (cat || '').trim();
  if (t.includes('nutrition') || t.includes('food') || t.includes('diet')) return 'Nutrition';
  if (t.includes('vaccin') || t.includes('shot')) return 'Vaccination';
  if (t.includes('groom') || t.includes('bath') || t.includes('wash')) return 'Grooming';
  if (t.includes('sign') || t.includes('sick') || t.includes('emergenc')) return 'Emergency Care';
  if (t.includes('cat') || t.includes('indoor') || t.includes('play') || t.includes('behaviour') || t.includes('behavior')) return 'Behaviour';
  if (t.includes('senior') || t.includes('aging') || t.includes('old dog') || t.includes('old cat')) return 'Senior Pet Care';
  if (c && c !== 'Preventive Care' && c !== 'General') return c;
  return c || 'Preventive Care';
};

const categoryColorMap: Record<string, { bg: string; text: string }> = {
  Nutrition: { bg: 'bg-[#FEF9C3]', text: 'text-[#B45309]' },
  Vaccination: { bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]' },
  Grooming: { bg: 'bg-[#FFE4E6]', text: 'text-[#E11D48]' },
  'Preventive Care': { bg: 'bg-[#F3E8FF]', text: 'text-[#7E22CE]' },
  Behaviour: { bg: 'bg-[#FFEDD5]', text: 'text-[#C2410C]' },
  'Senior Pet Care': { bg: 'bg-[#CCFBF1]', text: 'text-[#0F766E]' },
  'Emergency Care': { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]' },
  'Puppy Care': { bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]' },
};

const petTypes = [
  {
    name: 'Dogs',
    bg: 'bg-[#FEF9C3]',
    border: 'border-[#FDE047]',
    hoverBorder: 'hover:border-[#EAB308]',
    activeBorder: 'border-[#CA8A04]',
    text: 'text-[#B45309]',
    hoverText: 'group-hover:text-[#B45309]',
    hoverBg: 'hover:bg-[#FEF9C3]/50',
    imageUrl: 'https://res.cloudinary.com/vphylrop/image/upload/v1789131563/ChatGPT_Image_Sep_11_2026_06_29_05_PM.png',
  },
  {
    name: 'Cats',
    bg: 'bg-[#E6F9EC]',
    border: 'border-[#C3ECD0]',
    hoverBorder: 'hover:border-[#3FA65C]',
    activeBorder: 'border-[#009E66]',
    text: 'text-[#009E66]',
    hoverText: 'group-hover:text-[#009E66]',
    hoverBg: 'hover:bg-[#E6F9EC]/50',
    imageUrl: 'https://res.cloudinary.com/vphylrop/image/upload/v1789132287/ChatGPT_Image_Sep_11_2026_06_41_13_PM.png',
  },
  {
    name: 'Rabbits',
    bg: 'bg-[#FFEDD5]',
    border: 'border-[#FED7AA]',
    hoverBorder: 'hover:border-[#FB923C]',
    activeBorder: 'border-[#C2410C]',
    text: 'text-[#C2410C]',
    hoverText: 'group-hover:text-[#C2410C]',
    hoverBg: 'hover:bg-[#FFEDD5]/50',
    imageUrl: 'https://res.cloudinary.com/vphylrop/image/upload/v1788895236/886e967f-9a24-48c5-aeff-ff8e6f6a00e6_1.png',
  },
  {
    name: 'Birds',
    bg: 'bg-[#E0F2FE]',
    border: 'border-[#BAE6FD]',
    hoverBorder: 'hover:border-[#38BDF8]',
    activeBorder: 'border-[#0284C7]',
    text: 'text-[#0284C7]',
    hoverText: 'group-hover:text-[#0284C7]',
    hoverBg: 'hover:bg-[#E0F2FE]/50',
    imageUrl: 'https://res.cloudinary.com/vphylrop/image/upload/v1788895236/ce452fe3-fdc7-4140-8b94-6c0f373622db_1.png',
  },
  {
    name: 'Small Pets',
    bg: 'bg-[#FFE4E6]',
    border: 'border-[#FECDD3]',
    hoverBorder: 'hover:border-[#FB7185]',
    activeBorder: 'border-[#E11D48]',
    text: 'text-[#E11D48]',
    hoverText: 'group-hover:text-[#E11D48]',
    hoverBg: 'hover:bg-[#FFE4E6]/50',
    imageUrl: 'https://res.cloudinary.com/vphylrop/image/upload/v1788895236/c0d11401-6185-488d-9267-a5235e16375a_1.png',
  },
  {
    name: 'Reptiles',
    bg: 'bg-[#DCFCE7]',
    border: 'border-[#BBF7D0]',
    hoverBorder: 'hover:border-[#4ADE80]',
    activeBorder: 'border-[#15803D]',
    text: 'text-[#15803D]',
    hoverText: 'group-hover:text-[#15803D]',
    hoverBg: 'hover:bg-[#DCFCE7]/50',
    imageUrl: 'https://res.cloudinary.com/vphylrop/image/upload/v1788895236/3553855e-62e9-4565-9f5a-a5d484ecd080_1.png',
  },
  {
    name: 'Fish',
    bg: 'bg-[#CCFBF1]',
    border: 'border-[#99F6E4]',
    hoverBorder: 'hover:border-[#2DD4BF]',
    activeBorder: 'border-[#0D9488]',
    text: 'text-[#0D9488]',
    hoverText: 'group-hover:text-[#0D9488]',
    hoverBg: 'hover:bg-[#CCFBF1]/50',
    imageUrl: 'https://res.cloudinary.com/vphylrop/image/upload/v1788895236/119ae58d-9928-4822-afb6-97826bd4341c_1.png',
  },
];

import { FALLBACK_ARTICLES } from '../../data/mockArticles';

export const BrowsePetHealthTipsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const petTypeParam = searchParams.get('petType');

  const [articles, setArticles] = useState<ArticleDto[]>(FALLBACK_ARTICLES);
  const [selectedPetType, setSelectedPetType] = useState<string | null>(petTypeParam || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (petTypeParam) {
      setSelectedPetType(petTypeParam);
    }
  }, [petTypeParam]);

  const fetchArticles = () => {
    setLoading(true);
    setError(null);
    Promise.allSettled([
      apiClient.get<ArticleDto[]>('/articles'),
      apiClient.get<ArticleDto[]>('/health-tips'),
    ])
      .then(([artRes, tipRes]) => {
        const artList =
          artRes.status === 'fulfilled' && Array.isArray(artRes.value.data)
            ? artRes.value.data
            : [];
        const tipList =
          tipRes.status === 'fulfilled' && Array.isArray(tipRes.value.data)
            ? tipRes.value.data
            : [];

        const combined = [...artList];
        const existingTitles = new Set(
          artList.map((a) => a.title.toLowerCase().trim())
        );
        for (const tip of tipList) {
          if (!existingTitles.has(tip.title.toLowerCase().trim())) {
            combined.push(tip);
            existingTitles.add(tip.title.toLowerCase().trim());
          }
        }
        setArticles(combined.length > 0 ? combined : FALLBACK_ARTICLES);
      })
      .catch(() => {
        setArticles(FALLBACK_ARTICLES);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSelectPetType = (petName: string) => {
    if (selectedPetType?.toLowerCase() === petName.toLowerCase()) {
      setSelectedPetType(null);
      setSearchParams({}, { replace: true });
    } else {
      setSelectedPetType(petName);
      setSearchParams({ petType: petName }, { replace: true });
    }
  };

  const handleClearFilters = () => {
    setSelectedPetType(null);
    setSearchQuery('');
    setSearchParams({}, { replace: true });
  };

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/profile');
    }
  };

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const petType = (art.petType || '').toLowerCase();
      const title = (art.title || '').toLowerCase();
      const excerpt = (art.excerpt || '').toLowerCase();
      const content = (art.content || '').toLowerCase();
      const resolvedCat = resolveCategory(art.title, art.category).toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      // Pet Type filter
      let matchesPet = true;
      if (selectedPetType) {
        const target = selectedPetType.toLowerCase();
        const targetSingular = target.endsWith('s') ? target.slice(0, -1) : target;
        matchesPet =
          petType.includes(target) ||
          petType.includes(targetSingular) ||
          petType === 'all' ||
          title.includes(target) ||
          title.includes(targetSingular) ||
          excerpt.includes(target) ||
          excerpt.includes(targetSingular) ||
          content.includes(target) ||
          content.includes(targetSingular) ||
          resolvedCat.includes(target) ||
          resolvedCat.includes(targetSingular);
      }

      // Search query filter
      let matchesSearch = true;
      if (query) {
        matchesSearch =
          title.includes(query) ||
          excerpt.includes(query) ||
          content.includes(query) ||
          resolvedCat.includes(query) ||
          petType.includes(query);
      }

      return matchesPet && matchesSearch;
    });
  }, [articles, selectedPetType, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#16241B] font-sans flex flex-col antialiased">
      {/* 1. Navbar */}
      <Navbar activePage="health-tips" />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-14 w-full space-y-6">
        {/* Navigation / Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#EDE7D9] text-[#16241B] text-xs font-bold shadow-2xs hover:shadow-md hover:border-[#009E66] transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-[#009E66] group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          <button
            onClick={() => navigate('/health-tips')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E6F9EC] border border-[#CBDAC6] text-[#009E66] text-xs font-bold shadow-2xs hover:bg-[#009E66] hover:text-white transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#EF7C3C]" />
            <span>View All Health Articles</span>
          </button>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#EDE7D9] shadow-xs space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F9EC] text-[#009E66] text-xs font-black uppercase tracking-wider border border-[#CBDAC6]">
                <PawPrint className="w-3.5 h-3.5 text-[#EF7C3C]" />
                <span>PET CARE DIRECTORY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#16241B] tracking-tight">
                Choose Your <span className="text-[#EF7C3C]">Fur Baby</span><span className="text-[#EF7C3C]">.</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#556658] font-medium leading-relaxed">
                {selectedPetType
                  ? `Showing veterinary articles and wellness advice curated specifically for ${selectedPetType}.`
                  : 'Find health, nutrition, and everyday care tips made for your companion.'}
              </p>
            </div>

            {/* Actions: Search & Reset */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {selectedPetType && (
                <button
                  onClick={handleClearFilters}
                  className="px-3.5 py-2 text-xs font-bold text-[#009E66] bg-[#E6F9EC] border border-[#CBDAC6] rounded-xl shadow-2xs hover:bg-[#009E66] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Show All Pets</span>
                </button>
              )}

              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#88998C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pet health tips..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF6EE] border border-[#EDE7D9] text-xs text-[#16241B] placeholder-[#88998C] focus:outline-hidden focus:ring-1 focus:ring-[#009E66] shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Pet Types Selector Carousel */}
          <div className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar pb-2 pt-2 scroll-smooth">
            {petTypes.map((pet) => {
              const isSelected = selectedPetType?.toLowerCase() === pet.name.toLowerCase();
              return (
                <div
                  key={pet.name}
                  onClick={() => handleSelectPetType(pet.name)}
                  className={`min-w-[130px] sm:min-w-[150px] flex-1 rounded-[20px] p-2.5 sm:p-3 border transition-all flex flex-col items-center text-center group cursor-pointer ${
                    isSelected
                      ? `${pet.bg} ${pet.activeBorder} shadow-md ring-2 ring-[#009E66]/20 scale-102`
                      : `bg-[#FAF6EE] ${pet.border} ${pet.hoverBorder} ${pet.hoverBg} shadow-2xs hover:shadow-md`
                  }`}
                >
                  <div className="w-full aspect-[4/3] rounded-[14px] overflow-hidden bg-white mb-2 border border-black/5">
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-bold transition-colors ${
                      isSelected ? pet.text : `text-[#16241B] ${pet.hoverText}`
                    }`}
                  >
                    {pet.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Health Tips Articles Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-[24px] p-4 border border-[#EDE7D9] space-y-3">
                  <Skeleton className="w-full aspect-[16/10] rounded-[18px]" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              ))}
            </div>
          ) : error ? (
            <ErrorState title="Error Loading Tips" message={error} onRetry={fetchArticles} />
          ) : filteredArticles.length === 0 ? (
            <EmptyState
              title="No health tips found"
              description={
                selectedPetType
                  ? `We couldn't find any health tips for ${selectedPetType} matching your filters right now. Try clearing your search or exploring other categories!`
                  : 'We couldn\'t find any health tips matching your search filter.'
              }
              actionLabel="View All Health Tips"
              onAction={handleClearFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArticles.map((tip) => {
                const category = resolveCategory(tip.title, tip.category);
                const colors = categoryColorMap[category] || {
                  bg: 'bg-[#E6F9EC]',
                  text: 'text-[#009E66]',
                };
                const readTime = computeReadTime(tip.content, tip.excerpt);

                return (
                  <div
                    key={tip.id}
                    onClick={() => navigate(`/health-tips/${tip.id}`)}
                    className="bg-white rounded-[24px] p-4 border border-[#EDE7D9] hover:border-[#009E66]/40 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      {/* Image + Category Badge */}
                      <div className="relative w-full aspect-[16/10] rounded-[18px] overflow-hidden bg-[#FAF6EE] mb-3.5 border border-[#F0EAE1]">
                        <img
                          src={resolveArticleImageUrl(tip.imageUrl, tip.title)}
                          alt={tip.title}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className={`absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${colors.bg} ${colors.text} shadow-xs border border-white/60`}
                        >
                          {category}
                        </span>
                        {tip.petType && (
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/60 backdrop-blur-xs text-white uppercase tracking-wider">
                            {tip.petType}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-sm sm:text-base font-black text-[#16241B] group-hover:text-[#009E66] transition-colors line-clamp-2 leading-snug mb-2">
                        {tip.title}
                      </h3>

                      {/* Excerpt */}
                      {tip.excerpt && (
                        <p className="text-xs text-[#556658] font-normal line-clamp-2 leading-relaxed mb-3">
                          {tip.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Footer Meta */}
                    <div className="pt-3 border-t border-[#F0EAE1] flex items-center justify-between text-[11px] text-[#88998C] font-semibold mt-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#009E66]" />
                          {tip.publishedAt
                            ? new Date(tip.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Recent'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#EF7C3C]" />
                          {readTime} min read
                        </span>
                      </div>

                      <div className="w-7 h-7 rounded-full bg-[#FAF6EE] group-hover:bg-[#009E66] group-hover:text-white text-[#16241B] flex items-center justify-center transition-colors shadow-2xs">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BrowsePetHealthTipsPage;
