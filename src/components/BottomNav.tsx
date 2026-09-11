'use client';

import React from 'react';
import { Home, Compass, Users, HeartHandshake, Image as ImageIcon } from 'lucide-react';

export type NavTab = 'home' | '360' | 'crowd' | 'donate' | 'gallery';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Pandals', icon: Home },
    { id: '360' as NavTab, label: '360° View', icon: Compass },
    { id: 'crowd' as NavTab, label: 'Live Crowd', icon: Users },
    { id: 'donate' as NavTab, label: 'Direct UPI', icon: HeartHandshake },
    { id: 'gallery' as NavTab, label: 'Gallery', icon: ImageIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-ganesha-gold/20 px-2 py-1.5 sm:hidden shadow-2xl">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-ganesha-gold bg-ganesha-gold/15 font-bold scale-105'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-ganesha-gold' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
