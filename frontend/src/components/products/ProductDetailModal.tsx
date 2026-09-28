import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  ShoppingBag,
  Check,
  ShieldCheck,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  Store,
  MessageSquare,
  UserCheck,
  Bell,
  BellRing,
} from 'lucide-react';
import type { ProductItemData } from './ProductCard';
import { WishlistHeart } from './WishlistHeart';
import { NotifyMeModal } from './NotifyMeModal';
import { Skeleton } from '../ui/Skeleton';
import { formatCurrency, getProductImageUrl } from '../../lib/utils';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../features/auth/AuthContext';
import { useRestockNotifications } from '../../hooks/useRestockNotifications';
import { apiClient } from '../../lib/axios';
import { springs } from '../../lib/motion';

export interface ProductReviewDto {
  id: number;
  productId: number;
  productName?: string;
  customerId: number;
  customerName: string;
  rating: number;
  reviewText?: string;
  createdAt: string;
}

export interface ProductDetailModalProps {
  product: ProductItemData | null;
  onClose: () => void;
  isSaved?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  isSaved = false,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, updateQuantity, removeItem, items } = useCart();
  const { isSubscribed } = useRestockNotifications();
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reviews State
  const [productReviews, setProductReviews] = useState<ProductReviewDto[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newHoverRating, setNewHoverRating] = useState<number>(0);
  const [newReviewText, setNewReviewText] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);
  const [reviewErrorMsg, setReviewErrorMsg] = useState<string | null>(null);
  const [liveRating, setLiveRating] = useState<number | null>(null);
  const [liveReviewsCount, setLiveReviewsCount] = useState<number>(0);

  // Gallery Images Array: Only include secondary image if it exists and differs
  const galleryImages = product
    ? [
        getProductImageUrl(product.name, product.imageUrl, product.id),
        ...(product.secondaryImageUrl && product.secondaryImageUrl !== product.imageUrl
          ? [product.secondaryImageUrl]
          : []),
      ]
    : [];

  // Fetch Reviews when product opens
  const fetchProductReviews = useCallback(async (productId: number) => {
    setReviewsLoading(true);
    try {
      const res = await apiClient.get<ProductReviewDto[]>(`/products/${productId}/reviews`);
      const list = res.data || [];
      setProductReviews(list);
      if (list.length > 0) {
        const sum = list.reduce((acc, r) => acc + r.rating, 0);
        const avg = Number((sum / list.length).toFixed(1));
        setLiveRating(avg);
        setLiveReviewsCount(list.length);
      } else {
        setLiveRating(null);
        setLiveReviewsCount(0);
      }
    } catch {
      setProductReviews([]);
      setLiveRating(null);
      setLiveReviewsCount(0);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  // Reset states when product opens
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setIsAdded(false);
      setReviewSuccessMsg(null);
      setReviewErrorMsg(null);
      setNewReviewText('');
      setNewRating(5);
      setLiveRating(null);
      setLiveReviewsCount(0);
      fetchProductReviews(product.id);
    }
  }, [product, fetchProductReviews]);

  // Keyboard navigation & scroll lock
  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const isOutOfStock = (product.stockQuantity ?? 10) <= 0;
  const inCartItem = items.find((i) => i.productId === product.id);

  const handleAdd = async (e: React.MouseEvent) => {
    if (isOutOfStock) return;
    setIsAdded(true);
    await addToCart(product, e);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (newRating < 1 || newRating > 5) {
      setReviewErrorMsg('Please select a star rating between 1 and 5.');
      return;
    }

    setSubmittingReview(true);
    setReviewErrorMsg(null);
    setReviewSuccessMsg(null);

    try {
      const res = await apiClient.post<ProductReviewDto>(
        `/customer/products/${product.id}/reviews`,
        {
          rating: newRating,
          reviewText: newReviewText.trim(),
        }
      );

      if (res.data) {
        setProductReviews((prev) => [res.data, ...prev]);
        setReviewSuccessMsg('Thank you! Your review has been published.');
        setNewReviewText('');
        setNewRating(5);

        const newCount = productReviews.length + 1;
        const totalSum = productReviews.reduce((sum, r) => sum + r.rating, 0) + res.data.rating;
        const newAvg = Number((totalSum / newCount).toFixed(1));
        setLiveRating(newAvg);
        setLiveReviewsCount(newCount);
      }
    } catch (err: any) {
      setReviewErrorMsg(err?.response?.data?.message || err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9995] flex items-center justify-center p-3 sm:p-6 md:p-8">
        {/* Progressive Backdrop Blur & Dim */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#16241B]/60 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={springs.soft}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-[32px] shadow-2xl border border-[#EDE7D9] overflow-hidden flex flex-col md:flex-row"
        >
          {/* Left Column: Image Gallery Frame & Thumbnails */}
          <div className="w-full md:w-[48%] bg-[#FAF6EE] p-6 sm:p-8 flex flex-col justify-between items-center relative border-b md:border-b-0 md:border-r border-[#EDE7D9]">
            {/* Top Row: Category Pill & Wishlist Heart */}
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white text-[#16241B] shadow-2xs border border-[#EDE7D9]">
                {product.category || 'PET ESSENTIALS'}
              </span>
              <WishlistHeart
                itemType="PRODUCT"
                itemId={product.id}
                isInitiallySaved={isSaved}
                className="bg-white border border-[#EDE7D9] hover:bg-[#FAF6EE] shadow-2xs"
              />
            </div>

            {/* Main Large Product Image */}
            <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center p-4 my-auto">
              <img
                src={galleryImages[selectedImageIndex] || galleryImages[0]}
                alt={product.name}
                className="w-full h-full object-contain filter drop-shadow-md transition-all duration-300 select-none"
              />
            </div>

            {/* Thumbnail Selector Row (Only if more than 1 image) */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 mt-4">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl p-1 bg-white border-2 cursor-pointer transition-all ${
                      selectedImageIndex === idx
                        ? 'border-[#009E66] shadow-sm scale-105'
                        : 'border-[#EDE7D9] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Scrollable Details, Add to Cart & Real Reviews */}
          <div className="w-full md:w-[52%] p-6 sm:p-8 flex flex-col overflow-y-auto max-h-[85vh] no-scrollbar">
            {/* Top Row: Star Rating & Close Button */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                {liveReviewsCount > 0 && liveRating !== null ? (
                  <>
                    <div className="flex items-center text-[#EF7C3C]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(Number(liveRating))
                              ? 'fill-[#EF7C3C] text-[#EF7C3C]'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-black text-[#16241B]">{liveRating}</span>
                    <span className="text-xs text-[#88998C] font-normal">
                      ({liveReviewsCount} customer {liveReviewsCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-[#88998C] font-semibold">
                    <Star className="w-4 h-4 text-gray-300" />
                    <span>No customer reviews yet</span>
                  </div>
                )}
              </div>

              {/* Circular Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-[#FAF6EE] text-[#16241B] flex items-center justify-center hover:bg-[#EDE7D9] transition-colors cursor-pointer border border-[#EDE7D9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Title */}
            <h2 className="text-2xl sm:text-3xl font-black text-[#16241B] tracking-tight leading-tight mb-2">
              {product.name}
            </h2>

            {/* Large Green Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl sm:text-3xl font-black text-[#009E66]">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-[#88998C] line-through font-semibold">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              {product.prescriptionRequired ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-xs font-bold border border-[#FDE68A]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>Prescription Required</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F9EC] text-[#009E66] text-xs font-bold border border-[#A7F3D0]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Over The Counter (OTC)</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6EE] text-[#556658] text-xs font-bold border border-[#EDE7D9]">
                <Store className="w-3.5 h-3.5 text-[#EF7C3C]" />
                <span>Ready for In-Store Pickup</span>
              </span>
            </div>

            {/* Description & Benefits */}
            <div className="space-y-2 mb-8">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#88998C]">
                DESCRIPTION & BENEFITS
              </h4>
              <p className="text-sm text-[#556658] font-normal leading-relaxed">
                {product.description ||
                  'Premium veterinary-approved formula crafted with top quality ingredients and materials for your pet’s daily health, enrichment, and comfort.'}
              </p>
            </div>

            {/* Sticky Action Footer / Add to Cart */}
            <div className="mb-8">
              {inCartItem && inCartItem.quantity > 0 ? (
                <div className="flex-1 flex items-center justify-between p-1.5 rounded-full bg-[#009E66] text-white shadow-md shadow-[#009E66]/20">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => {
                      if (inCartItem.quantity <= 1) {
                        removeItem(product.id);
                      } else {
                        updateQuantity(product.id, inCartItem.quantity - 1);
                      }
                    }}
                    className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors active:scale-90 cursor-pointer"
                  >
                    {inCartItem.quantity <= 1 ? (
                      <Trash2 className="w-4 h-4" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span className="font-black text-sm select-none">{inCartItem.quantity} in Cart</span>
                  </div>

                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={inCartItem.quantity >= (product.stockQuantity || 99)}
                    onClick={() => {
                      if (inCartItem.quantity < (product.stockQuantity || 99)) {
                        updateQuantity(product.id, inCartItem.quantity + 1);
                      }
                    }}
                    className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-40 flex items-center justify-center text-white transition-colors active:scale-90 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : isOutOfStock ? (
                isSubscribed(product.id) ? (
                  <button
                    type="button"
                    onClick={() => setShowNotifyModal(true)}
                    className="w-full py-3.5 rounded-full text-sm sm:text-base font-bold flex items-center justify-center gap-2 bg-[#E6F9EC] hover:bg-[#d4f2dc] border border-[#CBDAC6] text-[#009E66] shadow-sm cursor-pointer transition-colors"
                  >
                    <BellRing className="w-5 h-5 text-[#009E66]" />
                    <span>Restock Notification Active</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowNotifyModal(true)}
                    className="w-full py-3.5 rounded-full text-sm sm:text-base font-bold flex items-center justify-center gap-2 bg-[#009E66] hover:bg-[#008756] text-white shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Bell className="w-5 h-5 text-white" />
                    <span>Notify Me When In Stock</span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAdd}
                  className={`group/quickadd w-full py-3.5 px-6 rounded-full text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer shadow-md ${
                    isAdded
                      ? 'bg-[#009E66] text-white'
                      : 'bg-[#009E66] hover:bg-[#008756] text-white shadow-[#009E66]/20'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-5 h-5 text-white" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 text-white" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Restock Notification Modal */}
            <NotifyMeModal
              product={product}
              isOpen={showNotifyModal}
              onClose={() => setShowNotifyModal(false)}
            />

            {/* ===============================================================
                REAL CUSTOMER REVIEWS SECTION (DATABASE-BACKED)
            =============================================================== */}
            <div className="border-t border-[#EDE7D9] pt-6 mt-2 space-y-6">
              {/* Reviews Section Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#16241B]">Customer Reviews</h3>
                  <p className="text-xs text-[#88998C] mt-0.5">
                    {liveReviewsCount > 0
                      ? `${liveReviewsCount} verified customer ${liveReviewsCount === 1 ? 'rating' : 'ratings'}`
                      : 'No reviews submitted yet'}
                  </p>
                </div>

                {liveReviewsCount > 0 && liveRating !== null ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF6EE] border border-[#EDE7D9]">
                    <Star className="w-4 h-4 fill-[#EF7C3C] text-[#EF7C3C]" />
                    <span className="text-sm font-black text-[#16241B]">{liveRating}</span>
                    <span className="text-xs text-[#88998C]">/ 5.0</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF6EE] border border-[#EDE7D9] text-xs text-[#88998C] font-medium">
                    <Star className="w-3.5 h-3.5 text-gray-300" />
                    <span>No ratings</span>
                  </div>
                )}
              </div>

              {/* Reviews List from MySQL Database */}
              {reviewsLoading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-16 w-full rounded-2xl bg-[#FAF6EE]" />
                  <Skeleton className="h-16 w-full rounded-2xl bg-[#FAF6EE]" />
                </div>
              ) : productReviews.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#FAF6EE] border border-[#EDE7D9] text-center space-y-2">
                  <MessageSquare className="w-8 h-8 text-[#CBDAC6] mx-auto" />
                  <h4 className="text-sm font-bold text-[#16241B]">No reviews yet</h4>
                  <p className="text-xs text-[#556658]">
                    Be the first customer to share your experience with this pet healthcare product!
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {productReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#EDE7D9] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#16241B]">
                            {rev.customerName || 'Verified Customer'}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#009E66] bg-[#E6F9EC] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                            <UserCheck className="w-3 h-3" />
                            <span>Verified Buyer</span>
                          </span>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center text-[#EF7C3C]">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= rev.rating ? 'fill-[#EF7C3C] text-[#EF7C3C]' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.reviewText && (
                        <p className="text-xs text-[#334437] leading-relaxed font-normal">
                          {rev.reviewText}
                        </p>
                      )}

                      {rev.createdAt && (
                        <span className="text-[10px] text-[#88998C] block">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Write a Real Review Form */}
              <div className="pt-4 border-t border-[#F0EAE1]">
                {isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#16241B]">
                      Write a Review
                    </h4>

                    {/* Interactive Star Rating Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#556658] font-semibold">Your Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setNewHoverRating(star)}
                            onMouseLeave={() => setNewHoverRating(0)}
                            className="p-0.5 focus:outline-none cursor-pointer transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= (newHoverRating || newRating)
                                  ? 'fill-[#EF7C3C] text-[#EF7C3C]'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review Comment Textarea */}
                    <textarea
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Share your thoughts about this product's effectiveness, quality, or how it helped your pet..."
                      rows={3}
                      required
                      className="w-full p-3 rounded-2xl bg-[#FAF6EE] border border-[#EDE7D9] text-xs text-[#16241B] placeholder-[#88998C] focus:outline-none focus:ring-1 focus:ring-[#009E66] resize-none"
                    />

                    {/* Alerts */}
                    {reviewSuccessMsg && (
                      <div className="p-2.5 rounded-xl bg-[#E6F9EC] border border-[#A7F3D0] text-xs font-bold text-[#009E66] flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>{reviewSuccessMsg}</span>
                      </div>
                    )}
                    {reviewErrorMsg && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
                        {reviewErrorMsg}
                      </div>
                    )}

                    {/* Submit Review Button */}
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#009E66] hover:bg-[#008756] text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {submittingReview ? 'Submitting Review...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#EDE7D9] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#16241B]">Have you used this product?</h4>
                      <p className="text-[11px] text-[#556658]">Sign in to leave a verified rating and review.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#009E66] text-white hover:bg-[#008756] transition-all cursor-pointer shadow-xs"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductDetailModal;
