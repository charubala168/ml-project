import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  X, 
  Clock, 
  Coffee, 
  Volume2, 
  VolumeX,
  FileText,
  Sparkles,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudyPlanBlock, MoodType } from '../types';
import { MOODS } from '../data/sampleData';
import { sounds } from '../utils/audio';

interface ActiveSessionModalProps {
  block: StudyPlanBlock | null;
  onClose: () => void;
  onCompleteBlock: (blockId: string, taskId?: string, notes?: string) => void;
  currentMood: MoodType;
}

export const ActiveSessionModal: React.FC<ActiveSessionModalProps> = ({
  block,
  onClose,
  onCompleteBlock,
  currentMood,
}) => {
  if (!block) return null;

  const totalSeconds = block.mins * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [ambientActive, setAmbientActive] = useState(sounds.getIsFocusNoisePlaying());

  const profile = MOODS[currentMood] || MOODS.focused;

  useEffect(() => {
    setSecondsRemaining(block.mins * 60);
    setIsActive(true);
    sounds.playChime('start');
  }, [block]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
      handleBlockFinished();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  const handleBlockFinished = () => {
    sounds.playChime('complete');
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const handleTogglePlay = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsRemaining(totalSeconds);
  };

  const handleComplete = () => {
    sounds.playChime('complete');
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {}
    onCompleteBlock(block.id, block.taskId, notes);
    onClose();
  };

  const toggleNoise = () => {
    const state = sounds.toggleFocusNoise();
    setAmbientActive(state);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - secondsRemaining) / totalSeconds) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-[#0F1424]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#1E243A] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: profile.hex }}
            />
            <span className="text-xs font-mono-code uppercase tracking-wider text-[#A5B4FC]">
              {profile.label} Focus Interval
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleNoise}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                ambientActive
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Toggle brown noise focus sound"
            >
              {ambientActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-[#94A3B8] hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 bg-gradient-to-b from-[#F8FAFC] to-white">
          {block.examTitle && (
            <span className="text-xs font-bold font-mono-code px-2.5 py-1 rounded-full bg-[#1E243A] text-white">
              {block.examTitle}
            </span>
          )}

          <h2 className="font-display text-2xl font-bold text-[#1E243A] max-w-md">
            {block.name}
          </h2>

          {block.tips && (
            <p className="text-xs text-[#64748B] italic max-w-sm bg-white p-2 rounded-lg border border-[#E2E8F0]">
              💡 Strategy: {block.tips}
            </p>
          )}

          {/* Big Digital Clock */}
          <div className="pt-2">
            <div className="font-mono-code text-6xl font-extrabold tracking-tight text-[#1E243A]">
              {timeFormatted}
            </div>
            <p className="text-xs text-[#64748B] font-mono-code mt-1">
              {secondsRemaining === 0 ? 'Session Complete!' : isActive ? 'Sprint in progress' : 'Paused'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-64 h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: profile.hex,
              }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 pt-3">
            <button
              onClick={handleReset}
              className="p-3 rounded-2xl border border-[#CBD5E1] text-[#64748B] hover:text-[#1E243A] hover:bg-[#F1F5F9] cursor-pointer transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="px-8 py-3.5 rounded-2xl bg-[#1E243A] hover:bg-black text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#1E243A]/20 cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Resume</span>
                </>
              )}
            </button>

            <button
              onClick={handleComplete}
              className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-transform hover:scale-105"
              title="Mark as Completed"
            >
              <Check className="w-4 h-4" />
              <span>Done</span>
            </button>
          </div>
        </div>

        {/* Scratchpad for notes during study */}
        <div className="p-6 bg-[#F8FAFC] border-t border-[#E2E8F0] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
            <FileText className="w-3.5 h-3.5" />
            <span>Active Scratchpad (Formulas, Questions, Reminders)</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Jot down quick thoughts, formulas to review, or doubts for office hours..."
            rows={3}
            className="w-full text-xs p-3 rounded-xl border border-[#CBD5E1] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E243A]/20"
          />
        </div>
      </div>
    </div>
  );
};
