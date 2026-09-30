import React from 'react';
import {
  BookOpen,
  Home,
  LayoutGrid,
  Plus,
  Users,
} from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';

export type NavTab = 'accueil' | 'journal' | 'famille' | 'plus';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickAdd,
}) => {
  const handleTabClick = (tab: NavTab) => {
    triggerHaptic('light');
    onTabChange(tab);
  };

  const handleFabClick = () => {
    triggerHaptic('medium');
    onOpenQuickAdd();
  };

  const leftTabs: Array<{
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }> = [
    { id: 'accueil', label: 'Accueil', icon: Home },
    { id: 'journal', label: 'Journal', icon: BookOpen },
  ];

  const rightTabs: Array<{
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }> = [
    { id: 'famille', label: 'Famille', icon: Users },
    { id: 'plus', label: 'Plus', icon: LayoutGrid },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-lg border-t border-[var(--color-border)] px-4 pt-1.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] transition-colors"
      aria-label="Navigation principale"
    >
      <div className="max-w-[480px] mx-auto flex items-center justify-between relative">
        {/* Left two tabs */}
        <div className="flex items-center flex-1 justify-around pr-7">
          {leftTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-[var(--color-primary)] font-bold'
                    : 'text-[var(--color-text-muted)] font-medium hover:text-[var(--color-text)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-[var(--color-primary-light)] scale-105' : ''
                  }`}
                >
                  <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                </div>
                <span className="text-[11px] mt-0.5 leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Center Floating Plus Button */}
        <div className="absolute left-1/2 -top-5 -translate-x-1/2">
          <button
            type="button"
            onClick={handleFabClick}
            className="w-13 h-13 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-[var(--shadow-fab)] hover:scale-105 active:scale-95 transition-all transform cursor-pointer border-4 border-[var(--color-surface)]"
            aria-label="Ajouter une opération"
          >
            <Plus size={26} className="stroke-[2.5px]" />
          </button>
        </div>

        {/* Right two tabs */}
        <div className="flex items-center flex-1 justify-around pl-7">
          {rightTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-[var(--color-primary)] font-bold'
                    : 'text-[var(--color-text-muted)] font-medium hover:text-[var(--color-text)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-[var(--color-primary-light)] scale-105' : ''
                  }`}
                >
                  <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                </div>
                <span className="text-[11px] mt-0.5 leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
