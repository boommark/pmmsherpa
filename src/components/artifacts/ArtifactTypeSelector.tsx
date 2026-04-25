'use client'

import { useState } from 'react'
import {
  Swords,
  FileText,
  TrendingUp,
  Rocket,
  Map,
  BarChart2,
  LineChart,
  PieChart,
  BarChart,
  BookOpen,
  MessageSquare,
  User,
  Target,
  Zap,
  DollarSign,
  Navigation,
  Star,
  Newspaper,
  Lock,
  ArrowUpCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ARTIFACT_CONFIGS, type ArtifactType } from '@/lib/artifacts/prompts/index'
import type { LucideIcon } from 'lucide-react'

interface ArtifactTypeSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (type: ArtifactType) => void
  userTier: string | null
}

const ARTIFACT_ICONS: Record<ArtifactType, LucideIcon> = {
  battle_card_deck: Swords,
  analyst_briefing: LineChart,
  competitive_landscape: Map,
  launch_deck: Rocket,
  market_segmentation: PieChart,
  qbr_pmm_update: BarChart,
  research_readout: BookOpen,
  sales_play: TrendingUp,
  win_loss_readout: BarChart2,
  battle_card_onepager: FileText,
  customer_reference: Star,
  feature_brief: Zap,
  gtm_plan_onepager: Navigation,
  messaging_framework: MessageSquare,
  persona_card: User,
  positioning_statement: Target,
  press_release_fyi: Newspaper,
  roi_business_case: DollarSign,
}

const SLIDE_TYPES: ArtifactType[] = [
  'battle_card_deck',
  'analyst_briefing',
  'competitive_landscape',
  'launch_deck',
  'market_segmentation',
  'qbr_pmm_update',
  'research_readout',
  'sales_play',
  'win_loss_readout',
]

const DOCUMENT_TYPES: ArtifactType[] = [
  'battle_card_onepager',
  'customer_reference',
  'feature_brief',
  'gtm_plan_onepager',
  'messaging_framework',
  'persona_card',
  'positioning_statement',
  'press_release_fyi',
  'roi_business_case',
]

function TemplateCard({
  type,
  isLocked,
  onSelect,
}: {
  type: ArtifactType
  isLocked: boolean
  onSelect: (type: ArtifactType) => void
}) {
  const config = ARTIFACT_CONFIGS[type]
  const Icon = ARTIFACT_ICONS[type]
  const count =
    config.format === 'slide'
      ? config.slideCount !== undefined
        ? `${config.slideCount} slides`
        : null
      : config.pageCount !== undefined
      ? `${config.pageCount} ${config.pageCount === 1 ? 'page' : 'pages'}`
      : null

  return (
    <button
      type="button"
      onClick={() => !isLocked && onSelect(type)}
      disabled={isLocked}
      className="relative flex flex-col gap-2 rounded-xl border border-border/50 bg-card p-3 text-left transition-all hover:border-[#0058be]/40 hover:bg-[#0058be]/[0.04] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border/50 disabled:hover:bg-card"
    >
      {isLocked && (
        <Lock className="absolute top-2.5 right-2.5 h-3 w-3 text-muted-foreground/50" />
      )}
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-[#d8e2ff] p-1.5 shrink-0">
          <Icon className="h-4 w-4 text-[#0058be]" />
        </div>
        <span className="text-[13px] font-medium leading-snug line-clamp-2">
          {config.displayName}
        </span>
      </div>
      {count && (
        <Badge
          variant="secondary"
          className="self-start text-[10px] px-1.5 py-0 h-4 bg-[#d8e2ff] text-[#0058be] border-0 font-medium"
        >
          {count}
        </Badge>
      )}
    </button>
  )
}

export function ArtifactTypeSelector({
  open,
  onOpenChange,
  onSelect,
  userTier,
}: ArtifactTypeSelectorProps) {
  const isLocked = userTier === 'free' || userTier === null
  const [upgrading, setUpgrading] = useState(false)

  const handleSelect = (type: ArtifactType) => {
    onSelect(type)
    onOpenChange(false)
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
        }),
      })
      const data = await res.json() as { url?: string }
      if (data.url) window.location.href = data.url
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose an Artifact</DialogTitle>
        </DialogHeader>

        {isLocked && (
          <div className="flex items-center justify-between rounded-lg bg-[#d8e2ff]/60 dark:bg-[#0058be]/10 border border-[#0058be]/20 px-4 py-3 text-sm gap-3">
            <div className="flex items-center gap-2 text-[#0058be] dark:text-[#a8c0f0]">
              <Lock className="h-4 w-4 shrink-0" />
              <span className="font-medium">Starter feature</span>
              <span className="text-muted-foreground font-normal">
                — Upgrade to generate slide decks and documents
              </span>
            </div>
            <Button
              size="sm"
              onClick={handleUpgrade}
              disabled={upgrading}
              className="shrink-0 bg-[#0058be] hover:bg-[#004a9e] text-white shadow-none text-xs h-7 gap-1"
            >
              <ArrowUpCircle className="h-3.5 w-3.5" />
              {upgrading ? 'Redirecting…' : 'Upgrade'}
            </Button>
          </div>
        )}

        <Tabs defaultValue="slides" className="flex-1 overflow-hidden flex flex-col min-h-0">
          <TabsList className="w-full justify-start shrink-0">
            <TabsTrigger value="slides">Slide Decks</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent
            value="slides"
            className="flex-1 overflow-y-auto mt-3"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2">
              {SLIDE_TYPES.map((type) => (
                <TemplateCard
                  key={type}
                  type={type}
                  isLocked={isLocked}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent
            value="documents"
            className="flex-1 overflow-y-auto mt-3"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2">
              {DOCUMENT_TYPES.map((type) => (
                <TemplateCard
                  key={type}
                  type={type}
                  isLocked={isLocked}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
