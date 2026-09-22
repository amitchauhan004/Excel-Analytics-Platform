const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * POST /api/explain
 * Provides AI-driven explanation for a specific insight or recommendation.
 * 
 * Input: { insight: string, context: {} }
 * Returns: { explanation: string }
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { insight, dataSummary, context } = req.body;

        if (!insight) {
            return res.status(400).json({ error: "No insight provided to explain." });
        }

        const aiResponse = await callExplainAI(insight, dataSummary || context);
        res.json(aiResponse);

    } catch (error) {
        console.error("Explain AI Error:", error);
        res.status(500).json({ error: "Failed to generate explanation." });
    }
});

async function callExplainAI(insight, context) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return { explanation: "AI explanation unavailable (API Key missing). This insight was derived from statistical analysis of your dataset outliers and trends." };
    }

    const prompt = `
        Explain why this business insight was generated in simple terms for a manager.
        
        Insight: "${insight}"
        Context: ${JSON.stringify(context || {})}
        
        Provide a concise, clear explanation (max 2 sentences).
    `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error("AI API Error");

        const result = await response.json();
        const explanation = result.choices[0].message.content;

        return { explanation };

    } catch (err) {
        console.error("AI Call Failed", err);
        return { explanation: "Detailed explanation currently unavailable. Please review the raw data for more context." };
    }
}

module.exports = router;
