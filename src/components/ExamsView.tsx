import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Award, 
  Plus, 
  CheckCircle, 
  Circle, 
  Star, 
  Sparkles, 
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  BookOpen,
  Filter,
  Check
} from 'lucide-react';
import { Exam, ExamTopic } from '../types';
import { getExamCountdown, getExamSyllabusProgress } from '../utils/planner';

interface ExamsViewProps {
  exams: Exam[];
  onAddExam: () => void;
  onEditExam: (exam: Exam) => void;
  onDeleteExam: (examId: string) => void;
  onToggleTopic: (examId: string, topicId: string) => void;
  onAddTopicToExam: (examId: string, topicTitle: string) => void;
  onGenerateExamPlan: (exam: Exam) => void;
  onUpdateConfidence: (examId: string, confidence: number) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  onAddExam,
  onEditExam,
  onDeleteExam,
  onToggleTopic,
  onAddTopicToExam,
  onGenerateExamPlan,
  onUpdateConfidence,
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [newTopicInputs, setNewTopicInputs] = useState<Record<string, string>>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const now = new Date().getTime();

  // Sort and filter exams
  const filteredExams = exams.filter((exam) => {
    const examTime = new Date(exam.dateTime).getTime();
    if (filter === 'upcoming') return examTime >= now;
    if (filter === 'past') return examTime < now;
    return true;
  }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const handleAddTopic = (examId: string) => {
    const title = (newTopicInputs[examId] || '').trim();
    if (!title) return;
    onAddTopicToExam(examId, title);
    setNewTopicInputs((prev) => ({ ...prev, [examId]: '' }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#1E243A] tracking-tight">
            Exam Schedules & Milestones
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Track exact dates, exam hall locations, syllabus coverage percentages, and target grades.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Filter pills */}
          <div className="flex items-center p-1 bg-[#E2E8F0]/60 rounded-xl text-xs font-semibold text-[#64748B]">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'upcoming' ? 'bg-white text-[#1E243A] shadow-xs' : 'hover:text-[#1E243A]'
              }`}
            >
              Upcoming ({exams.filter(e => new Date(e.dateTime).getTime() >= now).length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'all' ? 'bg-white text-[#1E243A] shadow-xs' : 'hover:text-[#1E243A]'
              }`}
            >
              All ({exams.length})
            </button>
          </div>

          <button
            onClick={onAddExam}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E243A] text-white text-xs font-semibold hover:bg-black transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Exam</span>
          </button>
        </div>
      </div>

      {/* Exam Grid */}
      {filteredExams.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#CBD5E1] space-y-3">
          <BookOpen className="w-10 h-10 text-[#94A3B8] mx-auto stroke-1" />
          <h3 className="font-display text-lg font-bold text-[#1E243A]">
            No {filter === 'upcoming' ? 'upcoming' : ''} exams scheduled
          </h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            Add your midterms, finals, or assessments to generate tailored countdown schedules and topic breakdown lists.
          </p>
          <button
            onClick={onAddExam}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E243A] text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Exam</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredExams.map((exam) => {
            const countdown = getExamCountdown(exam.dateTime);
            const progress = getExamSyllabusProgress(exam);
            const examDate = new Date(exam.dateTime);

            const urgencyStyles =
              countdown.urgency === 'critical'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : countdown.urgency === 'soon'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800';

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between relative"
              >
                <div>
                  {/* Top Bar: Course Code, Countdown, Menu */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-xs font-bold font-mono-code px-2.5 py-1 rounded-lg text-white"
                        style={{ backgroundColor: exam.color || '#3D7A5C' }}
                      >
                        {exam.courseCode}
                      </span>
                      <span className={`text-[10.5px] font-bold font-mono-code px-2 py-0.5 rounded-full border ${urgencyStyles}`}>
                        {countdown.text}
                      </span>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === exam.id ? null : exam.id)}
                        className="p-1.5 text-[#94A3B8] hover:text-[#1E243A] rounded-lg hover:bg-[#F1F5F9] cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === exam.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-1 z-10 text-xs">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onEditExam(exam);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#F8FAFC] flex items-center gap-2 text-[#334155] cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Exam</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onDeleteExam(exam.id);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Exam</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Logistics */}
                  <h3 className="font-display text-lg font-bold text-[#1E243A] leading-snug">
                    {exam.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-[#64748B]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>
                        {examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>
                        {examDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} ({exam.durationMins}m)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span className="truncate">{exam.location || 'Location TBA'}</span>
                    </div>
                  </div>

                  {/* Badges: Weight & Target Grade */}
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#F1F5F9] text-xs">
                    <div className="flex items-center gap-1 text-[#475569]">
                      <span className="text-[#94A3B8]">Weight:</span>
                      <strong className="font-mono-code text-[#1E243A]">{exam.weight}%</strong>
                    </div>
                    <div className="flex items-center gap-1 text-[#475569]">
                      <span className="text-[#94A3B8]">Goal:</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono-code">
                        {exam.targetGrade || 'A'}
                      </span>
                    </div>

                    {/* Confidence stars */}
                    <div className="flex items-center gap-0.5 ml-auto" title="Self-assessed confidence level">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => onUpdateConfidence(exam.id, star)}
                          className="text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              star <= exam.confidence ? 'fill-amber-400' : 'text-[#CBD5E1]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Syllabus Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#475569]">Syllabus Covered</span>
                      <span className="font-mono-code font-bold text-[#1E243A]">
                        {progress.completed}/{progress.total} topics ({progress.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress.percent}%`,
                          backgroundColor: exam.color || '#3D7A5C',
                        }}
                      />
                    </div>
                  </div>

                  {/* Topics Checklist */}
                  <div className="mt-3.5 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {exam.topics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => onToggleTopic(exam.id, topic.id)}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F8FAFC] cursor-pointer text-xs group"
                      >
                        <button className="text-[#94A3B8] group-hover:text-[#1E243A] shrink-0">
                          {topic.completed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#CBD5E1]" />
                          )}
                        </button>
                        <span className={`truncate flex-1 ${topic.completed ? 'line-through text-[#94A3B8]' : 'text-[#334155]'}`}>
                          {topic.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add Topic mini-input */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <input
                      type="text"
                      placeholder="+ Add syllabus topic..."
                      value={newTopicInputs[exam.id] || ''}
                      onChange={(e) => setNewTopicInputs({ ...newTopicInputs, [exam.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTopic(exam.id)}
                      className="flex-1 text-[11.5px] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#1E243A] bg-[#F8FAFC]"
                    />
                    <button
                      onClick={() => handleAddTopic(exam.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] text-[11px] font-semibold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Footer Action: AI Blitz Plan */}
                <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B]">
                    {exam.notes ? `Note: ${exam.notes.slice(0, 32)}...` : 'Ready to prepare'}
                  </span>
                  <button
                    onClick={() => onGenerateExamPlan(exam)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#1E243A] hover:text-white text-[#1E243A] text-xs font-semibold border border-[#E2E8F0] hover:border-[#1E243A] transition-all cursor-pointer group shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E8A33D] group-hover:rotate-12 transition-transform" />
                    <span>Generate Blitz Plan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
