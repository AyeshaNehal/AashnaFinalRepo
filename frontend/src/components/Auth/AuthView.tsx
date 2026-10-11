import React, { useState } from 'react';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { syncProgressFromCloud } from '../../services/progressService';

interface AuthViewProps {
  /** Called when the user authenticates. asGuest=true for guest sessions. */
  onLogin: (asGuest: boolean) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email && password) {
      setLoading(true);
      try {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
        }
        await syncProgressFromCloud();
        onLogin(false); // authenticated user
      } catch (err: any) {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      await syncProgressFromCloud();
      onLogin(false); // authenticated user
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestPlay = () => {
    if (loading) return; // prevent action while an auth request is in-flight
    onLogin(true); // guest session — no Firebase auth, no progress sync
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-[3rem] p-6 sm:p-8 lg:p-12 border-4 sm:border-8 border-violet-100 shadow-[0_20px_50px_-12px_rgba(139,92,246,0.3)] w-full max-w-md relative overflow-hidden flex flex-col items-center">

        {/* Mascot — smaller on mobile so the whole card fits without scrolling */}
        <div className="text-5xl sm:text-8xl mb-4 sm:mb-6">
          🦉
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-700 mb-1 sm:mb-2 text-center">
          {isLogin ? "Welcome Back!" : "Start Learning!"}
        </h1>
        <p className="text-slate-500 font-bold mb-2 sm:mb-3 text-center text-sm sm:text-base">
          {isLogin
            ? "Log in to keep your streak alive."
            : "Create an account to track your progress."}
        </p>

        {/* Value proposition */}
        <p className="text-slate-400 text-xs sm:text-sm font-semibold text-center mb-4 sm:mb-5 px-2 leading-relaxed">
          Learn ASL with your camera — practice signs, explore flashcards, and play interactive games.
        </p>

        {error && (
          <div className="w-full bg-red-50 text-red-500 text-sm font-bold px-4 py-3 rounded-xl mb-4 border border-red-200 text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border-4 border-slate-100 text-slate-600 font-black text-base sm:text-lg py-3 sm:py-4 rounded-2xl mb-5 sm:mb-6 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 hover:border-slate-200 shadow-sm touch-target"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 sm:w-6 sm:h-6" />
          Continue with Google
        </button>

        <div className="w-full flex items-center gap-4 mb-5 sm:mb-6">
          <div className="h-0.5 bg-slate-100 flex-1"></div>
          <span className="text-slate-300 font-black text-sm uppercase">OR</span>
          <div className="h-0.5 bg-slate-100 flex-1"></div>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-wider ml-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-slate-50 border-4 border-slate-100 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 font-bold text-slate-700 focus:outline-none focus:border-violet-300 transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-wider ml-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border-4 border-slate-100 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 font-bold text-slate-700 focus:outline-none focus:border-violet-300 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black text-lg sm:text-xl py-3 sm:py-4 rounded-2xl mt-3 sm:mt-4 shadow-lg shadow-violet-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 touch-target"
          >
            {loading ? "..." : (isLogin ? "LOG IN" : "CREATE ACCOUNT")}
          </button>
        </form>

        <div className="mt-6 text-slate-500 font-bold flex items-center gap-2 text-sm sm:text-base flex-wrap justify-center text-center">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-violet-500 hover:text-violet-600 active:scale-95 transition-transform font-black"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>

        {/* Guest Mode — secondary outlined button for clear tap target */}
        <button
          onClick={handleGuestPlay}
          disabled={loading}
          className="mt-4 sm:mt-6 w-full border-2 border-slate-200 text-slate-500 font-black text-sm sm:text-base py-3 sm:py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-target"
        >
          <span>👤</span>
          Play as Guest
          <span className="text-xs font-semibold text-slate-400 ml-1">(progress won't save)</span>
        </button>

      </div>
    </div>
  );
};
