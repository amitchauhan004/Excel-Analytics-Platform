const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");

// Helper: Parse number safely
const parseVal = (v) => {
    if (typeof v === 'number') return v;
    if (!v) return 0;
    const n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
    return isNaN(n) ? 0 : n;
};

// Helper: Linear Regression
const linearRegression = (yValues) => {
    const n = yValues.length;
    const xValues = Array.from({ length: n }, (_, i) => i); // 0, 1, 2...

    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((a, x, i) => a + x * yValues[i], 0);
    const sumXX = xValues.reduce((a, x) => a + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
};

// POST /api/forecast
router.post("/", authMiddleware, (req, res) => {
    try {
        const { data, targetColumn, periods = 5 } = req.body;

        if (!data || !Array.isArray(data) || !targetColumn) {
            return res.status(400).json({ error: "Invalid input. Data array and targetColumn required." });
        }

        // Extract time series data (assuming row index is time)
        const yValues = data
            .map(row => parseVal(row[targetColumn]))
            .filter(v => v !== null && v !== undefined);

        if (yValues.length < 2) {
            return res.status(400).json({ error: "Not enough data points for forecasting." });
        }

        // 1. Calculate Linear Regression Trend
        const { slope, intercept } = linearRegression(yValues);

        // 2. Generate Historical Trend Line
        const historicalTrend = yValues.map((_, x) => slope * x + intercept);

        // 3. Generate Future Forecast
        const lastX = yValues.length - 1;
        const forecast = [];

        for (let i = 1; i <= periods; i++) {
            const nextX = lastX + i;
            const nextY = slope * nextX + intercept;
            forecast.push(nextY);
        }

        // 4. Moving Average (Simple 3-period)
        const movingAverage = [];
        for (let i = 0; i < yValues.length; i++) {
            if (i < 2) {
                movingAverage.push(yValues[i]); // Not enough data
            } else {
                const avg = (yValues[i] + yValues[i - 1] + yValues[i - 2]) / 3;
                movingAverage.push(avg);
            }
        }

        res.json({
            targetColumn,
            totalPoints: yValues.length,
            slope: slope.toFixed(4),
            historical: yValues,
            trendLine: historicalTrend,
            forecast: forecast,
            movingAverage: movingAverage
        });

    } catch (err) {
        console.error("Forecast Error:", err);
        res.status(500).json({ error: "Forecasting failed" });
    }
});

module.exports = router;
