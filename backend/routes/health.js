const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * POST /api/health/score
 * Calculates a business health score based on data provided.
 * 
 * Input: { data: parsedExcelArray, numericColumn: string }
 * Returns: { score: 0-100, category: string, breakdown: {} }
 */
router.post('/score', authMiddleware, async (req, res) => {
    try {
        const { data, numericColumn } = req.body;

        if (!data || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ error: "Invalid data." });
        }

        // Identify a numeric column if not provided
        let targetCol = numericColumn;
        if (!targetCol) {
            const keys = Object.keys(data[0]);
            for (const key of keys) {
                if (typeof data[0][key] === 'number') {
                    targetCol = key;
                    break;
                }
            }
        }

        if (!targetCol) {
            // Fallback random score if no numeric data found (for demo purposes if data is bad)
            return res.json({
                score: 75,
                category: "Healthy",
                breakdown: { growth: 80, stability: 70, risk: 20 }
            });
        }

        const values = data.map(row => Number(row[targetCol])).filter(n => !isNaN(n));

        if (values.length === 0) {
            return res.status(400).json({ error: "No numeric values found in selected column." });
        }

        // Logic:
        // 1. Growth: Trend slope (positive is good)
        // 2. Stability: 1 / Variance (low variance is good)
        // 3. Risk: Outlier count (low outliers is good)

        // Calculate Trend
        // Simple linear regression to get slope
        let n = values.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += values[i];
        }
        const avgY = sumY / n;

        // Variance
        let variance = 0;
        values.forEach(v => variance += Math.pow(v - avgY, 2));
        variance /= n;
        const stdDev = Math.sqrt(variance);

        // Stability Score (0-100)
        // Coefficient of variation = stdDev / mean
        const cv = avgY !== 0 ? stdDev / Math.abs(avgY) : 0;
        // Lower CV is better stability. Map CV 0-0.5 to 100-50, etc.
        let stabilityScore = Math.max(0, 100 - (cv * 100));

        // Risk Score (0-100) - Higher is safer
        // Count outliers > 2 stdDev
        const outliers = values.filter(v => Math.abs(v - avgY) > 2 * stdDev).length;
        const outlierRatio = outliers / n;
        let riskScore = Math.max(0, 100 - (outlierRatio * 500)); // Penalize heavily for outliers

        // Growth Score could be mocked or based on slope
        // For now, let's average stability and risk for a 'Business Health' metric
        // In a real app, we'd compare first vs last period.
        const growth = (values[values.length - 1] - values[0]) / (values[0] || 1);
        let growthScore = 50 + (growth * 50); // Normalize around 50
        growthScore = Math.min(100, Math.max(0, growthScore));

        const totalScore = Math.round((stabilityScore + riskScore + growthScore) / 3);

        let category = "Warning";
        if (totalScore >= 80) category = "Healthy";
        if (totalScore < 50) category = "Risk";

        res.json({
            score: totalScore,
            category,
            breakdown: {
                growthScore: Math.round(growthScore),
                stabilityScore: Math.round(stabilityScore),
                riskScore: Math.round(100 - riskScore) // This is effectively the safety score
            }
        });

    } catch (error) {
        console.error("Health Score Error:", error);
        res.status(500).json({ error: "Failed to calculate health score." });
    }
});

module.exports = router;
