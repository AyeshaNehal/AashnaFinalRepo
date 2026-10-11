import React from 'react';
import { Layers, GraduationCap, Camera, X } from 'lucide-react';
import type { TabMode } from '../Navigation/TabBar';

interface StartHereCardProps {
  onNavigate: (tab: TabMode) => void;
  onDismiss: () => void;
}

interface Step {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  tab: TabMode;
  cta: string;
  gradient: string;
  ring: string;
  pillClass: string;
  ctaClass: string;
}

const STEPS: Step[] = [
  {
    step: 1,
    icon: <Layers className="w-5 h-5" />,
    title: 'Flashcards',
    description: 'Learn the ASL alphabet and recognize individual signs.',
    tab: 'flashcards',
    cta: 'Start learning →',
    gradient: 'from-rose-50 to-orange-50',
    ring: 'ring-rose-200',
    pillClass: 'bg-rose-100 text-rose-600',
    ctaClass:
      'bg-gradient-to-r from-rose-400 to-orange-400 hover:from-rose-500 hover:to-orange-500',
  },
  {
    step: 2,
    icon: <GraduationCap className="w-5 h-5" />,
    title: 'Tutorials',
    description: 'Explore guided sign-language lessons from your instructor.',
    tab: 'tutorials',
    cta: 'Browse lessons →',
    gradient: 'from-lime-50 to-emerald-50',
    ring: 'ring-lime-200',
    pillClass: 'bg-lime-100 text-lime-700',
    ctaClass:
      'bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-500 hover:to-emerald-600',
  },
  {
    step: 3,
    icon: <Camera className="w-5 h-5" />,
    title: 'Live Practice',
    description: 'Practice signs using your camera and get real-time feedback.',
    tab: 'practice',
    cta: 'Open camera →',
    gradient: 'from-teal-50 to-cyan-50',
    ring: 'ring-teal-200',
    pillClass: 'bg-teal-100 text-teal-700',
    ctaClass:
      'bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500',
  },
];

export const StartHereCard: React.FC<StartHereCardProps> = ({
  onNavigate,
  onDismiss,
}) => {
  return (
    <div
      role="region"
      aria-label="Getting started guide"
      className="w-full bg-white/80 backdrop-blur-xl border-4 border-white rounded-2xl sm:rounded-[2rem] shadow-xl shadow-teal-500/10 p-4 sm:p-6 mb-4 sm:mb-6 animate-[fadeInDown_0.35s_ease_both]"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4 sm:mb-5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-2xl sm:text-3xl shrink-0" aria-hidden="true">
            🌟
          </span>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-black text-slate-800 leading-tight">
              Start your ASL journey
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">
              New to Aashna? Follow these 3 steps to get started.
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          aria-label="Dismiss getting started guide"
          className="shrink-0 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Steps */}
      <ol className="flex flex-col sm:flex-row gap-3 sm:gap-4 list-none m-0 p-0">
        {STEPS.map(
          ({
            step,
            icon,
            title,
            description,
            tab,
            cta,
            gradient,
            ring,
            pillClass,
            ctaClass,
          }) => (
            <li
              key={tab}
              className={`flex-1 bg-gradient-to-br ${gradient} ring-2 ${ring} rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-row sm:flex-col gap-3`}
            >
              {/* Step number + icon pill */}
              <div
                className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0 ${pillClass} font-black text-sm`}
                aria-label={`Step ${step}`}
              >
                {icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Step {step}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-800 leading-tight">
                  {title}
                </h3>
                <p className="text-xs font-semibold text-slate-500 leading-snug hidden sm:block">
                  {description}
                </p>
                <button
                  onClick={() => onNavigate(tab)}
                  className={`mt-auto self-start px-3 py-1.5 rounded-full text-white text-xs font-black transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white touch-target ${ctaClass}`}
                >
                  {cta}
                </button>
              </div>
            </li>
          )
        )}
      </ol>
    </div>
  );
};

