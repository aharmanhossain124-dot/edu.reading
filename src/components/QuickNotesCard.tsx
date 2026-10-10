import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { Edit3, Save, Copy, Check, Sparkles, BookOpen } from 'lucide-react';

interface QuickNotesCardProps {
  lang: Language;
  notes: string;
  onSaveNotes: (notes: string) => void;
}

export const QuickNotesCard: React.FC<QuickNotesCardProps> = ({
  lang,
  notes,
  onSaveNotes,
}) => {
  const isBn = lang === 'bn';
  const [content, setContent] = useState(notes);
  const [copied, setCopied] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);

  useEffect(() => {
    setContent(notes);
  }, [notes]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onSaveNotes(e.target.value);
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertFormulaTemplate = (template: string) => {
    const updated = content ? `${content}\n${template}` : template;
    setContent(updated);
    onSaveNotes(updated);
  };

  return (
    <div className="card rounded-2xl bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm border border-[var(--border-color)] transition-colors duration-200">
      {/* Title */}
      <div className="border-b border-[var(--border-color)] pb-3.5 mb-4 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
          <span>📝</span>
          <span>{isBn ? 'স্টাডি স্ক্র্যাচপ্যাড ও ফর্মুলা নোট' : 'Study Scratchpad & Formula Notes'}</span>
        </h2>
        <div className="flex items-center gap-2">
          {savedBadge && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" />
              {isBn ? 'সংরক্ষিত' : 'Saved'}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-subtle)] transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title={isBn ? 'কপি করুন' : 'Copy'}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
          </button>
        </div>
      </div>

      {/* Quick Formula chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 text-xs no-scrollbar">
        <span className="text-[var(--text-muted)] text-[11px] whitespace-nowrap font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          {isBn ? 'কুইক টেমপ্লেট:' : 'Templates:'}
        </span>
        <button
          onClick={() => insertFormulaTemplate('• ত্রিকোণমিতি: sin²θ + cos²θ = 1, sec²θ - tan²θ = 1')}
          className="px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[var(--text-muted)] hover:text-indigo-600 text-[11px] whitespace-nowrap border border-[var(--border-color)] cursor-pointer"
        >
          {isBn ? '+ ত্রিকোণমিতি সূত্র' : '+ Trig formulas'}
        </button>
        <button
          onClick={() => insertFormulaTemplate('• পদার্থ: v = u + at | s = ut + 0.5at² | v² = u² + 2as')}
          className="px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[var(--text-muted)] hover:text-indigo-600 text-[11px] whitespace-nowrap border border-[var(--border-color)] cursor-pointer"
        >
          {isBn ? '+ গতিবিদ্যা সূত্র' : '+ Kinematics'}
        </button>
        <button
          onClick={() => insertFormulaTemplate('• আজকের রিভিশন লক্ষ্য:\n1. \n2. \n3. ')}
          className="px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[var(--text-muted)] hover:text-indigo-600 text-[11px] whitespace-nowrap border border-[var(--border-color)] cursor-pointer"
        >
          {isBn ? '+ রিভিশন চেকলিস্ট' : '+ Revision Checklist'}
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={handleChange}
        rows={6}
        placeholder={
          isBn
            ? 'পড়ার মাঝে গুরুত্বপূর্ণ কোনো সূত্র, তারিখ, সমীকরণ বা পয়েন্ট এখানে নোট করে রাখুন। এটি স্বয়ংক্রিয়ভাবে সেভ হয়ে থাকবে...'
            : 'Write formulas, important dates, equations or quick revision points here. Auto-saved locally...'
        }
        className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none font-mono placeholder:font-sans placeholder:text-[var(--text-muted)]"
      />
    </div>
  );
};
