import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import {
  Search,
  HelpCircle,
  Calendar,
  ShoppingBag,
  User,
  Pill,
  Sparkles,
  ChevronDown,
  Mail,
  X,
  BookOpen,
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'appointments' | 'orders' | 'profiles' | 'pharmacy' | 'account';
  question: string;
  answer: string;
  tags: string[];
}

const CATEGORIES = [
  {
    id: 'all',
    label: 'All Topics',
    icon: BookOpen,
    description: 'Browse all frequently asked questions',
    color: 'bg-[#009E66] text-white',
  },
  {
    id: 'appointments',
    label: 'Appointments & Booking',
    icon: Calendar,
    description: 'Wellness exams, grooming, behavioral consultations',
    color: 'bg-[#E0F2FE] text-[#0369A1]',
  },
  {
    id: 'orders',
    label: 'Orders & In-Store Pickup',
    icon: ShoppingBag,
    description: 'Reservations, pickup counter hours, payment in person',
    color: 'bg-[#FEF3C7] text-[#B45309]',
  },
  {
    id: 'profiles',
    label: 'Pet Profiles & Wellness',
    icon: Sparkles,
    description: 'Adding pets, health notes, weight tracking',
    color: 'bg-[#DCFCE7] text-[#15803D]',
  },
  {
    id: 'pharmacy',
    label: 'Pharmacy & Stock Alerts',
    icon: Pill,
    description: 'Medications, supplements, restock notifications',
    color: 'bg-[#F3E8FF] text-[#7E22CE]',
  },
  {
    id: 'account',
    label: 'Account & Security',
    icon: User,
    description: 'Login, password resets, notification inbox',
    color: 'bg-[#FFE4E6] text-[#E11D48]',
  },
];

const FAQS: FAQItem[] = [
  // Appointments & Booking
  {
    id: 'apt-1',
    category: 'appointments',
    question: 'How do I book a wellness or grooming appointment?',
    answer:
      'Navigate to the Services tab from the main menu, browse our available care offerings (such as Wellness Exam, Professional Grooming, Pet Training, or Nutrition Consultation), and click "Book Appointment". You can pick a convenient available date and time slot and select which of your registered pets the booking is for.',
    tags: ['booking', 'appointment', 'grooming', 'vet', 'schedule'],
  },
  {
    id: 'apt-2',
    category: 'appointments',
    question: 'How do I reschedule or cancel an existing appointment?',
    answer:
      'Log into your account and open your Profile Dashboard. Under the "My Appointments" tab, find the relevant appointment and click "Reschedule" or "Cancel". Please provide at least 24 hours advance notice whenever possible so we can offer the slot to another pet parent.',
    tags: ['cancel', 'reschedule', 'change appointment', 'time'],
  },
  {
    id: 'apt-3',
    category: 'appointments',
    question: 'What should I bring to my pet\'s in-facility appointment?',
    answer:
      'Please bring your pet safely restrained (on a secure leash for dogs or in a ventilated carrier for cats). If this is your first visit, having any prior vaccination records or medication history handy is very helpful for our care staff.',
    tags: ['first visit', 'vaccination', 'arrival', 'carrier', 'leash'],
  },

  // Orders & In-Store Pickup
  {
    id: 'ord-1',
    category: 'orders',
    question: 'How does in-store pickup work at Pawfectly?',
    answer:
      'Pawfectly operates on a dedicated in-store pickup model. When you add items from Pharmacy or Paw Store to your bag and complete checkout, you are placing a physical product reservation. Our staff gathers and packages your items at our Care Center (104 Wellness Boulevard, Indiranagar, Bengaluru, Karnataka, India). You receive a confirmation code and can collect & pay for your order at the ground-floor pickup counter during business hours.',
    tags: ['in-store pickup', 'how pickup works', 'reservation', 'collect'],
  },
  {
    id: 'ord-2',
    category: 'orders',
    question: 'Do you offer home shipping or delivery?',
    answer:
      'No. To ensure optimal temperature control for pet medications, proper verification of supplies, and personal customer service, all orders are fulfilled strictly via in-store pickup at our physical center.',
    tags: ['shipping', 'delivery', 'home delivery', 'courier'],
  },
  {
    id: 'ord-3',
    category: 'orders',
    question: 'When and how do I pay for my order?',
    answer:
      'Payment is completed in person when you pick up your reserved items at our store counter. We accept major credit/debit cards, cash, and digital mobile wallets at the physical desk. No online credit card charges are made through the website.',
    tags: ['payment', 'online payment', 'credit card', 'in person'],
  },
  {
    id: 'ord-4',
    category: 'orders',
    question: 'How long will my pickup reservation be held?',
    answer:
      'Reserved orders are held safely at our collection desk for 5 business days from the time your order confirmation is generated. If you need extra time to pick up your order, simply email support@pawfectly.com or call our center.',
    tags: ['hold time', 'expiration', 'pickup window', 'duration'],
  },

  // Pet Profiles & Wellness
  {
    id: 'pet-1',
    category: 'profiles',
    question: 'Can I add multiple pets to my account?',
    answer:
      'Yes! You can add dogs, cats, and other companions from the "Pet Profiles" section of your Profile Dashboard. Each pet profile can include their name, breed, date of birth, weight, allergies, and specific medical care notes.',
    tags: ['multiple pets', 'add dog', 'add cat', 'family'],
  },
  {
    id: 'pet-2',
    category: 'profiles',
    question: 'Why should I maintain my pet\'s weight and health notes?',
    answer:
      'Keeping your pet\'s profile updated allows our clinic staff to provide accurate dosage recommendations during visits and helps our "Fur & Facts" section recommend health articles and nutritional tips tailored specifically to your pet\'s species and age.',
    tags: ['weight', 'profile benefits', 'health notes', 'articles'],
  },

  // Pharmacy & Stock Alerts
  {
    id: 'phm-1',
    category: 'pharmacy',
    question: 'How do Out of Stock "Notify Me" restock alerts work?',
    answer:
      'If an item in the Pharmacy or Paw Store is temporarily out of stock, click the "Notify Me When Available" button on the product card. When our inventory team restocks the item, an instant notification alert will be dispatched to your account notification center and email.',
    tags: ['notify me', 'out of stock', 'restock', 'alert', 'availability'],
  },
  {
    id: 'phm-2',
    category: 'pharmacy',
    question: 'How do I search products by specific health concerns?',
    answer:
      'On the Pharmacy page, scroll to the "Addressing Your Pet\'s Health Concerns" section. You can click on specialized concern cards like Skin Care, Digestive Care, Eyes & Ear Care, Joint Care, or Cardiac Care to view pharmacy products filtered specifically for that condition.',
    tags: ['health concern', 'joint care', 'skin care', 'filter', 'digestive'],
  },
  {
    id: 'phm-3',
    category: 'pharmacy',
    question: 'Are medications sourced from certified veterinary distributors?',
    answer:
      'Yes, 100% of our pharmaceuticals, preventative flea/tick treatments, and prescription diets are sourced directly from verified veterinary manufacturers and stored under controlled conditions at our facility.',
    tags: ['authentic', 'safety', 'pharmacy quality', 'medications'],
  },

  // Account & Security
  {
    id: 'acc-1',
    category: 'account',
    question: 'How do I access my notification center?',
    answer:
      'When logged into your account, click the bell icon in the top navigation bar. You can view all alerts regarding appointment reminders, restocked wishlist items, and newsletter updates.',
    tags: ['notifications', 'bell', 'inbox', 'alerts'],
  },
  {
    id: 'acc-2',
    category: 'account',
    question: 'How do I update my email address or password?',
    answer:
      'Go to your Profile Dashboard and navigate to the Account Settings tab. Here you can update your contact phone number, name, and security preferences.',
    tags: ['password', 'settings', 'email', 'profile'],
  },
];

export const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({
    'ord-1': true,
    'apt-1': true,
  });

  const toggleFaq = (id: string) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return FAQS.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'all' || faq.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;

      const matchesQuestion = faq.question.toLowerCase().includes(q);
      const matchesAnswer = faq.answer.toLowerCase().includes(q);
      const matchesTags = faq.tags.some((t) => t.toLowerCase().includes(q));

      return matchesQuestion || matchesAnswer || matchesTags;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F2] text-[#16241B]">
      <Navbar />

      <main className="flex-1 pb-14">
        {/* Knowledge Base Search Hero */}
        <section className="bg-gradient-to-b from-[#1F4B43] to-[#16241B] text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-[#23382A]">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              How Can We <span className="text-[#EF7C3C]">Help You Today?</span>
            </h1>
            <p className="text-sm sm:text-base text-[#CBDAC6] max-w-xl mx-auto">
              Search questions about appointment bookings, in-store pickup orders, pet wellness profiles, and pharmacy items.
            </p>

            {/* Live Search Bar */}
            <div className="relative max-w-2xl mx-auto pt-1">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-[#009E66] absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by keyword (e.g. pickup, appointment, restock, payment)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white text-[#16241B] text-sm sm:text-base placeholder-[#5E6E62] border-2 border-transparent focus:border-[#EF7C3C] focus:outline-hidden shadow-lg transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 text-[#5E6E62] hover:text-[#16241B] p-1 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
          {/* Category Tiles Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-[#1F4B43]">
                Explore By Category
              </h2>
              {searchQuery && (
                <span className="text-xs font-medium text-[#5E6E62]">
                  Filtering with search query: "{searchQuery}"
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-colors duration-200 flex flex-col justify-between group cursor-pointer h-full min-h-[104px] ${
                      isSelected
                        ? 'bg-[#009E66] text-white border-[#009E66] shadow-xs'
                        : 'bg-white text-[#16241B] border-[#CBDAC6]/60 hover:border-[#009E66] hover:shadow-xs'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                        isSelected
                          ? 'bg-white/15 text-[#EF7C3C]'
                          : 'bg-[#F6F7F2] text-[#1F4B43] group-hover:bg-[#1F4B43]/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p
                        className={`text-xs sm:text-sm font-bold leading-tight ${
                          isSelected ? 'text-white' : 'text-[#1F4B43]'
                        }`}
                      >
                        {cat.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-[#CBDAC6]/60">
            <p className="text-xs sm:text-sm text-[#445548] font-medium">
              Showing <span className="font-bold text-[#009E66]">{filteredFaqs.length}</span> {filteredFaqs.length === 1 ? 'answer' : 'answers'}
              {selectedCategory !== 'all' && (
                <> in <span className="font-semibold text-[#009E66]">{CATEGORIES.find(c => c.id === selectedCategory)?.label}</span></>
              )}
            </p>

            {(selectedCategory !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-[#EF7C3C] hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* FAQ Accordion List */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-3.5 w-full">
              {filteredFaqs.map((faq) => {
                const isOpen = !!openFaqs[faq.id];
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-[#CBDAC6]/60 shadow-2xs hover:border-[#CBDAC6] transition-all duration-200 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer focus:outline-hidden"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <HelpCircle className={`w-5 h-5 shrink-0 mt-0.5 transition-colors ${isOpen ? 'text-[#EF7C3C]' : 'text-[#009E66]'}`} />
                        <h3 className="text-sm sm:text-base font-bold text-[#009E66] leading-snug">
                          {faq.question}
                        </h3>
                      </div>
                      <div
                        className={`w-7 h-7 rounded-full bg-[#F6F7F2] border border-[#CBDAC6]/60 flex items-center justify-center shrink-0 transition-all duration-200 ${
                          isOpen ? 'rotate-180 bg-[#009E66] text-white border-transparent' : 'text-[#009E66]'
                        }`}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 text-xs sm:text-sm text-[#445548] leading-relaxed pl-11 sm:pl-12">
                        <p>{faq.answer}</p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-3">
                          {faq.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[#F6F7F2] border border-[#CBDAC6]/60 text-[10px] font-semibold text-[#5E6E62]"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-4 max-w-md mx-auto bg-white rounded-2xl border border-[#CBDAC6]/60 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF6EE] text-[#EF7C3C] flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#009E66]">
                No matching answers found
              </h3>
              <p className="text-xs text-[#5E6E62]">
                We couldn't find any FAQs matching "{searchQuery}". Try a different keyword or contact our support team directly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 rounded-xl bg-[#009E66] text-white text-xs font-bold hover:bg-[#008756] transition-colors cursor-pointer shadow-sm"
              >
                Clear Search Query
              </button>
            </div>
          )}

          {/* Bottom Still Need Help Banner */}
          <div className="w-full rounded-2xl bg-gradient-to-r from-[#1F4B43] to-[#16241B] p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-extrabold">
                Still have unanswered questions?
              </h3>
              <p className="text-xs sm:text-sm text-[#CBDAC6] max-w-md">
                Our care desk is standing by to help with special order requests, pet care questions, or booking assistance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/contact-support"
                className="px-5 py-3 rounded-xl bg-[#009E66] hover:bg-[#008757] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Mail className="w-4 h-4 text-[#EF7C3C]" />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
