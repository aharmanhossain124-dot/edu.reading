/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, Subject, StudySession, Language, ThemeMode, TimerMode, Priority } from './types';
import { Header } from './components/Header';
import { TimerCard } from './components/TimerCard';
import { TodoListCard } from './components/TodoListCard';
import { AnalyticsCard } from './components/AnalyticsCard';
import { QuickNotesCard } from './components/QuickNotesCard';
import { ZenModeModal } from './components/ZenModeModal';
import { DEFAULT_SUBJECTS, STUDY_QUOTES } from './utils/quotes';
import { Sparkles, RefreshCw, BookMarked, Heart } from 'lucide-react';

const STORAGE_KEYS = {
  THEME: 'studytracker_theme_v1',
  LANG: 'studytracker_lang_v1',
  TASKS: 'studytracker_tasks_v1',
  SESSIONS: 'studytracker_sessions_v1',
  SUBJECTS: 'studytracker_subjects_v1',
  NOTES: 'studytracker_notes_v1',
  LAST_ACTIVE: 'studytracker_last_active_v1',
  STREAK: 'studytracker_streak_v1',
};

export default function App() {
  // Theme & Language
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode) || 'light';
  });

  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem(STORAGE_KEYS.LANG) as Language) || 'bn';
  });

  // Subjects
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_SUBJECTS;
  });

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Initial sample tasks
    return [
      {
        id: 't-1',
        title: 'গণিত: ত্রিকোণমিতি অধ্যায় ৯ এর অনুশীলনী সমস্যা সমাধান',
        subjectId: 'math',
        priority: 'high',
        completed: false,
        estimatedMinutes: 45,
        createdAt: Date.now() - 3600000,
      },
      {
        id: 't-2',
        title: 'ইংরেজি: গ্রামার Voice Change ও ৫টি নতুন Vocabulary মুখস্থ',
        subjectId: 'english',
        priority: 'medium',
        completed: true,
        estimatedMinutes: 30,
        createdAt: Date.now() - 7200000,
        completedAt: Date.now() - 1800000,
      },
      {
        id: 't-3',
        title: 'পদার্থবিজ্ঞান: ভেক্টর গুণন ও নদী-নৌকা রিলেটেড অঙ্ক',
        subjectId: 'physics',
        priority: 'high',
        completed: false,
        estimatedMinutes: 60,
        createdAt: Date.now() - 5400000,
      },
      {
        id: 't-4',
        title: 'বাংলা: প্রথম পত্র গল্প ও মূলভাব রিভিশন',
        subjectId: 'bangla',
        priority: 'low',
        completed: false,
        estimatedMinutes: 30,
        createdAt: Date.now() - 1800000,
      },
    ];
  });

  // Study Sessions
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Initial sample sessions from today & yesterday
    const now = Date.now();
    const oneDay = 86400000;
    return [
      {
        id: 's-1',
        subjectId: 'math',
        subjectName: 'গণিত (Math)',
        durationSeconds: 2700, // 45m
        timestamp: now - 3600000,
        notes: 'ত্রিকোণমিতিক অভেদাবলি সূত্র অনুশীলন',
        mode: 'pomodoro',
      },
      {
        id: 's-2',
        subjectId: 'english',
        subjectName: 'ইংরেজি (English)',
        durationSeconds: 1800, // 30m
        timestamp: now - 14400000,
        notes: 'Grammar practice',
        mode: 'stopwatch',
      },
      {
        id: 's-3',
        subjectId: 'physics',
        subjectName: 'পদার্থবিজ্ঞান (Physics)',
        durationSeconds: 3600, // 1h
        timestamp: now - oneDay,
        notes: 'ভেক্টর যোগ ও বিয়োগ',
        mode: 'custom',
      },
      {
        id: 's-4',
        subjectId: 'chemistry',
        subjectName: 'রসায়ন (Chemistry)',
        durationSeconds: 2400, // 40m
        timestamp: now - oneDay * 2,
        notes: 'পর্যায় সারণি',
        mode: 'pomodoro',
      },
    ];
  });

  // Quick Notes
  const [notes, setNotes] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEYS.NOTES) ||
      '• গণিত সূত্র: sin²θ + cos²θ = 1\n• পদার্থ: F = ma, v = u + at\n• আজকের লক্ষ্য: আগামীকালের মক টেস্টের জন্য সূত্রগুলো সম্পূর্ণ রিভিশন করা।'
    );
  });

  // Quote
  const [quoteIdx, setQuoteIdx] = useState<number>(0);

  // Zen Mode state
  const [zenState, setZenState] = useState<{
    isOpen: boolean;
    seconds: number;
    isRunning: boolean;
    mode: TimerMode;
    subjectName: string;
    onToggle: () => void;
  }>({
    isOpen: false,
    seconds: 0,
    isRunning: false,
    mode: 'stopwatch',
    subjectName: 'সাধারণ স্টাডি',
    onToggle: () => {},
  });

  // Apply Theme to document.body
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    if (theme === 'dark' || theme === 'midnight' || theme === 'forest') {
      document.body.classList.add('dark');
      document.body.classList.add('dark-theme'); // user prompt compatibility
    } else {
      document.body.classList.remove('dark');
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  // Persist settings & data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, notes);
  }, [notes]);

  // Streak calculation
  const calculateStreak = (): number => {
    if (sessions.length === 0) return 0;
    const sessionDates = Array.from(
      new Set(
        sessions.map((s) => new Date(s.timestamp).toISOString().split('T')[0])
      )
    ).sort().reverse();

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Must have studied today or yesterday to keep streak alive
    if (!sessionDates.includes(todayStr) && !sessionDates.includes(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    let expected = new Date();
    if (!sessionDates.includes(todayStr)) {
      expected = new Date(Date.now() - 86400000);
    }

    for (const dStr of sessionDates) {
      const expStr = expected.toISOString().split('T')[0];
      if (dStr === expStr) {
        streak++;
        expected.setDate(expected.getDate() - 1);
      } else {
        break;
      }
    }

    return Math.max(1, streak);
  };

  const streakDays = calculateStreak();

  // Today study seconds
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySeconds = sessions
    .filter((s) => new Date(s.timestamp).toISOString().split('T')[0] === todayStr)
    .reduce((acc, curr) => acc + curr.durationSeconds, 0);

  // Handlers
  const handleAddTask = (newTask: {
    title: string;
    subjectId: string;
    priority: Priority;
    estimatedMinutes?: number;
  }) => {
    const task: Task = {
      id: 'task-' + Date.now(),
      title: newTask.title,
      subjectId: newTask.subjectId,
      priority: newTask.priority,
      completed: false,
      estimatedMinutes: newTask.estimatedMinutes,
      createdAt: Date.now(),
    };
    setTasks((prev) => [task, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const completed = !t.completed;
          return {
            ...t,
            completed,
            completedAt: completed ? Date.now() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const handleSaveSession = (newSession: {
    subjectId: string;
    subjectName: string;
    durationSeconds: number;
    notes?: string;
    mode: TimerMode;
  }) => {
    const session: StudySession = {
      id: 'session-' + Date.now(),
      subjectId: newSession.subjectId,
      subjectName: newSession.subjectName,
      durationSeconds: newSession.durationSeconds,
      timestamp: Date.now(),
      notes: newSession.notes,
      mode: newSession.mode,
    };
    setSessions((prev) => [session, ...prev]);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearSessions = () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি সব স্টাডি হিস্টোরি মুছে ফেলতে চান?' : 'Clear all study session history?')) {
      setSessions([]);
    }
  };

  const handleResetData = () => {
    if (
      window.confirm(
        lang === 'bn'
          ? 'আপনি কি ডেমো ডাটা রিস্টোর করতে চান? আপনার বর্তমান তথ্য প্রতিস্থাপিত হবে।'
          : 'Reset data to sample demo data?'
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = {
      theme,
      lang,
      tasks,
      sessions,
      subjects,
      notes,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study_tracker_backup_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.sessions) setSessions(parsed.sessions);
        if (parsed.notes) setNotes(parsed.notes);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.lang) setLang(parsed.lang);
        alert(lang === 'bn' ? 'ডাটা সফলভাবে ইমপোর্ট করা হয়েছে!' : 'Data imported successfully!');
      } catch {
        alert(lang === 'bn' ? 'ফাইলটি সঠিক JSON ফরম্যাটে নেই।' : 'Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const currentQuote = STUDY_QUOTES[quoteIdx % STUDY_QUOTES.length];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 py-6 px-3 sm:px-6">
      <div className="container max-w-[1050px] mx-auto">
        {/* Header */}
        <Header
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          streakDays={streakDays}
          todaySeconds={todaySeconds}
          completedTasksCount={tasks.filter((t) => t.completed).length}
          totalTasksCount={tasks.length}
          onResetData={handleResetData}
          onExportData={handleExportData}
          onImportData={handleImportData}
        />

        {/* 2-Column Grid (matches user's class="grid") */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-6">
          {/* Left: Study Session & Timer */}
          <TimerCard
            lang={lang}
            subjects={subjects}
            onSaveSession={handleSaveSession}
            onOpenZenMode={(state) =>
              setZenState({
                ...state,
                isOpen: true,
              })
            }
          />

          {/* Right: Today's To-Do / Subject List */}
          <TodoListCard
            lang={lang}
            tasks={tasks}
            subjects={subjects}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onClearCompleted={handleClearCompleted}
          />
        </div>

        {/* Scratchpad & Formula Notes */}
        <div className="mb-6">
          <QuickNotesCard lang={lang} notes={notes} onSaveNotes={setNotes} />
        </div>

        {/* Analytics & History Log */}
        <div className="mb-6">
          <AnalyticsCard
            lang={lang}
            sessions={sessions}
            subjects={subjects}
            onDeleteSession={handleDeleteSession}
            onClearSessions={handleClearSessions}
          />
        </div>

        {/* Daily Motivation Card & Footer */}
        <footer className="rounded-2xl bg-[var(--bg-card)] p-4 sm:p-5 border border-[var(--border-color)] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left transition-colors">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-lg">
              💡
            </span>
            <div>
              <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                <span>{lang === 'bn' ? 'আজকের অনুপ্রেরণা' : 'Daily Inspiration'}</span>
                <button
                  onClick={() => setQuoteIdx((q) => q + 1)}
                  className="p-1 rounded hover:bg-[var(--bg-subtle)] text-[var(--primary)] transition-colors cursor-pointer"
                  title={lang === 'bn' ? 'পরবর্তী বাণী' : 'Next quote'}
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-main)] italic mt-0.5">
                "{lang === 'bn' ? currentQuote.quoteBn : currentQuote.quoteEn}"
              </p>
              <div className="text-[11px] text-[var(--text-muted)] font-semibold mt-0.5">
                — {lang === 'bn' ? currentQuote.authorBn : currentQuote.authorEn}
              </div>
            </div>
          </div>

          <div className="text-xs text-[var(--text-muted)] shrink-0">
            <span>Study Tracker • {lang === 'bn' ? 'স্মার্ট স্টাডি প্ল্যাটফর্ম' : 'Smart Study Platform'}</span>
          </div>
        </footer>

        {/* Zen Mode Modal */}
        <ZenModeModal
          isOpen={zenState.isOpen}
          onClose={() => setZenState((z) => ({ ...z, isOpen: false }))}
          lang={lang}
          seconds={zenState.seconds}
          isRunning={zenState.isRunning}
          mode={zenState.mode}
          subjectName={zenState.subjectName}
          onToggleTimer={zenState.onToggle}
          quoteBn={currentQuote.quoteBn}
          quoteEn={currentQuote.quoteEn}
        />
      </div>
    </div>
  );
}
