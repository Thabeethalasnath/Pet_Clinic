import {
  Pill,
  Utensils,
  Scissors,
  ShieldCheck,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react';
import type { ProductItemData } from '../components/products/ProductCard';

export interface PharmacyCategoryMeta {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  imageUrl: string;
  color: {
    bg: string;
    text: string;
    border: string;
    accent: string;
    badgeBg: string;
    iconBg: string;
    iconText: string;
  };
}

export const PHARMACY_CATEGORIES: PharmacyCategoryMeta[] = [
  {
    name: 'Medications',
    slug: 'medications',
    tagline: 'Essential prescription & daily treatments',
    description:
      'Certified veterinary medicines, ear & eye drops, antibiotics, and clinical treatments verified by licensed veterinarians.',
    icon: Pill,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=85',
    color: {
      bg: 'bg-[#E6F9EC]',
      text: 'text-[#009E66]',
      border: 'border-[#CBDAC6]',
      accent: '#009E66',
      badgeBg: 'bg-[#009E66]/10 text-[#009E66]',
      iconBg: 'bg-[#E6F9EC]',
      iconText: 'text-[#009E66]',
    },
  },
  {
    name: 'Food & Nutrition',
    slug: 'food-and-nutrition',
    tagline: 'Vet-approved therapeutic & wellness diets',
    description:
      'Specialized veterinary diets, hypoallergenic foods, and nutrient-rich formulas tailored for digestive and renal health.',
    icon: Utensils,
    imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=85',
    color: {
      bg: 'bg-[#FEF9C3]',
      text: 'text-[#B45309]',
      border: 'border-[#FDE047]',
      accent: '#EF7C3C',
      badgeBg: 'bg-[#EF7C3C]/10 text-[#B45309]',
      iconBg: 'bg-[#FEF9C3]',
      iconText: 'text-[#B45309]',
    },
  },
  {
    name: 'Grooming & Hygiene',
    slug: 'grooming-and-hygiene',
    tagline: 'Clinical washes, ear cleansers & dental care',
    description:
      'Therapeutic shampoos, skin-soothing balms, ear cleansers, and enzymatic toothpastes for clean, comfortable pets.',
    icon: Scissors,
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&auto=format&fit=crop&q=85',
    color: {
      bg: 'bg-[#FFE4E6]',
      text: 'text-[#E11D48]',
      border: 'border-[#FECDD3]',
      accent: '#EF7C3C',
      badgeBg: 'bg-[#EF7C3C]/10 text-[#E11D48]',
      iconBg: 'bg-[#FFE4E6]',
      iconText: 'text-[#E11D48]',
    },
  },
  {
    name: 'Supplements & Care',
    slug: 'supplements-and-care',
    tagline: 'Joint, immunity, skin & digestive wellness',
    description:
      'Nutritious multivitamins, hip & joint formulas, omega oils, and probiotics to preserve your pet’s natural health and longevity.',
    icon: HeartPulse,
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=85',
    color: {
      bg: 'bg-[#F3E8FF]',
      text: 'text-[#7E22CE]',
      border: 'border-[#E9D5FF]',
      accent: '#7E22CE',
      badgeBg: 'bg-[#7E22CE]/10 text-[#7E22CE]',
      iconBg: 'bg-[#F3E8FF]',
      iconText: 'text-[#7E22CE]',
    },
  },
  {
    name: 'Flea & Tick',
    slug: 'flea-and-tick',
    tagline: 'Effective solutions for a flea-free life',
    description:
      'Vet-formulated sprays, spot-on treatments, and collars to keep your furry friends completely safe from parasites year-round.',
    icon: ShieldCheck,
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=85',
    color: {
      bg: 'bg-[#E0F2FE]',
      text: 'text-[#0284C7]',
      border: 'border-[#BAE6FD]',
      accent: '#0284C7',
      badgeBg: 'bg-[#0284C7]/10 text-[#0284C7]',
      iconBg: 'bg-[#E0F2FE]',
      iconText: 'text-[#0284C7]',
    },
  },
];

export interface HealthConcernItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  keywords: string[];
  targetCategorySlug: string;
  imageUrl: string;
}

export const HEALTH_CONCERNS: HealthConcernItem[] = [
  {
    id: 'skin-care',
    slug: 'skin-care',
    title: 'Skin Care',
    tagline: "Effective Solutions for Your Pet's Skin Health and Comfort.",
    keywords: ['skin', 'dermatitis', 'shampoo', 'allergy', 'itch', 'coat', 'derma'],
    targetCategorySlug: 'grooming-and-hygiene',
    imageUrl: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'digestive-care',
    slug: 'digestive-care',
    title: 'Digestive Care',
    tagline: "Support Your Pet's Digestive Health with Tailored Solutions.",
    keywords: ['digestive', 'stomach', 'probiotic', 'diarrhea', 'gut', 'digest', 'gastric'],
    targetCategorySlug: 'food-and-nutrition',
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'eyes-ear-care',
    slug: 'eyes-ear-care',
    title: 'Eyes & Ear Care',
    tagline: "Enhance Your Pet's Vision with Specialized Eye Care Products.",
    keywords: ['eye', 'ear', 'vision', 'tear', 'otitis', 'optic', 'otic', 'drop', 'cleanser'],
    targetCategorySlug: 'medications',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'joint-care',
    slug: 'joint-care',
    title: 'Joint Care',
    tagline: 'Promote Mobility and Comfort with Quality Joint Support.',
    keywords: ['joint', 'mobility', 'arthritis', 'glucosamine', 'hip', 'bone'],
    targetCategorySlug: 'supplements-and-care',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cardiac-care',
    slug: 'cardiac-care',
    title: 'Cardiac Care',
    tagline: 'Maintain a Healthy Heart for Your Beloved Companion.',
    keywords: ['cardiac', 'heart', 'cardio', 'circulation'],
    targetCategorySlug: 'supplements-and-care',
    imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'kidney-care',
    slug: 'kidney-care',
    title: 'Kidney Care',
    tagline: 'Protect Kidney Function with Targeted Nutritional Support.',
    keywords: ['kidney', 'renal', 'urinary', 'bladder', 'nephro'],
    targetCategorySlug: 'food-and-nutrition',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'liver-care',
    slug: 'liver-care',
    title: 'Liver Care',
    tagline: 'Support Liver Health for a Happier, Healthier Pet.',
    keywords: ['liver', 'hepatic', 'detox', 'milk thistle', 'hepato'],
    targetCategorySlug: 'supplements-and-care',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'respiratory-care',
    slug: 'respiratory-care',
    title: 'Respiratory Care',
    tagline: 'Ensure Clear Breathing and Lung Health for Your Pet.',
    keywords: ['respiratory', 'cough', 'breathing', 'lung', 'breath', 'airway'],
    targetCategorySlug: 'medications',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80',
  },
];

export const resolveCategoryFromSlug = (slug?: string): PharmacyCategoryMeta | undefined => {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  return PHARMACY_CATEGORIES.find(
    (c) =>
      c.slug === clean ||
      c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clean ||
      c.name.toLowerCase() === clean
  );
};

export const resolveConcernFromSlug = (slug?: string): HealthConcernItem | undefined => {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  return HEALTH_CONCERNS.find(
    (c) =>
      c.id === clean ||
      c.slug === clean ||
      c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clean ||
      c.title.toLowerCase() === clean
  );
};

export const matchesPharmacyCategory = (p: ProductItemData, categoryNameOrSlug: string): boolean => {
  if (!categoryNameOrSlug || categoryNameOrSlug === 'All') return true;

  const resolved = resolveCategoryFromSlug(categoryNameOrSlug);
  const targetName = resolved ? resolved.name.toLowerCase() : categoryNameOrSlug.toLowerCase();

  const prodCat = (p.category || '').toLowerCase();
  const prodName = (p.name || '').toLowerCase();
  const prodDesc = (p.description || '').toLowerCase();

  if (targetName.includes('flea') || targetName.includes('tick')) {
    return (
      prodCat.includes('flea') ||
      prodCat.includes('tick') ||
      prodName.includes('flea') ||
      prodName.includes('tick') ||
      prodCat.includes('parasite') ||
      prodDesc.includes('flea') ||
      prodDesc.includes('tick')
    );
  }

  if (targetName.includes('medication')) {
    return (
      prodCat.includes('medicat') ||
      prodCat.includes('prescript') ||
      prodCat.includes('antibiotic') ||
      prodCat.includes('rx') ||
      prodCat.includes('health') ||
      prodCat.includes('tablet') ||
      prodCat.includes('syrup') ||
      prodCat.includes('pharma') ||
      prodName.includes('drop') ||
      prodName.includes('tablet')
    );
  }

  if (targetName.includes('supplement') || targetName.includes('care')) {
    return (
      prodCat.includes('supplement') ||
      prodCat.includes('vitamin') ||
      prodCat.includes('immunity') ||
      prodCat.includes('joint') ||
      prodCat.includes('care') ||
      prodName.includes('supplement') ||
      prodName.includes('vitamin') ||
      prodDesc.includes('supplement')
    );
  }

  if (targetName.includes('food') || targetName.includes('nutrition')) {
    return (
      prodCat.includes('food') ||
      prodCat.includes('nutrition') ||
      prodCat.includes('diet') ||
      prodCat.includes('treat') ||
      prodName.includes('food') ||
      prodName.includes('kibble') ||
      prodDesc.includes('diet')
    );
  }

  if (targetName.includes('grooming') || targetName.includes('hygiene')) {
    return (
      prodCat.includes('groom') ||
      prodCat.includes('hygiene') ||
      prodCat.includes('shampoo') ||
      prodCat.includes('bath') ||
      prodCat.includes('wash') ||
      prodCat.includes('dental') ||
      prodName.includes('shampoo') ||
      prodName.includes('brush')
    );
  }

  return prodCat.includes(targetName) || prodName.includes(targetName);
};

export const matchesHealthConcern = (p: ProductItemData, concernIdOrSlug: string): boolean => {
  const concern = resolveConcernFromSlug(concernIdOrSlug);
  if (!concern) return true;

  const prodCat = (p.category || '').toLowerCase();
  const prodName = (p.name || '').toLowerCase();
  const prodDesc = (p.description || '').toLowerCase();
  const fullText = `${prodCat} ${prodName} ${prodDesc}`;

  return concern.keywords.some((k) => fullText.includes(k.toLowerCase()));
};
