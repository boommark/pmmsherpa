import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AnimatedOrb } from "@/components/ui/animated-orb";
import { LogoBanner } from "@/components/ui/logo-banner";
import { ArrowRight } from "lucide-react";

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
    quote: "PMM Sherpa is a great example of an effective vertical AI solution. It\u2019s purpose built. The output isn\u2019t just fast; it\u2019s grounded in real-world frameworks and actual PMM experience. It\u2019s levels above what I get from a general-purpose model like Claude.",
    name: "VP of Product Marketing",
    role: "Fortune 200 ERP Provider",
  },
  {
    quote: "PMM Sherpa gave me access to expert product marketing feedback loops and suggestions for my scenario rapidly and focus on what it seems like a seasoned professional would say. Easy to use and just works. Definitely seems more focused and professional than just using a flagship model alone.",
    name: "Founder",
    role: "ex-Meta Senior Engineer",
  },
  {
    quote: "Most AI tools make you do the thinking and then dress it up. Sherpa does the opposite. It comes in educated, applies the right frameworks to your actual problem, and pushes back when your reasoning isn\u2019t there yet. Where other tools generate, Sherpa evaluates. It catches things most tools don\u2019t: where your argument has gaps, where friction will show up with buyers, where you\u2019re circling the problem without landing on a real position. Anyone who touches GTM will feel the difference immediately. And honestly, the name says it all.",
    name: "PMM Leader",
    role: "CMO Alliance Member",
  },
  {
    quote: "PMM Sherpa actually feels like a new individual thinking about your project with you. It\u2019s really a team partner working alongside you. No lecturing, no pandering, no generic frameworks dressed up with language as insight. Just a thinking partner that meets you at your level and pushes you forward.",
    name: "Serial Founder",
    role: "AI Researcher",
  },
];

export default function LandingPage() {
  return (
    <div className="landing-light min-h-screen bg-white relative overflow-hidden" style={{ colorScheme: "light" }}>

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
            <a href="#what-it-does" className="hover:text-[#191c1e] transition-colors">What It Does</a>
            <a href="#under-the-hood" className="hover:text-[#191c1e] transition-colors">Under the Hood</a>
            <a href="#how-it-works" className="hover:text-[#191c1e] transition-colors">How It Works</a>
            <a href="#who-its-for" className="hover:text-[#191c1e] transition-colors">Who It&apos;s For</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="rounded-full text-[#5f6368] hover:text-[#191c1e] hover:bg-[#f2f4f7]">
                Log in
              </Button>
            </Link>
            <Link href="/request-access">
              <Button className="rounded-full bg-[#0058be] hover:bg-[#004a9e] text-white shadow-none font-medium px-5">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[500px] md:h-[600px] pointer-events-none">
          <Image
            src="/homepage/hero-background.png"
            alt=""
            fill
            className="object-contain object-top opacity-[0.30]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
        </div>

        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-20 md:pt-28 pb-10 md:pb-14 text-center relative">
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-center mb-8">
              <AnimatedOrb size="md" />
            </div>

            <h1 className="mb-6 text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e] sm:text-5xl md:text-[3.5rem] leading-[1.1]">
              Stop guessing.
              <br />
              <span className="bg-gradient-to-r from-[#0058be] to-[#2170e4] bg-clip-text text-transparent">
                Start winning.
              </span>
            </h1>
            <p className="mb-12 text-lg text-[#5f6368] sm:text-xl max-w-2xl mx-auto leading-relaxed">
              The world&apos;s best GTM knowledge, brought to life and ready to work with you.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/request-access">
                <Button
                  size="lg"
                  className="gap-2 rounded-full bg-[#0058be] hover:bg-[#004a9e] text-white font-medium px-8 shadow-none h-12 text-base"
                >
                  Request Access <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full bg-white text-[#191c1e] hover:bg-[#f8f9fb] px-8 border border-[#e2e5ea] h-12 text-base"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Logo Banner */}
        <div className="relative">
          <LogoBanner />
        </div>

        {/* Featured Testimonial: VP Fortune 200 - above the fold */}
        <div className="max-w-2xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="rounded-2xl bg-white p-8 md:p-10 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#e8ecf4]/40">
            {/* Quote mark */}
            <div className="text-4xl text-[#0058be] font-serif leading-none mb-4">&ldquo;</div>
            {/* Stars */}
            <div className="flex gap-1 mb-5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {/* Quote */}
            <p className="text-[15px] text-[#3a3f47] leading-[1.75] mb-6">
              {testimonials[0].quote}
            </p>
            {/* Attribution */}
            <div className="pt-5 border-t border-[#f0f2f5]">
              <div className="text-sm font-bold text-[#191c1e]">
                {testimonials[0].name}
              </div>
              <div className="text-xs text-[#5f6368] mt-0.5">
                {testimonials[0].role}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Demo Video */}
        <div className="max-w-5xl mx-auto px-5 md:px-8 pb-20 md:pb-28 relative">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,88,190,0.10)] ring-1 ring-[#e8ecf4]/60">
              <video autoPlay loop muted playsInline className="w-full h-auto">
                <source src="/homepage/hero-demo.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* What It Does - Stacked vertical layout */}
      <section id="what-it-does" className="py-20 md:py-28 scroll-mt-20" style={{
        background: "linear-gradient(180deg, #f8f9fd 0%, #f0f3fa 50%, #f8f9fd 100%)",
      }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-16 md:mb-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">What It Does</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e]">
              Four ways to work without second-guessing yourself
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-0">
            {/* Frame */}
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 py-10 md:py-14 border-b border-[#e2e5ea]/50 cursor-default">
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 md:w-48">
                <span className="text-5xl md:text-6xl font-extrabold text-[#0058be]/10 leading-none">01</span>
                <div className="flex items-center gap-3">
                  <Image src="/icons/frame.png" alt="Frame" width={44} height={44} className="object-contain" />
                  <h3 className="text-xl font-bold text-[#191c1e]">Frame</h3>
                </div>
              </div>
              <div className="md:pt-4">
                <p className="text-base text-[#3a3f47] leading-relaxed mb-3">
                  Start from a foundation, not a feeling. Every recommendation is grounded in a structured knowledge base spanning positioning methodology, pricing strategy, category design, and GTM playbooks, retrieved in real-time based on your specific question.
                </p>
                <p className="text-xs font-medium text-[#0058be] tracking-wide">POSITIONING · MESSAGING · GTM PLANNING</p>
              </div>
            </div>

            {/* Consult */}
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 py-10 md:py-14 border-b border-[#e2e5ea]/50">
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 md:w-48">
                <span className="text-5xl md:text-6xl font-extrabold text-[#0058be]/10 leading-none">02</span>
                <div className="flex items-center gap-3">
                  <Image src="/icons/consult.png" alt="Consult" width={44} height={44} className="object-contain" />
                  <h3 className="text-xl font-bold text-[#191c1e]">Consult</h3>
                </div>
              </div>
              <div className="md:pt-4">
                <p className="text-base text-[#3a3f47] leading-relaxed mb-3">
                  The senior GTM advisor who picks up every time. Draws from thousands of documented go-to-market decisions across hundreds of companies (Salesforce, Atlassian, Figma, Gong, Twilio, HubSpot, and 500+ more) to find practitioners who&apos;ve faced your exact situation.
                </p>
                <p className="text-xs font-medium text-[#0058be] tracking-wide">STRATEGY · COMPETITIVE · PRICING</p>
              </div>
            </div>

            {/* Validate */}
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 py-10 md:py-14 border-b border-[#e2e5ea]/50">
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 md:w-48">
                <span className="text-5xl md:text-6xl font-extrabold text-[#0058be]/10 leading-none">03</span>
                <div className="flex items-center gap-3">
                  <Image src="/icons/validate.png" alt="Validate" width={44} height={44} className="object-contain" />
                  <h3 className="text-xl font-bold text-[#191c1e]">Validate</h3>
                </div>
              </div>
              <div className="md:pt-4">
                <p className="text-base text-[#3a3f47] leading-relaxed mb-3">
                  Don&apos;t find out your messaging is off after it&apos;s live. Scores your work against professional standards drawn from the same frameworks top GTM leaders use at companies from Series A to Fortune 500.
                </p>
                <p className="text-xs font-medium text-[#0058be] tracking-wide">REVIEW · STRESS-TEST · SHARPEN</p>
              </div>
            </div>

            {/* Grow */}
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 py-10 md:py-14">
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 md:w-48">
                <span className="text-5xl md:text-6xl font-extrabold text-[#0058be]/10 leading-none">04</span>
                <div className="flex items-center gap-3">
                  <Image src="/icons/grow.png" alt="Grow" width={44} height={44} className="object-contain" />
                  <h3 className="text-xl font-bold text-[#191c1e]">Grow</h3>
                </div>
              </div>
              <div className="md:pt-4">
                <p className="text-base text-[#3a3f47] leading-relaxed mb-3">
                  Most GTM leaders don&apos;t have a mentor who&apos;s done the job at the next level. Now you do. Career guidance informed by hundreds of practitioner conversations spanning every GTM career stage, from IC to VP, startup to enterprise.
                </p>
                <p className="text-xs font-medium text-[#0058be] tracking-wide">CAREER · SKILL GAPS · LEADERSHIP</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Dark section with glassmorphic cards */}
      <section className="py-20 md:py-28 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #0a1628 0%, #0f1d35 40%, #162544 100%)",
      }}>
        {/* Subtle gradient orbs for depth */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.07]" style={{
          background: "radial-gradient(circle, #2170e4 0%, transparent 70%)",
        }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{
          background: "radial-gradient(circle, #5a9cf5 0%, transparent 70%)",
        }} />

        <div className="max-w-6xl mx-auto px-5 md:px-8 relative">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5a9cf5] mb-3">What Users Say</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-white">
              The difference is immediate
            </h2>
          </div>

          <div className="max-w-5xl mx-auto space-y-6">
            {[testimonials[2], testimonials[3], testimonials[1]].map((t, i) => (
              <div
                key={i}
                className="rounded-2xl p-8 md:p-10 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                }}
              >
                <blockquote>
                  <div className="text-4xl font-serif text-[#2170e4]/40 leading-none mb-4">&ldquo;</div>
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-5 h-5 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[15px] md:text-base text-[#c8d0e0] leading-[1.8] mb-6">
                    {t.quote}
                  </p>
                  <footer className="pt-4 border-t border-white/[0.06]">
                    <div className="text-sm font-semibold bg-gradient-to-r from-[#5a9cf5] to-[#2170e4] bg-clip-text text-transparent tracking-wide">
                      {t.name}
                    </div>
                    <div className="text-xs text-[#6b7280] mt-1">
                      {t.role}
                    </div>
                  </footer>
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Under the Hood */}
      <section id="under-the-hood" className="py-20 md:py-28 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-16 md:mb-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">Under the Hood</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e] mb-5">
              Agentic RAG, not a prompt wrapper
            </h2>
            <p className="text-base text-[#5f6368] max-w-2xl mx-auto leading-relaxed">
              Most AI marketing tools are a language model with a system prompt. PMMSherpa is a multi-stage retrieval pipeline that plans, searches, assembles, and synthesizes before generating a single word.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-0">
            {/* Query Planning */}
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 py-10 md:py-14 border-b border-[#e2e5ea]/50">
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 md:w-48">
                <span className="text-5xl md:text-6xl font-extrabold text-[#0058be]/10 leading-none">01</span>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}<img src="/icons/query-planning.png" alt="Query Planning" className="h-11 w-auto object-contain" />
                  <h3 className="text-xl font-bold text-[#191c1e]">Query Planning</h3>
                </div>
              </div>
              <div className="md:pt-4">
                <p className="text-base text-[#3a3f47] leading-relaxed">
                  A lightweight model decomposes your question in ~100ms, extracting underlying GTM concepts you didn&apos;t explicitly name. It generates 2-3 parallel retrieval queries targeting different knowledge dimensions. You get answers to questions you didn&apos;t know to ask.
                </p>
              </div>
            </div>

            {/* Agentic RAG */}
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 py-10 md:py-14 border-b border-[#e2e5ea]/50">
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 md:w-48">
                <span className="text-5xl md:text-6xl font-extrabold text-[#0058be]/10 leading-none">02</span>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}<img src="/icons/agentic-rag.png" alt="Agentic RAG" className="h-11 w-auto object-contain" />
                  <h3 className="text-xl font-bold text-[#191c1e]">Agentic RAG</h3>
                </div>
              </div>
              <div className="md:pt-4">
                <p className="text-base text-[#3a3f47] leading-relaxed">
                  Hybrid retrieval fuses 70% semantic similarity with 30% keyword precision across 38,000+ curated fragments. Domain-specific query expansion translates go-to-market shorthand automatically (GTM, ICP, JTBD, PLG). You talk like a GTM leader. Sherpa searches like one.
                </p>
              </div>
            </div>

            {/* Knowledge Layers */}
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 py-10 md:py-14 border-b border-[#e2e5ea]/50">
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 md:w-48">
                <span className="text-5xl md:text-6xl font-extrabold text-[#0058be]/10 leading-none">03</span>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}<img src="/icons/knowledge-layers.png" alt="Knowledge Layers" className="h-11 w-auto object-contain" />
                  <h3 className="text-xl font-bold text-[#191c1e]">Knowledge Layers</h3>
                </div>
              </div>
              <div className="md:pt-4">
                <p className="text-base text-[#3a3f47] leading-relaxed">
                  Nine structured layers: methodology, practitioner war stories, tactical playbooks, expert conversations, and more. Retrieved fragments are grouped by type before synthesis, so the model knows whether it&apos;s reading proven theory or a real-world outcome from a named company.
                </p>
              </div>
            </div>

            {/* Web Augmentation */}
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 py-10 md:py-14">
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 md:w-48">
                <span className="text-5xl md:text-6xl font-extrabold text-[#0058be]/10 leading-none">04</span>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}<img src="/icons/web-augmentation.png" alt="Web Augmentation" className="h-11 w-auto object-contain" />
                  <h3 className="text-xl font-bold text-[#191c1e]">Web Augmentation</h3>
                </div>
              </div>
              <div className="md:pt-4">
                <p className="text-base text-[#3a3f47] leading-relaxed">
                  The query planner decides per-question whether to fetch live data. Competitor pricing gets a web search. Positioning frameworks stay in the curated knowledge base. The system picks the right source for each part of your question, automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="max-w-4xl mx-auto mt-20 pt-14 border-t border-[#e8ecf4]/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-[#0058be]">38,000+</p>
              <p className="text-xs text-[#5f6368] mt-1">Curated knowledge fragments</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-[#0058be]">9</p>
              <p className="text-xs text-[#5f6368] mt-1">Knowledge layers</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-[#0058be]">500+</p>
              <p className="text-xs text-[#5f6368] mt-1">Companies represented</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-[#0058be]">2,800+</p>
              <p className="text-xs text-[#5f6368] mt-1">Source documents indexed</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 scroll-mt-20" style={{
        background: "linear-gradient(180deg, #0a1628 0%, #0f1d35 50%, #0a1628 100%)",
      }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5a9cf5] mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] mb-4 text-white">
              Ask. Get depth. Ship.
            </h2>
          </div>

          {/* Step 1 */}
          <div className="max-w-5xl mx-auto mb-24 md:mb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-[#5a9cf5] mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#0058be]/20 flex items-center justify-center text-xs font-bold text-[#5a9cf5]">1</span>
                  Intelligent retrieval
                </div>
                <h3 className="text-2xl font-semibold tracking-tight mb-4 text-white">
                  Ask messy questions. Get structured answers.
                </h3>
                <p className="text-[#8e9199] leading-relaxed">
                  Your question is read in full, with everything you&apos;ve shared in the conversation. The right frameworks and practitioner experience surface automatically. No prompt engineering required.
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
          <div className="max-w-5xl mx-auto mb-24 md:mb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
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
                <p className="text-[#8e9199] leading-relaxed">
                  Every response draws from the practitioner experience and playbooks that shaped the best GTM leaders in tech. PMMSherpa commits to a recommendation. You decide what to do with it.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="max-w-5xl mx-auto mb-24 md:mb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-[#5a9cf5] mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#0058be]/20 flex items-center justify-center text-xs font-bold text-[#5a9cf5]">3</span>
                  Ready to ship
                </div>
                <h3 className="text-2xl font-semibold tracking-tight mb-4 text-white">
                  Hand it to your VP. It&apos;s ready.
                </h3>
                <p className="text-[#8e9199] leading-relaxed">
                  Positioning statements. Battlecards. Messaging frameworks. Launch plans. Share your context and get something you can actually present to leadership or hand to sales. Not a template with blanks to fill.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
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
                <p className="text-[#8e9199] leading-relaxed">
                  Drop a homepage, a pricing page, an announcement. PMMSherpa reads it, identifies the positioning moves, and tells you what it means for your strategy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section id="who-its-for" className="py-20 md:py-28 scroll-mt-20" style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8f9fd 50%, #ffffff 100%)",
      }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">Who It&apos;s For</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e]">
              For the people who own go-to-market and can&apos;t afford to get it wrong
            </h2>
          </div>

          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white p-7 md:p-8 border border-[#e8ecf4]/60 hover:shadow-[0_8px_30px_rgba(0,88,190,0.06)] transition-all">
              <div className="w-16 h-16 mb-5">
                <Image src="/icons/product-marketer.png" alt="Product Marketers" width={64} height={64} className="object-contain" />
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] mb-3">Product Marketers</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                You&apos;re the only one in the room who knows what you know. PMMSherpa is the thinking partner who&apos;s already up to speed, has seen your problem before, and tells you what it actually thinks.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 md:p-8 border border-[#e8ecf4]/60 hover:shadow-[0_8px_30px_rgba(0,88,190,0.06)] transition-all">
              <div className="w-16 h-16 mb-5">
                <Image src="/icons/product-manager.png" alt="Product Managers" width={64} height={64} className="object-contain" />
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] mb-3">Product Managers</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                You know the product cold. Translating that into messaging that makes buyers feel something? That&apos;s a different skill. PMMSherpa bridges the gap.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 md:p-8 border border-[#e8ecf4]/60 hover:shadow-[0_8px_30px_rgba(0,88,190,0.06)] transition-all">
              <div className="w-16 h-16 mb-5">
                <Image src="/icons/technical-founder.png" alt="Founders" width={64} height={64} className="object-contain" />
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] mb-3">Founders</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                Your first GTM hire is $180K and three months to ramp. PMMSherpa gives you strategic depth from day one, without the headcount.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28" style={{
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
              <p className="mb-4 text-lg text-blue-200 max-w-xl mx-auto">
                PMMSherpa is what you check your thinking against before it matters.
              </p>
              <p className="mb-8 text-sm text-blue-300/80 max-w-lg mx-auto">
                38,000+ knowledge fragments. 9 knowledge layers. 500+ companies. One conversation away.
              </p>
              <Link href="/request-access">
                <Button
                  size="lg"
                  className="gap-2 rounded-full bg-white text-[#0058be] hover:bg-blue-50 font-semibold px-8 shadow-none h-12 text-base"
                >
                  Request Access <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
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
            <div className="flex items-center gap-8 text-sm text-[#5f6368]">
              <a href="#what-it-does" className="hover:text-[#191c1e] transition-colors">What It Does</a>
              <a href="#under-the-hood" className="hover:text-[#191c1e] transition-colors">Under the Hood</a>
              <a href="#how-it-works" className="hover:text-[#191c1e] transition-colors">How It Works</a>
              <a href="#who-its-for" className="hover:text-[#191c1e] transition-colors">Who It&apos;s For</a>
              <Link href="/login" className="hover:text-[#191c1e] transition-colors">Log in</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
