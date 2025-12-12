import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">PMMSherpa</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Powered by Claude Opus 4.5 & Gemini</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Your AI-Powered
            <br />
            <span className="text-primary">Product Marketing</span> Sherpa
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            Get expert guidance on positioning, messaging, GTM strategy, and
            more. PMMSherpa combines the wisdom of 1,200+ PMM resources with AI
            to help you create world-class product marketing.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Knowledge Sources */}
      <section className="border-y bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold">
              Built on Industry-Leading Knowledge
            </h2>
            <p className="mt-2 text-muted-foreground">
              Curated from the best product marketing resources
            </p>
          </div>
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
            {knowledgeSources.map((source) => (
              <div key={source.label} className="text-center">
                <p className="text-4xl font-bold text-primary">{source.count}</p>
                <p className="font-medium">{source.label}</p>
                <p className="text-sm text-muted-foreground">
                  {source.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">
            Everything You Need for Product Marketing Success
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From strategic guidance to tactical execution
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent/50"
            >
              <feature.icon className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Level Up Your Product Marketing?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join PMMSherpa and get AI-powered guidance for all your PMM needs.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>PMMSherpa</span>
          </div>
          <p>Built for Product Marketing professionals</p>
        </div>
      </footer>
    </div>
  );
}
