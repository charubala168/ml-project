import React, { useMemo } from 'react';
import { 
  BarChart3, 
  Award, 
  Flame, 
  Clock, 
  Calendar, 
  CheckCircle, 
  Smile, 
  Zap, 
  Coffee, 
  AlertTriangle,
  Target,
  Sparkles
} from 'lucide-react';
import { Exam, StudyTask, MoodLogEntry, StudentStats, MoodType } from '../types';
import { MOODS } from '../data/sampleData';
import { calculateOverallReadiness, getExamSyllabusProgress, getExamCountdown } from '../utils/planner';

interface AnalyticsViewProps {
  exams: Exam[];
  tasks: StudyTask[];
  moodLog: MoodLogEntry[];
  stats: StudentStats;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  exams,
  tasks,
  moodLog,
  stats,
}) => {
  const overallReadiness = useMemo(() => calculateOverallReadiness(exams), [exams]);

  // Compute weekly mood distributions
  const weekDistribution = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = days.map(() => ({
      energized: 0,
      focused: 0,
      calm: 0,
      low: 0,
      stressed: 0,
    }));

    moodLog.forEach((entry) => {
      const date = new Date(entry.when);
      const dow = (date.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
      if (counts[dow] && counts[dow][entry.mood] !== undefined) {
        counts[dow][entry.mood]++;
      }
    });

    return { days, counts };
  }, [moodLog]);

  // Total study time calculation
  const completedTasks = tasks.filter((t) => t.completed);
  const totalMinutesFromTasks = completedTasks.reduce((sum, t) => sum + t.mins, 0);
  const totalHoursLogged = ((stats.totalMinutesStudied + totalMinutesFromTasks) / 60).toFixed(1);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-[#E2E8F0]">
        <h1 className="font-display text-3xl font-bold text-[#1E243A] tracking-tight">
          Progress Tracking & Mood Analytics
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Monitor overall exam readiness, review session streaks, and evaluate how mental energy impacts study performance.
        </p>
      </div>

      {/* Hero Readiness & Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Overall Readiness Card */}
        <div className="bg-gradient-to-br from-[#1E243A] to-[#2E3754] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A5B4FC]">
              Weighted Exam Readiness
            </span>
            <div className="flex items-baseline gap-2 pt-2">
              <span className="font-display text-5xl font-bold text-white">
                {overallReadiness}%
              </span>
              <span className="text-xs text-[#CBD5E1]">average mastery</span>
            </div>
            <p className="text-xs text-[#94A3B8] pt-2">
              Calculated across syllabus checkpoints, exam weights, and confidence levels.
            </p>
          </div>

          <div className="relative z-10 pt-4">
            <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#E8A33D] to-emerald-400 transition-all duration-1000"
                style={{ width: `${overallReadiness}%` }}
              />
            </div>
            <div className="flex justify-between text-[10.5px] text-[#A5B4FC] font-mono-code pt-1.5">
              <span>0% Initial</span>
              <span>
                {overallReadiness >= 75
                  ? 'Strong Pace'
                  : overallReadiness >= 50
                  ? 'Steady Progress'
                  : 'Needs Focus'}
              </span>
              <span>100% Mastered</span>
            </div>
          </div>
        </div>

        {/* Study Hours & Streak */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Study Velocity
            </span>
            <div className="flex items-baseline gap-2 pt-2">
              <span className="font-display text-4xl font-bold text-[#1E243A]">
                {totalHoursLogged}
              </span>
              <span className="text-sm font-semibold text-[#64748B]">Hours Logged</span>
            </div>
            <p className="text-xs text-[#64748B] pt-1">
              {stats.sessionsCompleted + completedTasks.length} focused study sprints completed.
            </p>
          </div>

          <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Flame className="w-4 h-4 fill-amber-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1E243A]">{stats.currentStreak} Day Streak</p>
                <p className="text-[11px] text-[#64748B]">Consistent daily habit</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-mono-code">
              Active
            </span>
          </div>
        </div>

        {/* Quick Exam Milestones */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Exam Coverage Summary
            </span>
            <div className="flex items-baseline gap-2 pt-2">
              <span className="font-display text-4xl font-bold text-[#1E243A]">
                {exams.length}
              </span>
              <span className="text-sm font-semibold text-[#64748B]">Target Exams</span>
            </div>
            <p className="text-xs text-[#64748B] pt-1">
              {exams.reduce((acc, e) => acc + e.topics.filter(t => t.completed).length, 0)} syllabus topics mastered out of{' '}
              {exams.reduce((acc, e) => acc + e.topics.length, 0)} total topics.
            </p>
          </div>

          <div className="pt-4 border-t border-[#F1F5F9] space-y-1 text-xs">
            {exams.slice(0, 2).map((e) => {
              const p = getExamSyllabusProgress(e);
              return (
                <div key={e.id} className="flex items-center justify-between">
                  <span className="font-medium text-[#334155] truncate max-w-[140px]">
                    {e.courseCode}
                  </span>
                  <span className="font-mono-code text-[#64748B] font-semibold">
                    {p.percent}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Mood & Cognitive State Chart */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-[#1E243A]">
              Weekly Focus State Distribution
            </h2>
            <p className="text-xs text-[#64748B]">
              How you felt going into study sessions throughout the week.
            </p>
          </div>

          {/* Mood legend */}
          <div className="flex items-center gap-3 flex-wrap text-xs">
            {(Object.entries(MOODS) as [MoodType, any][]).map(([key, m]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.hex }} />
                <span className="text-[#475569] text-[11px]">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stacked Bars */}
        <div className="flex items-end gap-3 h-36 pt-4 px-2">
          {weekDistribution.days.map((day, idx) => {
            const counts = weekDistribution.counts[idx];
            const total = Object.values(counts).reduce((a, b) => a + b, 0);
            const maxHeight = 100;

            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full max-w-[42px] flex flex-col-reverse rounded-md overflow-hidden bg-[#F1F5F9] h-[100px] justify-start">
                  {total > 0 ? (
                    (Object.keys(counts) as MoodType[]).map((moodKey) => {
                      const count = counts[moodKey];
                      if (count === 0) return null;
                      const segmentHeight = Math.max(8, (count / Math.max(1, total)) * maxHeight);
                      return (
                        <div
                          key={moodKey}
                          style={{
                            height: `${segmentHeight}px`,
                            backgroundColor: MOODS[moodKey].hex,
                          }}
                          title={`${day}: ${MOODS[moodKey].label} (${count})`}
                        />
                      );
                    })
                  ) : (
                    <div className="h-1 bg-[#E2E8F0] w-full" />
                  )}
                </div>
                <span className="font-mono-code text-[11px] text-[#64748B] font-medium">
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exam Breakdown Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
        <h2 className="font-display text-lg font-bold text-[#1E243A]">
          Exam Syllabus Completion Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider text-[10.5px]">
                <th className="py-2.5 px-3">Exam / Course</th>
                <th className="py-2.5 px-3">Countdown</th>
                <th className="py-2.5 px-3">Topics Mastered</th>
                <th className="py-2.5 px-3">Weight</th>
                <th className="py-2.5 px-3">Readiness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {exams.map((exam) => {
                const progress = getExamSyllabusProgress(exam);
                const countdown = getExamCountdown(exam.dateTime);

                return (
                  <tr key={exam.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: exam.color || '#3D7A5C' }}
                        />
                        <div>
                          <strong className="text-[#1E243A] block">{exam.courseCode}</strong>
                          <span className="text-[#64748B] text-[11px]">{exam.title}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono-code font-semibold text-[#334155]">
                      {countdown.text}
                    </td>
                    <td className="py-3 px-3 font-mono-code">
                      {progress.completed}/{progress.total} ({progress.percent}%)
                    </td>
                    <td className="py-3 px-3 font-mono-code text-[#475569]">
                      {exam.weight}%
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 w-32">
                        <div className="flex-1 h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${progress.percent}%`,
                              backgroundColor: exam.color || '#3D7A5C',
                            }}
                          />
                        </div>
                        <span className="font-mono-code font-bold text-[#1E243A]">
                          {progress.percent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Mood Check-ins Log */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-3">
        <h2 className="font-display text-lg font-bold text-[#1E243A]">
          Recent Mood & Reflection History
        </h2>
        {moodLog.length === 0 ? (
          <p className="text-xs text-[#64748B] py-4 text-center">
            No check-in logs yet. Generate your study schedule from the Today tab to record reflections.
          </p>
        ) : (
          <div className="space-y-2">
            {moodLog.slice(0, 8).map((log) => {
              const m = MOODS[log.mood] || MOODS.focused;
              const date = new Date(log.when);
              const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
              const formattedTime = date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className="flex items-start sm:items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs"
                >
                  <span
                    className="w-3 h-3 rounded-full mt-1 sm:mt-0 shrink-0"
                    style={{ backgroundColor: m.hex }}
                  />
                  <span className="w-24 shrink-0 font-mono-code text-[11px] text-[#64748B]">
                    {formattedDate} · {formattedTime}
                  </span>
                  <span
                    className="w-24 shrink-0 font-semibold"
                    style={{ color: m.hex }}
                  >
                    {m.label}
                  </span>
                  <span className="flex-1 text-[#475569] italic">
                    {log.note || '— No additional reflection note entered —'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
