/**
 * Buyer Journey Map template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Kalbach — The Jobs to Be Done Playbook (job map, forces analysis, Two
 *   Schools of JTBD / demand-side timeline). Validation: Torres — Continuous
 *   Discovery Habits (interview-grounded discovery, opportunity solution
 *   tree, proto-personas).
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/06-buyer-journey-map.md
 *
 * Why this template uses a 6-stage demand-side spine instead of the
 * conventional 3-stage Awareness / Consideration / Decision frame:
 * the 3-stage frame is downstream of the seller's funnel (TOFU/MOFU/BOFU)
 * and stops at signature. The buyer journey is the buyer's lens, not the
 * seller's. We anchor on the JTBD demand-side timeline (Status Quo →
 * First Thought → Passive Looking → Active Looking → Deciding → First Use
 * / Handoff), apply forces-of-progress per stage, and cross-walk to the
 * funnel for RevOps alignment only. Customer-journey scope (post-signature
 * adoption / expansion / advocacy) is explicitly out of frame; it belongs
 * to a separate downstream artifact.
 */

import type { ArtifactTemplate } from './types'

const BUYER_JOURNEY_SYSTEM_PROMPT = `You are drafting a buyer journey map — \
the strategic document that captures the buyer's path from latent pain to \
signed contract from the BUYER'S perspective. This is NOT a sales funnel \
diagram and NOT a customer-lifecycle map.

Avoid these failure modes:
- Funnel-as-journey — using TOFU/MOFU/BOFU as stages. Those are the seller's \
internal CRM lens, not the buyer's experience. The buyer doesn't know they're \
in your funnel; they're trying to solve a problem.
- Conflating buyer journey with customer journey — the buyer journey ends at \
signature. Onboarding, adoption, expansion, advocacy belong to a separate \
customer-journey artifact. Stop at first use / handoff.
- Fabricated stages and emotions — every stage, emotional state, trigger, and \
friction point must be grounded in interview evidence (proto-persona research, \
win/loss interviews, customer conversations). If it isn't grounded, mark it \
explicitly as a hypothesis to test, not a finding.
- Optimizing for the economic buyer, ignoring the end user — in B2B SaaS the \
person who signs the contract and the person who uses the product are usually \
different humans with different criteria. One artifact maps ONE persona's \
journey. If you have a champion, an economic buyer, and an end user, that's \
three artifacts, not one diluted one.
- Linear-journey assumption — most B2B journeys are multi-threaded and \
non-linear. The buyer educates themselves before talking to sales (often >80% \
of the decision happens pre-conversation), stakeholders enter the journey at \
different stages, and buyers loop backward when new criteria surface.
- Skipping the seams — Status Quo / Latent Pain (the pre-trigger stage) and \
First Use / Handoff (the post-signature seam) are the two most-skipped stages \
and the two highest-leverage ones for messaging continuity. Include both.
- Generic stage descriptions — "the buyer learns about solutions" is not a \
stage, it's a placeholder. Stages need specific signals, channels, content \
needs, and emotional states grounded in the actual buyer being mapped.

Anchor on demand-side psychology (forces of progress: push of situation, pull \
of new solution, anxiety of change, habit of status quo) per stage — not on \
content-funnel categories. The funnel cross-walk is a secondary aid for \
RevOps alignment, not the spine.

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const buyerJourneyMapTemplate: ArtifactTemplate = {
  artifactType: 'buyer_journey_map',
  title: 'Buyer Journey Map',
  systemPromptFragment: BUYER_JOURNEY_SYSTEM_PROMPT,
  // Spine follows the JTBD demand-side timeline (buyer's lens). Cross-walk
  // to TOFU/MOFU/BOFU is captured per-stage as a secondary field, not as
  // the structural backbone.
  skeleton: `# Buyer Journey Map: [Persona Name] for [Product Name]

## Pre-work (decisions made before drafting)

- **Whose journey:** [ONE of: champion / economic buyer / end user. Name the persona explicitly. If you need to map more than one, build separate artifacts — do not merge.]
- **Evidence base:** [Win/loss interviews, customer conversations, proto-persona research, sales-call recordings. List the specific sources behind this map. If a stage is hypothesis-only, mark it explicitly so the team knows what to test.]
- **Segment scope:** [Best-fit accounts only, or a specific sub-segment? Buyer journeys differ by company size, industry, and trigger; a map that tries to cover everyone covers no one well.]
- **Scope boundary:** [Confirm: this map ends at signature / first use. Customer journey (onboarding, adoption, expansion, advocacy) is a separate artifact.]

---

## Stage 1: Status Quo / Latent Pain
*(Pre-trigger. The friction exists; the buyer hasn't named it as a problem worth solving yet.)*

- **Trigger to enter:** [Usually no external trigger — this is the baseline state. Note any chronic pain that hasn't yet crystallized into a search.]
- **Buyer's job-to-be-done at this stage:** [What are they trying to accomplish that the current setup is making harder? Verb + object + clarifier.]
- **Emotional state:** [Mild frustration, learned helplessness, workarounds normalized. NOT urgency yet.]
- **Channels & sources:** [Industry newsletters, peer conversations, ambient social. Not actively searching.]
- **Content / asset they need:** [Provocation: thought leadership that names the invisible problem. Benchmarks. "Is your team spending X% of their week on Y?" content. NOT product pitches.]
- **Forces of progress:**
  - Push of situation: [What ambient pain is building?]
  - Pull of new solution: [Low — they don't know one exists for this.]
  - Anxiety of change: [Low — no change is on the table yet.]
  - Habit of status quo: [Strong — workarounds feel normal.]
- **Exit signal:** [A triggering event names the problem and pushes them to Stage 2.]
- **Failure mode at this stage:** [Skipping it entirely. Most journey maps start at "Awareness" and miss the leverage point of category provocation.]
- **Sales-funnel cross-walk (secondary):** [Pre-TOFU. Often invisible to RevOps.]

## Stage 2: First Thought
*(A trigger names the problem. The buyer realizes solutions exist for this.)*

- **Trigger to enter:** [Specific events that move the buyer here — missed target, board question, competitor move, a peer mentioning a tool, leadership change, regulation, scale break.]
- **Buyer's job-to-be-done:** [What problem are they now consciously trying to solve?]
- **Emotional state:** [Curiosity + early urgency. "I should look into this."]
- **Channels & sources:** [Generic search ("how to improve X"), LinkedIn, peer DMs, communities.]
- **Content / asset they need:** [Problem-framing content. Category explainers. ROI cost-of-inaction calculators. "What good looks like" benchmarks.]
- **Forces of progress:**
  - Push of situation: [The trigger event — what made the pain undeniable.]
  - Pull of new solution: [Rising — they're starting to imagine a better state.]
  - Anxiety of change: [Low to moderate — still exploratory.]
  - Habit of status quo: [Weakening but still present.]
- **Exit signal:** [They actively start collecting information about the category — moves to Stage 3.]
- **Failure mode at this stage:** [Pitching product before the buyer has named the problem. They tune out.]
- **Sales-funnel cross-walk:** [Top of TOFU.]

## Stage 3: Passive Looking
*(Collecting ambient signal. Learning the category. Not actively shortlisting yet.)*

- **Trigger to enter:** [The buyer has decided this is worth understanding, but hasn't been told to "go pick a vendor" yet.]
- **Buyer's job-to-be-done:** [What does this category look like? Who plays in it? What's the language? What's possible?]
- **Emotional state:** [Curious, sometimes overwhelmed by category sprawl.]
- **Channels & sources:** [Newsletters, podcasts, analyst content, communities, vendor blogs they bookmark, LinkedIn voices. Vendor websites for orientation, not evaluation.]
- **Content / asset they need:** [Educational long-form. Category landscape POVs. Comparison frameworks (NOT yet vendor-vs-vendor). Webinars. Analyst reports. Anything that helps them build a mental model of the space.]
- **Forces of progress:**
  - Push of situation: [Ongoing pain.]
  - Pull of new solution: [Building — they're seeing what's possible.]
  - Anxiety of change: [Starting to register — switching cost, integration risk, internal politics.]
  - Habit of status quo: [Eroding.]
- **Exit signal:** [A budget, mandate, or pressure converts the buyer from passive to active. Often: a quarter starts, leadership asks a question, a deadline appears.]
- **Failure mode at this stage:** [Treating passive lookers as ready to buy. Cold demos kill the relationship.]
- **Sales-funnel cross-walk:** [Mid-TOFU.]

## Stage 4: Active Looking
*(Shortlisting. Comparing. Asking peers. The buyer is now actually evaluating vendors.)*

- **Trigger to enter:** [Budget approved, project scoped, mandate issued, or pain breached a threshold.]
- **Buyer's job-to-be-done:** [Identify the 2-4 vendors that fit my context, understand the differences, and de-risk the choice for my org.]
- **Emotional state:** [Engaged but overwhelmed. Too many options. Differences not always clear.]
- **Channels & sources:** [G2, Capterra, peer Slack groups, customer references, vendor demos, comparison searches ("X vs Y"), analyst grids.]
- **Content / asset they need:** [Clear positioning. "Why us over the category" answers. Battlecards-as-content. Case studies that match their industry / stage / use case. Demo videos. ROI models.]
- **Forces of progress:**
  - Push of situation: [Strong — there's now a project and a clock.]
  - Pull of new solution: [Strong — they can taste the better state.]
  - Anxiety of change: [Rising — switching cost, vendor risk, politics, "what if we pick wrong?"]
  - Habit of status quo: [Mostly broken, but resurfaces under stress.]
- **Exit signal:** [A shortlist of 2-3 vendors enters formal evaluation — moves to Stage 5.]
- **Failure mode at this stage:** [Generic content that fits "any buyer." Active lookers want context-specific evidence.]
- **Sales-funnel cross-walk:** [MOFU.]

## Stage 5: Deciding
*(Committee phase. Procurement, security, legal, references. Risk-aversion dominates.)*

- **Trigger to enter:** [Vendor shortlist locked; formal evaluation, RFP, or mutual action plan in motion.]
- **Buyer's job-to-be-done:** [De-risk this choice. Get the org to a "yes" without me being the person who chose wrong.]
- **Emotional state:** [Risk-averse. Fear of a bad decision often outweighs excitement about a good one. Internal politics surface.]
- **Channels & sources:** [Direct vendor calls, security questionnaires, references on the phone, legal review, finance review, end-user pilots.]
- **Content / asset they need:** [Security and compliance docs (SOC 2, ISO, GDPR, DPAs). ROI models with their numbers. Customer references matched to their profile. Implementation plans that reduce perceived switching cost. Mutual action plans. Champion-enablement assets the buyer can forward internally.]
- **Forces of progress:**
  - Push of situation: [Project deadline.]
  - Pull of new solution: [Specific to the leading vendor — depends on Stage 4 differentiation.]
  - Anxiety of change: [Peak — this is where deals stall. Procurement, security, switching cost, internal alignment.]
  - Habit of status quo: [Re-emerges as "do nothing" — often the real competitor at this stage.]
- **Exit signal:** [Contract signed.]
- **Failure mode at this stage:** [Underestimating the consensus problem. Champion isn't the only stakeholder; address procurement, security, finance, and end-user concerns explicitly.]
- **Sales-funnel cross-walk:** [BOFU.]

## Stage 6: First Use / Handoff
*(Contract signed. Buyer becomes user. Messaging-continuity seam.)*

- **Trigger to enter:** [Signature.]
- **Buyer's job-to-be-done:** [Realize the value that was promised, fast enough to justify the decision internally.]
- **Emotional state:** [Hopeful but easily disappointed. The vision sold in stages 2-4 is now the benchmark for every interaction.]
- **Channels & sources:** [Onboarding emails, kickoff calls, CS rep, in-product flows.]
- **Content / asset they need:** [Onboarding that mirrors the pitch. Quick-win playbooks. Implementation guides. The same language the buyer heard in sales — not a fresh CS-team vocabulary.]
- **Forces of progress (handoff-specific):**
  - Continuity of promise: [Does first use deliver what stages 2-4 promised?]
  - Anxiety of regret: [If onboarding feels disconnected from the pitch, doubt creeps in within days.]
- **Exit signal (out of scope for this artifact):** [First value milestone hit. Past this point, the customer journey takes over.]
- **Failure mode at this stage:** [Ending the journey map at signature. The seam is where messaging continuity either holds or cracks. Document it; don't extend the map further.]
- **Sales-funnel cross-walk:** [Closed-won → CS handoff.]

---

## Multi-threaded reality

[Most B2B SaaS journeys are non-linear and multi-threaded. The majority of the decision happens before the buyer talks to sales. Different stakeholders enter at different stages with different criteria. Document where in this journey other personas typically enter (e.g., "Security joins at Stage 5"; "End user joins at Stage 4 for pilot") and what they need from us at that moment. If multiple personas have meaningfully different journeys, build separate maps and reference them here.]

## Open hypotheses to test

[Stages, emotional states, or triggers that aren't yet grounded in interview evidence. List them so the team knows what to validate in the next discovery cycle. Better to ship a map with explicit gaps than a polished map full of fabrication.]
`,
}
