import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sparkles, X } from 'lucide-react';
import { RootState } from '../../store';
import { commitWord } from '../../store/predictionSlice';
import type { LetterHistoryEntry } from '../../store/predictionSlice';
import { getSuggestions } from '../../services/spellAssistService';
import { getProgress } from '../../services/progressService';
import { playSuccessSound } from '../../utils/audio';

export const OutputPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { current, text, letterHistory } = useSelector((state: RootState) => state.prediction);
  const [bounce, setBounce] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LetterHistoryEntry | null>(null);

  // Spell Assist: suggest completions for the partial word being signed
  // (the letters after the last space) once it has at least 2 letters.
  // Ranked offline by word frequency + the user's own letter practice stats.
  const suggestions = useMemo(() => {
    const partial = text.slice(text.lastIndexOf(' ') + 1);
    if (partial.length < 2) return [];
    return getSuggestions(partial, getProgress().letterStats);
  }, [text]);

  const handleCommitWord = (word: string) => {
    dispatch(commitWord(word.toUpperCase()));
    playSuccessSound();
  };

  // Trigger bounce animation when a confident letter is detected
  useEffect(() => {
    if (current && current.confidence > 0.8) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 600);
      return () => clearTimeout(timer);
    }
  }, [current?.timestamp]);

  const isConfident = current && current.confidence > 0.7;

  return (
    <div className="relative w-full">
      {/* Background Glows matching CameraView */}
      <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-300/30 rounded-full blur-2xl -z-10"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-400/20 rounded-full blur-3xl -z-10"></div>

      <div
        data-tour="output-panel"
        className="w-full bg-white rounded-2xl sm:rounded-[2.5rem] border-4 sm:border-4 lg:border-8 border-teal-100 shadow-[0_20px_50px_-12px_rgba(20,184,166,0.2)] overflow-hidden flex flex-col relative"
      >
        {/* Header: Translation label + confidence bar */}
        <div className="px-4 py-3 sm:p-5 border-b border-teal-50 bg-slate-50/50 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-400 animate-pulse shrink-0"></div>
            <h2 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
              <span>✍️</span> Translation
            </h2>
          </div>

          {current && (
            <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-100 shadow-sm shrink-0">
              <span className="text-[0.6rem] sm:text-xs text-slate-400 font-bold tracking-wider hidden xs:inline">CONF</span>
              <div className="h-2 w-16 sm:w-24 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isConfident ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`}
                  style={{ width: `${Math.round(current.confidence * 100)}%` }}
                />
              </div>
              <span className={`text-xs sm:text-sm font-black ${isConfident ? 'text-teal-600' : 'text-orange-500'}`}>
                {Math.round(current.confidence * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Main content: signed text + current letter badge */}
        <div className="p-4 sm:p-6 md:p-8 lg:p-10 flex-1 min-h-[140px] sm:min-h-[180px] lg:min-h-[220px] flex items-center justify-between gap-3 sm:gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-700 break-words whitespace-normal leading-tight tracking-tight max-w-full">
              {text || <span className="text-slate-300 font-medium text-xl sm:text-3xl">Start signing...</span>}
              <span className="inline-block w-1 h-8 sm:w-1.5 sm:h-12 md:h-14 lg:h-16 bg-teal-400 ml-1.5 sm:ml-2 animate-pulse align-middle rounded-full opacity-80"></span>
            </p>

            {suggestions.length > 0 && (
              <div className="mt-3 sm:mt-5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="flex items-center gap-1 text-[0.6rem] sm:text-[0.65rem] font-black text-teal-400 uppercase tracking-widest">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Spell Assist
                </span>
                {suggestions.map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => handleCommitWord(word)}
                    aria-label={`Use the word ${word.toUpperCase()}`}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-teal-50 border-2 border-teal-100 text-teal-700 font-black text-xs sm:text-sm tracking-wide hover:bg-teal-500 hover:border-teal-500 hover:text-white active:scale-95 transition-all duration-200 touch-target"
                  >
                    {word.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current letter badge — shrinks gracefully on narrow screens */}
          {current && current.confidence > 0.5 && (
            <div className={`shrink-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-2xl sm:rounded-[2rem] border-4 flex items-center justify-center shadow-lg transition-all duration-300 ${isConfident ? 'bg-teal-50 border-teal-200' : 'bg-orange-50 border-orange-200'} ${bounce ? 'animate-success' : ''}`}>
              <span className={`text-4xl sm:text-5xl lg:text-7xl font-black whitespace-nowrap ${isConfident ? 'text-teal-500' : 'text-orange-400'}`}>
                {current.letter}
              </span>
            </div>
          )}
        </div>

        {/* ── Signed-Letter Trail ──────────────────────────────────────────── */}
        {/* Shows the last few committed letters with confidence indicators.
             Tap any letter to see its reference image and confidence. */}
        {letterHistory.length > 0 && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-5">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[0.6rem] font-black text-slate-300 uppercase tracking-widest">
                Recent signs
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {letterHistory.map((entry, i) => {
                const isLatest = i === letterHistory.length - 1;
                const isOldest = i === 0 && letterHistory.length >= 6;
                const confColor =
                  entry.confidence >= 0.7 ? 'bg-emerald-400' :
                  entry.confidence >= 0.55 ? 'bg-amber-400' :
                  'bg-red-400';
                return (
                  <button
                    key={entry.timestamp}
                    type="button"
                    onClick={() => setSelectedEntry(entry)}
                    className={`relative flex flex-col items-center gap-1 group transition-all duration-300 ${
                      isOldest ? 'opacity-40' : 'opacity-100'
                    } ${isLatest ? 'scale-110' : ''}`}
                  >
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm border-2 transition-all
                      ${isLatest
                        ? 'bg-teal-50 border-teal-300 text-teal-700'
                        : 'bg-slate-50 border-slate-100 text-slate-500 group-hover:border-teal-200'
                      }`}>
                      {entry.letter}
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${confColor}`} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Letter Detail Popup ─────────────────────────────────────────── */}
        {selectedEntry && (
          <div
            className="fixed inset-0 z-[8000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setSelectedEntry(null)}
          >
            <div
              className="bg-white rounded-[2rem] border-4 border-teal-100 shadow-2xl p-6 sm:p-8 max-w-xs w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-600">Letter Detail</h3>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors touch-target"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* ASL Reference Image */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden mb-4">
                <img
                  src={`/asl/${selectedEntry.letter}.jpg`}
                  alt={`ASL sign for ${selectedEntry.letter}`}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML =
                      `<span class="text-5xl font-black text-slate-300">${selectedEntry.letter}</span>`;
                  }}
                />
              </div>

              {/* Letter + Confidence */}
              <div className="text-center">
                <div className="text-4xl font-black text-teal-500 mb-1">
                  {selectedEntry.letter}
                </div>
                <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confidence</span>
                  <span className={`text-sm font-black ${
                    selectedEntry.confidence >= 0.7 ? 'text-emerald-500' :
                    selectedEntry.confidence >= 0.55 ? 'text-amber-500' :
                    'text-red-500'
                  }`}>
                    {Math.round(selectedEntry.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
