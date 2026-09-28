import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, BellRing, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { useRestockNotifications } from '../../hooks/useRestockNotifications';
import { formatCurrency, getProductImageUrl } from '../../lib/utils';
import type { ProductItemData } from './ProductCard';

interface NotifyMeModalProps {
  product: ProductItemData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NotifyMeModal: React.FC<NotifyMeModalProps> = ({ product, isOpen, onClose }) => {
  const { user } = useAuth();
  const { subscribe, isSubscribed, unsubscribe } = useRestockNotifications();

  const [email, setEmail] = useState(user?.email || '');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const alreadySubscribed = isSubscribed(product.id);
  const primaryImage = getProductImageUrl(product.name, product.imageUrl, product.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    subscribe(product.id, product.name, email.trim());
    setSubmitted(true);
  };

  const handleUnsubscribe = () => {
    unsubscribe(product.id);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#16241B]/60 backdrop-blur-xs"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white rounded-[28px] border border-[#CBDAC6]/80 shadow-2xl overflow-hidden z-10"
        >
          {/* Header Bar */}
          <div className="bg-[#FAF6EE] px-6 py-4 border-b border-[#EDE7D9] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#009E66]">
              <div className="w-8 h-8 rounded-full bg-[#E6F9EC] flex items-center justify-center text-[#009E66]">
                <BellRing className="w-4 h-4" />
              </div>
              <span className="font-black text-sm uppercase tracking-wide">Back In Stock Alert</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-[#CBDAC6]/60 flex items-center justify-center text-gray-400 hover:text-[#16241B] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Product Summary Preview */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#F6F7F2] border border-[#EDE7D9]">
              <div className="w-16 h-16 rounded-xl bg-white p-1.5 border border-[#CBDAC6]/40 flex items-center justify-center shrink-0">
                <img src={primaryImage} alt={product.name} className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase text-[#009E66] tracking-wider">
                  {product.category}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-[#16241B] truncate">{product.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-black text-[#009E66]">{formatCurrency(product.price)}</span>
                  <span className="px-2 py-0.2 rounded-md bg-red-100 text-red-600 text-[10px] font-bold">
                    Currently Out of Stock
                  </span>
                </div>
              </div>
            </div>

            {submitted || alreadySubscribed ? (
              <div className="py-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E6F9EC] border border-[#CBDAC6] text-[#009E66] flex items-center justify-center mx-auto shadow-2xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-[#16241B]">Notification Active!</h3>
                  <p className="text-xs text-[#556658] leading-relaxed max-w-xs mx-auto">
                    We've saved your request. As soon as this product is restocked, an alert will be sent directly to your <strong>Inbox</strong>.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl bg-[#009E66] text-white font-bold text-xs hover:bg-[#008756] transition-all cursor-pointer shadow-sm"
                  >
                    Got It, Thank You!
                  </button>
                  {alreadySubscribed && (
                    <button
                      type="button"
                      onClick={handleUnsubscribe}
                      className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Cancel Notification
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-[#556658] leading-relaxed">
                    Be the first to know! Leave your email below and we'll instantly message your Pawfectly Inbox the moment new stock arrives.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#16241B]">Your Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#CBDAC6] text-xs sm:text-sm text-[#16241B] placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#009E66]"
                    required
                  />
                  {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#556658]">
                  <ShieldCheck className="w-4 h-4 text-[#009E66] shrink-0" />
                  <span>No spam. One-time restock alert only.</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#EF7C3C] hover:bg-[#D4932B] text-[#16241B] font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Bell className="w-4 h-4" />
                  <span>Notify Me When Restocked</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default NotifyMeModal;
