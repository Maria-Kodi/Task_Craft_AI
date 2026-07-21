import { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

/**
 * CommandPalette — Cmd+K / Ctrl+K quick actions and task search.
 *
 * props:
 *  isOpen        - whether the palette is visible
 *  onClose       - close the palette
 *  tasks         - flat array of top-level tasks (for search)
 *  onCreateTask  - focus the "New task" input on the dashboard
 *  onJumpToStatus- scroll to / flash a column
 *  onSelectTask  - scroll to / flash a specific task card
 *  onLogout      - sign the user out
 */
export default function CommandPalette({
  isOpen,
  onClose,
  tasks,
  onCreateTask,
  onJumpToStatus,
  onSelectTask,
  onLogout,
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  // Static quick actions, always shown (filtered by query too)
  const quickActions = useMemo(
    () => [
      { id: 'action-new-task', label: 'Create new task', hint: 'New', onSelect: onCreateTask },
      { id: 'action-todo', label: 'Jump to To Do', hint: 'Column', onSelect: () => onJumpToStatus('todo') },
      { id: 'action-progress', label: 'Jump to In Progress', hint: 'Column', onSelect: () => onJumpToStatus('in-progress') },
      { id: 'action-done', label: 'Jump to Done', hint: 'Column', onSelect: () => onJumpToStatus('done') },
      { id: 'action-logout', label: 'Sign out', hint: 'Account', onSelect: onLogout },
    ],
    [onCreateTask, onJumpToStatus, onLogout]
  );

  const filteredActions = useMemo(
    () => quickActions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase())),
    [quickActions, query]
  );

  const filteredTasks = useMemo(() => {
    if (!query.trim()) return tasks.slice(0, 5);
    return tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
  }, [tasks, query]);

  // Combined flat list, used for keyboard navigation across both groups
  const combinedItems = useMemo(
    () => [
      ...filteredActions.map((a) => ({ type: 'action', ...a })),
      ...filteredTasks.map((t) => ({ type: 'task', id: t._id, task: t })),
    ],
    [filteredActions, filteredTasks]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      // Focus after the entrance animation starts
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  const handleSelect = (item) => {
    if (!item) return;
    if (item.type === 'action') {
      item.onSelect();
    } else {
      onSelectTask(item.id);
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, combinedItems.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(combinedItems[activeIndex]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B1130]/60 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed top-[14vh] left-1/2 -translate-x-1/2 w-full max-w-xl z-[101] px-4"
          >
            <div
              className="bg-white rounded-xl border border-[#1B1E29]/10 shadow-[0_24px_60px_-12px_rgba(11,17,48,0.4)] overflow-hidden"
              onKeyDown={handleKeyDown}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1B1E29]/8">
                <svg viewBox="0 0 16 16" width="15" height="15" fill="none" className="text-[#6B6558] shrink-0">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search tasks…"
                  className="flex-1 bg-transparent text-[14px] text-[#1B1E29] placeholder:text-[#1B1E29]/35 focus:outline-none"
                />
                <kbd className="text-[10px] font-['IBM_Plex_Mono',monospace] text-[#6B6558]/60 border border-[#1B1E29]/10 rounded px-1.5 py-0.5">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[340px] overflow-y-auto py-2">
                {filteredActions.length > 0 && (
                  <div className="px-2 mb-1">
                    <p className="px-2.5 py-1.5 text-[10px] font-medium tracking-[0.15em] text-[#6B6558]/60 uppercase font-['IBM_Plex_Mono',monospace]">
                      Quick actions
                    </p>
                    {filteredActions.map((action) => {
                      const flatIndex = combinedItems.findIndex((i) => i.id === action.id);
                      const isActive = flatIndex === activeIndex;
                      return (
                        <button
                          key={action.id}
                          onMouseEnter={() => setActiveIndex(flatIndex)}
                          onClick={() => handleSelect(combinedItems[flatIndex])}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-left transition-colors ${
                            isActive ? 'bg-[#7C82B8]/12' : 'hover:bg-[#1B1E29]/[0.03]'
                          }`}
                        >
                          <span className="text-[13.5px] text-[#1B1E29] font-medium font-['Space_Grotesk',sans-serif]">
                            {action.label}
                          </span>
                          <span className="text-[10px] font-['IBM_Plex_Mono',monospace] text-[#6B6558]/50 uppercase tracking-wide">
                            {action.hint}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {filteredTasks.length > 0 && (
                  <div className="px-2">
                    <p className="px-2.5 py-1.5 text-[10px] font-medium tracking-[0.15em] text-[#6B6558]/60 uppercase font-['IBM_Plex_Mono',monospace]">
                      Tasks
                    </p>
                    {filteredTasks.map((task) => {
                      const flatIndex = combinedItems.findIndex((i) => i.type === 'task' && i.id === task._id);
                      const isActive = flatIndex === activeIndex;
                      return (
                        <button
                          key={task._id}
                          onMouseEnter={() => setActiveIndex(flatIndex)}
                          onClick={() => handleSelect(combinedItems[flatIndex])}
                          className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-md text-left transition-colors ${
                            isActive ? 'bg-[#7C82B8]/12' : 'hover:bg-[#1B1E29]/[0.03]'
                          }`}
                        >
                          <span className="text-[13.5px] text-[#1B1E29] truncate">{task.title}</span>
                          <span className="text-[10px] font-['IBM_Plex_Mono',monospace] text-[#6B6558]/50 uppercase tracking-wide shrink-0">
                            {STATUS_LABELS[task.status]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {filteredActions.length === 0 && filteredTasks.length === 0 && (
                  <p className="px-4 py-6 text-center text-[13px] text-[#6B6558]/50">No results found.</p>
                )}
              </div>

              {/* Footer hint */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[#1B1E29]/8 bg-[#fafbfb]">
                <span className="flex items-center gap-1.5 text-[10.5px] text-[#6B6558]/60 font-['IBM_Plex_Mono',monospace]">
                  <kbd className="border border-[#1B1E29]/12 rounded px-1.5 py-0.5">↑↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1.5 text-[10.5px] text-[#6B6558]/60 font-['IBM_Plex_Mono',monospace]">
                  <kbd className="border border-[#1B1E29]/12 rounded px-1.5 py-0.5">↵</kbd> select
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}