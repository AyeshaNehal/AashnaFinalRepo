import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { CameraView } from '../Camera/CameraView';
import { clearText, setSignMode, setTargetLetter } from '../../store/predictionSlice';
import { addXp, UserProgress, getProgress } from '../../services/progressService';
import { playSuccessSound, playBossWinSound } from '../../utils/audio';
import { spellingTiers, WORDS_TO_ADVANCE, type SpellingTier } from '../../data/spelling-words';
import { phraseCategories, type PhraseCategory } from '../../data/phrases';

// ─── Helper: pick a random element from an array ─────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Mode selector tabs ──────────────────────────────────────────────────────
type SpellingMode = 'words' | 'phrases';

// Tier-colour palette for the badge in the header.
const TIER_COLORS: Record<SpellingTier, { bg: string; text: string; border: string }> = {
  beginner:     { bg: 'bg-green-100',   text: 'text-green-600',   border: 'border-green-200'   },
  intermediate: { bg: 'bg-blue-100',    text: 'text-blue-600',    border: 'border-blue-200'    },
  advanced:     { bg: 'bg-violet-100',  text: 'text-violet-600',  border: 'border-violet-200'  },
  expert:       { bg: 'bg-rose-100',    text: 'text-rose-600',    border: 'border-rose-200'    },
};

export const SpellingView: React.FC = () => {
  const dispatch = useDispatch();
  const text = useSelector((state: RootState) => state.prediction.text);

  // ── Spelling mode (words vs. phrases) ──────────────────────────────────────
  const [mode, setMode] = useState<SpellingMode>('words');

  // ── Words mode state ───────────────────────────────────────────────────────
  const [tierIdx, setTierIdx] = useState(0); // index into spellingTiers
  const [streakInTier, setStreakInTier] = useState(0);
  const [targetWord, setTargetWord] = useState('');
  const [currentLetterIdx, setCurrentLetterIdx] = useState(0);

  // ── Phrases mode state ─────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState<PhraseCategory>('greetings');

  // ── Shared state ───────────────────────────────────────────────────────────
  const [showSuccess, setShowSuccess] = useState(false);
  const [progress, setProgressState] = useState<UserProgress>(getProgress());
  const previousTextLength = useRef(text.length);

  const tier = spellingTiers[tierIdx];

  // ── Pick the next target (word or phrase) ──────────────────────────────────
  const pickNextTarget = React.useCallback(() => {
    if (mode === 'words') {
      return pick(spellingTiers[tierIdx].words);
    }
    // phrases: pick from the active category
    const cat = phraseCategories.find((c) => c.category === activeCategory)!;
    return pick(cat.phrases);
  }, [mode, tierIdx, activeCategory]);

  // ── Initialise on mount / mode change ──────────────────────────────────────
  useEffect(() => {
    dispatch(setSignMode('phrases'));
    dispatch(clearText());
    previousTextLength.current = 0;
    const next = pickNextTarget();
    setTargetWord(next);
    setCurrentLetterIdx(0);
    dispatch(setTargetLetter(next[0]));
    return () => {
      dispatch(setTargetLetter(null));
    };
  }, [dispatch, mode, tierIdx, activeCategory, pickNextTarget]);

  // ── React to recognised letters ────────────────────────────────────────────
  useEffect(() => {
    if (text.length > previousTextLength.current) {
      const lastLetter = text[text.length - 1];
      // Spaces in phrases are auto-skipped (camera can't produce them).
      let expectedLetter = targetWord[currentLetterIdx];

      // If the expected char is a space, advance past it and check the next
      // real letter instead — the camera never produces spaces, so the user
      // just keeps signing through the word boundary.
      let effectiveIdx = currentLetterIdx;
      while (effectiveIdx < targetWord.length && targetWord[effectiveIdx] === ' ') {
        effectiveIdx++;
      }
      expectedLetter = targetWord[effectiveIdx];

      if (lastLetter === expectedLetter && !showSuccess) {
        playSuccessSound();

        // Find next non-space position
        let nextIdx = effectiveIdx + 1;
        while (nextIdx < targetWord.length && targetWord[nextIdx] === ' ') {
          nextIdx++;
        }

        if (nextIdx >= targetWord.length) {
          // ── Word / phrase complete ─────────────────────────────────────
          setShowSuccess(true);
          playBossWinSound();

          // XP: longer words earn more; tier bonus on top.
          const wordLen = targetWord.replace(/ /g, '').length;
          const tierBonus = tierIdx * 10;
          const xpGained = 30 + wordLen * 5 + tierBonus;
          setProgressState(addXp(xpGained));

          // Tier progression (words mode only)
          if (mode === 'words') {
            const newStreak = streakInTier + 1;
            setStreakInTier(newStreak);
            if (newStreak >= WORDS_TO_ADVANCE && tierIdx < spellingTiers.length - 1) {
              setTierIdx((t) => t + 1);
              setStreakInTier(0);
            }
          }

          setTimeout(() => {
            setShowSuccess(false);
            dispatch(clearText());
            previousTextLength.current = 0;
            const next = pickNextTarget();
            setTargetWord(next);
            setCurrentLetterIdx(0);
            dispatch(setTargetLetter(next[0]));
          }, 2000);
        } else {
          // ── Next letter ─────────────────────────────────────────────────
          setCurrentLetterIdx(nextIdx);
          dispatch(setTargetLetter(targetWord[nextIdx]));
        }
      }
    }
    previousTextLength.current = text.length;
  }, [text, currentLetterIdx, targetWord, showSuccess, dispatch, mode, tierIdx, streakInTier, pickNextTarget]);

  // ── UI helpers ─────────────────────────────────────────────────────────────
  const tierColor = TIER_COLORS[tier.tier];

  // Characters to display: split target into chars, skipping spaces for the
  // "letter tiles" row but keeping them visible as a gap between words.
  const displayChars = targetWord.split('');

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full">
      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="bg-fuchsia-100 text-fuchsia-600 font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-sm sm:text-lg flex items-center gap-2">
            🐝 Spelling Bee
          </div>

          {/* Mode tabs: Words / Phrases */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => { setMode('words'); setStreakInTier(0); }}
              className={`px-3 py-1.5 sm:px-4 rounded-lg font-bold text-xs sm:text-sm transition-all touch-target ${
                mode === 'words'
                  ? 'bg-fuchsia-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-fuchsia-600'
              }`}
            >
              Words
            </button>
            <button
              onClick={() => setMode('phrases')}
              className={`px-3 py-1.5 sm:px-4 rounded-lg font-bold text-xs sm:text-sm transition-all touch-target ${
                mode === 'phrases'
                  ? 'bg-fuchsia-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-fuchsia-600'
              }`}
            >
              Phrases
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tier badge (words mode) or category name (phrases mode) */}
          {mode === 'words' ? (
            <div className={`${tierColor.bg} ${tierColor.text} font-black px-2.5 py-1.5 sm:px-3 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2`}>
              <span>{tier.label}</span>
              {streakInTier > 0 && (
                <span className="text-[0.6rem] sm:text-xs opacity-70">
                  {streakInTier}/{WORDS_TO_ADVANCE}
                </span>
              )}
            </div>
          ) : (
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value as PhraseCategory)}
              className="bg-violet-100 text-violet-700 font-bold px-2.5 py-1.5 sm:px-3 rounded-xl text-xs sm:text-sm border-none outline-none cursor-pointer"
            >
              {phraseCategories.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          )}
          <div className="text-slate-500 font-bold text-sm sm:text-base">{progress.xp} XP</div>
        </div>
      </div>

      {/* ── Tier description (words mode, subtle) ──────────────────────────── */}
      {mode === 'words' && (
        <p className="text-xs sm:text-sm text-slate-400 font-bold text-center -mt-1 sm:-mt-2">
          {tier.description}
        </p>
      )}

      {/* ── Main card + camera ─────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 w-full">
        <div className="w-full lg:w-[40%] flex flex-col gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl sm:rounded-[3rem] p-5 sm:p-8 lg:p-10 border-4 sm:border-8 border-fuchsia-100 shadow-[0_20px_50px_-12px_rgba(217,70,239,0.2)] relative overflow-hidden flex flex-col items-center text-center">

            <h2 className="text-xl sm:text-2xl font-black text-slate-600 mb-4 sm:mb-8">
              {mode === 'phrases' ? 'Can you sign...' : 'Can you spell...'}
            </h2>

            {/* Letter tiles */}
            <div className="flex justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-12 flex-wrap">
              {displayChars.map((char, idx) => {
                if (char === ' ') {
                  return <div key={idx} className="w-3 sm:w-4" />;
                }
                return (
                  <div
                    key={idx}
                    className={`w-10 h-12 sm:w-14 sm:h-18 md:w-16 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-4xl md:text-5xl font-black transition-all duration-300 ${
                      idx < currentLetterIdx
                        ? 'bg-green-500 text-white shadow-lg transform -translate-y-1 sm:-translate-y-2'
                        : idx === currentLetterIdx
                          ? 'bg-fuchsia-100 text-fuchsia-600 border-4 border-fuchsia-300 transform scale-110'
                          : 'bg-slate-50 text-slate-300 border-4 border-slate-100'
                    }`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>

            {showSuccess ? (
              <div className="bg-green-100 border-4 border-green-200 text-green-700 font-bold px-4 py-3 sm:px-6 sm:py-4 rounded-2xl w-full animate-bounce text-sm sm:text-lg flex flex-col items-center gap-1">
                <span>🎉 {mode === 'phrases' ? 'Perfect Phrase!' : 'Perfect Spelling!'}</span>
                <span className="text-base sm:text-xl">+{30 + targetWord.replace(/ /g, '').length * 5 + tierIdx * 10} XP</span>
                {mode === 'words' && streakInTier >= WORDS_TO_ADVANCE && tierIdx < spellingTiers.length - 1 && (
                  <span className="text-xs sm:text-sm font-black text-violet-600 mt-1">
                    ⬆️ Promoted to {spellingTiers[tierIdx + 1].label}!
                  </span>
                )}
              </div>
            ) : (
              <div className="bg-fuchsia-50 border-4 border-fuchsia-100 text-fuchsia-600 font-bold px-4 py-3 sm:px-6 sm:py-4 rounded-2xl w-full text-sm sm:text-lg">
                Sign the letter{' '}
                <span className="font-black text-xl sm:text-2xl mx-1">
                  {targetWord[currentLetterIdx] === ' '
                    ? targetWord[currentLetterIdx + 1] ?? ''
                    : targetWord[currentLetterIdx]}
                </span>
              </div>
            )}

          </div>
        </div>

        <div className="w-full lg:w-[60%]">
          <CameraView />
        </div>
      </div>
    </div>
  );
};
