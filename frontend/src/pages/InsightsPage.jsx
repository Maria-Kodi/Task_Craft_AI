import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import api from '../api/axios';
import BrandMark from '../components/BrandMark';
import NavTabs from '../components/NavTabs';

function SectionLabel({ children, dark }) {
  return (
    <span
      className={`text-[11px] font-medium tracking-[0.18em] uppercase font-['IBM_Plex_Mono',monospace] ${
        dark ? 'text-[#7C82B8]' : 'text-[#6B6558]'
      }`}
    >
      {children}
    </span>
  );
}

const PRIORITY_COLORS = { low: '#6B6558', medium: '#7C82B8', high: '#C4544A' };
const STATUS_COLORS = { todo: '#7C82B8', 'in-progress': '#C89B5C', done: '#4A9B6E' };
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-[#1B1E29]/10 rounded-md px-3 py-2 shadow-[0_8px_20px_-6px_rgba(16,25,70,0.2)]">
      {label && (
        <p className="text-[10.5px] font-['IBM_Plex_Mono',monospace] text-[#6B6558] mb-1">{label}</p>
      )}
      {payload.map((entry, i) => (
        <p key={i} className="text-[13px] font-medium text-[#1B1E29] font-['Space_Grotesk',sans-serif]">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export default function InsightsPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const initials = (user?.fullName || 'U')
    .split(' ')
    .map((n) => n[0])
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
      toast.error('Could not load insights data');
    } finally {
      setLoading(false);
    }
  };

  const topLevelTasks = useMemo(() => tasks.filter((t) => !t.parentTask), [tasks]);

  const total = topLevelTasks.length;
  const doneCount = topLevelTasks.filter((t) => t.status === 'done').length;
  const activeCount = topLevelTasks.filter((t) => t.status === 'in-progress').length;
  const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const priorityData = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0 };
    topLevelTasks.forEach((t) => {
      const p = t.priority || 'medium';
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([key, count]) => ({ name: PRIORITY_LABELS[key], value: count, key }));
  }, [topLevelTasks]);

  const statusData = useMemo(() => {
    const counts = { todo: 0, 'in-progress': 0, done: 0 };
    topLevelTasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([key, count]) => ({
      name: STATUS_LABELS[key],
      count,
      key,
    }));
  }, [topLevelTasks]);

  const trendData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }

    return days.map((day) => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const count = topLevelTasks.filter((t) => {
        if (t.status !== 'done') return false;
        const updated = new Date(t.updatedAt);
        return updated >= day && updated < nextDay;
      }).length;

      return {
        name: day.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: count,
      };
    });
  }, [topLevelTasks]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#fafbfb]">
      
      <div className="relative bg-[#0B1130] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#7C82B8 1px, transparent 1px), linear-gradient(90deg, #7C82B8 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <header className="relative px-4 sm:px-8 py-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-8">
            <BrandMark theme="dark" />
            <NavTabs active="insights" />
          </div>

          <div className="flex items-center gap-4">
          <Link
  to="/settings"
  className="w-8 h-8 rounded-full bg-[#7C82B8]/20 border border-[#7C82B8]/30 flex items-center justify-center hover:bg-[#7C82B8]/30 transition-colors"
>
  <span className="text-[11px] font-semibold text-white font-['Space_Grotesk',sans-serif]">
    {initials}
  </span>
</Link>
            <button
              onClick={handleLogout}
              className="text-[13px] font-medium text-white border border-white/20 rounded-md px-4 py-2 hover:bg-white/10 transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 pt-10 pb-12">
          <p className="text-[28px] text-white font-['Space_Grotesk',sans-serif] tracking-tight mb-8">
            Your progress at a glance
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 rounded-xl overflow-hidden border border-white/10">
            <div className="bg-white/5 px-6 py-5">
              <SectionLabel dark>Total tasks</SectionLabel>
              <p className="mt-2 text-[32px] font-['Space_Grotesk',sans-serif] text-white leading-none">{total}</p>
            </div>
            <div className="bg-white/5 px-6 py-5">
              <SectionLabel dark>In progress</SectionLabel>
              <p className="mt-2 text-[32px] font-['Space_Grotesk',sans-serif] text-white leading-none">
                {activeCount}
              </p>
            </div>
            <div className="bg-white/5 px-6 py-5">
              <SectionLabel dark>Completed</SectionLabel>
              <p className="mt-2 text-[32px] font-['Space_Grotesk',sans-serif] text-[#4A9B6E] leading-none">
                {doneCount}
              </p>
            </div>
            <div className="bg-white/5 px-6 py-5">
              <SectionLabel dark>Completion rate</SectionLabel>
              <p className="mt-2 text-[32px] font-['Space_Grotesk',sans-serif] text-[#7C82B8] leading-none">
                {completionRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Light workspace area with charts */}
      <div className="bg-gradient-to-b from-[#EEF0F9] to-[#fafbfb]">
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
          {loading ? (
            <p className="text-[13px] text-[#6B6558]">Loading insights…</p>
          ) : total === 0 ? (
            <div className="bg-white rounded-xl border border-[#1B1E29]/8 p-12 text-center">
              <p className="text-[14px] text-[#6B6558]">
                No data yet — create a few tasks on your board to see insights here.
              </p>
              <Link
                to="/dashboard"
                className="inline-block mt-4 text-[13px] font-semibold text-white bg-[#101946] rounded-md px-5 py-2.5 hover:bg-[#0D1438] transition-colors"
              >
                Go to board
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Completion trend — full width */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-2 bg-white rounded-xl border border-[#1B1E29]/8 shadow-[0_1px_2px_rgba(16,25,70,0.04)] p-6"
              >
                <SectionLabel>Completed this week</SectionLabel>
                <p className="mt-1 mb-6 text-[13px] text-[#6B6558]">
                  Tasks marked done, by day, over the last 7 days.
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1B1E29" strokeOpacity={0.06} vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#6B6558', fontFamily: 'IBM Plex Mono' }}
                      axisLine={{ stroke: '#1B1E29', strokeOpacity: 0.1 }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#6B6558', fontFamily: 'IBM Plex Mono' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      name="Completed"
                      stroke="#4A9B6E"
                      strokeWidth={2.5}
                      dot={{ fill: '#4A9B6E', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Priority distribution — pie chart */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="bg-white rounded-xl border border-[#1B1E29]/8 shadow-[0_1px_2px_rgba(16,25,70,0.04)] p-6"
              >
                <SectionLabel>By priority</SectionLabel>
                <p className="mt-1 mb-4 text-[13px] text-[#6B6558]">How your tasks are weighted.</p>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {priorityData.map((entry) => (
                        <Cell key={entry.key} fill={PRIORITY_COLORS[entry.key]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={32}
                      formatter={(value) => (
                        <span className="text-[12px] text-[#1B1E29] font-medium">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Status distribution — bar chart */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white rounded-xl border border-[#1B1E29]/8 shadow-[0_1px_2px_rgba(16,25,70,0.04)] p-6"
              >
                <SectionLabel>By status</SectionLabel>
                <p className="mt-1 mb-4 text-[13px] text-[#6B6558]">Where your tasks currently sit.</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={statusData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1B1E29" strokeOpacity={0.06} vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#6B6558', fontFamily: 'IBM Plex Mono' }}
                      axisLine={{ stroke: '#1B1E29', strokeOpacity: 0.1 }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#6B6558', fontFamily: 'IBM Plex Mono' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: '#7C82B8', fillOpacity: 0.06 }} />
                    <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]}>
                      {statusData.map((entry) => (
                        <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}