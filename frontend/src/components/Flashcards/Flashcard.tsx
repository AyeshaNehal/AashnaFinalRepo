import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { FlashcardData } from '../../data/flashcards';

interface FlashcardProps {
  data: FlashcardData;
  onSignIt?: (letter: string) => void;
  isMastered?: boolean;
}

export const Flashcard: React.FC<FlashcardProps> = ({ data, onSignIt, isMastered }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [variantIdx, setVariantIdx] = useState(-1); // -1 = primary word

  // Build the full list: primary word first, then any variants.
  const allWords = [
    { word: data.word, emoji: data.emoji },
    ...(data.variants ?? []),
  ];
  const current = allWords[variantIdx === -1 ? 0 : variantIdx + 1] ?? allWords[0];
  const hasVariants = allWords.length > 1;

  // Cycle to the next word for this letter (stops propagation so the
  // flip-on-click handler on the card itself doesn't also fire).
  const cycleVariant = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVariantIdx((prev) => {
      const next = prev + 1;
      return next >= allWords.length - 1 ? -1 : next;
    });
  };

  return (
    <div
      className="relative w-full aspect-[3/4] perspective-1000 cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`w-full h-full duration-500 preserve-3d relative transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* ── Front of Card (Letter + Image) ──────────────────────────────── */}
        <div className="absolute inset-0 backface-hidden bg-white rounded-3xl border-4 border-slate-100 shadow-xl overflow-hidden flex flex-col items-center justify-center p-4 hover:border-teal-200 transition-colors">
          <div className="text-[5rem] leading-none mb-2 transform group-hover:scale-110 transition-transform duration-300">
            {current.emoji}
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-5xl font-black text-teal-500">{data.letter}</span>
            <span className="text-xl font-bold text-slate-400 uppercase tracking-widest">for</span>
          </div>
          <div className="text-3xl font-black text-slate-700 mt-2 tracking-tight">
            {current.word}
          </div>

          {/* Swap button — only visible when there are alternative words */}
          {hasVariants && (
            <button
              onClick={cycleVariant}
              className="absolute bottom-3 right-3 w-9 h-9 bg-teal-50 hover:bg-teal-100 rounded-full flex items-center justify-center text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-teal-100"
              title="Show another word"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Back of Card (ASL Sign) ─────────────────────────────────────── */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl border-4 border-white shadow-xl overflow-hidden flex flex-col items-center justify-center p-4 text-white">
          <p className="text-sm font-bold tracking-widest uppercase opacity-90 mb-4">ASL Sign</p>
          <div className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg overflow-hidden p-2">
            <img
              src={`/asl/${data.letter}.jpg`}
              alt={`ASL sign for ${data.letter}`}
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<span class="text-4xl font-black text-slate-400 border-4 border-dashed border-slate-200 p-4 rounded-xl">${data.letter}</span>`;
              }}
            />
          </div>

          {/* Show current variant word on the back too, so the learner can
              connect the handshape to whichever vocabulary word is active. */}
          <p className="mt-4 font-black text-lg opacity-90">{current.word}</p>

          {/* Sign It button — only on the flipped (ASL image) side */}
          {onSignIt && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSignIt(data.letter);
              }}
              className="mt-4 px-6 py-3 bg-white text-teal-600 font-black rounded-[1.5rem] hover:bg-teal-50 border-2 border-white hover:border-teal-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-xl">✋</span>
              <span>Sign It</span>
            </button>
          )}

          {hasVariants && (
            <button
              onClick={cycleVariant}
              className="absolute bottom-3 right-3 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              title="Show another word"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Mastered badge — shown if user has successfully signed this letter */}
          {isMastered && (
            <div className="absolute top-3 right-3 bg-amber-400 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg border-2 border-amber-300">
              ✓ Mastered
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
