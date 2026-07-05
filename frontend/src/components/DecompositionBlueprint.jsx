export default function DecompositionBlueprint() {
    return (
      <svg
        viewBox="0 0 440 460"
        className="w-full h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* faint grid, evokes a blueprint/draft surface */}
        <defs>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="440" height="460" fill="url(#grid)" />
  
        {/* connecting lines, drawn first so cards sit on top */}
        <g stroke="#7C82B8" strokeOpacity="0.55" strokeWidth="1.4" strokeDasharray="4 5">
          <path className="motion-safe:animate-[draw_0.6s_ease-out_0.5s_both]" d="M120 96 C 60 150, 60 170, 78 196" />
          <path className="motion-safe:animate-[draw_0.6s_ease-out_0.7s_both]" d="M170 108 C 170 150, 170 170, 170 196" />
          <path className="motion-safe:animate-[draw_0.6s_ease-out_0.9s_both]" d="M210 104 C 250 150, 255 170, 262 196" />
          <path className="motion-safe:animate-[draw_0.6s_ease-out_1.1s_both]" d="M230 98 C 300 140, 330 160, 348 196" />
        </g>
  
        {/* parent task card */}
        <g className="motion-safe:animate-[fadeUp_0.5s_ease-out_both]">
          <rect x="40" y="36" width="220" height="64" rx="10" fill="#1B1E29" stroke="#7C82B8" strokeOpacity="0.6" />
          <circle cx="60" cy="58" r="4" fill="#7C82B8" />
          <text x="76" y="62" fill="#F3F1EA" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="600">
            Launch product hunt campaign
          </text>
          <text x="60" y="82" fill="#8B8FA3" fontSize="9" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.5">
            TASK-014 · vague scope
          </text>
        </g>
  
        {/* AI spark marker */}
        <g className="motion-safe:animate-[fadeUp_0.5s_ease-out_0.3s_both]">
          <circle cx="272" cy="52" r="16" fill="#12141C" stroke="#7C82B8" strokeWidth="1.5" />
          <path d="M272 45v14M265 52h14" stroke="#7C82B8" strokeWidth="1.6" strokeLinecap="round" />
        </g>
  
        {/* 4 subtask cards */}
        {[
          { y: 196, label: 'Draft launch copy', id: 'SUB-01' },
          { y: 260, label: 'Design visual assets', id: 'SUB-02' },
          { y: 324, label: 'Schedule social posts', id: 'SUB-03' },
          { y: 388, label: 'Notify beta users', id: 'SUB-04' },
        ].map((t, i) => (
          <g key={t.id} className="motion-safe:animate-[fadeUp_0.5s_ease-out_both]" style={{ animationDelay: `${0.6 + i * 0.18}s` }}>
            <rect x="56" y={t.y} width="328" height="46" rx="8" fill="#171A24" stroke="#ffffff" strokeOpacity="0.08" />
            <rect x="72" y={t.y + 15} width="14" height="14" rx="4" fill="none" stroke="#7C82B8" strokeWidth="1.4" />
            <text x="96" y={t.y + 25} fill="#F3F1EA" fontSize="11.5" fontFamily="Inter, sans-serif" fontWeight="500">
              {t.label}
            </text>
            <text x="96" y={t.y + 38} fill="#6B7086" fontSize="8.5" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.5">
              {t.id}
            </text>
          </g>
        ))}
      </svg>
    );
  }