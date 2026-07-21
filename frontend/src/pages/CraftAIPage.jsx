import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
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

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#6B6558' },
  medium: { label: 'Medium', color: '#7C82B8' },
  high: { label: 'High', color: '#C4544A' },
};

const SUGGESTIONS = [
  'Plan a product launch',
  'Plan an onboarding process',
  'Launch a marketing campaign',
  'Prepare a client presentation',
];

// Three staggered dots — the "assistant is thinking" indicator.
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#7C82B8]"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function TaskPreviewCard({ task, subtasks }) {
  const priority = PRIORITY_CONFIG[task.priority || 'medium'];

  return (
    <div className="mt-3 bg-[#fafbfb] border border-[#1B1E29]/8 rounded-lg p-3.5">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[13.5px] font-medium text-[#1B1E29] font-['Space_Grotesk',sans-serif] leading-snug">
          {task.title}
        </h4>
        <span
          className="text-[9.5px] font-['IBM_Plex_Mono',monospace] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded shrink-0"
          style={{ color: priority.color, backgroundColor: `${priority.color}1A` }}
        >
          {priority.label}
        </span>
      </div>

      {subtasks.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {subtasks.map((s) => (
            <li key={s._id} className="flex items-center gap-2 text-[12.5px] text-[#6B6558]">
              <span className="w-1 h-1 rounded-full bg-[#7C82B8] shrink-0" />
              {s.title}
            </li>
          ))}
        </ul>
      )}

      <Link
        to={`/dashboard?open=${task._id}`}
        className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-[#101946] hover:text-[#7C82B8] transition-colors"
      >
        View on board
        <svg viewBox="0 0 12 12" width="9" height="9" fill="none">
          <path d="M2.5 6h7M6 2.5L9.5 6 6 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] px-4 py-2.5 ${
          isUser
            ? 'bg-[#101946] text-white rounded-2xl rounded-br-sm'
            : 'bg-white border border-[#1B1E29]/8 text-[#1B1E29] rounded-2xl rounded-bl-sm'
        }`}
      >
        {message.thinking ? (
          <ThinkingDots />
        ) : (
          <>
            <p className="text-[13.5px] leading-relaxed">{message.content}</p>
            {message.taskPreview && (
              <TaskPreviewCard task={message.taskPreview.task} subtasks={message.taskPreview.subtasks} />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function CraftAIPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [planCount, setPlanCount] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const initials = (user?.fullName || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/tasks');
      const allTasks = response.data.tasks;
      const aiPlans = allTasks.filter((t) => !t.parentTask && t.isAIGenerated);
      const aiSteps = allTasks.filter((t) => t.parentTask && t.isAIGenerated);
      setPlanCount(aiPlans.length);
      setStepCount(aiSteps.length);
    } catch (err) {
      console.error('Failed to load Craft AI stats:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const handleSend = async (promptText) => {
    const text = (promptText ?? input).trim();
    if (!text || sending) return;

    const userMessage = { id: `u-${Date.now()}`, role: 'user', content: text };
    const thinkingMessage = { id: `t-${Date.now()}`, role: 'assistant', thinking: true };

    setMessages((prev) => [...prev, userMessage, thinkingMessage]);
    setInput('');
    setSending(true);

    try {
      const response = await api.post('/ai/craft', { prompt: text });
      const { task, subtasks } = response.data;

      const replyText =
        subtasks.length > 0
          ? `Here's a plan for that — I've added it to your board with ${subtasks.length} steps.`
          : `I've added "${task.title}" to your board.`;

      setMessages((prev) =>
        prev
          .filter((m) => !m.thinking)
          .concat({
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: replyText,
            taskPreview: { task, subtasks },
          })
      );

      setPlanCount((c) => c + 1);
      setStepCount((c) => c + subtasks.length);
      toast.success('Plan added to your board', { icon: '✨' });
    } catch (err) {
      console.error('Craft AI failed:', err);
      const message = err.response?.data?.message || 'Something went wrong — is Ollama running?';
      setMessages((prev) =>
        prev
          .filter((m) => !m.thinking)
          .concat({ id: `a-${Date.now()}`, role: 'assistant', content: message })
      );
      toast.error(message);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-[#fafbfb] flex flex-col">
      {/* Dark hero band */}
      <div className="relative bg-[#0B1130] overflow-hidden shrink-0">
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
            <NavTabs active="craft" />
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

        <div className="relative max-w-3xl mx-auto px-8 pt-8 pb-6 text-center">
          <p className="text-[26px] text-white font-['Space_Grotesk',sans-serif] tracking-tight">
            Describe a goal. Get a plan.
          </p>
          <p className="mt-1.5 text-[13.5px] text-[#A8AEC8]">
            Craft AI turns whatever's on your mind into a task with clear next steps.
          </p>

          <div className="mt-5 flex items-center justify-center gap-6">
            <span className="text-[11.5px] text-[#7C82B8] font-['IBM_Plex_Mono',monospace]">
              {planCount} plans crafted
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-[11.5px] text-[#7C82B8] font-['IBM_Plex_Mono',monospace]">
              {stepCount} steps generated
            </span>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-gradient-to-b from-[#EEF0F9] to-[#fafbfb] flex flex-col min-h-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center text-center pt-8">
                <svg viewBox="0 0 100 100" width="72" height="72" fill="none">
                  <circle cx="50" cy="50" r="46" fill="#7C82B8" fillOpacity="0.08" />
                  <path
                    d="M50 30v40M30 50h40"
                    stroke="#7C82B8"
                    strokeOpacity="0.4"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="50" cy="50" r="6" fill="#101946" />
                </svg>
                <p className="mt-4 text-[14px] text-[#6B6558] max-w-[280px]">
                  Try one of these, or write your own.
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-md">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestionClick(s)}
                      className="text-[12.5px] text-[#1B1E29] bg-white border border-[#1B1E29]/10 rounded-full px-3.5 py-1.5 hover:border-[#7C82B8]/40 hover:bg-[#7C82B8]/5 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <ChatBubble key={message.id} message={message} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Input bar */}
        <div className="border-t border-[#1B1E29]/8 bg-white/70 backdrop-blur-sm px-6 py-4 shrink-0">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What do you want to plan?"
              disabled={sending}
              className="flex-1 bg-[#fafbfb] border border-[#1B1E29]/10 rounded-full px-4 py-2.5 text-[13.5px] text-[#1B1E29] placeholder:text-[#1B1E29]/35 focus:outline-none focus:border-[#7C82B8] transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-10 h-10 rounded-full bg-[#101946] flex items-center justify-center hover:bg-[#0D1438] transition-colors disabled:opacity-40 shrink-0"
              aria-label="Send"
            >
              <svg viewBox="0 0 16 16" width="15" height="15" fill="none">
                <path
                  d="M2 8h11M8 2.5L13.5 8 8 13.5"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}