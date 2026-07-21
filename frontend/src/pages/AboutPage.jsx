import { Link } from 'react-router-dom';
import BrandMark from '../components/BrandMark';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fafbfb]">
      {/* Dark hero band */}
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
          <BrandMark theme="dark" />
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[13px] font-medium text-white/60 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
              <path d="M7.5 2.5L3.5 6l4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to home
          </Link>
        </header>

        <div className="relative max-w-2xl mx-auto px-4 sm:px-8 pt-14 pb-16 text-center">
          <p className="text-[28px] sm:text-[32px] text-white font-['Space_Grotesk',sans-serif] font-medium tracking-tight mb-3">
            Who's behind TaskCraft AI?
          </p>
          <p className="text-[14px] text-[#A8AEC8] leading-relaxed">
            A brief introduction to the idea, the person building it, and where it's headed.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-14 space-y-12">
        <section>
          <span className="text-[11px] font-medium tracking-[0.18em] uppercase font-['IBM_Plex_Mono',monospace] text-[#7C82B8]">
            The idea
          </span>
          <p className="mt-3 text-[15px] text-[#1B1E29] leading-relaxed">
            Most task managers let you write a task down, but they don't help you actually
            start it. TaskCraft AI exists to close that gap! You describe what you want to get
            done, even if it's vague, and it helps turn that into clear, actionable steps.
          </p>
        </section>

        <section>
          <span className="text-[11px] font-medium tracking-[0.18em] uppercase font-['IBM_Plex_Mono',monospace] text-[#7C82B8]">
            The person building it
          </span>
          <p className="mt-3 text-[15px] text-[#1B1E29] leading-relaxed">
          Hi, I’m Maria Kolodii. I enjoy turning ideas into practical digital products. 
          TaskCraft AI is a project I built from the ground up to develop my skills and explore how technology can make everyday work clearer, more manageable, and more productive.
          My goal is to continue evolving it into a useful SaaS tool that helps people turn complex tasks into actionable next steps.
          </p>
        </section>

        <section>
          <span className="text-[11px] font-medium tracking-[0.18em] uppercase font-['IBM_Plex_Mono',monospace] text-[#7C82B8]">
            Still growing
          </span>
          <p className="mt-3 text-[15px] text-[#1B1E29] leading-relaxed">
          This is very much a work in progress. New features are still being added, and some
          things may change as the product evolves. I'm continuously refining the experience
          and welcome feedback that helps make TaskCraft more useful.
          </p>
        </section>

        <section className="pt-6 border-t border-[#1B1E29]/8">
          <span className="text-[11px] font-medium tracking-[0.18em] uppercase font-['IBM_Plex_Mono',monospace] text-[#7C82B8]">
            Get in touch
          </span>
          <p className="mt-3 text-[15px] text-[#1B1E29] leading-relaxed">
          Questions, feedback, or just want to say hi? 👋{' '}
            <a
              href="mailto:maria22newl@gmail.com"
              className="font-medium text-[#101946] hover:text-[#7C82B8] transition-colors underline underline-offset-2"
            >
              maria22newl@gmail.com
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}