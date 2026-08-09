/**
 * "The Cop" - Scenario Injector Component
 * Panel allowing live injection of realistic operational edge cases to demonstrate agent adaptation.
 */

window.ScenarioInjectorView = (function() {

  function render(containerId, onTriggerScenario) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <i data-lucide="zap" class="w-3.5 h-3.5"></i> Edge Case Testing Engine
            </div>
            <h2 class="text-2xl font-bold text-white tracking-tight">Interactive Scenario Injector</h2>
            <p class="text-slate-400 text-sm mt-1">Inject real-world operational disruptions and observe how the agent senses anomalies, recalculates safety stock, and escalates.</p>
          </div>
        </div>

        <!-- 4 Scenario Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Scenario 1: Demand Spike -->
          <div class="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl hover:border-rose-500/50 transition group flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  SCENARIO A
                </span>
                <span class="text-xs text-slate-400 font-mono">SKU: ELEC-902</span>
              </div>
              <h3 class="text-lg font-bold text-white group-hover:text-rose-300 transition">Viral Demand Spike (+350%)</h3>
              <p class="text-xs text-slate-400 mt-2">
                A viral social media campaign causes daily demand for SonicPro ANC Earbuds to jump from 22 u/day to 85 u/day in 48 hours.
              </p>
            </div>
            <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div class="text-[11px] text-slate-400">Agent Action: <strong class="text-rose-400">Surge Multiplier + Escalation</strong></div>
              <button id="btn-inject-spike" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-600/30 flex items-center gap-1.5">
                <i data-lucide="play" class="w-3.5 h-3.5"></i> Inject Spike
              </button>
            </div>
          </div>

          <!-- Scenario 2: Lead Time Disruption -->
          <div class="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl hover:border-amber-500/50 transition group flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SCENARIO B
                </span>
                <span class="text-xs text-slate-400 font-mono">SKU: APPR-104</span>
              </div>
              <h3 class="text-lg font-bold text-white group-hover:text-amber-300 transition">Supplier Lead-Time Shipping Delay</h3>
              <p class="text-xs text-slate-400 mt-2">
                Global shipping port congestion increases lead time for Australian Merino Wool Sweater from 7 days to 24 days with high variance (±6d).
              </p>
            </div>
            <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div class="text-[11px] text-slate-400">Agent Action: <strong class="text-amber-300">Safety Stock Expansion</strong></div>
              <button id="btn-inject-delay" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shadow-lg shadow-amber-600/30 flex items-center gap-1.5">
                <i data-lucide="play" class="w-3.5 h-3.5"></i> Inject Delay
              </button>
            </div>
          </div>

          <!-- Scenario 3: Long-Tail Lumpy SKU -->
          <div class="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl hover:border-purple-500/50 transition group flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  SCENARIO C
                </span>
                <span class="text-xs text-slate-400 font-mono">SKU: HOME-550</span>
              </div>
              <h3 class="text-lg font-bold text-white group-hover:text-purple-300 transition">Long-Tail Lumpy Demand Volatility</h3>
              <p class="text-xs text-slate-400 mt-2">
                Ergonomic Desk Mount experiences 0 sales for 6 days, followed by a sudden bulk B2B office purchase of 14 units.
              </p>
            </div>
            <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div class="text-[11px] text-slate-400">Agent Action: <strong class="text-purple-300">Confidence Score Downgrade</strong></div>
              <button id="btn-inject-lumpy" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/30 flex items-center gap-1.5">
                <i data-lucide="play" class="w-3.5 h-3.5"></i> Inject Lumpy
              </button>
            </div>
          </div>

          <!-- Scenario 4: Supplier MOQ Constraint -->
          <div class="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl hover:border-blue-500/50 transition group flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  SCENARIO D
                </span>
                <span class="text-xs text-slate-400 font-mono">SKU: COSM-301</span>
              </div>
              <h3 class="text-lg font-bold text-white group-hover:text-blue-300 transition">Supplier MOQ Financial Constraint</h3>
              <p class="text-xs text-slate-400 mt-2">
                Calculated reorder is 120 units, but French supplier requires a minimum order quantity of 500 units ($4,250 commitment).
              </p>
            </div>
            <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div class="text-[11px] text-slate-400">Agent Action: <strong class="text-blue-300">MOQ Bump + Cash Flag</strong></div>
              <button id="btn-inject-moq" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-600/30 flex items-center gap-1.5">
                <i data-lucide="play" class="w-3.5 h-3.5"></i> Inject MOQ
              </button>
            </div>
          </div>

        </div>

      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Attach Scenario Listeners
    document.getElementById('btn-inject-spike')?.addEventListener('click', () => {
      onTriggerScenario('DEMAND_SPIKE', 'ELEC-902');
    });

    document.getElementById('btn-inject-delay')?.addEventListener('click', () => {
      onTriggerScenario('SUPPLIER_DELAY', 'APPR-104');
    });

    document.getElementById('btn-inject-lumpy')?.addEventListener('click', () => {
      onTriggerScenario('LONG_TAIL_LUMPY', 'HOME-550');
    });

    document.getElementById('btn-inject-moq')?.addEventListener('click', () => {
      onTriggerScenario('MOQ_CONSTRAINT', 'COSM-301');
    });
  }

  return { render };
})();
