import { analystBriefingConfig } from './analyst-briefing'
import { battleCardDeckConfig } from './battle-card'
import { battleCardOnepagerConfig } from './battle-card-onepager'
import { competitiveLandscapeConfig } from './competitive-landscape'
import { customerReferenceConfig } from './customer-reference'
import { featureBriefConfig } from './feature-brief'
import { gtmPlanOnepagerConfig } from './gtm-plan-onepager'
import { launchDeckConfig } from './launch-deck'
import { marketSegmentationConfig } from './market-segmentation'
import { messagingFrameworkConfig } from './messaging-framework'
import { personaCardConfig } from './persona-card'
import { positioningStatementConfig } from './positioning-statement'
import { pressReleaseFyiConfig } from './press-release-fyi'
import { qbrUpdateConfig } from './qbr-update'
import { researchReadoutConfig } from './research-readout'
import { roiBusinessCaseConfig } from './roi-business-case'
import { salesPlayConfig } from './sales-play'
import { winLossReadoutConfig } from './win-loss-readout'

export type ArtifactType =
  | 'analyst_briefing'
  | 'battle_card_deck'
  | 'battle_card_onepager'
  | 'competitive_landscape'
  | 'customer_reference'
  | 'feature_brief'
  | 'gtm_plan_onepager'
  | 'launch_deck'
  | 'market_segmentation'
  | 'messaging_framework'
  | 'persona_card'
  | 'positioning_statement'
  | 'press_release_fyi'
  | 'qbr_pmm_update'
  | 'research_readout'
  | 'roi_business_case'
  | 'sales_play'
  | 'win_loss_readout'

export interface ArtifactConfig {
  artifactType: ArtifactType
  displayName: string
  format: 'slide' | 'document'
  themeFile: string
  slideCount?: number
  pageCount?: number
  placeholderHint: string
  systemPrompt: string
}

export const ARTIFACT_CONFIGS: Record<ArtifactType, ArtifactConfig> = {
  analyst_briefing: analystBriefingConfig as ArtifactConfig,
  battle_card_deck: battleCardDeckConfig as ArtifactConfig,
  battle_card_onepager: battleCardOnepagerConfig as ArtifactConfig,
  competitive_landscape: competitiveLandscapeConfig as ArtifactConfig,
  customer_reference: customerReferenceConfig as ArtifactConfig,
  feature_brief: featureBriefConfig as ArtifactConfig,
  gtm_plan_onepager: gtmPlanOnepagerConfig as ArtifactConfig,
  launch_deck: launchDeckConfig as ArtifactConfig,
  market_segmentation: marketSegmentationConfig as ArtifactConfig,
  messaging_framework: messagingFrameworkConfig as ArtifactConfig,
  persona_card: personaCardConfig as ArtifactConfig,
  positioning_statement: positioningStatementConfig as ArtifactConfig,
  press_release_fyi: pressReleaseFyiConfig as ArtifactConfig,
  qbr_pmm_update: qbrUpdateConfig as ArtifactConfig,
  research_readout: researchReadoutConfig as ArtifactConfig,
  roi_business_case: roiBusinessCaseConfig as ArtifactConfig,
  sales_play: salesPlayConfig as ArtifactConfig,
  win_loss_readout: winLossReadoutConfig as ArtifactConfig,
}

export function getArtifactConfig(type: string): ArtifactConfig | null {
  return ARTIFACT_CONFIGS[type as ArtifactType] ?? null
}

export const ARTIFACT_TYPES = Object.keys(ARTIFACT_CONFIGS) as ArtifactType[]
