import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedOrb } from "@/components/ui/animated-orb";
import { LogoBanner } from "@/components/ui/logo-banner";
import { ArrowRight, Crosshair, MessageSquare, ShieldCheck, TrendingUp, Target, Box, Rocket } from "lucide-react";

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
    quote: "PMMSherpa is a great example of an effective vertical AI solution. It\u2019s purpose built. The output isn\u2019t just fast; it\u2019s grounded in real-world frameworks and actual PMM experience. It\u2019s levels above what I get from a general-purpose model like Claude.",
    name: "VP of Product Marketing",
    role: "Fortune 200 ERP Provider",
    photo: "",
  },
  {
    quote: "PMMSherpa gave me access to expert product marketing feedback loops and suggestions for my scenario rapidly and focus on what it seems like a seasoned professional would say. Easy to use and just works. Definitely seems more focused and professional than just using a flagship model alone.",
    name: "Daniel Wolff",
    role: "Senior Engineering Consultant, ex-Meta, authID",
    photo: "/homepage/dan_wolff_profile.jpeg",
  },
  {
    quote: "Most AI tools make you do the thinking and then dress it up. Sherpa does the opposite. It comes in educated, applies the right frameworks to your actual problem, and pushes back when your reasoning isn\u2019t there yet. Where other tools generate, Sherpa evaluates. It catches things most tools don\u2019t: where your argument has gaps, where friction will show up with buyers, where you\u2019re circling the problem without landing on a real position. Anyone who touches GTM will feel the difference immediately. And honestly, the name says it all.",
    name: "Asli Simsek",
    role: "Product Marketing Manager, CMO Alliance Member",
    photo: "/homepage/asli-simsek.png",
  },
  {
    quote: "PMMSherpa actually feels like a new individual thinking about your project with you. It\u2019s really a team partner working alongside you. No lecturing, no pandering, no generic frameworks dressed up with language as insight. Just a thinking partner that meets you at your level and pushes you forward.",
    name: "Shreyas Sriram",
    role: "Founder, Practice Intuition / AI Researcher",
    photo: "/homepage/shreyas-sriram.jpeg",
  },
  {
    quote: "I\u2019ve spent over a decade in product marketing, refining frameworks for everything from positioning to go-to-market strategy, and PMMSherpa feels like working with an experienced partner. The frameworks are built in, and the outputs are far more useful than a general-purpose LLM. It helps me move faster while maintaining quality, and its strong point of view challenges my thinking in ways other tools don\u2019t.",
    name: "Brian Remmel",
    role: "Principal Product Marketing Manager, Palo Alto Networks",
    photo: "/homepage/brain_remmel_bio.jpeg",
  },
  {
    quote: "I\u2019ve tried most AI tools that claim to \u201Chelp with branding,\u201D and almost all of them feel like they\u2019re guessing with confidence. PMMSherpa is different. What stood out immediately was the precision of its thinking. The insights weren\u2019t generic or dressed-up clich\u00E9s. They felt sharp, considered and actually usable. The kind of output you\u2019d expect from someone who understands brand strategy, not just language patterns. There\u2019s an understanding of nuance here. Of tone, positioning and what makes something distinctive versus just different. If you work in branding, this is one of the few AI tools that doesn\u2019t feel like it\u2019s wasting your time.",
    name: "Head of Creative Strategy",
    role: "ex-Edelman",
    photo: "",
  },
];

const whatItDoes = [
  {
    icon: Crosshair,
    title: "Frame",
    description: "Every recommendation is grounded in positioning methodology, pricing strategy, category design, and GTM playbooks. Foundation, not feeling.",
    tags: "POSITIONING · MESSAGING · GTM PLANNING",
  },
  {
    icon: MessageSquare,
    title: "Consult",
    description: "The senior GTM advisor who picks up every time. Draws from the thought leadership of leading GTM professionals at today\u2019s top organizations.",
    tags: "STRATEGY · COMPETITIVE · PRICING",
  },
  {
    icon: ShieldCheck,
    title: "Validate",
    description: "Don\u2019t find out your messaging is off after it\u2019s live. Scores your work against the same frameworks top GTM leaders use.",
    tags: "REVIEW · STRESS-TEST · SHARPEN",
  },
  {
    icon: TrendingUp,
    title: "Grow",
    description: "Most GTM leaders don\u2019t have a mentor who\u2019s done the job at the next level. Now you do. Career guidance and job search strategy from IC to VP, startup to enterprise.",
    tags: "CAREER · JOB SEARCH · LEADERSHIP",
  },
];

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
            <a href="#what-it-does" className="hover:text-[#191c1e] transition-colors">What It Does</a>
            <a href="#how-it-works" className="hover:text-[#191c1e] transition-colors">How It Works</a>
            <a href="#who-its-for" className="hover:text-[#191c1e] transition-colors">Who It&apos;s For</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="rounded-full text-[#5f6368] hover:text-[#191c1e] hover:bg-[#f2f4f7]">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/homepage/hero-background.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain object-top opacity-[0.30]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
        </div>

        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-20 md:pt-28 pb-8 md:pb-10 text-center relative">
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-center mb-8">
              <AnimatedOrb size="md" />
            </div>

            <h1 className="mb-6 text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e] sm:text-5xl md:text-[3.5rem] leading-[1.1]">
              Stop guessing,
              <br />
              <span className="bg-gradient-to-r from-[#0058be] to-[#2170e4] bg-clip-text text-transparent">
                Start converting.
              </span>
            </h1>
            <p className="mb-10 text-lg text-[#4a4f57] sm:text-xl max-w-2xl mx-auto leading-relaxed">
              The AI assistant for world-class GTM.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
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

        {/* Logo Banner */}
        <div className="relative">
          <LogoBanner />
        </div>

        {/* Featured Testimonial: Brian Remmel - vertical compact shadow card */}
        <div className="max-w-2xl mx-auto px-5 md:px-8 py-4 md:py-6">
          <div className="rounded-2xl bg-white p-5 md:p-7 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#e8ecf4]/40">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-2xl text-[#0058be] font-serif leading-none">&ldquo;</div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-[15px] text-[#3a3f47] leading-[1.7] mb-4">
              {testimonials[4].quote}
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-[#f0f2f5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={testimonials[4].photo} alt={testimonials[4].name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              <div>
                <div className="text-sm font-bold bg-gradient-to-r from-[#0058be] to-[#2170e4] bg-clip-text text-transparent">
                  {testimonials[4].name}
                </div>
                <div className="text-xs text-[#5f6368] mt-0.5">
                  {testimonials[4].role}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Demo Video */}
        <div className="max-w-5xl mx-auto px-5 md:px-8 pb-10 md:pb-14 relative">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,88,190,0.10)] ring-1 ring-[#e8ecf4]/60">
              <video autoPlay loop muted playsInline className="w-full h-auto">
                <source src="/homepage/hero-demo.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* What It Does - Cyclops-style: icon + title inline, description below */}
      <section id="what-it-does" className="py-14 md:py-20 scroll-mt-20" style={{
        background: "linear-gradient(180deg, #f8f9fd 0%, #f0f3fa 50%, #f8f9fd 100%)",
      }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">What It Does</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e]">
              Four ways to work without second-guessing yourself
            </h2>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
            {whatItDoes.map((item, i) => (
              <div key={i} className={`py-7 ${i < 2 ? 'border-b border-[#e2e5ea]/50' : ''} ${i === 2 ? 'md:border-b md:border-[#e2e5ea]/50' : ''}`}>
                <div className="flex items-center gap-3 mb-3">
                  <item.icon className="h-5 w-5 text-[#0058be] flex-shrink-0" strokeWidth={2} />
                  <h3 className="text-lg font-bold text-[#191c1e]">{item.title}</h3>
                </div>
                <p className="text-sm text-[#3a3f47] leading-relaxed mb-2">
                  {item.description}
                </p>
                <p className="text-xs font-medium text-[#0058be] tracking-wide">{item.tags}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Dark section with glassmorphic cards */}
      <section className="py-12 md:py-16 relative overflow-hidden" style={{
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
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5a9cf5] mb-3">What Users Say</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-white">
              The difference is immediate
            </h2>
          </div>

          <div className="max-w-5xl mx-auto space-y-4">
            {[testimonials[2], testimonials[3], testimonials[1], testimonials[0], testimonials[5]].map((t, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 md:p-6 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                }}
              >
                <blockquote>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-2xl font-serif text-[#2170e4]/40 leading-none">&ldquo;</div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <svg key={j} className="w-4 h-4 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-[15px] md:text-base text-[#c8d0e0] leading-[1.75] mb-4">
                    {t.quote}
                  </p>
                  <footer className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
                    {t.photo && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-semibold bg-gradient-to-r from-[#5a9cf5] to-[#2170e4] bg-clip-text text-transparent tracking-wide">
                        {t.name}
                      </div>
                      <div className="text-xs text-[#6b7280] mt-0.5">
                        {t.role}
                      </div>
                    </div>
                  </footer>
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works (merged with Under the Hood) */}
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
              Most AI marketing tools are a language model with a system prompt. PMMSherpa plans, searches, assembles, and synthesizes before generating a single word.
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
                  Your full question and conversation context surface the right frameworks and practitioner experience automatically. No prompt engineering required.
                </p>
                <p className="text-sm text-[#5a6577] leading-relaxed border-l-2 border-[#0058be]/30 pl-4">
                  Your question is decomposed in ~100ms into parallel retrieval queries across different knowledge dimensions, extracting GTM concepts you didn&apos;t explicitly name.
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
                  Draws from the playbooks that shaped the best GTM leaders in tech. PMMSherpa commits to a recommendation. You decide what to do with it.
                </p>
                <p className="text-sm text-[#5a6577] leading-relaxed border-l-2 border-[#0058be]/30 pl-4">
                  Hybrid retrieval fuses 70% semantic similarity with 30% keyword precision across 38,000+ curated fragments in nine structured layers. Proven theory and real-world outcomes stay distinct.
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
                  Positioning statements. Battlecards. Messaging frameworks. Launch plans. Share your context, get something you can present to leadership or hand to sales.
                </p>
                <p className="text-sm text-[#5a6577] leading-relaxed border-l-2 border-[#0058be]/30 pl-4">
                  Auto-translates GTM shorthand (ICP, JTBD, PLG) and assembles structured context from the right knowledge layers before generating a single word.
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
                  Drop a homepage, a pricing page, an announcement. PMMSherpa identifies the positioning moves and tells you what it means for your strategy.
                </p>
                <p className="text-sm text-[#5a6577] leading-relaxed border-l-2 border-[#0058be]/30 pl-4">
                  Per-question routing decides whether to search the curated knowledge base or fetch live data. Competitor intel gets a web search. Positioning frameworks stay in the corpus.
                </p>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="max-w-4xl mx-auto mt-14 pt-10 border-t border-white/[0.08] grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-[#5a9cf5]">38,000+</p>
              <p className="text-xs text-[#6b7280] mt-1">Curated knowledge fragments</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-[#5a9cf5]">9</p>
              <p className="text-xs text-[#6b7280] mt-1">Knowledge layers</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-[#5a9cf5]">500+</p>
              <p className="text-xs text-[#6b7280] mt-1">Companies represented</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-[#5a9cf5]">2,800+</p>
              <p className="text-xs text-[#6b7280] mt-1">Source documents indexed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For - Lucide SVG icons */}
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
              <p className="mb-4 text-lg text-blue-200 max-w-xl mx-auto">
                PMMSherpa is what you check your thinking against before it matters.
              </p>
              <p className="mb-8 text-sm text-blue-300/80 max-w-lg mx-auto">
                38,000+ knowledge fragments. 9 knowledge layers. 500+ companies. One conversation away.
              </p>
              <Link href="/login">
                <Button
                  size="lg"
                  className="gap-2 rounded-full bg-white text-[#0058be] hover:bg-blue-50 font-semibold px-8 shadow-none h-12 text-base"
                >
                  Get Started Free <ArrowRight className="h-4 w-4" />
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
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#5f6368]">
              <a href="#what-it-does" className="hover:text-[#191c1e] transition-colors">What It Does</a>
              <a href="#how-it-works" className="hover:text-[#191c1e] transition-colors">How It Works</a>
              <a href="#who-its-for" className="hover:text-[#191c1e] transition-colors">Who It&apos;s For</a>
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
