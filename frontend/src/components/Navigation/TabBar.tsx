import React from 'react';
import { Camera, Layers, SpellCheck, MessageCircle, Trophy, Medal, Calculator, GraduationCap, Keyboard } from 'lucide-react';

export type TabMode = 'practice' | 'flashcards' | 'quiz' | 'numbers_game' | 'spelling' | 'roleplay' | 'reply_mode' | 'tutorials' | 'leaderboard' | 'achievements';

interface TabBarProps {
  activeTab: TabMode;
  onTabChange: (tab: TabMode) => void;
}

interface TabDef {
  id: TabMode;
  label: string;
  shortLabel: string;    // shown on small screens
  icon: React.ReactNode;
  activeClass: string;
  hoverClass: string;
}

const TABS: TabDef[] = [
  {
    id: 'practice',
    label: 'Live Practice',
    shortLabel: 'Practice',
    icon: <Camera className="w-4 h-4" />,
    activeClass: 'bg-gradient-to-r from-teal-400 to-emerald-400 text-white shadow-md',
    hoverClass: 'hover:bg-white hover:text-teal-600',
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    shortLabel: 'Cards',
    icon: <Layers className="w-4 h-4" />,
    activeClass: 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-md',
    hoverClass: 'hover:bg-white hover:text-rose-500',
  },
  {
    id: 'quiz',
    label: 'Duolingo Mode',
    shortLabel: 'Quiz',
    icon: <span className="text-base leading-none">🦉</span>,
    activeClass: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md',
    hoverClass: 'hover:bg-white hover:text-violet-500',
  },
  {
    id: 'numbers_game',
    label: 'Numbers Game',
    shortLabel: 'Numbers',
    icon: <Calculator className="w-4 h-4" />,
    activeClass: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md',
    hoverClass: 'hover:bg-white hover:text-cyan-500',
  },
  {
    id: 'spelling',
    label: 'Spelling Bee',
    shortLabel: 'Spelling',
    icon: <SpellCheck className="w-4 h-4" />,
    activeClass: 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-md',
    hoverClass: 'hover:bg-white hover:text-pink-500',
  },
  {
    id: 'roleplay',
    label: 'Roleplay',
    shortLabel: 'Chat',
    icon: <MessageCircle className="w-4 h-4" />,
    activeClass: 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-md',
    hoverClass: 'hover:bg-white hover:text-blue-500',
  },
  {
    id: 'tutorials',
    label: 'Tutorials',
    shortLabel: 'Learn',
    icon: <GraduationCap className="w-4 h-4" />,
    activeClass: 'bg-gradient-to-r from-lime-400 to-emerald-500 text-white shadow-md',
    hoverClass: 'hover:bg-white hover:text-lime-600',
  },
  {
    id: 'reply_mode',
    label: 'Reply Mode',
    shortLabel: 'Reply',
    icon: <Keyboard className="w-4 h-4" />,
    activeClass: 'bg-gradient-to-r from-sky-400 to-indigo-400 text-white shadow-md',
    hoverClass: 'hover:bg-white hover:text-sky-500',
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    shortLabel: 'Ranks',
    icon: <Trophy className="w-4 h-4" />,
    activeClass: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md',
    hoverClass: 'hover:bg-white hover:text-amber-500',
  },
  {
    id: 'achievements',
    label: 'Badges',
    shortLabel: 'Badges',
    icon: <Medal className="w-4 h-4" />,
    activeClass: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md',
    hoverClass: 'hover:bg-white hover:text-indigo-500',
  },
];

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="mb-4 sm:mb-6 lg:mb-8 w-full overflow-x-auto pb-2 hide-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
      <div className="flex items-center justify-start xl:justify-center min-w-max">
        <div
          data-tour="tab-bar"
          className="bg-white/60 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl sm:rounded-full border-2 border-white shadow-lg shadow-teal-500/10 flex items-center gap-0.5 sm:gap-1"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  px-3 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-full
                  text-xs sm:text-sm font-black tracking-wide
                  transition-all duration-300
                  flex items-center gap-1.5 sm:gap-2
                  whitespace-nowrap
                  touch-target
                  ${isActive
                    ? `${tab.activeClass} transform scale-105`
                    : `text-slate-800 ${tab.hoverClass}`
                  }
                `}
              >
                {tab.icon}
                {/* On very small screens show shortLabel, on sm+ show full label */}
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
