import React, { useState, useEffect } from 'react';
import { flashcards, numberFlashcards } from '../../data/flashcards';
import { Flashcard } from './Flashcard';
import { SignItChallenge } from './SignItChallenge';
import { MasteredBadge } from './MasteredBadge';
import { Type, Hash } from 'lucide-react';

export const FlashcardsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'letters' | 'numbers'>('letters');
  const [challengeLetter, setChallengeLetter] = useState<string | null>(null);
  const [masteredLetters, setMasteredLetters] = useState<Set<string>>(new Set());
  const [showMasteredBadge, setShowMasteredBadge] = useState(false);
  const [badgeData, setBadgeData] = useState<{ letter: string; xp: number } | null>(null);

  // Load mastered letters from localStorage on mount.
  useEffect(() => {
    const mastered = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('flashcardMastered_')) {
        const letter = key.replace('flashcardMastered_', '');
        mastered.add(letter);
      }
    }
    setMasteredLetters(mastered);
  }, []);

  const handleSignIt = (letter: string) => {
    setChallengeLetter(letter);
  };

  const handleSuccess = (xpGained: number) => {
    if (!challengeLetter) return;

    // Mark as mastered in localStorage.
    const key = `flashcardMastered_${challengeLetter}`;
    localStorage.setItem(key, 'true');
    setMasteredLetters((prev) => new Set(prev).add(challengeLetter));

    // Show mastered badge.
    setBadgeData({ letter: challengeLetter, xp: xpGained });
    setShowMasteredBadge(true);
    setChallengeLetter(null);
  };

  const handleDismiss = () => {
    setChallengeLetter(null);
  };

  const handleBadgeComplete = () => {
    setShowMasteredBadge(false);
    setBadgeData(null);
  };

  const currentCards = activeTab === 'letters' ? flashcards : numberFlashcards;

  return (
    <div className="w-full bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-[3rem] p-4 sm:p-6 lg:p-8 border-4 border-white shadow-2xl overflow-y-auto" style={{ maxHeight: '85vh' }}>
      <div className="text-center mb-5 sm:mb-8">
        <h2 className="text-2xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-500 tracking-tight mb-4 sm:mb-6">
          Learn {activeTab === 'letters' ? 'the Alphabet' : 'Numbers'}
        </h2>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white/80 p-1 sm:p-1.5 rounded-full shadow-sm flex items-center border-2 border-white">
            <button
              onClick={() => setActiveTab('letters')}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all touch-target ${
                activeTab === 'letters'
                  ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-teal-600'
              }`}
            >
              <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Letters (A-Z)
            </button>
            <button
              onClick={() => setActiveTab('numbers')}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all touch-target ${
                activeTab === 'numbers'
                  ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-teal-600'
              }`}
            >
              <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Numbers (0-9)
            </button>
          </div>
        </div>

        <p className="text-slate-500 font-bold mt-2 text-xs sm:text-sm">
          Click any card to flip it, then press <strong>Sign It</strong> to practice!
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
        {currentCards.map((data) => (
          <Flashcard
            key={data.letter}
            data={data}
            onSignIt={handleSignIt}
            isMastered={masteredLetters.has(data.letter)}
          />
        ))}
      </div>

      {/* Sign It challenge overlay */}
      {challengeLetter && (
        <SignItChallenge
          targetLetter={challengeLetter}
          onSuccess={handleSuccess}
          onDismiss={handleDismiss}
        />
      )}

      {/* Mastered badge overlay */}
      {badgeData && (
        <MasteredBadge
          visible={showMasteredBadge}
          letter={badgeData.letter}
          xpGained={badgeData.xp}
          onComplete={handleBadgeComplete}
        />
      )}
    </div>
  );
};
