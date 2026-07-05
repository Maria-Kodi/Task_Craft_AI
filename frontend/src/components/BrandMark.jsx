import { Link } from 'react-router-dom';

const ACCENT_TEXT_CLASS = 'text-[#7C82B8] drop-shadow-[0_0_14px_rgba(124,130,184,0.5)]';

/**
 * BrandMark — the "TaskCraft AI" logo lockup.
 * Not a page header (no nav) — just the reusable brand unit that appears
 * on the dark canvas (desktop) and again on the light panel (mobile).
 *
 * theme: 'dark'  → light text, for the dark blueprint canvas
 *        'light' → dark text, for the warm form panel
 * size:  'lg' (default, desktop) | 'sm' (mobile)
 */
export default function BrandMark({ theme = 'dark', size = 'lg' }) {
  const isLarge = size === 'lg';
  const wordmarkColor = theme === 'dark' ? 'text-[#F3F1EA]' : 'text-[#1B1E29]';

  return (
    <Link to="/" className="flex items-center gap-2 w-fit">
      <span
        className={`font-semibold tracking-tight font-['Space_Grotesk',sans-serif] ${wordmarkColor} ${
          isLarge ? 'text-xl' : 'text-lg'
        }`}
      >
        Task<span className={ACCENT_TEXT_CLASS}>Craft</span>
      </span>
      <span
        className={`font-medium tracking-[0.15em] text-[#7C82B8] uppercase border border-[#7C82B8]/40 rounded ${
          isLarge ? 'text-[11px] px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5'
        }`}
      >
        AI
      </span>
    </Link>
  );
}