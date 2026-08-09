/**
 * "The Cop" - Limitations & Production Report Component
 * Honest breakdown of failure modes at 50,000 SKUs, mocked assumptions, and production readiness gaps.
 */

window.LimitationsView = (function() {

  function render(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <i data-lucide="shield-alert" class="w-3.5 h-3.5"></i> Production Reality Check
            </div>
            <h2 class="text-2xl font-bold text-white tracking-tight">Honest System Limitations & Trade-offs</h2>
            <p class="text-slate-400 text-sm mt-1">Critical evaluation of failure modes at 50,000 SKUs, mocked architectural boundaries, and unship-as-is risks.</p>
          </div>
        </div>

        <!-- Section 1: Where Would This Fail at 50,000 SKUs? -->
        <div class="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl space-y-6">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <i data-lucide="server-off" class="w-5 h-5 text-rose-400"></i>
            1. Failure Modes at Real Production Scale (50,000 SKUs)
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div class="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div class="text-rose-400 font-bold text-sm flex items-center gap-2">
                <i data-lucide="clock" class="w-4 h-4"></i> Synchronous Ingestion Bottleneck
              </div>
              <p class="text-xs text-slate-300">
                Evaluating 50,000 SKUs sequentially in-memory would lock the main thread. Production requires distributed event-driven streams (Kafka / Redis Streams) with micro-batch worker pools.
              </p>
            </div>

            <div class="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div class="text-amber-400 font-bold text-sm flex items-center gap-2">
                <i data-lucide="database" class="w-4 h-4"></i> ERP Database Lock Contention
              </div>
              <p class="text-xs text-slate-300">
                Polling legacy SAP or NetSuite ERP tables directly during peak store hours causes deadlocks. Production needs Change Data Capture (Debezium / Snowflake read-replica).
              </p>
            </div>

            <div class="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div class="text-purple-400 font-bold text-sm flex items-center gap-2">
                <i data-lucide="cpu" class="w-4 h-4"></i> LLM Latency & Cost Blowout
              </div>
              <p class="text-xs text-slate-300">
                Calling LLMs per SKU would cost thousands of dollars daily and add 2-second API latency. Solution: Use deterministic Z-score math first; invoke LLM only on escalated anomaly cards.
              </p>
            </div>

          </div>
        </div>

        <!-- Section 2: What We Mocked vs What Production Needs -->
        <div class="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl space-y-6">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <i data-lucide="layers" class="w-5 h-5 text-indigo-400"></i>
            2. Mocked Boundaries vs Production Requirements
          </h3>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950 text-slate-400 font-mono uppercase border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Dimension</th>
                  <th class="py-3 px-4 text-amber-300">Prototype Mocking</th>
                  <th class="py-3 px-4 text-emerald-400">Production Requirement</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                <tr>
                  <td class="py-3 px-4 font-bold text-white">Sales & Inventory Data</td>
                  <td class="py-3 px-4 text-slate-400">Synthesized 30-day array in 'data.js'</td>
                  <td class="py-3 px-4 text-slate-300">Real-time webhooks from Shopify, ERP & POS terminals</td>
                </tr>
                <tr>
                  <td class="py-3 px-4 font-bold text-white">Supplier Lead Time</td>
                  <td class="py-3 px-4 text-slate-400">Static integer with manual scenario overrides</td>
                  <td class="py-3 px-4 text-slate-300">Automated EDI / Port tracking (FourKites / Project44 APIs)</td>
                </tr>
                <tr>
                  <td class="py-3 px-4 font-bold text-white">Human Override Storage</td>
                  <td class="py-3 px-4 text-slate-400">In-memory JS audit trail array</td>
                  <td class="py-3 px-4 text-slate-300">PostgreSQL audit ledger with cryptographic signature & RBAC</td>
                </tr>
                <tr>
                  <td class="py-3 px-4 font-bold text-white">Promotion Context</td>
                  <td class="py-3 px-4 text-slate-400">Inferred from demand velocity spike ratio</td>
                  <td class="py-3 px-4 text-slate-300">Bi-directional integration with Marketing promo calendar (Klaviyo)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 3: What We Would NEVER Ship As-Is -->
        <div class="bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-900/80 p-6 rounded-2xl border border-rose-900/40 backdrop-blur-xl space-y-4">
          <h3 class="text-lg font-bold text-rose-300 flex items-center gap-2">
            <i data-lucide="x-circle" class="w-5 h-5 text-rose-400"></i>
            3. What We Would NEVER Ship As-Is to Production
          </h3>
          <ul class="space-y-3 text-xs text-slate-300">
            <li class="flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
              <div>
                <strong class="text-white">Uncapped Autonomous Purchase Orders:</strong> Never allow an AI agent to dispatch un-reviewed POs above a cash limit ($2,500) without multi-party dual approval.
              </div>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
              <div>
                <strong class="text-white">Uncalibrated Model Confidence:</strong> Never present confidence scores (e.g. "95%") without empirical back-testing against actual historical stockout outcomes.
              </div>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
              <div>
                <strong class="text-white">Zero Feedback Loop Calibration:</strong> Never drop human override feedback into an un-monitored log. Override reasons must retrain safety stock variance coefficients weekly.
              </div>
            </li>
          </ul>
        </div>

      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  return { render };
})();
