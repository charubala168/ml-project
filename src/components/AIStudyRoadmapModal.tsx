import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  Clock, 
  Lightbulb, 
  BookOpen, 
  ArrowRight,
  Flame,
  AlertCircle
} from 'lucide-react';
import { Exam, StudyTask, MoodType } from '../types';
import { MOODS } from '../data/sampleData';

interface AIStudyRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  exams: Exam[];
  selectedExam?: Exam | null;
  currentMood: MoodType;
  onImportTasks: (tasks: Omit<StudyTask, 'id'>[]) => void;
}

interface GeneratedPlanTask {
  name: string;
  mins: number;
  pri: 'high' | 'med' | 'low';
  category: any;
  tips: string;
}

export const AIStudyRoadmapModal: React.FC<AIStudyRoadmapModalProps> = ({
  isOpen,
  onClose,
  exams,
  selectedExam,
  currentMood,
  onImportTasks,
}) => {
  if (!isOpen) return null;

  const [targetExamId, setTargetExamId] = useState<string>(
    selectedExam ? selectedExam.id : exams[0]?.id || ''
  );
  const [customSubject, setCustomSubject] = useState('');
  const [customTopics, setCustomTopics] = useState('');
  const [availableHours, setAvailableHours] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedPlanTask[] | null>(null);
  const [imported, setImported] = useState(false);

  const activeExam = exams.find((e) => e.id === targetExamId);
  const profile = MOODS[currentMood] || MOODS.focused;

  const handleGenerate = async () => {
    setIsLoading(true);
    setImported(false);

    const examTitle = activeExam ? activeExam.title : customSubject || 'Upcoming Exam';
    const subject = activeExam ? activeExam.courseCode : customSubject || 'General Study';
    const topics = activeExam
      ? activeExam.topics.map((t) => t.title)
      : customTopics.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      const response = await fetch('/api/ai-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examTitle,
          subject,
          topics,
          targetGrade: activeExam?.targetGrade || 'A',
          availableHours,
          studentMood: currentMood,
        }),
      });

      const data = await response.json();
      if (data.plan && Array.isArray(data.plan)) {
        setGeneratedTasks(data.plan);
      } else {
        throw new Error('Invalid plan format');
      }
    } catch {
      // Fallback generator in case of network issue
      const fallback = [
        {
          name: `${subject}: High-Yield Active Recall & Flashcards`,
          mins: 40,
          pri: 'high' as const,
          category: 'Flashcards',
          tips: 'Use the Feynman technique: articulate core concepts in plain words without looking at notes.',
        },
        {
          name: `${subject}: Timed Practice Problems & Past Questions`,
          mins: 50,
          pri: 'high' as const,
          category: 'Practice Exam',
          tips: 'Simulate strict test timing without glancing at solutions until finished.',
        },
        {
          name: `${subject}: Target Weak Area Deep-Dive`,
          mins: 35,
          pri: 'med' as const,
          category: 'Revision',
          tips: 'Analyze questions missed on previous tests and dissect the underlying mistake.',
        },
        {
          name: `${subject}: Formula & Summary Sheet Synthesis`,
          mins: 30,
          pri: 'low' as const,
          category: 'Summary Notes',
          tips: 'Synthesize only the most crucial formulas and mnemonics onto a single page.',
        },
      ];
      setGeneratedTasks(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportAll = () => {
    if (!generatedTasks) return;

    const tasksToImport: Omit<StudyTask, 'id'>[] = generatedTasks.map((g) => ({
      name: g.name,
      mins: g.mins,
      pri: g.pri,
      category: g.category || 'Revision',
      examId: activeExam ? activeExam.id : undefined,
      tips: g.tips,
      completed: false,
    }));

    onImportTasks(tasksToImport);
    setImported(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F1424]/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1E243A] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E8A33D]/20 text-[#E8A33D]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white leading-tight">
                AI Exam Revision Blitz Assistant
              </h2>
              <p className="text-[11px] text-[#A5B4FC]">
                Converts your exam syllabus and available hours into high-impact revision tasks.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#94A3B8] hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Exam Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">
              Select Target Exam or Course
            </label>
            <select
              value={targetExamId}
              onChange={(e) => setTargetExamId(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white focus:outline-none"
            >
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.courseCode}: {e.title} (Target: {e.targetGrade})
                </option>
              ))}
              <option value="custom">+ Custom Subject / Unlisted Exam</option>
            </select>
          </div>

          {targetExamId === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Subject / Course Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Molecular Biology"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#CBD5E1] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Key Topics (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. PCR, DNA Replication, Western Blotting"
                  value={customTopics}
                  onChange={(e) => setCustomTopics(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#CBD5E1] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Configuration Parameters: Hours & Mood awareness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#475569]">
                  Available Study Hours
                </span>
                <span className="text-xs font-bold font-mono-code text-[#1E243A]">
                  {availableHours} hours
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={16}
                step={1}
                value={availableHours}
                onChange={(e) => setAvailableHours(Number(e.target.value))}
                className="w-full accent-[#1E243A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono-code">
                <span>2 hrs (Sprint)</span>
                <span>8 hrs (Full Day)</span>
                <span>16 hrs (Weekend Blitz)</span>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-xs font-semibold text-[#475569] mb-1">
                Cognitive State Tuning
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: profile.hex }}
                />
                <span className="font-bold text-[#1E243A]">{profile.label}</span>
                <span className="text-[11px] text-[#64748B]">
                  ({profile.block}m focus slices)
                </span>
              </div>
              <p className="text-[10.5px] text-[#64748B] mt-0.5">
                AI will calibrate sprint sizes to avoid cognitive fatigue.
              </p>
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#1E243A] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating High-Yield Revision Plan with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#E8A33D]" />
                <span>Generate Tailored Revision Roadmap</span>
              </>
            )}
          </button>

          {/* Generated Plan Output */}
          {generatedTasks && (
            <div className="space-y-3 pt-2 border-t border-[#F1F5F9] animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-[#1E243A]">
                  Generated Revision Plan ({generatedTasks.length} calibrated tasks)
                </h3>
                <span className="text-xs font-mono-code text-[#64748B]">
                  ~{generatedTasks.reduce((s, t) => s + t.mins, 0)} mins total
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {generatedTasks.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-[#1E243A]">{t.name}</strong>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#475569]">
                          {t.mins} min
                        </span>
                        <span
                          className={`text-[9.5px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            t.pri === 'high'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.pri}
                        </span>
                      </div>
                    </div>
                    {t.tips && (
                      <p className="text-[11px] text-[#64748B] flex items-center gap-1 italic">
                        <Lightbulb className="w-3 h-3 text-[#D97706] shrink-0" />
                        <span>{t.tips}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleImportAll}
                disabled={imported}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  imported
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {imported ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Imported into Study Queue!</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Import All {generatedTasks.length} Tasks to My Schedule</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
