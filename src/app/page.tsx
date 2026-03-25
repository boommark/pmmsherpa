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
    <div className="landing-light min-h-screen bg-white relative overflow-hidden" style={{ colorScheme: 'light' }}>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <MountainIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PMMSherpa
            </span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-500">
            <a href="#use-cases" className="hover:text-slate-900 transition-colors">Use Cases</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#who-its-for" className="hover:text-slate-900 transition-colors">Who It&apos;s For</a>
            <a href="#why-different" className="hover:text-slate-900 transition-colors">Why PMMSherpa</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                Log in
              </Button>
            </Link>
            <Link href="/request-access">
              <Button className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/20">
                Request Access
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-white" />
        <div className="container mx-auto px-4 pt-16 md:pt-24 pb-8 md:pb-12 text-center relative">
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-center mb-6">
              <AnimatedOrb size="md" />
            </div>

            <h1 className="mb-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              Your Second Brain for{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Product Marketing
              </span>
            </h1>
            <p className="mb-10 text-lg text-slate-500 sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Grounded in the frameworks, war stories, and playbooks of thousands
              of real-world PMM leaders. Deep domain expertise meets live market
              intelligence to help you think clearly and ship faster.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/request-access">
                <Button
                  size="lg"
                  className="gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/20 px-8"
                >
                  Request Access <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 px-8"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Screenshot */}
        <div className="container mx-auto px-4 pb-16 md:pb-24 relative">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/15 border border-slate-200/80 ring-1 ring-slate-900/5">
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

      {/* Four Pillars Section */}
      <section id="use-cases" className="py-16 md:py-24 bg-slate-50/80 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              Four ways to work with PMMSherpa
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Whether you&apos;re starting from scratch or stress-testing a deliverable,
              PMMSherpa meets you where you are.
            </p>
          </div>

          <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6 md:p-8 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-teal-200">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <Target className="h-5 w-5 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Frame</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-2">
                Start new work on solid ground. Positioning statements, messaging
                hierarchies, GTM plans. Tell PMMSherpa what you&apos;re building and
                for whom, and it structures the approach using proven frameworks
                from Dunford, Moore, and hundreds of practitioner playbooks.
              </p>
              <p className="text-xs text-slate-400">Positioning, messaging, GTM planning</p>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6 md:p-8 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-indigo-200">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Consult</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-2">
                Get a second opinion that&apos;s actually informed. Stuck on a pricing
                decision? Unsure whether to position as category creation or
                competitive displacement? You&apos;ll get a direct recommendation grounded
                in how the best PMMs have handled it.
              </p>
              <p className="text-xs text-slate-400">Strategy, competitive, stakeholder questions</p>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6 md:p-8 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-emerald-200">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Validate</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-2">
                Check your work before it ships. Paste your messaging, battlecard,
                or launch plan. PMMSherpa reviews it against professional standards
                and tells you where it&apos;s strong, where it&apos;s thin, and what to fix.
                A senior PMM red-team review, on demand.
              </p>
              <p className="text-xs text-slate-400">Stress-test work against expert standards</p>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6 md:p-8 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-purple-200">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Grow</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-2">
                Level up without waiting for a mentor. Career transitions, skill gaps,
                team building, stakeholder management. Advice drawn from 540+ PMM
                leaders who&apos;ve navigated the same challenges at companies from
                Series A to Fortune 500.
              </p>
              <p className="text-xs text-slate-400">Career guidance, skill gaps, leadership</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — intentionally dark section for screenshot contrast */}
      <section id="how-it-works" className="py-16 md:py-24 bg-zinc-950 text-white scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
              How it works
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Ask a question. Get expert-level depth. Ship faster.
            </p>
          </div>

          {/* Step 1 */}
          <div className="max-w-5xl mx-auto mb-20 md:mb-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 mb-4">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300">1</span>
                  You ask. PMMSherpa thinks.
                </div>
                <h3 className="text-2xl font-semibold tracking-tight mb-4 text-white">
                  Intelligent retrieval, not keyword matching
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  Your question is analyzed alongside your conversation history, any URLs
                  or documents you&apos;ve shared, and the full context of what you&apos;re working
                  on. The system generates targeted queries across frameworks, practitioner
                  experience, and tactical guides. When your question needs current market
                  data, it automatically pulls in live research via Perplexity.
                </p>
              </div>
              <div className="rounded-xl overflow-hidden shadow-2xl border border-zinc-700/50">
                <Image
                  src="/homepage/intelligent-retrieval.png"
                  alt="PMMSherpa intelligently searching knowledge base and web"
                  width={900}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="max-w-5xl mx-auto mb-20 md:mb-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 md:order-1 rounded-xl overflow-hidden shadow-2xl border border-zinc-700/50">
                <Image
                  src="/homepage/rich-response.png"
                  alt="PMMSherpa providing structured expert response"
                  width={900}
                  height={700}
                  className="w-full h-auto"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 mb-4">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300">2</span>
                  Deep expertise, not generic answers.
                </div>
                <h3 className="text-2xl font-semibold tracking-tight mb-4 text-white">
                  The depth of a senior PMM advisor in every response
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  Every response draws from curated PMM knowledge: the same books, AMAs,
                  and playbooks that shaped the best product marketers in tech. Structured
                  for readability, grounded in specifics, with the depth of an advisor
                  who&apos;s seen this pattern before. Not a summary. A recommendation.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="max-w-5xl mx-auto mb-20 md:mb-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 mb-4">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300">3</span>
                  Production-ready deliverables.
                </div>
                <h3 className="text-2xl font-semibold tracking-tight mb-4 text-white">
                  Battlecards, positioning statements, and launch plans you can use today
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  Positioning statements, competitive battlecards, messaging frameworks,
                  launch plans. Share your context and PMMSherpa produces the artifact,
                  not a template with blanks. Ready to present, ready to share with sales,
                  ready to ship.
                </p>
              </div>
              <div className="rounded-xl overflow-hidden shadow-2xl border border-zinc-700/50">
                <Image
                  src="/homepage/deliverable.png"
                  alt="PMMSherpa generating a competitive battlecard"
                  width={900}
                  height={700}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 md:order-1 rounded-xl overflow-hidden shadow-2xl border border-zinc-700/50">
                <Image
                  src="/homepage/url-analysis.png"
                  alt="PMMSherpa analyzing URLs and applying frameworks"
                  width={900}
                  height={700}
                  className="w-full h-auto"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 mb-4">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300">4</span>
                  Paste a URL. Get expert analysis.
                </div>
                <h3 className="text-2xl font-semibold tracking-tight mb-4 text-white">
                  Reads articles, analyzes competitors, and applies the right frameworks
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  Drop a competitor&apos;s homepage, a blog post, or a product announcement.
                  PMMSherpa reads the content, identifies the relevant PMM concepts,
                  and gives you analysis grounded in frameworks and practitioner experience.
                  No copy-paste. Just share the link.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section id="who-its-for" className="py-16 md:py-24 bg-white scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              Built for the people who shape how products reach markets
            </h2>
          </div>

          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 md:p-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Product Marketers</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                From IC to VP, from first positioning statement to tenth launch.
                You already know the frameworks. What you need is speed, depth,
                and a thinking partner that doesn&apos;t require a meeting invite.
                Production-ready deliverables, validated against practitioner experience.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 md:p-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Product Managers</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                You own the product. Now you need the go-to-market to match.
                You don&apos;t need to become a PMM. You need the strategic lens of one.
                Positioning that differentiates, messaging that resonates with
                buyers instead of engineers, launch plans your marketing team can execute.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 md:p-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                <Rocket className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Founders & Entrepreneurs</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Professional product marketing without the six-figure hire. Before
                you can afford a head of product marketing, you still need positioning,
                competitive battlecards, and messaging that doesn&apos;t sound like it was
                written by the engineering team. Strategic depth, on demand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes It Different */}
      <section id="why-different" className="py-16 md:py-24 bg-slate-50/80 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              Not another chatbot with a marketing prompt
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              PMMSherpa is built on a curated knowledge base that generic AI tools don&apos;t have.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                <div className="text-center">
                  <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <BookOpen className="h-7 w-7 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-base text-slate-900 mb-2">Deep, curated expertise</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Foundational PMM books, 540+ practitioner AMAs from leaders at
                    Salesforce, Shopify, and Twilio, plus hundreds of tactical guides.
                    The same material that shaped the best PMMs in tech.
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
                    <Brain className="h-7 w-7 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-base text-slate-900 mb-2">Intelligent retrieval</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Understands your question, reads your conversation history,
                    and generates targeted queries that pull the right frameworks,
                    practitioner stories, and tactical guides for your specific situation.
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
                    <Globe className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-base text-slate-900 mb-2">Live market intelligence</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    When your question needs current data, competitor intel, or recent
                    market developments, PMMSherpa automatically pulls in web research.
                    No toggles. No manual switching. It knows when to look outward.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-8 md:p-12 text-center shadow-xl shadow-indigo-500/15">
              <h2 className="mb-4 text-3xl md:text-4xl font-bold tracking-tight text-white">
                Your next positioning statement shouldn&apos;t start with a blank page.
              </h2>
              <p className="mb-8 text-lg text-indigo-100 max-w-xl mx-auto leading-relaxed">
                Whether you&apos;re framing a new initiative, validating a deliverable,
                or navigating a career transition, the expertise is already here.
              </p>
              <Link href="/request-access">
                <Button
                  size="lg"
                  className="gap-2 rounded-full bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-lg px-8"
                >
                  Request Access <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-white">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-slate-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <MountainIcon className="h-3 w-3 text-white" />
            </div>
            <span className="font-medium text-slate-600">PMMSherpa</span>
          </div>
          <p>Built for product marketing professionals.</p>
        </div>
      </footer>
    </div>
  );
}
