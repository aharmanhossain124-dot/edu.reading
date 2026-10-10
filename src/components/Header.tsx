import React from 'react';
import { Language, ThemeMode } from '../types';
import { toBengaliDigits } from '../utils/bengaliNumerals';
import { Flame, Clock, CheckCircle2, Moon, Sun, Sparkles, Download, Upload, RotateCcw } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  streakDays: number;
  todaySeconds: number;
  completedTasksCount: number;
  totalTasksCount: number;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  theme,
  setTheme,
  streakDays,
  todaySeconds,
  completedTasksCount,
  totalTasksCount,
  onResetData,
  onExportData,
  onImportData,
}) => {
  const isBn = lang === 'bn';

  const todayHours = (todaySeconds / 3600).toFixed(1);
  const todayMinutes = Math.floor(todaySeconds / 60);

  return (
    <header className="mb-6 rounded-2xl bg-[var(--bg-card)] p-4 sm:p-5 shadow-sm border border-[var(--border-color)] transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center text-2xl shadow-inner font-bold">
            📖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--primary)] flex items-center gap-2">
                Study Tracker
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                {isBn ? 'স্মার্ট প্ল্যাটফর্ম' : 'Smart Platform'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              {isBn
                ? 'আপনার প্রতিদিনের পড়াশোনা, সময় ও রুটিন গুছিয়ে নেওয়ার বিশ্বস্ত সঙ্গী'
                : 'Your daily companion for study routines, focus timer, and tracking'}
            </p>
          </div>
        </div>

        {/* Controls: Theme & Lang & Export */}
        <div className="flex items-center flex-wrap gap-2.5 sm:self-center">
          {/* Language Switch */}
          <div className="flex items-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLang('bn')}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                isBn
                  ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                !isBn
                  ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              English
            </button>
          </div>

          {/* Theme Selector (matches user requirement select) */}
          <div className="theme-selector flex items-center">
            <select
              id="themeSwitch"
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeMode)}
              className="text-xs sm:text-sm font-medium py-1.5 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
            >
              <option value="light">☀️ {isBn ? 'লাইট থিম (Light)' : 'Light Theme'}</option>
              <option value="dark">🌙 {isBn ? 'ডার্ক থিম (Dark)' : 'Dark Slate'}</option>
              <option value="midnight">🌌 {isBn ? 'মিডনাইট (Midnight)' : 'Midnight Blue'}</option>
              <option value="forest">🌲 {isBn ? 'ফরেস্ট (Forest)' : 'Emerald Forest'}</option>
              <option value="sepia">☕ {isBn ? 'সেপিয়া (Sepia)' : 'Warm Sepia'}</option>
            </select>
          </div>

          {/* Action Menu (Backup / Reset) */}
          <div className="flex items-center gap-1 border-l border-[var(--border-color)] pl-2">
            <button
              onClick={onExportData}
              title={isBn ? 'ডাটা ব্যাকআপ ডাউনলোড করুন' : 'Export Data Backup'}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <label
              title={isBn ? 'ডাটা ব্যাকআপ রিস্টোর করুন' : 'Import Backup'}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={onImportData} className="hidden" />
            </label>
            <button
              onClick={onResetData}
              title={isBn ? 'ডেমো ডাটা রিসেট করুন' : 'Reset / Load Demo Data'}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 pt-3.5 border-t border-[var(--border-color)]">
        {/* Today Study Time */}
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-[var(--bg-subtle)]">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="text-[11px] sm:text-xs text-[var(--text-muted)]">
              {isBn ? 'আজকের মোট পড়াশোনা' : 'Today Study Time'}
            </div>
            <div className="text-sm sm:text-base font-bold text-[var(--text-main)]">
              {isBn ? `${toBengaliDigits(todayMinutes)} মিনিট` : `${todayMinutes} mins`}
              <span className="text-[11px] font-normal text-[var(--text-muted)] ml-1">
                ({isBn ? toBengaliDigits(todayHours) : todayHours}h)
              </span>
            </div>
          </div>
        </div>

        {/* Routine Tasks Progress */}
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-[var(--bg-subtle)]">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="text-[11px] sm:text-xs text-[var(--text-muted)]">
              {isBn ? 'আজকের রুটিন কাজ' : 'Tasks Completed'}
            </div>
            <div className="text-sm sm:text-base font-bold text-[var(--text-main)]">
              {isBn
                ? `${toBengaliDigits(completedTasksCount)}/${toBengaliDigits(totalTasksCount)} সম্পন্ন`
                : `${completedTasksCount}/${totalTasksCount} done`}
            </div>
          </div>
        </div>

        {/* Study Streak */}
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-[var(--bg-subtle)]">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="text-[11px] sm:text-xs text-[var(--text-muted)]">
              {isBn ? 'ধারাবাহিকতা (Streak)' : 'Daily Streak'}
            </div>
            <div className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              {isBn ? `${toBengaliDigits(streakDays)} দিনের streak` : `${streakDays} Days streak`}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
