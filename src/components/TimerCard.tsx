import React, { useState, useEffect, useRef } from 'react';
import { Subject, Language, TimerMode, AmbientSoundType } from '../types';
import { formatTimerTime, toBengaliDigits } from '../utils/bengaliNumerals';
import { playChime, playAmbientSound, stopAmbientSound, setAmbientVolume } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Maximize2,
  Volume2,
  VolumeX,
  CloudRain,
  Radio,
  Wind,
  Sparkles,
  BookOpen,
  Coffee,
  Flame,
} from 'lucide-react';

interface TimerCardProps {
  lang: Language;
  subjects: Subject[];
  onSaveSession: (session: {
    subjectId: string;
    subjectName: string;
    durationSeconds: number;
    notes?: string;
    mode: TimerMode;
  }) => void;
  onOpenZenMode: (timerState: {
    seconds: number;
    isRunning: boolean;
    mode: TimerMode;
    subjectName: string;
    onToggle: () => void;
  }) => void;
}

export const TimerCard: React.FC<TimerCardProps> = ({
  lang,
  subjects,
  onSaveSession,
  onOpenZenMode,
}) => {
  const isBn = lang === 'bn';

  // Timer modes: 'stopwatch' (default matching user snippet), 'pomodoro', 'custom'
  const [mode, setMode] = useState<TimerMode>('stopwatch');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'general');
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Pomodoro sub-modes: 25m focus, 5m short break, 15m long break
  const [pomoPhase, setPomoPhase] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');

  // Elapsed seconds for stopwatch, or remaining seconds for countdown
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [customMinutes, setCustomMinutes] = useState<number>(30);

  // Sound settings
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [ambientVol, setAmbientVol] = useState<number>(0.25);
  const [soundBellEnabled, setSoundBellEnabled] = useState<boolean>(true);

  // Interval reference
  const timerRef = useRef<number | null>(null);

  // Reset or initialize mode
  const initModeSeconds = (targetMode: TimerMode, phase: 'focus' | 'shortBreak' | 'longBreak' = pomoPhase) => {
    setIsRunning(false);
    if (targetMode === 'stopwatch') {
      setSeconds(0);
    } else if (targetMode === 'pomodoro') {
      if (phase === 'focus') setSeconds(25 * 60);
      else if (phase === 'shortBreak') setSeconds(5 * 60);
      else if (phase === 'longBreak') setSeconds(15 * 60);
    } else if (targetMode === 'custom') {
      setSeconds(customMinutes * 60);
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    initModeSeconds(newMode);
  };

  const handlePomoPhaseChange = (phase: 'focus' | 'shortBreak' | 'longBreak') => {
    setPomoPhase(phase);
    setIsRunning(false);
    if (phase === 'focus') setSeconds(25 * 60);
    else if (phase === 'shortBreak') setSeconds(5 * 60);
    else if (phase === 'longBreak') setSeconds(15 * 60);
  };

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => {
          if (mode === 'stopwatch') {
            return prev + 1;
          } else {
            // countdown
            if (prev <= 1) {
              // Timer finished!
              clearInterval(timerRef.current!);
              setIsRunning(false);
              if (soundBellEnabled) {
                playChime();
              }
              try {
                confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
              } catch {
                // ignore
              }
              return 0;
            }
            return prev - 1;
          }
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, soundBellEnabled]);

  // Ambient sound management
  useEffect(() => {
    if (isRunning && ambientSound !== 'none') {
      playAmbientSound(ambientSound, ambientVol);
    } else {
      stopAmbientSound();
    }
    return () => {
      stopAmbientSound();
    };
  }, [isRunning, ambientSound]);

  const handleVolumeChange = (vol: number) => {
    setAmbientVol(vol);
    setAmbientVolume(vol);
  };

  // Start / Pause / Reset (matches user's startTimer, pauseTimer, resetTimer)
  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    initModeSeconds(mode);
  };

  // Save session to history
  const handleSaveSession = () => {
    const selectedSub = subjects.find((s) => s.id === selectedSubjectId);
    const subName = selectedSub ? (isBn ? selectedSub.nameBn : selectedSub.nameEn) : (isBn ? 'সাধারণ স্টাডি' : 'General Study');

    let durationToLog = seconds;
    if (mode === 'pomodoro') {
      const initial = pomoPhase === 'focus' ? 25 * 60 : pomoPhase === 'shortBreak' ? 5 * 60 : 15 * 60;
      durationToLog = Math.max(1, initial - seconds);
    } else if (mode === 'custom') {
      durationToLog = Math.max(1, customMinutes * 60 - seconds);
    }

    if (durationToLog < 5 && mode === 'stopwatch') {
      alert(isBn ? 'সেশন সেভ করতে অন্তত ৫ সেকেন্ড স্টাডি করুন!' : 'Study for at least 5 seconds to save a session!');
      return;
    }

    onSaveSession({
      subjectId: selectedSubjectId,
      subjectName: subName,
      durationSeconds: durationToLog,
      notes: sessionNotes.trim() || undefined,
      mode,
    });

    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch {
      // ignore
    }

    // Reset notes & timer
    setSessionNotes('');
    resetTimer();
  };

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  return (
    <div className="card rounded-2xl bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm border border-[var(--border-color)] transition-colors duration-200">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3.5 mb-4">
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
          <span>⏱️</span>
          <span>{isBn ? 'স্টাডি সেশন টাইমার (Self Tracker)' : 'Study Session Timer'}</span>
        </h2>

        {/* Modes: Stopwatch / Pomodoro / Custom */}
        <div className="flex items-center rounded-lg bg-[var(--bg-subtle)] p-1 text-xs font-semibold gap-1">
          <button
            onClick={() => handleModeChange('stopwatch')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              mode === 'stopwatch'
                ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {isBn ? 'স্টপওয়াচ' : 'Stopwatch'}
          </button>
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              mode === 'pomodoro'
                ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            🍅 {isBn ? 'পোমোডোরো' : 'Pomodoro'}
          </button>
          <button
            onClick={() => handleModeChange('custom')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              mode === 'custom'
                ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {isBn ? 'কাস্টম' : 'Custom'}
          </button>
        </div>
      </div>

      {/* Pomodoro Sub-Phases if pomodoro is active */}
      {mode === 'pomodoro' && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => handlePomoPhaseChange('focus')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
              pomoPhase === 'focus'
                ? 'bg-rose-500 text-white font-semibold shadow-sm'
                : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
            }`}
          >
            🎯 {isBn ? '২৫ মিনিট ফোকাস' : '25m Focus'}
          </button>
          <button
            onClick={() => handlePomoPhaseChange('shortBreak')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
              pomoPhase === 'shortBreak'
                ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
            }`}
          >
            ☕ {isBn ? '৫ মিনিট বিরতি' : '5m Short Break'}
          </button>
          <button
            onClick={() => handlePomoPhaseChange('longBreak')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
              pomoPhase === 'longBreak'
                ? 'bg-blue-500 text-white font-semibold shadow-sm'
                : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
            }`}
          >
            🌿 {isBn ? '১৫ মিনিট দীর্ঘ বিরতি' : '15m Long Break'}
          </button>
        </div>
      )}

      {/* Custom Timer Input */}
      {mode === 'custom' && (
        <div className="flex items-center justify-center gap-2 mb-4 text-xs sm:text-sm">
          <span className="text-[var(--text-muted)]">{isBn ? 'সময় নির্ধারণ করুন:' : 'Set minutes:'}</span>
          {[15, 30, 45, 60, 90].map((mins) => (
            <button
              key={mins}
              onClick={() => {
                setCustomMinutes(mins);
                setIsRunning(false);
                setSeconds(mins * 60);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                customMinutes === mins
                  ? 'border-[var(--primary)] bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold'
                  : 'border-[var(--border-color)] text-[var(--text-muted)]'
              }`}
            >
              {isBn ? `${toBengaliDigits(mins)} মি.` : `${mins}m`}
            </button>
          ))}
        </div>
      )}

      {/* Subject Tag Selector for current session */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--bg-subtle)] mb-5">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)]">
          <BookOpen className="w-4 h-4 text-[var(--primary)]" />
          <span>{isBn ? 'যে বিষয় পড়ছেন:' : 'Subject:'}</span>
        </div>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="text-xs sm:text-sm font-semibold py-1 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {isBn ? s.nameBn : s.nameEn}
            </option>
          ))}
        </select>
      </div>

      {/* Big Timer Display (matches user's class timer-display) */}
      <div className="relative py-4 text-center">
        <div
          id="timer"
          className="timer-display text-5xl sm:text-6xl md:text-7xl font-mono font-bold tracking-wider text-[var(--primary)] drop-shadow-sm transition-all"
        >
          {formatTimerTime(seconds, isBn)}
        </div>
        <div className="text-xs sm:text-sm text-[var(--text-muted)] font-medium mt-1">
          {isRunning ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              {isBn ? 'সেশন চলমান রয়েছে...' : 'Session in progress...'}
            </span>
          ) : (
            <span>{isBn ? 'প্রস্তুত হলে শুরু করুন' : 'Ready to start focus'}</span>
          )}
        </div>

        {/* Zen full-screen button */}
        <button
          onClick={() =>
            onOpenZenMode({
              seconds,
              isRunning,
              mode,
              subjectName: isBn ? activeSubject?.nameBn : activeSubject?.nameEn,
              onToggle: () => setIsRunning((r) => !r),
            })
          }
          title={isBn ? 'পূর্ণ স্ক্রিন জেন মোড' : 'Fullscreen Zen Mode'}
          className="absolute right-2 top-2 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-subtle)] transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Controls: Start, Pause, Reset (matching exact user buttons) */}
      <div className="btn-group flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 my-5">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="btn-primary flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] shadow-md shadow-indigo-500/20 active:scale-95 transition-all text-sm sm:text-base cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isBn ? 'শুরু করুন' : 'Start'}</span>
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="btn-danger flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 active:scale-95 transition-all text-sm sm:text-base cursor-pointer"
          >
            <Pause className="w-4 h-4 fill-white" />
            <span>{isBn ? 'থামুন' : 'Pause'}</span>
          </button>
        )}

        <button
          onClick={resetTimer}
          className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--bg-subtle)] active:scale-95 transition-all text-sm cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-[var(--text-muted)]" />
          <span>{isBn ? 'রিসেট' : 'Reset'}</span>
        </button>

        {/* Save Session Button */}
        {seconds > 0 && (
          <button
            onClick={handleSaveSession}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95 transition-all text-sm cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isBn ? 'সেশন সংরক্ষণ' : 'Save Session'}</span>
          </button>
        )}
      </div>

      {/* Session Notes input */}
      <div className="mb-4">
        <input
          type="text"
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder={
            isBn
              ? 'সেশনের নোট (ঐচ্ছিক, যেমন: ত্রিকোণমিতি অধ্যায় ৯ অনুশীলনী সমাধান)'
              : 'Session topic note (optional, e.g. Trigonometry exercise 9)'
          }
          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] placeholder:text-[var(--text-muted)]"
        />
      </div>

      {/* Ambient Focus Sounds & Chime Controls */}
      <div className="pt-3 border-t border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[var(--text-muted)] font-medium flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-[var(--primary)]" />
            {isBn ? 'ফোকাস সাউন্ড:' : 'Ambient Sound:'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAmbientSound('none')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                ambientSound === 'none'
                  ? 'bg-[var(--bg-subtle)] text-[var(--primary)] font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {isBn ? 'বন্ধ' : 'Off'}
            </button>
            <button
              onClick={() => setAmbientSound('rain')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                ambientSound === 'rain'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <CloudRain className="w-3 h-3" />
              {isBn ? 'বৃষ্টি' : 'Rain'}
            </button>
            <button
              onClick={() => setAmbientSound('whitenoise')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                ambientSound === 'whitenoise'
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Wind className="w-3 h-3" />
              {isBn ? 'হোয়াইট নয়েজ' : 'White Noise'}
            </button>
            <button
              onClick={() => setAmbientSound('binaural')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                ambientSound === 'binaural'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              {isBn ? '৪০Hz গামা' : '40Hz Gamma'}
            </button>
          </div>
        </div>

        {ambientSound !== 'none' && (
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <input
              type="range"
              min="0.05"
              max="0.8"
              step="0.05"
              value={ambientVol}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 accent-[var(--primary)] h-1 cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};
