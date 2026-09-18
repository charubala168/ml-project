import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Check, 
  Trash2, 
  Clock, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  Circle,
  HelpCircle,
  BookOpen,
  Tag,
  Flame
} from 'lucide-react';
import { StudyTask, Exam, TaskPriority, TaskCategory } from '../types';

interface TasksViewProps {
  tasks: StudyTask[];
  exams: Exam[];
  onAddTask: (task: Omit<StudyTask, 'id'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenAIRoadmap: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  exams,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onOpenAIRoadmap,
}) => {
  const [filterExamId, setFilterExamId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('pending');
  const [name, setName] = useState('');
  const [mins, setMins] = useState(45);
  const [pri, setPri] = useState<TaskPriority>('high');
  const [category, setCategory] = useState<TaskCategory>('Revision');
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [tips, setTips] = useState('');
  const [showForm, setShowForm] = useState(false);

  const categories: TaskCategory[] = [
    'Revision',
    'Practice Exam',
    'Problem Set',
    'Flashcards',
    'Reading',
    'Summary Notes'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddTask({
      name: name.trim(),
      mins: Number(mins) || 30,
      pri,
      category,
      examId: selectedExamId || undefined,
      tips: tips.trim() || undefined,
      completed: false,
    });

    setName('');
    setTips('');
    setShowForm(false);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterStatus === 'pending' && t.completed) return false;
      if (filterStatus === 'completed' && !t.completed) return false;
      if (filterExamId !== 'all' && t.examId !== filterExamId) return false;
      return true;
    });
  }, [tasks, filterStatus, filterExamId]);

  const stats = useMemo(() => {
    const pending = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);
    const totalPendingMins = pending.reduce((sum, t) => sum + t.mins, 0);
    const highPriCount = pending.filter(t => t.pri === 'high').length;
    return {
      pendingCount: pending.length,
      completedCount: completed.length,
      totalPendingHours: (totalPendingMins / 60).toFixed(1),
      highPriCount,
    };
  }, [tasks]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#1E243A] tracking-tight">
            Study Tasks & Syllabus Slices
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Break down course topics into actionable, timed revision tasks linked to upcoming exams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAIRoadmap}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#1B2032] to-[#2B3553] text-white text-xs font-semibold shadow-sm hover:shadow-md cursor-pointer transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E8A33D]" />
            <span>AI Syllabus Breakdown</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E243A] text-white text-xs font-semibold hover:bg-black transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            Pending Tasks
          </span>
          <p className="font-display text-2xl font-bold text-[#1E243A] mt-0.5">
            {stats.pendingCount}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            Pending Study Load
          </span>
          <p className="font-display text-2xl font-bold text-[#1E243A] mt-0.5">
            {stats.totalPendingHours} <span className="text-sm font-normal text-[#64748B]">hrs</span>
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            High Priority
          </span>
          <p className="font-display text-2xl font-bold text-rose-600 mt-0.5">
            {stats.highPriCount}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            Completed Tasks
          </span>
          <p className="font-display text-2xl font-bold text-emerald-600 mt-0.5">
            {stats.completedCount}
          </p>
        </div>
      </div>

      {/* Create Task Collapsible Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-5 border border-[#CBD5E1] shadow-sm space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
            <h3 className="font-display text-base font-bold text-[#1E243A]">
              Create New Revision Task
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-[#94A3B8] hover:text-[#1E243A] text-lg leading-none"
            >
              &times;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Task Title / Syllabus Topic *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Master Reaction Mechanisms for Carboxylic Acids"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1E243A]/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Estimated Duration (Minutes)
              </label>
              <input
                type="number"
                min={10}
                max={240}
                step={5}
                value={mins}
                onChange={(e) => setMins(Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1E243A]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Priority Level
              </label>
              <select
                value={pri}
                onChange={(e) => setPri(e.target.value as TaskPriority)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1E243A]/20"
              >
                <option value="high">High (Immediate Exam Focus)</option>
                <option value="med">Medium (Standard Revision)</option>
                <option value="low">Low (Light Review / Maintenance)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Study Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1E243A]/20"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Associated Exam
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1E243A]/20"
              >
                <option value="">None (Independent Study)</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.courseCode}: {exam.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Study Technique Tip / Key Concept (Optional)
              </label>
              <input
                type="text"
                value={tips}
                onChange={(e) => setTips(e.target.value)}
                placeholder="e.g. Active recall: sketch all 4 reaction pathways from memory without looking."
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#CBD5E1] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1E243A] text-white text-xs font-semibold hover:bg-black cursor-pointer shadow-sm"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E2E8F0]">
        <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg text-xs font-semibold text-[#64748B]">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filterStatus === 'pending' ? 'bg-white text-[#1E243A] shadow-xs' : 'hover:text-[#1E243A]'
            }`}
          >
            Pending ({stats.pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filterStatus === 'completed' ? 'bg-white text-[#1E243A] shadow-xs' : 'hover:text-[#1E243A]'
            }`}
          >
            Completed ({stats.completedCount})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filterStatus === 'all' ? 'bg-white text-[#1E243A] shadow-xs' : 'hover:text-[#1E243A]'
            }`}
          >
            All ({tasks.length})
          </button>
        </div>

        {/* Filter by Exam */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#64748B]">Filter Exam:</span>
          <select
            value={filterExamId}
            onChange={(e) => setFilterExamId(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none"
          >
            <option value="all">All Exams & Topics</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.courseCode} - {exam.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#CBD5E1] space-y-2">
            <BookOpen className="w-8 h-8 text-[#94A3B8] mx-auto" />
            <p className="text-sm font-semibold text-[#1E243A]">
              No tasks found in this view
            </p>
            <p className="text-xs text-[#64748B]">
              Add a new task or adjust your filters above.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const linkedExam = exams.find((e) => e.id === task.examId);

            const priBadge =
              task.pri === 'high'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : task.pri === 'med'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200';

            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-60'
                    : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs'
                }`}
              >
                {/* Complete checkbox */}
                <button
                  onClick={() => onToggleTask(task.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    task.completed
                      ? 'bg-[#1E243A] border-[#1E243A] text-white'
                      : 'border-[#94A3B8] hover:border-[#1E243A]'
                  }`}
                >
                  {task.completed && <Check className="w-3.5 h-3.5" />}
                </button>

                {/* Priority dot */}
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    task.pri === 'high'
                      ? 'bg-rose-500'
                      : task.pri === 'med'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  title={`${task.pri} priority`}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {linkedExam && (
                      <span className="text-[10px] font-bold font-mono-code px-1.5 py-0.5 rounded bg-[#1E243A] text-white">
                        {linkedExam.courseCode}
                      </span>
                    )}

                    <span
                      className={`text-xs font-semibold ${
                        task.completed ? 'line-through text-[#94A3B8]' : 'text-[#1E243A]'
                      }`}
                    >
                      {task.name}
                    </span>

                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B]">
                      {task.category}
                    </span>

                    <span
                      className={`text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${priBadge}`}
                    >
                      {task.pri}
                    </span>
                  </div>

                  {task.tips && (
                    <p className="text-[11px] text-[#64748B] mt-0.5 italic">
                      Tip: {task.tips}
                    </p>
                  )}
                </div>

                {/* Duration & Delete */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono-code text-xs font-semibold text-[#64748B]">
                    {task.mins}m
                  </span>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-[#94A3B8] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
