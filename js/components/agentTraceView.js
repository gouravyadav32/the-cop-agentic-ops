/**
 * "The Cop" - Agent Trace View Component
 * Step-by-step visual execution map showing agent sensing inputs, decision calculations, drafting logic, and escalation triggers.
 */

window.AgentTraceView = (function() {

  let selectedSkuId = 'ELEC-902';

  function render(containerId, pipelineResults) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const results = pipelineResults ? pipelineResults.results : [];
    if (results.length === 0) return;

    // Ensure selected SKU exists
    let activeResult = results.find(r => r.skuId === selectedSkuId);
    if (!activeResult) {
      activeResult = results[0];
      selectedSkuId = activeResult.skuId;
    }

    el.innerHTML = `
      <div class="space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <i data-lucide="network" class="w-3.5 h-3.5"></i> Execution Telemetry
            </div>
            <h2 class="text-2xl font-bold text-white tracking-tight">Agent Reasoning Trace Graph</h2>
            <p class="text-slate-400 text-sm mt-1">Deep inspect how the multi-agent node pipeline sensed data, calculated safety stock math, and reached its decision.</p>
          </div>

          <!-- SKU Selector Dropdown -->
          <div class="flex items-center gap-3">
            <label class="text-xs text-slate-400 font-medium">Select SKU Trace:</label>
            <select id="select-sku-trace" class="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500 shadow-inner">
              ${results.map(r => `
                <option value="${r.skuId}" ${r.skuId === selectedSkuId ? 'selected' : ''}>
                  ${r.skuId} - ${r.skuName} (${r.metrics.riskTier} Risk)
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Node Execution Summary Bar -->
        <div class="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
              <i data-lucide="cpu" class="w-6 h-6"></i>
            </div>
            <div>
              <div class="text-lg font-bold text-white">${activeResult.skuId} - ${activeResult.skuName}</div>
              <div class="text-xs text-slate-400 mt-0.5">Evaluated At: ${new Date(activeResult.evaluatedAt).toLocaleTimeString()}</div>
            </div>
          </div>

          <div class="flex items-center gap-6 text-xs">
            <div>
              <div class="text-slate-400">Assigned Risk</div>
              <div class="font-bold font-mono text-sm ${getRiskColor(activeResult.metrics.riskTier)}">${activeResult.metrics.riskTier}</div>
            </div>
            <div>
              <div class="text-slate-400">Confidence</div>
              <div class="font-bold font-mono text-sm text-indigo-300">${activeResult.metrics.confidenceScore}%</div>
            </div>
            <div>
              <div class="text-slate-400">Stock Cover</div>
              <div class="font-bold font-mono text-sm text-rose-400">${activeResult.metrics.daysOfStockRemaining} days</div>
            </div>
          </div>
        </div>

        <!-- Node Step-by-Step Flow Chart -->
        <div class="space-y-6">
          ${activeResult.trace.map((node, index) => renderTraceNode(node, index, activeResult.trace.length)).join('')}
        </div>

      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Attach SKU select listener
    const selectElem = document.getElementById('select-sku-trace');
    if (selectElem) {
      selectElem.addEventListener('change', (e) => {
        selectedSkuId = e.target.value;
        render(containerId, pipelineResults);
      });
    }
  }

  function renderTraceNode(node, index, totalNodes) {
    const isLast = index === totalNodes - 1;

    let nodeBadgeClass = 'bg-blue-500/10 text-blue-300 border-blue-500/20';
    let nodeIcon = 'activity';

    if (node.stage === 'SENSE') {
      nodeBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      nodeIcon = 'radar';
    } else if (node.stage === 'DECIDE') {
      nodeBadgeClass = 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      nodeIcon = 'cpu';
    } else if (node.stage === 'DRAFT') {
      nodeBadgeClass = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      nodeIcon = 'file-text';
    } else if (node.stage === 'ESCALATE') {
      nodeBadgeClass = node.status === 'ESCALATED' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-slate-800 text-slate-300 border-slate-700';
      nodeIcon = 'user-check';
    }

    return `
      <div class="relative pl-8 pb-8 ${isLast ? '' : 'border-l-2 border-slate-800 ml-4'}">
        <!-- Node Bullet -->
        <div class="absolute -left-[17px] top-0 w-8 h-8 rounded-xl bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 shadow-lg">
          <i data-lucide="${nodeIcon}" class="w-4 h-4"></i>
        </div>

        <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-xl space-y-4 shadow-xl">
          
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div class="flex items-center gap-3">
              <span class="px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase border ${nodeBadgeClass}">
                ${node.stage}
              </span>
              <h4 class="text-base font-bold text-white">${node.title}</h4>
            </div>
            <span class="text-xs text-slate-400 font-mono">${node.timestamp}</span>
          </div>

          <!-- Bullet Logs -->
          <ul class="space-y-2 text-xs text-slate-300">
            ${node.details.map(d => `
              <li class="flex items-start gap-2">
                <span class="text-indigo-400 font-bold">›</span>
                <span>${d}</span>
              </li>
            `).join('')}
          </ul>

          <!-- Math Breakdown Card (if in DECIDE node) -->
          ${node.mathBreakdown ? `
            <div class="p-4 rounded-xl bg-slate-950 border border-indigo-950/80 text-xs space-y-2">
              <div class="text-xs font-bold text-indigo-300 font-mono">${node.mathBreakdown.formula}</div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                <div>Z-Score: <strong class="text-white">${node.mathBreakdown.Z}</strong> (${node.mathBreakdown.serviceLevelPct})</div>
                <div>Demand Var Term: <strong class="text-white">${node.mathBreakdown.demandVarianceTerm}</strong></div>
                <div>LeadTime Var Term: <strong class="text-white">${node.mathBreakdown.leadTimeVarianceTerm}</strong></div>
                <div>Safety Stock: <strong class="text-emerald-400 font-bold">${node.mathBreakdown.calculatedSafetyStock} units</strong></div>
              </div>
            </div>
          ` : ''}

          <!-- PO Draft Preview (if in DRAFT node) -->
          ${node.poDraft ? `
            <div class="p-4 rounded-xl bg-slate-950 border border-amber-950/60 text-xs space-y-2">
              <div class="flex justify-between font-mono font-bold text-amber-300">
                <span>DRAFT ${node.poDraft.poNumber}</span>
                <span>$${node.poDraft.totalCost.toLocaleString()}</span>
              </div>
              <div class="text-[11px] text-slate-400">
                Supplier: <strong class="text-white">${node.poDraft.supplierName}</strong> | Delivery Target: <strong class="text-white">${node.poDraft.expectedDeliveryDate}</strong>
              </div>
            </div>
          ` : ''}

        </div>
      </div>
    `;
  }

  function getRiskColor(risk) {
    if (risk === 'CRITICAL') return 'text-rose-400';
    if (risk === 'HIGH') return 'text-amber-400';
    if (risk === 'MEDIUM') return 'text-yellow-400';
    return 'text-emerald-400';
  }

  return { render };
})();
