import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import type { FlashcardData } from '../../data/flashcards';

interface FlashcardProps {
  data: FlashcardData;
  onSignIt?: (letter: string) => void;
  isMastered?: boolean;
  frontImage?: string;
  backImage?: string;
  image?: string;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  data,
  onSignIt,
  isMastered,
  frontImage: propFrontImage,
  backImage: propBackImage,
  image: propImage,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [variantIdx, setVariantIdx] = useState(-1); // -1 = primary word
  const [frontImgFailed, setFrontImgFailed] = useState(false);
  const [backImgFailed, setBackImgFailed] = useState(false);

  // Build the full list: primary word first, then any variants.
  const allWords = [
    {
      word: data.word,
      emoji: data.emoji,
      image: data.image,
      imageUrl: data.imageUrl,
      frontImage: data.frontImage,
      backImage: data.backImage,
    },
    ...(data.variants ?? []),
  ];
  const current = allWords[variantIdx === -1 ? 0 : variantIdx + 1] ?? allWords[0];
  const hasVariants = allWords.length > 1;

  // Resolve front and back images safely
  const effectiveFrontImage = propFrontImage ?? current.frontImage ?? data.frontImage ?? current.imageUrl ?? data.imageUrl;
  const effectiveBackImage = propBackImage ?? current.backImage ?? data.backImage;
  const genericImage = propImage ?? current.image ?? data.image;

  // Front gets explicit front image or generic image if back image is explicitly set
  const frontImg = effectiveFrontImage ?? (effectiveBackImage ? genericImage : undefined);
  // Back gets explicit back image, or generic image, or defaults to standard ASL sign
  const backImg = effectiveBackImage ?? (!effectiveFrontImage && genericImage ? genericImage : (genericImage ?? `/asl/${data.letter}.jpg`));

  // Reset image error states when active images change
  useEffect(() => {
    setFrontImgFailed(false);
    setBackImgFailed(false);
  }, [frontImg, backImg]);

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
        <div className="absolute inset-0 backface-hidden bg-white rounded-3xl border-4 border-slate-100 shadow-xl overflow-hidden flex flex-col items-center justify-center p-2.5 sm:p-4 hover:border-teal-200 transition-colors">
          {frontImg && !frontImgFailed ? (
            <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 max-w-[85%] max-h-[44%] aspect-square bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100 shadow-sm overflow-hidden p-1 sm:p-2 mb-1 sm:mb-2 shrink">
              <img
                src={frontImg}
                alt={current.word}
                className="w-full h-full object-contain object-center rounded-xl"
                onError={() => setFrontImgFailed(true)}
              />
            </div>
          ) : (
            <div className="text-[3.5rem] sm:text-[5rem] leading-none mb-1 sm:mb-2 transform group-hover:scale-110 transition-transform duration-300">
              {current.emoji}
            </div>
          )}
          <div className="flex items-baseline gap-1 sm:gap-2 mt-1 sm:mt-2 shrink-0">
            <span className="text-3xl sm:text-5xl font-black text-teal-500">{data.letter}</span>
            <span className="text-sm sm:text-xl font-bold text-slate-400 uppercase tracking-widest">for</span>
          </div>
          <div className="text-lg sm:text-3xl font-black text-slate-700 mt-1 sm:mt-2 tracking-tight text-center px-1 truncate max-w-full shrink-0">
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
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl border-4 border-white shadow-xl overflow-hidden flex flex-col items-center justify-center p-2.5 sm:p-4 text-white">
          <p className="text-[0.65rem] sm:text-xs font-bold tracking-widest uppercase opacity-90 mb-1 sm:mb-2 shrink-0">
            ASL Sign
          </p>
          <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 max-w-[85%] max-h-[44%] aspect-square bg-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg overflow-hidden p-1 sm:p-2 shrink">
            {backImgFailed ? (
              <span className="text-3xl sm:text-4xl font-black text-slate-400 border-4 border-dashed border-slate-200 p-2 sm:p-4 rounded-xl">
                {data.letter}
              </span>
            ) : (
              <img
                src={backImg}
                alt={`ASL sign for ${data.letter}`}
                className="w-full h-full object-contain object-center rounded-xl"
                onError={() => setBackImgFailed(true)}
              />
            )}
          </div>

          {/* Show current variant word on the back too, so the learner can
              connect the handshape to whichever vocabulary word is active. */}
          <p className="mt-1 sm:mt-2 font-black text-xs sm:text-base opacity-90 truncate max-w-full px-2 shrink-0">
            {current.word}
          </p>

          {/* Sign It button — only on the flipped (ASL image) side */}
          {onSignIt && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSignIt(data.letter);
              }}
              className="mt-1.5 sm:mt-2.5 px-3 sm:px-5 py-1.5 sm:py-2.5 bg-white text-teal-600 font-black rounded-full hover:bg-teal-50 border-2 border-white hover:border-teal-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm shrink-0"
            >
              <span className="text-sm sm:text-base">✋</span>
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
