---
marp: true
theme: sherpa-document
paginate: true
footer: 'Confidential — Internal Use Only'
---

<!-- _class: document-dark -->

<div class="doc-header-band">

# CodeGuard
## Positioning Statement

<div class="pill-row">

`v2.1` `April 2026` `Owner: Priya Mehta, PMM Lead` `APPROVED`

</div>
</div>

<div style="background: #f0f5ff; border-left: 4px solid #0058be; border-radius: 0 6px 6px 0; padding: 14px 20px; margin: 0 0 14px 0;">
<div style="font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #0058be; margin-bottom: 6px;">The Statement</div>
<div style="font-size: 1.0rem; font-weight: 600; color: #191c1e; line-height: 1.5;">
For <strong>engineering and security teams at high-growth software companies</strong> who <strong>need to catch and fix vulnerabilities before they reach production</strong>, <strong>CodeGuard</strong> is a <strong>developer-native application security platform</strong> that <strong>surfaces critical security issues inside the IDE and CI/CD pipeline — with remediation code generated automatically</strong>. Unlike <strong>legacy SAST tools and bolt-on security scanners</strong>, <strong>we meet developers in their workflow, not in a separate security portal that nobody opens.</strong>
</div>
</div>

<div class="columns">
<div>

## Statement Breakdown

| Component | What We Said | Why We Said It |
|---|---|---|
| **For** | Engineering and security teams at high-growth software companies | Dual-buyer — devs own the tool, CISOs own the budget. Both must see themselves. |
| **Who** | Need to catch and fix vulnerabilities before they reach production | Frames the problem at the point of maximum leverage: pre-prod, not post-breach. |
| **Product** | Developer-native application security platform | "Developer-native" is the category wedge. Not appsec-first, not scanner-first. |
| **That** | Surfaces critical security issues inside the IDE and CI/CD pipeline with auto-remediation | Two proof points in one clause: where it lives (IDE/CI) and what it does uniquely (auto-fix). |
| **Unlike** | Legacy SAST tools and bolt-on security scanners | Named the incumbent pattern, not a specific competitor. Gives us flexibility across accounts. |
| **We** | Meet developers in their workflow, not a separate portal nobody opens | The emotional truth: security tools die in adoption. This kills the objection before it's raised. |

</div>
<div>

## Alternatives We Considered

| Alternative Statement | Why Rejected |
|---|---|
| *"For security teams who need full visibility across their application layer, CodeGuard is the AppSec platform that consolidates SAST, DAST, and SCA into a single pane of glass."* | Positions us to security buyers only. Loses the developer champion who drives bottom-up adoption. "Single pane of glass" is the most overused phrase in security marketing. Rejected in win/loss review. |
| *"For software companies scaling past Series B, CodeGuard is the security platform that reduces mean time to remediate by 60% without slowing down your engineering velocity."*  | Metric-led statements age badly — the 60% figure requires constant proof updates. Org stage filter (Series B) is too narrow to use across verticals. Tests well in surveys, poorly in real buyer conversations. |
| *"For DevSecOps teams who want to shift security left, CodeGuard is the platform that makes every developer a security practitioner."* | "Shift left" is category noise — every competitor uses it. "Make every developer a security practitioner" is aspirational but doesn't create urgency. Buyers nodded and moved on. Did not shorten sales cycles in the A/B test cohort. |

</div>
</div>

---

<!-- _class: document -->

## Differentiation Evidence

| Claim in the Statement | Customer Evidence | Market Evidence |
|---|---|---|
| **Surfaces critical issues inside the IDE** | Figma's engineering team reported that CodeGuard IDE integration caught 73% of their critical CVEs before code review — vs. 31% caught by their prior SAST scan in CI alone. (Customer advisory board, Q1 2026) | Gartner's 2025 AppSec hype cycle identifies "developer-first security tooling" as the fastest-growing sub-segment, with 3× faster adoption than portal-based tools. |
| **Remediation code generated automatically** | Coinbase reduced average time-to-fix for high-severity findings from 11 days to 1.4 days after enabling auto-remediation in PR workflows. Measured across 14,000 findings over 6 months. | RedMonk survey (Jan 2026, n=412 engineering leads): 79% cite "showing the fix, not just the finding" as their top AppSec purchasing criterion — up from 51% in 2024. |
| **Meets developers in their workflow** | Datadog's platform engineering team reported 94% weekly active usage of CodeGuard in the first 60 days — compared to 22% WAU for their previous SAST tool after 12 months. Zero change-management program required. | StackOverflow Developer Survey 2025: 68% of developers say they have "ignored or delayed acting on" a security tool finding because it was surfaced outside their primary development environment. |

<div class="columns">
<div>

## Competitive Displacement

| Competitor | Old Story (What They Told Customers) | New Story (How CodeGuard Changes It) |
|---|---|---|
| **Checkmarx** | "The most comprehensive SAST engine, trusted by Fortune 500." Sells to security teams. Implementation-heavy. Results surfaced in a security portal reviewed weekly at best. | CodeGuard replaces the review cycle with in-flow feedback. Devs don't wait for the weekly scan report — they see findings on commit. Checkmarx becomes a tool security teams use; CodeGuard becomes a tool developers choose. |
| **Snyk** | "Developer-first security." Strong OSS brand. But core differentiation is SCA (open source deps), not application code security. Remediation is advisory, not generative. | CodeGuard expands the developer-first model into application code with generated fixes — not just dependency upgrades. Where Snyk tells you what's vulnerable in your libraries, CodeGuard fixes what's vulnerable in your code. |
| **Veracode** | "Cloud-based AppSec platform for the enterprise." Strong compliance narrative (SOC 2, PCI). Portal-centric. Positioned heavily toward security and compliance buyers, not developers. | CodeGuard targets the developer as the primary user, compliance as a byproduct — not the other way around. Displaces Veracode in accounts where the CISO is tired of buying tools their engineering teams ignore. |

</div>
<div>

## Usage Guidelines

**Use verbatim in:**
- Product website hero and positioning page
- Sales deck opening slide (no paraphrasing)
- Analyst briefings and press backgrounders
- RFP responses and security evaluation templates

**Adapt (maintain core structure) in:**
- One-pagers and solution briefs — may compress to the core clause
- Email and ad copy — extract "developer-native" and "auto-remediation" as key phrases
- SDR talk tracks — adapt language, preserve the unlike/we contrast

**Do NOT:**
- Swap in competitor names for "legacy SAST tools" without PMM approval
- Use this statement in developer community content (forums, OSS) — context-specific versions required
- Modify the "Unlike / We" contrast for individual deals without PMM sign-off

**Change approval:** All modifications to the approved statement require written sign-off from the PMM Lead and VP of Product. Submit via the #pmm-approvals Slack channel.

</div>
</div>

<hr>

<div style="font-size: 0.65rem; color: #5f6368; display: flex; gap: 40px;">
<span><strong>Approved by:</strong> Marcus Osei, VP Product</span>
<span><strong>Approval date:</strong> March 14, 2026</span>
<span><strong>Next review date:</strong> September 1, 2026</span>
</div>
