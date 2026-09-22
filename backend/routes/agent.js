const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");

// Helper to clean and parse numbers
const parseValue = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val !== 'string') return NaN;

    // Remove currency symbols, commas, percentages, and whitespace
    const cleanStr = val.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? NaN : num;
};

// Helper to calculate basic stats
const calculateStats = (data) => {
    if (!data || data.length === 0) return {};

    const headers = Object.keys(data[0]);
    const stats = {};

    // Identify numeric columns
    const numericCols = headers.filter(header => {
        // Get all non-null/undefined values for this column
        const validValues = data.map(row => row[header]).filter(v => v !== undefined && v !== null && v !== '');

        if (validValues.length === 0) return false;

        // Count how many are parsable numbers
        const numCount = validValues.filter(val => !isNaN(parseValue(val))).length;

        // If >= 70% of valid values are numeric, treat as numeric column
        return (numCount / validValues.length) >= 0.7;
    });

    // Calculate stats for top numeric columns
    numericCols.slice(0, 8).forEach(col => { // Increased limit to 8
        const values = data
            .map(row => parseValue(row[col]))
            .filter(val => !isNaN(val));

        if (values.length > 0) {
            const min = Math.min(...values);
            const max = Math.max(...values);
            const sum = values.reduce((a, b) => a + b, 0);
            const mean = sum / values.length;

            // Standard Deviation
            const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);

            stats[col] = {
                min,
                max,
                mean: mean.toFixed(2),
                stdDev: stdDev.toFixed(2)
            };
        }
    });

    return stats;
};

// Helper: Call OpenRouter AI (Self-contained to avoid modifying other files)
async function callAI(statsSummary) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

    const prompt = `
      You are an Autonomous Business Insight Agent. 
      Analyze the following statistical summary of a dataset and provide strategic advice.
      
      Dataset Statistics:
      ${JSON.stringify(statsSummary, null, 2)}
      
      Respond with a JSON object containing EXACTLY these 4 keys:
      1. "insights": [List of 3 key patterns or observations]
      2. "risks": [List of 3 potential business risks]
      3. "opportunities": [List of 3 growth or optimization opportunities]
      4. "actions": [List of 3 concrete recommended actions]
      
      Format: Pure JSON. No Markdown.
    `;

    const fetch = await import('node-fetch').then(mod => mod.default).catch(() => global.fetch);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "XcelFlow Agent"
        },
        body: JSON.stringify({
            model: "openai/gpt-4o-mini", // Efficient model
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`AI API Error: ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;

    try {
        // Attempt to parse JSON
        // Remove markdown code blocks if present
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanContent);
    } catch (e) {
        console.error("Failed to parse AI response:", content);
        // Fallback structure
        return {
            insights: ["Could not parse AI insights"],
            risks: ["Check data integrity"],
            opportunities: ["Review manual data"],
            actions: ["Try generating again"]
        };
    }
}

// POST /api/agent/analyze
router.post("/analyze", authMiddleware, async (req, res) => {
    try {
        const { data } = req.body;

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ error: "Invalid data format" });
        }

        // 1. Calculate Stats
        const stats = calculateStats(data);

        // 2. Call AI
        const analysis = await callAI(stats);

        res.json(analysis);

    } catch (err) {
        console.error("Agent Error:", err);
        res.status(500).json({ error: err.message || "Agent analysis failed" });
    }
});

module.exports = router;
