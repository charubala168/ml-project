import { MoodType, StudyTask, StudyPlanBlock, Exam } from '../types';
import { MOODS } from '../data/sampleData';

function priorityWeight(p: 'high' | 'med' | 'low'): number {
  return p === 'high' ? 0 : p === 'med' ? 1 : 2;
}

/**
 * Builds an adaptive study plan based on tasks, mood profile, and start time.
 */
export function buildAdaptivePlan(
  tasks: StudyTask[],
  mood: MoodType,
  exams: Exam[],
  startHourMinutes?: { hours: number; minutes: number }
): StudyPlanBlock[] {
  if (tasks.length === 0) return [];

  const profile = MOODS[mood] || MOODS.focused;
  
  // Filter out completed tasks
  const pendingTasks = tasks.filter(t => !t.completed);
  if (pendingTasks.length === 0) return [];

  let ordered = [...pendingTasks];

  if (profile.order === 'priority') {
    ordered.sort((a, b) => priorityWeight(a.pri) - priorityWeight(b.pri));
  } else if (profile.order === 'asc') {
    ordered.sort((a, b) => a.mins - b.mins);
  } else if (profile.order === 'priority-first-small') {
    // For stressed students: take smallest high-priority task first to get an immediate victory
    ordered.sort((a, b) => {
      const pw = priorityWeight(a.pri) - priorityWeight(b.pri);
      if (pw !== 0) return pw;
      return a.mins - b.mins;
    });
  }

  // Slice each task into blocks no longer than profile.block, inserting breaks
  const rawBlocks: Array<{
    type: 'work' | 'break';
    name: string;
    mins: number;
    pri?: 'high' | 'med' | 'low';
    taskId?: string;
    examTitle?: string;
    tips?: string;
  }> = [];

  ordered.forEach(task => {
    let remaining = task.mins;
    let part = 1;
    const parts = Math.ceil(task.mins / profile.block);
    const linkedExam = task.examId ? exams.find(e => e.id === task.examId) : undefined;

    while (remaining > 0) {
      const dur = Math.min(profile.block, remaining);
      rawBlocks.push({
        type: 'work',
        name: parts > 1 ? `${task.name} (${part}/${parts})` : task.name,
        mins: dur,
        pri: task.pri,
        taskId: task.id,
        examTitle: linkedExam ? linkedExam.courseCode : undefined,
        tips: task.tips
      });
      remaining -= dur;
      part++;

      if (remaining > 0) {
        rawBlocks.push({
          type: 'break',
          name: profile.brk >= 12 ? 'Relaxation & Stretch Break' : 'Hydration & Movement Break',
          mins: profile.brk,
        });
      }
    }

    // Insert a break between tasks
    rawBlocks.push({
      type: 'break',
      name: profile.brk >= 12 ? 'Mental Reset Break' : 'Short Break',
      mins: profile.brk,
    });
  });

  // Remove trailing break if present
  if (rawBlocks.length > 0 && rawBlocks[rawBlocks.length - 1].type === 'break') {
    rawBlocks.pop();
  }

  // Calculate start and end times for each block
  let cursorTime = new Date();
  if (startHourMinutes) {
    cursorTime.setHours(startHourMinutes.hours, startHourMinutes.minutes, 0, 0);
  } else {
    // Round to nearest 5 minutes
    cursorTime.setMinutes(Math.ceil(cursorTime.getMinutes() / 5) * 5, 0, 0);
  }

  return rawBlocks.map((b, idx) => {
    const blockStart = new Date(cursorTime);
    cursorTime = new Date(cursorTime.getTime() + b.mins * 60000);
    const blockEnd = new Date(cursorTime);

    const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    return {
      id: `block-${idx}-${Date.now()}`,
      type: b.type,
      name: b.name,
      mins: b.mins,
      pri: b.pri,
      taskId: b.taskId,
      examTitle: b.examTitle,
      startTime: formatTime(blockStart),
      endTime: formatTime(blockEnd),
      completed: false,
      tips: b.tips,
    };
  });
}

/**
 * Calculates exam countdown and urgency status
 */
export interface ExamCountdown {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
  text: string;
  urgency: 'critical' | 'soon' | 'moderate' | 'relaxed';
}

export function getExamCountdown(dateTimeIso: string): ExamCountdown {
  const target = new Date(dateTimeIso).getTime();
  const now = new Date().getTime();
  const diff = target - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      isPast: true,
      text: 'Exam completed or in progress',
      urgency: 'critical',
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let text = '';
  let urgency: 'critical' | 'soon' | 'moderate' | 'relaxed' = 'relaxed';

  if (days === 0) {
    text = `Today! In ${hours}h ${minutes}m`;
    urgency = 'critical';
  } else if (days === 1) {
    text = `Tomorrow (${hours}h remaining)`;
    urgency = 'critical';
  } else if (days <= 3) {
    text = `${days} days ${hours}h`;
    urgency = 'critical';
  } else if (days <= 7) {
    text = `${days} days away`;
    urgency = 'soon';
  } else if (days <= 14) {
    text = `${days} days away`;
    urgency = 'moderate';
  } else {
    text = `${days} days away`;
    urgency = 'relaxed';
  }

  return { days, hours, minutes, isPast: false, text, urgency };
}

/**
 * Calculate syllabus completion percentage for an exam
 */
export function getExamSyllabusProgress(exam: Exam): {
  total: number;
  completed: number;
  percent: number;
} {
  const total = exam.topics.length;
  if (total === 0) return { total: 0, completed: 0, percent: 0 };
  const completed = exam.topics.filter(t => t.completed).length;
  const percent = Math.round((completed / total) * 100);
  return { total, completed, percent };
}

/**
 * Overall readiness score combining exam weights, topics completed, and confidence
 */
export function calculateOverallReadiness(exams: Exam[]): number {
  if (exams.length === 0) return 0;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  exams.forEach(exam => {
    const syllabus = getExamSyllabusProgress(exam);
    // Syllabus progress counts for 70%, confidence rating (1-5) counts for 30%
    const confidenceScore = (exam.confidence / 5) * 100;
    const examScore = (syllabus.percent * 0.7) + (confidenceScore * 0.3);

    const weight = exam.weight || 25;
    totalWeightedScore += examScore * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
}
