/**
 * Artifact template registry.
 *
 * Re-exports all 39 *Template objects keyed by `artifactType` (snake_case).
 * Used by the `draft_artifact` MCP tool to look up the correct
 * systemPromptFragment + skeleton for a requested deliverable.
 *
 * To add a new template: drop a new file in this directory exporting a
 * `<name>Template` object, then add it to the import + ALL_TEMPLATES array
 * below. We use explicit imports (rather than a glob) so TypeScript can
 * verify the shape at compile time and tree-shaking stays predictable.
 */

import type { ArtifactTemplate } from './types'

import { adCopyVariantsTemplate } from './ad-copy-variants'
import { analystBriefingDeckTemplate } from './analyst-briefing-deck'
import { battlecardTemplate } from './battlecard'
import { blogPostBriefTemplate } from './blog-post-brief'
import { buyerJourneyMapTemplate } from './buyer-journey-map'
import { buyerPersonaTemplate } from './buyer-persona'
import { caseStudyTemplate } from './case-study'
import { coSellBattlecardTemplate } from './co-sell-battlecard'
import { coldEmailSequenceTemplate } from './cold-email-sequence'
import { comparisonMatrixTemplate } from './comparison-matrix'
import { customerAllHandsQbrDeckTemplate } from './customer-all-hands-qbr-deck'
import { customerLaunchDeckTemplate } from './customer-launch-deck'
import { customerTestimonialAskTemplate } from './customer-testimonial-ask'
import { demoScriptTemplate } from './demo-script'
import { discoveryQuestionSetTemplate } from './discovery-question-set'
import { executiveKeynoteTemplate } from './executive-keynote'
import { icpTemplate } from './icp'
import { internalLaunchDeckTemplate } from './internal-launch-deck'
import { internalLaunchFaqTemplate } from './internal-launch-faq'
import { investorBoardDeckTemplate } from './investor-board-deck'
import { jointSolutionBriefTemplate } from './joint-solution-brief'
import { landingPageCopyTemplate } from './landing-page-copy'
import { launchBlogPostTemplate } from './launch-blog-post'
import { launchPlanGtmBriefTemplate } from './launch-plan-gtm-brief'
import { launchPressReleaseTemplate } from './launch-press-release'
import { messagingFrameworkTemplate } from './messaging-framework'
import { objectionHandlingTemplate } from './objection-handling'
import { onePagerSolutionBriefTemplate } from './one-pager-solution-brief'
import { partnerEnablementOnePagerTemplate } from './partner-enablement-one-pager'
import { partnerFacingLaunchFaqTemplate } from './partner-facing-launch-faq'
import { partnerPitchDeckTemplate } from './partner-pitch-deck'
import { positioningStatementTemplate } from './positioning-statement'
import { pricingPageCopyTemplate } from './pricing-page-copy'
import { salesPitchDeckTemplate } from './sales-pitch-deck'
import { strategicNarrativeTemplate } from './strategic-narrative'
import { talkTrackPitchScriptTemplate } from './talk-track-pitch-script'
import { valuePropositionCanvasTemplate } from './value-proposition-canvas'
import { webinarDeckTemplate } from './webinar-deck'
import { winLossInsightsTemplate } from './win-loss-insights'

const ALL_TEMPLATES: readonly ArtifactTemplate[] = [
  adCopyVariantsTemplate,
  analystBriefingDeckTemplate,
  battlecardTemplate,
  blogPostBriefTemplate,
  buyerJourneyMapTemplate,
  buyerPersonaTemplate,
  caseStudyTemplate,
  coSellBattlecardTemplate,
  coldEmailSequenceTemplate,
  comparisonMatrixTemplate,
  customerAllHandsQbrDeckTemplate,
  customerLaunchDeckTemplate,
  customerTestimonialAskTemplate,
  demoScriptTemplate,
  discoveryQuestionSetTemplate,
  executiveKeynoteTemplate,
  icpTemplate,
  internalLaunchDeckTemplate,
  internalLaunchFaqTemplate,
  investorBoardDeckTemplate,
  jointSolutionBriefTemplate,
  landingPageCopyTemplate,
  launchBlogPostTemplate,
  launchPlanGtmBriefTemplate,
  launchPressReleaseTemplate,
  messagingFrameworkTemplate,
  objectionHandlingTemplate,
  onePagerSolutionBriefTemplate,
  partnerEnablementOnePagerTemplate,
  partnerFacingLaunchFaqTemplate,
  partnerPitchDeckTemplate,
  positioningStatementTemplate,
  pricingPageCopyTemplate,
  salesPitchDeckTemplate,
  strategicNarrativeTemplate,
  talkTrackPitchScriptTemplate,
  valuePropositionCanvasTemplate,
  webinarDeckTemplate,
  winLossInsightsTemplate,
] as const

/** Map keyed by artifactType for O(1) lookup. Built once at module load. */
const TEMPLATE_REGISTRY: ReadonlyMap<string, ArtifactTemplate> = new Map(
  ALL_TEMPLATES.map((t) => [t.artifactType, t]),
)

/** Returns the template for the given artifactType, or undefined. */
export function getTemplate(artifactType: string): ArtifactTemplate | undefined {
  return TEMPLATE_REGISTRY.get(artifactType)
}

/** Returns all valid artifactType strings, sorted alphabetically. */
export function listArtifactTypes(): string[] {
  return Array.from(TEMPLATE_REGISTRY.keys()).sort()
}

export type { ArtifactTemplate } from './types'

export {
  adCopyVariantsTemplate,
  analystBriefingDeckTemplate,
  battlecardTemplate,
  blogPostBriefTemplate,
  buyerJourneyMapTemplate,
  buyerPersonaTemplate,
  caseStudyTemplate,
  coSellBattlecardTemplate,
  coldEmailSequenceTemplate,
  comparisonMatrixTemplate,
  customerAllHandsQbrDeckTemplate,
  customerLaunchDeckTemplate,
  customerTestimonialAskTemplate,
  demoScriptTemplate,
  discoveryQuestionSetTemplate,
  executiveKeynoteTemplate,
  icpTemplate,
  internalLaunchDeckTemplate,
  internalLaunchFaqTemplate,
  investorBoardDeckTemplate,
  jointSolutionBriefTemplate,
  landingPageCopyTemplate,
  launchBlogPostTemplate,
  launchPlanGtmBriefTemplate,
  launchPressReleaseTemplate,
  messagingFrameworkTemplate,
  objectionHandlingTemplate,
  onePagerSolutionBriefTemplate,
  partnerEnablementOnePagerTemplate,
  partnerFacingLaunchFaqTemplate,
  partnerPitchDeckTemplate,
  positioningStatementTemplate,
  pricingPageCopyTemplate,
  salesPitchDeckTemplate,
  strategicNarrativeTemplate,
  talkTrackPitchScriptTemplate,
  valuePropositionCanvasTemplate,
  webinarDeckTemplate,
  winLossInsightsTemplate,
}
