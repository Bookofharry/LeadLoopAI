import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Integrations", href: "#integrations" },
  { label: "Human Review", href: "#human-review" },
  { label: "Workflow", href: "#workflow" },
  { label: "Live Demo", href: "/overview" },
]

const linkClassName =
  "group -mx-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white">
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-violet-950/40">
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="m3.27 6.96 8.73 5.05 8.73-5.05M12 22.08V12" />
        </svg>
      </span>
      <span>LeadLoop<span className="text-blue-400">AI</span></span>
    </div>
  )
}

export function LeadLoopFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-zinc-950 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -left-48 top-28 size-[30rem] rounded-full bg-violet-700/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-7 border-b border-white/10 py-14 sm:flex-row sm:items-end sm:justify-between lg:py-16">
          <div>
            <p className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Turn every conversation into an opportunity.
            </p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
              Capture. Understand. Qualify. Act.
            </p>
          </div>
          <Link
            href="/signup"
            className="inline-flex min-h-12 w-fit items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-zinc-950 transition hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            Start with LeadLoop
          </Link>
        </div>

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1.15fr] lg:gap-10 lg:py-16">
          <section aria-labelledby="footer-brand-heading" className="max-w-md">
            <h2 id="footer-brand-heading" className="sr-only">LeadLoop AI</h2>
            <BrandMark />
            <p className="mt-6 text-base font-semibold text-zinc-200">Every enquiry. A next action.</p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              AI-powered lead intake and sales automation that turns customer enquiries into structured opportunities, follow-ups and actionable sales workflows.
            </p>
          </section>

          <nav aria-labelledby="footer-product-heading">
            <h2 id="footer-product-heading" className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-200">Product</h2>
            <ul className="mt-4 space-y-0.5">
              {productLinks.map((link) => (
                <li key={link.label}><Link href={link.href} className={linkClassName}>{link.label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-resources-heading">
            <h2 id="footer-resources-heading" className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-200">Resources</h2>
            <ul className="mt-4 space-y-0.5">
              <li>
                <a href="https://github.com/Bookofharry/LeadLoopAI" target="_blank" rel="noreferrer" className={linkClassName}>
                  GitHub <ArrowUpRight aria-hidden="true" className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a href="https://lead-loop-ai.vercel.app" target="_blank" rel="noreferrer" className={linkClassName}>
                  Live Application <ArrowUpRight aria-hidden="true" className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </nav>

          <section aria-labelledby="footer-buildfest-heading">
            <h2 id="footer-buildfest-heading" className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-200">Built for AI BuildFest 2026</h2>
            <p className="mt-5 text-sm font-medium text-violet-300">AI Automation &amp; Integrations Track</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-zinc-500">Participant</dt>
                <dd className="mt-1 text-zinc-300">Joseph Harry Soronnadi</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-zinc-500">Participant ID</dt>
                <dd className="mt-1 font-mono text-zinc-300">BF-0330</dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 LeadLoop AI. All rights reserved.</p>
          <p>Built with intelligence. Designed for action.</p>
        </div>
      </div>
    </footer>
  )
}
