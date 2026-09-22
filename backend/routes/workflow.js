const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * POST /api/workflow/recommend
 * Generates workflow recommendations based on data trends and anomalies.
 * 
 * Input: { data: parsedExcelArray }
 * Returns: { recommendations: [], priority: [], expectedImpact: [] }
 */
router.post('/recommend', authMiddleware, async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: "Invalid or empty data provided." });
    }

    // 1. Extract Basic Statistics
    const summary = extractDataSummary(data);

    // 2. Call AI for Recommendations
    const aiResponse = await callWorkflowAI(summary);

    res.json(aiResponse);

  } catch (error) {
    console.error("Workflow Recommendation Error:", error);
    res.status(500).json({ error: "Failed to generate workflow recommendations." });
  }
});

// Helper: Extract Data Summary
function extractDataSummary(data) {
  const keys = Object.keys(data[0] || {});
  const rowCount = data.length;

  // Calculate stats for numeric columns
  const numericStats = {};
  keys.forEach(key => {
    const values = data.map(row => Number(row[key])).filter(n => !isNaN(n));
    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;

      // Basic anomaly detection (values > 2 std dev)
      const squareDiffs = values.map(v => Math.pow(v - avg, 2));
      const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
      const stdDev = Math.sqrt(avgSquareDiff);
      const anomalies = values.filter(v => Math.abs(v - avg) > 2 * stdDev).length;

      numericStats[key] = {
        total: sum.toFixed(2),
        average: avg.toFixed(2),
        anomalies
      };
    }
  });

  return {
    columns: keys,
    rowCount,
    numericStats,
    sample: data.slice(0, 5) // Reduced sample for token efficiency
  };
}

// Helper: Call OpenRouter AI
async function callWorkflowAI(summary) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    // Fallback if no key (for dev/testing without key)
    return {
      recommendations: ["Configure API Key for AI insights", "Review data manually"],
      priority: ["High", "Medium"],
      expectedImpact: ["High", "Medium"]
    };
  }

  const prompt = `
    Analyze this dataset summary for business workflow improvements.
    
    Data Summary:
    - Rows: ${summary.rowCount}
    - Columns: ${summary.columns.join(', ')}
    - Numeric Stats: ${JSON.stringify(summary.numericStats)}
    - Sample Data: ${JSON.stringify(summary.sample)}

    Identify potential bottlenecks, automation opportunities, or process improvements.
    Return a JSON object STRICTLY with:
    - "recommendations": A list of 3-5 specific actionable workflow changes.
    - "priority": A corresponding list of priorities (High, Medium, Low).
    - "expectedImpact": A corresponding list of expected business impacts (e.g., "Saves 5 hrs/week", "Reduces error rate by 20%").
    
    Only return raw JSON.
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

    // Parse JSON from content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Invalid JSON format from AI");
    }

  } catch (err) {
    console.error("AI Call Failed", err);
    // Fallback response
    return {
      recommendations: ["Optimize data entry process", "Automate reporting"],
      priority: ["Medium", "High"],
      expectedImpact: ["Medium time saving", "High visibility"]
    };
  }
}

module.exports = router;
