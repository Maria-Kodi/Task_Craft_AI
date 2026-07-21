import DecompositionBlueprint from './DecompositionBlueprint';
import BrandMark from './BrandMark';
import AuthFooter from './AuthFooter';

export default function AuthLayout({ eyebrow, headline, subhead, children }) {
  return (
    <div className="flex min-h-screen w-full bg-[#05091d] font-['Inter',sans-serif]">
      {/* Desktop: blueprint / brand panel */}
      <div className="relative hidden overflow-hidden px-14 py-10 lg:flex lg:w-[56%] lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-[#7C82B8]/18 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-[140px] -right-[100px] h-[380px] w-[380px] rounded-full bg-[#101946]/40 blur-[130px]" />

        <div className="relative z-10">
          <BrandMark theme="dark" size="lg" />
        </div>

        <div className="relative z-10 flex justify-center">
          <div className="w-full max-w-[460px]">
            <DecompositionBlueprint />
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="mb-3 font-['JetBrains_Mono',monospace] text-xs font-medium uppercase tracking-[0.2em] text-[#7C82B8]">
            {eyebrow ?? 'Smart decomposition'}
          </p>

          <h1 className="mb-3 font-['Space_Grotesk',sans-serif] text-[32px] font-semibold leading-[1.15] text-[#F3F1EA]">
            {headline ?? 'Describe the task. Get the steps.'}
          </h1>

          <p className="text-base leading-relaxed text-[#8B8FA3]">
            {subhead ??
              'TaskCraft breaks big, unclear work into concrete steps your team can start today.'}
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col overflow-hidden bg-gradient-to-br from-[#EEF0F9] to-[#fafbfb]">
        {/* Mobile: compact landing introduction */}
        <div className="px-6 pb-2 pt-6 lg:hidden">
          <BrandMark theme="light" size="sm" />

          <div className="mt-6">
            <p className="mb-2 font-['JetBrains_Mono',monospace] text-[10px] font-medium uppercase tracking-[0.18em] text-[#7C82B8]">
              {eyebrow ?? 'Smart decomposition'}
            </p>

            <h1 className="font-['Space_Grotesk',sans-serif] text-[26px] font-semibold leading-[1.15] text-[#0F172A]">
              {headline ?? 'Describe the task. Get the steps.'}
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
              {subhead ??
                'Turn unclear work into concrete steps your team can start today.'}
            </p>
          </div>
        </div>

        {/* Registration / login form */}
        <div className="flex flex-1 items-start justify-center px-6 py-8 sm:items-end sm:py-10">
          <div className="relative w-full max-w-sm motion-safe:animate-[fadeUp_0.5s_ease-out_0.15s_both]">
            <div className="rounded-2xl border border-black/[0.07] bg-white/55 px-6 py-8 shadow-[0_1px_2px_rgba(27,30,41,0.05),0_20px_40px_-20px_rgba(27,30,41,0.22)] backdrop-blur-[2px] sm:px-9 sm:py-11">
              {children}
            </div>
          </div>
        </div>

        <AuthFooter />
      </div>
    </div>
  );
}