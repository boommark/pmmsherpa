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

function CustomIcon({ src, alt, size = 40 }: { src: string; alt: string; size?: number }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="object-contain"
    />
  );
}

const testimonials = [
  {
    quote: "PMM Sherpa is a great example of an effective vertical AI solution. It\u2019s purpose built. The output isn\u2019t just fast; it\u2019s grounded in real-world frameworks and actual PMM experience. It\u2019s levels above what I get from a general-purpose model like Claude.",
    name: "VP of Product Marketing",
    company: "Fortune 200 ERP Provider",
  },
  {
    quote: "PMM Sherpa gave me access to expert product marketing feedback loops and suggestions for my scenario rapidly and focus on what it seems like a season of professional would say. Easy to use and just works. Definitely seems more focused and professional than just using a flagship model alone.",
    name: "Founder & ex-Meta Senior Engineer",
    company: "",
  },
  {
    quote: "Most AI tools make you do the thinking and then dress it up. Sherpa does the opposite. It comes in educated, applies the right frameworks to your actual problem, and pushes back when your reasoning isn\u2019t there yet. Where other tools generate, Sherpa evaluates. It catches things most tools don\u2019t: where your argument has gaps, where friction will show up with buyers, where you\u2019re circling the problem without landing on a real position. Anyone who touches GTM will feel the difference immediately. And honestly, the name says it all.",
    name: "PMM Leader",
    company: "CMO Alliance Member",
  },
  {
    quote: "PMM Sherpa actually feels like a new individual thinking about your project with you. It\u2019s really a team partner working alongside you. No lecturing, no pandering, no generic frameworks dressed up with language as insight. Just a thinking partner that meets you at your level and pushes you forward.",
    name: "Serial Founder & AI Researcher",
    company: "",
  },
];

function TestimonialCard({ index }: { index: number }) {
  const t = testimonials[index];

  return (
    <div className="relative rounded-2xl bg-white p-8 md:p-10 border border-[#e8ecf4]/60 shadow-[0_4px_24px_rgba(0,88,190,0.06)] hover:shadow-[0_8px_40px_rgba(0,88,190,0.10)] transition-all duration-300">
      {/* Accent bar */}
      <div className="absolute left-0 top-8 bottom-8 w-[3px] rounded-full bg-gradient-to-b from-[#0058be] to-[#2170e4]" />
      <blockquote>
        <p className="text-[15px] text-[#3a3f47] leading-[1.75] mb-6">
          &ldquo;{t.quote}&rdquo;
        </p>
        <footer className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-[#e8ecf4]" />
          <div>
            <div className="text-sm font-semibold text-[#191c1e] tracking-wide">
              {t.name}
            </div>
            {t.company && (
              <div className="text-xs text-[#5f6368] mt-0.5">
                {t.company}
              </div>
            )}
          </div>
        </footer>
      </blockquote>
    </div>
  );
}

function FeaturedTestimonial({ index }: { index: number }) {
  const t = testimonials[index];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative rounded-2xl bg-[#f8f9fd] p-10 md:p-12">
        <div className="absolute left-0 top-10 bottom-10 w-[3px] rounded-full bg-gradient-to-b from-[#0058be] to-[#2170e4]" />
        <blockquote>
          <p className="text-lg md:text-xl text-[#3a3f47] leading-[1.7] mb-6 pl-2">
            &ldquo;{t.quote}&rdquo;
          </p>
          <footer className="pl-2">
            <div className="text-sm font-semibold text-[#191c1e] tracking-wide">
              {t.name}
            </div>
            {t.company && (
              <div className="text-xs text-[#5f6368] mt-0.5">
                {t.company}
              </div>
            )}
          </footer>
        </blockquote>
      </div>
    </div>
  );
}

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
                Start knowing.
              </span>
            </h1>
            <p className="mb-12 text-lg text-[#5f6368] sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Agentic RAG powered by the world&apos;s deepest GTM knowledge base. Not a chatbot with marketing tips. A retrieval system that thinks like a senior PMM.
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

        {/* Featured Testimonial: VP Fortune 200 */}
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <FeaturedTestimonial index={0} />
        </div>

        {/* Hero Demo Video */}
        <div className="max-w-5xl mx-auto px-5 md:px-8 pb-20 md:pb-28 relative">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,88,190,0.10)] ring-1 ring-[#e8ecf4]/60">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto"
              >
                <source src="/homepage/hero-demo.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* What It Does */}
      <section id="what-it-does" className="py-20 md:py-28 scroll-mt-20" style={{
        background: "linear-gradient(180deg, #f8f9fd 0%, #f0f3fa 50%, #f8f9fd 100%)",
      }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">What It Does</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e] mb-4">
              Four ways to work without second-guessing yourself
            </h2>
          </div>

          <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-7 md:p-8 transition-all hover:bg-white hover:shadow-[0_8px_30px_rgba(0,88,190,0.08)] hover:-translate-y-1 border border-[#e8ecf4]/60">
              <div className="flex items-center gap-3 mb-4">
                <CustomIcon src="/icons/frame.png" alt="Frame" size={48} />
                <h3 className="text-lg font-semibold text-[#191c1e]">Frame</h3>
              </div>
              <p className="text-sm text-[#5f6368] leading-relaxed mb-3">
                Start from a foundation, not a feeling. Every recommendation is grounded in a structured knowledge base spanning positioning methodology, pricing strategy, category design, and GTM playbooks, retrieved in real-time based on your specific question.
              </p>
              <p className="text-xs text-[#a0a4ab]">Positioning · Messaging · GTM Planning</p>
            </div>

            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-7 md:p-8 transition-all hover:bg-white hover:shadow-[0_8px_30px_rgba(0,88,190,0.08)] hover:-translate-y-1 border border-[#e8ecf4]/60">
              <div className="flex items-center gap-3 mb-4">
                <CustomIcon src="/icons/consult.png" alt="Consult" size={48} />
                <h3 className="text-lg font-semibold text-[#191c1e]">Consult</h3>
              </div>
              <p className="text-sm text-[#5f6368] leading-relaxed mb-3">
                The senior PMM who picks up every time. Draws from thousands of documented GTM decisions across hundreds of companies (Salesforce, Atlassian, Figma, Gong, Twilio, HubSpot, and 500+ more) to find practitioners who&apos;ve faced your exact situation.
              </p>
              <p className="text-xs text-[#a0a4ab]">Strategy · Competitive · Pricing</p>
            </div>

            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-7 md:p-8 transition-all hover:bg-white hover:shadow-[0_8px_30px_rgba(0,88,190,0.08)] hover:-translate-y-1 border border-[#e8ecf4]/60">
              <div className="flex items-center gap-3 mb-4">
                <CustomIcon src="/icons/validate.png" alt="Validate" size={48} />
                <h3 className="text-lg font-semibold text-[#191c1e]">Validate</h3>
              </div>
              <p className="text-sm text-[#5f6368] leading-relaxed mb-3">
                Don&apos;t find out your messaging is off after it&apos;s live. Scores your work against professional standards drawn from the same frameworks top PMM leaders use at companies from Series A to Fortune 500.
              </p>
              <p className="text-xs text-[#a0a4ab]">Review · Stress-test · Sharpen</p>
            </div>

            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-7 md:p-8 transition-all hover:bg-white hover:shadow-[0_8px_30px_rgba(0,88,190,0.08)] hover:-translate-y-1 border border-[#e8ecf4]/60">
              <div className="flex items-center gap-3 mb-4">
                <CustomIcon src="/icons/grow.png" alt="Grow" size={48} />
                <h3 className="text-lg font-semibold text-[#191c1e]">Grow</h3>
              </div>
              <p className="text-sm text-[#5f6368] leading-relaxed mb-3">
                Most PMMs don&apos;t have a mentor who&apos;s done the job at the next level. Now you do. Career guidance informed by hundreds of practitioner conversations spanning every PMM career stage, from IC to VP, startup to enterprise.
              </p>
              <p className="text-xs text-[#a0a4ab]">Career · Skill Gaps · Leadership</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">What Users Say</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e]">
              The difference is immediate
            </h2>
          </div>

          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <TestimonialCard index={2} />
            <TestimonialCard index={1} />
            <div className="md:col-span-2">
              <TestimonialCard index={3} />
            </div>
          </div>
        </div>
      </section>

      {/* Under the Hood */}
      <section className="py-20 md:py-28" style={{
        background: "linear-gradient(180deg, #f8f9fd 0%, #f0f3fa 50%, #f8f9fd 100%)",
      }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">Under the Hood</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e] mb-5">
              Agentic RAG, not a prompt wrapper
            </h2>
            <p className="text-base text-[#5f6368] max-w-2xl mx-auto leading-relaxed">
              Most AI marketing tools are a language model with a system prompt. PMMSherpa is a multi-stage retrieval pipeline that plans, searches, assembles, and synthesizes before generating a single word.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Query Planning */}
            <div className="rounded-2xl bg-white p-8 md:p-10 border border-[#e8ecf4]/60 shadow-[0_4px_24px_rgba(0,88,190,0.04)]">
              <div className="w-20 h-20 mb-6">
                <CustomIcon src="/icons/query-planning.png" alt="Query Planning" size={80} />
              </div>
              <h3 className="text-base font-bold text-[#191c1e] uppercase tracking-wide mb-3">Query Planning</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                A lightweight model decomposes your question in ~100ms, extracting underlying PMM concepts you didn&apos;t explicitly name. It generates 2-3 parallel retrieval queries targeting different knowledge dimensions. You get answers to questions you didn&apos;t know to ask.
              </p>
            </div>

            {/* Agentic RAG */}
            <div className="rounded-2xl bg-white p-8 md:p-10 border border-[#e8ecf4]/60 shadow-[0_4px_24px_rgba(0,88,190,0.04)]">
              <div className="w-20 h-20 mb-6">
                <CustomIcon src="/icons/agentic-rag.png" alt="Agentic RAG" size={80} />
              </div>
              <h3 className="text-base font-bold text-[#191c1e] uppercase tracking-wide mb-3">Agentic RAG</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                Hybrid retrieval fuses 70% semantic similarity with 30% keyword precision across 38,000+ curated fragments. Domain-specific query expansion translates PMM shorthand automatically (GTM, ICP, JTBD, PLG). You talk like a PMM. Sherpa searches like one.
              </p>
            </div>

            {/* Knowledge Layers */}
            <div className="rounded-2xl bg-white p-8 md:p-10 border border-[#e8ecf4]/60 shadow-[0_4px_24px_rgba(0,88,190,0.04)]">
              <div className="w-20 h-20 mb-6">
                <CustomIcon src="/icons/knowledge-layers.png" alt="Knowledge Layers" size={80} />
              </div>
              <h3 className="text-base font-bold text-[#191c1e] uppercase tracking-wide mb-3">Knowledge Layers</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                Nine structured layers: methodology, practitioner war stories, tactical playbooks, expert conversations, and more. Retrieved fragments are grouped by type before synthesis, so the model knows whether it&apos;s reading proven theory or a real-world outcome from a named company.
              </p>
            </div>

            {/* Web Augmentation */}
            <div className="rounded-2xl bg-white p-8 md:p-10 border border-[#e8ecf4]/60 shadow-[0_4px_24px_rgba(0,88,190,0.04)]">
              <div className="w-20 h-20 mb-6">
                <CustomIcon src="/icons/web-augmentation.png" alt="Web Augmentation" size={80} />
              </div>
              <h3 className="text-base font-bold text-[#191c1e] uppercase tracking-wide mb-3">Web Augmentation</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                The query planner decides per-question whether to fetch live data. Competitor pricing gets a web search. Positioning frameworks stay in the curated knowledge base. The system picks the right source for each part of your question, automatically.
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="max-w-4xl mx-auto mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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
                  Every response draws from the practitioner experience and playbooks that shaped the best product marketers in tech. PMMSherpa commits to a recommendation. You decide what to do with it.
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
                <CustomIcon src="/icons/product-marketer.png" alt="Product Marketers" size={64} />
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] mb-3">Product Marketers</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                You&apos;re the only one in the room who knows what you know. PMMSherpa is the thinking partner who&apos;s already up to speed, has seen your problem before, and tells you what it actually thinks.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 md:p-8 border border-[#e8ecf4]/60 hover:shadow-[0_8px_30px_rgba(0,88,190,0.06)] transition-all">
              <div className="w-16 h-16 mb-5">
                <CustomIcon src="/icons/product-manager.png" alt="Product Managers" size={64} />
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] mb-3">Product Managers</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                You know the product cold. Translating that into messaging that makes buyers feel something? That&apos;s a different skill. PMMSherpa bridges the gap.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 md:p-8 border border-[#e8ecf4]/60 hover:shadow-[0_8px_30px_rgba(0,88,190,0.06)] transition-all">
              <div className="w-16 h-16 mb-5">
                <CustomIcon src="/icons/technical-founder.png" alt="Founders" size={64} />
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] mb-3">Founders</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                Your first PMM hire is $180K and three months to ramp. PMMSherpa gives you strategic depth from day one, without the headcount.
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
