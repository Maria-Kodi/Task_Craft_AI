import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import BrandMark from '../components/BrandMark';
import TaskDetailPanel from '../components/TaskDetailPanel';
import NavTabs from '../components/NavTabs';

function SectionLabel({ children, dark }) {
  return (
    <span
      className={`text-[10px] sm:text-[11px] font-medium tracking-[0.18em] uppercase font-['IBM_Plex_Mono',monospace] ${
        dark ? 'text-[#7C82B8]' : 'text-[#6B6558]'
      }`}
    >
      {children}
    </span>
  );
}

const PRIORITY_COLORS = {
  low: '#6B6558',
  medium: '#7C82B8',
  high: '#C4544A',
};

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + i);
    return day;
  });
}

function getParentTaskId(task) {
  return task.parentTask?._id || task.parentTask || null;
}

function TaskPill({ task, onClick }) {
  const color = PRIORITY_COLORS[task.priority || 'medium'];
  const isDone = task.status === 'done';

  return (
    <button
      onClick={onClick}
      title={task.title}
      className={`w-full rounded px-1.5 py-1 text-left text-[10.5px] leading-tight truncate transition-opacity hover:opacity-80 ${
        isDone ? 'opacity-50' : ''
      }`}
      style={{ backgroundColor: `${color}18`, color }}
    >
      <span className={isDone ? 'line-through' : ''}>{task.title}</span>
    </button>
  );
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [detailTaskId, setDetailTaskId] = useState(null);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const initials = (user?.fullName || 'U')
    .split(' ')
    .map((name) => name[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.tasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      toast.error('Could not load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const topLevelTasks = useMemo(
    () => tasks.filter((task) => !getParentTaskId(task)),
    [tasks]
  );

  const getSubtasks = (taskId) =>
    tasks.filter((task) => getParentTaskId(task) === taskId);

  const detailTask = tasks.find((task) => task._id === detailTaskId) || null;

  const scheduledTasks = useMemo(
    () => topLevelTasks.filter((task) => task.dueDate),
    [topLevelTasks]
  );

  const unscheduledTasks = useMemo(
    () => topLevelTasks.filter((task) => !task.dueDate),
    [topLevelTasks]
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthGrid = useMemo(
    () => buildMonthGrid(year, month),
    [year, month]
  );

  const today = new Date();

  const tasksForDay = (day) =>
    scheduledTasks.filter((task) => isSameDay(new Date(task.dueDate), day));

  const goToPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToToday = () => setViewDate(new Date());

  const dueThisMonth = scheduledTasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    return dueDate.getFullYear() === year && dueDate.getMonth() === month;
  }).length;

  const overdueCount = scheduledTasks.filter((task) => {
    const due = new Date(task.dueDate);
    const startOfToday = new Date();

    due.setHours(0, 0, 0, 0);
    startOfToday.setHours(0, 0, 0, 0);

    return due < startOfToday && task.status !== 'done';
  }).length;

  const handleUpdateTask = async (id, fields) => {
    try {
      const response = await api.put(`/tasks/${id}`, fields);
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? response.data.task : task))
      );
      toast.success('Task updated');
    } catch (err) {
      console.error('Failed to update task:', err);
      toast.error('Could not save changes');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.put(`/tasks/${id}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? response.data.task : task))
      );

      if (newStatus === 'done') {
        toast.success('Marked as done', { icon: '✅' });
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      toast.error('Could not update status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) =>
        prev.filter(
          (task) => task._id !== id && getParentTaskId(task) !== id
        )
      );
      toast('Task deleted', { icon: '🗑️' });
    } catch (err) {
      console.error('Failed to delete task:', err);
      toast.error('Could not delete task');
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

  const handleDeleteSubtask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) {
      console.error('Failed to delete subtask:', err);
      toast.error('Could not delete step');
    }
  };

  const handleBreakDown = async (taskId) => {
    try {
      const response = await api.post(`/tasks/${taskId}/decompose`);
      setTasks((prev) => [...prev, ...response.data.subtasks]);
      toast.success(`Task broken down into ${response.data.subtasks.length} steps`, {
        icon: '✨',
      });
    } catch (err) {
      console.error('Failed to break down task:', err);
      toast.error(
        err.response?.data?.message || 'AI break down failed — is Ollama running?'
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#fafbfb]">
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

      <div className="relative overflow-hidden bg-[#0B1130]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#7C82B8 1px, transparent 1px), linear-gradient(90deg, #7C82B8 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <header className="relative flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-8 sm:py-5">
          <div className="flex min-w-0 items-center gap-3 sm:gap-8">
            <BrandMark theme="dark" />
            <div className="hidden sm:block">
              <NavTabs active="calendar" />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Link
              to="/settings"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#7C82B8]/30 bg-[#7C82B8]/20 transition-colors hover:bg-[#7C82B8]/30"
            >
              <span className="font-['Space_Grotesk',sans-serif] text-[11px] font-semibold text-white">
                {initials}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-md border border-white/20 px-3 py-2 text-[12px] font-medium text-white transition-colors hover:bg-white/10 sm:px-4 sm:text-[13px]"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="relative mx-auto max-w-6xl px-4 pb-9 pt-8 sm:px-8 sm:pb-12 sm:pt-10">
          <h1 className="mb-6 font-['Space_Grotesk',sans-serif] text-[24px] tracking-tight text-white sm:mb-8 sm:text-[28px]">
            Keep track of deadlines, tasks, and upcoming milestones
          </h1>

          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
            <div className="bg-white/5 px-3 py-4 sm:px-6 sm:py-5">
              <SectionLabel dark>Due this month</SectionLabel>
              <p className="mt-2 font-['Space_Grotesk',sans-serif] text-[24px] leading-none text-white sm:text-[32px]">
                {dueThisMonth}
              </p>
            </div>

            <div className="bg-white/5 px-3 py-4 sm:px-6 sm:py-5">
              <SectionLabel dark>Overdue</SectionLabel>
              <p className="mt-2 font-['Space_Grotesk',sans-serif] text-[24px] leading-none text-[#C4544A] sm:text-[32px]">
                {overdueCount}
              </p>
            </div>

            <div className="bg-white/5 px-3 py-4 sm:px-6 sm:py-5">
              <SectionLabel dark>Not scheduled</SectionLabel>
              <p className="mt-2 font-['Space_Grotesk',sans-serif] text-[24px] leading-none text-[#7C82B8] sm:text-[32px]">
                {unscheduledTasks.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-[#EEF0F9] to-[#fafbfb]">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
          {loading ? (
            <p className="text-[13px] text-[#6B6558]">Loading calendar…</p>
          ) : (
            <>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-['Space_Grotesk',sans-serif] text-[19px] tracking-tight text-[#1B1E29]">
                  {viewDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goToToday}
                    className="rounded-md border border-[#1B1E29]/12 px-3 py-1.5 text-[12px] font-medium text-[#1B1E29] transition-colors hover:bg-[#1B1E29]/5"
                  >
                    Today
                  </button>

                  <button
                    onClick={goToPrevMonth}
                    aria-label="Previous month"
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[#1B1E29]/12 text-[#1B1E29] transition-colors hover:bg-[#1B1E29]/5"
                  >
                    ‹
                  </button>

                  <button
                    onClick={goToNextMonth}
                    aria-label="Next month"
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[#1B1E29]/12 text-[#1B1E29] transition-colors hover:bg-[#1B1E29]/5"
                  >
                    ›
                  </button>
                </div>
              </div>

              <motion.div
                key={`${year}-${month}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="overflow-x-auto overscroll-x-contain rounded-xl border border-[#1B1E29]/8 bg-white shadow-[0_1px_2px_rgba(16,25,70,0.04)] [-webkit-overflow-scrolling:touch]"
              >
                <div className="min-w-[640px]">
                  <div className="grid grid-cols-7 border-b border-[#1B1E29]/8">
                    {WEEKDAY_LABELS.map((day) => (
                      <div key={day} className="px-2 py-2.5 text-center">
                        <span className="font-['IBM_Plex_Mono',monospace] text-[10px] font-medium uppercase tracking-[0.1em] text-[#6B6558]/70">
                          {day}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7">
                    {monthGrid.map((day, index) => {
                      const inCurrentMonth = day.getMonth() === month;
                      const isToday = isSameDay(day, today);
                      const dayTasks = tasksForDay(day);
                      const visibleTasks = dayTasks.slice(0, 3);
                      const overflowCount = dayTasks.length - visibleTasks.length;

                      return (
                        <div
                          key={index}
                          className={`min-h-[104px] border-b border-r border-[#1B1E29]/6 p-1.5 ${
                            !inCurrentMonth ? 'bg-[#1B1E29]/[0.015]' : ''
                          }`}
                        >
                          <span
                            className={`inline-flex h-5 w-5 items-center justify-center rounded-full font-['IBM_Plex_Mono',monospace] text-[11px] ${
                              isToday
                                ? 'bg-[#101946] font-medium text-white'
                                : inCurrentMonth
                                ? 'text-[#1B1E29]'
                                : 'text-[#1B1E29]/25'
                            }`}
                          >
                            {day.getDate()}
                          </span>

                          <div className="mt-1 space-y-1">
                            {visibleTasks.map((task) => (
                              <TaskPill
                                key={task._id}
                                task={task}
                                onClick={() => setDetailTaskId(task._id)}
                              />
                            ))}

                            {overflowCount > 0 && (
                              <p className="px-1.5 text-[10px] text-[#6B6558]/50">
                                +{overflowCount} more
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {unscheduledTasks.length > 0 && (
                <div className="mt-6 rounded-xl border border-[#1B1E29]/8 bg-white p-4 shadow-[0_1px_2px_rgba(16,25,70,0.04)] sm:p-5">
                  <SectionLabel>Not scheduled</SectionLabel>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {unscheduledTasks.map((task) => (
                      <button
                        key={task._id}
                        onClick={() => setDetailTaskId(task._id)}
                        className="rounded-md border border-[#1B1E29]/8 bg-[#fafbfb] px-3 py-1.5 text-[12.5px] text-[#1B1E29] transition-colors hover:border-[#7C82B8]/40 hover:bg-[#7C82B8]/5"
                      >
                        {task.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}