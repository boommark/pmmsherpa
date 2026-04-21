'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Copy, Check, Crosshair, ShieldCheck, Rocket, Target, TrendingUp, DollarSign, Map, ChevronLeft, ChevronRight } from 'lucide-react'

interface Guide {
  id: number
  icon: React.ElementType
  label: string
  title: string
  hook: string
  description: string
  prompts: {
    title: string
    prompt: string
    tip: string
  }[]
}

const GUIDES: Guide[] = [
  {
    id: 1,
    icon: Map,
    label: 'GTM Strategy',
    title: "GTM strategy shouldn't take weeks of guesswork",
    hook: "Most GTM plans take weeks of research, stakeholder alignment, and framework hunting. PMM Sherpa gives you instant access to 34 books, 534 practitioner AMAs, and 800+ blog posts — applied to your specific problem.",
    description: "Build a go-to-market strategy grounded in real frameworks",
    prompts: [
      {
        title: "GTM challenge diagnosis",
        prompt: "I'm a PMM at [company]. We sell [product] to [audience]. Our biggest GTM challenge right now is [describe it]. What frameworks and strategies should I consider, and what would you recommend as a first move?",
        tip: "Be specific about your challenge — 'we can't break into enterprise' is better than 'growth is slow'."
      },
      {
        title: "Product brief review",
        prompt: "Review this product brief and tell me: who is the strongest ICP, what's the sharpest wedge to enter the market, and what GTM motion fits best (PLG, sales-led, or hybrid)? Here's the brief: [paste it]",
        tip: "Paste the actual brief, PRD, or even a Slack thread describing the product."
      },
      {
        title: "Segment comparison",
        prompt: "We're debating between targeting [Segment A] and [Segment B]. Compare both segments on willingness to pay, urgency of the problem, and ease of reaching them. Which should we lead with and why?",
        tip: "Include what you already know about each segment — even rough estimates help."
      }
    ]
  },
  {
    id: 2,
    icon: ShieldCheck,
    label: 'Asset Audits',
    title: "Your landing page might be working against you",
    hook: "Audit your existing assets — landing pages, decks, one-pagers — against proven positioning, storytelling, and value frameworks. Get specific, actionable rewrites, not generic feedback.",
    description: "Pressure-test landing pages, decks, and messaging",
    prompts: [
      {
        title: "Landing page audit",
        prompt: "Audit this landing page: [paste URL]. Grade it against proven positioning, storytelling, and value frameworks. Pull 2-3 competitor pages and show me where they're beating me. Give me the 5 most impactful rewrites.",
        tip: "Paste the full URL. Sherpa will read the page and analyze the actual copy."
      },
      {
        title: "Sales deck review",
        prompt: "Here's our sales deck [paste or describe the slides]. Audit it: Is the narrative structure clear? Does it follow a problem-solution-proof arc? Where does it lose the buyer? Give me slide-by-slide recommendations.",
        tip: "Describe each slide's content if you can't paste the deck directly."
      },
      {
        title: "One-pager critique",
        prompt: "Review this one-pager for [product]. Our ICP is [describe them]. Does the messaging match what this buyer cares about? What's missing? Rewrite the sections that are weakest. Here's the text: [paste it]",
        tip: "Include who the one-pager is for — the same product needs different messaging for a CTO vs a VP of Marketing."
      }
    ]
  },
  {
    id: 3,
    icon: TrendingUp,
    label: 'Career Growth',
    title: "PMM Sherpa works on your career too",
    hook: "Apply the same frameworks you use for product positioning to your own career. Drawn from hundreds of practitioner interviews and career-focused resources from PMM leaders across top companies.",
    description: "Interview prep, promotions, and career strategy",
    prompts: [
      {
        title: "Interview preparation",
        prompt: "I'm interviewing for a [title] role at a [type of company]. My background is [brief summary]. Give me: the top 5 questions the hiring manager will likely ask, a strong answer structure for each, and a positioning statement for myself as a candidate.",
        tip: "Include the job description if you have it — Sherpa will tailor the prep to the specific role."
      },
      {
        title: "30/60/90 day plan",
        prompt: "Build me a 30/60/90 day plan for a [title] at [company type]. The product is [describe it]. The team is [size/structure]. Focus on quick wins that demonstrate PMM value to cross-functional stakeholders.",
        tip: "Mention your team structure — whether you're the first PMM or joining an existing team changes the plan entirely."
      },
      {
        title: "Promotion narrative",
        prompt: "I'm preparing for a promotion conversation from [current level] to [target level]. Here's what I've shipped this year: [list key projects]. Help me frame these accomplishments using PMM leadership frameworks. What's the strongest narrative I can tell?",
        tip: "List specific outcomes, not just projects. 'Launched X' is weaker than 'Launched X which drove Y% pipeline increase.'"
      }
    ]
  },
  {
    id: 4,
    icon: Crosshair,
    label: 'Positioning',
    title: "Positioning that doesn't sound like every other SaaS",
    hook: "Build positioning across 4 dimensions — competitive differentiation, category design, adoption curve, and language ownership — using multiple proven frameworks simultaneously.",
    description: "Differentiation that buyers actually feel",
    prompts: [
      {
        title: "Positioning statement",
        prompt: "Write a positioning statement for [product]. We compete mainly against [competitors]. Our ICP is [describe them]. Use competitive positioning as the base, but cross-check against category design principles and technology adoption frameworks. No generic SaaS language.",
        tip: "Name your actual competitors. 'We compete against Salesforce and HubSpot' gives Sherpa real context to work with."
      },
      {
        title: "Pressure test",
        prompt: "Here's our current positioning: [paste it]. Pressure-test it. Where is it vague? Where would a buyer not understand how we're different? Rewrite the weak parts and explain what you changed and why.",
        tip: "Paste your actual positioning doc, homepage hero, or pitch deck opening slides."
      },
      {
        title: "Messaging hierarchy",
        prompt: "Build a messaging hierarchy for [product]. Top-level value prop, 3 supporting pillars, and proof points for each. Our audience is [describe them] and the main alternative they use today is [current solution].",
        tip: "The 'alternative' isn't always a competitor — sometimes it's a spreadsheet, manual process, or doing nothing."
      }
    ]
  },
  {
    id: 5,
    icon: DollarSign,
    label: 'Pricing',
    title: "Stop guessing on pricing",
    hook: "Move beyond competitor averaging to data-driven pricing using willingness-to-pay methodology, modern SaaS pricing insights, and PLG pricing frameworks.",
    description: "Price with confidence, not guesswork",
    prompts: [
      {
        title: "Pressure-test your tiers",
        prompt: "Pressure-test this pricing: [describe your tiers and prices]. Our ICP is [describe them]. Our main competitors charge [what you know]. Where am I leaving money on the table? Where will I lose deals? What would you change?",
        tip: "Include your cost structure if possible — 'we spend $X per user' helps Sherpa evaluate unit economics."
      },
      {
        title: "Research competitor pricing",
        prompt: "We're launching a new product in [category] for [audience]. Research current competitor pricing in this space and recommend a pricing model (per-seat, usage-based, tiered flat rate) with specific price points. Justify each recommendation.",
        tip: "Name the category precisely. 'Developer tools' is too broad — 'API observability for mid-market engineering teams' is actionable."
      },
      {
        title: "Evaluate a pricing model switch",
        prompt: "We're considering switching from per-seat to usage-based pricing. Our product is [describe it]. Walk me through the pros and cons using proven pricing frameworks. What metrics should we price on, and what are the risks of getting it wrong?",
        tip: "Include your current ARR range and customer count — the right pricing model depends on your scale."
      }
    ]
  },
  {
    id: 6,
    icon: Rocket,
    label: 'Launches',
    title: "Launches fail when alignment breaks down",
    hook: "Generate aligned launch artifacts — Product, Sales, CS, and CEO documents — from a single source of truth. Using proven launch playbooks, tiering frameworks, and hundreds of real PMM leader experiences.",
    description: "Plan launches that keep four teams aligned",
    prompts: [
      {
        title: "Generate a launch brief",
        prompt: "From this product spec, generate a complete launch brief: launch tier recommendation, target audience, key messaging, success metrics, channel plan, and a timeline with owner assignments. Here's the spec: [paste it]",
        tip: "Paste the actual product spec, PRD, or even a Slack thread describing what's shipping."
      },
      {
        title: "Align four stakeholder docs",
        prompt: "We're launching [feature/product] in [timeframe]. Create four stakeholder documents from the same source of truth: a Product launch brief, a Sales narrative AEs can deliver verbally, a CS enablement note for handling customer questions, and a CEO summary for the board deck. Keep the core claims identical across all four. Here's the context: [paste details]",
        tip: "This is where Sherpa saves the most time. Instead of writing four docs that slowly drift apart, you get four aligned versions in one shot."
      },
      {
        title: "Build a GTM expansion plan",
        prompt: "Build a GTM plan for entering [new market/segment]. Include: ICP definition, positioning for this segment, channel strategy, first 90-day milestones, and the key risks. We currently sell to [current segment] and want to expand to [new segment].",
        tip: "Include what's working in your current segment and why you believe the new segment is a fit."
      }
    ]
  },
  {
    id: 7,
    icon: Target,
    label: 'Sales Enablement',
    title: "Sales needs a battlecard by tomorrow morning",
    hook: "Generate competitive battlecards — strategic, tactical, defensive — that AEs will actually use. Analyzed through competitive positioning frameworks and whole-product analysis.",
    description: "Battlecards, objection handling, discovery questions",
    prompts: [
      {
        title: "Build a competitive battlecard",
        prompt: "Build a competitive battlecard: us ([product]) vs. [competitor]. Include: their positioning, their strengths, their weaknesses, our differentiators, objection handling for their top 3 claims, and discovery questions that expose their gaps. Pull their current messaging from their website.",
        tip: "Name the specific competitor and paste their homepage URL if possible."
      },
      {
        title: "Create discovery questions",
        prompt: "Write 10 discovery questions our AEs should ask prospects who are also evaluating [competitor]. The questions should surface pain points where we win and expose areas where [competitor] is weak. Include the expected answer and our suggested follow-up for each.",
        tip: "Tell Sherpa your top 3 differentiators so the questions can steer toward them."
      },
      {
        title: "Handle a live objection",
        prompt: "A prospect just said: '[paste the exact objection].' They're comparing us to [competitor]. Write me a response that acknowledges their concern, reframes it, and pivots to our strength. Keep it conversational — something an AE can actually say on a call.",
        tip: "Paste the exact words the prospect used. 'They said it's too expensive' is weaker than 'They said: Your per-seat pricing doesn't make sense for our 500-person team.'"
      }
    ]
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      title="Copy prompt"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function GuidesContent() {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null)
  const searchParams = useSearchParams()

  // Auto-open guide from query param (e.g., /guides?g=3)
  useEffect(() => {
    const guideId = searchParams.get('g')
    if (guideId) {
      const guide = GUIDES.find(g => g.id === parseInt(guideId))
      if (guide) setSelectedGuide(guide)
    }
  }, [searchParams])

  if (selectedGuide) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedGuide(null)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          All Guides
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <selectedGuide.icon className="h-6 w-6 text-[#0058be]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#0058be]">{selectedGuide.label}</span>
        </div>
        <h1 className="text-2xl font-bold mb-3">{selectedGuide.title}</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">{selectedGuide.hook}</p>

        <div className="space-y-4">
          {selectedGuide.prompts.map((p, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-sm">{p.title}</h3>
                <CopyButton text={p.prompt} />
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed bg-muted/30 rounded-lg p-3 font-mono">
                {p.prompt}
              </p>
              <p className="text-xs text-muted-foreground mt-3 italic">{p.tip}</p>
            </div>
          ))}
        </div>

        {/* Prev / Next navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          {selectedGuide.id > 1 ? (
            <button
              onClick={() => setSelectedGuide(GUIDES[selectedGuide.id - 2])}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground/60">Previous</p>
                <p className="font-medium text-sm">{GUIDES[selectedGuide.id - 2].label}</p>
              </div>
            </button>
          ) : <div />}

          {selectedGuide.id < GUIDES.length ? (
            <button
              onClick={() => setSelectedGuide(GUIDES[selectedGuide.id])}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="text-right">
                <p className="text-xs text-muted-foreground/60">Next</p>
                <p className="font-medium text-sm">{GUIDES[selectedGuide.id].label}</p>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : <div />}
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Guides</h1>
        <p className="text-muted-foreground">
          Ready-to-use prompts and playbooks for every PMM challenge. Copy, paste your context, and go.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GUIDES.map((guide) => (
          <button
            key={guide.id}
            onClick={() => setSelectedGuide(guide)}
            className="text-left p-5 rounded-xl bg-card border border-transparent hover:border-[#0058be]/20 hover:shadow-[0_10px_40px_rgba(25,28,30,0.04)] dark:hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)] transition-all"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <guide.icon className="h-5 w-5 text-[#0058be]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#0058be]">Part {guide.id}</span>
            </div>
            <p className="text-[15px] font-medium leading-snug mb-1.5">{guide.title}</p>
            <p className="text-xs text-muted-foreground">{guide.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function GuidesPage() {
  return (
    <Suspense>
      <GuidesContent />
    </Suspense>
  )
}
