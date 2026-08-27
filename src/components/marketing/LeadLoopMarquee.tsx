const capabilities = [
  "AI-Powered CRM Automation",
  "Multi-Channel Lead Intake",
  "Human-in-the-Loop AI",
  "Smart Lead Routing",
  "Automated Follow-Ups",
  "Duplicate Lead Detection",
]

function CapabilitySequence({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      className="leadloop-marquee-copy flex shrink-0 items-center"
      aria-hidden={hidden || undefined}
    >
      {capabilities.map((capability, index) => (
        <div key={capability} className="flex shrink-0 items-center">
          <span className="px-5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-violet-50/85 sm:px-7 sm:text-xs">
            {capability}
          </span>
          <span
            className="text-sm font-bold text-violet-300 drop-shadow-[0_0_8px_rgba(196,181,253,0.8)]"
            aria-hidden="true"
          >
            •
          </span>
        </div>
      ))}
    </div>
  )
}

export function LeadLoopMarquee() {
  return (
    <section
      className="leadloop-marquee group w-full overflow-hidden border-y border-violet-400/20 bg-[linear-gradient(90deg,#120b24_0%,#1d1038_48%,#120b24_100%)] py-3 whitespace-nowrap shadow-[inset_0_1px_0_rgba(196,181,253,0.06),inset_0_-1px_0_rgba(196,181,253,0.06)]"
      aria-label="LeadLoop product capabilities"
    >
      <div className="leadloop-marquee-track flex w-max items-center group-hover:[animation-play-state:paused]">
        <CapabilitySequence />
        <CapabilitySequence hidden />
      </div>
    </section>
  )
}
