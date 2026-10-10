import React, { useState } from 'react';
import { Task, Subject, Language, Priority } from '../types';
import { toBengaliDigits } from '../utils/bengaliNumerals';
import confetti from 'canvas-confetti';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Tag,
  Clock,
  Filter,
  Check,
  Sparkles,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

interface TodoListCardProps {
  lang: Language;
  tasks: Task[];
  subjects: Subject[];
  onAddTask: (task: {
    title: string;
    subjectId: string;
    priority: Priority;
    estimatedMinutes?: number;
  }) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
}

export const TodoListCard: React.FC<TodoListCardProps> = ({
  lang,
  tasks,
  subjects,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
}) => {
  const isBn = lang === 'bn';

  const [inputTitle, setInputTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'general');
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedMins, setEstimatedMins] = useState<number>(30);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Quick suggestion chips
  const quickSuggestions = isBn
    ? [
        { title: 'গণিত ত্রিকোণমিতি অধ্যায় ৯', subId: 'math' },
        { title: 'ইংরেজি গ্রামার ও Vocabulary', subId: 'english' },
        { title: 'পদার্থবিজ্ঞান ভেক্টর ও গতিবিদ্যা', subId: 'physics' },
        { title: 'রসায়ন জৈব যৌগ ও সমীকরণ', subId: 'chemistry' },
        { title: 'বাংলা ব্যাকরণ ও সাহিত্য', subId: 'bangla' },
        { title: 'ICT সি প্রোগ্রামিং প্র্যাকটিস', subId: 'ict' },
      ]
    : [
        { title: 'Math Trigonometry Chapter 9', subId: 'math' },
        { title: 'English Grammar & Vocabulary', subId: 'english' },
        { title: 'Physics Vectors & Motion', subId: 'physics' },
        { title: 'Chemistry Organic Reactions', subId: 'chemistry' },
        { title: 'ICT Programming C Practice', subId: 'ict' },
      ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;

    onAddTask({
      title: inputTitle.trim(),
      subjectId: selectedSubjectId,
      priority,
      estimatedMinutes: estimatedMins,
    });

    setInputTitle('');
  };

  const handleToggleWithConfetti = (task: Task) => {
    onToggleTask(task.id);
    if (!task.completed) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    if (subjectFilter !== 'all' && t.subjectId !== subjectFilter) return false;
    return true;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const percentDone = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="card rounded-2xl bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm border border-[var(--border-color)] transition-colors duration-200">
      {/* Title & Routine Progress */}
      <div className="border-b border-[var(--border-color)] pb-3.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
          <span>📋</span>
          <span>{isBn ? 'আজকের পড়ার রুটিন (To-Do List)' : "Today's Study Routine"}</span>
        </h2>

        {totalCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              {isBn
                ? `${toBengaliDigits(completedCount)}/${toBengaliDigits(totalCount)} সম্পন্ন (${toBengaliDigits(percentDone)}%)`
                : `${completedCount}/${totalCount} completed (${percentDone}%)`}
            </span>
            <div className="w-20 bg-[var(--bg-subtle)] rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentDone}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Group form (matches user prompt with richer options) */}
      <form onSubmit={handleFormSubmit} className="mb-4">
        <div className="input-group flex flex-col sm:flex-row gap-2 mb-2.5">
          <input
            type="text"
            id="taskInput"
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            placeholder={isBn ? 'যেমন: গণিত ত্রিকোণমিতি...' : 'e.g., Mathematics Trigonometry...'}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm placeholder:text-[var(--text-muted)]"
          />
          <button
            type="submit"
            className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:scale-95 transition-all text-sm cursor-pointer whitespace-nowrap shadow-sm shadow-indigo-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>{isBn ? 'যুক্ত করুন' : 'Add Task'}</span>
          </button>
        </div>

        {/* Task Meta Options: Subject + Priority + Estimated Minutes */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Subject selection */}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="py-1 px-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none font-medium cursor-pointer"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {isBn ? sub.nameBn : sub.nameEn}
              </option>
            ))}
          </select>

          {/* Priority */}
          <div className="flex items-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] p-0.5 font-medium">
            <button
              type="button"
              onClick={() => setPriority('low')}
              className={`px-2 py-0.5 rounded transition-all ${
                priority === 'low'
                  ? 'bg-blue-500 text-white font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {isBn ? 'সাধারণ' : 'Normal'}
            </button>
            <button
              type="button"
              onClick={() => setPriority('medium')}
              className={`px-2 py-0.5 rounded transition-all ${
                priority === 'medium'
                  ? 'bg-amber-500 text-white font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {isBn ? 'মাঝারি' : 'Medium'}
            </button>
            <button
              type="button"
              onClick={() => setPriority('high')}
              className={`px-2 py-0.5 rounded transition-all ${
                priority === 'high'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {isBn ? 'উচ্চ অগ্রাধিকার' : 'Urgent'}
            </button>
          </div>

          {/* Estimated duration */}
          <div className="flex items-center gap-1 text-[var(--text-muted)]">
            <Clock className="w-3.5 h-3.5" />
            <select
              value={estimatedMins}
              onChange={(e) => setEstimatedMins(parseInt(e.target.value, 10))}
              className="py-1 px-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] font-medium cursor-pointer"
            >
              <option value={15}>{isBn ? '১৫ মিনিট' : '15 mins'}</option>
              <option value={30}>{isBn ? '৩০ মিনিট' : '30 mins'}</option>
              <option value={45}>{isBn ? '৪৫ মিনিট' : '45 mins'}</option>
              <option value={60}>{isBn ? '১ ঘণ্টা' : '1 hour'}</option>
              <option value={90}>{isBn ? '১.৫ ঘণ্টা' : '1.5 hours'}</option>
              <option value={120}>{isBn ? '২ ঘণ্টা' : '2 hours'}</option>
            </select>
          </div>
        </div>
      </form>

      {/* Quick Suggestion Pills */}
      <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
        <span className="text-[var(--text-muted)] whitespace-nowrap flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-amber-500" />
          {isBn ? 'সাজেশন:' : 'Quick:'}
        </span>
        {quickSuggestions.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setInputTitle(item.title);
              setSelectedSubjectId(item.subId);
            }}
            className="px-2.5 py-1 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--primary)] hover:text-white text-[var(--text-muted)] transition-all whitespace-nowrap cursor-pointer border border-[var(--border-color)]"
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-color)] pb-2.5 mb-3 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-[var(--primary)] text-white font-bold'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            {isBn ? `সব (${toBengaliDigits(tasks.length)})` : `All (${tasks.length})`}
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filter === 'pending'
                ? 'bg-[var(--primary)] text-white font-bold'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            {isBn
              ? `বাকি আছে (${toBengaliDigits(tasks.filter((t) => !t.completed).length)})`
              : `Pending (${tasks.filter((t) => !t.completed).length})`}
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filter === 'completed'
                ? 'bg-[var(--primary)] text-white font-bold'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            {isBn
              ? `সম্পন্ন (${toBengaliDigits(completedCount)})`
              : `Done (${completedCount})`}
          </button>
        </div>

        {completedCount > 0 && (
          <button
            onClick={onClearCompleted}
            className="text-[11px] font-medium text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
          >
            {isBn ? 'সম্পন্নগুলো মুছুন' : 'Clear done'}
          </button>
        )}
      </div>

      {/* Tasks List */}
      <ul id="taskList" className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <li className="py-8 text-center text-xs sm:text-sm text-[var(--text-muted)] bg-[var(--bg-subtle)] rounded-xl border border-dashed border-[var(--border-color)]">
            {filter === 'completed'
              ? isBn
                ? 'এখনো কোনো কাজ সম্পন্ন করা হয়নি।'
                : 'No tasks completed yet.'
              : isBn
              ? 'তালিকায় কোনো পড়া যুক্ত করা নেই। উপরে নতুন টপিক লিখুন!'
              : 'No study tasks found. Add a topic above!'}
          </li>
        ) : (
          filteredTasks.map((task) => {
            const subject = subjects.find((s) => s.id === task.subjectId);
            const isHighPriority = task.priority === 'high';
            const isMedPriority = task.priority === 'medium';

            return (
              <li
                key={task.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                  task.completed
                    ? 'completed bg-[var(--bg-subtle)]/60 border-[var(--border-color)] opacity-70'
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-indigo-300 dark:hover:border-indigo-700 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Checkbox button */}
                  <button
                    onClick={() => handleToggleWithConfetti(task)}
                    className="mt-0.5 text-[var(--primary)] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5 text-[var(--text-muted)] hover:text-[var(--primary)]" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <span
                      onClick={() => handleToggleWithConfetti(task)}
                      className={`text-sm font-medium cursor-pointer block break-words ${
                        task.completed
                          ? 'line-through text-[var(--text-muted)]'
                          : 'text-[var(--text-main)]'
                      }`}
                    >
                      {task.title}
                    </span>

                    {/* Metadata tags */}
                    <div className="flex items-center flex-wrap gap-1.5 mt-1 text-[11px]">
                      {subject && (
                        <span
                          className="px-2 py-0.5 rounded-md font-semibold"
                          style={{
                            backgroundColor: subject.bgColor,
                            color: subject.color,
                          }}
                        >
                          {isBn ? subject.nameBn : subject.nameEn}
                        </span>
                      )}

                      {task.estimatedMinutes && (
                        <span className="flex items-center gap-1 text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-[var(--bg-subtle)]">
                          <Clock className="w-3 h-3" />
                          {isBn
                            ? `${toBengaliDigits(task.estimatedMinutes)} মিনিট`
                            : `${task.estimatedMinutes}m`}
                        </span>
                      )}

                      {isHighPriority && (
                        <span className="px-1.5 py-0.5 rounded font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40">
                          {isBn ? 'জরুরি' : 'Urgent'}
                        </span>
                      )}
                      {isMedPriority && (
                        <span className="px-1.5 py-0.5 rounded font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40">
                          {isBn ? 'মাঝারি' : 'Medium'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete button (matches user class delete-btn) */}
                <button
                  onClick={() => onDeleteTask(task.id)}
                  title={isBn ? 'মুছুন' : 'Delete'}
                  className="delete-btn p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};
