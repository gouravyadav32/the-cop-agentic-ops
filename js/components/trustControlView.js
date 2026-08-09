/**
 * "The Cop" - Trust & Control Layer Component
 * Core HITL interface allowing planners to inspect agent math, override recommendations, record feedback, and track audit history.
 */

window.TrustControlView = (function() {

  let auditTrail = [
    {
      id: 'AUD-901',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
      skuId: 'ELEC-105',
      skuName: 'UltraSlim USB-C 10-in-1 Hub',
      action: 'APPROVED_BY_PLANNER',
      agentQty: 150,
      finalQty: 150,
      reason: 'Standard weekly replenishment approved without modification.',
      planner: 'Alex Chen (Senior Ops Planner)'
    }
  ];

  function render(containerId, pipelineResults, onStateChange) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const escalations = pipelineResults ? pipelineResults.escalations : [];
    const autoDrafts = pipelineResults ? pipelineResults.autoDrafts : [];

    el.innerHTML = `
      <div class="space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Trust & Control Center
            </div>
            <h2 class="text-2xl font-bold text-white tracking-tight">Human-in-the-Loop Oversight</h2>
            <p class="text-slate-400 text-sm mt-1">Inspect agent mathematical proofs, override order parameters, log decisions, and audit history.</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono font-semibold">
              ${escalations.length} Pending Review
            </span>
          </div>
        </div>

        <!-- Main Layout: Escalation Queue (Left 2/3) + Audit Ledger (Right 1/3) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Pending Escalation Cards (Left 2 cols) -->
          <div class="lg:col-span-2 space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <i data-lucide="alert-circle" class="w-5 h-5 text-purple-400"></i> Escalated Action Items (${escalations.length})
              </h3>
              <span class="text-xs text-slate-400">Sorted by urgency & risk tier</span>
            </div>

            ${escalations.length === 0 ? `
              <div class="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 backdrop-blur-xl">
                <div class="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <i data-lucide="check-circle" class="w-6 h-6"></i>
                </div>
                <h4 class="text-lg font-bold text-white">Escalation Queue Clear!</h4>
                <p class="text-slate-400 text-xs mt-1">All agent proposals are within safe autonomous bounds or have been reviewed.</p>
              </div>
            ` : `
              <div class="space-y-6" id="escalation-cards-container">
                ${escalations.map(esc => renderEscalationCard(esc)).join('')}
              </div>
            `}
          </div>

          <!-- Audit Ledger & Decision Log (Right 1 col) -->
          <div class="space-y-6">
            <div class="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl sticky top-24">
              <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <h3 class="text-base font-bold text-white flex items-center gap-2">
                  <i data-lucide="history" class="w-4 h-4 text-indigo-400"></i> Decision Audit Ledger
                </h3>
                <span class="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">Immutable</span>
              </div>
              <p class="text-xs text-slate-400 mb-4">Historical record of agent recommendations vs planner modifications.</p>

              <div class="space-y-4 max-h-[500px] overflow-y-auto pr-1" id="audit-trail-list">
                ${auditTrail.map(log => `
                  <div class="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                    <div class="flex items-center justify-between text-slate-400 text-[11px]">
                      <span class="font-mono font-semibold text-slate-300">${log.id}</span>
                      <span>${log.timestamp}</span>
                    </div>
                    <div class="font-bold text-white">${log.skuId} - ${log.skuName}</div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getAuditActionBadgeClass(log.action)}">
                        ${log.action.replace(/_/g, ' ')}
                      </span>
                      <span class="text-slate-400">Qty: <strong class="text-white">${log.agentQty}</strong> → <strong class="text-emerald-400">${log.finalQty}</strong></span>
                    </div>
                    <p class="text-[11px] text-slate-400 italic bg-slate-900 p-2 rounded border border-slate-800/80">
                      "${log.reason}"
                    </p>
                    <div class="text-[10px] text-slate-400 text-right">By: ${log.planner}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Attach card event listeners
    escalations.forEach(esc => {
      // Toggle Math Breakdown Drawer
      const btnToggleMath = document.getElementById(`btn-toggle-math-${esc.id}`);
      const mathDrawer = document.getElementById(`math-drawer-${esc.id}`);
      if (btnToggleMath && mathDrawer) {
        btnToggleMath.addEventListener('click', () => {
          mathDrawer.classList.toggle('hidden');
        });
      }

      // Quantity Slider Sync
      const qtyInput = document.getElementById(`input-qty-${esc.id}`);
      const qtyValDisplay = document.getElementById(`qty-val-display-${esc.id}`);
      if (qtyInput && qtyValDisplay) {
        qtyInput.addEventListener('input', (e) => {
          qtyValDisplay.textContent = e.target.value;
          // recalculate cost estimate
          const costElem = document.getElementById(`est-cost-${esc.id}`);
          if (costElem) {
            const unitCost = esc.poDraft.unitCost;
            costElem.textContent = '$' + (Number(e.target.value) * unitCost).toLocaleString();
          }
        });
      }

      // Approve Button
      const btnApprove = document.getElementById(`btn-approve-${esc.id}`);
      if (btnApprove) {
        btnApprove.addEventListener('click', () => {
          const customQty = parseInt(qtyInput ? qtyInput.value : esc.poDraft.quantity);
          const customReason = document.getElementById(`input-reason-${esc.id}`)?.value || 'Approved agent recommendation.';
          
          handleDecision(esc, 'APPROVED_BY_PLANNER', customQty, customReason, pipelineResults, onStateChange);
        });
      }

      // Modify & Approve Button
      const btnModify = document.getElementById(`btn-modify-${esc.id}`);
      if (btnModify) {
        btnModify.addEventListener('click', () => {
          const customQty = parseInt(qtyInput ? qtyInput.value : esc.poDraft.quantity);
          const customReason = document.getElementById(`input-reason-${esc.id}`)?.value || 'Modified order parameters based on market context.';
          
          handleDecision(esc, 'MODIFIED_BY_PLANNER', customQty, customReason, pipelineResults, onStateChange);
        });
      }

      // Reject Button
      const btnReject = document.getElementById(`btn-reject-${esc.id}`);
      if (btnReject) {
        btnReject.addEventListener('click', () => {
          const customReason = document.getElementById(`input-reason-${esc.id}`)?.value || 'Rejected agent reorder recommendation.';
          
          handleDecision(esc, 'REJECTED_BY_PLANNER', 0, customReason, pipelineResults, onStateChange);
        });
      }
    });
  }

  function renderEscalationCard(esc) {
    const riskBadge = esc.riskTier === 'CRITICAL' 
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
      : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

    return `
      <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-xl space-y-6" id="card-${esc.id}">
        
        <!-- Card Top Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase border ${riskBadge}">
                ${esc.riskTier} RISK
              </span>
              <span class="text-xs text-slate-400">SKU: <strong class="text-white">${esc.skuId}</strong></span>
              <span class="text-xs text-slate-400 font-mono">(${esc.category})</span>
            </div>
            <h4 class="text-xl font-bold text-white mt-1">${esc.skuName}</h4>
          </div>
          <div class="text-right">
            <div class="text-xs text-slate-400">Agent Confidence</div>
            <div class="text-xl font-extrabold text-indigo-400 font-mono">${esc.confidenceScore}%</div>
          </div>
        </div>

        <!-- Escalation Reasons Bullet Box -->
        <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div class="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <i data-lucide="shield-alert" class="w-4 h-4 text-amber-400"></i> Why Did The Agent Escalate This?
          </div>
          <ul class="space-y-1 text-xs text-slate-300 pl-1">
            ${esc.reasons.map(r => `<li class="flex items-start gap-2"><span class="text-amber-400 font-bold">•</span> <span>${r}</span></li>`).join('')}
          </ul>
        </div>

        <!-- Sensing Telemetry Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div class="text-slate-400">Current Stock</div>
            <div class="text-sm font-bold text-white mt-0.5">${esc.sensingSnapshot.currentStock} units</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div class="text-slate-400">Stock Cover</div>
            <div class="text-sm font-bold text-rose-400 mt-0.5">${esc.sensingSnapshot.daysOfStockRemaining} days left</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div class="text-slate-400">Lead Time</div>
            <div class="text-sm font-bold text-amber-300 mt-0.5">${esc.sensingSnapshot.leadTimeDays} days (±${esc.sensingSnapshot.leadTimeVarianceDays}d)</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div class="text-slate-400">Velocity Ratio</div>
            <div class="text-sm font-bold text-emerald-400 mt-0.5">${esc.sensingSnapshot.velocityRatio}x baseline</div>
          </div>
        </div>

        <!-- Explainability / Math Proof Toggle -->
        <div>
          <button id="btn-toggle-math-${esc.id}" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition">
            <i data-lucide="calculator" class="w-4 h-4"></i> View Mathematical Formula & Reasoning Proof ↓
          </button>
          
          <div id="math-drawer-${esc.id}" class="hidden mt-3 p-4 rounded-xl bg-slate-950 border border-indigo-950 text-xs space-y-3">
            <div class="font-mono text-indigo-300 font-bold">${esc.mathFormulaText}</div>
            <div class="grid grid-cols-2 gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-900">
              <div>Calculated Safety Stock (SS): <strong class="text-white">${esc.sensingSnapshot.safetyStock} units</strong></div>
              <div>Calculated Reorder Point (ROP): <strong class="text-white">${esc.sensingSnapshot.reorderPoint} units</strong></div>
              <div>30-Day Avg Demand (d): <strong class="text-white">${esc.sensingSnapshot.d_avg} u/day</strong></div>
              <div>7-Day Recent Velocity (d_7): <strong class="text-white">${esc.sensingSnapshot.d_7day} u/day</strong></div>
            </div>
          </div>
        </div>

        <!-- Interactive Planner Override Controls -->
        <div class="p-5 rounded-xl bg-slate-950/80 border border-indigo-500/20 space-y-4">
          <div class="flex items-center justify-between">
            <h5 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <i data-lucide="sliders-horizontal" class="w-4 h-4 text-indigo-400"></i> Planner Control Panel & Overrides
            </h5>
            <span class="text-[11px] text-slate-400">Adjust parameters before sign-off</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Order Quantity Slider -->
            <div>
              <div class="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Order Quantity (Units):</span>
                <span class="font-bold text-indigo-400 font-mono text-sm" id="qty-val-display-${esc.id}">${esc.poDraft.quantity}</span>
              </div>
              <input 
                type="range" 
                id="input-qty-${esc.id}" 
                min="0" 
                max="${Math.max(500, esc.poDraft.quantity * 2.5)}" 
                step="10" 
                value="${esc.poDraft.quantity}"
                class="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div class="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Agent Rec: ${esc.poDraft.calculatedQuantity} u</span>
                <span>Est. Cost: <strong class="text-emerald-400" id="est-cost-${esc.id}">$${esc.poDraft.totalCost.toLocaleString()}</strong></span>
              </div>
            </div>

            <!-- Planner Decision Rationale / Feedback Input -->
            <div>
              <label class="block text-xs text-slate-300 mb-1.5">Planner Decision Reason (Feedback Record):</label>
              <input 
                type="text" 
                id="input-reason-${esc.id}"
                placeholder="e.g. Approved rush shipment, promo extended, vendor confirmed delivery..." 
                class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-900">
            <button id="btn-reject-${esc.id}" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 text-xs font-semibold transition border border-slate-700">
              Reject / Dismiss PO
            </button>

            <button id="btn-modify-${esc.id}" class="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold transition border border-amber-500/30">
              Modify & Approve
            </button>

            <button id="btn-approve-${esc.id}" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5">
              <i data-lucide="check" class="w-4 h-4"></i> Approve Agent Recommendation
            </button>
          </div>

        </div>

      </div>
    `;
  }

  function handleDecision(esc, action, finalQty, reason, pipelineResults, onStateChange) {
    // Add to audit trail
    const auditItem = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      skuId: esc.skuId,
      skuName: esc.skuName,
      action: action,
      agentQty: esc.poDraft.quantity,
      finalQty: finalQty,
      reason: reason,
      planner: 'Alex Chen (Senior Ops Planner)'
    };

    auditTrail.unshift(auditItem);

    // Remove escalation from pipeline results active list
    if (pipelineResults && pipelineResults.escalations) {
      const idx = pipelineResults.escalations.findIndex(e => e.id === esc.id);
      if (idx !== -1) {
        pipelineResults.escalations.splice(idx, 1);
      }
    }

    // Trigger state refresh
    if (onStateChange) {
      onStateChange();
    }
  }

  function getAuditActionBadgeClass(action) {
    if (action === 'APPROVED_BY_PLANNER') return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    if (action === 'MODIFIED_BY_PLANNER') return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
  }

  return { render };
})();
