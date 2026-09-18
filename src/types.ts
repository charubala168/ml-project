export type MoodType = 'energized' | 'focused' | 'calm' | 'low' | 'stressed';

export interface MoodProfile {
  label: string;
  color: string;
  hex: string;
  block: number;
  brk: number;
  order: 'priority' | 'asc' | 'priority-first-small';
  tag: string;
  tagColor: string;
  description: string;
  advice: string;
}

export interface ExamTopic {
  id: string;
  title: string;
  completed: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Exam {
  id: string;
  courseCode: string;
  title: string;
  dateTime: string; // ISO string for sorting and countdown calculations
  durationMins: number;
  location: string;
  color: string;
  weight: number; // e.g. 35 for 35% of total course mark
  targetGrade: string;
  confidence: number; // 1 to 5
  topics: ExamTopic[];
  notes?: string;
}

export type TaskPriority = 'high' | 'med' | 'low';

export type TaskCategory = 
  | 'Revision' 
  | 'Practice Exam' 
  | 'Problem Set' 
  | 'Flashcards' 
  | 'Reading' 
  | 'Summary Notes';

export interface StudyTask {
  id: string;
  name: string;
  mins: number;
  pri: TaskPriority;
  examId?: string;
  category: TaskCategory;
  completed: boolean;
  completedAt?: string;
  tips?: string;
}

export interface MoodLogEntry {
  id: string;
  mood: MoodType;
  note: string;
  when: string; // ISO string
}

export interface StudyPlanBlock {
  id: string;
  type: 'work' | 'break';
  name: string;
  mins: number;
  pri?: TaskPriority;
  taskId?: string;
  examTitle?: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  tips?: string;
}

export interface CompletedSession {
  id: string;
  timestamp: string;
  taskName: string;
  durationMins: number;
  mood: MoodType;
  notes?: string;
}

export interface StudentStats {
  totalMinutesStudied: number;
  sessionsCompleted: number;
  currentStreak: number;
  lastStudyDate: string;
}
