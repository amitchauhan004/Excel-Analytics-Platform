const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");

// Helper to safely parse numbers
const parseNum = (val) => {
    if (typeof val === 'number') return val;
    const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
};

// POST /api/simulate
router.post("/", authMiddleware, (req, res) => {
    try {
        const { data, adjustments } = req.body;

        if (!data || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ error: "Invalid data provided" });
        }

        const {
            priceChangePercent = 0,
            costChangePercent = 0,
            demandChangePercent = 0
        } = adjustments || {};

        // 1. Identify relevant columns (heuristic)
        const headers = Object.keys(data[0]);

        // Simple heuristic to find columns
        const findCol = (keywords) => headers.find(h =>
            keywords.some(k => h.toLowerCase().includes(k))
        );

        const priceCol = findCol(['price', 'unit price', 'selling price', 'revenue', 'sales']);
        const costCol = findCol(['cost', 'unit cost', 'buying price', 'expense']);
        const qtyCol = findCol(['qty', 'quantity', 'units', 'volume', 'count']);
        const profitCol = findCol(['profit', 'margin', 'net income']);

        // 2. Calculate totals
        let baseline = { revenue: 0, cost: 0, profit: 0, quantity: 0 };
        let projected = { revenue: 0, cost: 0, profit: 0, quantity: 0 };

        data.forEach(row => {
            // Extract baseline values
            let p = priceCol ? parseNum(row[priceCol]) : 0;
            let c = costCol ? parseNum(row[costCol]) : 0;
            let q = qtyCol ? parseNum(row[qtyCol]) : 1; // Default to 1 if no qty column
            let profit = profitCol ? parseNum(row[profitCol]) : (p - c) * q;

            // If we found revenue but not price, treat revenue as price * 1
            if (priceCol && !qtyCol) {
                // Interpreting the column as total revenue
                // We'll treat q=1, p=revenue
            }

            // Heuristic refinements
            // If we have Revenue(Sales) and Cost, but no Qty and Price is actually Revenue
            // Let's standardise:
            // We need Total Revenue, Total Cost, Total Profit

            let rowRev = 0;
            let rowCost = 0;
            let rowProfit = 0;
            let rowQty = q;

            if (priceCol && qtyCol) {
                // Price and Qty exist
                rowRev = p * q;
                rowCost = c * q;
            } else if (priceCol && !qtyCol) {
                // Only "Price" or "Revenue" column exists. Assume it is total revenue line item.
                rowRev = p;
                // If cost exists, it's total cost
                rowCost = c;
            } else {
                // Fallback or complex cases
            }

            // If profit column exists, use it for baseline, else calc
            if (profitCol) {
                rowProfit = profit;
            } else {
                rowProfit = rowRev - rowCost;
            }

            // Accumulate Baseline
            baseline.revenue += rowRev;
            baseline.cost += rowCost;
            baseline.profit += rowProfit;
            baseline.quantity += rowQty;

            // --- SIMULATION ---
            // Apply adjustments
            // New Quantity = Q * (1 + demand%)
            // New Price = P * (1 + price%)
            // New Cost = C * (1 + cost%) (Unit cost change)

            // Impact on Totals:
            // Proj Revenue = (OldRev * (1+price%)) * (1+demand%) -> Approximation if OldRev = P*Q
            // Proj Cost = (OldCost * (1+cost%)) * (1+demand%) -> Approximation if OldCost = C*Q

            const demandFactor = 1 + (demandChangePercent / 100);
            const priceFactor = 1 + (priceChangePercent / 100);
            const costFactor = 1 + (costChangePercent / 100);

            const projQty = rowQty * demandFactor;

            // Projected Revenue
            // If we had Price and Qty: NewRev = (P*priceFactor) * (Q*demandFactor)
            // If we only had Revenue: NewRev = Revenue * priceFactor * demandFactor
            const projRev = rowRev * priceFactor * demandFactor;

            // Projected Cost
            // If we had Unit Cost and Qty: NewCost = (C*costFactor) * (Q*demandFactor)
            // If we only had Total Cost: NewCost = Cost * costFactor * demandFactor
            const projCost = rowCost * costFactor * demandFactor;

            const projProfit = projRev - projCost;

            // Accumulate Projected
            projected.revenue += projRev;
            projected.cost += projCost;
            projected.profit += projProfit;
            projected.quantity += projQty;
        });

        // 3. Construct result
        const delta = {
            revenue: projected.revenue - baseline.revenue,
            cost: projected.cost - baseline.cost,
            profit: projected.profit - baseline.profit,
            quantity: projected.quantity - baseline.quantity
        };

        res.json({
            baseline,
            projected,
            delta,
            factors: { priceChangePercent, costChangePercent, demandChangePercent }
        });

    } catch (err) {
        console.error("Simulation error:", err);
        res.status(500).json({ error: "Failed to run simulation" });
    }
});

module.exports = router;
