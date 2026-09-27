import React, { useEffect, useMemo, useRef, useState } from 'react';

// ─── Tunables ────────────────────────────────────────────────────────────────
// How long each letter is displayed during playback. Adjust this single
// constant to speed up or slow down the entire sequence.
const BASE_INTERVAL_MS = 1200;

const SPEED_OPTIONS = [
  { label: 'Slow',   emoji: '🐢', factor: 1.7  },  // ~2040ms / letter
  { label: 'Normal', emoji: '👌', factor: 1.0  },  // 1200ms  / letter
  { label: 'Fast',   emoji: '⚡', factor: 0.55 },  // ~660ms  / letter
] as const;

// ─── Types ───────────────────────────────────────────────────────────────────
interface PlaybackItem {
  letter: string;             // uppercase A-Z or 0-9
  imageSrc: string;           // /asl/X.jpg
  wordIndex: number;
  letterInWordIndex: number;  // position within the alphanumeric-only word
}

// ─── Pure parser ─────────────────────────────────────────────────────────────
// Splits input into words (stripping non-alphanumeric characters from each
// word) and flattens every letter/digit into a PlaybackItem. Spaces and
// punctuation are ignored for playback but word boundaries are preserved so
// the UI can show word context.
function parseMessage(text: string): { items: PlaybackItem[]; words: string[] } {
  const rawWords = text.split(/\s+/).filter(Boolean);
  const items: PlaybackItem[] = [];
  const words: string[] = [];

  rawWords.forEach((raw) => {
    const clean = [...raw]
      .filter((c) => /^[A-Za-z0-9]$/.test(c))
      .join('')
      .toUpperCase();
    if (!clean) return;
    words.push(clean);
    const wi = words.length - 1;
    [...clean].forEach((ch, li) => {
      items.push({
        letter: ch,
        imageSrc: `/asl/${ch}.jpg`,
        wordIndex: wi,
        letterInWordIndex: li,
      });
    });
  });

  return { items, words };
}

// ─── Component ───────────────────────────────────────────────────────────────
export const ReplyPlaybackView: React.FC = () => {
  const [input, setInput] = useState('');
  const [items, setItems] = useState<PlaybackItem[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedFactor, setSpeedFactor] = useState<number>(SPEED_OPTIONS[1].factor);
  const [started, setStarted] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const timerRef = useRef<number | null>(null);

  // Clean up timer on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, []);

  // Advance playback on a fixed interval derived from the chosen speed.
  useEffect(() => {
    if (!isPlaying || items.length === 0) return;

    timerRef.current = window.setInterval(() => {
      setCurrentIndex((i) => {
        if (i + 1 >= items.length) {
          setIsPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, BASE_INTERVAL_MS * speedFactor);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, items.length, speedFactor]);

  // Live letter count for the "N letters to play" hint while typing.
  const letterCount = useMemo(() => parseMessage(input).items.length, [input]);

  // Derived state.
  const currentItem = started && currentIndex < items.length ? items[currentIndex] : null;
  const currentWordIndex = currentItem?.wordIndex ?? -1;
  const hasFinished = started && !isPlaying && currentIndex >= items.length - 1;
  const progress =
    started && items.length > 0
      ? ((currentIndex + 1) / items.length) * 100
      : 0;
  const canStart = letterCount > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Reset playback whenever the message is edited.
    setIsPlaying(false);
    setStarted(false);
    setItems([]);
    setWords([]);
    setCurrentIndex(0);
    setFailedImages(new Set());
  };

  const handlePlay = () => {
    // Finished → restart from the beginning.
    if (started && hasFinished) {
      setCurrentIndex(0);
      setIsPlaying(true);
      return;
    }
    // First play → parse and begin.
    if (!started) {
      const parsed = parseMessage(input);
      if (parsed.items.length === 0) return;
      setItems(parsed.items);
      setWords(parsed.words);
      setCurrentIndex(0);
      setStarted(true);
      setFailedImages(new Set());
      setIsPlaying(true);
      return;
    }
    // Otherwise → toggle pause/resume.
    setIsPlaying((p) => !p);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  const handleImageError = (letter: string) => {
    setFailedImages((prev) => new Set(prev).add(letter));
  };

  // Keyboard shortcut: Space to play/pause while the textarea is not focused.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.code === 'Space' && started) {
        e.preventDefault();
        handlePlay();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Inline keyframe for the letter-fade animation. */}
      <style>{`
        @keyframes replyLetterIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Header chip */}
      <div className="flex items-center gap-3 mb-6">
        <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-400 to-indigo-400 text-white font-black text-sm shadow-sm">
          ⌨️ Reply Mode
        </div>
        {started && (
          <div className="text-sm text-slate-400 font-medium">
            Letter {currentIndex + 1} of {items.length}
          </div>
        )}
      </div>

      {/* ── Input card ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-6 shadow-sm mb-6">
        <label
          htmlFor="reply-input"
          className="block text-sm font-bold text-slate-500 mb-2"
        >
          Type a message — a deaf person will see it played back as ASL signs:
        </label>
        <textarea
          id="reply-input"
          value={input}
          onChange={handleInputChange}
          placeholder="e.g. Hello, how are you today?"
          rows={3}
          className="w-full resize-none border-2 border-slate-100 rounded-2xl p-4 text-lg font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-sky-300 transition-colors"
        />
        <div className="mt-2 text-xs text-slate-400">
          {letterCount > 0
            ? `${letterCount} letter${letterCount !== 1 ? 's' : ''} to play`
            : 'Letters and digits will be shown as ASL reference images'}
        </div>
      </div>

      {/* ── Controls row ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Play / Pause / Replay */}
        <button
          onClick={handlePlay}
          disabled={!canStart && !started}
          className="px-8 py-4 bg-gradient-to-r from-sky-400 to-indigo-400 text-white font-black rounded-[1.5rem] shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md flex items-center gap-2"
        >
          <span className="text-xl">
            {hasFinished ? '🔄' : isPlaying ? '⏸' : '▶️'}
          </span>
          <span>
            {hasFinished
              ? 'Replay'
              : isPlaying
                ? 'Pause'
                : started
                  ? 'Resume'
                  : 'Play'}
          </span>
        </button>

        {/* Restart */}
        {started && (
          <button
            onClick={handleRestart}
            className="px-6 py-4 bg-white border-2 border-slate-100 text-slate-600 font-bold rounded-[1.5rem] hover:bg-slate-50 hover:border-slate-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
          >
            ↩ Restart
          </button>
        )}

        {/* Speed pills */}
        <div className="flex items-center gap-1.5 ml-auto bg-slate-50 rounded-full p-1.5 border border-slate-100">
          <span className="text-xs font-bold text-slate-400 px-2 hidden sm:inline">
            Speed
          </span>
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setSpeedFactor(opt.factor)}
              title={`~${Math.round(BASE_INTERVAL_MS * opt.factor)}ms per letter`}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                speedFactor === opt.factor
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-white'
              }`}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Playback area ─────────────────────────────────────────────────── */}
      {started && currentItem ? (
        <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-[2rem] border-2 border-sky-100 p-8 shadow-sm">
          {/* Letter image */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto rounded-[2rem] bg-white shadow-lg border-2 border-white overflow-hidden flex items-center justify-center">
            {failedImages.has(currentItem.letter) ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-7xl font-black text-slate-300 select-none">
                  {currentItem.letter}
                </span>
                <span className="text-xs text-slate-400">No image available</span>
              </div>
            ) : (
              <img
                key={currentIndex}
                src={currentItem.imageSrc}
                alt={`ASL sign for letter ${currentItem.letter}`}
                className="w-full h-full object-contain p-2"
                style={{ animation: 'replyLetterIn 0.22s ease-out' }}
                onError={() => handleImageError(currentItem.letter)}
                draggable={false}
              />
            )}
          </div>

          {/* Current word: letter pills with the active letter highlighted */}
          {currentWordIndex >= 0 && words[currentWordIndex] && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Spelling
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {[...words[currentWordIndex]].map((ch, i) => {
                  const isCurrent = currentItem.letterInWordIndex === i;
                  const isPast = currentItem.letterInWordIndex > i;
                  return (
                    <span
                      key={i}
                      className={`
                        px-2.5 py-1.5 rounded-lg text-lg sm:text-xl font-black
                        transition-all duration-200
                        ${
                          isCurrent
                            ? 'bg-sky-500 text-white scale-110 shadow-md'
                            : isPast
                              ? 'bg-sky-100 text-sky-500'
                              : 'bg-white text-slate-400 border border-slate-100'
                        }
                      `}
                    >
                      {ch}
                    </span>
                  );
                })}
              </div>

              {/* Full sentence — current word highlighted */}
              {words.length > 1 && (
                <div className="mt-2 text-center text-sm font-medium text-slate-400 leading-relaxed max-w-md">
                  {words.map((w, i) => (
                    <span
                      key={i}
                      className={`mx-1 ${
                        i === currentWordIndex
                          ? 'text-sky-600 font-black underline decoration-sky-300 underline-offset-4'
                          : ''
                      }`}
                    >
                      {w}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-8">
            <div className="h-2 bg-white/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-400 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1.5 text-xs text-center text-slate-400 font-medium">
              {currentIndex + 1} / {items.length}
            </div>
          </div>
        </div>
      ) : (
        /* ── Welcome state ─────────────────────────────────────────────── */
        <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-[2rem] border-2 border-sky-100 p-12 shadow-sm text-center">
          <div className="text-6xl mb-4 select-none">⌨️</div>
          <h2 className="text-2xl font-black text-slate-700 mb-2">
            Reply Mode
          </h2>
          <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
            Type a message above and press{' '}
            <strong className="text-slate-700">Play</strong> to watch it played
            back as a sequence of ASL letter images — so a deaf person can see
            what you typed, letter by letter.
          </p>
          {canStart && (
            <p className="mt-4 text-sky-600 font-bold">
              {letterCount} letter{letterCount !== 1 ? 's' : ''} ready — press
              Play to start!
            </p>
          )}
        </div>
      )}

      {/* ── Missing image warning ─────────────────────────────────────────── */}
      {failedImages.size > 0 && (
        <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-700">
          ⚠️ No ASL image found for:{' '}
          <strong>{[...failedImages].sort().join(', ')}</strong> — shown as
          text fallback instead.
        </div>
      )}
    </div>
  );
};
