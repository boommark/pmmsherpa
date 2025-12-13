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
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Expert Knowledge Base",
    description:
      "Powered by 1,200+ curated PMM resources including books, blog posts, and AMA sessions from industry leaders.",
  },
  {
    icon: Target,
    title: "Strategic Positioning",
    description:
      "Craft compelling positioning statements, value propositions, and messaging frameworks that resonate.",
  },
  {
    icon: Zap,
    title: "GTM Strategy",
    description:
      "Build comprehensive go-to-market strategies with launch plans, battlecards, and competitive analysis.",
  },
  {
    icon: FileText,
    title: "Deliverable Generation",
    description:
      "Generate sales decks, one-pagers, case studies, and other PMM deliverables instantly.",
  },
  {
    icon: Users,
    title: "Customer Research",
    description:
      "Create interview guides, persona frameworks, and JTBD analyses to understand your customers.",
  },
  {
    icon: MessageSquare,
    title: "Conversational Interface",
    description:
      "Natural chat interface with source citations, conversation history, and export capabilities.",
  },
];

const knowledgeSources = [
  { count: "17", label: "PMM Books", description: "Industry classics" },
  { count: "781", label: "Blog Posts", description: "PMA articles" },
  { count: "485", label: "AMA Sessions", description: "Expert Q&As" },
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
              <Sparkles className="h-4 w-4 text-white" />
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
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span className="text-muted-foreground">Powered by Claude Opus 4.5 & Gemini</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Your AI-Powered
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Product Marketing
            </span>{" "}
            Sherpa
          </h1>
          <p className="mb-10 text-lg text-muted-foreground/80 sm:text-xl max-w-2xl mx-auto">
            Get expert guidance on positioning, messaging, GTM strategy, and
            more. PMMSherpa combines the wisdom of 1,200+ PMM resources with AI
            to help you create world-class product marketing.
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

      {/* Knowledge Sources */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Glassmorphism card */}
            <div className="rounded-3xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-xl border border-white/20 dark:border-zinc-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 md:p-12">
              <div className="mb-8 text-center">
                <h2 className="text-2xl md:text-3xl font-bold">
                  Built on Industry-Leading Knowledge
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Curated from the best product marketing resources
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                {knowledgeSources.map((source) => (
                  <div key={source.label} className="text-center">
                    <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {source.count}
                    </p>
                    <p className="font-semibold mt-1">{source.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {source.description}
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
                Ready to Level Up Your{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Product Marketing?
                </span>
              </h2>
              <p className="mb-8 text-lg text-muted-foreground max-w-xl mx-auto">
                Join PMMSherpa and get AI-powered guidance for all your PMM needs.
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
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="font-medium">PMMSherpa</span>
          </div>
          <p>Built for Product Marketing professionals</p>
        </div>
      </footer>
    </div>
  );
}
