import DecompositionBlueprint from './DecompositionBlueprint';
import BrandMark from './BrandMark';
import AuthFooter from './AuthFooter';

/**
 * AuthLayout — shared split-screen shell for Login and Register.
 *
 * Left panel: dark "blueprint" canvas with the signature illustration —
 * a big vague task decomposing into 4 concrete subtasks. This is the
 * one bold, subject-specific move; everything else stays quiet.
 *
 * Right panel: warm, paper-toned form surface. No glassmorphism, no
 * generic gradient — a calm, premium counterpoint to the blueprint.
 *
 * Accent palette: #7C82B8 (muted periwinkle, primary accent),
 * #101946 / #0D1438 (deep navy, buttons + hover), #05091d (canvas bg).
 *
 * Required once in your global CSS (e.g. index.css):
 *
 * @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
 */

export default function AuthLayout({ eyebrow, headline, subhead, children }) {
  return (
    <div className="min-h-screen w-full flex bg-[#05091d] font-['Inter',sans-serif]">
      {/* Left — blueprint / brand panel */}
      <div className="hidden lg:flex lg:w-[56%] relative flex-col justify-between px-14 py-10 overflow-hidden">
        {/* ambient glow — two depths of the same accent, no more mixed gold/violet */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[#7C82B8]/18 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[-140px] right-[-100px] w-[380px] h-[380px] rounded-full bg-[#101946]/40 blur-[130px]" />

        <div className="relative z-10">
          <BrandMark theme="dark" size="lg" />
        </div>

        <div className="relative z-10 flex justify-center">
          <div className="w-full max-w-[460px]">
            <DecompositionBlueprint />
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="text-xs font-medium tracking-[0.2em] uppercase font-['JetBrains_Mono',monospace] mb-3 text-[#7C82B8]">
            {eyebrow ?? 'Smart decomposition'}
          </p>
          <h1 className="text-[32px] leading-[1.15] font-semibold text-[#F3F1EA] font-['Space_Grotesk',sans-serif] mb-3">
            {headline ?? 'One vague task in. Four clear moves out.'}
          </h1>
          <p className="text-base text-[#8B8FA3] leading-relaxed">
            {subhead ?? 'TaskCraft breaks big, unclear work into concrete steps your team can start today.'}
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-[#F8F5EF] via-[#F6F3EC] to-[#F0EBDF]">
        {/* mobile-only compact brand mark */}
        <div className="lg:hidden px-6 py-6">
          <BrandMark theme="light" size="sm" />
        </div>

        {/* items-end instead of items-center — drops the card down toward the
            breathing room already freed up above the footer */}
        <div className="flex-1 flex items-end justify-center px-6 py-10">
          <div className="w-full max-w-sm relative motion-safe:animate-[fadeUp_0.5s_ease-out_0.15s_both]">
            <div className="rounded-2xl border border-black/[0.07] bg-white/55 backdrop-blur-[2px] shadow-[0_1px_2px_rgba(27,30,41,0.05),0_20px_40px_-20px_rgba(27,30,41,0.22)] px-9 py-11">
              {children}
            </div>
          </div>
        </div>

        <AuthFooter />
      </div>
    </div>
  );
}