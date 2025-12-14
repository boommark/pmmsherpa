import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlobBackground } from "@/components/ui/blob-background";
import { AnimatedOrb } from "@/components/ui/animated-orb";
import {
  MessageSquare,
  BookOpen,
  Target,
  Zap,
  FileText,
  Users,
  ArrowRight,
  Globe,
} from "lucide-react";

// Mountain peak icon component for branding
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

const features = [
  {
    icon: BookOpen,
    title: "Strategic Foundation",
    description:
      "Grounded in proven PMM frameworks—positioning, messaging, competitive strategy—so every answer has depth.",
  },
  {
    icon: Target,
    title: "Positioning & Messaging",
    description:
      "Craft positioning statements, value props, and messaging frameworks that actually differentiate.",
  },
  {
    icon: Zap,
    title: "Go-to-Market Planning",
    description:
      "Build launch plans, define segments, map buyer journeys—with real competitive context.",
  },
  {
    icon: FileText,
    title: "Ready-to-Use Outputs",
    description:
      "Get battlecards, one-pagers, pitch decks, and sales enablement you can use immediately.",
  },
  {
    icon: Users,
    title: "Customer Intelligence",
    description:
      "Interview guides, persona frameworks, JTBD analysis—understand what drives decisions.",
  },
  {
    icon: MessageSquare,
    title: "Talk or Type",
    description:
      "Voice conversations for thinking out loud. Text for precision. Your PMM co-pilot, your way.",
  },
];

const capabilities = [
  {
    icon: BookOpen,
    title: "1,200+ Expert Resources",
    description: "Positioning, messaging, and GTM frameworks from leading PMM practitioners",
  },
  {
    icon: Globe,
    title: "Live Market Intelligence",
    description: "Real-time competitive insights and trends via Perplexity",
  },
  {
    icon: MessageSquare,
    title: "Voice & Text",
    description: "Think out loud or type—conversations that adapt to you",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 relative overflow-hidden">
      {/* Background blobs */}
      <BlobBackground />

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border-b border-white/20 dark:border-zinc-700/50">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <MountainIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PMMSherpa
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="rounded-full">
                Log in
              </Button>
            </Link>
            <Link href="/request-access">
              <Button className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/25">
                Request Access
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 text-center relative">
        <div className="mx-auto max-w-3xl">
          {/* Animated Orb */}
          <div className="flex justify-center mb-8">
            <AnimatedOrb size="lg" />
          </div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/20 dark:border-zinc-700/50 px-4 py-2 text-sm shadow-sm">
            <MountainIcon className="h-4 w-4 text-indigo-500" />
            <span className="text-muted-foreground">Where PMM Legends Meet Frontier AI</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Your Second Brain for
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Product Marketing
            </span>
          </h1>
          <p className="mb-10 text-lg text-muted-foreground/80 sm:text-xl max-w-2xl mx-auto">
            Expert knowledge. Real-time research. Voice conversations.
            PMMSherpa combines deep PMM expertise with live market intelligence
            to help you think clearly and move faster.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/request-access">
              <Button
                size="lg"
                className="gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/25 px-8"
              >
                Request Access <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border-white/20 dark:border-zinc-700/50 hover:bg-white/80 dark:hover:bg-zinc-700/80 px-8"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Glassmorphism card */}
            <div className="rounded-3xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-xl border border-white/20 dark:border-zinc-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 md:p-12">
              <div className="mb-8 text-center">
                <h2 className="text-2xl md:text-3xl font-bold">
                  Deep Expertise Meets Real-Time Intelligence
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Grounded in proven PMM frameworks, enriched with live market data
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                {capabilities.map((capability) => (
                  <div key={capability.title} className="text-center">
                    <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
                      <capability.icon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="font-semibold text-lg">{capability.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {capability.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Everything You Need for{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PMM Success
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From strategic guidance to tactical execution
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/20 dark:border-zinc-700/50 p-6 transition-all duration-300 hover:bg-white/80 dark:hover:bg-zinc-700/80 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1"
            >
              <div className="mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-colors">
                <feature.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Glassmorphism CTA card */}
            <div className="rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-indigo-500/10 backdrop-blur-xl border border-white/20 dark:border-zinc-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-8 md:p-12 text-center">
              <h2 className="mb-4 text-3xl md:text-4xl font-bold">
                Think Clearly.{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Ship Faster.
                </span>
              </h2>
              <p className="mb-8 text-lg text-muted-foreground max-w-xl mx-auto">
                Stop second-guessing your positioning. Stop searching for frameworks.
                Start with expert guidance and real-time market intelligence.
              </p>
              <Link href="/request-access">
                <Button
                  size="lg"
                  className="gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/25 px-8"
                >
                  Request Access <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 dark:border-zinc-800/50 py-8 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-sm">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <MountainIcon className="h-3 w-3 text-white" />
            </div>
            <span className="font-medium">PMMSherpa</span>
          </div>
          <p>Built for Product Marketing professionals</p>
        </div>
      </footer>
    </div>
  );
}
