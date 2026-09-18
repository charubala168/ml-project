import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TodayView } from './components/TodayView';
import { ExamsView } from './components/ExamsView';
import { TasksView } from './components/TasksView';
import { AnalyticsView } from './components/AnalyticsView';
import { ActiveSessionModal } from './components/ActiveSessionModal';
import { ExamModal } from './components/ExamModal';
import { AIStudyRoadmapModal } from './components/AIStudyRoadmapModal';

import { 
  Exam, 
  StudyTask, 
  MoodLogEntry, 
  StudentStats, 
  MoodType, 
  StudyPlanBlock 
} from './types';

import { 
  loadExams, 
  saveExams, 
  loadTasks, 
  saveTasks, 
  loadMoodLog, 
  saveMoodLog, 
  loadStats, 
  saveStats, 
  exportAppData, 
  resetToSampleData 
} from './utils/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'today' | 'exams' | 'tasks' | 'analytics'>('today');
  const [selectedMood, setSelectedMood] = useState<MoodType>('focused');

  // Core app data state
  const [exams, setExams] = useState<Exam[]>(loadExams);
  const [tasks, setTasks] = useState<StudyTask[]>(loadTasks);
  const [moodLog, setMoodLog] = useState<MoodLogEntry[]>(loadMoodLog);
  const [stats, setStats] = useState<StudentStats>(loadStats);

  // Modals state
  const [activeSessionBlock, setActiveSessionBlock] = useState<StudyPlanBlock | null>(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isAIRoadmapOpen, setIsAIRoadmapOpen] = useState(false);
  const [aiTargetExam, setAiTargetExam] = useState<Exam | null>(null);

  // Notification / toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Persist on state changes
  useEffect(() => {
    saveExams(exams);
  }, [exams]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveMoodLog(moodLog);
  }, [moodLog]);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  // Exam handlers
  const handleSaveExam = (exam: Exam) => {
    setExams((prev) => {
      const exists = prev.some((e) => e.id === exam.id);
      if (exists) {
        return prev.map((e) => (e.id === exam.id ? exam : e));
      }
      return [...prev, exam];
    });
    showToast(`Exam ${exam.courseCode} saved successfully.`);
  };

  const handleDeleteExam = (examId: string) => {
    setExams((prev) => prev.filter((e) => e.id !== examId));
    // Unlink tasks
    setTasks((prev) =>
      prev.map((t) => (t.examId === examId ? { ...t, examId: undefined } : t))
    );
    showToast('Exam removed.');
  };

  const handleToggleTopic = (examId: string, topicId: string) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id !== examId) return e;
        return {
          ...e,
          topics: e.topics.map((t) =>
            t.id === topicId ? { ...t, completed: !t.completed } : t
          ),
        };
      })
    );
  };

  const handleAddTopicToExam = (examId: string, topicTitle: string) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id !== examId) return e;
        return {
          ...e,
          topics: [
            ...e.topics,
            {
              id: `topic-${Date.now()}`,
              title: topicTitle,
              completed: false,
            },
          ],
        };
      })
    );
  };

  const handleUpdateConfidence = (examId: string, confidence: number) => {
    setExams((prev) =>
      prev.map((e) => (e.id === examId ? { ...e, confidence } : e))
    );
  };

  // Task handlers
  const handleAddTask = (newTask: Omit<StudyTask, 'id'>) => {
    const task: StudyTask = {
      ...newTask,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [task, ...prev]);
    showToast('Study task added to queue.');
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nowCompleted = !t.completed;
        if (nowCompleted) {
          // Increment completed stats
          setStats((curr) => ({
            ...curr,
            sessionsCompleted: curr.sessionsCompleted + 1,
            totalMinutesStudied: curr.totalMinutesStudied + t.mins,
          }));
        }
        return {
          ...t,
          completed: nowCompleted,
          completedAt: nowCompleted ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Task removed.');
  };

  const handleImportAITasks = (newTasks: Omit<StudyTask, 'id'>[]) => {
    const created: StudyTask[] = newTasks.map((t, idx) => ({
      ...t,
      id: `ai-task-${Date.now()}-${idx}`,
    }));
    setTasks((prev) => [...created, ...prev]);
    showToast(`Imported ${newTasks.length} AI revision tasks into study plan.`);
    setCurrentTab('tasks');
  };

  // Mood handlers
  const handleSaveMoodLog = (entry: Omit<MoodLogEntry, 'id'>) => {
    const log: MoodLogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
    };
    setMoodLog((prev) => [log, ...prev]);
    showToast('Cognitive check-in logged and schedule regenerated.');
  };

  // Active Session Complete handler
  const handleCompleteBlock = (blockId: string, taskId?: string, notes?: string) => {
    if (taskId) {
      handleToggleTask(taskId);
    }
    setStats((curr) => ({
      ...curr,
      sessionsCompleted: curr.sessionsCompleted + 1,
      totalMinutesStudied: curr.totalMinutesStudied + 45,
    }));
    showToast('Focus session completed! Great study momentum.');
  };

  // Data reset & export
  const handleExportData = () => {
    exportAppData(exams, tasks, moodLog, stats);
    showToast('Study plan backup downloaded.');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all study data and exams back to default starter courses?')) {
      const reset = resetToSampleData();
      setExams(reset.exams);
      setTasks(reset.tasks);
      setMoodLog(reset.moodLog);
      setStats(reset.stats);
      showToast('Reset to default course catalog.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F3F5FA] text-[#1E243A]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        exams={exams}
        stats={stats}
        onOpenAIRoadmap={() => {
          setAiTargetExam(null);
          setIsAIRoadmapOpen(true);
        }}
        onExport={handleExportData}
        onReset={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto overflow-y-auto">
        {currentTab === 'today' && (
          <TodayView
            selectedMood={selectedMood}
            onSelectMood={setSelectedMood}
            tasks={tasks}
            exams={exams}
            onAddTask={handleAddTask}
            onToggleTaskComplete={handleToggleTask}
            onSaveMoodLog={handleSaveMoodLog}
            onStartActiveSession={(block) => setActiveSessionBlock(block)}
            onOpenAIRoadmap={() => {
              setAiTargetExam(null);
              setIsAIRoadmapOpen(true);
            }}
          />
        )}

        {currentTab === 'exams' && (
          <ExamsView
            exams={exams}
            onAddExam={() => {
              setEditingExam(null);
              setIsExamModalOpen(true);
            }}
            onEditExam={(exam) => {
              setEditingExam(exam);
              setIsExamModalOpen(true);
            }}
            onDeleteExam={handleDeleteExam}
            onToggleTopic={handleToggleTopic}
            onAddTopicToExam={handleAddTopicToExam}
            onGenerateExamPlan={(exam) => {
              setAiTargetExam(exam);
              setIsAIRoadmapOpen(true);
            }}
            onUpdateConfidence={handleUpdateConfidence}
          />
        )}

        {currentTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            exams={exams}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onOpenAIRoadmap={() => {
              setAiTargetExam(null);
              setIsAIRoadmapOpen(true);
            }}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            exams={exams}
            tasks={tasks}
            moodLog={moodLog}
            stats={stats}
          />
        )}
      </main>

      {/* Modals */}
      {activeSessionBlock && (
        <ActiveSessionModal
          block={activeSessionBlock}
          onClose={() => setActiveSessionBlock(null)}
          onCompleteBlock={handleCompleteBlock}
          currentMood={selectedMood}
        />
      )}

      {isExamModalOpen && (
        <ExamModal
          isOpen={isExamModalOpen}
          onClose={() => {
            setIsExamModalOpen(false);
            setEditingExam(null);
          }}
          onSave={handleSaveExam}
          initialExam={editingExam}
        />
      )}

      {isAIRoadmapOpen && (
        <AIStudyRoadmapModal
          isOpen={isAIRoadmapOpen}
          onClose={() => {
            setIsAIRoadmapOpen(false);
            setAiTargetExam(null);
          }}
          exams={exams}
          selectedExam={aiTargetExam}
          currentMood={selectedMood}
          onImportTasks={handleImportAITasks}
        />
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E243A] text-white px-4 py-2.5 rounded-xl shadow-xl border border-[#333E60] text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
