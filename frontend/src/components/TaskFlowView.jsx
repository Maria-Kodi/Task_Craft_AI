import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#6B6558' },
  medium: { label: 'Medium', color: '#7C82B8' },
  high: { label: 'High', color: '#C4544A' },
};

const CONTAINER_WIDTH = 760;
const PARENT_WIDTH = 400;
const PARENT_HEIGHT = 95;
const SUB_WIDTH = 400;
const SUB_HEIGHT = 72;
const SUB_GAP = 30;
const TOP_MARGIN = 60;
const BRANCH_GAP = 74;
const JITTER = 50;

function buildLayout(subtaskCount) {
  const parentX = CONTAINER_WIDTH / 2 - PARENT_WIDTH / 2;
  const parentY = TOP_MARGIN;
  const subtasksStartY = parentY + PARENT_HEIGHT + BRANCH_GAP;

  const positions = Array.from({ length: subtaskCount }, (_, i) => {
    const jitter = i % 2 === 0 ? -JITTER : JITTER;
    const x = CONTAINER_WIDTH / 2 - SUB_WIDTH / 2 + jitter;
    const y = subtasksStartY + i * (SUB_HEIGHT + SUB_GAP);
    const startX = parentX + (PARENT_WIDTH * (i + 1)) / (subtaskCount + 1);
    return { x, y, startX };
  });

  const totalHeight =
    subtaskCount > 0
      ? positions[positions.length - 1].y + SUB_HEIGHT + 60
      : parentY + PARENT_HEIGHT + 60;

  return { parentX, parentY, positions, totalHeight };
}

export default function TaskFlowView({ task, subtasks, onClose, onToggleSubtask }) {
  const isOpen = !!task;
  const layout = useMemo(() => buildLayout(subtasks?.length || 0), [subtasks?.length]);

  if (!isOpen) return null;

  const priority = PRIORITY_CONFIG[task.priority || 'medium'];
  const parentBottomY = layout.parentY + PARENT_HEIGHT;

  // Deep near-black indigo — the "expensive matte" card color
  const cardBg = 'linear-gradient(155deg, #10143C 0%, #05061C 100%)';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[120] overflow-y-auto"
          style={{
            background: 'radial-gradient(ellipse at 50% 25%, #10143E 0%, #070921 55%, #030414 100%)',
          }}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between px-8 py-5 border-b border-white/8">
            <span className="text-[11px] font-medium tracking-[0.18em] uppercase font-['IBM_Plex_Mono',monospace] text-[#7C82B8]">
              Task Flow
            </span>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors"
              aria-label="Close flow view"
            >
              <svg viewBox="0 0 16 16" width="18" height="18" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Canvas */}
          <div className="relative flex justify-center px-6 py-16">
            <div
              className="relative"
              style={{ width: CONTAINER_WIDTH, height: layout.totalHeight, maxWidth: '100%' }}
            >
              {/* Connector branches — true round dots, not dashes */}
              <svg
                className="absolute inset-0 pointer-events-none"
                width={CONTAINER_WIDTH}
                height={layout.totalHeight}
                viewBox={`0 0 ${CONTAINER_WIDTH} ${layout.totalHeight}`}
              >
                {layout.positions.map((pos, i) => {
                  const targetX = pos.x + SUB_WIDTH / 2;
                  const targetY = pos.y;
                  const midY = parentBottomY + (targetY - parentBottomY) * 0.55;
                  return (
                    <motion.path
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.65 }}
                      transition={{ duration: 0.6, delay: 0.15 + i * 0.09, ease: 'easeOut' }}
                      d={`M ${pos.startX} ${parentBottomY} C ${pos.startX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`}
                      fill="none"
                      stroke="#9AA3D9"
                      strokeWidth="2"
                      strokeDasharray="1 6"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              {/* Parent task card */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="absolute rounded-xl p-5"
                style={{
                  left: layout.parentX,
                  top: layout.parentY,
                  width: PARENT_WIDTH,
                  height: PARENT_HEIGHT,
                  background: cardBg,
                  border: '1px solid rgba(124,130,184,0.35)',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  boxShadow:
                    '0 0 60px -10px rgba(124,130,184,0.4), 0 24px 48px -20px rgba(0,0,0,0.7)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: priority.color, boxShadow: `0 0 8px ${priority.color}` }}
                  />
                  <h3 className="text-[16px] font-semibold text-white font-['Space_Grotesk',sans-serif] leading-snug line-clamp-2">
                    {task.title}
                  </h3>
                </div>
                <p className="mt-1 ml-3.5 text-[10.5px] text-[#A6ACD9] font-['IBM_Plex_Mono',monospace] uppercase tracking-wide">
                  {priority.label} priority · {subtasks.length} step{subtasks.length !== 1 ? 's' : ''}
                </p>
              </motion.div>

              {/* Subtask nodes */}
              {subtasks.map((sub, i) => {
                const pos = layout.positions[i];
                const isDone = sub.status === 'done';
                return (
                  <motion.div
                    key={sub._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.35 + i * 0.09 }}
                    className="absolute rounded-lg px-4 py-3.5 flex items-center gap-3"
                    style={{
                      left: pos.x,
                      top: pos.y,
                      width: SUB_WIDTH,
                      height: SUB_HEIGHT,
                      background: cardBg,
                      border: '1px solid rgba(124,130,184,0.18)',
                      borderTop: '1px solid rgba(255,255,255,0.07)',
                      borderLeft: '2.5px solid #7C82B8',
                      boxShadow: '0 12px 28px -14px rgba(0,0,0,0.7)',
                    }}
                  >
                    <button
                      onClick={() => onToggleSubtask(sub._id, isDone ? 'todo' : 'done')}
                      className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                        isDone ? 'bg-[#4A9B6E] border-[#4A9B6E]' : 'border-white/25 hover:border-[#7C82B8]'
                      }`}
                      aria-label="Toggle step status"
                    >
                      {isDone && (
                        <svg viewBox="0 0 12 12" width="8" height="8" fill="none">
                          <path d="M2 6l2.5 2.5L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-[13.5px] font-medium leading-snug line-clamp-2 ${
                          isDone ? 'text-white/35 line-through' : 'text-white'
                        }`}
                      >
                        {sub.title}
                      </p>
                      <p className="mt-1 text-[9.5px] text-[#8791C9] font-['IBM_Plex_Mono',monospace] tracking-wide">
                        STEP {String(i + 1).padStart(2, '0')}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}