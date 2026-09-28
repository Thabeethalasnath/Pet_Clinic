import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'mint' | 'yellow' | 'pink' | 'blue' | 'purple' | 'orange';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const variantStyles = {
    neutral: 'bg-white/80 border border-[#E5E0D2] text-[#334437]',
    mint: 'bg-[#E3F6E9] text-[#009E66]',
    yellow: 'bg-[#FFF6D6] text-[#8C6D00]',
    pink: 'bg-[#FFE8E8] text-[#D32F2F]',
    blue: 'bg-[#E3F2FD] text-[#1976D2]',
    purple: 'bg-[#F3E5F5] text-[#7B1FA2]',
    orange: 'bg-[#FFF3EB] text-[#EF7C3C]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-xs ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
