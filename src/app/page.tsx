import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AnimatedOrb } from "@/components/ui/animated-orb";
import {
  Target,
  MessageCircle,
  CheckCircle,
  TrendingUp,
  BookOpen,
  Brain,
  Globe,
  ArrowRight,
  FileText,
  Users,
  Rocket,
} from "lucide-react";

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

export default function LandingPage() {
  return (
    <div className="landing-light min-h-screen bg-[#f7f9fc] relative overflow-hidden" style={{ colorScheme: 'light' }}>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-[#f7f9fc]/90 backdrop-blur-xl">
        <nav className="max-w-6xl mx-auto flex h-16 items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0058be] to-[#2170e4] flex items-center justify-center">
              <MountainIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0058be]">
              PMMSherpa
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5f6368]">
            <a href="#use-cases" className="hover:text-[#191c1e] transition-colors">Use Cases</a>
            <a href="#how-it-works" className="hover:text-[#191c1e] transition-colors">How It Works</a>
            <a href="#who-its-for" className="hover:text-[#191c1e] transition-colors">Who It&apos;s For</a>
            <a href="#why-different" className="hover:text-[#191c1e] transition-colors">Why PMMSherpa</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="rounded-lg text-[#5f6368] hover:text-[#191c1e] hover:bg-[#eceef1]">
                Log in
              </Button>
            </Link>
            <Link href="/request-access">
              <Button className="rounded-lg bg-[#0058be] hover:bg-[#004a9e] text-white shadow-none font-medium">
                Request Access
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-20 md:pt-32 pb-10 md:pb-16 text-center relative">
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-center mb-8">
              <AnimatedOrb size="md" />
            </div>

            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-[#191c1e] sm:text-5xl md:text-6xl" style={{ letterSpacing: '-0.02em' }}>
              Your Second Brain for{" "}
              <span className="text-[#0058be]">
                Product Marketing
              </span>
            </h1>
            <p className="mb-12 text-lg text-[#5f6368] sm:text-xl max-w-xl mx-auto leading-relaxed">
              Deep domain expertise meets live market intelligence.
              Think clearly. Ship faster.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/request-access">
                <Button
                  size="lg"
                  className="gap-2 rounded-lg bg-[#0058be] hover:bg-[#004a9e] text-white font-medium px-8 shadow-none"
                >
                  Request Access <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-lg bg-white text-[#191c1e] hover:bg-[#f2f4f7] px-8 border-none shadow-[0_0_0_1px_rgba(196,199,204,0.15)]"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Screenshot */}
        <div className="max-w-5xl mx-auto px-5 md:px-8 pb-20 md:pb-32 relative">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(25,28,30,0.06)] ring-1 ring-[rgba(196,199,204,0.15)]">
              <Image
                src="/homepage/welcome-screen.png"
                alt="PMMSherpa — intelligent product marketing assistant"
                width={1440}
                height={900}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section id="use-cases" className="py-20 md:py-28 bg-[#f2f4f7] scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">Use Cases</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#191c1e] mb-4" style={{ letterSpacing: '-0.02em' }}>
              Four ways to work smarter
            </h2>
          </div>

          <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            <div className="rounded-2xl bg-white p-7 md:p-8 transition-all hover:shadow-[0_10px_40px_rgba(25,28,30,0.06)] hover:-translate-y-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#d8e2ff] flex items-center justify-center">
                  <Target className="h-5 w-5 text-[#0058be]" />
                </div>
                <h3 className="text-lg font-semibold text-[#191c1e]">Frame</h3>
              </div>
              <p className="text-sm text-[#5f6368] leading-relaxed mb-2">
                Build positioning, messaging, and GTM plans on solid ground.
                Proven frameworks from Dunford, Moore, and hundreds of practitioner playbooks.
              </p>
              <p className="text-xs text-[#8e9199]">Positioning, messaging, GTM planning</p>
            </div>

            <div className="rounded-2xl bg-white p-7 md:p-8 transition-all hover:shadow-[0_10px_40px_rgba(25,28,30,0.06)] hover:-translate-y-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#d8e2ff] flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-[#0058be]" />
                </div>
                <h3 className="text-lg font-semibold text-[#191c1e]">Consult</h3>
              </div>
              <p className="text-sm text-[#5f6368] leading-relaxed mb-2">
                Get a second opinion that&apos;s actually informed.
                Direct recommendations grounded in how the best PMMs have handled it.
              </p>
              <p className="text-xs text-[#8e9199]">Strategy, competitive, pricing questions</p>
            </div>

            <div className="rounded-2xl bg-white p-7 md:p-8 transition-all hover:shadow-[0_10px_40px_rgba(25,28,30,0.06)] hover:-translate-y-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#d8e2ff] flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-[#0058be]" />
                </div>
                <h3 className="text-lg font-semibold text-[#191c1e]">Validate</h3>
              </div>
              <p className="text-sm text-[#5f6368] leading-relaxed mb-2">
                Stress-test before you ship. Paste your messaging or launch plan
                and get a senior PMM red-team review, on demand.
              </p>
              <p className="text-xs text-[#8e9199]">Review work against expert standards</p>
            </div>

            <div className="rounded-2xl bg-white p-7 md:p-8 transition-all hover:shadow-[0_10px_40px_rgba(25,28,30,0.06)] hover:-translate-y-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#d8e2ff] flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-[#0058be]" />
                </div>
                <h3 className="text-lg font-semibold text-[#191c1e]">Grow</h3>
              </div>
              <p className="text-sm text-[#5f6368] leading-relaxed mb-2">
                Level up without waiting for a mentor.
                Career advice from 540+ PMM leaders at companies from Series A to Fortune 500.
              </p>
              <p className="text-xs text-[#8e9199]">Career guidance, skill gaps, leadership</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-[#111418] text-white scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5a9cf5] mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white" style={{ letterSpacing: '-0.02em' }}>
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
                  Not keyword matching
                </h3>
                <p className="text-[#8e9199] leading-relaxed">
                  Your question is analyzed with full conversation context. Targeted queries pull
                  the right frameworks and practitioner experience. Current market data is added
                  automatically when needed.
                </p>
              </div>
              <div className="rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <Image
                  src="/homepage/intelligent-retrieval.png"
                  alt="Intelligent retrieval"
                  width={900}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="max-w-5xl mx-auto mb-24 md:mb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
              <div className="order-2 md:order-1 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <Image
                  src="/homepage/rich-response.png"
                  alt="Expert-depth responses"
                  width={900}
                  height={700}
                  className="w-full h-auto"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-[#5a9cf5] mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#0058be]/20 flex items-center justify-center text-xs font-bold text-[#5a9cf5]">2</span>
                  Expert depth
                </div>
                <h3 className="text-2xl font-semibold tracking-tight mb-4 text-white">
                  Not generic answers
                </h3>
                <p className="text-[#8e9199] leading-relaxed">
                  Every response draws from curated PMM knowledge — the same books, AMAs,
                  and playbooks that shaped the best product marketers in tech.
                  Not a summary. A recommendation.
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
                  Not templates with blanks
                </h3>
                <p className="text-[#8e9199] leading-relaxed">
                  Positioning statements, battlecards, messaging frameworks, launch plans.
                  Share your context, get the artifact. Ready to present, ready to share with sales.
                </p>
              </div>
              <div className="rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <Image
                  src="/homepage/deliverable.png"
                  alt="Production-ready deliverables"
                  width={900}
                  height={700}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
              <div className="order-2 md:order-1 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <Image
                  src="/homepage/url-analysis.png"
                  alt="URL analysis"
                  width={900}
                  height={700}
                  className="w-full h-auto"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-[#5a9cf5] mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#0058be]/20 flex items-center justify-center text-xs font-bold text-[#5a9cf5]">4</span>
                  URL analysis
                </div>
                <h3 className="text-2xl font-semibold tracking-tight mb-4 text-white">
                  Drop a link. Get expert analysis.
                </h3>
                <p className="text-[#8e9199] leading-relaxed">
                  Paste a competitor&apos;s homepage, a blog post, or a product announcement.
                  PMMSherpa reads it, identifies the PMM concepts, and applies the right frameworks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section id="who-its-for" className="py-20 md:py-28 bg-[#f7f9fc] scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">Who It&apos;s For</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#191c1e]" style={{ letterSpacing: '-0.02em' }}>
              Built for go-to-market professionals
            </h2>
          </div>

          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white p-7 md:p-8">
              <div className="w-12 h-12 rounded-xl bg-[#d8e2ff] flex items-center justify-center mb-5">
                <FileText className="h-6 w-6 text-[#0058be]" />
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] mb-3">Product Marketers</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                Speed, depth, and a thinking partner that doesn&apos;t need a meeting invite.
                Production-ready deliverables validated against practitioner experience.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 md:p-8">
              <div className="w-12 h-12 rounded-xl bg-[#d8e2ff] flex items-center justify-center mb-5">
                <Users className="h-6 w-6 text-[#0058be]" />
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] mb-3">Product Managers</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                You own the product. Now you need the go-to-market to match.
                Positioning that differentiates. Messaging that resonates with buyers.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 md:p-8">
              <div className="w-12 h-12 rounded-xl bg-[#d8e2ff] flex items-center justify-center mb-5">
                <Rocket className="h-6 w-6 text-[#0058be]" />
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] mb-3">Founders</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                Professional product marketing without the six-figure hire.
                Strategic depth, on demand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Different */}
      <section id="why-different" className="py-20 md:py-28 bg-[#f2f4f7] scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">Why PMMSherpa</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#191c1e]" style={{ letterSpacing: '-0.02em' }}>
              Not another chatbot with a marketing prompt
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white p-10 md:p-14">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
                <div className="text-center">
                  <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[#d8e2ff] flex items-center justify-center">
                    <BookOpen className="h-7 w-7 text-[#0058be]" />
                  </div>
                  <h3 className="font-semibold text-base text-[#191c1e] mb-2">Curated expertise</h3>
                  <p className="text-sm text-[#5f6368] leading-relaxed">
                    540+ practitioner AMAs, foundational PMM books, and hundreds of tactical guides.
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[#d8e2ff] flex items-center justify-center">
                    <Brain className="h-7 w-7 text-[#0058be]" />
                  </div>
                  <h3 className="font-semibold text-base text-[#191c1e] mb-2">Context-aware retrieval</h3>
                  <p className="text-sm text-[#5f6368] leading-relaxed">
                    Understands your question, reads your history, and pulls the right frameworks.
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[#d8e2ff] flex items-center justify-center">
                    <Globe className="h-7 w-7 text-[#0058be]" />
                  </div>
                  <h3 className="font-semibold text-base text-[#191c1e] mb-2">Live market intel</h3>
                  <p className="text-sm text-[#5f6368] leading-relaxed">
                    Automatically pulls in web research when your question needs current data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-[#f7f9fc]">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl bg-[#0058be] p-10 md:p-14 text-center">
              <h2 className="mb-4 text-3xl md:text-4xl font-extrabold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
                Stop starting from blank pages.
              </h2>
              <p className="mb-8 text-lg text-[#a8c0f0] max-w-xl mx-auto">
                The expertise is already here.
              </p>
              <Link href="/request-access">
                <Button
                  size="lg"
                  className="gap-2 rounded-lg bg-white text-[#0058be] hover:bg-[#f2f4f7] font-semibold px-8 shadow-none"
                >
                  Request Access <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#f2f4f7]">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-between gap-4 px-5 md:px-8 text-sm text-[#8e9199] sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#0058be] to-[#2170e4] flex items-center justify-center">
              <MountainIcon className="h-3 w-3 text-white" />
            </div>
            <span className="font-medium text-[#5f6368]">PMMSherpa</span>
          </div>
          <p>Built for product marketing professionals.</p>
        </div>
      </footer>
    </div>
  );
}
