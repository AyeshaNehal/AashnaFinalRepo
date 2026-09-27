import React, { useEffect, useState } from 'react';

interface MasteredBadgeProps {
  visible: boolean;
  letter: string;
  xpGained: number;
  onComplete: () => void;
}

export const MasteredBadge: React.FC<MasteredBadgeProps> = ({ visible, letter, xpGained, onComplete }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onComplete, 300); // Wait for fade-out animation
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  if (!visible && !show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`transform transition-all duration-500 ${
          show ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
        }`}
      >
        <div className="relative">
          {/* Golden stamp */}
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white px-12 py-8 rounded-[3rem] shadow-2xl border-8 border-amber-300 flex flex-col items-center gap-3">
            <div className="text-6xl font-black">✓</div>
            <div className="text-3xl font-black uppercase tracking-wider">Mastered!</div>
            <div className="text-xl font-bold opacity-90">Letter {letter}</div>
            <div className="mt-2 bg-white/20 px-4 py-2 rounded-full text-lg font-black">
              +{xpGained} XP
            </div>
          </div>

          {/* Sparkle effects */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-300 rounded-full animate-ping"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-amber-300 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute top-1/2 -right-6 w-6 h-6 bg-orange-300 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};
