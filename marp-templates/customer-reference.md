---
marp: true
theme: sherpa-document
paginate: true
footer: 'Confidential — Internal Use Only'
---

<!-- _class: document-dark -->

<div class="doc-header-band">

# Meridian Financial Services
## Customer Story · Financial Data Infrastructure

<div class="pill-row">

`Fintech · Payments` `Data Reconciliation` `Enterprise`

</div>
</div>

---

## At a Glance

<div class="columns">
<div>

**Company Size**
3,200 employees · Series D · $180M ARR

**Industry**
Fintech — B2B Payments & Treasury Management

</div>
<div>

**Use Case**
Automated ledger reconciliation across 14 banking partners

**Time to Value**
11 days from contract to first automated reconciliation run

</div>
</div>

---

## The Challenge

Before deploying the platform, Meridian's reconciliation team was processing 2.1 million transactions per month across 14 banking partners using a patchwork of Excel macros, manual exports, and a legacy ETL tool built in 2017. The average month-end close took 9 business days — three of which were consumed by identifying and resolving mismatches.

At peak volume (Q4 2023), Meridian logged **847 reconciliation errors per month**, each requiring an average of 4.2 hours of analyst time to investigate and remediate. The CFO had flagged this as the single highest operational risk to their Series D close: auditors had cited reconciliation control gaps two years in a row.

---

## The Solution

Meridian's engineering team integrated the platform's data connector layer directly into their existing PostgreSQL transaction store and core banking middleware. No rip-and-replace — the platform ingested live feeds from all 14 banking partners via pre-built API connectors and began generating reconciliation reports within 72 hours of go-live.

<div class="columns">
<div>

**Capabilities deployed**

- Automated 4-way match across transaction IDs, timestamps, amounts, and counterparty identifiers
- Anomaly detection with configurable tolerance thresholds by partner and transaction type
- Real-time exception queue with analyst assignment and audit trail

</div>
<div>

**Integrations in use**

- Core banking: Temenos T24 (live feed)
- ERP: NetSuite (bi-directional sync)
- 14 banking partner APIs via pre-built connectors
- Slack alerting for exception queues over threshold

</div>
</div>

---

## The Results

**97.3%**
Reduction in reconciliation errors
*Within 60 days of go-live (from 847/mo to 23/mo)*

**6.5 days**
Faster month-end close
*From 9 business days to 2.5 — every quarter since Q1 2024*

**$2.1M**
Annual analyst time recovered
*14 FTE-months of manual reconciliation work automated per year*

**Zero**
Audit citations in 2024
*First clean internal audit in three years; Series D closed on schedule*

---

## In Their Words

> "We'd been told for years that reconciliation at our transaction volume was inherently messy — that errors were the cost of operating across 14 banking relationships. That turned out to be wrong. Within 60 days of go-live, our error rate dropped to near zero and our month-end close shrank by almost a week. The auditors who'd flagged us two years running had no findings in 2024. That's not an incremental improvement — it's a different operational reality. I wish we'd done this two years earlier."

**— Rachel Osei, VP of Finance Operations, Meridian Financial Services**

---

## Why They Chose Us

<div class="columns">
<div>

**What they evaluated**
Meridian ran a structured 90-day evaluation against two legacy reconciliation vendors (ReconSoft Enterprise, Trintech Cadency) and one in-house build option. Evaluation criteria: time to value, banking partner connector coverage, exception workflow configurability, and audit trail completeness.

</div>
<div>

**Why they chose us over alternatives**

- **Connector coverage:** Pre-built connectors for 12 of their 14 banking partners; remaining 2 built during onboarding. Competitors covered 7 and 9 respectively.
- **Audit trail depth:** Full immutable transaction-level audit log with hash verification — a hard requirement from their external auditors that competitors couldn't satisfy.
- **Implementation speed:** 11-day time to first automated run vs. 60-day estimates from both legacy vendors.

</div>
</div>

---

## The Details

| | |
|---|---|
| **Products used** | Reconciliation Engine · Anomaly Detection · Exception Workflow · Audit Logger |
| **Integrations** | Temenos T24, NetSuite, 14 banking partner APIs, Slack |
| **Users** | 38 finance and reconciliation analysts; 4 engineering owners |
| **Deployment model** | Cloud (AWS us-east-1) · Single-tenant · SOC 2 Type II compliant |
| **Contract start** | February 2024 |

<br>

`APPROVED FOR EXTERNAL USE` `Last updated: April 2026` `Sales contact: enterprise@yourcompany.com`
