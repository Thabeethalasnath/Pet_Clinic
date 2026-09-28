import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  ShoppingBag,
  ShieldCheck,
  Plus,
  Minus,
  Trash2,
  Stethoscope,
  Sparkles,
  Store,
  Bell,
  BellRing,
} from 'lucide-react';
import { WishlistHeart } from './WishlistHeart';
import { NotifyMeModal } from './NotifyMeModal';
import { formatCurrency, getProductImageUrl } from '../../lib/utils';
import { springs } from '../../lib/motion';
import { useCart } from '../../hooks/useCart';
import { useRestockNotifications } from '../../hooks/useRestockNotifications';

export interface ProductItemData {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  price: number;
  stockQuantity: number;
  rating?: number;
  reviewsCount?: number;
  imageUrl?: string;
  secondaryImageUrl?: string;
  prescriptionRequired?: boolean;
  brand?: string;
  petType?: string;
  species?: string;
  productType?: string;
  originalPrice?: number;
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: ProductItemData;
  isSaved?: boolean;
  onQuickView?: (product: ProductItemData) => void;
  onAddToCart?: (product: ProductItemData, e: React.MouseEvent) => void;
  isAddingToCart?: boolean;
  isAddedSuccess?: boolean;
  quantityInCart?: number;
  onCompareToggle?: (product: ProductItemData) => void;
  isComparing?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSaved = false,
  onQuickView,
  onAddToCart,
  isAddingToCart = false,
  quantityInCart: propQuantityInCart,
}) => {
  const { updateQuantity, removeItem, addToCart: contextAddToCart, items } = useCart();
  const { isSubscribed } = useRestockNotifications();
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const isProductSubscribed = isSubscribed(product.id);
  const quantityInCart =
    propQuantityInCart !== undefined
      ? propQuantityInCart
      : items.find((i) => i.productId === product.id)?.quantity || 0;

  const rating = product.rating ? Number(product.rating) : null;
  const reviewsCount = product.reviewsCount || 0;
  const isOutOfStock = (product.stockQuantity || 0) <= 0;
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const primaryImage = getProductImageUrl(product.name, product.imageUrl, product.id);

  const handleCardClick = () => {
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <motion.div
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={springs.soft}
      className="group bg-white rounded-2xl border border-[#EDE7D9] shadow-2xs hover:-translate-y-1 hover:shadow-[0_12px_28px_-6px_rgba(31,75,67,0.12)] hover:border-[#009E66]/30 transition-all duration-200 ease-out flex flex-col justify-between overflow-hidden relative cursor-pointer h-full"
    >
      {/* Top Badges, Fixed Aspect Ratio Image & Wishlist Heart */}
      <div className="relative w-full aspect-[4/3] bg-[#FAF6EE] overflow-hidden flex items-center justify-center p-3">
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain filter drop-shadow-xs select-none pointer-events-none"
        />

        {/* Top-Left Status / Category Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap items-center gap-1.5">
          {discountPercent ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EF7C3C] text-white text-[10px] font-black tracking-wide uppercase shadow-2xs">
              <Sparkles className="w-2.5 h-2.5" />
              {discountPercent}% OFF
            </span>
          ) : product.prescriptionRequired ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EF7C3C]/12 text-[#EF7C3C] text-[10px] font-black uppercase tracking-wide border border-[#EF7C3C]/20 shadow-2xs">
              <ShieldCheck className="w-3 h-3" />
              <span>Rx Required</span>
            </span>
          ) : reviewsCount > 0 && rating && rating >= 4.8 ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EBF5FF] text-[#1D4ED8] text-[10px] font-black tracking-wider uppercase border border-[#BFDBFE] shadow-2xs">
              <Stethoscope className="w-3 h-3 text-[#2563EB]" />
              <span>Vet Approved</span>
            </span>
          ) : null}
        </div>

        {/* Wishlist Heart Toggle */}
        <div
          className="absolute top-2.5 right-2.5 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <WishlistHeart
            itemType="PRODUCT"
            itemId={product.id}
            isInitiallySaved={isSaved}
            className="shadow-2xs"
          />
        </div>

        {/* Pickup Ready Tag */}
        <div className="absolute bottom-2 left-2.5 flex items-center gap-1 text-[10px] font-bold text-[#009E66] bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full border border-[#EDE7D9] shadow-2xs">
          <Store className="w-3 h-3 text-[#EF7C3C]" />
          <span>Pickup Ready</span>
        </div>
      </div>

      {/* Product Info & Action Footer */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Rating Row */}
          <div className="flex items-center justify-between text-[11px] mb-1 gap-2">
            <span className="text-[#009E66] uppercase tracking-wider font-black truncate">
              {product.brand || product.category}
            </span>

            {reviewsCount > 0 && rating !== null ? (
              <div className="flex items-center gap-1 text-[#16241B] shrink-0">
                <Star className="w-3.5 h-3.5 fill-[#EF7C3C] text-[#EF7C3C]" />
                <span className="font-black text-xs">{rating.toFixed(1)}</span>
                <span className="text-[#88998C] text-[10px]">({reviewsCount})</span>
              </div>
            ) : (
              <span className="text-[10px] text-[#88998C] font-medium flex items-center gap-1">
                <Star className="w-3 h-3 text-gray-300" />
                <span>No reviews</span>
              </span>
            )}
          </div>

          {/* Product Title */}
          <h4
            className="text-sm font-medium text-[#16241B] line-clamp-2 leading-snug group-hover:text-[#009E66] transition-colors min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </h4>

          {/* Subtitle / Category Description */}
          <p className="text-xs font-normal text-[#556658] mt-1 line-clamp-1">
            {product.subcategory || product.category || product.description || 'Pet Essential Care'}
          </p>
        </div>

        {/* Bottom Pricing & In-Store Cart Button */}
        <div
          className="pt-3 border-t border-[#F0EAE1] flex items-center justify-between gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <span className="text-base sm:text-lg font-black text-[#009E66]">
              {formatCurrency(product.price)}
            </span>
            <span className="block text-[10px] font-semibold text-[#88998C]">
              In-Store Pickup
            </span>
          </div>

          {/* Cart Add / Stepper / Out of stock */}
          {isOutOfStock ? (
            isProductSubscribed ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifyModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#E6F9EC] hover:bg-[#d4f2dc] border border-[#CBDAC6] text-[#009E66] font-bold text-xs flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                title="Click to manage restock notification"
              >
                <BellRing className="w-3.5 h-3.5 text-[#009E66]" />
                <span>Notified</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifyModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1"
                title="Get notified when this item is back in stock"
              >
                <Bell className="w-3.5 h-3.5 text-[#EF7C3C]" />
                <span>Notify</span>
              </button>
            )
          ) : quantityInCart > 0 ? (
            <div
              className="flex items-center bg-[#009E66] text-white rounded-xl p-0.5 shadow-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={(e) => {
                  e.stopPropagation();
                  if (quantityInCart <= 1) {
                    removeItem(product.id);
                  } else {
                    updateQuantity(product.id, quantityInCart - 1);
                  }
                }}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {quantityInCart <= 1 ? (
                  <Trash2 className="w-3.5 h-3.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
              </button>
              <span className="w-7 text-center font-black text-xs select-none">
                {quantityInCart}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={quantityInCart >= product.stockQuantity}
                onClick={(e) => {
                  e.stopPropagation();
                  if (quantityInCart < product.stockQuantity) {
                    updateQuantity(product.id, quantityInCart + 1);
                  }
                }}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isAddingToCart}
              onClick={(e) => {
                e.stopPropagation();
                if (onAddToCart) onAddToCart(product, e);
                else contextAddToCart(product, e);
              }}
              className="group/addbtn h-9 px-3.5 rounded-xl text-xs font-bold bg-[#009E66] hover:bg-[#008756] text-white border-none flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all whitespace-nowrap"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white group-hover/addbtn:text-[#EF7C3C] transition-colors duration-200" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Restock Notification Modal */}
      <NotifyMeModal
        product={product}
        isOpen={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
      />
    </motion.div>
  );
};

export default ProductCard;
