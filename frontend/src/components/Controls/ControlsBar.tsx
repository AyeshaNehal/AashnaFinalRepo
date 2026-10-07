import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { appendChar, backspace, backspaceToWordStart, clearText } from '../../store/predictionSlice';
import { RootState } from '../../store';

export const ControlsBar: React.FC = () => {
  const dispatch = useDispatch();
  const text = useSelector((state: RootState) => state.prediction.text);

  const handleSpeak = () => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-4 w-full mt-1 sm:mt-2">
      {/* Space */}
      <button
        onClick={() => dispatch(appendChar(' '))}
        className="touch-target col-span-1 flex-1 sm:flex-none sm:min-w-[8rem] px-4 py-3 sm:px-6 sm:py-4 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl sm:rounded-[1.5rem] border-2 border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 font-bold flex items-center justify-center gap-2"
      >
        <span className="text-lg sm:text-xl bg-slate-100 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-slate-400">␣</span>
        <span className="text-sm sm:text-base">Space</span>
      </button>

      {/* Delete */}
      <button
        onClick={() => dispatch(backspace())}
        className="touch-target col-span-1 flex-1 sm:flex-none sm:min-w-[8rem] px-4 py-3 sm:px-6 sm:py-4 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl sm:rounded-[1.5rem] border-2 border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 font-bold flex items-center justify-center gap-2"
      >
        <span className="text-lg sm:text-xl">⌫</span>
        <span className="text-sm sm:text-base">Delete</span>
      </button>

      {/* Word */}
      <button
        onClick={() => dispatch(backspaceToWordStart())}
        disabled={!text}
        title="Delete back to the start of the current word (undoes a Spell Assist suggestion)"
        className="touch-target col-span-1 flex-1 sm:flex-none sm:min-w-[8rem] px-4 py-3 sm:px-6 sm:py-4 bg-white hover:bg-slate-50 disabled:hover:bg-white text-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed rounded-2xl sm:rounded-[1.5rem] border-2 border-slate-100 hover:border-slate-200 disabled:border-slate-100 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 font-bold flex items-center justify-center gap-2"
      >
        <span className="text-lg sm:text-xl">⌫</span>
        <span className="text-sm sm:text-base">Word</span>
      </button>

      {/* Clear */}
      <button
        onClick={() => dispatch(clearText())}
        className="touch-target col-span-1 flex-1 sm:flex-none sm:min-w-[8rem] px-4 py-3 sm:px-6 sm:py-4 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-2xl sm:rounded-[1.5rem] border-2 border-rose-100 hover:border-rose-200 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 font-bold flex items-center justify-center gap-1.5 sm:gap-2"
      >
        <span className="text-sm sm:text-base">🗑️</span>
        <span className="text-sm sm:text-base">Clear</span>
      </button>

      {/* Speak — full width on mobile so it stands out */}
      <button
        onClick={handleSpeak}
        disabled={!text}
        className="touch-target col-span-2 sm:col-span-1 sm:ml-auto sm:flex-none sm:min-w-[9rem] px-4 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white rounded-2xl sm:rounded-[1.5rem] border-0 disabled:border-2 disabled:border-slate-100 active:scale-95 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 hover:shadow-teal-500/40 transition-all duration-300 font-black flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30 disabled:shadow-none"
      >
        <span className="text-sm sm:text-base">Speak</span>
        <span className="text-xl sm:text-2xl animate-pulse">🔊</span>
      </button>
    </div>
  );
};
