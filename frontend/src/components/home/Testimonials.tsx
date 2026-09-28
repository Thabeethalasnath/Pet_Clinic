import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Reveal } from '../motion/Reveal';
import { HoverCard } from '../motion/HoverCard';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface TestimonialItem {
  id: number;
  name: string;
  pet: string;
  quote: string;
  rating: number;
  avatarBg: string;
  avatarColor: string;
  tag?: string;
}

const testimonials: TestimonialItem[] = [
  {
    id: 1,
    name: 'Priya S.',
    pet: 'Parent of Leo (Golden Retriever)',
    quote: "My dog's vet visit was so smooth, I didn't even need to leave the waiting room app! The vet was caring and attentive.",
    rating: 5,
    avatarBg: 'bg-[#FDE8D7]',
    avatarColor: 'text-[#D96B27]',
    tag: 'Vet Care',
  },
  {
    id: 2,
    name: 'Rahul M.',
    pet: 'Parent of Bella (Persian Cat)',
    quote: 'Finding a specialized feline clinician was effortless. The in-app medical records and prescription refills saved us so much time.',
    rating: 5,
    avatarBg: 'bg-[#D8F3DC]',
    avatarColor: 'text-[#009E66]',
    tag: 'Clinic Booking',
  },
  {
    id: 3,
    name: 'Ananya K.',
    pet: 'Parent of Bruno & Milo (Beagles)',
    quote: 'The curated nutrition and grooming products arrived right on time. Pawfectly is our trusted one-stop shop for everything pet care.',
    rating: 5,
    avatarBg: 'bg-[#FEF3C7]',
    avatarColor: 'text-[#8C6D00]',
    tag: 'Pet Store',
  },
  {
    id: 4,
    name: 'David L.',
    pet: 'Parent of Coco (Shih Tzu)',
    quote: '24/7 verified vet support gave me absolute peace of mind during a late-night emergency. Truly a lifesaver for pet parents!',
    rating: 5,
    avatarBg: 'bg-[#E0F2FE]',
    avatarColor: 'text-[#0369A1]',
    tag: '24/7 Support',
  },
];

export const Testimonials: React.FC = () => {
  const prefersReduced = usePrefersReducedMotion();

  const renderCard = (item: TestimonialItem, isClone = false) => {
    const initials = item.name
      .split(' ')
      .map((n) => n[0])
      .join('');

    return (
      <HoverCard
        key={isClone ? `clone-${item.id}` : item.id}
        aria-hidden={isClone}
        className="w-[300px] sm:w-[340px] shrink-0 bg-white rounded-3xl p-5 sm:p-6 border border-[#ECE5D8] flex flex-col justify-between"
      >
        <div className="space-y-4">
          {/* Top Row: Avatar + Details & Rating */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-full ${item.avatarBg} ${item.avatarColor} border border-[#ECE5D8] flex items-center justify-center font-black text-sm shrink-0 shadow-xs`}
                aria-hidden="true"
              >
                {initials}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#16241B] group-hover:text-[#EF7C3C] transition-colors leading-snug">
                  {item.name}
                </h3>
                <p className="text-[11px] font-medium text-[#7A8B7E] leading-snug line-clamp-1">
                  {item.pet}
                </p>
              </div>
            </div>
            <Quote className="w-5 h-5 text-[#E0D7C6] shrink-0" aria-hidden="true" />
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-1" aria-label={`${item.rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < item.rating
                    ? 'fill-[#F5A623] text-[#F5A623]'
                    : 'fill-transparent text-[#D4CBB8]'
                }`}
              />
            ))}
          </div>

          {/* Quote Text */}
          <p className="text-xs sm:text-sm text-[#445548] leading-relaxed italic font-medium">
            "{item.quote}"
          </p>
        </div>

        {/* Tag Footer */}
        {item.tag && (
          <div className="pt-4 mt-4 border-t border-[#F3EDE2] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8C9B8F] uppercase tracking-wider">
              {item.tag}
            </span>
            <span className="text-[11px] font-semibold text-[#287A41] flex items-center gap-1">
              Verified Parent ✓
            </span>
          </div>
        )}
      </HoverCard>
    );
  };

  return (
    <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 overflow-hidden">
      {/* Section Header */}
      <Reveal delay={0.05} className="space-y-3.5 text-left">
        <Badge variant="orange" className="inline-flex">
          TESTIMONIALS
        </Badge>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#16241B] tracking-tight leading-[1.08]">
          Loved By Pets. <span className="text-[#EF7C3C]">Trusted</span> By Parents.
        </h2>
        <p className="text-sm sm:text-base text-[#445548] max-w-2xl">
          Real stories from pet parents who found the right care, nutrition, and peace of mind with Pawfectly.
        </p>
      </Reveal>

                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-[#445548] leading-relaxed italic font-medium">
                  "{item.quote}"
                </p>
              </div>

              {/* Tag Footer */}
              {item.tag && (
                <div className="pt-4 mt-4 border-t border-[#F3EDE2] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#8C9B8F] uppercase tracking-wider">
                    {item.tag}
                  </span>
                  <span className="text-[11px] font-semibold text-[#009E66] flex items-center gap-1">
                    Verified Parent ✓
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
