import { motion } from 'framer-motion';

function StatChip({ label, value, tone }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="text-[18px] font-semibold font-['Space_Grotesk',sans-serif] leading-none"
        style={{ color: tone || '#1B1E29' }}
      >
        {value}
      </span>
      <span className="text-[11.5px] text-[#6B6558]">{label}</span>
    </div>
  );
}

/**
 * DailyBrief — a morning summary card. Shows real counts pulled from the
 * user's tasks (no invented numbers) plus one AI-picked focus task with
 * a short explanation, generated via the /api/ai/daily-brief endpoint.
 *
 * props:
 *  firstName    - for the greeting
 *  brief        - { stats: {total, dueToday, overdue}, recommendation, focusTask } | null
 *  onViewTask   - called with the focus task's id when "View task" is clicked
 *  onDismiss    - closes the card
 */
export default function DailyBrief({ firstName, brief, onViewTask, onFocusTask, onDismiss }) {
  if (!brief) return null;

  const { stats, recommendation, focusTask } = brief;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mb-8 overflow-hidden"
    >
      <div className="bg-gradient-to-br from-[#7C82B8]/[0.08] to-white rounded-xl border border-[#7C82B8]/20 shadow-[0_4px_16px_-8px_rgba(16,25,70,0.15)] p-6 relative">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-[#6B6558]/50 hover:text-[#1B1E29] transition-colors"
          aria-label="Dismiss daily brief"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <p className="text-[16px] font-['Space_Grotesk',sans-serif] font-medium text-[#1B1E29] tracking-tight">
          Good morning, {firstName} 👋
        </p>

        <div className="mt-3 flex items-center gap-5 flex-wrap">
          <StatChip label="active tasks" value={stats.total} />
          <StatChip label="due today" value={stats.dueToday} tone="#C89B5C" />
          {stats.overdue > 0 && <StatChip label="overdue" value={stats.overdue} tone="#C4544A" />}
        </div>

        <div className="mt-4 pt-4 border-t border-[#1B1E29]/8">
          <span className="text-[10px] font-medium tracking-[0.15em] text-[#7C82B8] uppercase font-['IBM_Plex_Mono',monospace]">
            ✨ AI Recommendation
          </span>
          <p className="mt-1.5 text-[13.5px] text-[#1B1E29] leading-relaxed">{recommendation}</p>
          {focusTask && (
  <div className="mt-3 flex items-center gap-4">
    <button
      onClick={() => onFocusTask(focusTask._id)}
      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#101946] rounded-md px-4 py-2 hover:bg-[#0D1438] transition-colors"
    >
      🎯 Start focus session
    </button>
    <button
      onClick={() => onViewTask(focusTask._id)}
      className="text-[12.5px] font-medium text-[#6B6558] hover:text-[#101946] transition-colors"
    >
      View task
    </button>
  </div>
)}
 
        </div>
      </div>
    </motion.div>
  );
}