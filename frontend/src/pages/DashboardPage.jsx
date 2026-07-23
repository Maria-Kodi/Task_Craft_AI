import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  DndContext,
  DragOverlay,
  useDroppable,
  useDraggable,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import api from '../api/axios';
import BrandMark from '../components/BrandMark';
import CommandPalette from '../components/CommandPalette';
import TaskDetailPanel from '../components/TaskDetailPanel';
import NavTabs from '../components/NavTabs';
import DailyBrief from '../components/DailyBrief';
import TaskFlowView from '../components/TaskFlowView';
import FocusMode from '../components/FocusMode';

function SectionLabel({ children, dark, tone }) {
  return (
    <span
      className={`text-[11px] font-medium tracking-[0.18em] uppercase font-['IBM_Plex_Mono',monospace] ${
        dark ? 'text-[#7C82B8]' : tone ? '' : 'text-[#6B6558]'
      }`}
      style={tone ? { color: tone } : undefined}
    >
      {children}
    </span>
  );
}

const STATUS_CONFIG = {
  todo: { label: 'To Do', color: '#7C82B8', tint: '#7C82B8' },
  'in-progress': { label: 'In Progress', color: '#C89B5C', tint: '#C89B5C' },
  done: { label: 'Done', color: '#4A9B6E', tint: '#4A9B6E' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#6B6558', bg: '#6B6558' },
  medium: { label: 'Medium', color: '#7C82B8', bg: '#7C82B8' },
  high: { label: 'High', color: '#C4544A', bg: '#C4544A' },
};

function EmptyStateIllustration({ status }) {
  if (status === 'todo') {
    return (
      <svg viewBox="0 0 120 90" width="100" height="75" fill="none">
        <rect x="14" y="14" width="70" height="16" rx="3" fill="#7C82B8" fillOpacity="0.14" />
        <rect x="14" y="38" width="52" height="16" rx="3" fill="#7C82B8" fillOpacity="0.14" />
        <rect x="14" y="62" width="60" height="16" rx="3" fill="#7C82B8" fillOpacity="0.14" />
        <circle cx="100" cy="22" r="10" fill="#7C82B8" fillOpacity="0.2" />
        <path d="M96 22l3 3 6-6" stroke="#7C82B8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === 'in-progress') {
    return (
      <svg viewBox="0 0 120 90" width="100" height="75" fill="none">
        <circle cx="60" cy="45" r="28" stroke="#C89B5C" strokeOpacity="0.15" strokeWidth="8" />
        <path
          d="M60 17a28 28 0 0 1 19.8 47.8"
          stroke="#C89B5C"
          strokeOpacity="0.4"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 90" width="100" height="75" fill="none">
      <path
        d="M28 46l18 18 46-46"
        stroke="#4A9B6E"
        strokeOpacity="0.3"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobalEmptyState({ onCreateTask }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center text-center py-16 px-6"
    >
      <svg viewBox="0 0 240 160" width="220" height="147" fill="none">
        <defs>
          <pattern id="empty-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#7C82B8" strokeOpacity="0.12" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="10" y="10" width="220" height="140" rx="10" fill="url(#empty-grid)" />

        <rect x="80" y="58" width="80" height="44" rx="6" fill="#101946" />
        <rect x="90" y="70" width="40" height="6" rx="3" fill="#7C82B8" />
        <rect x="90" y="82" width="26" height="6" rx="3" fill="#7C82B8" fillOpacity="0.5" />

        <path d="M80 80 L40 40" stroke="#7C82B8" strokeOpacity="0.35" strokeWidth="1.4" strokeDasharray="3 4" />
        <path d="M80 90 L34 100" stroke="#7C82B8" strokeOpacity="0.35" strokeWidth="1.4" strokeDasharray="3 4" />
        <path d="M160 80 L206 40" stroke="#7C82B8" strokeOpacity="0.35" strokeWidth="1.4" strokeDasharray="3 4" />
        <path d="M160 90 L212 110" stroke="#7C82B8" strokeOpacity="0.35" strokeWidth="1.4" strokeDasharray="3 4" />

        <circle cx="34" cy="36" r="7" fill="#7C82B8" fillOpacity="0.18" />
        <circle cx="26" cy="102" r="7" fill="#7C82B8" fillOpacity="0.18" />
        <circle cx="210" cy="36" r="7" fill="#4A9B6E" fillOpacity="0.2" />
        <circle cx="216" cy="112" r="7" fill="#C89B5C" fillOpacity="0.22" />
      </svg>

      <h3 className="mt-6 text-[19px] font-['Space_Grotesk',sans-serif] text-[#1B1E29] tracking-tight">
        Your board is empty — for now.
      </h3>
      <p className="mt-2 text-[13.5px] text-[#6B6558] max-w-[320px] leading-relaxed">
        Add your first task above and watch it move from idea to done.
      </p>

      <button
        onClick={onCreateTask}
        className="mt-6 rounded-md bg-[#101946] py-2.5 px-6 text-[13px] font-semibold text-[#fafbfb] hover:bg-[#0D1438] hover:shadow-[0_8px_24px_-8px_rgba(16,25,70,0.4)] transition-all"
      >
        Create your first task
      </button>
    </motion.div>
  );
}

function formatDueDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { text: 'Today', overdue: false };
  if (diffDays === 1) return { text: 'Tomorrow', overdue: false };
  if (diffDays < 0) return { text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), overdue: true };
  return { text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), overdue: false };
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
      className="flex items-center gap-2.5 py-2 px-3 group/sub hover:bg-[#1B1E29]/[0.03] rounded-md"
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
        className={`flex-1 text-[13px] transition-colors ${
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

function TaskCard({
  task,
  subtasks,
  onDelete,
  onStatusChange,
  onAddSubtask,
  onDeleteSubtask,
  onSubtaskStatusChange,
  onBreakDown,
  onOpenDetail,
  onOpenFlow,
  isHighlighted,
}) {
  const [expanded, setExpanded] = useState(false);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [breakingDown, setBreakingDown] = useState(false);
  const accent = STATUS_CONFIG[task.status].color;
  const priority = PRIORITY_CONFIG[task.priority || 'medium'];
  const due = formatDueDate(task.dueDate);
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: { task },
  });

  const dragStyle = {
    zIndex: isDragging ? 50 : undefined,
    touchAction: 'none',
  };

  const doneCount = subtasks.filter((s) => s.status === 'done').length;
  const hasSubtasks = subtasks.length > 0;
  const progress = hasSubtasks ? Math.round((doneCount / subtasks.length) * 100) : 0;


  const handleSubmitSubtask = async (e) => {
    e.preventDefault();
    if (!subtaskTitle.trim()) return;
    await onAddSubtask(task._id, subtaskTitle);
    setSubtaskTitle('');
    setAddingSubtask(false);
    setExpanded(true);
  };

  const handleBreakDown = async () => {
    setBreakingDown(true);
    try {
      await onBreakDown(task._id, task.title);
      setExpanded(true);
    } finally {
      setBreakingDown(false);
    }
  };

  return (
    <div
      id={`task-${task._id}`}
      ref={setNodeRef}
      style={dragStyle}
      className="mb-3 rounded-lg transition-shadow duration-300"
    >
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{
          opacity: isDragging ? 0.4 : 1,
          boxShadow: isHighlighted
            ? '0 0 0 3px rgba(124,130,184,0.5), 0 12px 28px -10px rgba(16,25,70,0.18)'
            : '0 1px 2px rgba(16,25,70,0.04)',
        }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`group bg-[#FDFDFC] rounded-lg border border-[#1B1E29]/8 hover:shadow-[0_12px_28px_-10px_rgba(16,25,70,0.18)] transition-shadow duration-200 overflow-hidden ${
          isDragging ? 'shadow-[0_20px_40px_-12px_rgba(16,25,70,0.3)] cursor-grabbing' : ''
        }`}
        style={{ borderLeft: `2.5px solid ${accent}` }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div
              {...listeners}
              {...attributes}
              className="cursor-grab active:cursor-grabbing text-[#1B1E29]/20 hover:text-[#1B1E29]/40 shrink-0 pt-0.5 pr-1 transition-colors"
              aria-label="Drag to move task"
            >
              <svg viewBox="0 0 10 16" width="8" height="14" fill="currentColor">
                <circle cx="2" cy="2" r="1.3" />
                <circle cx="8" cy="2" r="1.3" />
                <circle cx="2" cy="8" r="1.3" />
                <circle cx="8" cy="8" r="1.3" />
                <circle cx="2" cy="14" r="1.3" />
                <circle cx="8" cy="14" r="1.3" />
              </svg>
            </div>

            {/* Clicking the title opens the full detail panel */}
            <button
              onClick={() => onOpenDetail(task._id)}
              className="flex-1 text-left font-medium text-[#1B1E29] font-['Space_Grotesk',sans-serif] text-[14px] leading-snug hover:text-[#101946] transition-colors"
            >
              {task.title}
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="opacity-0 group-hover:opacity-100 text-[#6B6558]/50 hover:text-red-500 transition-all text-xs shrink-0"
              aria-label="Delete task"
            >
              ✕
            </button>
          </div>

          {task.description && (
            <p className="mt-1.5 text-[12.5px] text-[#6B6558] leading-relaxed pl-4.5 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="mt-3 pl-4.5 flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-['IBM_Plex_Mono',monospace] font-medium tracking-wide uppercase px-2 py-0.5 rounded"
              style={{ color: priority.color, backgroundColor: `${priority.bg}1F` }}
            >
              {priority.label}
            </span>

            {due && (
              <span
                className={`flex items-center gap-1 text-[10.5px] font-['IBM_Plex_Mono',monospace] px-2 py-0.5 rounded ${
                  due.overdue ? 'text-[#C4544A] bg-[#C4544A]/10' : 'text-[#6B6558] bg-[#1B1E29]/5'
                }`}
              >
                <svg viewBox="0 0 12 12" width="9" height="9" fill="none">
                  <rect x="1.5" y="2.5" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1" />
                  <path d="M1.5 5h9M4 1.5v2M8 1.5v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                </svg>
                {due.text}
              </span>
            )}
          </div>

          {hasSubtasks && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-full mt-3.5 flex items-center gap-2.5"
            >
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
              <motion.svg
                viewBox="0 0 12 12"
                width="10"
                height="10"
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 text-[#6B6558]"
              >
                <path
                  d="M2.5 4.5L6 8l3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </button>  
          )}

{hasSubtasks && (
  <button
    onClick={() => onOpenFlow(task._id)}
    className="mt-1.5 flex items-center gap-1 text-[10px] text-[#7C82B8] hover:text-[#101946] transition-colors"
  >
    <svg viewBox="0 0 12 12" width="9" height="9" fill="none">
      <circle cx="3" cy="3" r="1.6" fill="currentColor" />
      <circle cx="9" cy="9" r="1.6" fill="currentColor" />
      <path d="M4 4l4 4" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5" />
    </svg>
    View flow
  </button>
)}

<div className="mt-3.5 flex flex-wrap items-center gap-2">
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task._id, e.target.value)}
              className="w-full sm:flex-1 sm:w-auto text-[10.5px] font-['IBM_Plex_Mono',monospace] tracking-wider uppercase border border-[#1B1E29]/10 rounded-md px-2.5 py-1.5 bg-[#fafbfb] text-[#1B1E29] focus:outline-none focus:border-[#7C82B8] cursor-pointer"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            {!hasSubtasks && (
              <button
                onClick={handleBreakDown}
                disabled={breakingDown}
                className="flex items-center gap-1.5 text-[10.5px] font-['IBM_Plex_Mono',monospace] tracking-wider uppercase text-white bg-[#101946] rounded-md px-2.5 py-1.5 hover:bg-[#0D1438] transition-colors shrink-0 disabled:opacity-60"
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

            <button
              onClick={() => {
                setAddingSubtask((v) => !v);
                setExpanded(true);
              }}
              className="text-[10.5px] font-['IBM_Plex_Mono',monospace] tracking-wider uppercase text-[#7C82B8] border border-[#7C82B8]/30 rounded-md px-2.5 py-1.5 hover:bg-[#7C82B8]/10 transition-colors shrink-0"
            >
              + Step
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && hasSubtasks && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-[#1B1E29]/6 bg-[#fafbfb]/60 py-1"
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {addingSubtask && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmitSubtask}
              className="border-t border-[#1B1E29]/6 bg-[#fafbfb]/60 p-3 flex gap-2"
            >
              <input
                type="text"
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                placeholder="Add a step..."
                autoFocus
                className="flex-1 bg-white border border-[#1B1E29]/10 rounded-md px-2.5 py-1.5 text-[13px] text-[#1B1E29] placeholder:text-[#1B1E29]/30 focus:outline-none focus:border-[#7C82B8]"
              />
              <button
                type="submit"
                className="text-[12px] font-medium text-white bg-[#101946] rounded-md px-3 py-1.5 hover:bg-[#0D1438] transition-colors"
              >
                Add
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function KanbanColumn({ status, children, taskCount, isEmpty }) {
  const config = STATUS_CONFIG[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const emptyCopy = {
    todo: 'Add a task above to get started.',
    'in-progress': 'Nothing in motion right now.',
    done: 'Completed tasks will land here.',
  };

  return (
    <div
      id={`column-${status}`}
      ref={setNodeRef}
      className="rounded-xl overflow-hidden border transition-colors duration-150"
      style={{
        backgroundColor: isOver ? `${config.tint}14` : `${config.tint}08`,
        borderColor: `${config.tint}22`,
      }}
    >
      <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: `${config.tint}1A` }}>
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
        <SectionLabel tone={config.color}>{config.label}</SectionLabel>
        <span
          className="text-[11px] font-['IBM_Plex_Mono',monospace] ml-auto"
          style={{ color: config.color, opacity: 0.7 }}
        >
          {taskCount}
        </span>
      </div>

      <div className="p-4 min-h-[80px]">
        {isEmpty ? (
          <div className="flex flex-col items-center text-center py-6 px-2">
            <EmptyStateIllustration status={status} />
            <p className="mt-3 text-[12.5px] text-[#6B6558]/60 max-w-[160px]">{emptyCopy[status]}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [highlightedTaskId, setHighlightedTaskId] = useState(null);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState(null);
  const [focusTaskId, setFocusTaskId] = useState(null);
  const [flowTaskId, setFlowTaskId] = useState(null);
  const [activeDragTask, setActiveDragTask] = useState(null);
  const [dailyBrief, setDailyBrief] = useState(null);
const [briefLoading, setBriefLoading] = useState(false);
const handleStartMyDay = async () => {
  setBriefLoading(true);
  try {
    const response = await api.get('/ai/daily-brief');
    setDailyBrief(response.data);
  } catch (err) {
    console.error('Failed to load daily brief:', err);
    toast.error(err.response?.data?.message || 'Could not generate your daily brief');
  } finally {
    setBriefLoading(false);
  }
};

const navigate = useNavigate();
  const titleInputRef = useRef(null);
  const [searchParams] = useSearchParams();

  const getStoredUser = () => {
    const rawData = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (!rawData || rawData === 'undefined' || rawData === 'null') {
      return null;
    }

    try {
      return JSON.parse(rawData);
    } catch (err) {
      console.error('Failed to parse user data:', err);
      return null;
    }
  };

  const user = getStoredUser();

  const initials = (user?.fullName || user?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const openId = searchParams.get('open');
    if (openId && tasksLoaded) {
      setDetailTaskId(openId);
    }
  }, [searchParams, tasksLoaded]);


  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      const taskData = response.data?.tasks || response.data;
      
      if (Array.isArray(taskData)) {
        setTasks(taskData);
      } else {
        setTasks([]); 
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      toast.error('Could not load your tasks');
      setTasks([]); 
    } finally {
      setTasksLoaded(true);
    }
  };

  
const safeTasks = Array.isArray(tasks) ? tasks : [];
const topLevelTasks = safeTasks.filter((t) => !t.parentTask);
const getSubtasks = (taskId) => safeTasks.filter((t) => t.parentTask === taskId);

  const detailTask = tasks.find((t) => t._id === detailTaskId) || null;
  const flowTask = tasks.find((t) => t._id === flowTaskId) || null;
  const focusTask = tasks.find((t) => t._id === focusTaskId) || null;

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/tasks', {
        title,
        description,
        status: 'todo',
        priority,
        dueDate: dueDate || null,
      });
      setTasks((prev) => [response.data.task, ...prev]);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      toast.success('Task created');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create task';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubtask = async (parentTaskId, subtaskTitle) => {
    try {
      const response = await api.post('/tasks', {
        title: subtaskTitle,
        status: 'todo',
        parentTask: parentTaskId,
      });
      setTasks((prev) => [...prev, response.data.task]);
    } catch (err) {
      console.error('Failed to add subtask:', err);
      toast.error('Could not add step');
    }
  };

  const handleBreakDown = async (taskId, taskTitle) => {
    try {
      const response = await api.post(`/tasks/${taskId}/decompose`);
      setTasks((prev) => [...prev, ...response.data.subtasks]);
      toast.success(`Task broken down into ${response.data.subtasks.length} steps`, { icon: '✨' });
    } catch (err) {
      console.error('Failed to break down task:', err);
      toast.error(err.response?.data?.message || 'AI break down failed — is Ollama running?');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id && t.parentTask !== id));
      toast('Task deleted', { icon: '🗑️' });
    } catch (err) {
      console.error('Failed to delete task:', err);
      toast.error('Could not delete task');
    }
  };

  const handleDeleteSubtask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error('Failed to delete subtask:', err);
      toast.error('Could not delete step');
    }
  };
  const handleMarkTaskDoneFromFocus = (taskId) => {
    handleStatusChange(taskId, 'done');
    setFocusTaskId(null);
  };
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.put(`/tasks/${id}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === id ? response.data.task : t)));
      if (newStatus === 'done') {
        toast.success('Marked as done', { icon: '✅' });
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      toast.error('Could not update status');
    }
  };

  // Generic patch used by the detail panel for title/description/priority/dueDate
  const handleUpdateTask = async (id, fields) => {
    try {
      const response = await api.put(`/tasks/${id}`, fields);
      setTasks((prev) => prev.map((t) => (t._id === id ? response.data.task : t)));
      toast.success('Task updated');
    } catch (err) {
      console.error('Failed to update task:', err);
      toast.error('Could not save changes');
    }
  };

  const handleDragEnd = (event) => {
    setActiveDragTask(null);
    const { active, over } = event;
    if (!over) return;
  
    const taskId = active.id;
    const newStatus = over.id;
    const task = tasks.find((t) => t._id === taskId);
  
    if (task && task.status !== newStatus) {
      handleStatusChange(taskId, newStatus);
    }
  };

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveDragTask(task || null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const handlePaletteCreateTask = useCallback(() => {
    document.getElementById('new-task-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => titleInputRef.current?.focus(), 350);
  }, []);

  const handlePaletteJumpToStatus = useCallback((status) => {
    document.getElementById(`column-${status}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  // Selecting a task from the palette now opens the full detail panel,
  // which is more useful than just scrolling to it on the board.
  const handlePaletteSelectTask = useCallback((taskId) => {
    setDetailTaskId(taskId);
  }, []);

  const columns = ['todo', 'in-progress', 'done'];
  const total = topLevelTasks.length;
  const doneCount = topLevelTasks.filter((t) => t.status === 'done').length;
  const activeCount = topLevelTasks.filter((t) => t.status === 'in-progress').length;
  const boardIsEmpty = tasksLoaded && total === 0;

  return (
    <div className="min-h-screen bg-[#fafbfb]">
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        tasks={topLevelTasks}
        onCreateTask={handlePaletteCreateTask}
        onJumpToStatus={handlePaletteJumpToStatus}
        onSelectTask={handlePaletteSelectTask}
        onLogout={handleLogout}
      />

      <TaskDetailPanel
        task={detailTask}
        subtasks={detailTask ? getSubtasks(detailTask._id) : []}
        onClose={() => setDetailTaskId(null)}
        onUpdate={handleUpdateTask}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onAddSubtask={handleAddSubtask}
        onDeleteSubtask={handleDeleteSubtask}
        onSubtaskStatusChange={handleStatusChange}
        onBreakDown={handleBreakDown}
      />
      <TaskFlowView
  task={flowTask}
  subtasks={flowTask ? getSubtasks(flowTask._id) : []}
  onClose={() => setFlowTaskId(null)}
  onToggleSubtask={handleStatusChange}
/>
<FocusMode
  task={focusTask}
  subtasks={focusTask ? getSubtasks(focusTask._id) : []}
  onClose={() => setFocusTaskId(null)}
  onToggleSubtask={handleStatusChange}
  onMarkTaskDone={handleMarkTaskDoneFromFocus}
/>
      <div className="relative bg-[#0B1130] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#7C82B8 1px, transparent 1px), linear-gradient(90deg, #7C82B8 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
<header className="border-b border-white/10 px-4 py-4 sm:px-8 sm:py-5">
  <div className="flex items-center justify-between gap-3">
    {/* Logo + desktop navigation */}
    <div className="flex min-w-0 items-center gap-3 sm:gap-8">
      <BrandMark theme="dark" />

      <div className="hidden sm:block">
        <NavTabs active="board" />
      </div>
    </div>

    {/* Actions */}
    <div className="flex shrink-0 items-center gap-2 sm:gap-4">
      <button
        onClick={handleStartMyDay}
        disabled={briefLoading}
        className="flex items-center gap-1.5 rounded-md border border-[#7C82B8]/40 bg-[#7C82B8]/20 px-2.5 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-[#7C82B8]/30 disabled:opacity-60 sm:px-3"
      >
        {briefLoading ? (
          'Thinking…'
        ) : (
          <>
            <span className="sm:hidden">✨</span>
            <span className="hidden sm:inline">✨ Start My Day</span>
          </>
        )}
      </button>

      <button
        onClick={() => setPaletteOpen(true)}
        className="hidden items-center gap-2 rounded-md border border-white/15 px-3 py-1.5 text-[12.5px] text-white/60 transition-colors hover:bg-white/10 hover:text-white sm:flex"
      >
        <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
          <circle
            cx="7"
            cy="7"
            r="5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M11 11l3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        Search
        <kbd className="ml-1 rounded border border-white/20 px-1.5 py-0.5 font-['IBM_Plex_Mono',monospace] text-[10px]">
          ⌘K
        </kbd>
      </button>

      <Link
        to="/settings"
        aria-label="Settings"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#7C82B8]/30 bg-[#7C82B8]/20 transition-colors hover:bg-[#7C82B8]/30"
      >
        <span className="font-['Space_Grotesk',sans-serif] text-[11px] font-semibold text-white">
          {initials}
        </span>
      </Link>

      <button
        onClick={handleLogout}
        className="hidden rounded-md border border-white/20 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/10 lg:block"
      >
        Sign out
      </button>
    </div>
  </div>

  {/* Mobile: swipeable navigation row */}
  <div className="mt-3 min-w-0 sm:hidden">
    <NavTabs active="board" />
  </div>
</header>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 pt-10 pb-12">
  <p className="text-[25px] sm:text-[32px] text-white font-['Space_Grotesk',sans-serif] font-medium tracking-[-0.03em] mb-2">
    Turn ideas into action, {user?.fullName?.split(' ')[0] || 'creator'}
  </p>

  <p className="text-[#A8AEC8] text-base font-['Space_Grotesk',sans-serif] mb-8">
    Organize your workflow and create smarter with AI
  </p>

  <div className="grid grid-cols-3 gap-2">
    <div className="bg-white/[0.04] backdrop-blur-sm px-3 py-3 sm:px-6 rounded-xl border border-white/10 hover:bg-white/[0.07] transition-colors">
      <SectionLabel dark>Total tasks</SectionLabel>
      <motion.p
        key={total}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-[26px] sm:text-[36px] font-medium tracking-tight font-['Space_Grotesk',sans-serif] text-white leading-none"
      >
        {total}
      </motion.p>
    </div>

    <div className="bg-white/[0.04] backdrop-blur-sm px-3 py-3 sm:px-6 rounded-xl border border-white/10 hover:bg-white/[0.07] transition-colors">
      <SectionLabel dark>Active workflow</SectionLabel>
      <motion.p
        key={activeCount}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-[26px] sm:text-[36px] font-medium tracking-tight font-['Space_Grotesk',sans-serif] text-white leading-none"
      >
        {activeCount}
      </motion.p>
    </div>

    <div className="bg-white/[0.04] backdrop-blur-sm px-3 py-3 sm:px-6 rounded-xl border border-white/10 hover:bg-white/[0.07] transition-colors">
      <SectionLabel dark>Completed</SectionLabel>
      <motion.p
        key={doneCount}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-[26px] sm:text-[36px] font-medium tracking-tight font-['Space_Grotesk',sans-serif] text-[#7CCF9B] leading-none"
      >
        {doneCount}
      </motion.p>
    </div>
  </div>
</div>
      </div>

      <div className="bg-gradient-to-b from-[#EEF0F9] to-[#fafbfb]">
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <AnimatePresence>
  {dailyBrief && (
    <DailyBrief
      firstName={user?.fullName?.split(' ')[0] || 'there'}
      brief={dailyBrief}
      onViewTask={(taskId) => setDetailTaskId(taskId)}
      onFocusTask={(taskId) => setFocusTaskId(taskId)}
      onDismiss={() => setDailyBrief(null)}
    />
  )}
</AnimatePresence>
          <div
            id="new-task-section"
            className="mb-12 bg-gradient-to-b from-[#7C82B8]/[0.04] to-white rounded-xl border border-[#1B1E29]/8 shadow-[0_1px_2px_rgba(16,25,70,0.04)] p-6"
          >
            <SectionLabel>New task</SectionLabel>
            <form onSubmit={handleAddTask} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to get done?"
                  className="flex-1 bg-transparent border-b-2 border-[#1B1E29]/15 py-2.5 px-1 text-[14px] text-[#1B1E29] placeholder:text-[#1B1E29]/30 focus:outline-none focus:border-[#7C82B8] transition-colors"
                  required
                />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="flex-1 bg-transparent border-b-2 border-[#1B1E29]/15 py-2.5 px-1 text-[14px] text-[#1B1E29] placeholder:text-[#1B1E29]/30 focus:outline-none focus:border-[#7C82B8] transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                <div className="flex-1">
                  <label className="block text-[10px] font-medium tracking-[0.15em] text-[#6B6558] uppercase font-['IBM_Plex_Mono',monospace] mb-1.5">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full text-[13px] border border-[#1B1E29]/10 rounded-md px-3 py-2 bg-[#fafbfb] text-[#1B1E29] focus:outline-none focus:border-[#7C82B8] cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-medium tracking-[0.15em] text-[#6B6558] uppercase font-['IBM_Plex_Mono',monospace] mb-1.5">
                    Due date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-[13px] border border-[#1B1E29]/10 rounded-md px-3 py-2 bg-[#fafbfb] text-[#1B1E29] focus:outline-none focus:border-[#7C82B8]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-[#101946] py-2.5 px-6 text-[13px] font-semibold text-[#fafbfb] hover:bg-[#0D1438] hover:shadow-[0_8px_24px_-8px_rgba(16,25,70,0.4)] transition-all disabled:opacity-50 shrink-0"
                >
                  {loading ? 'Adding…' : 'Add task'}
                </button>
              </div>
            </form>
            {error && <p className="mt-3 text-[13px] text-red-600">{error}</p>}
          </div>

          {boardIsEmpty ? (
            <div className="bg-white rounded-xl border border-[#1B1E29]/8 shadow-[0_1px_2px_rgba(16,25,70,0.04)]">
              <GlobalEmptyState onCreateTask={handlePaletteCreateTask} />
            </div>
          ) : (
            <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveDragTask(null)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
  {columns.map((status) => {
    const columnTasks = topLevelTasks.filter((t) => t.status === status);

    return (
      <KanbanColumn
        key={status}
        status={status}
        taskCount={columnTasks.length}
        isEmpty={columnTasks.length === 0}
      >
        <AnimatePresence mode="popLayout">
          {columnTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              subtasks={getSubtasks(task._id)}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onAddSubtask={handleAddSubtask}
              onDeleteSubtask={handleDeleteSubtask}
              onSubtaskStatusChange={handleStatusChange}
              onBreakDown={handleBreakDown}
              onOpenDetail={setDetailTaskId}
              onOpenFlow={setFlowTaskId}
              isHighlighted={highlightedTaskId === task._id}
            />
          ))}
        </AnimatePresence>
      </KanbanColumn>
    );
  })}
</div>
          
            <DragOverlay>
              {activeDragTask ? (
                <div
                  className="bg-[#FDFDFC] rounded-lg border border-[#1B1E29]/8 shadow-[0_20px_40px_-12px_rgba(16,25,70,0.35)] p-4 rotate-2 cursor-grabbing max-w-[280px]"
                  style={{ borderLeft: `2.5px solid ${STATUS_CONFIG[activeDragTask.status].color}` }}
                >
                  <h4 className="font-medium text-[#1B1E29] font-['Space_Grotesk',sans-serif] text-[14px] leading-snug">
                    {activeDragTask.title}
                  </h4>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
          )}
        </main>
      </div>
    </div>
  );
}