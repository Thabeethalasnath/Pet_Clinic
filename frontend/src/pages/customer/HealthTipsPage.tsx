import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { getArticleImageUrl } from '../../lib/utils';
import { apiClient } from '../../lib/axios';
import {
  Search,
  Heart,
  Utensils,
  Syringe,
  Scissors,
  ShieldCheck,
  PawPrint,
  AlertTriangle,
  Calendar,
  Clock,
  ChevronRight,
  Droplets,
  Moon,
  Sparkles,
} from 'lucide-react';

import { FALLBACK_ARTICLES } from '../../data/mockArticles';

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

export const HealthTipsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All Tips');
  const [searchQuery, setSearchQuery] = useState('');

  const [articles, setArticles] = useState<ArticleDto[]>(FALLBACK_ARTICLES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterTabs = [
    { name: 'All Tips', icon: Sparkles, bg: 'bg-[#F6F7F2]', text: 'text-[#009E66]', border: 'border-[#CBDAC6]' },
    { name: 'Nutrition', icon: Utensils, bg: 'bg-[#FEF9C3]', text: 'text-[#B45309]', border: 'border-[#FDE047]' },
    { name: 'Vaccination', icon: Syringe, bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]', border: 'border-[#BAE6FD]' },
    { name: 'Grooming', icon: Scissors, bg: 'bg-[#FFE4E6]', text: 'text-[#E11D48]', border: 'border-[#FECDD3]' },
    { name: 'Preventive Care', icon: ShieldCheck, bg: 'bg-[#F3E8FF]', text: 'text-[#7E22CE]', border: 'border-[#E9D5FF]' },
    { name: 'Behaviour', icon: PawPrint, bg: 'bg-[#FFEDD5]', text: 'text-[#C2410C]', border: 'border-[#FED7AA]' },
    { name: 'Senior Pet Care', icon: Heart, bg: 'bg-[#CCFBF1]', text: 'text-[#0F766E]', border: 'border-[#99F6E4]' },
    { name: 'Emergency Care', icon: AlertTriangle, bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', border: 'border-[#FECACA]' },
  ];


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

  // Live Article Counts per Category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { 'All Tips': articles.length };
    articles.forEach((art) => {
      const cat = resolveCategory(art.title, art.category);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [articles]);

  const filteredArticles = React.useMemo(() => {
    return articles.filter((art) => {
      const resolvedCat = resolveCategory(art.title, art.category);
      const title = (art.title || '').toLowerCase();
      const content = (art.content || '').toLowerCase();
      const excerpt = (art.excerpt || '').toLowerCase();
      const targetTab = activeTab.toLowerCase();
      const query = (searchQuery || '').toLowerCase();

      const matchesCategory =
        activeTab === 'All Tips' ||
        resolvedCat.toLowerCase() === targetTab;

      const matchesSearch =
        searchQuery === '' ||
        title.includes(query) ||
        content.includes(query) ||
        excerpt.includes(query) ||
        resolvedCat.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [articles, activeTab, searchQuery]);

  // Featured Article: Pick isFeatured === true first, else fall back to most recently published
  const featuredArticle = React.useMemo(() => {
    if (filteredArticles.length === 0) return null;
    const explicitlyFeatured = filteredArticles.find((a) => a.isFeatured === true);
    if (explicitlyFeatured) return explicitlyFeatured;
    return [...filteredArticles].sort(
      (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
    )[0];
  }, [filteredArticles]);

  // Remaining Articles for 3-Column Grid
  const remainingArticles = React.useMemo(() => {
    if (!featuredArticle) return filteredArticles;
    return filteredArticles.filter((a) => a.id !== featuredArticle.id);
  }, [filteredArticles, featuredArticle]);

  const quickDailyTips = [
    {
      icon: Droplets,
      bg: 'bg-[#E0F2FE]',
      color: 'text-[#0284C7]',
      text: 'Keep fresh water always available for all pets.',
    },
    {
      icon: Utensils,
      bg: 'bg-[#FEF9C3]',
      color: 'text-[#B45309]',
      text: 'Feed a balanced diet suitable for their specific age.',
    },
    {
      icon: PawPrint,
      bg: 'bg-[#E6F9EC]',
      color: 'text-[#009E66]',
      text: 'Ensure regular daily exercise and interactive playtime.',
    },
    {
      icon: Heart,
      bg: 'bg-[#FFE4E6]',
      color: 'text-[#E11D48]',
      text: 'Schedule routine annual veterinary wellness check-ups.',
    },
    {
      icon: Moon,
      bg: 'bg-[#F3E8FF]',
      color: 'text-[#7E22CE]',
      text: 'Give them a clean, dry, and comfortable sleep space.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#16241B] font-sans flex flex-col">
      {/* 1. Navbar */}
      <Navbar activePage="health-tips" />

      <main className="flex-grow space-y-10 sm:space-y-14 pt-6 sm:pt-8 pb-14">
        {/* Featured Health Tips Header & Category Filter Tabs with Live Counts */}
        <section id="featured-health-tips" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#16241B] tracking-tight">
                Fur Real <span className="text-[#EF7C3C]">Health Tips</span>.
              </h2>
              <p className="text-xs sm:text-sm text-[#556658] font-medium">
                Easy little tips for healthier paws and happier tails.
              </p>
            </div>

            {/* Live Count, Browse Pet Types Button & Search Input */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => navigate('/health-tips/by-pet-type')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 shadow-2xs bg-white text-[#009E66] border-[#EDE7D9] hover:border-[#009E66] hover:bg-[#E6F9EC]"
              >
                <PawPrint className="w-3.5 h-3.5 text-[#EF7C3C]" />
                <span>Browse by Pet Type</span>
              </button>

              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-[#88998C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter articles..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#EDE7D9] text-xs text-[#16241B] placeholder-[#88998C] focus:outline-hidden focus:ring-1 focus:ring-[#009E66] shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Horizontal Scrollable Category Pills with Live Dynamic Counts */}
          <div className="flex items-center gap-2.5 sm:gap-3 w-full py-1 overflow-x-auto no-scrollbar scroll-smooth">
            {filterTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.name;
              const count = categoryCounts[tab.name] || 0;

              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all border cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#009E66] border-[#009E66] text-white shadow-xs ring-2 ring-[#009E66]/20'
                      : 'bg-white border-[#EDE7D9] text-[#556658] hover:border-[#009E66] hover:text-[#16241B] shadow-2xs'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-[#EF7C3C] text-[#16241B]' : `${tab.bg} ${tab.text}`
                    }`}
                  >
                    <TabIcon className="w-3 h-3" />
                  </div>
                  <span className="whitespace-nowrap">{tab.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#FAF6EE] text-[#88998C]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Featured Health Tips Articles (Magazine Style: 1 Large Card + 3-Column Small Grid) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {loading ? (
              /* Adapted Skeleton: Large Featured Card Skeleton + 3 Small Grid Skeletons */
              <div className="space-y-6">
                {/* Large Featured Card Skeleton */}
                <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EDE7D9] flex flex-col lg:flex-row gap-6">
                  <Skeleton className="w-full lg:w-[48%] aspect-[16/10] rounded-2xl bg-[#FAF6EE]" />
                  <div className="flex-1 space-y-4 py-2">
                    <Skeleton className="h-6 w-32 rounded-full bg-[#FAF6EE]" />
                    <Skeleton className="h-8 w-4/5 rounded-xl bg-[#FAF6EE]" />
                    <Skeleton className="h-4 w-full rounded-md bg-[#FAF6EE]" />
                    <Skeleton className="h-4 w-3/4 rounded-md bg-[#FAF6EE]" />
                    <div className="pt-4 flex items-center justify-between">
                      <Skeleton className="h-5 w-36 rounded-md bg-[#FAF6EE]" />
                      <Skeleton className="h-10 w-28 rounded-xl bg-[#FAF6EE]" />
                    </div>
                  </div>
                </div>

                {/* 3-Column Grid Skeletons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-[#EDE7D9] space-y-3">
                      <Skeleton className="w-full aspect-[16/10] rounded-xl bg-[#FAF6EE]" />
                      <Skeleton className="h-4 w-3/4 rounded-md bg-[#FAF6EE]" />
                      <Skeleton className="h-3 w-1/2 rounded-md bg-[#FAF6EE]" />
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <ErrorState message={error} onRetry={fetchArticles} />
            ) : filteredArticles.length === 0 ? (
              <EmptyState
                title="No health tips found"
                description="We couldn't find any health tips matching your selected category or search filter."
                actionLabel="View All Health Tips"
                onAction={() => {
                  setActiveTab('All Tips');
                  setSearchQuery('');
                }}
              />
            ) : (
              <div className="space-y-8">
                {/* ===============================================================
                    A. LARGE FEATURED ARTICLE CARD (TOP)
                =============================================================== */}
                {featuredArticle && (
                  <div
                    onClick={() => navigate(`/health-tips/${featuredArticle.id}`)}
                    className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EDE7D9] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row gap-6 lg:gap-8 group cursor-pointer"
                  >
                    {/* Left/Top Image with Featured Pill */}
                    <div className="relative w-full lg:w-[48%] aspect-[16/10] lg:aspect-[16/11] rounded-2xl overflow-hidden bg-[#FAF6EE] shrink-0">
                      <img
                        src={resolveArticleImageUrl(featuredArticle.imageUrl, featuredArticle.title)}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#009E66] text-white text-xs font-black uppercase tracking-wider shadow-md">
                        <Sparkles className="w-3.5 h-3.5 text-[#EF7C3C]" />
                        <span>Featured Story</span>
                      </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1 flex flex-col justify-between py-1 space-y-4">
                      <div className="space-y-3">
                        {/* Badges: Category & Read Time */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                              categoryColorMap[resolveCategory(featuredArticle.title, featuredArticle.category)]?.bg || 'bg-[#E6F9EC]'
                            } ${
                              categoryColorMap[resolveCategory(featuredArticle.title, featuredArticle.category)]?.text || 'text-[#009E66]'
                            } border border-black/5`}
                          >
                            {resolveCategory(featuredArticle.title, featuredArticle.category)}
                          </span>

                          <span className="flex items-center gap-1 text-xs text-[#556658] font-semibold bg-[#F6F7F2] px-2.5 py-1 rounded-full border border-[#EDE7D9]">
                            <Clock className="w-3.5 h-3.5 text-[#EF7C3C]" />
                            <span>{computeReadTime(featuredArticle.content, featuredArticle.excerpt)} min read</span>
                          </span>
                        </div>

                        {/* Big Bold Headline */}
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#16241B] group-hover:text-[#009E66] transition-colors leading-tight tracking-tight">
                          {featuredArticle.title}
                        </h3>

                        {/* 2-3 Line Excerpt */}
                        <p className="text-sm sm:text-base text-[#556658] font-normal leading-relaxed line-clamp-3">
                          {featuredArticle.excerpt ||
                            (featuredArticle.content ? featuredArticle.content.slice(0, 220) + '...' : 'Explore expert veterinary insights and wellness guidance crafted for your pet’s daily health and enrichment.')}
                        </p>
                      </div>

                      {/* Bottom Meta & Action */}
                      <div className="pt-4 border-t border-[#F0EAE1] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-xs text-[#88998C] font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#009E66]" />
                            <span>
                              {featuredArticle.publishedAt
                                ? new Date(featuredArticle.publishedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'Recent Post'}
                            </span>
                          </span>
                          <span>•</span>
                          <span className="text-[#556658] font-bold">Pawfectly Team</span>
                        </div>

                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#009E66] hover:bg-[#008756] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer">
                          <span>Read Article</span>
                          <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===============================================================
                    B. REMAINING ARTICLES (SMALLER 3-COLUMN GRID)
                =============================================================== */}
                {remainingArticles.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {remainingArticles.map((tip) => {
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
                          className="bg-white rounded-2xl p-4 border border-[#EDE7D9] shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group cursor-pointer"
                        >
                          <div>
                            {/* Card Image */}
                            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#FAF6EE] mb-3.5">
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
                            </div>

                            {/* Title */}
                            <h4 className="text-sm sm:text-base font-black text-[#16241B] group-hover:text-[#009E66] transition-colors line-clamp-2 leading-snug mb-2">
                              {tip.title}
                            </h4>

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

                            <div className="w-6 h-6 rounded-full bg-[#FAF6EE] group-hover:bg-[#009E66] group-hover:text-white text-[#16241B] flex items-center justify-center transition-colors">
                              <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 5. Quick Daily Tips */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#EFF8F0] rounded-[32px] p-6 sm:p-8 border border-[#E2EEDB] shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 space-y-3 text-center lg:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#009E66] text-[11px] font-black uppercase tracking-wider shadow-2xs border border-[#C3ECD0]">
                  <Sparkles className="w-3.5 h-3.5 text-[#009E66]" />
                  <span>QUICK DAILY TIPS</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#16241B] tracking-tight leading-tight">
                  Little Habits.<br />
                  <span className="text-[#009E66]">Healthier Tomorrows.</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#556658] font-medium leading-relaxed">
                  Simple habits you can follow every day to keep your pet happy and thriving.
                </p>
              </div>

              <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {quickDailyTips.map((habit, idx) => {
                  const HabitIcon = habit.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-4 border border-[#EDE7D9] shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center gap-3"
                    >
                      <div
                        className={`w-11 h-11 rounded-full ${habit.bg} ${habit.color} flex items-center justify-center shadow-xs shrink-0`}
                      >
                        <HabitIcon className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-[#16241B] font-bold leading-snug">
                        {habit.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
