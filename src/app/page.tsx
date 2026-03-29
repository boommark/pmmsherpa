import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AnimatedOrb } from "@/components/ui/animated-orb";
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

export default function LandingPage() {
  return (
    <div className="landing-light min-h-screen bg-white relative overflow-hidden" style={{ colorScheme: 'light' }}>

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

      {/* Hero with header background */}
      <section className="relative overflow-hidden">
        {/* Header background illustration */}
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
              Stop guessing.{" "}
              <span className="bg-gradient-to-r from-[#0058be] to-[#2170e4] bg-clip-text text-transparent">
                Start knowing.
              </span>
            </h1>
            <p className="mb-12 text-lg text-[#5f6368] sm:text-xl max-w-xl mx-auto leading-relaxed">
              PMMSherpa gives product marketers the strategic depth, practitioner experience, and ready-to-ship deliverables to move with confidence — not just speed.
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

        {/* Section Bridge */}
        <div className="max-w-2xl mx-auto px-5 md:px-8 pb-10 text-center relative">
          <p className="text-base text-[#5f6368] leading-relaxed">
            Most PMMs are making high-stakes calls — on positioning, pricing, launches — without a senior peer to pressure-test with. PMMSherpa closes that gap.
          </p>
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
        background: 'linear-gradient(180deg, #f8f9fd 0%, #f0f3fa 50%, #f8f9fd 100%)',
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
              <p className="text-sm text-[#5f6368] leading-relaxed mb-2">
                Start from a foundation, not a feeling. Proven positioning frameworks and hundreds of practitioner playbooks so your GTM strategy is built on something defensible — not just instinct.
              </p>
              <p className="text-xs text-[#a0a4ab]">Positioning · Messaging · GTM Planning</p>
            </div>

            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-7 md:p-8 transition-all hover:bg-white hover:shadow-[0_8px_30px_rgba(0,88,190,0.08)] hover:-translate-y-1 border border-[#e8ecf4]/60">
              <div className="flex items-center gap-3 mb-4">
                <CustomIcon src="/icons/consult.png" alt="Consult" size={48} />
                <h3 className="text-lg font-semibold text-[#191c1e]">Consult</h3>
              </div>
              <p className="text-sm text-[#5f6368] leading-relaxed mb-2">
                The senior PMM who picks up every time. Direct recommendations grounded in how the best product marketers at Salesforce, Twilio, and Gong have handled the exact call you&apos;re facing.
              </p>
              <p className="text-xs text-[#a0a4ab]">Strategy · Competitive · Pricing</p>
            </div>

            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-7 md:p-8 transition-all hover:bg-white hover:shadow-[0_8px_30px_rgba(0,88,190,0.08)] hover:-translate-y-1 border border-[#e8ecf4]/60">
              <div className="flex items-center gap-3 mb-4">
                <CustomIcon src="/icons/validate.png" alt="Validate" size={48} />
                <h3 className="text-lg font-semibold text-[#191c1e]">Validate</h3>
              </div>
              <p className="text-sm text-[#5f6368] leading-relaxed mb-2">
                Don&apos;t find out your messaging is off after it&apos;s live. Paste your work and get a critique grounded in practitioner standards — before it goes to leadership, sales, or the market.
              </p>
              <p className="text-xs text-[#a0a4ab]">Review · Stress-test · Sharpen</p>
            </div>

            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-7 md:p-8 transition-all hover:bg-white hover:shadow-[0_8px_30px_rgba(0,88,190,0.08)] hover:-translate-y-1 border border-[#e8ecf4]/60">
              <div className="flex items-center gap-3 mb-4">
                <CustomIcon src="/icons/grow.png" alt="Grow" size={48} />
                <h3 className="text-lg font-semibold text-[#191c1e]">Grow</h3>
              </div>
              <p className="text-sm text-[#5f6368] leading-relaxed mb-2">
                Most PMMs don&apos;t have a mentor who&apos;s done the job at the next level. Now you do. Career guidance drawn from hundreds of PMM leaders across every stage of company.
              </p>
              <p className="text-xs text-[#a0a4ab]">Career · Skill Gaps · Leadership</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 scroll-mt-20" style={{
        background: 'linear-gradient(180deg, #0a1628 0%, #0f1d35 50%, #0a1628 100%)',
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
                  Context-aware, not keyword-dependent
                </h3>
                <p className="text-[#8e9199] leading-relaxed">
                  Your question is read in full — with everything you&apos;ve shared in the conversation. The right frameworks and practitioner experience surface automatically. No prompt engineering required.
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
                  A point of view, not a list of options
                </h3>
                <p className="text-[#8e9199] leading-relaxed">
                  Every response draws from the books, AMAs, and playbooks that shaped the best product marketers in tech. PMMSherpa commits to a recommendation. You decide what to do with it.
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
                  Deliverables, not drafts
                </h3>
                <p className="text-[#8e9199] leading-relaxed">
                  Positioning statements. Battlecards. Messaging frameworks. Launch plans. Share your context and get something you can actually hand to sales or present to leadership — not a template with blanks to fill.
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
                  Drop a URL. Get a strategic read.
                </h3>
                <p className="text-[#8e9199] leading-relaxed">
                  Paste a competitor&apos;s homepage, a pricing page, an announcement. PMMSherpa reads it, identifies the positioning moves, and tells you what it means for your own strategy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section id="who-its-for" className="py-20 md:py-28 scroll-mt-20" style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fd 50%, #ffffff 100%)',
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
                You know the product cold. Translating that into messaging that makes buyers feel something — that&apos;s a different skill. PMMSherpa bridges the gap.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 md:p-8 border border-[#e8ecf4]/60 hover:shadow-[0_8px_30px_rgba(0,88,190,0.06)] transition-all">
              <div className="w-16 h-16 mb-5">
                <CustomIcon src="/icons/technical-founder.png" alt="Founders" size={64} />
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] mb-3">Founders</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                Your first PMM hire is $180K and three months to ramp. Before that investment, or instead of it, PMMSherpa gives you the strategic foundation to go to market with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28" style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fd 100%)',
      }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl p-10 md:p-14 text-center" style={{
              background: 'linear-gradient(135deg, #0058be 0%, #1a6dd6 50%, #2170e4 100%)',
            }}>
              <h2 className="mb-4 text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-white">
                The doubt doesn&apos;t go away on its own.
              </h2>
              <p className="mb-8 text-lg text-blue-200 max-w-xl mx-auto">
                PMMSherpa is what you check your thinking against before it matters.
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

      {/* Footer with nav links */}
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
