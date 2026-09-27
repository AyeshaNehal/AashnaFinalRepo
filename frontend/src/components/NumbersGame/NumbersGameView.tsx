import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { CameraView } from '../Camera/CameraView';
import { clearText, setSignMode, setTargetLetter } from '../../store/predictionSlice';
import { playSuccessSound, playBossWinSound, playErrorSound } from '../../utils/audio';
import { getProgress, addXp, UserProgress } from '../../services/progressService';

// ─── Type definitions ───────────────────────────────────────────────────────
type Difficulty = 'easy' | 'medium' | 'hard';
type MathOp = '+' | '-' | '×' | '÷';
type GameMode = 'counting' | 'math';
// Level 1 counting submodes — each produces a different number sequence
type CountingSubmode = 'forward' | 'reverse' | 'skip2' | 'random';

interface MathEquation {
  a: number;
  b: number;
  op: MathOp;
  answer: number;
}

interface SequenceDef {
  /** Full sequence of numbers (including the hidden slot). */
  numbers: number[];
  /** Index of the slot the user must sign. */
  hiddenIdx: number;
  /** Human-readable hint describing the pattern. */
  hint: string;
}

const ALL_OPERATIONS: MathOp[] = ['+', '-', '×', '÷'];

// ─── Counting submode definitions ───────────────────────────────────────────
const COUNTING_SUBMODES: Array<{ id: CountingSubmode; label: string; emoji: string }> = [
  { id: 'forward', label: 'Count Up',  emoji: '🔢' },
  { id: 'reverse', label: 'Count Down', emoji: '🔻' },
  { id: 'skip2',   label: 'Skip by 2',  emoji: '✌️' },
  { id: 'random',  label: 'Random',     emoji: '🎲' },
];

// ─── Sequence step presets for Level 2 ──────────────────────────────────────
interface SeqStepDef {
  step: number;
  direction: 'asc' | 'desc';
  label: string;
}
const SEQ_PRESETS: SeqStepDef[] = [
  { step: 1, direction: 'asc',  label: '+1' },
  { step: 2, direction: 'asc',  label: '+2' },
  { step: 3, direction: 'asc',  label: '+3' },
  { step: 1, direction: 'desc', label: '−1' },
  { step: 2, direction: 'desc', label: '−2' },
];

// ─── Math question generator ────────────────────────────────────────────────
// Generates problems whose ANSWER fits within the allowed range for the
// current difficulty.  The user signs the answer digit-by-digit, so:
//   easy   — answer 1-5   (single digit, small operands)
//   medium — answer 1-9   (single digit, moderate operands)
//   hard   — answer 1-18  (may be 2 digits, user signs each digit in turn)
// Division is always evenly divisible (no remainders).
const ANSWER_RANGE: Record<Difficulty, [number, number]> = {
  easy:   [1, 5],
  medium: [1, 9],
  hard:   [1, 18],
};

function randInt(lo: number, hi: number): number {
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function generateQuestion(difficulty: Difficulty, allowedOps: MathOp[]): MathEquation {
  const ops = allowedOps.length > 0 ? allowedOps : ALL_OPERATIONS;
  const op = ops[Math.floor(Math.random() * ops.length)];
  const [lo, hi] = ANSWER_RANGE[difficulty];

  switch (op) {
    case '+': {
      // Pick the sum first (guaranteed in range), then split into addends.
      const answer = randInt(Math.max(2, lo), hi);
      const a = randInt(1, answer - 1);
      return { a, b: answer - a, op, answer };
    }
    case '-': {
      // Pick the answer first (positive), then pick b and derive a.
      const answer = randInt(lo, hi);
      const b = randInt(1, Math.min(hi, 9));
      return { a: answer + b, b, op, answer };
    }
    case '×': {
      // Enumerate valid (a, b) pairs whose product is in [lo, hi] with a ≤ 9, b ≤ 9.
      const pairs: Array<[number, number]> = [];
      for (let a = 1; a <= 9; a++) {
        for (let b = 1; b <= a; b++) {        // b ≤ a to avoid duplicates
          const product = a * b;
          if (product >= lo && product <= hi) pairs.push([a, b]);
        }
      }
      if (pairs.length === 0) {
        // Fallback: no valid × pair for this range — generate addition instead.
        return generateQuestion(difficulty, ops.filter((o) => o !== '×'));
      }
      const [a, b] = pairs[Math.floor(Math.random() * pairs.length)];
      // Randomly swap operand order so "a × b" isn't always a ≥ b.
      return Math.random() < 0.5
        ? { a, b, op, answer: a * b }
        : { a: b, b: a, op, answer: a * b };
    }
    case '÷': {
      // Pick quotient (the answer) in range, then pick a divisor.
      const answer = randInt(lo, Math.min(hi, 9));
      const maxDivisor = Math.min(9, Math.floor(9 / Math.max(1, answer)));
      const b = randInt(1, Math.max(1, maxDivisor));
      return { a: answer * b, b, op, answer };
    }
  }
}

// ─── Sequence generator (Level 2) ───────────────────────────────────────────
// Builds a sequence of `length` numbers starting from `start`, stepping by
// `step` in the given direction.  One random slot is hidden.
function generateSequenceDef(
  step: number = 1,
  direction: 'asc' | 'desc' = 'asc',
  length: number = 4,
): SequenceDef {
  const effectiveStep = direction === 'desc' ? -step : step;

  // Compute valid start range so every number stays in 0-9.
  const maxStart = direction === 'asc'
    ? 9 - step * (length - 1)
    : step * (length - 1);
  const minStart = direction === 'desc' ? step * (length - 1) : 0;

  const clampedMin = Math.max(0, minStart);
  const clampedMax = Math.min(9, maxStart);
  const start = randInt(clampedMin, Math.max(clampedMin, clampedMax));

  const numbers = Array.from({ length }, (_, i) => start + i * effectiveStep);
  const hiddenIdx = randInt(0, length - 1);

  const dirLabel = direction === 'asc' ? `+${step}` : `−${step}`;
  return { numbers, hiddenIdx, hint: `Pattern: ${dirLabel}` };
}

// ─── Module-level saved state (persists across unmount/remount) ─────────────
const INITIAL_SAVED_STATE = () => ({
  gameMode: 'counting' as GameMode,
  level: 1,
  targetNumber: 1,
  questionCount: 0,
  missingSequence: [] as number[],
  missingIndex: 0,
  seqHint: '',
  mathEq: { a: 0, b: 0, op: '+' as MathOp, answer: 0 },
  difficulty: 'easy' as Difficulty,
  selectedOps: [...ALL_OPERATIONS] as MathOp[],
  countingSubmode: 'forward' as CountingSubmode,
  seqStep: 1,
  seqDirection: 'asc' as 'asc' | 'desc',
  countingSequence: [1, 2, 3, 4, 5, 6, 7, 8, 9] as number[],
  countingIdx: 0,
});
let savedState = INITIAL_SAVED_STATE();

// ─── XP rewards scaled by difficulty / action ───────────────────────────────
const MATH_XP: Record<Difficulty, number> = { easy: 10, medium: 15, hard: 20 };

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════
export const NumbersGameView: React.FC = () => {
  const dispatch = useDispatch();
  const text = useSelector((state: RootState) => state.prediction.text);
  // Dedicated buffer that accumulates signed digits character-by-character.
  // Unlike the old text-slice approach, this is immune to the 1500 ms
  // clearText() timer racing with the second digit arrival.
  const digitBufferRef = useRef('');
  const prevTextLen = useRef(0); // used only to detect newly-appended chars

  // ── Game state ──────────────────────────────────────────────────────────────
  const [gameMode, setGameMode]           = useState<GameMode>(savedState.gameMode);
  const [level, setLevel]                 = useState(savedState.level);
  const [targetNumber, setTargetNumber]   = useState(savedState.targetNumber);
  const [showSuccess, setShowSuccess]     = useState(false);
  const [showWrong, setShowWrong]         = useState(false);
  const [showHint, setShowHint]           = useState(false);
  const [questionCount, setQuestionCount] = useState(savedState.questionCount);

  // Level 2 state
  const [missingSequence, setMissingSequence] = useState<number[]>(savedState.missingSequence);
  const [missingIndex, setMissingIndex]       = useState<number>(savedState.missingIndex);
  const [seqHint, setSeqHint]                 = useState(savedState.seqHint);

  // Level 3 math state
  const [mathEq, setMathEq]               = useState(savedState.mathEq);
  const [difficulty, setDifficulty]        = useState<Difficulty>(savedState.difficulty);
  const [selectedOps, setSelectedOps]     = useState<Set<MathOp>>(new Set(savedState.selectedOps));

  // Level 1 counting submodes
  const [countingSubmode, setCountingSubmode] = useState<CountingSubmode>(savedState.countingSubmode);
  const [countingSequence, setCountingSequence] = useState<number[]>(savedState.countingSequence);
  const [countingIdx, setCountingIdx]       = useState(savedState.countingIdx);

  // Level 2 sequence variety
  const [seqStep, setSeqStep]             = useState(savedState.seqStep);
  const [seqDirection, setSeqDirection]   = useState<'asc' | 'desc'>(savedState.seqDirection);

  // XP
  const [progress, setProgressState] = useState<UserProgress>(getProgress());
  const [earnedXp, setEarnedXp]       = useState<number | null>(null);

  // ── Persist state to module-level ref on every change ───────────────────────
  useEffect(() => {
    Object.assign(savedState, {
      gameMode, level, targetNumber, questionCount,
      missingSequence, missingIndex, seqHint,
      mathEq, difficulty, selectedOps: Array.from(selectedOps),
      countingSubmode, countingSequence, countingIdx,
      seqStep, seqDirection,
    });
  }, [gameMode, level, targetNumber, questionCount, missingSequence, missingIndex,
      seqHint, mathEq, difficulty, selectedOps, countingSubmode, countingSequence,
      countingIdx, seqStep, seqDirection]);

  // ── Build the counting sequence for a given submode ─────────────────────────
  const buildCountingSequence = (sub: CountingSubmode): number[] => {
    switch (sub) {
      case 'forward': return [1, 2, 3, 4, 5, 6, 7, 8, 9];
      case 'reverse': return [9, 8, 7, 6, 5, 4, 3, 2, 1];
      case 'skip2':   return [2, 4, 6, 8];
      case 'random':  {
        // Generate 5 unique random numbers from 0-9 for a quick drill.
        const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return pool.slice(0, 5);
      }
    }
  };

  // ── Initialise on level change ──────────────────────────────────────────────
  useEffect(() => {
    dispatch(setSignMode('numbers'));
    dispatch(clearText());
    prevTextLen.current = 0;
    setShowHint(false);
    setShowWrong(false);

    if (level === 1) {
      const seq = buildCountingSequence(countingSubmode);
      setCountingSequence(seq);
      setCountingIdx(0);
      setTargetNumber(seq[0]);
      dispatch(setTargetLetter(seq[0].toString()));
    } else if (level === 2) {
      generateSeq();
    } else {
      generateMath();
    }

    return () => {
      dispatch(setTargetLetter(null));
      savedState = INITIAL_SAVED_STATE();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // ── Sequence generator (Level 2) ────────────────────────────────────────────
  const generateSeq = () => {
    const def = generateSequenceDef(seqStep, seqDirection);
    setMissingSequence(def.numbers);
    setMissingIndex(def.hiddenIdx);
    setSeqHint(def.hint);
    setTargetNumber(def.numbers[def.hiddenIdx]);
    dispatch(setTargetLetter(def.numbers[def.hiddenIdx].toString()));
    setShowHint(false);
    setShowWrong(false);
  };

  // ── Math generator (Level 3) ────────────────────────────────────────────────
  const generateMath = () => {
    const eq = generateQuestion(difficulty, Array.from(selectedOps));
    setMathEq(eq);
    setTargetNumber(eq.answer);
    dispatch(setTargetLetter(eq.answer.toString()));
    setShowHint(false);
    setShowWrong(false);
  };

  // ── Mode switching ─────────────────────────────────────────────────────────
  const switchMode = (mode: GameMode) => {
    if (mode === gameMode) return;
    setGameMode(mode);
    setQuestionCount(0);
    setShowHint(false);
    setShowWrong(false);
    dispatch(clearText());
    prevTextLen.current = 0;
    digitBufferRef.current = '';
    if (mode === 'counting') {
      setLevel(1);
      const seq = buildCountingSequence(countingSubmode);
      setCountingSequence(seq);
      setCountingIdx(0);
      setTargetNumber(seq[0]);
    } else {
      setLevel(3);
    }
  };

  // ── Counting submode change ─────────────────────────────────────────────────
  const switchCountingSubmode = (sub: CountingSubmode) => {
    if (sub === countingSubmode) return;
    setCountingSubmode(sub);
    setQuestionCount(0);
    setShowWrong(false);
    dispatch(clearText());
    prevTextLen.current = 0;
    digitBufferRef.current = '';
    const seq = buildCountingSequence(sub);
    setCountingSequence(seq);
    setCountingIdx(0);
    setTargetNumber(seq[0]);
    dispatch(setTargetLetter(seq[0].toString()));
  };

  // ── Regenerate math when settings change ────────────────────────────────────
  useEffect(() => {
    if (gameMode === 'math') generateMath();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, selectedOps]);

  // ── Regenerate sequence when step/direction changes ─────────────────────────
  useEffect(() => {
    if (level === 2) generateSeq();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seqStep, seqDirection]);

  // ═════════════════════════════════════════════════════════════════════════════
  // Core answer-checking effect  (digit-buffer approach)
  //
  // Each time the camera commits a recognised digit, `text` grows by one
  // character.  We append ONLY the new character(s) to a local digit buffer
  // and match the accumulated string against the target number.
  //
  // This is robust to clearText() being called asynchronously (e.g. the 1.5 s
  // post-success timeout) because we never re-read the full text — we only
  // ever consume the delta.
  // ═════════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    // Only process text that is LONGER than last time (new digit signed).
    if (text.length <= prevTextLen.current || showSuccess) {
      prevTextLen.current = text.length;
      return;
    }

    // Append only the newly-added characters to our local digit buffer.
    const newChars = text.slice(prevTextLen.current);
    prevTextLen.current = text.length;

    for (const ch of newChars) {
      // Only keep ASCII digit characters (0-9).
      if (ch >= '0' && ch <= '9') {
        digitBufferRef.current += ch;
      }
    }

    const buf = digitBufferRef.current;
    const targetStr = targetNumber.toString();

    if (buf === targetStr) {
      // ── Correct answer ──────────────────────────────────────────────────
      setShowSuccess(true);
      setShowWrong(false);
      playSuccessSound();

      const xpGained = level <= 2 ? 10 : MATH_XP[difficulty];
      const newProgress = addXp(xpGained);
      setProgressState(newProgress);
      setEarnedXp(xpGained);

      setTimeout(() => {
        setShowSuccess(false);
        setEarnedXp(null);
        dispatch(clearText());
        prevTextLen.current = 0;
        digitBufferRef.current = '';

        if (level === 1) {
          const nextIdx = countingIdx + 1;
          if (nextIdx < countingSequence.length) {
            setCountingIdx(nextIdx);
            setTargetNumber(countingSequence[nextIdx]);
            dispatch(setTargetLetter(countingSequence[nextIdx].toString()));
          } else {
            setLevel(2);
            setQuestionCount(0);
            playBossWinSound();
            setProgressState(addXp(50));
          }
        } else if (gameMode === 'counting') {
          if (questionCount >= 2) {
            setLevel(1);
            setQuestionCount(0);
            playBossWinSound();
            setProgressState(addXp(100));
          } else {
            setQuestionCount((qc) => qc + 1);
            generateSeq();
          }
        } else {
          if (questionCount >= 2) {
            setQuestionCount(0);
            playBossWinSound();
            setProgressState(addXp(100));
            generateMath();
          } else {
            setQuestionCount((qc) => qc + 1);
            generateMath();
          }
        }
      }, 1500);
    } else if (!showWrong && buf.length >= targetStr.length) {
      // ── Wrong answer ────────────────────────────────────────────────────
      // Only flag wrong when the buffer has at LEAST as many digits as the
      // target.  For a target like 15 the first signed "1" fills only one
      // slot — we wait for the second digit before judging.
      setShowWrong(true);
      playErrorSound();
      setTimeout(() => {
        setShowWrong(false);
        dispatch(clearText());
        prevTextLen.current = 0;
        digitBufferRef.current = '';
      }, 1500);
    }
  }, [text, targetNumber, showSuccess, showWrong, level, gameMode, questionCount,
      dispatch, countingIdx, countingSequence, difficulty]);

  // ─── UI helpers ─────────────────────────────────────────────────────────────
  const getLevelTitle = () => {
    if (level === 1) {
      const sub = COUNTING_SUBMODES.find((s) => s.id === countingSubmode);
      return sub ? `${sub.emoji} ${sub.label}` : 'Count with me!';
    }
    if (level === 2) return 'Fill the Blank!';
    const opNames: Record<MathOp, string> = {
      '+': 'Addition', '-': 'Subtraction', '×': 'Multiplication', '÷': 'Division',
    };
    return `${opNames[mathEq.op]} Time!`;
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // Render
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-cyan-100 text-cyan-600 font-black px-4 py-2 rounded-xl text-lg flex items-center gap-2">
            ⭐ Lvl {progress.level}
          </div>
          <div className="text-slate-500 font-bold">{progress.xp} XP</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-orange-500 font-black text-xl">🔥 {progress.dailyStreak} Day Streak</div>
          <div className="bg-cyan-50 text-cyan-600 font-black px-4 py-2 rounded-xl shadow-inner border-2 border-cyan-100">
            {gameMode === 'counting' ? `Counting · Lvl ${level}` : 'Math Challenge'}
          </div>
        </div>
      </div>

      {/* ── Game mode selector ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-slate-500">Game Mode:</span>
        <button
          onClick={() => switchMode('counting')}
          disabled={showSuccess}
          className={`px-5 py-2.5 rounded-full text-sm font-black transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
            gameMode === 'counting'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🔢 Count with Me
        </button>
        <button
          onClick={() => switchMode('math')}
          disabled={showSuccess}
          className={`px-5 py-2.5 rounded-full text-sm font-black transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
            gameMode === 'math'
              ? 'bg-gradient-to-r from-violet-400 to-fuchsia-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ➕ Math Challenge
        </button>
      </div>

      {/* ── Counting submode selector (Level 1 only) ────────────────────────── */}
      {gameMode === 'counting' && level === 1 && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">Counting Style:</span>
          {COUNTING_SUBMODES.map((sub) => (
            <button
              key={sub.id}
              onClick={() => switchCountingSubmode(sub.id)}
              disabled={showSuccess}
              className={`px-4 py-2 rounded-full text-sm font-black transition-all duration-200 disabled:opacity-60 ${
                countingSubmode === sub.id
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub.emoji} {sub.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Sequence settings (Level 2 only) ────────────────────────────────── */}
      {gameMode === 'counting' && level === 2 && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">Pattern:</span>
          {SEQ_PRESETS.map((preset) => {
            const isActive = seqStep === preset.step && seqDirection === preset.direction;
            return (
              <button
                key={preset.label}
                onClick={() => { setSeqStep(preset.step); setSeqDirection(preset.direction); }}
                disabled={showSuccess}
                className={`px-4 py-2 rounded-full text-sm font-black transition-all duration-200 disabled:opacity-60 ${
                  isActive
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Math settings (math mode only) ──────────────────────────────────── */}
      {gameMode === 'math' && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Math Challenge Settings</span>

          {/* Difficulty */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-500">Difficulty:</span>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
              const xp = MATH_XP[d];
              return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-full text-sm font-black transition-all duration-200 ${
                    difficulty === d
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                  <span className="ml-1 text-xs opacity-70">({xp} XP)</span>
                </button>
              );
            })}
          </div>

          {/* Operation selection */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-500">Practice:</span>
            <button
              onClick={() => setSelectedOps(new Set(ALL_OPERATIONS))}
              className={`px-4 py-2 rounded-full text-sm font-black transition-all duration-200 ${
                selectedOps.size === ALL_OPERATIONS.length
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {ALL_OPERATIONS.map((op) => {
              const isActive = selectedOps.has(op);
              const label = op === '+' ? 'Addition' : op === '-' ? 'Subtraction' : op === '×' ? 'Multiplication' : 'Division';
              return (
                <button
                  key={op}
                  onClick={() => {
                    const next = new Set(selectedOps);
                    if (isActive) { if (next.size > 1) next.delete(op); }
                    else { next.add(op); }
                    setSelectedOps(next);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-black transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Hard-mode hint */}
          {difficulty === 'hard' && (
            <p className="text-xs text-slate-400 font-bold italic">
              Hard mode may produce answers up to 18 — sign each digit separately (e.g. "1" then "5" for 15).
            </p>
          )}
        </div>
      )}

      {/* ── Main game area ──────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 w-full">
        <div className="w-full lg:w-[40%] flex flex-col gap-6">
          <div className="bg-white rounded-[3rem] p-8 lg:p-10 border-8 border-cyan-100 shadow-2xl shadow-cyan-500/20 relative overflow-hidden flex flex-col items-center text-center animate-float">

            <div className="w-full flex items-center justify-center mb-8 gap-4">
              <span className="text-4xl">🦉</span>
              <h2 className="text-2xl font-black text-slate-600">{getLevelTitle()}</h2>
            </div>

            {/* ── Level 1: Counting display ──────────────────────────────────── */}
            {level === 1 ? (
              <>
                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2 mb-8 relative w-full h-12">
                  <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-300 -translate-y-1/2 rounded-full" />
                  <div className="relative z-10 flex w-full justify-between px-2">
                    {countingSequence.map((num, idx) => (
                      <div
                        key={idx}
                        className={`w-8 h-8 rounded-full shadow-[inset_0_-4px_4px_rgba(0,0,0,0.15)] border-2 transition-all duration-500 flex items-center justify-center text-xs font-black ${
                          idx < countingIdx
                            ? 'bg-yellow-400 border-yellow-500 text-white'
                            : idx === countingIdx && showSuccess
                              ? 'bg-green-400 border-green-500 scale-110 text-white'
                              : idx === countingIdx
                                ? 'bg-yellow-400 border-yellow-500 animate-pulse text-yellow-700'
                                : 'bg-slate-100 border-slate-300 text-slate-400'
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`text-[10rem] leading-none font-black my-4 transition-all duration-300 ${
                  showSuccess ? 'text-green-500 scale-125 rotate-12' : 'text-cyan-500'
                }`}>
                  {targetNumber}
                </div>
              </>

            /* ── Level 2: Sequence display ──────────────────────────────────── */
            ) : level === 2 ? (
              <>
                <div className="flex items-center justify-center gap-4 mb-8 bg-slate-50 p-6 rounded-3xl border-4 border-slate-100 w-full">
                  {missingSequence.map((num, idx) => (
                    <div
                      key={idx}
                      className="flex-1 flex items-center justify-center aspect-square rounded-2xl bg-white shadow-md border-2 border-slate-200 text-3xl font-black text-slate-600 transition-all duration-300"
                    >
                      {idx === missingIndex
                        ? (showSuccess
                            ? <span className="text-green-500 scale-125 inline-block">{num}</span>
                            : <span className="text-rose-400 animate-bounce inline-block">?</span>)
                        : num}
                    </div>
                  ))}
                </div>
                {/* Sequence pattern hint */}
                <p className="text-sm font-bold text-slate-400 mb-4">{seqHint}</p>
              </>

            /* ── Level 3: Math display ──────────────────────────────────────── */
            ) : (
              <>
                {/* Digit slot indicators for multi-digit answers */}
                {targetNumber.toString().length > 1 && !showSuccess && (
                  <div className="flex items-center justify-center gap-3 mb-6">
                    {targetNumber.toString().split('').map((_digit, i) => (
                      <div
                        key={i}
                        className={`w-14 h-16 flex items-center justify-center rounded-2xl border-4 text-3xl font-black transition-all duration-300 ${
                          i < digitBufferRef.current.length
                            ? 'bg-cyan-100 border-cyan-300 text-cyan-600 scale-105'
                            : 'bg-white border-slate-200 text-slate-300'
                        }`}
                      >
                        {i < digitBufferRef.current.length ? digitBufferRef.current[i] : '?'}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 bg-slate-50 p-6 rounded-3xl border-4 border-slate-100 w-full text-4xl sm:text-5xl font-black text-slate-600 flex-wrap">
                  <span>{mathEq.a}</span>
                  <span className="text-cyan-400">{mathEq.op}</span>
                  <span>{mathEq.b}</span>
                  <span className="text-cyan-400">=</span>
                  <div className="w-20 h-20 flex items-center justify-center bg-white rounded-2xl shadow-inner border-4 border-slate-200">
                    {showSuccess
                      ? <span className="text-green-500 scale-125 transition-transform">{targetNumber}</span>
                      : <span className="text-rose-400 animate-pulse">?</span>}
                  </div>
                </div>
                {targetNumber > 9 && !showSuccess && (
                  <p className="text-xs font-bold text-cyan-500 mb-2">
                    Sign each digit: "{targetNumber.toString()[0]}" then "{targetNumber.toString()[1]}"
                  </p>
                )}
              </>
            )}

            {/* ── Hint button (levels 2+) ──────────────────────────────────── */}
            {level > 1 && !showSuccess && (
              <div className="flex flex-col items-center gap-2 mb-4 w-full">
                <button
                  onClick={() => setShowHint((h) => !h)}
                  className="px-5 py-2 rounded-full bg-amber-50 border-2 border-amber-200 text-amber-600 font-bold text-sm hover:bg-amber-100 hover:border-amber-300 transition-all duration-200 active:scale-95"
                >
                  {showHint ? '🙈 Hide Hint' : '💡 Show Hint'}
                </button>
                {showHint && (
                  <div className="bg-amber-50 border-4 border-amber-200 text-amber-700 font-black px-6 py-3 rounded-2xl text-2xl">
                    Answer: {targetNumber}
                  </div>
                )}
              </div>
            )}

            {/* ── Success / Wrong banners ────────────────────────────────────── */}
            {showSuccess ? (
              <div className="bg-green-100 border-4 border-green-200 text-green-700 font-bold px-6 py-4 rounded-2xl w-full animate-bounce text-lg flex justify-between items-center">
                <span>🎉 Perfect!</span>
                {earnedXp && <span className="text-xl">+{earnedXp} XP</span>}
              </div>
            ) : showWrong ? (
              <div className="bg-rose-100 border-4 border-rose-200 text-rose-700 font-bold px-6 py-4 rounded-2xl w-full animate-bounce text-lg flex justify-between items-center">
                <span>❌ Not quite — try again!</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="w-full lg:w-[60%]">
          <CameraView />
        </div>
      </div>
    </div>
  );
};
