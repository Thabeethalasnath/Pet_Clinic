import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, Heart, ArrowUp } from 'lucide-react';
import { getCloudinaryImageUrl } from '../../lib/utils';
import { apiClient } from '../../lib/axios';

export const Footer: React.FC = () => {
  const logoUrl = getCloudinaryImageUrl('pawfectly_logo');
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeMsg, setSubscribeMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setSubscribing(true);
    setSubscribeMsg(null);
    setIsError(false);

    try {
      await apiClient.post('/newsletter/subscribe', {
        email: cleanEmail,
      });
      setSubscribed(true);
      setSubscribeMsg('Thank you for subscribing! Expert tips and updates are on their way.');
      setEmail('');
      window.dispatchEvent(new Event('admin-notifications-updated'));
    } catch (err: any) {
      setIsError(true);
      setSubscribeMsg(err.message || 'Could not subscribe. Please check your email and try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer id="site-footer" className="bg-[#16241B] text-white pt-12 sm:pt-14 pb-8 border-t border-[#23382A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_1fr_1fr_1.3fr] gap-8 lg:gap-10 items-start pb-10 sm:pb-12">
          {/* Column 1 — Brand */}
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            >
              <img
                src={logoUrl}
                alt="Pawfectly Logo"
                className="w-8 h-8 rounded-full object-cover shadow-xs"
              />
              <span className="text-xl font-extrabold tracking-tight">
                Pawfectly<span className="text-[#EF7C3C]">.</span>
              </span>
            </Link>

            <p className="text-sm text-[#A3B3A6] leading-relaxed max-w-sm">
              Your comprehensive pet wellness destination. Connecting loving owners with verified pharmacy supplies, quality essentials, and expert health guidance.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-[#1E3023] border border-[#2B3E30] text-[#A3B3A6] hover:text-white hover:border-[#009E66] hover:bg-[#23382A] transition-all flex items-center justify-center"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-[#1E3023] border border-[#2B3E30] text-[#A3B3A6] hover:text-white hover:border-[#009E66] hover:bg-[#23382A] transition-all flex items-center justify-center"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm font-medium text-[#A3B3A6]">
              <li>
                <Link
                  to="/services"
                  className="hover:text-white hover:translate-x-0.5 transition-all inline-block"
                >
                  Pet Services
                </Link>
              </li>
              <li>
                <Link
                  to="/pharmacy"
                  className="hover:text-white hover:translate-x-0.5 transition-all inline-block"
                >
                  Pharmacy
                </Link>
              </li>
              <li>
                <Link
                  to="/pet-essentials"
                  className="hover:text-white hover:translate-x-0.5 transition-all inline-block"
                >
                  Paw Store
                </Link>
              </li>
              <li>
                <Link
                  to="/health-tips"
                  className="hover:text-white hover:translate-x-0.5 transition-all inline-block"
                >
                  Fur & Facts
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Support & Legal */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Support & Legal
            </h3>
            <ul className="space-y-2.5 text-sm font-medium text-[#A3B3A6]">
              <li>
                <Link
                  to="/contact-support"
                  className="hover:text-white hover:translate-x-0.5 transition-all inline-block"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-white hover:translate-x-0.5 transition-all inline-block"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="hover:text-white hover:translate-x-0.5 transition-all inline-block"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/help-center"
                  className="hover:text-white hover:translate-x-0.5 transition-all inline-block"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 — Stay Updated (Newsletter) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Stay Updated
            </h3>
            <p className="text-sm text-[#A3B3A6] leading-relaxed">
              Subscribe for wellness guides, preventative tips, and exclusive offers delivered to your inbox.
            </p>

            {subscribed ? (
              <div className="p-3.5 bg-[#1C3323] border border-[#2B4E34] text-[#4ADE80] text-xs font-semibold rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#009E66] mt-0.5" />
                <span>{subscribeMsg || 'Thank you for subscribing!'}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7A8E7E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#1E3023] border border-[#2B3E30] text-white text-xs placeholder-[#7A8E7E] focus:outline-hidden focus:border-[#009E66] focus:ring-1 focus:ring-[#009E66] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribing}
                  className="w-full py-2.5 px-4 bg-[#009E66] hover:bg-[#008757] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {subscribing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </button>
                {isError && subscribeMsg && (
                  <div className="p-2.5 bg-[#3B1E1E] border border-[#5C2B2B] text-[#F87171] text-xs font-medium rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{subscribeMsg}</span>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-[#23382A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A3B3A6]">
          <p className="text-center sm:text-left">
            © 2024 Pawfectly India. Bengaluru, Karnataka, India.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6 text-xs text-[#7A8E7E]">
            <span className="inline-flex items-center gap-1.5 text-[#A3B3A6]">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-[#EF7C3C] fill-[#EF7C3C]" />
              <span>in Bangalore</span>
            </span>

            <button
              onClick={scrollToTop}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1E3023] border border-[#2B3E30] text-[#CBDAC6] hover:text-white hover:border-[#009E66] hover:bg-[#23382A] transition-all duration-200 cursor-pointer font-semibold group shadow-2xs text-xs"
              aria-label="Scroll back to top"
            >
              <ArrowUp className="w-3.5 h-3.5 text-[#009E66] group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

