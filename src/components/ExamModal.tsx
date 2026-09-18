import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Clock, MapPin, Award, Star } from 'lucide-react';
import { Exam, ExamTopic } from '../types';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exam: Exam) => void;
  initialExam?: Exam | null;
}

const COLOR_OPTIONS = [
  '#3D7A5C', // Forest Green
  '#4C7EA8', // Slate Blue
  '#E8A33D', // Amber
  '#8B6FB3', // Purple
  '#C0554A', // Crimson Red
  '#2B3553', // Deep Ink
];

export const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialExam,
}) => {
  if (!isOpen) return null;

  const [courseCode, setCourseCode] = useState('');
  const [title, setTitle] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [durationMins, setDurationMins] = useState(120);
  const [location, setLocation] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [weight, setWeight] = useState(30);
  const [targetGrade, setTargetGrade] = useState('A');
  const [confidence, setConfidence] = useState(3);
  const [notes, setNotes] = useState('');
  const [topics, setTopics] = useState<ExamTopic[]>([]);
  const [newTopicText, setNewTopicText] = useState('');

  useEffect(() => {
    if (initialExam) {
      setCourseCode(initialExam.courseCode);
      setTitle(initialExam.title);
      // Format datetime-local
      const d = new Date(initialExam.dateTime);
      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDateTime(iso);
      setDurationMins(initialExam.durationMins || 120);
      setLocation(initialExam.location || '');
      setColor(initialExam.color || COLOR_OPTIONS[0]);
      setWeight(initialExam.weight || 30);
      setTargetGrade(initialExam.targetGrade || 'A');
      setConfidence(initialExam.confidence || 3);
      setNotes(initialExam.notes || '');
      setTopics(initialExam.topics || []);
    } else {
      // Default to 5 days from now at 10:00 AM
      const def = new Date();
      def.setDate(def.getDate() + 5);
      def.setHours(10, 0, 0, 0);
      const iso = new Date(def.getTime() - def.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDateTime(iso);
      setCourseCode('');
      setTitle('');
      setDurationMins(120);
      setLocation('');
      setColor(COLOR_OPTIONS[0]);
      setWeight(30);
      setTargetGrade('A');
      setConfidence(3);
      setNotes('');
      setTopics([
        { id: `t-${Date.now()}-1`, title: 'Core Concepts & Fundamentals', completed: false },
        { id: `t-${Date.now()}-2`, title: 'High-Yield Practice Questions', completed: false },
      ]);
    }
  }, [initialExam, isOpen]);

  const handleAddTopic = () => {
    if (!newTopicText.trim()) return;
    setTopics([
      ...topics,
      {
        id: `t-${Date.now()}`,
        title: newTopicText.trim(),
        completed: false,
      },
    ]);
    setNewTopicText('');
  };

  const handleRemoveTopic = (id: string) => {
    setTopics(topics.filter((t) => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !title.trim() || !dateTime) return;

    const examData: Exam = {
      id: initialExam ? initialExam.id : `exam-${Date.now()}`,
      courseCode: courseCode.trim().toUpperCase(),
      title: title.trim(),
      dateTime: new Date(dateTime).toISOString(),
      durationMins: Number(durationMins) || 120,
      location: location.trim() || 'Exam Hall TBA',
      color,
      weight: Number(weight) || 30,
      targetGrade: targetGrade.trim() || 'A',
      confidence,
      notes: notes.trim() || undefined,
      topics,
    };

    onSave(examData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F1424]/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-[#1E243A]">
              {initialExam ? 'Edit Exam Milestone' : 'Schedule New Exam'}
            </h2>
            <p className="text-xs text-[#64748B]">
              Define dates, weight, target grade, and syllabus review topics.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#94A3B8] hover:text-[#1E243A] rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Course Code *
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. CHEM 201"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#CBD5E1] focus:outline-none uppercase font-mono-code font-bold"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Exam Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Organic Chemistry II Midterm"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#CBD5E1] focus:outline-none font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Exam Date & Time *
              </label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#CBD5E1] focus:outline-none font-mono-code"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Exam Duration (Minutes)
              </label>
              <input
                type="number"
                min={30}
                max={360}
                step={15}
                value={durationMins}
                onChange={(e) => setDurationMins(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#CBD5E1] focus:outline-none font-mono-code"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Exam Hall / Room / Format
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Science Auditorium Rm 102"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#CBD5E1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Course Weight (%)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#CBD5E1] focus:outline-none font-mono-code"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Target Grade
              </label>
              <input
                type="text"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                placeholder="e.g. A (92%)"
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#CBD5E1] focus:outline-none font-semibold text-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Current Confidence (1 to 5)
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setConfidence(star)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= confidence ? 'fill-amber-400' : 'text-[#CBD5E1]'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-mono-code font-semibold text-[#64748B] ml-1">
                  {confidence}/5
                </span>
              </div>
            </div>
          </div>

          {/* Color theme picker */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    color === c ? 'scale-110 border-[#1E243A]' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Syllabus Topics Section */}
          <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
            <label className="block text-xs font-semibold text-[#475569]">
              Syllabus Coverage Topics ({topics.length})
            </label>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {topics.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs"
                >
                  <span className="truncate flex-1 text-[#334155]">{t.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(t.id)}
                    className="text-[#94A3B8] hover:text-rose-600 cursor-pointer p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTopicText}
                onChange={(e) => setNewTopicText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTopic();
                  }
                }}
                placeholder="Add key topic / chapter / practice paper..."
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-[#CBD5E1] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTopic}
                className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E243A] text-xs font-semibold cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">
              Study Strategy & Focus Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Professor noted Chapters 4 & 7 carry 60% of test points. Memorize formulas on page 112."
              rows={2}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#CBD5E1] focus:outline-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#1E243A] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer shadow-sm"
            >
              {initialExam ? 'Update Exam' : 'Save Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
