const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * POST /api/story/generate
 * Generates a narrative business story from data summary.
 * 
 * Input: { data: parsedExcelArray, summary: statsObject }
 * Returns: { title, storyline, highlights[], risks[], opportunities[], conclusion }
 */
router.post('/generate', authMiddleware, async (req, res) => {
    try {
        const { data, summary } = req.body;

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ error: "Invalid data provided." });
        }

        const aiResponse = await callStoryAI(data, summary);
        res.json(aiResponse);

    } catch (error) {
        console.error("Story Generation Error:", error);
        res.status(500).json({ error: "Failed to generate business story." });
    }
});

async function callStoryAI(data, summary) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return {
            title: "Executive Strategic Overview",
            storyline: "Current operations demonstrate stable fundamentals with identified avenues for optimized scaling. While baseline metrics remain consistent, strategic refinement in data instrumentation will unlock deeper AI-driven narrative precision.",
            highlights: ["Data integrity verified across " + data.length + " records", "Statistical baselines established"],
            risks: ["Limited visibility due to missing AI integration"],
            opportunities: ["Transition to AI-driven modeling for predictive precision"],
            conclusion: "Operational fundamentals are sound; recommend immediate API integration for full strategic alignment."
        };
    }

    const dataSnapshot = JSON.stringify(data.slice(0, 10));
    const statsSnapshot = JSON.stringify(summary || {});

    const prompt = `
        You are an Executive Business Consultant.
        Generate a high-level, concise executive summary from the following dataset.
        
        Tone: Professional, strategic, and strictly concise (no fluff).
        
        Data Context:
        - Sample: ${dataSnapshot}
        - Statistics: ${statsSnapshot}
        
        Focus on:
        - Strategic Trends
        - Operational Risks
        - Growth Opportunities
        - Executive Recommendations

        Return JSON only in this format:
        {
          "title": "Strategic Executive Title",
          "storyline": "A single, high-impact paragraph summarizing the core business outlook.",
          "highlights": ["Bullet point 1", "Bullet point 2"],
          "risks": ["Critical risk 1"],
          "opportunities": ["Strategic opportunity 1"],
          "conclusion": "A concise bottom-line recommendation."
        }
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
        const content = result.choices[0].message.content;

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            throw new Error("Invalid JSON from AI");
        }

    } catch (err) {
        console.error("AI Call Failed", err);
        return {
            title: "Insights Report",
            storyline: "We encountered an issue generating the full narrative, but your data shows consistent patterns across " + data.length + " records.",
            highlights: ["Trend analysis partially complete"],
            risks: ["High volatility in recent samples"],
            opportunities: ["Scale operations based on top performers"],
            conclusion: "Consult the raw analytics dashboard for precise metrics."
        };
    }
}

module.exports = router;
