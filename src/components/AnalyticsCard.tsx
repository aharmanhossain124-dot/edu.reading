import React from 'react';
import { StudySession, Subject, Language } from '../types';
import { toBengaliDigits, formatHumanDuration } from '../utils/bengaliNumerals';
import { BarChart3, PieChart, History, Calendar, Trash2 } from 'lucide-react';

interface AnalyticsCardProps {
  lang: Language;
  sessions: StudySession[];
  subjects: Subject[];
  onDeleteSession: (id: string) => void;
  onClearSessions: () => void;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  lang,
  sessions,
  subjects,
  onDeleteSession,
  onClearSessions,
}) => {
  const isBn = lang === 'bn';

  // Calculate 7-day stats
  const now = new Date();
  const past7Days: { dateStr: string; label: string; seconds: number }[] = [];

  const dayNamesBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const label = isBn ? dayNamesBn[dayOfWeek] : dayNamesEn[dayOfWeek];

    // Total seconds for this date
    const dayTotal = sessions
      .filter((s) => {
        const sDate = new Date(s.timestamp).toISOString().split('T')[0];
        return sDate === dateStr;
      })
      .reduce((acc, curr) => acc + curr.durationSeconds, 0);

    past7Days.push({ dateStr, label, seconds: dayTotal });
  }

  const maxSeconds = Math.max(...past7Days.map((d) => d.seconds), 3600); // at least 1 hr baseline

  // Calculate subject breakdown
  const subjectDistribution: { [subId: string]: number } = {};
  let totalLoggedSeconds = 0;

  sessions.forEach((s) => {
    subjectDistribution[s.subjectId] = (subjectDistribution[s.subjectId] || 0) + s.durationSeconds;
    totalLoggedSeconds += s.durationSeconds;
  });

  const subjectStats = Object.entries(subjectDistribution).map(([subId, secs]) => {
    const subObj = subjects.find((s) => s.id === subId);
    const name = subObj ? (isBn ? subObj.nameBn : subObj.nameEn) : (isBn ? 'অন্যান্য' : 'Other');
    const color = subObj ? subObj.color : '#6b7280';
    const percent = totalLoggedSeconds > 0 ? Math.round((secs / totalLoggedSeconds) * 100) : 0;
    return { subId, name, secs, color, percent };
  }).sort((a, b) => b.secs - a.secs);

  return (
    <div className="card rounded-2xl bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm border border-[var(--border-color)] transition-colors duration-200">
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-3.5 mb-5 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
          <span>📊</span>
          <span>{isBn ? 'স্টাডি অ্যানালিটিক্স ও হিস্টোরি' : 'Study Analytics & Logs'}</span>
        </h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)]">
          {isBn
            ? `মোট সেশন: ${toBengaliDigits(sessions.length)} টি`
            : `Total: ${sessions.length} sessions`}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 7-Day Study Bar Chart */}
        <div className="rounded-xl p-4 bg-[var(--bg-subtle)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[var(--primary)]" />
              {isBn ? 'বিগত ৭ দিনের পড়াশোনা' : 'Past 7 Days Activity'}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {isBn ? 'মিনিট হিসেবে' : 'in minutes'}
            </span>
          </div>

          <div className="h-40 flex items-end justify-between gap-2 pt-6 pb-2 px-1">
            {past7Days.map((item, idx) => {
              const minutes = Math.round(item.seconds / 60);
              const heightPercent = Math.max(8, Math.round((item.seconds / maxSeconds) * 100));
              const isToday = idx === 6;

              return (
                <div key={item.dateStr} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-[var(--text-muted)]">
                    {minutes > 0 ? (isBn ? toBengaliDigits(minutes) : minutes) : ''}
                  </span>
                  <div
                    className="w-full max-w-[32px] rounded-t-md transition-all duration-500 relative group"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: isToday ? 'var(--primary)' : 'rgba(99, 102, 241, 0.45)',
                    }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                      {isBn ? `${toBengaliDigits(minutes)} মি.` : `${minutes}m`}
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-semibold ${
                      isToday ? 'text-[var(--primary)] font-bold' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Subject Distribution */}
        <div className="rounded-xl p-4 bg-[var(--bg-subtle)] border border-[var(--border-color)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-emerald-500" />
              {isBn ? 'বিষয় অনুযায়ী সময় বণ্টন' : 'Subject Time Share'}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {isBn
                ? `মোট: ${formatHumanDuration(totalLoggedSeconds, isBn)}`
                : `Total: ${formatHumanDuration(totalLoggedSeconds, isBn)}`}
            </span>
          </div>

          {subjectStats.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              {isBn
                ? 'এখনো কোনো সেশন লগ নেই। টাইমার চালিয়ে সেশন সেভ করুন!'
                : 'No study sessions logged yet. Complete a session to see breakdown!'}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
              {subjectStats.slice(0, 5).map((stat) => (
                <div key={stat.subId}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[var(--text-main)] truncate max-w-[150px]">
                      {stat.name}
                    </span>
                    <span className="font-medium text-[var(--text-muted)]">
                      {formatHumanDuration(stat.secs, isBn)} ({isBn ? toBengaliDigits(stat.percent) : stat.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-card)] rounded-full h-2 overflow-hidden border border-[var(--border-color)]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${stat.percent}%`,
                        backgroundColor: stat.color,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Sessions History Log */}
      <div className="mt-6 pt-5 border-t border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-bold text-[var(--text-main)] flex items-center gap-1.5">
            <History className="w-4 h-4 text-[var(--primary)]" />
            <span>{isBn ? 'সর্বশেষ স্টাডি সেশন হিস্টোরি' : 'Recent Study Sessions'}</span>
          </h3>
          {sessions.length > 0 && (
            <button
              onClick={onClearSessions}
              className="text-[11px] font-medium text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
            >
              {isBn ? 'সব হিস্টোরি মুছুন' : 'Clear all logs'}
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="py-4 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] rounded-xl">
            {isBn ? 'কোনো স্টাডি হিস্টোরি পাওয়া যায়নি।' : 'No session logs recorded.'}
          </div>
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {sessions.slice(0, 10).map((session) => {
              const date = new Date(session.timestamp);
              const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateFormatted = date.toLocaleDateString();

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)]"></div>
                    <div className="min-w-0">
                      <div className="font-bold text-[var(--text-main)] truncate">
                        {session.subjectName}
                        {session.notes && (
                          <span className="font-normal text-[var(--text-muted)] ml-2 truncate">
                            - {session.notes}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {dateFormatted} • {timeFormatted} • {session.mode.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[var(--primary)] whitespace-nowrap">
                      {formatHumanDuration(session.durationSeconds, isBn)}
                    </span>
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      title={isBn ? 'মুছুন' : 'Delete'}
                      className="p-1 rounded text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
