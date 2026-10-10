import React, { useEffect } from 'react';
import { Language, TimerMode } from '../types';
import { formatTimerTime } from '../utils/bengaliNumerals';
import { Minimize2, Play, Pause, Sparkles } from 'lucide-react';

interface ZenModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  seconds: number;
  isRunning: boolean;
  mode: TimerMode;
  subjectName: string;
  onToggleTimer: () => void;
  quoteBn: string;
  quoteEn: string;
}

export const ZenModeModal: React.FC<ZenModeModalProps> = ({
  isOpen,
  onClose,
  lang,
  seconds,
  isRunning,
  mode,
  subjectName,
  onToggleTimer,
  quoteBn,
  quoteEn,
}) => {
  const isBn = lang === 'bn';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/95 backdrop-blur-md text-white p-6 sm:p-10 select-none animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-sm font-semibold tracking-wide text-slate-300 uppercase">
            {subjectName} • {isBn ? 'গভীর মনোযোগ মোড (Zen Focus)' : 'Deep Focus Mode'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
        >
          <Minimize2 className="w-4 h-4" />
          <span>{isBn ? 'প্রস্থান (Esc)' : 'Exit (Esc)'}</span>
        </button>
      </div>

      {/* Main Focus Clock */}
      <div className="flex flex-col items-center text-center my-auto">
        {/* Soft breathing pulse ring */}
        <div className="relative flex items-center justify-center mb-6">
          <div
            className={`absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-indigo-500/10 transition-all duration-1000 ${
              isRunning ? 'scale-110 opacity-70' : 'scale-100 opacity-30'
            }`}
          ></div>
          <div className="relative z-10 text-6xl sm:text-8xl md:text-9xl font-mono font-bold tracking-tight text-white drop-shadow-2xl">
            {formatTimerTime(seconds, isBn)}
          </div>
        </div>

        {/* Motivational Status */}
        <div className="text-slate-400 text-sm sm:text-base font-medium mb-8">
          {isRunning ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-2 justify-center">
              <span>🧘</span>
              <span>{isBn ? 'মনোযোগ ধরে রাখুন, আপনি এগিয়ে যাচ্ছেন!' : 'Stay immersed in your study flow...'}</span>
            </span>
          ) : (
            <span>{isBn ? 'টাইমার সাময়িক বিরতিতে রয়েছে' : 'Timer is paused'}</span>
          )}
        </div>

        {/* Start / Pause Control */}
        <button
          onClick={onToggleTimer}
          className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-base font-bold transition-all shadow-xl active:scale-95 cursor-pointer ${
            isRunning
              ? 'bg-rose-500/90 hover:bg-rose-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-white" />
              <span>{isBn ? 'বিরতি নিন' : 'Pause Session'}</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white" />
              <span>{isBn ? 'চালিয়ে যান' : 'Resume Focus'}</span>
            </>
          )}
        </button>
      </div>

      {/* Motivational Quote at Bottom */}
      <div className="max-w-xl text-center">
        <p className="text-sm sm:text-base text-slate-300 italic font-medium">
          "{isBn ? quoteBn : quoteEn}"
        </p>
      </div>
    </div>
  );
};
