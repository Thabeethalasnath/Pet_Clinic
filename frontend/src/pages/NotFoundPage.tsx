import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Home, Search, HeartCrack } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#16241B] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="bg-white rounded-[36px] p-8 sm:p-14 max-w-xl w-full border border-[#EDE7D9] shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#EF7C3C] flex items-center justify-center mx-auto shadow-xs">
            <HeartCrack className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#EF7C3C]">
              404 — PAGE NOT FOUND
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#16241B] tracking-tight">
              Lost in the Pet Park?
            </h1>
            <p className="text-sm sm:text-base text-[#556658] font-medium leading-relaxed max-w-md mx-auto">
              We couldn't find the page you're looking for. It might have been moved or doesn't exist anymore.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/">
              <Button variant="primary" size="lg" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;
