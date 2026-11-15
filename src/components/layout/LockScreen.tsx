import React, { useState, useEffect } from 'react';
import { Lock, Delete, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

interface LockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
  correctPin?: string;
  agencyName: string;
  userEmail?: string;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  isLocked,
  onUnlock,
  correctPin = '1995',
  agencyName,
  userEmail = 'aniketkorade1995@gmail.com',
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // Physical keyboard listener for fast typing
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        handleVerify();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, pin, correctPin]);

  if (!isLocked) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const next = pin + digit;
      setPin(next);
      setError(false);
      if (next === correctPin) {
        setPin('');
        onUnlock();
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleVerify = () => {
    if (pin === correctPin) {
      setPin('');
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2.5 min-[360px]:p-4 select-none animate-fade-in overflow-y-auto">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 min-[360px]:p-6 sm:p-7 shadow-2xl text-center my-auto">
        {/* Lock Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-3 shadow-inner">
          <Lock className="w-6 h-6" />
        </div>

        <h2 className="text-base font-bold text-white tracking-tight">{agencyName}</h2>
        <p className="text-xs text-blue-400 font-medium mt-0.5">Agency Sign In & Security Lock</p>

        {/* Authenticated Account Badge */}
        <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 font-mono">
          <Mail className="w-3 h-3 text-blue-400 shrink-0" />
          <span className="truncate max-w-[210px]">{userEmail}</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Enter 4-digit security PIN to log in</p>

        {/* PIN Indicator Dots */}
        <div className="flex justify-center gap-3 my-5">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                pin.length > idx
                  ? 'bg-blue-500 scale-110 shadow-md shadow-blue-500/50'
                  : 'bg-slate-700 border border-slate-600/40'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-400 font-medium mb-3 animate-shake">
            Incorrect PIN. Default is {correctPin}. Try again.
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white text-lg font-semibold border border-slate-700/60 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleDelete}
            title="Delete digit"
            className="h-12 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700/40 active:scale-95 transition-all cursor-pointer"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white text-lg font-semibold border border-slate-700/60 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleVerify}
            title="Unlock application"
            className="h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-md shadow-blue-900/50"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Credentials & Device Info */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Device Storage</span>
          </span>
          <span>
            PIN: <span className="font-mono text-slate-400">{correctPin}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
