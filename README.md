# The Cop - Agentic Ops Demand Planning & Replenishment System

> **Case 02 Submission Package**: Autonomous, transparent, and controllable AI agent ops system for omnichannel retail inventory replenishment.

---

## 📌 Executive Summary & The Problem

A mid-market omnichannel retailer currently runs demand planning in spreadsheets and legacy ERP screens. A human planner manually pulls sales history, eyeballs trends, and key-enters purchase orders once a week. 

**The Core Vulnerabilities of the Legacy Loop**:
1. **Slow & Reactive**: Weekly batching misses sudden viral demand spikes and supplier shipping delays.
2. **Long-Tail Stockouts**: Human planners focus 90% of their attention on Top 50 fast movers, leading to frequent stockouts or expensive overstock on long-tail SKUs.
3. **Single Point of Failure**: System reliance on gut-feel heuristics stored in one planner's head.

**The Solution ("The Cop")**:
"The Cop" reimagines retail operations as an autonomous, continuous **Sense $\rightarrow$ Decide $\rightarrow$ Draft $\rightarrow$ Escalate** agentic pipeline. It automates standard replenishment while providing a **Trust & Control Layer** where human planners remain in control of high-risk anomalies.

---

## 🔄 1. Reimagined Workflow Transformation

```
                               ┌─────────────────────────────┐
                               │     MULTI-WEEK DATASET      │
                               │  Sales, Inventory, Suppliers│
                               └──────────────┬──────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────┐
                               │   SENSE: Sensor Pipeline    │
                               │ Sales velocity, Lead time,  │
                               │ Stockouts, Spikes, Variance │
                               └──────────────┬──────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────┐
                               │   DECIDE: Reasoning Engine  │
                               │ Dynamic SS, Reorder Point,  │
                               │ Risk & Confidence Scoring   │
                               └──────────────┬──────────────┘
                                              │
                         ┌────────────────────┴────────────────────┐
                         ▼                                         ▼
           [High Confidence / Low Risk]             [Edge Case / High Risk Trigger]
                         │                                         │
                         ▼                                         ▼
            ┌─────────────────────────┐               ┌─────────────────────────┐
            │   DRAFT: Auto PO Queue  │               │   ESCALATE: HITL Queue  │
            │ Auto-generated PO Draft │               │ Visible Reasoning, Math │
            └─────────────────────────┘               │ Math Trace & Risk Cause │
                                                      └────────────┬────────────┘
                                                                   │
                                                                   ▼
                                                      ┌─────────────────────────┐
                                                      │  TRUST & CONTROL LAYER  │
                                                      │ Human Approve / Modify  │
                                                      │ Feedback & Audit Trail  │
                                                      └─────────────────────────┘
```

### Where Does the Human Stay in the Loop and Why?

The agent does **not** replace the human planner; it shifts the planner's role from a **manual data puller** to an **editor and decision approver**.

| Stage | Autonomous Agent Action | Human-in-the-Loop (HITL) Boundary |
| :--- | :--- | :--- |
| **SENSE** | Continuous daily ingestion of sales velocity, lead-time variance, and stock levels. | None (100% automated sensing). |
| **DECIDE** | Calculates mathematical safety stock, reorder point, risk tier, and confidence score. | Planner sets global Target Service Levels ($90\%, 95\%, 99\%$). |
| **DRAFT** | Auto-formulates PO line items, unit costs, delivery dates, and MOQ adjustments. | Low-risk POs (<$2,500) auto-queue; high-value or MOQ-adjusted POs flag for human review. |
| **ESCALATE** | Detects anomalies (demand spikes >2x, lead-time shifts >3d, low confidence). | **Mandatory Human Sign-Off**: Planner can approve, modify order quantity, or reject PO. |

---

## 🧮 2. Mathematical Reasoning Engine

The core decision engine uses stochastic safety stock formulas accounting for both **demand uncertainty** ($\sigma_d$) and **lead-time volatility** ($\sigma_L$):

$$\text{Safety Stock } (SS) = Z \times \sqrt{ L \cdot \sigma_d^2 + d^2 \cdot \sigma_L^2 }$$

$$\text{Reorder Point } (ROP) = (d_{\text{effective}} \times L) + SS$$

Where:
- $Z$: Service level factor ($Z = 1.65$ for 95% service level).
- $L$: Effective supplier lead time in days.
- $\sigma_d$: Standard deviation of daily sales demand over 30 days.
- $\sigma_L$: Standard deviation of supplier lead time variance.
- $d_{\text{effective}}$: Dynamic daily demand rate (switches to 7-day velocity during demand surges).

---

## 🛡️ 3. Trust & Control Layer (Planner Oversight)

The Trust & Control Layer is the core interface designed to earn planner trust:
1. **Mathematical Proof & Explainability**: Every escalation card displays the exact formula variables, sensor snapshot, and risk factors.
2. **Interactive Overrides**:
   - **Order Quantity Slider**: Planners can adjust purchase order quantities visually.
   - **Feedback Logging**: Captures explicit planner rationale ("Vendor agreed to rush air-freight", "Mitigating competitor promo").
3. **Immutable Decision Ledger**: Keeps a full audit trail of agent recommendations vs human modifications over time.

---

## ⚡ 4. Operational Edge Cases Demonstrated

The application includes an **Interactive Scenario Injector** to test 4 real-world operational disruptions live:

1. **Viral Demand Spike (+350%)** (`ELEC-902` Wireless Earbuds):
   - Sudden jump from 22 u/day to 85 u/day in 48 hours.
   - *Agent Reaction*: Switches to 7-day surge velocity, recalculates ROP with surge multiplier, flags High Risk, and escalates to HITL queue.
2. **Supplier Lead-Time Shipping Delay** (`APPR-104` Merino Wool Sweater):
   - Red Sea port congestion extends lead time from 7 days to 24 days ($\sigma_L = 6.0\text{d}$).
   - *Agent Reaction*: Dynamic safety stock expands to cover lead-time variance; stockout days remaining turns red.
3. **Long-Tail Lumpy Demand Volatility** (`HOME-550` Ergonomic Desk Arm):
   - Sporadic demand (0 sales for 6 days, followed by 14-unit B2B order).
   - *Agent Reaction*: Detects high coefficient of variation ($C_v > 1.0$) and downgrades agent confidence score to 70%.
4. **Supplier MOQ Financial Constraint** (`COSM-301` Botanical Serum):
   - Reorder math calls for 120 units, but supplier MOQ requires 500 units ($4,250 commitment).
   - *Agent Reaction*: Automatically bumps PO quantity to MOQ and triggers a cash outlay escalation flag.

---

## ⚠️ 5. Honest System Limitations & Production Readiness

### Where Would This Fail at 50,000 SKUs?
1. **In-Memory Sequential Execution**: Evaluating 50,000 SKUs in a single synchronous loop will lock the main thread. Production requires an event-driven distributed worker pipeline (Celery / Kafka / Redis Streams).
2. **ERP Read Lock Contention**: Direct real-time polling of legacy ERP SQL databases during peak store hours causes deadlocks. Production requires Change Data Capture (Debezium / Snowflake read-replica).
3. **LLM Cost & Latency Blowout**: Calling LLMs for every SKU adds 2-second API latency and thousands in daily costs. Production uses deterministic math for 90% of SKUs and invokes LLMs only for escalated natural language supplier communications.

### What We Would NEVER Ship As-Is
- **Uncapped Autonomous PO Dispatch**: Allowing an agent to place un-reviewed orders above $2,500 without dual human approval.
- **Uncalibrated Model Confidence**: Presenting confidence scores without empirical back-testing against actual historical stockouts.

---

## 📹 6. Loom Video Script Outline (3-5 Minutes)

- **[0:00 - 0:45] Intro & Problem Statement**: Show Legacy Workflow vs Reimagined Agentic Workflow. Explain why human spreadsheet loops fail at long-tail SKUs.
- **[0:45 - 1:45] Live System Demo**: Walk through the Operations Dashboard, 30-day demand velocity chart, and the SKU Master Table.
- **[1:45 - 3:00] Trust & Control Layer & Edge Case Injection**:
  - Click **Inject Viral Demand Spike** (+350%).
  - Show how the agent detects the anomaly, calculates dynamic safety stock math, and escalates to the HITL queue.
  - Demonstrate planner override slider and feedback log.
- **[3:00 - 4:00] Honest Limitations & Conclusion**: Review scale constraints at 50,000 SKUs and production architecture.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)

### Steps
1. Clone repository:
   ```bash
   git clone d:\github\The_Cop
   cd The_Cop
   ```
2. Start local development server:
   ```bash
   node server.js
   ```
3. Open browser at `http://localhost:3000`.
