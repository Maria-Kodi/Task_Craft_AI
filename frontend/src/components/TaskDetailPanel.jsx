import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const STATUS_CONFIG = {
  todo: { label: 'To Do', color: '#7C82B8' },
  'in-progress': { label: 'In Progress', color: '#C89B5C' },
  done: { label: 'Done', color: '#4A9B6E' },
};

function formatFullDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function SubtaskRow({ subtask, onDelete, onStatusChange }) {
  const isDone = subtask.status === 'done';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2.5 py-2.5 px-3 group/sub hover:bg-[#1B1E29]/[0.03] rounded-md"
    >
      <button
        onClick={() => onStatusChange(subtask._id, isDone ? 'todo' : 'done')}
        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
          isDone ? 'bg-[#4A9B6E] border-[#4A9B6E]' : 'border-[#1B1E29]/25 hover:border-[#7C82B8]'
        }`}
        aria-label="Toggle subtask status"
      >
        {isDone && (
          <svg viewBox="0 0 12 12" width="8" height="8" fill="none">
            <path d="M2 6l2.5 2.5L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span
        className={`flex-1 text-[13.5px] transition-colors ${
          isDone ? 'text-[#6B6558]/50 line-through' : 'text-[#1B1E29]'
        }`}
      >
        {subtask.title}
      </span>
      <button
        onClick={() => onDelete(subtask._id)}
        className="opacity-0 group-hover/sub:opacity-100 text-[#6B6558]/40 hover:text-red-500 transition-all text-xs shrink-0"
        aria-label="Delete subtask"
      >
        ✕
      </button>
    </motion.div>
  );
}

/**
 * TaskDetailPanel — right-side slide-over with the full editable view
 * of a single task: title, description, priority, due date, status,
 * and its subtasks.
 *
 * props:
 *  task            - the task object, or null when closed
 *  subtasks        - subtasks belonging to this task
 *  onClose         - close the panel
 *  onUpdate(id, fields) - patch title/description/priority/dueDate
 *  onStatusChange(id, status)
 *  onDelete(id)    - delete the whole task (also closes the panel)
 *  onAddSubtask, onDeleteSubtask, onSubtaskStatusChange
 *  onBreakDown(id, title)
 */
export default function TaskDetailPanel({
  task,
  subtasks,
  onClose,
  onUpdate,
  onStatusChange,
  onDelete,
  onAddSubtask,
  onDeleteSubtask,
  onSubtaskStatusChange,
  onBreakDown,
}) {
  const [titleDraft, setTitleDraft] = useState('');
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [breakingDown, setBreakingDown] = useState(false);

  // Sync local drafts whenever a different task is opened
  useEffect(() => {
    if (task) {
      setTitleDraft(task.title);
      setDescriptionDraft(task.description || '');
    }
  }, [task?._id]);

  const isOpen = !!task;

  const handleTitleBlur = () => {
    if (!task) return;
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdate(task._id, { title: trimmed });
    } else {
      setTitleDraft(task.title);
    }
  };

  const handleDescriptionBlur = () => {
    if (!task) return;
    if (descriptionDraft !== (task.description || '')) {
      onUpdate(task._id, { description: descriptionDraft });
    }
  };

  const handlePriorityChange = (e) => {
    onUpdate(task._id, { priority: e.target.value });
  };

  const handleDueDateChange = (e) => {
    onUpdate(task._id, { dueDate: e.target.value || null });
  };

  const handleSubmitSubtask = async (e) => {
    e.preventDefault();
    if (!subtaskTitle.trim() || !task) return;
    await onAddSubtask(task._id, subtaskTitle);
    setSubtaskTitle('');
  };

  const handleBreakDown = async () => {
    if (!task) return;
    setBreakingDown(true);
    try {
      await onBreakDown(task._id, task.title);
    } finally {
      setBreakingDown(false);
    }
  };

  const handleDeleteTask = () => {
    if (!task) return;
    onDelete(task._id);
    onClose();
  };

  const doneCount = subtasks.filter((s) => s.status === 'done').length;
  const hasSubtasks = subtasks.length > 0;
  const progress = hasSubtasks ? Math.round((doneCount / subtasks.length) * 100) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B1130]/50 backdrop-blur-[2px] z-[110]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[111] shadow-[-24px_0_60px_-20px_rgba(11,17,48,0.35)] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1B1E29]/8">
              <span
                className="text-[10px] font-['IBM_Plex_Mono',monospace] font-medium tracking-wide uppercase px-2 py-0.5 rounded"
                style={{
                  color: STATUS_CONFIG[task.status].color,
                  backgroundColor: `${STATUS_CONFIG[task.status].color}1A`,
                }}
              >
                {STATUS_CONFIG[task.status].label}
              </span>
              <button
                onClick={onClose}
                className="text-[#6B6558]/60 hover:text-[#1B1E29] transition-colors"
                aria-label="Close panel"
              >
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* Editable title */}
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                className="w-full text-[20px] font-['Space_Grotesk',sans-serif] text-[#1B1E29] font-medium tracking-tight bg-transparent focus:outline-none focus:bg-[#7C82B8]/[0.06] rounded-md px-1 -mx-1 py-1 transition-colors"
              />

              {/* Editable description */}
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder="Add a description..."
                rows={3}
                className="w-full mt-2 text-[13.5px] text-[#6B6558] leading-relaxed bg-transparent focus:outline-none focus:bg-[#7C82B8]/[0.06] rounded-md px-1 -mx-1 py-1 resize-none transition-colors placeholder:text-[#6B6558]/40"
              />

              {/* Meta controls */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.15em] text-[#6B6558] uppercase font-['IBM_Plex_Mono',monospace] mb-1.5">
                    Status
                  </label>
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task._id, e.target.value)}
                    className="w-full text-[13px] border border-[#1B1E29]/10 rounded-md px-3 py-2 bg-[#fafbfb] text-[#1B1E29] focus:outline-none focus:border-[#7C82B8] cursor-pointer"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-medium tracking-[0.15em] text-[#6B6558] uppercase font-['IBM_Plex_Mono',monospace] mb-1.5">
                    Priority
                  </label>
                  <select
                    value={task.priority || 'medium'}
                    onChange={handlePriorityChange}
                    className="w-full text-[13px] border border-[#1B1E29]/10 rounded-md px-3 py-2 bg-[#fafbfb] text-[#1B1E29] focus:outline-none focus:border-[#7C82B8] cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-medium tracking-[0.15em] text-[#6B6558] uppercase font-['IBM_Plex_Mono',monospace] mb-1.5">
                    Due date
                  </label>
                  <input
                    type="date"
                    value={task.dueDate ? task.dueDate.slice(0, 10) : ''}
                    onChange={handleDueDateChange}
                    className="w-full text-[13px] border border-[#1B1E29]/10 rounded-md px-3 py-2 bg-[#fafbfb] text-[#1B1E29] focus:outline-none focus:border-[#7C82B8]"
                  />
                </div>
              </div>

              {/* Subtasks */}
              <div className="mt-7">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-medium tracking-[0.18em] uppercase font-['IBM_Plex_Mono',monospace] text-[#6B6558]">
                    Steps
                  </span>
                  {!hasSubtasks && (
                    <button
                      onClick={handleBreakDown}
                      disabled={breakingDown}
                      className="flex items-center gap-1.5 text-[10.5px] font-['IBM_Plex_Mono',monospace] tracking-wider uppercase text-white bg-[#101946] rounded-md px-2.5 py-1.5 hover:bg-[#0D1438] transition-colors disabled:opacity-60"
                    >
                      {breakingDown ? (
                        <motion.span
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        >
                          Thinking…
                        </motion.span>
                      ) : (
                        <>
                          <span>✨</span> Break down
                        </>
                      )}
                    </button>
                  )}
                </div>

                {hasSubtasks && (
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex-1 h-1 bg-[#1B1E29]/8 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: '#4A9B6E' }}
                        initial={false}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-[10.5px] font-['IBM_Plex_Mono',monospace] text-[#6B6558] shrink-0">
                      {doneCount}/{subtasks.length}
                    </span>
                  </div>
                )}

                <div className="bg-[#fafbfb] rounded-lg border border-[#1B1E29]/6">
                  <AnimatePresence>
                    {subtasks.map((sub) => (
                      <SubtaskRow
                        key={sub._id}
                        subtask={sub}
                        onDelete={onDeleteSubtask}
                        onStatusChange={onSubtaskStatusChange}
                      />
                    ))}
                  </AnimatePresence>

                  <form onSubmit={handleSubmitSubtask} className="flex gap-2 p-2">
                    <input
                      type="text"
                      value={subtaskTitle}
                      onChange={(e) => setSubtaskTitle(e.target.value)}
                      placeholder="Add a step..."
                      className="flex-1 bg-white border border-[#1B1E29]/10 rounded-md px-2.5 py-1.5 text-[13px] text-[#1B1E29] placeholder:text-[#1B1E29]/30 focus:outline-none focus:border-[#7C82B8]"
                    />
                    <button
                      type="submit"
                      className="text-[12px] font-medium text-white bg-[#101946] rounded-md px-3 py-1.5 hover:bg-[#0D1438] transition-colors shrink-0"
                    >
                      Add
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#1B1E29]/8 flex items-center justify-between">
              <p className="text-[11px] text-[#6B6558]/60 font-['IBM_Plex_Mono',monospace]">
                Created {formatFullDate(task.createdAt)}
              </p>
              <button
                onClick={handleDeleteTask}
                className="text-[12px] text-[#C4544A]/70 hover:text-[#C4544A] transition-colors"
              >
                Delete task
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}