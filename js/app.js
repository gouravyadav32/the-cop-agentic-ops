/**
 * "The Cop" - Main Application Controller & State Manager
 * Coordinates dataset, agent engine execution, active tab navigation, and scenario triggers.
 */

(function() {
  let activeTab = 'workflow';
  let skus = [];
  let pipelineResults = null;

  function init() {
    console.log('🚀 Initializing "The Cop" Agentic System...');
    
    // Load synthesized dataset
    skus = window.AppDataset.getSkus();

    // Run initial agent pipeline evaluation across all SKUs
    runAgentPipeline();

    // Setup Navigation Tabs
    setupNavigation();

    // Render Active View
    renderActiveTab();
  }

  function runAgentPipeline() {
    pipelineResults = window.AgentEngine.runPipeline(skus);
    console.log(`[Agent Engine] Pipeline run complete: ${pipelineResults.evaluatedCount} SKUs evaluated, ${pipelineResults.escalationsCount} escalated, ${pipelineResults.autoDraftsCount} auto-drafted.`);
    updateNavbarMetrics();
  }

  function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-tab-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.getAttribute('data-tab');
        if (targetTab) {
          switchTab(targetTab);
        }
      });
    });

    // Run Scan Header Button
    const btnRunScan = document.getElementById('btn-run-scan-header');
    if (btnRunScan) {
      btnRunScan.addEventListener('click', () => {
        runAgentPipeline();
        renderActiveTab();
        showToast('Pipeline Scan Complete! Re-evaluated 25 SKUs across all categories.', 'info');
      });
    }
  }

  function switchTab(tabName) {
    activeTab = tabName;

    // Update active tab styling
    document.querySelectorAll('.nav-tab-item').forEach(item => {
      const isCurrent = item.getAttribute('data-tab') === tabName;
      if (isCurrent) {
        item.classList.add('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-600/30');
        item.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-slate-800/60');
      } else {
        item.classList.remove('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-600/30');
        item.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-slate-800/60');
      }
    });

    renderActiveTab();
  }

  function renderActiveTab() {
    const container = 'app-content-container';

    if (activeTab === 'workflow') {
      window.WorkflowView.render(container);
    } else if (activeTab === 'dashboard') {
      window.DashboardView.render(container, pipelineResults, (target) => switchTab(target));
    } else if (activeTab === 'trust') {
      window.TrustControlView.render(container, pipelineResults, () => {
        updateNavbarMetrics();
        renderActiveTab();
      });
    } else if (activeTab === 'trace') {
      window.AgentTraceView.render(container, pipelineResults);
    } else if (activeTab === 'skus') {
      window.SkuExplorerView.render(container, pipelineResults, (skuId) => {
        // Jump to execution trace view for specific SKU
        switchTab('trace');
        setTimeout(() => {
          const selectElem = document.getElementById('select-sku-trace');
          if (selectElem) {
            selectElem.value = skuId;
            selectElem.dispatchEvent(new Event('change'));
          }
        }, 50);
      });
    } else if (activeTab === 'scenarios') {
      window.ScenarioInjectorView.render(container, (scenarioType, targetSkuId) => {
        handleScenarioInjection(scenarioType, targetSkuId);
      });
    } else if (activeTab === 'limitations') {
      window.LimitationsView.render(container);
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function handleScenarioInjection(scenarioType, targetSkuId) {
    const targetSku = skus.find(s => s.id === targetSkuId);
    if (!targetSku) return;

    if (scenarioType === 'DEMAND_SPIKE') {
      targetSku.edgeCaseType = 'DEMAND_SPIKE';
      targetSku.isEdgeCase = true;
      targetSku.stats.avgDailyDemand7 = 85.0;
      targetSku.stats.demandTrendRatio = 3.86;
      showToast(`Injected Spike (+350%) on ${targetSkuId}. Agent triggered Surge Multiplier!`, 'warning');
    } else if (scenarioType === 'SUPPLIER_DELAY') {
      targetSku.edgeCaseType = 'SUPPLIER_DELAY';
      targetSku.isEdgeCase = true;
      targetSku.leadTimeDays = 24;
      targetSku.leadTimeVarianceDays = 6.0;
      showToast(`Injected Supplier Delay (24d lead time) on ${targetSkuId}. Agent expanded Safety Stock!`, 'warning');
    } else if (scenarioType === 'LONG_TAIL_LUMPY') {
      targetSku.edgeCaseType = 'LONG_TAIL_LUMPY';
      targetSku.isEdgeCase = true;
      targetSku.stats.demandStdDev = 8.5;
      showToast(`Injected Lumpy Volatility on ${targetSkuId}. Agent downgraded confidence score!`, 'info');
    } else if (scenarioType === 'MOQ_CONSTRAINT') {
      targetSku.edgeCaseType = 'MOQ_CONSTRAINT';
      targetSku.isEdgeCase = true;
      targetSku.minOrderQty = 500;
      showToast(`Injected MOQ Constraint (500 units) on ${targetSkuId}. Agent flagged cash outlay!`, 'info');
    }

    // Re-evaluate pipeline
    runAgentPipeline();

    // Navigate to Trust & Control Layer to inspect escalation card
    switchTab('trust');
  }

  function updateNavbarMetrics() {
    const badge = document.getElementById('escalations-badge-count');
    if (badge && pipelineResults) {
      badge.textContent = pipelineResults.escalationsCount;
      if (pipelineResults.escalationsCount > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgClass = type === 'warning' ? 'bg-amber-600 border-amber-500' : 'bg-indigo-600 border-indigo-500';
    
    toast.className = `fixed bottom-6 right-6 ${bgClass} text-white px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2 transition-all duration-300 z-50 animate-bounce`;
    toast.innerHTML = `<i data-lucide="bell" class="w-4 h-4"></i> ${message}`;

    document.body.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  // Run on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
