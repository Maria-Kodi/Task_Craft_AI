import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const DURATIONS = [25, 45, 60];
const RADIUS = 92;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * FocusMode — a calm, single-task, distraction-free view with a
 * countdown timer and a lightweight subtask checklist. Deliberately
 * quieter than TaskFlowView: flat background, minimal motion, one
 * thing to look at.
 *
 * props:
 *  task           - the task object, or null when closed
 *  subtasks       - subtasks belonging to this task
 *  onClose        - close focus mode
 *  onToggleSubtask(id, newStatus)
 *  onMarkTaskDone(id) - marks the whole task as done and closes
 */
export default function FocusMode({ task, subtasks, onClose, onToggleSubtask, onMarkTaskDone }) {
  const isOpen = !!task;

  const [selectedDuration, setSelectedDuration] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Reset the whole timer state whenever a different task is opened
  useEffect(() => {
    if (task) {
      setSelectedDuration(25);
      setSecondsLeft(25 * 60);
      setIsRunning(false);
      setHasStarted(false);
      setCompleted(false);
    }
  }, [task?._id]);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft <= 0) {
      setIsRunning(false);
      setCompleted(true);
      toast.success('Focus session complete — nice work.', { icon: '🎯' });
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [isRunning, secondsLeft]);

  if (!isOpen) return null;

  const totalSeconds = selectedDuration * 60;
  const elapsed = totalSeconds - secondsLeft;
  const fraction = totalSeconds > 0 ? elapsed / totalSeconds : 0;
  const dashOffset = CIRCUMFERENCE * (1 - fraction);

  const doneCount = subtasks.filter((s) => s.status === 'done').length;

  const handleSelectDuration = (mins) => {
    if (hasStarted) return;
    setSelectedDuration(mins);
    setSecondsLeft(mins * 60);
  };

  const handleStart = () => {
    setHasStarted(true);
    setIsRunning(true);
    setCompleted(false);
  };

  const handlePauseResume = () => setIsRunning((r) => !r);

  const handleReset = () => {
    setSecondsLeft(selectedDuration * 60);
    setIsRunning(false);
    setHasStarted(false);
    setCompleted(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[120] bg-[#0B1130] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-white/8">
            <span className="text-[11px] font-medium tracking-[0.18em] uppercase font-['IBM_Plex_Mono',monospace] text-[#7C82B8]">
              Focus Mode
            </span>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors"
              aria-label="Exit focus mode"
            >
              <svg viewBox="0 0 16 16" width="18" height="18" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col items-center px-6 py-14">
            {/* Task title */}
            <p className="text-[13px] text-[#8791C9] font-['IBM_Plex_Mono',monospace] uppercase tracking-wide mb-2">
              Focusing on
            </p>
            <h2 className="text-[22px] text-white font-['Space_Grotesk',sans-serif] font-medium text-center max-w-md leading-snug mb-10">
              {task.title}
            </h2>

            {/* Timer ring */}
            <div className="relative w-[220px] h-[220px] flex items-center justify-center mb-8">
              <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
                <circle cx="110" cy="110" r={RADIUS} fill="none" stroke="rgba(124,130,184,0.15)" strokeWidth="6" />
                <circle
                  cx="110"
                  cy="110"
                  r={RADIUS}
                  fill="none"
                  stroke={completed ? '#4A9B6E' : '#7C82B8'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[38px] font-['Space_Grotesk',sans-serif] font-medium text-white tabular-nums">
                  {formatTime(secondsLeft)}
                </span>
                {completed && (
                  <span className="text-[11px] text-[#4A9B6E] font-['IBM_Plex_Mono',monospace] uppercase tracking-wide mt-1">
                    Complete
                  </span>
                )}
              </div>
            </div>

            {/* Duration picker — only before a session starts */}
            {!hasStarted && (
              <div className="flex items-center gap-2 mb-6">
                {DURATIONS.map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleSelectDuration(mins)}
                    className={`text-[12.5px] font-medium rounded-full px-4 py-1.5 transition-colors ${
                      selectedDuration === mins
                        ? 'bg-[#7C82B8] text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3 mb-12">
              {!hasStarted ? (
                <button
                  onClick={handleStart}
                  className="rounded-md bg-[#7C82B8] py-2.5 px-7 text-[13.5px] font-semibold text-white hover:bg-[#8791C9] transition-colors"
                >
                  Start focus session
                </button>
              ) : completed ? (
                <button
                  onClick={handleReset}
                  className="text-[13px] font-medium text-white/70 border border-white/15 rounded-md px-5 py-2 hover:bg-white/5 transition-colors"
                >
                  Start another session
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePauseResume}
                    className="rounded-md bg-[#7C82B8] py-2.5 px-7 text-[13.5px] font-semibold text-white hover:bg-[#8791C9] transition-colors"
                  >
                    {isRunning ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="text-[13px] font-medium text-white/60 hover:text-white transition-colors"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>

            {/* Subtask checklist */}
            {subtasks.length > 0 && (
              <div className="w-full max-w-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-medium tracking-[0.18em] uppercase font-['IBM_Plex_Mono',monospace] text-white/40">
                    Steps
                  </span>
                  <span className="text-[11px] text-white/40 font-['IBM_Plex_Mono',monospace]">
                    {doneCount}/{subtasks.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {subtasks.map((sub) => {
                    const isDone = sub.status === 'done';
                    return (
                      <button
                        key={sub._id}
                        onClick={() => onToggleSubtask(sub._id, isDone ? 'todo' : 'done')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                      >
                        <span
                          className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                            isDone ? 'bg-[#4A9B6E] border-[#4A9B6E]' : 'border-white/25'
                          }`}
                        >
                          {isDone && (
                            <svg viewBox="0 0 12 12" width="8" height="8" fill="none">
                              <path d="M2 6l2.5 2.5L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className={`text-[13.5px] ${isDone ? 'text-white/35 line-through' : 'text-white/85'}`}>
                          {sub.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mark task complete */}
            <button
              onClick={() => onMarkTaskDone(task._id)}
              className="mt-10 text-[12.5px] font-medium text-white/40 hover:text-[#4A9B6E] transition-colors"
            >
              Mark task complete →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}