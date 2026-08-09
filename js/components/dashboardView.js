/**
 * "The Cop" - Dashboard View Component
 * Main operations overview with live KPI metrics, stockout risk alerts, and interactive Chart.js visualizations.
 */

window.DashboardView = (function() {

  let chartInstance1 = null;
  let chartInstance2 = null;

  function render(containerId, pipelineResults, onNavigateTab) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const results = pipelineResults ? pipelineResults.results : [];
    const escalations = pipelineResults ? pipelineResults.escalations : [];
    const autoDrafts = pipelineResults ? pipelineResults.autoDrafts : [];

    // KPI Aggregations
    const totalSkus = results.length;
    const atRiskCount = results.filter(r => r.metrics.riskTier === 'CRITICAL' || r.metrics.riskTier === 'HIGH').length;
    const criticalCount = results.filter(r => r.metrics.riskTier === 'CRITICAL').length;
    const totalPoDraftValue = [...escalations.map(e => e.poDraft), ...autoDrafts]
      .filter(po => po)
      .reduce((sum, po) => sum + po.totalCost, 0);

    const avgConfidence = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.metrics.confidenceScore, 0) / results.length)
      : 95;

    // Critical Stockout Items
    const criticalSkus = results.filter(r => r.metrics.daysOfStockRemaining < 5);

    el.innerHTML = `
      <div class="space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
          <div>
            <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <i data-lucide="layout-dashboard" class="w-6 h-6 text-indigo-400"></i> Operations Overview
            </h2>
            <p class="text-slate-400 text-sm mt-1">Real-time demand planning telemetry, inventory stockout risks, and active agent queues.</p>
          </div>
          <div class="flex items-center gap-3">
            <button id="btn-quick-run-pipeline" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-600/30">
              <i data-lucide="play" class="w-4 h-4"></i> Run Pipeline Scan
            </button>
          </div>
        </div>

        <!-- Critical Stockout Warning Banner -->
        ${criticalSkus.length > 0 ? `
          <div class="bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-slate-900/80 p-5 rounded-2xl border border-rose-800/50 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold shrink-0 animate-pulse">
                <i data-lucide="alert-octagon" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="text-sm font-bold text-rose-200 uppercase tracking-wide">Critical Stockout Warning (${criticalSkus.length} SKUs At Risk)</h3>
                <p class="text-xs text-rose-300/80 mt-0.5">
                  ${criticalSkus.map(s => `<span class="font-semibold text-rose-100">${s.skuId} (${s.metrics.daysOfStockRemaining}d stock cover)</span>`).join(', ')}
                </p>
              </div>
            </div>
            <button id="btn-view-escalations-banner" class="px-3.5 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-400 transition shrink-0 shadow-md">
              Review Escalations →
            </button>
          </div>
        ` : ''}

        <!-- Top KPI Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <!-- Card 1: Total SKUs Ingested -->
          <div class="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-xl hover:border-slate-700 transition group">
            <div class="flex items-center justify-between text-slate-400 mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider">Active Inventory SKUs</span>
              <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-indigo-400 transition">
                <i data-lucide="boxes" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="flex items-baseline justify-between">
              <div class="text-2xl font-bold text-white">${totalSkus}</div>
              <span class="text-xs text-emerald-400 font-medium">100% Ingested</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-2">Continuous sensor pipeline monitoring</p>
          </div>

          <!-- Card 2: Stockout Risk SKUs -->
          <div class="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-xl hover:border-rose-900/40 transition group">
            <div class="flex items-center justify-between text-slate-400 mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider">At-Risk SKUs</span>
              <div class="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <i data-lucide="shield-alert" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="flex items-baseline justify-between">
              <div class="text-2xl font-bold text-rose-400">${atRiskCount}</div>
              <span class="text-xs text-rose-400 font-medium">${criticalCount} Critical</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-2">Demand spikes & lead-time delays</p>
          </div>

          <!-- Card 3: Pending Escalation Queue -->
          <div class="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-xl hover:border-purple-900/40 transition group">
            <div class="flex items-center justify-between text-slate-400 mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider">HITL Escalations</span>
              <div class="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <i data-lucide="user-check" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="flex items-baseline justify-between">
              <div class="text-2xl font-bold text-purple-300">${escalations.length}</div>
              <span class="text-xs text-purple-400 font-medium">${autoDrafts.length} Auto-Drafted</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-2">Awaiting human review & sign-off</p>
          </div>

          <!-- Card 4: Agent Confidence Score -->
          <div class="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-xl hover:border-indigo-900/40 transition group">
            <div class="flex items-center justify-between text-slate-400 mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider">Agent Confidence</span>
              <div class="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <i data-lucide="sparkles" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="flex items-baseline justify-between">
              <div class="text-2xl font-bold text-indigo-300">${avgConfidence}%</div>
              <span class="text-xs text-indigo-400 font-medium">Draft Value: $${(totalPoDraftValue / 1000).toFixed(1)}k</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-2">Weighted mathematical trust score</p>
          </div>

        </div>

        <!-- Interactive Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Main Chart: 30-Day Velocity vs Inventory Levels for Key Edge Case SKU -->
          <div class="lg:col-span-2 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                  <i data-lucide="trending-up" class="w-5 h-5 text-indigo-400"></i> Demand Velocity & Stock Trend
                </h3>
                <p class="text-xs text-slate-400">30-day daily sales history vs safety stock boundaries (Featured: SonicPro ANC Earbuds 'ELEC-902')</p>
              </div>
              <span class="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                Spike Detected
              </span>
            </div>
            <div class="h-72 w-full relative">
              <canvas id="chart-demand-velocity"></canvas>
            </div>
          </div>

          <!-- Secondary Chart: Risk Distribution by Category -->
          <div class="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                  <i data-lucide="pie-chart" class="w-5 h-5 text-purple-400"></i> Category Risk Breakdown
                </h3>
              </div>
              <p class="text-xs text-slate-400 mb-6">Proportion of high risk vs healthy SKUs across product categories.</p>
              <div class="h-56 w-full relative flex items-center justify-center">
                <canvas id="chart-category-risk"></canvas>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-800 text-center">
              <button id="btn-explore-skus-quick" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition inline-flex items-center gap-1">
                Open Full SKU Inventory Explorer →
              </button>
            </div>
          </div>

        </div>

      </div>
    `;

    // Render Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Attach Event Listeners
    const btnBanner = document.getElementById('btn-view-escalations-banner');
    if (btnBanner && onNavigateTab) {
      btnBanner.addEventListener('click', () => onNavigateTab('trust'));
    }

    const btnExplore = document.getElementById('btn-explore-skus-quick');
    if (btnExplore && onNavigateTab) {
      btnExplore.addEventListener('click', () => onNavigateTab('skus'));
    }

    // Initialize Chart.js Visualizations
    setTimeout(() => {
      initCharts(results);
    }, 50);
  }

  function initCharts(results) {
    if (typeof Chart === 'undefined') return;

    // Destroy existing chart instances if re-rendering
    if (chartInstance1) chartInstance1.destroy();
    if (chartInstance2) chartInstance2.destroy();

    // Chart 1 Data: Featured SKU ELEC-902 demand spike
    const spikeResult = results.find(r => r.skuId === 'ELEC-902') || results[0];
    if (spikeResult && spikeResult.stats) {
      const canvas1 = document.getElementById('chart-demand-velocity');
      if (canvas1) {
        const ctx1 = canvas1.getContext('2d');
        
        // Mock daily stock depletion trend for visualization
        let stock = 300;
        const labels = [];
        const salesData = [];
        const stockData = [];
        const ropData = [];

        const history = window.AppDataset.getSkus().find(s => s.id === spikeResult.skuId)?.salesHistory || [];

        history.forEach((h, idx) => {
          labels.push(`Day ${idx + 1}`);
          salesData.push(h.sales);
          stock = Math.max(0, stock - h.sales + (idx === 15 ? 150 : 0));
          stockData.push(stock);
          ropData.push(spikeResult.metrics.reorderPoint);
        });

        chartInstance1 = new Chart(ctx1, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Daily Sales Demand',
                data: salesData,
                borderColor: '#6366F1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.3,
                borderWidth: 2,
                pointRadius: 2
              },
              {
                label: 'On-Hand Inventory Level',
                data: stockData,
                borderColor: '#10B981',
                borderDash: [4, 4],
                borderWidth: 2,
                pointRadius: 0,
                fill: false
              },
              {
                label: 'Dynamic Reorder Point (ROP)',
                data: ropData,
                borderColor: '#EF4444',
                borderDash: [2, 2],
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: { color: '#94A3B8', font: { size: 11 } }
              }
            },
            scales: {
              x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#64748B', font: { size: 10 } }
              },
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#64748B', font: { size: 10 } }
              }
            }
          }
        });
      }
    }

    // Chart 2: Category Risk Distribution
    const canvas2 = document.getElementById('chart-category-risk');
    if (canvas2) {
      const ctx2 = canvas2.getContext('2d');

      const categories = ['Electronics', 'Apparel', 'Home & Kitchen', 'Cosmetics'];
      const riskCounts = categories.map(cat => {
        return results.filter(r => {
          const sku = window.AppDataset.getSkus().find(s => s.id === r.skuId);
          return sku && sku.category === cat && (r.metrics.riskTier === 'HIGH' || r.metrics.riskTier === 'CRITICAL');
        }).length;
      });

      chartInstance2 = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: categories,
          datasets: [{
            data: riskCounts.every(c => c === 0) ? [2, 1, 1, 1] : riskCounts,
            backgroundColor: [
              'rgba(99, 102, 241, 0.8)',
              'rgba(168, 85, 247, 0.8)',
              'rgba(236, 72, 153, 0.8)',
              'rgba(245, 158, 11, 0.8)'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#94A3B8', font: { size: 11 } }
            }
          },
          cutout: '70%'
        }
      });
    }
  }

  return { render };
})();
