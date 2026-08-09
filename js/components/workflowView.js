/**
 * "The Cop" - Workflow Comparison Component
 * Visualizes Legacy Human Loop vs Agentic Ops Loop and explains Human-in-the-Loop boundaries.
 */

window.WorkflowView = (function() {
  function render(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="space-y-8 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <i data-lucide="git-compare" class="w-3.5 h-3.5"></i> Workflow Transformation
            </div>
            <h2 class="text-2xl font-bold text-white tracking-tight">Reimagining Retail Operations</h2>
            <p class="text-slate-400 text-sm mt-1">From manual spreadsheet eyeball pulls to an autonomous, continuous sense-decide-draft agent system.</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live System Active
            </span>
          </div>
        </div>

        <!-- Side-by-Side Comparison Architecture -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- LEGACY HUMAN LOOP -->
          <div class="bg-gradient-to-b from-slate-900/80 to-slate-950/80 rounded-2xl border border-rose-900/30 p-6 shadow-2xl relative overflow-hidden group hover:border-rose-700/50 transition-all duration-300">
            <div class="absolute -right-12 -top-12 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-all"></div>
            
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold">
                  <i data-lucide="sheet" class="w-5 h-5"></i>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-slate-200">Current Legacy Loop</h3>
                  <p class="text-xs text-slate-400">Manual, Reactive & Fragile</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-mono">High Error Rate</span>
            </div>

            <!-- Legacy Flow Nodes -->
            <div class="space-y-4">
              <div class="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <div class="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">1</div>
                <div>
                  <h4 class="text-sm font-semibold text-slate-300">CSV Export & Eyeballing</h4>
                  <p class="text-xs text-slate-400 mt-0.5">Planner manually pulls sales CSVs every Monday, opens 15 tabs, and eyeball-scrolls 2,000 SKUs.</p>
                </div>
              </div>

              <div class="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <div class="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">2</div>
                <div>
                  <h4 class="text-sm font-semibold text-slate-300">Gut-Feel Safety Stock</h4>
                  <p class="text-xs text-slate-400 mt-0.5">Applies static 30-day moving average or gut-feel safety stock multiplier, missing lead time variance.</p>
                </div>
              </div>

              <div class="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <div class="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">3</div>
                <div>
                  <h4 class="text-sm font-semibold text-slate-300">Manual PO Creation in ERP</h4>
                  <p class="text-xs text-slate-400 mt-0.5">Copy-pastes order quantities into legacy ERP forms line-by-line; vulnerable to keying mistakes.</p>
                </div>
              </div>

              <div class="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <div class="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">4</div>
                <div>
                  <h4 class="text-sm font-semibold text-slate-300">Blind Spot on Long-Tail SKUs</h4>
                  <p class="text-xs text-slate-400 mt-0.5">Focuses only on Top 50 fast movers; long-tail SKUs stock out repeatedly or accumulate expensive overstock.</p>
                </div>
              </div>
            </div>

            <div class="mt-6 p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300">
              <span class="font-bold">Key Vulnerability:</span> Single point of failure. If the senior planner is sick or leaves, replenishment breaks.
            </div>
          </div>

          <!-- REIMAGINED AGENTIC SYSTEM -->
          <div class="bg-gradient-to-b from-slate-900/80 to-slate-950/80 rounded-2xl border border-indigo-500/30 p-6 shadow-2xl relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
            <div class="absolute -right-12 -top-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>

            <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                  <i data-lucide="bot" class="w-5 h-5"></i>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white">Reimagined Agentic Loop</h3>
                  <p class="text-xs text-indigo-400 font-medium">Sense → Decide → Draft → Escalate</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-mono">Autonomous + HITL</span>
            </div>

            <!-- Agent Flow Nodes -->
            <div class="space-y-4">
              <!-- Node 1: Sense -->
              <div class="flex items-start gap-4 p-4 rounded-xl bg-slate-900/70 border border-slate-800 group-hover:border-slate-700 transition-all">
                <div class="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                  <i data-lucide="radar" class="w-4 h-4"></i>
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-semibold text-emerald-300">1. SENSE (Continuous Sensor Ingestion)</h4>
                    <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Automated</span>
                  </div>
                  <p class="text-xs text-slate-300 mt-1">Real-time pipeline monitoring 30-day velocity, lead-time variance, supplier reliability, and stockout days.</p>
                </div>
              </div>

              <!-- Node 2: Decide -->
              <div class="flex items-start gap-4 p-4 rounded-xl bg-slate-900/70 border border-slate-800 group-hover:border-slate-700 transition-all">
                <div class="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                  <i data-lucide="cpu" class="w-4 h-4"></i>
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-semibold text-blue-300">2. DECIDE (Mathematical Reasoning Engine)</h4>
                    <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Math Model</span>
                  </div>
                  <p class="text-xs text-slate-300 mt-1">Calculates dynamic safety stock $SS = Z \\cdot \\sqrt{L \\sigma_d^2 + d^2 \\sigma_L^2}$, reorder point, risk tier & confidence score.</p>
                </div>
              </div>

              <!-- Node 3: Draft -->
              <div class="flex items-start gap-4 p-4 rounded-xl bg-slate-900/70 border border-slate-800 group-hover:border-slate-700 transition-all">
                <div class="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                  <i data-lucide="file-text" class="w-4 h-4"></i>
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-semibold text-amber-300">3. DRAFT (PO Formulation Queue)</h4>
                    <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Auto-Draft</span>
                  </div>
                  <p class="text-xs text-slate-300 mt-1">Generates complete PO line items, unit costs, delivery dates, and checks supplier minimum order quantities (MOQ).</p>
                </div>
              </div>

              <!-- Node 4: Escalate -->
              <div class="flex items-start gap-4 p-4 rounded-xl bg-slate-900/70 border border-purple-500/30 bg-purple-500/5 group-hover:border-purple-500/50 transition-all">
                <div class="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs shrink-0">
                  <i data-lucide="user-check" class="w-4 h-4"></i>
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-semibold text-purple-300">4. ESCALATE / HITL (Human-in-the-Loop)</h4>
                    <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">Human Control</span>
                  </div>
                  <p class="text-xs text-slate-300 mt-1">Low risk standard orders auto-queue; edge cases (spikes, lead time shifts, low confidence) route to planner with full reasoning.</p>
                </div>
              </div>
            </div>

            <div class="mt-6 p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-300 flex items-center justify-between">
              <div>
                <span class="font-bold">Human Touchpoint:</span> Planner acts as an editor/approver rather than a manual data puller.
              </div>
              <i data-lucide="shield-check" class="w-5 h-5 text-indigo-400 shrink-0"></i>
            </div>
          </div>

        </div>

        <!-- Human-in-the-Loop Boundary Matrix Card -->
        <div class="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
          <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <i data-lucide="sliders" class="w-5 h-5 text-indigo-400"></i>
            Human-in-the-Loop Boundary Principles
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div class="text-emerald-400 font-semibold text-sm mb-1 flex items-center gap-2">
                <i data-lucide="check-circle-2" class="w-4 h-4"></i> Autonomous Execution
              </div>
              <p class="text-xs text-slate-400">High confidence (>85%), standard reorders within budget cap (<$2,500), stable supplier lead times.</p>
            </div>

            <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div class="text-amber-400 font-semibold text-sm mb-1 flex items-center gap-2">
                <i data-lucide="alert-triangle" class="w-4 h-4"></i> Mandatory Escalation
              </div>
              <p class="text-xs text-slate-400">Demand spikes (>2x baseline), supplier lead-time changes, MOQ budget mismatches, long-tail SKU uncertainty.</p>
            </div>

            <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div class="text-indigo-400 font-semibold text-sm mb-1 flex items-center gap-2">
                <i data-lucide="history" class="w-4 h-4"></i> Feedback & Learning
              </div>
              <p class="text-xs text-slate-400">Every human override records explicit planner rationale, building an audit ledger and improving future agent confidence calibration.</p>
            </div>
          </div>
        </div>

      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  return { render };
})();
