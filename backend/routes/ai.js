const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");

/**
 * POST /api/ai/analyze
 * Analyze Excel data using OpenRouter AI
 * 
 * Input: JSON parsed Excel data (array of objects)
 * Returns: Structured insights including trends, anomalies, and recommendations
 */
router.post("/analyze", authMiddleware, async (req, res) => {
  try {
    const { data } = req.body;

    // Validate input
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ 
        error: "Invalid data format. Expected an array of objects." 
      });
    }

    console.log("AI Analysis requested for", data.length, "rows");

    // Extract summary from data
    const columnNames = Object.keys(data[0] || {});
    const rowCount = data.length;
    
    // Get first 5 rows as sample
    const sampleRows = data.slice(0, 5).map(row => {
      const sampleRow = {};
      columnNames.forEach(col => {
        sampleRow[col] = row[col];
      });
      return sampleRow;
    });

    // Prepare data summary for AI
    const dataSummary = {
      columnNames,
      rowCount,
      sampleRows,
      dataTypes: {}
    };

    // Detect data types for each column
    columnNames.forEach(col => {
      const values = data.slice(0, 100).map(row => row[col]).filter(v => v !== null && v !== undefined);
      const numericCount = values.filter(v => !isNaN(parseFloat(v))).length;
      const totalValid = values.length;
      
      if (totalValid > 0) {
        if (numericCount / totalValid > 0.8) {
          dataSummary.dataTypes[col] = "numeric";
        } else {
          dataSummary.dataTypes[col] = "categorical";
        }
      }
    });

    // Call OpenRouter API
    const openRouterResponse = await callOpenRouterAI(dataSummary);

    // Return structured response
    res.json({
      success: true,
      summary: {
        columnNames,
        rowCount,
        dataTypes: dataSummary.dataTypes
      },
      insights: openRouterResponse
    });

  } catch (error) {
    console.error("AI Analysis Error:", error);
    
    // Return fallback response on API failure
    res.status(500).json({
      success: false,
      error: "Failed to analyze data with AI",
      fallback: {
        trends: ["Unable to generate trends - API error"],
        anomalies: ["Unable to detect anomalies - API error"],
        recommendations: ["Please try again later or check your API key"]
      }
    });
  }
});

/**
 * Call OpenRouter AI API to analyze data
 * @param {Object} dataSummary - Summary of the data to analyze
 * @returns {Object} - Structured insights from AI
 */
async function callOpenRouterAI(dataSummary) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const prompt = `You are a business data analyst. Analyze this dataset summary and provide:
  - Key trends (what patterns do you see in the data)
  - Anomalies (any unusual values or outliers)
  - Business recommendations (what actions should be taken)

  Dataset Summary:
  - Columns: ${dataSummary.columnNames.join(", ")}
  - Total Rows: ${dataSummary.rowCount}
  - Data Types: ${JSON.stringify(dataSummary.dataTypes)}
  - Sample Data (first 10 rows): ${JSON.stringify(dataSummary.sampleRows, null, 2)}

  Format your response as a clean JSON object with these exact keys: "trends", "anomalies", "recommendations". 
  Each value should be an array of short strings (2-5 words each).
  Example: {"trends": ["trend1", "trend2"], "anomalies": ["anomaly1"], "recommendations": ["rec1", "rec2"]}
  Do NOT use markdown code blocks. Return ONLY valid JSON.`;

  const requestBody = {
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a business data analyst expert."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  };

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "XcelFlow AI Analytics"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const result = await response.json();
  
  // Parse the AI response
  try {
    const content = result.choices[0].message.content;
    
    // Try to parse as JSON
    let parsedInsights;
    try {
      parsedInsights = JSON.parse(content);
      
      // If the JSON has nested structure, extract the relevant parts
      if (parsedInsights.trends && typeof parsedInsights.trends === 'string') {
        try {
          parsedInsights = JSON.parse(parsedInsights.trends);
        } catch (e) {
          // If it's a string representation, just use it as is
        }
      }
    } catch (parseError) {
      // If not valid JSON, try to extract JSON from the text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedInsights = JSON.parse(jsonMatch[0]);
        } catch (e) {
          // If still fails, create structured response from text
          const lines = content.split('\n').filter(l => l.trim());
          parsedInsights = {
            trends: lines.filter(l => l.includes('trend') || l.includes('📈')).slice(0, 3),
            anomalies: lines.filter(l => l.includes('anomal') || l.includes('⚠️')).slice(0, 3),
            recommendations: lines.filter(l => l.includes('recommend') || l.includes('💡')).slice(0, 3)
          };
        }
      } else {
        // Create structured response from text
        parsedInsights = {
          trends: [content.substring(0, 200)],
          anomalies: ["Could not detect anomalies"],
          recommendations: ["Review data manually"]
        };
      }
    }
    
    // Ensure all fields are arrays
    if (!Array.isArray(parsedInsights.trends)) {
      parsedInsights.trends = [String(parsedInsights.trends)].filter(Boolean);
    }
    if (!Array.isArray(parsedInsights.anomalies)) {
      parsedInsights.anomalies = [String(parsedInsights.anomalies)].filter(Boolean);
    }
    if (!Array.isArray(parsedInsights.recommendations)) {
      parsedInsights.recommendations = [String(parsedInsights.recommendations)].filter(Boolean);
    }
    
    return parsedInsights;
  } catch (parseError) {
    console.error("Error parsing AI response:", parseError);
    return {
      trends: ["Unable to extract trends"],
      anomalies: ["Unable to detect anomalies"],
      recommendations: ["Please try again"]
    };
  }
}

// Test endpoint
router.get("/test", (req, res) => {
  res.json({ 
    message: "AI route is working", 
    timestamp: new Date().toISOString(),
    status: "ready"
  });
});

module.exports = router;
