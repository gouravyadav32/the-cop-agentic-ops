/**
 * "The Cop" - SKU Explorer Component
 * Inventory master manager with search, category filtering, status filters, and individual agent trigger button.
 */

window.SkuExplorerView = (function() {

  let searchQuery = '';
  let selectedCategory = 'ALL';
  let selectedStatus = 'ALL';

  function render(containerId, pipelineResults, onSelectSkuTrace) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const skus = window.AppDataset.getSkus();
    const results = pipelineResults ? pipelineResults.results : [];

    // Filter SKUs based on inputs
    const filteredSkus = skus.filter(sku => {
      const matchesSearch = sku.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            sku.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'ALL' || sku.category === selectedCategory;

      const result = results.find(r => r.skuId === sku.id);
      let matchesStatus = true;
      if (selectedStatus === 'REORDER_NEEDED') {
        matchesStatus = result && result.metrics.reorderNeeded;
      } else if (selectedStatus === 'EDGE_CASE') {
        matchesStatus = sku.isEdgeCase;
      } else if (selectedStatus === 'HEALTHY') {
        matchesStatus = result && !result.metrics.reorderNeeded;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });

    el.innerHTML = `
      <div class="space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
          <div>
            <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <i data-lucide="boxes" class="w-6 h-6 text-indigo-400"></i> Inventory Master Explorer
            </h2>
            <p class="text-slate-400 text-sm mt-1">Multi-week retail catalog dataset (${skus.length} active SKUs across 4 omni-channel categories).</p>
          </div>
        </div>

        <!-- Filter & Search Controls -->
        <div class="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
          
          <!-- Search Input -->
          <div class="relative w-full md:w-80">
            <i data-lucide="search" class="w-4 h-4 text-slate-500 absolute left-3.5 top-3"></i>
            <input 
              type="text" 
              id="input-sku-search"
              value="${searchQuery}"
              placeholder="Search SKU ID or product name..." 
              class="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <!-- Dropdown Filters -->
          <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <!-- Category Filter -->
            <select id="select-category-filter" class="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500">
              <option value="ALL" ${selectedCategory === 'ALL' ? 'selected' : ''}>All Categories</option>
              <option value="Electronics" ${selectedCategory === 'Electronics' ? 'selected' : ''}>Electronics</option>
              <option value="Apparel" ${selectedCategory === 'Apparel' ? 'selected' : ''}>Apparel</option>
              <option value="Home & Kitchen" ${selectedCategory === 'Home & Kitchen' ? 'selected' : ''}>Home & Kitchen</option>
              <option value="Cosmetics" ${selectedCategory === 'Cosmetics' ? 'selected' : ''}>Cosmetics</option>
            </select>

            <!-- Status Filter -->
            <select id="select-status-filter" class="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500">
              <option value="ALL" ${selectedStatus === 'ALL' ? 'selected' : ''}>All Statuses</option>
              <option value="REORDER_NEEDED" ${selectedStatus === 'REORDER_NEEDED' ? 'selected' : ''}>Reorder Needed</option>
              <option value="EDGE_CASE" ${selectedStatus === 'EDGE_CASE' ? 'selected' : ''}>Edge Cases Only</option>
              <option value="HEALTHY" ${selectedStatus === 'HEALTHY' ? 'selected' : ''}>Healthy Stock</option>
            </select>
          </div>

        </div>

        <!-- Master SKU Table -->
        <div class="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-xl shadow-xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th class="py-3.5 px-4 font-semibold">SKU ID & Name</th>
                  <th class="py-3.5 px-4 font-semibold">Category</th>
                  <th class="py-3.5 px-4 font-semibold text-right">Stock (On-Hand)</th>
                  <th class="py-3.5 px-4 font-semibold text-right">30d Velocity</th>
                  <th class="py-3.5 px-4 font-semibold text-right">Lead Time</th>
                  <th class="py-3.5 px-4 font-semibold">Supplier</th>
                  <th class="py-3.5 px-4 font-semibold">Agent Status</th>
                  <th class="py-3.5 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                ${filteredSkus.map(sku => {
                  const evalResult = results.find(r => r.skuId === sku.id);
                  const isReorder = evalResult && evalResult.metrics.reorderNeeded;
                  const isEscalated = evalResult && evalResult.escalationCard;

                  return `
                    <tr class="hover:bg-slate-800/40 transition group">
                      <td class="py-3.5 px-4">
                        <div class="font-bold text-white font-mono">${sku.id}</div>
                        <div class="text-[11px] text-slate-400 truncate max-w-xs">${sku.name}</div>
                        ${sku.isEdgeCase ? `<span class="inline-block mt-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Preset Edge Case: ${sku.edgeCaseType}</span>` : ''}
                      </td>
                      <td class="py-3.5 px-4 text-slate-400 font-medium">${sku.category}</td>
                      <td class="py-3.5 px-4 text-right font-mono font-bold ${sku.currentStock < 50 ? 'text-rose-400' : 'text-white'}">
                        ${sku.currentStock} u
                      </td>
                      <td class="py-3.5 px-4 text-right font-mono text-slate-300">
                        ${sku.stats.avgDailyDemand30} u/d
                      </td>
                      <td class="py-3.5 px-4 text-right font-mono text-amber-300">
                        ${sku.leadTimeDays} days
                      </td>
                      <td class="py-3.5 px-4 text-slate-400 truncate max-w-[140px]">
                        ${sku.supplier.name}
                      </td>
                      <td class="py-3.5 px-4">
                        ${isEscalated ? `
                          <span class="px-2 py-1 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            HITL Escalated
                          </span>
                        ` : isReorder ? `
                          <span class="px-2 py-1 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            PO Auto-Queued
                          </span>
                        ` : `
                          <span class="px-2 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Healthy
                          </span>
                        `}
                      </td>
                      <td class="py-3.5 px-4 text-center">
                        <button 
                          data-sku="${sku.id}"
                          class="btn-inspect-sku-trace px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-semibold transition border border-indigo-500/30 flex items-center gap-1 mx-auto"
                        >
                          <i data-lucide="eye" class="w-3.5 h-3.5"></i> Inspect Trace
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Attach search & filter listeners
    const inputSearch = document.getElementById('input-sku-search');
    if (inputSearch) {
      inputSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render(containerId, pipelineResults, onSelectSkuTrace);
      });
    }

    const selectCategory = document.getElementById('select-category-filter');
    if (selectCategory) {
      selectCategory.addEventListener('change', (e) => {
        selectedCategory = e.target.value;
        render(containerId, pipelineResults, onSelectSkuTrace);
      });
    }

    const selectStatus = document.getElementById('select-status-filter');
    if (selectStatus) {
      selectStatus.addEventListener('change', (e) => {
        selectedStatus = e.target.value;
        render(containerId, pipelineResults, onSelectSkuTrace);
      });
    }

    // Inspect trace button listeners
    document.querySelectorAll('.btn-inspect-sku-trace').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const skuId = e.currentTarget.getAttribute('data-sku');
        if (onSelectSkuTrace) {
          onSelectSkuTrace(skuId);
        }
      });
    });
  }

  return { render };
})();
