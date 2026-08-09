/**
 * "The Cop" - Agentic Reasoning & Replenishment Engine
 * Implements Sense -> Decide -> Draft -> Escalate multi-stage pipeline with dynamic safety stock math & HITL triggers.
 */

window.AgentEngine = (function() {

  // Z-Score for Service Level targets
  const SERVICE_LEVEL_Z = {
    0.90: 1.28,
    0.95: 1.65,
    0.98: 2.05,
    0.99: 2.33
  };

  /**
   * Evaluates a single SKU through the agentic pipeline
   */
  function evaluateSku(sku) {
    const trace = [];

    // ==========================================
    // STAGE 1: SENSE
    // ==========================================
    const d_avg = sku.stats.avgDailyDemand30;
    const d_7day = sku.stats.avgDailyDemand7;
    const sigma_d = sku.stats.demandStdDev;
    const L = sku.leadTimeDays;
    const sigma_L = sku.leadTimeVarianceDays || 1.0;
    const currentStock = sku.currentStock;
    const onOrder = sku.onOrder;
    const totalInventory = currentStock + onOrder;

    const velocityRatio = Number((d_7day / (d_avg || 0.1)).toFixed(2));
    const daysOfStockRemaining = Number((currentStock / (d_7day > 0 ? d_7day : (d_avg || 1))).toFixed(1));
    const stockoutImminent = daysOfStockRemaining < (L * 0.7);

    trace.push({
      stage: 'SENSE',
      title: 'Sensor Pipeline Ingestion',
      status: 'COMPLETE',
      timestamp: new Date().toLocaleTimeString(),
      details: [
        `Ingested 30-day daily demand history (${sku.stats.sales30Days} units total)`,
        `30-Day Avg Daily Demand (d): ${d_avg} units/day | StdDev (σ_d): ${sigma_d}`,
        `7-Day Recent Demand Velocity: ${d_7day} units/day (Trend Ratio: ${velocityRatio}x)`,
        `Current On-Hand Stock: ${currentStock} units | On-Order Pipeline: ${onOrder} units`,
        `Effective Lead Time (L): ${L} days | Lead-Time Variance (σ_L): ${sigma_L} days`,
        `Calculated Stock Cover: ${daysOfStockRemaining} days remaining`
      ],
      metrics: {
        d_avg,
        d_7day,
        velocityRatio,
        daysOfStockRemaining,
        totalInventory
      }
    });

    // ==========================================
    // STAGE 2: DECIDE
    // ==========================================
    const serviceLevel = sku.targetServiceLevel || 0.95;
    const Z = SERVICE_LEVEL_Z[serviceLevel] || 1.65;

    // Safety Stock Formula: SS = Z * sqrt( L * (sigma_d)^2 + d^2 * (sigma_L)^2 )
    const demandVarianceTerm = L * Math.pow(sigma_d, 2);
    const leadTimeVarianceTerm = Math.pow(d_avg, 2) * Math.pow(sigma_L, 2);
    const combinedVariance = Math.sqrt(demandVarianceTerm + leadTimeVarianceTerm);
    const safetyStock = Math.ceil(Z * combinedVariance);

    // Reorder Point Formula: ROP = (d_effective * L) + SS
    // If recent velocity > 1.5x, use adjusted demand rate to prevent stockout under surge
    const effectiveDemand = velocityRatio > 1.5 ? d_7day : d_avg;
    const reorderPoint = Math.ceil((effectiveDemand * L) + safetyStock);

    // Target Stock Level & Suggested Order Quantity
    const targetStockLevel = reorderPoint + Math.ceil(effectiveDemand * L);
    let suggestedReorderQty = Math.max(0, targetStockLevel - totalInventory);

    // Check if Reorder is Needed
    const reorderNeeded = totalInventory <= reorderPoint;

    // Determine Risk Tier & Model Confidence Score
    let riskTier = 'LOW';
    let confidenceScore = 95;
    const riskFactors = [];

    if (stockoutImminent) {
      riskTier = 'CRITICAL';
      confidenceScore -= 20;
      riskFactors.push(`Stock cover (${daysOfStockRemaining}d) is less than lead time (${L}d). Stockout imminent.`);
    }

    if (velocityRatio >= 2.0) {
      if (riskTier !== 'CRITICAL') riskTier = 'HIGH';
      confidenceScore -= 15;
      riskFactors.push(`Sudden demand spike detected (${velocityRatio}x baseline). Standard moving average insufficient.`);
    }

    if (sku.edgeCaseType === 'SUPPLIER_DELAY' || L >= 20 || sigma_L >= 4.0) {
      if (riskTier !== 'CRITICAL') riskTier = 'HIGH';
      confidenceScore -= 15;
      riskFactors.push(`Supplier lead-time anomaly (Lead time extended to ${L} days with high variance ${sigma_L}d).`);
    }

    if (sku.edgeCaseType === 'LONG_TAIL_LUMPY' || (d_avg < 3 && sigma_d > d_avg)) {
      if (riskTier === 'LOW') riskTier = 'MEDIUM';
      confidenceScore -= 25;
      riskFactors.push(`Long-tail lumpy demand pattern. High coefficient of variation (C_v > 1.0).`);
    }

    if (sku.edgeCaseType === 'MOQ_CONSTRAINT' || (sku.minOrderQty > suggestedReorderQty * 2 && suggestedReorderQty > 0)) {
      if (riskTier === 'LOW') riskTier = 'MEDIUM';
      riskFactors.push(`Supplier MOQ constraint (${sku.minOrderQty} units) exceeds calculated reorder quantity (${suggestedReorderQty} units).`);
    }

    trace.push({
      stage: 'DECIDE',
      title: 'Mathematical Reasoning & Risk Modeling',
      status: 'COMPLETE',
      timestamp: new Date().toLocaleTimeString(),
      mathBreakdown: {
        formula: 'SS = Z × √[ L · (σ_d)² + d² · (σ_L)² ]',
        Z,
        serviceLevelPct: (serviceLevel * 100).toFixed(0) + '%',
        demandVarianceTerm: demandVarianceTerm.toFixed(2),
        leadTimeVarianceTerm: leadTimeVarianceTerm.toFixed(2),
        combinedVariance: combinedVariance.toFixed(2),
        calculatedSafetyStock: safetyStock,
        reorderPoint,
        effectiveDemandUsed: effectiveDemand.toFixed(2),
        suggestedReorderQty,
        targetStockLevel
      },
      details: [
        `Computed Safety Stock: ${safetyStock} units (Target Service Level: ${serviceLevel * 100}%)`,
        `Calculated Dynamic Reorder Point (ROP): ${reorderPoint} units (Effective demand used: ${effectiveDemand.toFixed(1)} u/day)`,
        `Total Pipeline Stock (${totalInventory}) vs ROP (${reorderPoint}) => Reorder Status: ${reorderNeeded ? 'REORDER NEEDED' : 'HEALTHY'}`,
        `Assigned Risk Tier: ${riskTier} | Agent Confidence Score: ${confidenceScore}%`,
        ...riskFactors.map(rf => `[RISK FACTOR] ${rf}`)
      ],
      metrics: {
        safetyStock,
        reorderPoint,
        suggestedReorderQty,
        reorderNeeded,
        riskTier,
        confidenceScore
      }
    });

    // ==========================================
    // STAGE 3: DRAFT
    // ==========================================
    let poDraft = null;

    if (reorderNeeded || suggestedReorderQty > 0) {
      // Adjust for MOQ if necessary
      let finalOrderQty = suggestedReorderQty;
      let moqAdjusted = false;

      if (sku.minOrderQty && finalOrderQty < sku.minOrderQty) {
        finalOrderQty = sku.minOrderQty;
        moqAdjusted = true;
      }

      const totalCost = Number((finalOrderQty * sku.unitCost).toFixed(2));
      const projectedArrivalDate = new Date();
      projectedArrivalDate.setDate(projectedArrivalDate.getDate() + L);

      poDraft = {
        poNumber: `PO-${sku.id}-${Math.floor(1000 + Math.random() * 9000)}`,
        skuId: sku.id,
        skuName: sku.name,
        supplierName: sku.supplier.name,
        quantity: finalOrderQty,
        calculatedQuantity: suggestedReorderQty,
        moqAdjusted,
        unitCost: sku.unitCost,
        totalCost,
        leadTimeDays: L,
        expectedDeliveryDate: projectedArrivalDate.toISOString().split('T')[0],
        status: 'DRAFT',
        createdAt: new Date().toISOString()
      };

      trace.push({
        stage: 'DRAFT',
        title: 'Purchase Order Generation',
        status: 'COMPLETE',
        timestamp: new Date().toLocaleTimeString(),
        details: [
          `Formulated PO Draft #${poDraft.poNumber}`,
          `Order Line Item: ${sku.name} (${finalOrderQty} units @ $${sku.unitCost.toFixed(2)}/unit)`,
          `Total Investment Commitment: $${totalCost.toLocaleString()}`,
          `Target Supplier Delivery Date: ${poDraft.expectedDeliveryDate} (${L} days lead time)`,
          moqAdjusted ? `[MOQ ADJUSTMENT] Quantity bumped from ${suggestedReorderQty} to ${finalOrderQty} to satisfy supplier MOQ (${sku.minOrderQty} u).` : 'Standard quantity matched reorder point.'
        ],
        poDraft
      });
    } else {
      trace.push({
        stage: 'DRAFT',
        title: 'Purchase Order Generation',
        status: 'SKIPPED',
        timestamp: new Date().toLocaleTimeString(),
        details: [`Inventory level (${totalInventory} u) is currently above Reorder Point (${reorderPoint} u). No PO required at this time.`]
      });
    }

    // ==========================================
    // STAGE 4: ESCALATE (HITL Trigger Evaluation)
    // ==========================================
    let requireEscalation = false;
    const escalationReasons = [];

    // Trigger 1: Urgent Stockout Risk
    if (stockoutImminent) {
      requireEscalation = true;
      escalationReasons.push(`CRITICAL STOCKOUT RISK: Only ${daysOfStockRemaining} days of stock remaining vs ${L} days supplier lead time.`);
    }

    // Trigger 2: Severe Demand Anomaly
    if (velocityRatio >= 2.0) {
      requireEscalation = true;
      escalationReasons.push(`DEMAND SURGE ANOMALY: 7-day velocity is ${velocityRatio}x higher than 30-day baseline.`);
    }

    // Trigger 3: Supplier Lead-Time Disruption
    if (sku.edgeCaseType === 'SUPPLIER_DELAY' || L > 20 || sigma_L >= 4.0) {
      requireEscalation = true;
      escalationReasons.push(`SUPPLIER DISRUPTION: Lead time expanded to ${L} days with high variance (±${sigma_L} days).`);
    }

    // Trigger 4: High Value / MOQ Commitment Risk
    if (poDraft && poDraft.moqAdjusted && poDraft.totalCost > 3000) {
      requireEscalation = true;
      escalationReasons.push(`MOQ FINANCIAL COMMITMENT: Bumping order to supplier MOQ requires $${poDraft.totalCost.toLocaleString()} cash outlay (${poDraft.quantity} units vs ${poDraft.calculatedQuantity} units needed).`);
    }

    // Trigger 5: Low Confidence / Long-Tail Lumpy SKU
    if (confidenceScore < 80 || sku.edgeCaseType === 'LONG_TAIL_LUMPY') {
      requireEscalation = true;
      escalationReasons.push(`LOW MODEL CONFIDENCE (${confidenceScore}%): High demand variability on long-tail SKU. Human review recommended.`);
    }

    let escalationCard = null;

    if (requireEscalation && poDraft) {
      escalationCard = {
        id: `ESC-${sku.id}-${Date.now()}`,
        skuId: sku.id,
        skuName: sku.name,
        category: sku.category,
        riskTier,
        confidenceScore,
        reasons: escalationReasons,
        poDraft,
        sensingSnapshot: {
          currentStock,
          onOrder,
          d_avg,
          d_7day,
          velocityRatio,
          daysOfStockRemaining,
          leadTimeDays: L,
          leadTimeVarianceDays: sigma_L,
          safetyStock,
          reorderPoint
        },
        mathFormulaText: `SS = ${Z} × √[ (${L} × ${sigma_d.toFixed(1)}²) + (${d_avg.toFixed(1)}² × ${sigma_L.toFixed(1)}²) ] = ${safetyStock} units`,
        status: 'PENDING_HUMAN_REVIEW',
        createdAt: new Date().toISOString()
      };

      trace.push({
        stage: 'ESCALATE',
        title: 'Escalation to Human-In-The-Loop (HITL) Queue',
        status: 'ESCALATED',
        timestamp: new Date().toLocaleTimeString(),
        details: [
          `⚠️ Decision Escalated to Human Planner Queue`,
          `Risk Level: ${riskTier} | Confidence: ${confidenceScore}%`,
          ...escalationReasons.map(r => `• ${r}`)
        ],
        escalationCard
      });
    } else if (poDraft) {
      trace.push({
        stage: 'ESCALATE',
        title: 'Escalation Evaluation',
        status: 'AUTO_APPROVED',
        timestamp: new Date().toLocaleTimeString(),
        details: [
          `✅ Auto-Queued Draft PO #${poDraft.poNumber}`,
          `All metrics within safe autonomous bounds (Risk: LOW, Confidence: ${confidenceScore}%).`
        ]
      });
    } else {
      trace.push({
        stage: 'ESCALATE',
        title: 'Escalation Evaluation',
        status: 'NO_ACTION_NEEDED',
        timestamp: new Date().toLocaleTimeString(),
        details: [`SKU is healthy. No escalation or purchase order required.`]
      });
    }

    return {
      skuId: sku.id,
      skuName: sku.name,
      evaluatedAt: new Date().toISOString(),
      stats: sku.stats,
      metrics: {
        safetyStock,
        reorderPoint,
        daysOfStockRemaining,
        velocityRatio,
        riskTier,
        confidenceScore,
        reorderNeeded
      },
      poDraft,
      escalationCard,
      trace
    };
  }

  /**
   * Runs agent evaluation across all SKUs in the dataset
   */
  function runPipeline(skus) {
    const results = skus.map(sku => evaluateSku(sku));
    
    const escalations = results
      .filter(r => r.escalationCard !== null)
      .map(r => r.escalationCard);

    const autoDrafts = results
      .filter(r => r.poDraft && !r.escalationCard)
      .map(r => r.poDraft);

    return {
      evaluatedCount: results.length,
      escalationsCount: escalations.length,
      autoDraftsCount: autoDrafts.length,
      results,
      escalations,
      autoDrafts
    };
  }

  return {
    evaluateSku,
    runPipeline
  };
})();
