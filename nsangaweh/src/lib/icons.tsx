import React from 'react';
import {
  Baby,
  Banknote,
  Bike,
  BookOpen,
  Briefcase,
  Building2,
  Bus,
  Car,
  Church,
  Coffee,
  CreditCard,
  Droplets,
  Flame,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  HeartPulse,
  House,
  Landmark,
  PartyPopper,
  Percent,
  Phone,
  PiggyBank,
  Pill,
  Plane,
  Receipt,
  School,
  Scissors,
  Shapes,
  Shirt,
  ShoppingBasket,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Sprout,
  Stethoscope,
  Users,
  UtensilsCrossed,
  Wallet,
  Wifi,
  Wrench,
  Zap,
} from 'lucide-react';
import { IconName } from './catalog';

type IconComponent = React.ComponentType<{ size?: number | string; className?: string }>;

export const ICONS: Record<IconName, IconComponent> = {
  House,
  Building2,
  Zap,
  Droplets,
  Flame,
  ShoppingCart,
  ShoppingBasket,
  UtensilsCrossed,
  Coffee,
  Bike,
  Car,
  Bus,
  Fuel,
  GraduationCap,
  School,
  BookOpen,
  Baby,
  HeartPulse,
  Pill,
  Stethoscope,
  HeartHandshake,
  Users,
  Phone,
  Smartphone,
  Wifi,
  PiggyBank,
  Landmark,
  Receipt,
  CreditCard,
  Wallet,
  Banknote,
  HandCoins,
  Church,
  Gift,
  PartyPopper,
  Gamepad2,
  Shirt,
  Scissors,
  Wrench,
  Plane,
  Sprout,
  Briefcase,
  Sparkles,
  Percent,
  Shapes,
};

export function iconFor(name?: string): IconComponent {
  return (name && ICONS[name as IconName]) || Shapes;
}

/** Neutral look for entries without a rubric. */
export const NO_RUBRIC_STYLE = { icon: 'Shapes', color: '#64748B' };

export const RubricBadge: React.FC<{
  icon?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}> = ({ icon, color = NO_RUBRIC_STYLE.color, size = 'md', className = '', title }) => {
  const Icon = iconFor(icon);
  const box = { sm: 'w-7 h-7 rounded-lg', md: 'w-10 h-10 rounded-xl', lg: 'w-12 h-12 rounded-2xl' }[size];
  const px = size === 'sm' ? 14 : size === 'md' ? 18 : 22;
  return (
    <div
      className={`shrink-0 flex items-center justify-center ${box} ${className}`}
      style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
      title={title}
      aria-hidden={title ? undefined : true}
    >
      <Icon size={px} />
    </div>
  );
};
