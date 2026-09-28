import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/feedback/ErrorState';
import { getArticleImageUrl } from '../../lib/utils';
import { apiClient } from '../../lib/axios';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ChevronRight,
  BookOpen,
  Share2,
  Check,
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

const computeReadTime = (content?: string, excerpt?: string): number => {
  const text = (content || excerpt || '').trim();
  if (!text) return 3;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const resolveCategory = (title?: string, cat?: string): string => {
  if (cat && cat !== 'Preventive Care') return cat;
  const t = (title || '').toLowerCase();
  if (t.includes('nutrition') || t.includes('food') || t.includes('diet')) return 'Nutrition';
  if (t.includes('vaccin') || t.includes('shot')) return 'Vaccination';
  if (t.includes('groom') || t.includes('bath') || t.includes('wash')) return 'Grooming';
  if (t.includes('sign') || t.includes('sick') || t.includes('emergenc')) return 'Emergency Care';
  if (t.includes('cat') || t.includes('indoor') || t.includes('play') || t.includes('behaviour')) return 'Behaviour';
  return cat || 'Preventive Care';
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

export const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<ArticleDto | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ArticleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setError('Article not found.');
      setLoading(false);
      return;
    }

    const numId = Number(id);
    const fallback = FALLBACK_ARTICLES.find((a) => a.id === numId);

    setLoading(true);
    setError(null);

    const loadRelated = (currentId: number, currentCat: string, currentPetType?: string) => {
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

          const pool = combined.length > 0 ? combined : FALLBACK_ARTICLES;
          const list = pool.filter((a) => a.id !== currentId);
          const matched = list.filter(
            (a) =>
              resolveCategory(a.title, a.category) === currentCat ||
              a.petType === currentPetType
          );
          setRelatedArticles(matched.length > 0 ? matched.slice(0, 3) : list.slice(0, 3));
        })
        .catch(() => {
          const list = FALLBACK_ARTICLES.filter((a) => a.id !== currentId);
          setRelatedArticles(list.slice(0, 3));
        });
    };

    apiClient
      .get<ArticleDto>(`/articles/${id}`)
      .then((res) => {
        setArticle(res.data);
        const currentCat = resolveCategory(res.data.title, res.data.category);
        loadRelated(res.data.id, currentCat, res.data.petType);
      })
      .catch(() => {
        apiClient
          .get<ArticleDto>(`/health-tips/${id}`)
          .then((res) => {
            setArticle(res.data);
            const currentCat = resolveCategory(res.data.title, res.data.category);
            loadRelated(res.data.id, currentCat, res.data.petType);
          })
          .catch(() => {
            if (fallback) {
              setArticle(fallback);
              const currentCat = resolveCategory(fallback.title, fallback.category);
              loadRelated(fallback.id, currentCat, fallback.petType);
            } else {
              setError('Failed to load article details.');
            }
          });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const category = resolveCategory(article?.title, article?.category);
  const colors = categoryColorMap[category] || {
    bg: 'bg-[#E6F9EC]',
    text: 'text-[#009E66]',
  };

  const readTime = article ? computeReadTime(article.content, article.excerpt) : 5;

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#16241B] font-sans flex flex-col antialiased">
      <Navbar activePage="health-tips" />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-14 w-full space-y-8">
        {/* Back Button */}
        <div>
          <button
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate('/health-tips');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#EDE7D9] text-[#16241B] text-xs font-bold shadow-2xs hover:shadow-md hover:border-[#009E66] transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-[#009E66] group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <div className="space-y-3 pt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ) : error || !article ? (
          <ErrorState
            title="Article Not Found"
            message={error || 'The requested article could not be loaded.'}
            onRetry={() => navigate('/health-tips')}
          />
        ) : (
          <article className="space-y-6 sm:space-y-7">
            {/* Header Meta */}
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${colors.bg} ${colors.text} border border-black/5 shadow-2xs`}
                >
                  {category}
                </span>
                {article.petType && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-[#009E66] border border-[#CBDAC6]">
                    For {article.petType}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#16241B] tracking-tight leading-[1.18]">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1 pb-3 border-b border-[#EAE3D4] text-xs text-[#88998C] font-semibold">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#009E66]" />
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Recent'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#EF7C3C]" />
                    {readTime} min read
                  </span>
                </div>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EDE7D9] text-[#16241B] text-xs font-bold hover:bg-[#E6F9EC] hover:text-[#009E66] hover:border-[#009E66] transition-all cursor-pointer shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#009E66]" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Article</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-white border border-[#EDE7D9] shadow-sm">
              <img
                src={getArticleImageUrl(article.title, article.imageUrl)}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Excerpt Banner */}
            {article.excerpt && (
              <div className="p-4 sm:p-5 bg-[#E6F9EC]/80 border border-[#CBDAC6] rounded-2xl text-[#16241B] font-semibold text-sm sm:text-base leading-relaxed italic shadow-2xs">
                "{article.excerpt}"
              </div>
            )}

            {/* Content Body */}
            <div className="prose max-w-none text-[#334437] text-base sm:text-lg leading-relaxed space-y-6 pt-2 font-normal">
              {article.content ? (
                article.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="italic text-[#88998C]">No content available for this article.</p>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#EAE3D4] flex items-center justify-start">
              <Link
                to="/health-tips"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#009E66] hover:bg-[#008756] text-white font-black text-sm shadow-md transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-white" />
                <span>Explore All Health Tips</span>
              </Link>
            </div>

            {/* Related Articles Section */}
            {relatedArticles.length > 0 && (
              <section className="pt-6 space-y-5">
                <div className="flex items-center justify-between border-b border-[#EAE3D4] pb-4">
                  <h3 className="text-xl sm:text-2xl font-black text-[#16241B]">
                    Related <span className="text-[#EF7C3C]">Health Tips</span>.
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {relatedArticles.map((rel) => {
                    const relCat = resolveCategory(rel.title, rel.category);
                    const relColors = categoryColorMap[relCat] || {
                      bg: 'bg-[#E6F9EC]',
                      text: 'text-[#009E66]',
                    };
                    const relReadTime = computeReadTime(rel.content, rel.excerpt);

                    return (
                      <div
                        key={rel.id}
                        onClick={() => navigate(`/health-tips/${rel.id}`)}
                        className="bg-white rounded-2xl p-3.5 border border-[#EDE7D9] shadow-xs hover:shadow-md hover:border-[#009E66]/30 transition-all cursor-pointer flex flex-col group"
                      >
                        <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#FAF6EE] mb-3">
                          <img
                            src={getArticleImageUrl(rel.title, rel.imageUrl)}
                            alt={rel.title}
                            className="w-full h-full object-cover"
                          />
                          <span
                            className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${relColors.bg} ${relColors.text} shadow-xs border border-white/60`}
                          >
                            {relCat}
                          </span>
                        </div>

                        <h4 className="text-xs font-black text-[#16241B] group-hover:text-[#009E66] transition-colors line-clamp-2 flex-grow">
                          {rel.title}
                        </h4>

                        <div className="pt-2.5 border-t border-[#F0EAE1] flex items-center justify-between text-[10px] text-[#88998C] font-semibold mt-2.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#EF7C3C]" />
                            {relReadTime} min read
                          </span>
                          <div className="w-5 h-5 rounded-full bg-[#FAF6EE] group-hover:bg-[#009E66] group-hover:text-white text-[#16241B] flex items-center justify-center transition-colors">
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ArticleDetailPage;
