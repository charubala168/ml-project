import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Plus, 
  Coffee, 
  Zap, 
  Target, 
  Smile, 
  AlertTriangle,
  Flame,
  Lightbulb,
  Check
} from 'lucide-react';
import { MoodType, StudyTask, Exam, StudyPlanBlock, MoodLogEntry } from '../types';
import { MOODS } from '../data/sampleData';
import { buildAdaptivePlan } from '../utils/planner';

interface TodayViewProps {
  selectedMood: MoodType;
  onSelectMood: (mood: MoodType) => void;
  tasks: StudyTask[];
  exams: Exam[];
  onAddTask: (task: Omit<StudyTask, 'id'>) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onSaveMoodLog: (entry: Omit<MoodLogEntry, 'id'>) => void;
  onStartActiveSession: (block: StudyPlanBlock) => void;
  onOpenAIRoadmap: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  selectedMood,
  onSelectMood,
  tasks,
  exams,
  onAddTask,
  onToggleTaskComplete,
  onSaveMoodLog,
  onStartActiveSession,
  onOpenAIRoadmap,
}) => {
  const [moodNote, setMoodNote] = useState('');
  const [quickTaskName, setQuickTaskName] = useState('');
  const [quickTaskMins, setQuickTaskMins] = useState(45);
  const [quickTaskPri, setQuickTaskPri] = useState<'high' | 'med' | 'low'>('high');
  const [quickTaskExamId, setQuickTaskExamId] = useState<string>('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [completedBlocks, setCompletedBlocks] = useState<Record<string, boolean>>({});

  const currentProfile = MOODS[selectedMood] || MOODS.focused;

  // Generate adaptive schedule blocks
  const planBlocks = useMemo(() => {
    return buildAdaptivePlan(tasks, selectedMood, exams);
  }, [tasks, selectedMood, exams]);

  // Compute stats for today's generated plan
  const planStats = useMemo(() => {
    let focusMinutes = 0;
    let breakMinutes = 0;
    let workBlocks = 0;

    planBlocks.forEach((b) => {
      if (b.type === 'work') {
        focusMinutes += b.mins;
        workBlocks++;
      } else {
        breakMinutes += b.mins;
      }
    });

    return { focusMinutes, breakMinutes, workBlocks };
  }, [planBlocks]);

  const handleGeneratePlan = () => {
    onSaveMoodLog({
      mood: selectedMood,
      note: moodNote.trim(),
      when: new Date().toISOString(),
    });
    setMoodNote('');
  };

  const handleCreateQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskName.trim()) return;

    onAddTask({
      name: quickTaskName.trim(),
      mins: Number(quickTaskMins) || 30,
      pri: quickTaskPri,
      examId: quickTaskExamId || undefined,
      category: 'Revision',
      completed: false,
    });

    setQuickTaskName('');
    setShowQuickAdd(false);
  };

  const toggleBlockCompleted = (blockId: string, taskId?: string) => {
    setCompletedBlocks((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));

    if (taskId) {
      onToggleTaskComplete(taskId);
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const moodIcons: Record<MoodType, React.ReactNode> = {
    energized: <Zap className="w-5 h-5 text-[#E8A33D]" />,
    focused: <Target className="w-5 h-5 text-[#3D7A5C]" />,
    calm: <Smile className="w-5 h-5 text-[#4C7EA8]" />,
    low: <Coffee className="w-5 h-5 text-[#8B6FB3]" />,
    stressed: <AlertTriangle className="w-5 h-5 text-[#C0554A]" />,
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayFormatted}</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[#1E243A] tracking-tight mt-1">
            How is your focus state today?
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Pick your mental gear. Inkling restructures your study block intervals, break pauses, and topic sequencing to match your cognitive load.
          </p>
        </div>

        <button
          onClick={onOpenAIRoadmap}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#1B2032] to-[#2B3553] text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-[#E8A33D]" />
          <span>AI Exam Blitz Assistant</span>
        </button>
      </header>

      {/* Mood Dial Card */}
      <section className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#1E243A]">
              Cognitive Energy Check-in
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Select how you feel right now. The schedule below instantly adapts.
            </p>
          </div>
          <span 
            className="text-xs font-semibold px-3 py-1 rounded-full text-white font-mono-code transition-colors"
            style={{ backgroundColor: currentProfile.tagColor }}
          >
            {currentProfile.tag}
          </span>
        </div>

        {/* 5 Mood Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(Object.entries(MOODS) as [MoodType, typeof currentProfile][]).map(([key, profile]) => {
            const isSelected = selectedMood === key;
            return (
              <button
                key={key}
                onClick={() => onSelectMood(key)}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-2 shadow-sm scale-[1.02]'
                    : 'border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#CBD5E1]'
                }`}
                style={{
                  borderColor: isSelected ? profile.hex : undefined,
                  backgroundColor: isSelected ? `${profile.hex}10` : undefined,
                }}
              >
                <div className="mb-2 p-2 rounded-full bg-white shadow-xs">
                  {moodIcons[key]}
                </div>
                <span className="text-xs font-bold text-[#1E243A]">
                  {profile.label}
                </span>
                <span className="text-[10px] text-[#64748B] font-mono-code mt-0.5">
                  {profile.block}m focus · {profile.brk}m rest
                </span>
              </button>
            );
          })}
        </div>

        {/* Current profile advice bar */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-3 text-xs">
          <Lightbulb className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-[#1E243A]">
              {currentProfile.description}
            </p>
            <p className="text-[#64748B]">
              <strong className="text-[#334155]">Study strategy:</strong> {currentProfile.advice}
            </p>
          </div>
        </div>

        {/* Check-in Note Input & Generate button */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <input
            type="text"
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
            placeholder="Add context note (e.g., Organic Chem exam in 3 days, slept 7h, coffee consumed...)"
            maxLength={140}
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1E243A]/20 bg-white"
            onKeyDown={(e) => e.key === 'Enter' && handleGeneratePlan()}
          />
          <button
            onClick={handleGeneratePlan}
            className="px-5 py-2.5 rounded-xl bg-[#1E243A] text-white text-xs font-semibold hover:bg-[#121625] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E8A33D]" />
            <span>Regenerate & Log Mood</span>
          </button>
        </div>
      </section>

      {/* Today's Adaptive Timeline */}
      <section className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
        {/* Timeline Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-[#1E243A]">
                Today's Adaptive Revision Timeline
              </h2>
              <span className="text-[11px] font-mono-code px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] font-medium">
                {planBlocks.filter(b => b.type === 'work').length} work blocks
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Slices your syllabus tasks into calibrated sessions with rhythmic pauses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {planBlocks.length > 0 && (
              <div className="hidden md:flex items-center gap-4 text-xs font-mono-code text-[#64748B] mr-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#3D7A5C]" />
                  <strong className="text-[#1E243A]">{planStats.focusMinutes}m</strong> focus
                </span>
                <span className="flex items-center gap-1">
                  <Coffee className="w-3 h-3 text-[#D97706]" />
                  <strong className="text-[#1E243A]">{planStats.breakMinutes}m</strong> breaks
                </span>
              </div>
            )}

            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Quick Task</span>
            </button>
          </div>
        </div>

        {/* Quick Add Task Form */}
        {showQuickAdd && (
          <form 
            onSubmit={handleCreateQuickTask}
            className="p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[#1E243A]">
              <span>Add Immediate Task to Today's Queue</span>
              <button 
                type="button" 
                onClick={() => setShowQuickAdd(false)}
                className="text-[#94A3B8] hover:text-[#1E243A] text-base"
              >
                &times;
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Task description (e.g. Practice 2024 Exam Q3-Q6)"
                value={quickTaskName}
                onChange={(e) => setQuickTaskName(e.target.value)}
                className="sm:col-span-2 text-xs px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none"
                required
              />
              <input
                type="number"
                min={10}
                step={5}
                value={quickTaskMins}
                onChange={(e) => setQuickTaskMins(Number(e.target.value))}
                className="text-xs px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none"
                placeholder="mins"
              />
              <select
                value={quickTaskPri}
                onChange={(e) => setQuickTaskPri(e.target.value as any)}
                className="text-xs px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none"
              >
                <option value="high">High Priority</option>
                <option value="med">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            {exams.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#64748B]">Link Exam:</span>
                <select
                  value={quickTaskExamId}
                  onChange={(e) => setQuickTaskExamId(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none"
                >
                  <option value="">None (General Study)</option>
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.courseCode} - {e.title}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="ml-auto px-4 py-1.5 rounded-lg bg-[#1E243A] text-white text-xs font-semibold hover:bg-black cursor-pointer"
                >
                  Add Block
                </button>
              </div>
            )}
          </form>
        )}

        {/* Ruled Paper / Timeline Blocks */}
        {planBlocks.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-xl bg-[#F8FAFC] border border-dashed border-[#CBD5E1] space-y-2">
            <p className="text-sm font-semibold text-[#1E243A]">
              All tasks completed or queue is empty!
            </p>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Add upcoming exam review tasks from the <strong>Tasks & Syllabus</strong> tab or click <strong>Quick Task</strong> above to construct your adaptive schedule.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 pt-1">
            {planBlocks.map((block, idx) => {
              const isBreak = block.type === 'break';
              const isCompleted = completedBlocks[block.id];

              if (isBreak) {
                return (
                  <div 
                    key={block.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-xl bg-[#F1F5F9]/70 border border-dashed border-[#CBD5E1] text-[#64748B]"
                  >
                    <div className="w-16 shrink-0 font-mono-code text-[11px] text-[#94A3B8]">
                      {block.startTime}
                    </div>
                    <div className="flex-1 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Coffee className="w-3.5 h-3.5 text-[#D97706]" />
                        <span className="font-medium text-[#475569]">
                          {block.name}
                        </span>
                      </div>
                      <span className="font-mono-code text-[11px] text-[#94A3B8]">
                        {block.mins} min rest
                      </span>
                    </div>
                  </div>
                );
              }

              // Work Block
              const priColor =
                block.pri === 'high'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : block.pri === 'med'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800';

              return (
                <div
                  key={block.id}
                  className={`group flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-60'
                      : 'bg-white border-[#CBD5E1] hover:border-[#94A3B8] shadow-xs hover:shadow-sm'
                  }`}
                >
                  {/* Start time */}
                  <div className="w-16 shrink-0 font-mono-code text-[11px] font-medium text-[#64748B]">
                    {block.startTime}
                  </div>

                  {/* Block checkbox */}
                  <button
                    onClick={() => toggleBlockCompleted(block.id, block.taskId)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'bg-[#1E243A] border-[#1E243A] text-white'
                        : 'border-[#94A3B8] hover:border-[#1E243A]'
                    }`}
                    title="Mark block completed"
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5" />}
                  </button>

                  {/* Task details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {block.examTitle && (
                        <span className="text-[10px] font-bold font-mono-code px-1.5 py-0.5 rounded bg-[#1E243A] text-white">
                          {block.examTitle}
                        </span>
                      )}
                      <span className={`text-xs font-semibold ${isCompleted ? 'line-through text-[#94A3B8]' : 'text-[#1E243A]'}`}>
                        {block.name}
                      </span>
                      {block.pri && (
                        <span className={`text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${priColor}`}>
                          {block.pri}
                        </span>
                      )}
                    </div>

                    {block.tips && !isCompleted && (
                      <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1 italic">
                        Tip: {block.tips}
                      </p>
                    )}
                  </div>

                  {/* Duration and Launch Focus Mode */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono-code text-xs font-semibold text-[#64748B]">
                      {block.mins}m
                    </span>

                    {!isCompleted && (
                      <button
                        onClick={() => onStartActiveSession(block)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E243A] hover:bg-black text-white text-xs font-semibold transition-all shadow-xs hover:shadow-sm cursor-pointer"
                        title="Open interactive Pomodoro timer for this study block"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span className="hidden sm:inline">Focus</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
