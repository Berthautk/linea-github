import React from 'react';
import {
  AlertCircle,
  Bike,
  GraduationCap,
  HeartHandshake,
  Home,
  Percent,
  PiggyBank,
  Pill,
  Receipt,
  Shapes,
  Sparkles,
  Users,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';

export interface RubricConfig {
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  color: string;
  bgLight: string;
  bgDark: string;
}

export const RUBRIC_CONFIGS: Record<string, RubricConfig> = {
  Revenus: {
    name: 'Revenus',
    icon: Wallet,
    color: '#12A150',
    bgLight: '#E6F8EE',
    bgDark: '#0E3E28',
  },
  Logement: {
    name: 'Logement',
    icon: Home,
    color: '#2563EB',
    bgLight: '#EFF6FF',
    bgDark: '#1E293B',
  },
  Enfants: {
    name: 'Enfants',
    icon: GraduationCap,
    color: '#7C3AED',
    bgLight: '#F3E8FF',
    bgDark: '#2E1065',
  },
  Maison: {
    name: 'Maison',
    icon: Sparkles,
    color: '#0D9488',
    bgLight: '#CCFBF1',
    bgDark: '#134E4A',
  },
  'Soutien famille': {
    name: 'Soutien famille',
    icon: HeartHandshake,
    color: '#E11D48',
    bgLight: '#FFE4E6',
    bgDark: '#4C0519',
  },
  Santé: {
    name: 'Santé',
    icon: Pill,
    color: '#DC2626',
    bgLight: '#FEE2E2',
    bgDark: '#450A0A',
  },
  Transport: {
    name: 'Transport',
    icon: Bike,
    color: '#D97706',
    bgLight: '#FEF3C7',
    bgDark: '#451A03',
  },
  Repas: {
    name: 'Repas',
    icon: UtensilsCrossed,
    color: '#EA580C',
    bgLight: '#FFEDD5',
    bgDark: '#431407',
  },
  Dettes: {
    name: 'Dettes',
    icon: Receipt,
    color: '#4F46E5',
    bgLight: '#EEF2FF',
    bgDark: '#1E1B4B',
  },
  Frais: {
    name: 'Frais',
    icon: Percent,
    color: '#64748B',
    bgLight: '#F1F5F9',
    bgDark: '#1E293B',
  },
  Provisions: {
    name: 'Provisions',
    icon: PiggyBank,
    color: '#059669',
    bgLight: '#ECFDF5',
    bgDark: '#064E3B',
  },
  Tontine: {
    name: 'Tontine',
    icon: Users,
    color: '#6366F1',
    bgLight: '#EEF2FF',
    bgDark: '#1E1B4B',
  },
  Autres: {
    name: 'Autres',
    icon: Shapes,
    color: '#475569',
    bgLight: '#F1F5F9',
    bgDark: '#1E293B',
  },
};

export const DEFAULT_RUBRIC_CONFIG: RubricConfig = {
  name: 'Hors plan',
  icon: AlertCircle,
  color: '#B45309',
  bgLight: '#FEF3C7',
  bgDark: '#451A03',
};

export function getRubricConfig(groupName?: string): RubricConfig {
  if (!groupName) return DEFAULT_RUBRIC_CONFIG;
  return RUBRIC_CONFIGS[groupName] || DEFAULT_RUBRIC_CONFIG;
}

export const RubricIconBadge: React.FC<{
  groupName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ groupName, size = 'md', className = '' }) => {
  const config = getRubricConfig(groupName);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg text-xs',
    md: 'w-10 h-10 rounded-xl text-sm',
    lg: 'w-12 h-12 rounded-2xl text-base',
  }[size];

  const iconSize = size === 'sm' ? 14 : size === 'md' ? 18 : 22;

  return (
    <div
      className={`shrink-0 flex items-center justify-center font-bold transition-transform ${sizeClasses} ${className}`}
      style={{
        backgroundColor: config.bgLight,
        color: config.color,
      }}
      title={config.name}
    >
      <IconComponent size={iconSize} />
    </div>
  );
};
