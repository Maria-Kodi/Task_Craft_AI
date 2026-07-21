import { Link } from 'react-router-dom';

const ACCENT_TEXT_CLASS =
  'text-[#7C82B8] drop-shadow-[0_0_12px_rgba(139,124,255,0.4)] font-bold';

export default function BrandMark({ theme = 'dark', size = 'sm' }) {
  const isLarge = size === 'lg';

  const wordmarkColor =
    theme === 'dark' ? 'text-[#F3F1EA]' : 'text-[#0F172A]';

  return (
    <Link to="/" className={`flex shrink-0 items-center whitespace-nowrap ${isLarge ? 'gap-3' : 'gap-2'} w-fit group`}>
    <img
        src="/icon.svg"
        alt="TaskCraft AI"
        className={`
         w-auto object-contain transition-transform duration-300 group-hover:scale-105
    ${isLarge ? 'h-8' : 'h-5'}
        `}
      />

      <span
        className={`
          font-['Plus_Jakarta_Sans',sans-serif]
          font-semibold
          tracking-[-0.03em]
          ${wordmarkColor}
          ${isLarge ? 'text-2xl' : 'text-[16px]'}
        `}
      >
        Task<span className={ACCENT_TEXT_CLASS}>Craft</span>
      </span>

      <span
        className={`
          font-['Space_Grotesk',sans-serif]
          font-semibold
          tracking-[0.2em]
          uppercase
          text-[#A5B4FC]
          border border-[#A5B4FC]/20
          bg-[#A5B4FC]/5
          backdrop-blur-sm
          rounded-full
          ${
            isLarge
              ? 'text-[10px] px-2.5 py-1'
              : 'text-[8px] px-2 py-0.5'
          }
        `}
      >
        AI
      </span>
    </Link>
  );
}