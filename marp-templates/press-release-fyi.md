---
marp: true
theme: sherpa-document
paginate: true
footer: 'Confidential — Internal Use Only'
---

<!-- _class: document -->

# ContractIQ — Working Backwards FYI
## AI-Powered Contract Intelligence Platform

`INTERNAL DRAFT` `NOT FOR EXTERNAL DISTRIBUTION`

**Date:** April 23, 2026
**Author:** Priya Nair, CPO
**Distribution:** Executive team · Product leads · GTM leadership

---

## The Headline

### Amazon Launches ContractIQ, an AI System That Reads Every Contract Your Business Has Ever Signed — and Tells You What to Do About It

*Today, Amazon announced ContractIQ, a contract intelligence platform that uses large language models to extract obligations, risks, renewal triggers, and negotiation leverage from enterprise contract libraries at scale. Early enterprise customers report reclaiming an average of $2.3M in overlooked contract value in their first 90 days — including missed SLA credits, auto-renewing clauses they didn't know existed, and pricing provisions their teams had never enforced. ContractIQ is available in private preview for enterprise customers with contract libraries of 500 or more agreements.*

---

## The Problem

Every company above 200 employees is sitting on a contract liability they don't know they have. Legal teams sign agreements, file them in shared drives, and move on. Those agreements contain obligations — to vendors, customers, regulators, and counterparties — that are supposed to be tracked, enforced, and renegotiated. They almost never are. When a contract matters (a renewal, a dispute, a diligence request), a paralegal or junior attorney manually reads through PDFs at $250 an hour, hoping they don't miss anything.

Current solutions — contract lifecycle management (CLM) software, legal ops tools, and glorified document storage systems — solve the wrong problem. They help legal teams file contracts, not understand them. They tell you where a contract is, not what it says or what you should do about it. The market is full of "AI-powered" CLM tools that perform keyword search on PDFs and call it intelligence. That's not intelligence. That's indexing with extra steps.

---

## The Solution

ContractIQ does something none of the CLM tools do: it reads. Not keyword-searches — reads. Using a purpose-built legal language model fine-tuned on 14 million enterprise contracts across 38 jurisdictions, ContractIQ extracts structured data from unstructured agreements: payment terms, liability caps, IP ownership clauses, termination triggers, SLA commitments, auto-renewal dates, most-favored-nation provisions, and 200+ additional clause types. It then surfaces the ones that require action, ranked by financial exposure and time sensitivity.

The architecture is deliberately simple from the customer's perspective: connect your contract storage (SharePoint, Box, DocuSign, Google Drive, or S3), run the initial ingestion (typically 48–72 hours for libraries under 10,000 contracts), and begin receiving a prioritized obligation calendar and risk register. There is no implementation project. There is no training data required from the customer. The model works on day one because it was trained on contracts that look like yours, not contracts you had to provide.

---

## Customer Quote 1

> "We had 4,200 vendor contracts in SharePoint and a legal team of three. We knew there were renewal traps in there — we just didn't know where. ContractIQ found 34 auto-renewals totalling $8.7M in annual spend that were 90 days from locking in. We renegotiated 22 of them before the window closed. The tool paid for itself in the first week. We're not a legal team anymore — we're a contract intelligence function."

**— David Kowalski, General Counsel, Apex Logistics Group**
*(Early access customer, 4,200-contract library, logistics sector)*

---

## Customer Quote 2

> "We're a SaaS company with 600 customer contracts and a surprisingly complex web of vendor agreements from our last two acquisitions. The integration obligations alone were a black box. ContractIQ mapped every commitment we'd inherited, flagged three that were in technical breach, and surfaced two where we were entitled to SLA credits we'd never claimed. Our CFO now treats the contract risk register as a live financial instrument — she reviews it monthly alongside the P&L."

**— Keisha Bramwell, VP Legal & Compliance, Fieldstone Software**
*(Early access customer, 1,100-contract library, B2B SaaS)*

---

## Executive Quote

> "We've been told for decades that legal is a cost center. ContractIQ is the first product I've seen that makes that argument structurally false. Every enterprise agreement your company has ever signed is a financial instrument with a time value and a risk profile. ContractIQ makes that visible. That's not an efficiency tool — it's a new category of financial intelligence. We built it because no one else was going to."

**— Priya Nair, Chief Product Officer, Amazon (ContractIQ)**

---

## FAQ

**Q: Is this just another CLM with AI bolted on?**
No. CLM tools help you store and route contracts. ContractIQ extracts meaning from them. The output is not a searchable repository — it's an obligation register, a risk flag queue, and a renewal calendar. Think of CLM as a filing cabinet; ContractIQ is the analyst who reads everything in the filing cabinet.

**Q: What does the model actually do that GPT-4 or Claude can't do out of the box?**
General LLMs hallucinate on legal language — they paraphrase where precision is required. Our model was fine-tuned on 14 million contracts with structured ground truth labels across 200+ clause types and 38 jurisdictions. It produces clause-level extraction with confidence scores and source citations. A general LLM doesn't do that reliably.

**Q: How do you handle data security and confidentiality?**
Customer contract data is never used to train the shared model. Each customer gets a dedicated inference environment. SOC 2 Type II compliant, GDPR-ready, with optional on-premise deployment for regulated industries (financial services, healthcare). We will not win customers who can't get this past their legal team — that is a hard gate.

**Q: What's the accuracy rate on clause extraction?**
In our internal evals across 500,000 held-out contracts: 94.2% precision, 91.7% recall across our top 50 clause types. On jurisdictionally complex contracts (EU, UK, APAC cross-border), accuracy drops to ~87%. We show confidence scores on every extraction so customers know when to verify.

**Q: How long does implementation actually take?**
For a 1,000-contract library: 48–72 hours of ingestion, then live. For 10,000+ contracts: 5–7 business days. For highly fragmented storage (multiple systems, mixed formats, scanned PDFs requiring OCR): add 2–4 weeks. We should not oversell "day one" for complex environments.

**Q: Who is the buyer?**
Primary: General Counsel or Chief Legal Officer. Secondary economic buyer: CFO (when positioned around contract value recovery) or CIO (when positioned around risk and compliance). We have not yet cracked the CLO at companies under $50M ARR — they often don't have structured contract libraries. This is a $100M+ ARR company motion.

**Q: What happens when the model is wrong?**
Every extraction surfaces its source clause with a direct quote and page reference. Customers are expected to verify high-stakes extractions before acting. We include a "confidence below threshold" flag on anything under 80% confidence. We do not claim the product eliminates legal review — we claim it eliminates the search problem.

**Q: Why Amazon? Why now?**
Amazon's AWS infrastructure, data security posture, and enterprise trust are genuine advantages in a legal data context. The LLM capabilities are now good enough to make clause extraction reliable rather than experimental. And the CLM market has been stagnant for a decade — no incumbent has moved to genuine AI extraction. The timing is right and the moat is buildable.

---

## Internal Notes

**What this FYI is NOT committing to:**

- Pricing and packaging are not final. Do not quote figures externally. Internal working assumption is $2–4 per contract per month for standard tier, volume discounts above 5,000 contracts — but this will change.
- Enterprise on-premise deployment is on the roadmap for Q4 2026 but is not a GA feature at launch. Do not promise it in sales conversations.
- International jurisdiction coverage beyond the 38 listed is in research — do not expand the claim.
- The model accuracy figures (94.2%, 91.7%) are internal eval results and have not been independently audited. Do not use these in external marketing without legal review.

**Decisions still outstanding:**

- Go-to-market motion: direct enterprise sales vs. AWS Marketplace vs. both. This has major cost-of-sales implications. Decision needed by June 1, 2026.
- OEM / API licensing for law firms and CLM vendors: do we sell the model as infrastructure? This is a separate business with a separate ICP — needs a dedicated decision.
- Brand: "ContractIQ" is a working name. Trademark search in progress. Do not put this name on any external materials until cleared.

**Questions? Contact:**

Priya Nair (CPO) · priya.nair@amazon.com
Marcus Teo (Legal, Product Counsel) · marcus.teo@amazon.com

`DISTRIBUTION: Executive team · Product leads · GTM leadership` `Not for external distribution · April 2026`
