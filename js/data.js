/**
 * "The Cop" - Multi-Week Inventory & Demand Dataset Synthesizer
 * Synthesizes realistic 30-day sales history, stock levels, supplier parameters, and edge cases.
 */

window.AppDataset = (function() {
  const CATEGORIES = ['Electronics', 'Apparel', 'Home & Kitchen', 'Cosmetics'];
  
  const SUPPLIERS = [
    { id: 'SUP-01', name: 'Apex Tech Electronics Ltd.', reliability: 0.94, leadTimeDays: 7, country: 'Taiwan' },
    { id: 'SUP-02', name: 'Global Textile Mills Inc.', reliability: 0.78, leadTimeDays: 14, country: 'Vietnam' },
    { id: 'SUP-03', name: 'Nordic Home Concepts', reliability: 0.98, leadTimeDays: 5, country: 'Sweden' },
    { id: 'SUP-04', name: 'Luxe Beauty Formulations', reliability: 0.88, leadTimeDays: 10, country: 'France' }
  ];

  // Raw initial SKU master list
  const INITIAL_SKUS = [
    // Electronics
    {
      id: 'ELEC-902',
      name: 'SonicPro Wireless ANC Earbuds v2',
      category: 'Electronics',
      supplierId: 'SUP-01',
      unitCost: 45.00,
      sellingPrice: 129.99,
      currentStock: 68,
      onOrder: 0,
      leadTimeDays: 7,
      leadTimeVarianceDays: 1.5,
      minOrderQty: 100,
      targetServiceLevel: 0.95, // Z = 1.65
      edgeCaseType: 'DEMAND_SPIKE',
      isEdgeCase: true,
      notes: 'Viral TikTok review drove 3.5x sudden demand jump in last 5 days.'
    },
    {
      id: 'ELEC-105',
      name: 'UltraSlim USB-C 10-in-1 Hub',
      category: 'Electronics',
      supplierId: 'SUP-01',
      unitCost: 18.50,
      sellingPrice: 49.99,
      currentStock: 420,
      onOrder: 150,
      leadTimeDays: 7,
      leadTimeVarianceDays: 1.0,
      minOrderQty: 50,
      targetServiceLevel: 0.95,
      edgeCaseType: 'NORMAL',
      isEdgeCase: false
    },
    {
      id: 'ELEC-404',
      name: 'Smart Desk Lamp with Qi Charger',
      category: 'Electronics',
      supplierId: 'SUP-01',
      unitCost: 28.00,
      sellingPrice: 79.99,
      currentStock: 85,
      onOrder: 0,
      leadTimeDays: 8,
      leadTimeVarianceDays: 2.0,
      minOrderQty: 40,
      targetServiceLevel: 0.95,
      edgeCaseType: 'NORMAL',
      isEdgeCase: false
    },
    {
      id: 'ELEC-881',
      name: 'Mechanical Ergonomic Keyboard RGB',
      category: 'Electronics',
      supplierId: 'SUP-01',
      unitCost: 62.00,
      sellingPrice: 159.99,
      currentStock: 210,
      onOrder: 100,
      leadTimeDays: 10,
      leadTimeVarianceDays: 1.2,
      minOrderQty: 30,
      targetServiceLevel: 0.98,
      edgeCaseType: 'NORMAL',
      isEdgeCase: false
    },

    // Apparel
    {
      id: 'APPR-104',
      name: '100% Australian Merino Wool Sweater',
      category: 'Apparel',
      supplierId: 'SUP-02',
      unitCost: 32.00,
      sellingPrice: 98.00,
      currentStock: 110,
      onOrder: 0,
      leadTimeDays: 24, // Shifted from 7 to 24 due to port delay
      leadTimeVarianceDays: 6.0,
      minOrderQty: 200,
      targetServiceLevel: 0.95,
      edgeCaseType: 'SUPPLIER_DELAY',
      isEdgeCase: true,
      notes: 'Red Sea shipment disruption increased lead time from 7 to 24 days.'
    },
    {
      id: 'APPR-202',
      name: 'Organic Cotton Everyday Crew Tee (Pack of 3)',
      category: 'Apparel',
      supplierId: 'SUP-02',
      unitCost: 12.00,
      sellingPrice: 34.99,
      currentStock: 890,
      onOrder: 300,
      leadTimeDays: 12,
      leadTimeVarianceDays: 2.0,
      minOrderQty: 100,
      targetServiceLevel: 0.95,
      edgeCaseType: 'NORMAL',
      isEdgeCase: false
    },
    {
      id: 'APPR-509',
      name: 'Waterproof Lightweight Trail Jacket',
      category: 'Apparel',
      supplierId: 'SUP-02',
      unitCost: 48.00,
      sellingPrice: 139.99,
      currentStock: 95,
      onOrder: 0,
      leadTimeDays: 14,
      leadTimeVarianceDays: 3.5,
      minOrderQty: 50,
      targetServiceLevel: 0.90,
      edgeCaseType: 'NORMAL',
      isEdgeCase: false
    },
    {
      id: 'APPR-770',
      name: 'Seamless Activewear Leggings Black',
      category: 'Apparel',
      supplierId: 'SUP-02',
      unitCost: 16.50,
      sellingPrice: 58.00,
      currentStock: 340,
      onOrder: 200,
      leadTimeDays: 10,
      leadTimeVarianceDays: 1.8,
      minOrderQty: 100,
      targetServiceLevel: 0.95,
      edgeCaseType: 'NORMAL',
      isEdgeCase: false
    },

    // Home & Kitchen
    {
      id: 'HOME-550',
      name: 'Dual Monitor Gas Spring Heavy Duty Arm',
      category: 'Home & Kitchen',
      supplierId: 'SUP-03',
      unitCost: 55.00,
      sellingPrice: 149.99,
      currentStock: 18,
      onOrder: 0,
      leadTimeDays: 6,
      leadTimeVarianceDays: 1.0,
      minOrderQty: 25,
      targetServiceLevel: 0.95,
      edgeCaseType: 'LONG_TAIL_LUMPY',
      isEdgeCase: true,
      notes: 'Sporadic lumpy demand: 0 sales for 6 days, then sudden B2B office purchase of 14 units.'
    },
    {
      id: 'HOME-102',
      name: 'Cast Iron Dutch Oven 6-Quart Emerald',
      category: 'Home & Kitchen',
      supplierId: 'SUP-03',
      unitCost: 42.00,
      sellingPrice: 119.99,
      currentStock: 160,
      onOrder: 50,
      leadTimeDays: 7,
      leadTimeVarianceDays: 1.2,
      minOrderQty: 30,
      targetServiceLevel: 0.95,
      edgeCaseType: 'NORMAL',
      isEdgeCase: false
    },
    {
      id: 'HOME-330',
      name: 'Precision Gooseneck Electric Kettle',
      category: 'Home & Kitchen',
      supplierId: 'SUP-03',
      unitCost: 26.00,
      sellingPrice: 74.99,
      currentStock: 240,
      onOrder: 0,
      leadTimeDays: 5,
      leadTimeVarianceDays: 0.8,
      minOrderQty: 50,
      targetServiceLevel: 0.95,
      edgeCaseType: 'NORMAL',
      isEdgeCase: false
    },

    // Cosmetics
    {
      id: 'COSM-301',
      name: 'Botanical Hyaluronic Acid Serum 50ml',
      category: 'Cosmetics',
      supplierId: 'SUP-04',
      unitCost: 8.50,
      sellingPrice: 38.00,
      currentStock: 45,
      onOrder: 0,
      leadTimeDays: 10,
      leadTimeVarianceDays: 2.0,
      minOrderQty: 500, // High Supplier MOQ constraint
      targetServiceLevel: 0.99,
      edgeCaseType: 'MOQ_CONSTRAINT',
      isEdgeCase: true,
      notes: 'Calculated reorder is 120 units, but supplier MOQ requires minimum order of 500 units ($4,250 commitment).'
    },
    {
      id: 'COSM-108',
      name: 'Nourishing Retinol Night Cream 30g',
      category: 'Cosmetics',
      supplierId: 'SUP-04',
      unitCost: 11.00,
      sellingPrice: 46.00,
      currentStock: 310,
      onOrder: 150,
      leadTimeDays: 10,
      leadTimeVarianceDays: 1.5,
      minOrderQty: 100,
      targetServiceLevel: 0.95,
      edgeCaseType: 'NORMAL',
      isEdgeCase: false
    },
    {
      id: 'COSM-909',
      name: 'SPF 50+ Invisible Mineral Sunscreen',
      category: 'Cosmetics',
      supplierId: 'SUP-04',
      unitCost: 7.20,
      sellingPrice: 28.00,
      currentStock: 520,
      onOrder: 0,
      leadTimeDays: 8,
      leadTimeVarianceDays: 1.0,
      minOrderQty: 200,
      targetServiceLevel: 0.95,
      edgeCaseType: 'NORMAL',
      isEdgeCase: false
    }
  ];

  // Helper to generate 30 days of sales history
  function generateSalesHistory(sku) {
    const history = [];
    const today = new Date();
    
    let baseDailySales = 15;
    if (sku.category === 'Electronics') baseDailySales = 22;
    if (sku.category === 'Apparel') baseDailySales = 18;
    if (sku.category === 'Home & Kitchen') baseDailySales = 10;
    if (sku.category === 'Cosmetics') baseDailySales = 25;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      let sales = Math.max(0, Math.floor(baseDailySales + (Math.random() * 8 - 4)));

      // Inject specific edge case patterns
      if (sku.edgeCaseType === 'DEMAND_SPIKE' && i < 5) {
        // Last 5 days spike to 70-95 units/day!
        sales = Math.floor(75 + Math.random() * 20);
      } else if (sku.edgeCaseType === 'LONG_TAIL_LUMPY') {
        // Mostly 0 or 1, occasionally 12-15
        if (i % 7 === 0) {
          sales = Math.floor(12 + Math.random() * 6);
        } else if (Math.random() > 0.7) {
          sales = Math.floor(1 + Math.random() * 3);
        } else {
          sales = 0;
        }
      }

      history.push({
        date: dateStr,
        dayIndex: 30 - i,
        sales: sales
      });
    }

    return history;
  }

  // Synthesize complete dataset
  function initDataset() {
    return INITIAL_SKUS.map(sku => {
      const salesHistory = generateSalesHistory(sku);
      const supplier = SUPPLIERS.find(s => s.id === sku.supplierId) || SUPPLIERS[0];
      
      // Calculate 30-day & 7-day sales stats
      const sales30Days = salesHistory.reduce((acc, curr) => acc + curr.sales, 0);
      const avgDailyDemand30 = sales30Days / 30;

      const sales7Days = salesHistory.slice(-7).reduce((acc, curr) => acc + curr.sales, 0);
      const avgDailyDemand7 = sales7Days / 7;

      // Demand variance (standard deviation)
      const variance = salesHistory.reduce((acc, curr) => acc + Math.pow(curr.sales - avgDailyDemand30, 2), 0) / 30;
      const demandStdDev = Math.sqrt(variance);

      return {
        ...sku,
        supplier,
        salesHistory,
        stats: {
          sales30Days,
          sales7Days,
          avgDailyDemand30: Number(avgDailyDemand30.toFixed(2)),
          avgDailyDemand7: Number(avgDailyDemand7.toFixed(2)),
          demandStdDev: Number(demandStdDev.toFixed(2)),
          demandTrendRatio: Number((avgDailyDemand7 / (avgDailyDemand30 || 1)).toFixed(2))
        }
      };
    });
  }

  return {
    suppliers: SUPPLIERS,
    getSkus: initDataset
  };
})();
