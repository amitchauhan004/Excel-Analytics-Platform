const express = require("express");
const router = express.Router();
const FileMeta = require("../models/FileMeta");
const DataRow = require("../models/DataRow");
const { authMiddleware } = require("../middleware/authMiddleware");

// Test endpoint to check if insights route is working
router.get("/test", (req, res) => {
  res.json({ message: "Insights route is working", timestamp: new Date().toISOString() });
});

// Get all insights for a user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const files = await FileMeta.find({ uploadedBy: req.user.id }).sort({ uploadedAt: -1 });
    const insights = [];
    
    for (const file of files) {
      const fileInsights = await generateInsightsForFile(file);
      insights.push({
        fileId: file._id,
        fileName: file.originalName,
        insights: fileInsights,
        uploadedAt: file.uploadedAt
      });
    }
    
    res.json(insights);
  } catch (err) {
    console.error("Error fetching insights:", err);
    res.status(500).json({ error: "Failed to fetch insights" });
  }
});

// Analyze file for AI insights
router.get("/:id/analyze", authMiddleware, async (req, res) => {
  try {
    console.log("Analyzing file with ID:", req.params.id);
    console.log("User ID:", req.user.id);
    
    const file = await FileMeta.findById(req.params.id);
    if (!file) {
      console.log("File not found for ID:", req.params.id);
      return res.status(404).json({ error: "File not found" });
    }

    console.log("File found:", file.originalName);
    const insights = await generateInsightsForFile(file);
    console.log("Insights generated successfully");
    
    const response = { 
      fileName: file.originalName, 
      insights,
      fileId: file._id,
      uploadedAt: file.uploadedAt
    };
    
    console.log("Sending response:", JSON.stringify(response, null, 2));
    res.json(response);
  } catch (err) {
    console.error("Error during AI analysis:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Failed to analyze file for AI insights" });
  }
});

// Generate insights for a specific file
async function generateInsightsForFile(file) {
  try {
    console.log("Generating insights for file:", file.originalName);
    
    // Get the actual data for analysis
    const dataRows = await DataRow.find({ fileId: file._id }).limit(100);
    console.log("Found data rows:", dataRows.length);
    
    if (dataRows.length === 0) {
      console.log("No data rows found for file");
      return {
        summary: "No data available for analysis",
        patterns: [],
        recommendations: ["Upload data to get AI insights"],
        statistics: {},
        dataQuality: {}
      };
    }

    // Extract data for analysis
    const data = dataRows.map(row => row.data);
    const columns = Object.keys(data[0] || {});
    console.log("Columns found:", columns);
    
    // Basic statistical analysis
    const statistics = analyzeStatistics(data, columns);
    const dataQuality = analyzeDataQuality(data, columns);
    
    // Generate insights using basic analysis (no OpenAI required)
    const insights = generateBasicInsights(file.originalName, data, columns, statistics);
    
    console.log("Insights generated successfully");
    return {
      summary: insights.summary,
      patterns: insights.patterns,
      recommendations: insights.recommendations,
      statistics: statistics,
      dataQuality: dataQuality
    };
  } catch (err) {
    console.error("Error generating insights:", err);
    console.error("Error stack:", err.stack);
    return {
      summary: "Unable to generate insights at this time",
      patterns: [],
      recommendations: ["Try again later"],
      statistics: {},
      dataQuality: {}
    };
  }
}

// Analyze basic statistics
function analyzeStatistics(data, columns) {
  const stats = {};
  
  columns.forEach(column => {
    const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined);
    
    if (values.length > 0) {
      // Check if numeric
      const numericValues = values.filter(val => !isNaN(parseFloat(val))).map(val => parseFloat(val));
      
      if (numericValues.length > 0) {
        const sum = numericValues.reduce((a, b) => a + b, 0);
        const avg = sum / numericValues.length;
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        
        stats[column] = {
          type: 'numeric',
          count: numericValues.length,
          average: avg.toFixed(2),
          min: min,
          max: max,
          range: (max - min).toFixed(2)
        };
      } else {
        // Categorical data
        const uniqueValues = [...new Set(values)];
        stats[column] = {
          type: 'categorical',
          count: values.length,
          uniqueValues: uniqueValues.length,
          topValues: uniqueValues.slice(0, 5)
        };
      }
    }
  });
  
  return stats;
}

// Analyze data quality
function analyzeDataQuality(data, columns) {
  const quality = {};
  
  columns.forEach(column => {
    const values = data.map(row => row[column]);
    const nullCount = values.filter(val => val === null || val === undefined || val === '').length;
    const completeness = ((data.length - nullCount) / data.length * 100).toFixed(1);
    
    quality[column] = {
      completeness: `${completeness}%`,
      missingValues: nullCount,
      totalValues: data.length
    };
  });
  
  return quality;
}

// Generate basic insights without OpenAI
function generateBasicInsights(fileName, data, columns, statistics) {
  const numericColumns = Object.keys(statistics).filter(col => statistics[col].type === 'numeric');
  const categoricalColumns = Object.keys(statistics).filter(col => statistics[col].type === 'categorical');
  
  // Generate summary
  let summary = `Analysis of ${fileName}: The dataset contains ${data.length} rows and ${columns.length} columns. `;
  if (numericColumns.length > 0) {
    summary += `There are ${numericColumns.length} numeric columns for quantitative analysis. `;
  }
  if (categoricalColumns.length > 0) {
    summary += `There are ${categoricalColumns.length} categorical columns for grouping and classification.`;
  }
  
  // Generate patterns
  const patterns = [];
  if (numericColumns.length > 0) {
    patterns.push(`${numericColumns.length} numeric columns detected for statistical analysis`);
  }
  if (categoricalColumns.length > 0) {
    patterns.push(`${categoricalColumns.length} categorical columns available for grouping analysis`);
  }
  patterns.push(`Total of ${data.length} data points available for analysis`);
  
  // Generate recommendations
  const recommendations = [
    "Use data visualization to better understand patterns and trends",
    "Consider creating charts and graphs for key metrics",
    "Export the analyzed data for further processing",
    "Review data quality metrics to ensure data integrity",
    "Consider segmenting data by categorical variables for deeper insights"
  ];
  
  return {
    summary,
    patterns,
    recommendations
  };
}

module.exports = router;
