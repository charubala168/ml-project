import { Exam, StudyTask, MoodLogEntry, StudentStats } from '../types';
import { getInitialExams, getInitialTasks, getInitialMoodLogs } from '../data/sampleData';

const STORAGE_KEYS = {
  EXAMS: 'inkling_exams_v1',
  TASKS: 'inkling_tasks_v1',
  MOOD_LOG: 'inkling_moodlog_v1',
  STATS: 'inkling_stats_v1',
  SELECTED_MOOD: 'inkling_current_mood_v1',
};

export function loadExams(): Exam[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (!raw) {
      const initial = getInitialExams();
      saveExams(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialExams();
  }
}

export function saveExams(exams: Exam[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
}

export function loadTasks(): StudyTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      const initial = getInitialTasks();
      saveTasks(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialTasks();
  }
}

export function saveTasks(tasks: StudyTask[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
}

export function loadMoodLog(): MoodLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MOOD_LOG);
    if (!raw) {
      const initial = getInitialMoodLogs();
      saveMoodLog(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialMoodLogs();
  }
}

export function saveMoodLog(log: MoodLogEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MOOD_LOG, JSON.stringify(log));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
}

export function loadStats(): StudentStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) {
      const defaultStats: StudentStats = {
        totalMinutesStudied: 320,
        sessionsCompleted: 7,
        currentStreak: 4,
        lastStudyDate: new Date().toISOString(),
      };
      saveStats(defaultStats);
      return defaultStats;
    }
    return JSON.parse(raw);
  } catch {
    return {
      totalMinutesStudied: 320,
      sessionsCompleted: 7,
      currentStreak: 4,
      lastStudyDate: new Date().toISOString(),
    };
  }
}

export function saveStats(stats: StudentStats) {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
}

/**
 * Export all app data as a JSON file download
 */
export function exportAppData(exams: Exam[], tasks: StudyTask[], moodLog: MoodLogEntry[], stats: StudentStats) {
  const data = {
    appName: 'Inkling Study Planner',
    version: '1.0',
    exportDate: new Date().toISOString(),
    exams,
    tasks,
    moodLog,
    stats,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inkling-study-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Reset data back to clean sample data
 */
export function resetToSampleData(): {
  exams: Exam[];
  tasks: StudyTask[];
  moodLog: MoodLogEntry[];
  stats: StudentStats;
} {
  const exams = getInitialExams();
  const tasks = getInitialTasks();
  const moodLog = getInitialMoodLogs();
  const stats: StudentStats = {
    totalMinutesStudied: 320,
    sessionsCompleted: 7,
    currentStreak: 4,
    lastStudyDate: new Date().toISOString(),
  };

  saveExams(exams);
  saveTasks(tasks);
  saveMoodLog(moodLog);
  saveStats(stats);

  return { exams, tasks, moodLog, stats };
}
