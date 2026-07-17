import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedOrb } from "@/components/ui/animated-orb";
import { LogoBanner } from "@/components/ui/logo-banner";
import { PricingSection } from "@/components/landing/PricingSection";
import { MCPSection } from "@/components/landing/MCPSection";
import { MobileNav } from "@/components/landing/MobileNav";
import { ArrowRight, Crosshair, ShieldCheck, Target, Box, Rocket, FolderKanban, Sparkles, Layers, Library, Check, X } from "lucide-react";

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 20L7 10l5 6 4-10 6 14" />
    </svg>
  );
}

const testimonials = [
  {
    quote: "PMMSherpa is a great example of an effective vertical AI solution. It’s purpose built. The output isn’t just fast; it’s grounded in real-world frameworks and actual PMM experience. It’s levels above what I get from a general-purpose model like Claude.",
    short: "It’s levels above what I get from a general-purpose model like Claude.",
    name: "VP of Product Marketing",
    role: "Fortune 200 ERP Provider",
    photo: "",
  },
  {
    quote: "PMMSherpa gave me access to expert product marketing feedback loops and suggestions for my scenario rapidly and focus on what it seems like a seasoned professional would say. Easy to use and just works. Definitely seems more focused and professional than just using a flagship model alone.",
    short: "Easy to use and just works. More focused and professional than a flagship model alone.",
    name: "Daniel Wolff",
    role: "Senior Engineering Consultant, ex-Meta, authID",
    photo: "/homepage/dan_wolff_profile.jpeg",
  },
  {
    quote: "Most AI tools make you do the thinking and then dress it up. Sherpa does the opposite. It comes in educated, applies the right frameworks to your actual problem, and pushes back when your reasoning isn’t there yet. Where other tools generate, Sherpa evaluates. It catches things most tools don’t: where your argument has gaps, where friction will show up with buyers, where you’re circling the problem without landing on a real position. Anyone who touches GTM will feel the difference immediately.",
    short: "Where other tools generate, Sherpa evaluates.",
    name: "Asli Simsek",
    role: "Product Marketing Manager, CMO Alliance Member",
    photo: "/homepage/asli-simsek.png",
  },
  {
    quote: "PMMSherpa actually feels like a new individual thinking about your project with you. It’s really a team partner working alongside you. No lecturing, no pandering, no generic frameworks dressed up with language as insight. Just a thinking partner that meets you at your level and pushes you forward.",
    short: "Just a thinking partner that meets you at your level and pushes you forward.",
    name: "Shreyas Sriram",
    role: "Founder, Practice Intuition / AI Researcher",
    photo: "/homepage/shreyas-sriram.jpeg",
  },
  {
    quote: "I’ve spent over a decade in product marketing, refining frameworks for everything from positioning to go-to-market strategy, and PMMSherpa feels like working with an experienced partner. The frameworks are built in, and the outputs are far more useful than a general-purpose LLM. It helps me move faster while maintaining quality, and its strong point of view challenges my thinking in ways other tools don’t.",
    short: "Its strong point of view challenges my thinking in ways other tools don’t.",
    name: "Brian Remmel",
    role: "Principal Product Marketing Manager, Palo Alto Networks",
    photo: "/homepage/brain_remmel_bio.jpeg",
  },
  {
    quote: "I’ve tried most AI tools that claim to “help with branding,” and almost all of them feel like they’re guessing with confidence. PMMSherpa is different. What stood out immediately was the precision of its thinking. The insights weren’t generic or dressed-up clichés. They felt sharp, considered and actually usable. If you work in branding, this is one of the few AI tools that doesn’t feel like it’s wasting your time.",
    short: "One of the few AI tools that doesn’t feel like it’s wasting your time.",
    name: "Head of Creative Strategy",
    role: "ex-Edelman",
    photo: "",
  },
];

const comparisonRows = [
  { label: "Knows GTM frameworks deeply", chatgpt: false, claude: false, sherpa: true },
  { label: "Remembers your company between chats", chatgpt: false, claude: false, sherpa: true },
  { label: "Commits to one recommendation", chatgpt: false, claude: false, sherpa: true },
  { label: "Free to start", chatgpt: true, claude: true, sherpa: true },
];

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-light min-h-screen bg-white relative overflow-x-hidden" style={{ colorScheme: "light" }}>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
        <nav className="max-w-6xl mx-auto flex h-16 items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0058be] to-[#2170e4] flex items-center justify-center">
              <MountainIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-[#191c1e]">
              PMMSherpa
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5f6368]">
            <a href="#why-sherpa" className="hover:text-[#191c1e] transition-colors">Why Sherpa</a>
            <a href="#projects" className="hover:text-[#191c1e] transition-colors">Projects</a>
            <a href="#how-it-works" className="hover:text-[#191c1e] transition-colors">How It Works</a>
            <a href="#who-its-for" className="hover:text-[#191c1e] transition-colors">Who It&apos;s For</a>
            <a href="#pricing" className="hover:text-[#191c1e] transition-colors">Pricing</a>
            <a href="#mcp" className="hover:text-[#191c1e] transition-colors">MCP</a>
            <Link href="/docs" className="hover:text-[#191c1e] transition-colors">Docs</Link>
            <Link href="/blog" className="hover:text-[#191c1e] transition-colors">Blog</Link>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="rounded-full text-[#5f6368] hover:text-[#191c1e] hover:bg-[#f2f4f7]">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="rounded-full bg-[#0058be] hover:bg-[#004a9e] text-white shadow-none font-medium px-5">
                Get Started
              </Button>
            </Link>
            <MobileNav />
          </div>
        </nav>
      </header>

      {/* Hero — compressed: claim, sub, CTA, then the product itself */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[500px] md:h-[600px] pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/homepage/hero-background.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain object-top opacity-[0.30]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
        </div>

        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-6 text-center relative">
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-center mb-6">
              <AnimatedOrb size="md" />
            </div>

            <div className="flex justify-center mb-6">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-full border border-[#0058be]/20 bg-[#0058be]/[0.06] px-4 py-1.5 text-sm font-medium text-[#0058be] hover:bg-[#0058be]/[0.1] transition-colors"
              >
                <span className="rounded-full bg-[#0058be] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">New</span>
                Projects: give Sherpa your company context
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <h1 className="mb-6 text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e] sm:text-5xl md:text-[3.5rem] leading-[1.1]">
              Stop guessing,
              <br />
              <span className="bg-gradient-to-r from-[#0058be] to-[#2170e4] bg-clip-text text-transparent">
                Start converting.
              </span>
            </h1>
            <p className="mb-8 text-lg text-[#4a4f57] sm:text-xl max-w-2xl mx-auto leading-relaxed">
              ChatGPT doesn&apos;t know your market. <span className="font-semibold text-[#191c1e]">Sherpa does.</span>
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-10">
              <Link href="/login">
                <Button
                  size="lg"
                  className="gap-2 rounded-full bg-[#0058be] hover:bg-[#004a9e] text-white font-medium px-8 shadow-none h-12 text-base"
                >
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Demo Video — the product is the proof */}
        <div className="max-w-5xl mx-auto px-5 md:px-8 pb-8 relative">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,88,190,0.10)] ring-1 ring-[#e8ecf4]/60">
              <video autoPlay loop muted playsInline className="w-full h-auto">
                <source src="/homepage/hero-demo.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>

        {/* Logo Banner — thin credibility strip under the product */}
        <div className="relative pb-4">
          <LogoBanner />
        </div>
      </section>

      {/* Why Sherpa — the argument the page hangs on */}
      <section id="why-sherpa" className="py-14 md:py-20 scroll-mt-20" style={{
        background: "linear-gradient(180deg, #f8f9fd 0%, #f0f3fa 50%, #f8f9fd 100%)",
      }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">Why Sherpa</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e] mb-4">
              Why not just ChatGPT?
            </h2>
            <p className="text-base text-[#4a4f57] max-w-2xl mx-auto leading-relaxed">
              Because your GTM deserves more than a remix of the internet.
            </p>
          </div>

          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="rounded-2xl bg-white p-7 border border-[#e8ecf4]/60">
              <div className="w-12 h-12 rounded-xl bg-[#0058be]/[0.08] flex items-center justify-center mb-5">
                <Library className="h-6 w-6 text-[#0058be]" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] mb-3">Reasons from a curated corpus</h3>
              <p className="text-sm text-[#4a4f57] leading-relaxed">
                Generic AI averages everything ever written about marketing. Sherpa reasons from
                38,000+ battle-tested GTM insights, curated from 2,800+ source documents across
                500+ companies. Depth you can interrogate, not vibes.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 border border-[#e8ecf4]/60">
              <div className="w-12 h-12 rounded-xl bg-[#0058be]/[0.08] flex items-center justify-center mb-5">
                <FolderKanban className="h-6 w-6 text-[#0058be]" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] mb-3">Remembers your market</h3>
              <p className="text-sm text-[#4a4f57] leading-relaxed">
                ChatGPT forgets your company the moment a chat ends. Sherpa keeps your positioning,
                ICPs, and voice in Projects, so every conversation starts where the last one left off.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 border border-[#e8ecf4]/60">
              <div className="w-12 h-12 rounded-xl bg-[#0058be]/[0.08] flex items-center justify-center mb-5">
                <Crosshair className="h-6 w-6 text-[#0058be]" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] mb-3">Commits to a recommendation</h3>
              <p className="text-sm text-[#4a4f57] leading-relaxed">
                Generic AI gives you five options and lets you pick. Sherpa gives you the one that
                fits your market, and shows the reasoning behind it.
              </p>
            </div>
          </div>

          {/* Comparison table */}
          <div className="max-w-2xl mx-auto rounded-2xl bg-white border border-[#e8ecf4]/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0f2f5]">
                  <th className="text-left px-5 py-3.5 font-semibold text-[#191c1e]"></th>
                  <th className="px-3 py-3.5 font-medium text-[#5f6368]">ChatGPT</th>
                  <th className="px-3 py-3.5 font-medium text-[#5f6368]">Claude</th>
                  <th className="px-3 py-3.5 font-bold text-[#0058be]">PMM Sherpa</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label} className="border-b border-[#f0f2f5] last:border-b-0">
                    <td className="px-5 py-3.5 text-[#3a3f47]">{row.label}</td>
                    <td className="px-3 py-3.5 text-center">
                      {row.chatgpt ? <Check className="h-4 w-4 text-[#9ca3af] inline" /> : <X className="h-4 w-4 text-[#d1d5db] inline" />}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      {row.claude ? <Check className="h-4 w-4 text-[#9ca3af] inline" /> : <X className="h-4 w-4 text-[#d1d5db] inline" />}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      {row.sherpa ? <Check className="h-4 w-4 text-[#0058be] inline" /> : <X className="h-4 w-4 text-[#d1d5db] inline" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Projects — the moat, not a feature tour */}
      <section id="projects" className="py-14 md:py-20 scroll-mt-20 bg-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">
              Projects <span className="ml-1 rounded-full bg-[#0058be] px-2 py-0.5 text-[10px] font-bold text-white normal-case tracking-normal">New</span>
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e] mb-4">
              Sherpa remembers your market.
            </h2>
            <p className="text-base text-[#4a4f57] max-w-2xl mx-auto leading-relaxed">
              Give Sherpa your positioning docs, ICPs, brand voice, and past assets once.
              Every chat inside a project starts already grounded in your product, your market,
              and your voice. Generic AI starts every chat from zero.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-12">
            {/* Left: proof points */}
            <div className="space-y-7">
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#0058be]/[0.08] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-[#0058be]" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#191c1e] mb-1.5">Set up in chat, not forms</h3>
                  <p className="text-sm text-[#4a4f57] leading-relaxed">
                    Sherpa interviews you, drafts your project instructions, and recommends which
                    documents to add. Setup feels like a conversation because it is one.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#0058be]/[0.08] flex items-center justify-center flex-shrink-0">
                  <Layers className="h-5 w-5 text-[#0058be]" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#191c1e] mb-1.5">No knowledge cap</h3>
                  <p className="text-sm text-[#4a4f57] leading-relaxed">
                    Up to 100 documents per project, 300 pages each. Sherpa retrieves what each
                    question needs, so your library keeps growing without degrading answers.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#0058be]/[0.08] flex items-center justify-center flex-shrink-0">
                  <Library className="h-5 w-5 text-[#0058be]" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#191c1e] mb-1.5">Your docs + the Sherpa brain</h3>
                  <p className="text-sm text-[#4a4f57] leading-relaxed">
                    Answers combine your company context with 40,000+ curated GTM insights.
                    Generic AI knows marketing. Sherpa knows yours.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: setup-assistant mockup */}
            <div className="rounded-2xl bg-white border border-[#e8ecf4] shadow-[0_8px_30px_rgba(0,88,190,0.08)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f2f5]">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#0058be]" strokeWidth={2} />
                  <span className="text-sm font-semibold text-[#191c1e]">Project setup</span>
                  <span className="text-xs text-[#9ca3af]">2/3</span>
                </div>
                <FolderKanban className="h-4 w-4 text-[#9ca3af]" strokeWidth={1.75} />
              </div>
              <div className="px-5 py-3 flex items-center gap-2 text-xs border-b border-[#f0f2f5]">
                <span className="flex items-center gap-1.5 font-medium text-[#0058be]">
                  <span className="w-2 h-2 rounded-full bg-[#0058be]" /> Describe
                </span>
                <span className="text-[#d1d5db]">&rsaquo;</span>
                <span className="flex items-center gap-1.5 font-medium text-[#0058be]">
                  <span className="w-2 h-2 rounded-full bg-[#0058be]" /> Instructions
                </span>
                <span className="text-[#d1d5db]">&rsaquo;</span>
                <span className="flex items-center gap-1.5 text-[#9ca3af]">
                  <span className="w-2 h-2 rounded-full border border-[#d1d5db]" /> Documents
                </span>
              </div>
              <div className="p-5 space-y-3">
                <div className="rounded-xl rounded-tl-sm bg-[#f2f6fc] px-4 py-3 text-sm text-[#3a3f47] leading-relaxed">
                  What&apos;s the product this workspace is for, and what&apos;s the main thing
                  you&apos;re trying to accomplish with it?
                </div>
                <div className="rounded-xl rounded-tr-sm bg-[#0058be] px-4 py-3 text-sm text-white leading-relaxed ml-8">
                  Acme Pipeline. We sell to mid-market RevOps leaders. Direct, no-fluff voice.
                </div>
                <div className="rounded-xl rounded-tl-sm bg-[#f2f6fc] px-4 py-3 text-sm text-[#3a3f47] leading-relaxed">
                  Got it. I&apos;ve drafted your project instructions. Next, add your messaging
                  doc and latest launch plan and I&apos;ll read them in.
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/login">
              <Button
                size="lg"
                className="gap-2 rounded-full bg-[#0058be] hover:bg-[#004a9e] text-white font-medium px-8 shadow-none h-12 text-base"
              >
                Try Projects <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="mt-3 text-xs text-[#9ca3af]">Included in the Starter plan</p>
          </div>
        </div>
      </section>

      {/* What Sherpa Does — two jobs, not four features */}
      <section id="what-it-does" className="py-14 md:py-20 scroll-mt-20" style={{
        background: "linear-gradient(180deg, #f8f9fd 0%, #f0f3fa 50%, #f8f9fd 100%)",
      }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">What Sherpa Does</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e]">
              Two jobs, done at a senior level
            </h2>
          </div>

          <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white p-8 border border-[#e8ecf4]/60">
              <div className="w-12 h-12 rounded-xl bg-[#0058be]/[0.08] flex items-center justify-center mb-5">
                <Crosshair className="h-6 w-6 text-[#0058be]" strokeWidth={1.75} />
              </div>
              <h3 className="text-xl font-bold text-[#191c1e] mb-3">Get strategic clarity</h3>
              <p className="text-sm text-[#4a4f57] leading-relaxed">
                Positioning, messaging, pricing, category design, launch strategy. Ask messy
                questions and get one structured recommendation grounded in proven GTM
                methodology. Foundation, not feeling.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 border border-[#e8ecf4]/60">
              <div className="w-12 h-12 rounded-xl bg-[#0058be]/[0.08] flex items-center justify-center mb-5">
                <ShieldCheck className="h-6 w-6 text-[#0058be]" strokeWidth={1.75} />
              </div>
              <h3 className="text-xl font-bold text-[#191c1e] mb-3">De-risk before you ship</h3>
              <p className="text-sm text-[#4a4f57] leading-relaxed">
                Don&apos;t find out your messaging is off after it&apos;s live. Sherpa scores your
                work against the same frameworks top GTM leaders use, and catches what you missed
                while it&apos;s still cheap to fix.
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-[#5f6368] mt-8 max-w-xl mx-auto">
            And when it&apos;s your own career on the line: guidance from IC to VP, startup to enterprise.
          </p>
        </div>
      </section>

      {/* How It Works — outcomes, not plumbing */}
      <section id="how-it-works" className="py-14 md:py-20 scroll-mt-20" style={{
        background: "linear-gradient(180deg, #0a1628 0%, #0f1d35 50%, #0a1628 100%)",
      }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-12 md:mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5a9cf5] mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] mb-4 text-white">
              Ask. Get depth. Ship.
            </h2>
            <p className="text-base text-[#8e9199] max-w-2xl mx-auto leading-relaxed">
              Most AI marketing tools are a language model with a system prompt. Sherpa plans,
              retrieves, and reasons before it writes a word.
            </p>
          </div>

          {/* Step 1 */}
          <div className="max-w-5xl mx-auto mb-10 md:mb-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-[#5a9cf5] mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#0058be]/20 flex items-center justify-center text-xs font-bold text-[#5a9cf5]">1</span>
                  Intelligent retrieval
                </div>
                <h3 className="text-2xl font-semibold tracking-tight mb-4 text-white">
                  Ask messy questions. Get structured answers.
                </h3>
                <p className="text-[#8e9199] leading-relaxed mb-4">
                  Your full question and conversation context surface the right frameworks and
                  practitioner experience automatically. No prompt engineering required.
                </p>
                <p className="text-sm text-[#5a6577] leading-relaxed border-l-2 border-[#0058be]/30 pl-4">
                  Your question surfaces the right frameworks automatically. No keyword games,
                  no magic incantations.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <video autoPlay loop muted playsInline className="w-full h-auto">
                  <source src="/homepage/intelligent-retrieval.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="max-w-5xl mx-auto mb-10 md:mb-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 md:order-1 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <video autoPlay loop muted playsInline className="w-full h-auto">
                  <source src="/homepage/expert-response.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-[#5a9cf5] mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#0058be]/20 flex items-center justify-center text-xs font-bold text-[#5a9cf5]">2</span>
                  Expert depth
                </div>
                <h3 className="text-2xl font-semibold tracking-tight mb-4 text-white">
                  One recommendation, backed by the sharpest minds in GTM.
                </h3>
                <p className="text-[#8e9199] leading-relaxed mb-4">
                  Draws from the playbooks that shaped the best GTM leaders in tech. PMMSherpa
                  commits to a recommendation. You decide what to do with it.
                </p>
                <p className="text-sm text-[#5a6577] leading-relaxed border-l-2 border-[#0058be]/30 pl-4">
                  Five generic options is a stall. Sherpa commits to the one that fits your market,
                  and shows the reasoning behind it.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="max-w-5xl mx-auto mb-10 md:mb-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-[#5a9cf5] mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#0058be]/20 flex items-center justify-center text-xs font-bold text-[#5a9cf5]">3</span>
                  Ready to ship
                </div>
                <h3 className="text-2xl font-semibold tracking-tight mb-4 text-white">
                  Hand it to your VP. It&apos;s ready.
                </h3>
                <p className="text-[#8e9199] leading-relaxed mb-4">
                  Positioning statements. Battlecards. Messaging frameworks. Launch plans. Share
                  your context, get something you can present to leadership or hand to sales.
                </p>
                <p className="text-sm text-[#5a6577] leading-relaxed border-l-2 border-[#0058be]/30 pl-4">
                  Structured like a senior PMM wrote it, because the thinking behind it was.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <video autoPlay loop muted playsInline className="w-full h-auto">
                  <source src="/homepage/deliverable.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 md:order-1 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <video autoPlay loop muted playsInline className="w-full h-auto">
                  <source src="/homepage/url-analysis.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-[#5a9cf5] mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#0058be]/20 flex items-center justify-center text-xs font-bold text-[#5a9cf5]">4</span>
                  URL analysis
                </div>
                <h3 className="text-2xl font-semibold tracking-tight mb-4 text-white">
                  Paste a competitor&apos;s page. Know their play in 30 seconds.
                </h3>
                <p className="text-[#8e9199] leading-relaxed mb-4">
                  Drop a homepage, a pricing page, an announcement. PMMSherpa identifies the
                  positioning moves and tells you what it means for your strategy.
                </p>
                <p className="text-sm text-[#5a6577] leading-relaxed border-l-2 border-[#0058be]/30 pl-4">
                  Sherpa reads the positioning moves on any page and tells you what they mean
                  for your strategy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof — two spotlights + a wall of short quotes */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">What Users Say</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e]">
              The difference is immediate
            </h2>
          </div>

          {/* Spotlights */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {[testimonials[4], testimonials[2]].map((t, i) => (
              <div key={i} className="rounded-2xl bg-white p-7 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#e8ecf4]/40">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-2xl text-[#0058be] font-serif leading-none">&ldquo;</div>
                  <Stars />
                </div>
                <p className="text-[15px] text-[#3a3f47] leading-[1.7] mb-4">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-[#f0f2f5]">
                  {t.photo && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  )}
                  <div>
                    <div className="text-sm font-bold bg-gradient-to-r from-[#0058be] to-[#2170e4] bg-clip-text text-transparent">
                      {t.name}
                    </div>
                    <div className="text-xs text-[#5f6368] mt-0.5">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Short-quote wall */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[testimonials[0], testimonials[1], testimonials[3], testimonials[5]].map((t, i) => (
              <div key={i} className="rounded-xl bg-[#f8f9fd] px-5 py-4 border border-[#e8ecf4]/50">
                <p className="text-sm text-[#3a3f47] leading-relaxed mb-2">&ldquo;{t.short}&rdquo;</p>
                <p className="text-xs text-[#5f6368]">
                  <span className="font-semibold text-[#191c1e]">{t.name}</span> · {t.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section id="who-its-for" className="py-14 md:py-20 scroll-mt-20" style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8f9fd 50%, #ffffff 100%)",
      }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">Who It&apos;s For</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e]">
              For the people who own go-to-market and can&apos;t afford to get it wrong
            </h2>
          </div>

          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white p-7 md:p-8 border border-[#e8ecf4]/60 hover:shadow-[0_8px_30px_rgba(0,88,190,0.06)] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#0058be]/[0.08] flex items-center justify-center mb-5">
                <Target className="h-6 w-6 text-[#0058be]" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] mb-3">Product Marketers</h3>
              <p className="text-sm text-[#4a4f57] leading-relaxed">
                The thinking partner who&apos;s already up to speed, has seen your problem before, and tells you what it actually thinks.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 md:p-8 border border-[#e8ecf4]/60 hover:shadow-[0_8px_30px_rgba(0,88,190,0.06)] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#0058be]/[0.08] flex items-center justify-center mb-5">
                <Box className="h-6 w-6 text-[#0058be]" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] mb-3">Product Managers</h3>
              <p className="text-sm text-[#4a4f57] leading-relaxed">
                You know the product cold. Translating that into messaging that makes buyers feel something? That&apos;s a different skill. PMMSherpa bridges the gap.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 md:p-8 border border-[#e8ecf4]/60 hover:shadow-[0_8px_30px_rgba(0,88,190,0.06)] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#0058be]/[0.08] flex items-center justify-center mb-5">
                <Rocket className="h-6 w-6 text-[#0058be]" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] mb-3">Founders</h3>
              <p className="text-sm text-[#4a4f57] leading-relaxed">
                Your first GTM hire is $180K and three months to ramp. PMMSherpa gives you strategic depth from day one, without the headcount.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cost of getting it wrong — the value anchor before pricing */}
      <section className="py-12 md:py-16" style={{
        background: "linear-gradient(135deg, #0a1628 0%, #0f1d35 60%, #162544 100%)",
      }}>
        <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-white mb-5">
            Bad positioning doesn&apos;t fail in the brainstorm.
          </h2>
          <p className="text-base md:text-lg text-[#c8d0e0] leading-relaxed">
            It fails in market, a quarter later, after it&apos;s confused your sales team and cost
            you your window. The most expensive GTM mistakes are the ones nobody catches before
            launch. Sherpa is how you catch them.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* MCP */}
      <MCPSection />

      {/* CTA */}
      <section className="py-14 md:py-20" style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8f9fd 100%)",
      }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl p-10 md:p-14 text-center" style={{
              background: "linear-gradient(135deg, #0058be 0%, #1a6dd6 50%, #2170e4 100%)",
            }}>
              <h2 className="mb-4 text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-white">
                The doubt doesn&apos;t go away on its own.
              </h2>
              <p className="mb-8 text-lg text-blue-200 max-w-xl mx-auto">
                Sherpa is what you check your thinking against before it matters.
              </p>
              <Link href="/login">
                <Button
                  size="lg"
                  className="gap-2 rounded-full bg-white text-[#0058be] hover:bg-blue-50 font-semibold px-8 shadow-none h-12 text-base"
                >
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="mt-4 text-sm text-blue-300/80">
                10 messages a month free. No credit card. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-white border-t border-[#f0f2f5]">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#0058be] to-[#2170e4] flex items-center justify-center">
                <MountainIcon className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium text-[#191c1e]">PMMSherpa</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#5f6368]">
              <a href="#why-sherpa" className="hover:text-[#191c1e] transition-colors">Why Sherpa</a>
              <a href="#projects" className="hover:text-[#191c1e] transition-colors">Projects</a>
              <a href="#how-it-works" className="hover:text-[#191c1e] transition-colors">How It Works</a>
              <a href="#who-its-for" className="hover:text-[#191c1e] transition-colors">Who It&apos;s For</a>
              <a href="#pricing" className="hover:text-[#191c1e] transition-colors">Pricing</a>
              <Link href="/docs" className="hover:text-[#191c1e] transition-colors">Docs</Link>
              <Link href="/blog" className="hover:text-[#191c1e] transition-colors">Blog</Link>
              <Link href="/terms" className="hover:text-[#191c1e] transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-[#191c1e] transition-colors">Privacy</Link>
              <Link href="/login" className="hover:text-[#191c1e] transition-colors">Sign In</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
