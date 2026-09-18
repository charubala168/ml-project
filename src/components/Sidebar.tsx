import React, { useState } from 'react';
import { 
  CalendarDays, 
  CheckSquare, 
  BarChart3, 
  Clock, 
  Volume2, 
  VolumeX, 
  Download, 
  RotateCcw,
  Sparkles,
  Flame,
  BookOpen
} from 'lucide-react';
import { Exam, StudentStats } from '../types';
import { getExamCountdown } from '../utils/planner';
import { sounds } from '../utils/audio';

interface SidebarProps {
  currentTab: 'today' | 'exams' | 'tasks' | 'analytics';
  onSelectTab: (tab: 'today' | 'exams' | 'tasks' | 'analytics') => void;
  exams: Exam[];
  stats: StudentStats;
  onOpenAIRoadmap: () => void;
  onExport: () => void;
  onReset: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  exams,
  stats,
  onOpenAIRoadmap,
  onExport,
  onReset,
}) => {
  const [ambientPlaying, setAmbientPlaying] = useState(false);

  // Find nearest upcoming exam
  const now = new Date().getTime();
  const upcomingExams = exams
    .filter(e => new Date(e.dateTime).getTime() > now)
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  const nextExam = upcomingExams[0];
  const countdown = nextExam ? getExamCountdown(nextExam.dateTime) : null;

  const toggleAmbientSound = () => {
    const newState = sounds.toggleFocusNoise();
    setAmbientPlaying(newState);
  };

  interface NavItem {
    id: 'today' | 'exams' | 'tasks' | 'analytics';
    index: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'today', index: '01', label: 'Today & Plan', icon: Clock },
    { id: 'exams', index: '02', label: 'Exam Schedules', icon: CalendarDays, badge: upcomingExams.length },
    { id: 'tasks', index: '03', label: 'Tasks & Syllabus', icon: CheckSquare },
    { id: 'analytics', index: '04', label: 'Progress & Logs', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-[#1B2032] text-[#EEF1F6] flex flex-col justify-between shrink-0 p-5 border-r border-[#2C344E] select-none min-h-screen">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8A33D] to-[#D97706] flex items-center justify-center text-white shadow-sm font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                Inkling<span className="text-[#E8A33D]">.</span>
              </span>
              <p className="text-[10.5px] uppercase tracking-wider text-[#7E8BA9] font-semibold -mt-1">
                Study & Exam OS
              </p>
            </div>
          </div>

          {/* Daily streak badge */}
          <div 
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#272F47] border border-[#374263] text-xs text-[#F59E0B] font-medium"
            title={`${stats.currentStreak} day study streak!`}
          >
            <Flame className="w-3.5 h-3.5 fill-[#F59E0B]" />
            <span>{stats.currentStreak}d</span>
          </div>
        </div>

        {/* AI Copilot shortcut button */}
        <button
          onClick={onOpenAIRoadmap}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#29324E] to-[#20273D] border border-[#3C476A] hover:border-[#E8A33D]/60 text-white flex items-center justify-between text-xs font-medium transition-all group shadow-sm hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E8A33D] group-hover:scale-110 transition-transform" />
            <span>AI Revision Assistant</span>
          </div>
          <span className="text-[10px] bg-[#E8A33D]/20 text-[#F6BD60] px-1.5 py-0.5 rounded font-mono-code font-semibold">
            Blitz
          </span>
        </button>

        {/* Navigation Tabs */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-[#2B3553] text-white shadow-inner font-semibold border-l-2 border-[#E8A33D]'
                    : 'text-[#9BA5C2] hover:bg-[#222941] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono-code text-[11px] text-[#657299] w-4">
                    {item.index}
                  </span>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#E8A33D]' : 'text-[#7C88AE]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10.5px] px-1.5 py-0.5 rounded-full bg-[#343F63] text-[#D3DBF0] font-mono-code">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Nearest Exam Countdown Banner */}
        {nextExam && countdown && (
          <div className="p-3.5 rounded-xl bg-[#232B44] border border-[#333E60] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A98BE]">
                Nearest Exam
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono-code ${
                countdown.urgency === 'critical'
                  ? 'bg-rose-900/60 text-rose-200 border border-rose-700/50'
                  : 'bg-amber-900/40 text-amber-200 border border-amber-700/50'
              }`}>
                {countdown.text}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white line-clamp-1">
                {nextExam.courseCode}: {nextExam.title}
              </p>
              <p className="text-[11px] text-[#8694B8] flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3 text-[#6A789E]" />
                {new Date(nextExam.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                {new Date(nextExam.dateTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="pt-4 border-t border-[#29324E] space-y-2 text-xs text-[#7A86A8]">
        {/* Ambient focus sound toggle */}
        <button
          onClick={toggleAmbientSound}
          className={`w-full py-2 px-3 rounded-lg flex items-center justify-between transition-colors cursor-pointer text-xs ${
            ambientPlaying
              ? 'bg-[#2E3C66] text-[#60A5FA] border border-[#3B82F6]/40'
              : 'hover:bg-[#232B43] text-[#93A1C6]'
          }`}
          title="Gentle brown noise for studying concentration"
        >
          <div className="flex items-center gap-2">
            {ambientPlaying ? (
              <Volume2 className="w-3.5 h-3.5 text-[#60A5FA] animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-[#7381A5]" />
            )}
            <span>Brown Noise Ambience</span>
          </div>
          <span className="text-[10px] font-mono-code font-medium">
            {ambientPlaying ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Data actions */}
        <div className="flex items-center justify-between pt-2 px-1 text-[11px]">
          <button
            onClick={onExport}
            className="flex items-center gap-1 text-[#8B98BE] hover:text-white transition-colors cursor-pointer"
            title="Export study data as JSON backup"
          >
            <Download className="w-3 h-3" />
            <span>Backup</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[#8B98BE] hover:text-rose-300 transition-colors cursor-pointer"
            title="Reset to sample exam data"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Data</span>
          </button>
        </div>

        <p className="text-[10px] text-[#5D6A8D] pt-1 text-center font-mono-code">
          Inkling Adaptive Planner v2.0
        </p>
      </div>
    </aside>
  );
};
