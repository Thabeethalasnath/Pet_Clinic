import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface EmptyStateAction {
  label: string;
  link?: string;
  onAction?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLink?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionLink?: string;
  actions?: EmptyStateAction[];
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionLink,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionLink,
  actions,
  className = '',
  children,
}) => {
  // Consolidate single/secondary props into unified action list if actions prop not directly passed
  const resolvedActions: EmptyStateAction[] = actions || [
    ...(actionLabel
      ? [
          {
            label: actionLabel,
            link: actionLink,
            onAction,
            variant: 'primary' as const,
          },
        ]
      : []),
    ...(secondaryActionLabel
      ? [
          {
            label: secondaryActionLabel,
            link: secondaryActionLink,
            onAction: onSecondaryAction,
            variant: 'outline' as const,
          },
        ]
      : []),
  ];

  return (
    <div
      className={`bg-[#FAF6EE] rounded-3xl p-6 sm:p-8 text-center border border-[#EAE3D2] flex flex-col items-center justify-center space-y-3.5 max-w-lg mx-auto ${className}`}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-white border border-[#E5DFCE] flex items-center justify-center text-[#009E66] shadow-xs">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="text-lg sm:text-xl font-bold text-[#16241B]">{title}</h3>
        <p className="text-xs sm:text-sm text-[#556658] font-normal leading-relaxed max-w-md">
          {description}
        </p>
      </div>

      {resolvedActions.length > 0 && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {resolvedActions.map((act, idx) => {
            const isPrimary = act.variant === 'primary' || (!act.variant && idx === 0);
            const buttonClasses = isPrimary
              ? 'inline-flex items-center justify-center font-bold rounded-full transition-all duration-300 cursor-pointer text-xs sm:text-sm px-5 py-2.5 bg-[#009E66] hover:bg-[#16241B] text-white border border-[#009E66] hover:border-[#16241B] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95'
              : 'inline-flex items-center justify-center font-bold rounded-full transition-all duration-300 cursor-pointer text-xs sm:text-sm px-5 py-2.5 bg-white hover:bg-[#009E66] text-[#009E66] hover:text-white border border-[#009E66] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95';

            if (act.link) {
              return (
                <Link key={idx} to={act.link} className={buttonClasses}>
                  {act.label}
                </Link>
              );
            }

            if (act.onAction) {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={act.onAction}
                  className={buttonClasses}
                >
                  {act.label}
                </button>
              );
            }

            return null;
          })}
        </div>
      )}

      {children}
    </div>
  );
};

export default EmptyState;

