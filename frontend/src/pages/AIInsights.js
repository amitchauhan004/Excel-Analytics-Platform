import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory, useLocation } from "react-router-dom";

const AIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentInsight, setCurrentInsight] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    fetchFiles();
    fetchInsights();
  }, []);

  useEffect(() => {
    // Check if fileId is provided in URL
    const urlParams = new URLSearchParams(location.search);
    const fileId = urlParams.get('fileId');
    
    if (fileId && files.length > 0) {
      const file = files.find(f => f._id === fileId);
      if (file) {
        handleFileSelect(file);
        // Auto-analyze if no existing insight
        const existingInsight = insights.find(insight => insight.fileId === fileId);
        if (!existingInsight) {
          analyzeFile(fileId);
        }
      }
    }
  }, [files, location.search]);

  const fetchFiles = async () => {
    try {
      console.log("Fetching files...");
      const res = await axios.get("https://excel-analytics-platform-flame.vercel.app/api/files", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Files response:", res.data);
      setFiles(res.data);
    } catch (err) {
      console.error("Error fetching files:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.error || "Failed to fetch files.");
    }
  };

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(""); // Clear previous errors
    try {
      console.log("Fetching insights...");
      const res = await axios.get("https://excel-analytics-platform-flame.vercel.app/api/insights", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Insights response:", res.data);
      setInsights(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching insights:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      setError(err.response?.data?.error || "Failed to fetch AI insights.");
      setIsLoading(false);
    }
  };

  const analyzeFile = async (fileId) => {
    setIsAnalyzing(true);
    setError(""); // Clear previous errors
    try {
      console.log("Analyzing file with ID:", fileId);
      const res = await axios.get(`https://excel-analytics-platform-flame.vercel.app/api/insights/${fileId}/analyze`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      console.log("Analysis response:", res.data);
      
      // Update insights list
      const updatedInsights = insights.filter(insight => insight.fileId !== fileId);
      updatedInsights.unshift(res.data);
      setInsights(updatedInsights);
      
      setCurrentInsight(res.data);
      setIsAnalyzing(false);
    } catch (err) {
      console.error("Error analyzing file:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      setError(err.response?.data?.error || "Failed to analyze file for AI insights.");
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    const existingInsight = insights.find(insight => insight.fileId === file._id);
    if (existingInsight) {
      setCurrentInsight(existingInsight);
    } else {
      setCurrentInsight(null);
    }
  };

  const navigateToAnalyze = (fileId) => {
    history.push(`/analyze?fileId=${fileId}`);
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-100 text-gray-900">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">🤖 AI Insights</h1>
        
        {/* File Selection Section */}
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-lg shadow-lg bg-white">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Select File for Analysis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {files.map((file) => (
              <div
                key={file._id}
                onClick={() => handleFileSelect(file)}
                className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedFile?._id === file._id
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <h3 className="font-medium truncate text-sm sm:text-base">{file.originalName}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {file.rowCount || 0} rows
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Section */}
        {selectedFile && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-lg shadow-lg bg-white">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h2 className="text-lg sm:text-xl font-semibold">
                Analysis for: {selectedFile.originalName}
              </h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => analyzeFile(selectedFile._id)}
                  disabled={isAnalyzing}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                    isAnalyzing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-teal-500 hover:bg-teal-600 text-white"
                  }`}
                >
                  {isAnalyzing ? "Analyzing..." : "Generate AI Insights"}
                </button>
                <button
                  onClick={() => navigateToAnalyze(selectedFile._id)}
                  className="px-3 sm:px-4 py-2 rounded-lg transition-colors bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base"
                >
                  📊 Analyze Data
                </button>
              </div>
            </div>

            {currentInsight && (
              <div className="space-y-4 sm:space-y-6">
                {/* Summary */}
                <div className="p-3 sm:p-4 rounded-lg bg-gray-50">
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">📋 Summary</h3>
                  <p className="text-sm sm:text-base">{currentInsight.insights.summary}</p>
                </div>

                {/* Patterns */}
                {currentInsight.insights.patterns && currentInsight.insights.patterns.length > 0 && (
                  <div className="p-3 sm:p-4 rounded-lg bg-gray-50">
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">🔍 Key Patterns</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
                      {currentInsight.insights.patterns.map((pattern, index) => (
                        <li key={index}>{pattern}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {currentInsight.insights.recommendations && currentInsight.insights.recommendations.length > 0 && (
                  <div className="p-3 sm:p-4 rounded-lg bg-gray-50">
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">💡 Recommendations</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
                      {currentInsight.insights.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Statistics */}
                {currentInsight.insights.statistics && Object.keys(currentInsight.insights.statistics).length > 0 && (
                  <div className="p-3 sm:p-4 rounded-lg bg-gray-50">
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">📊 Statistics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {Object.entries(currentInsight.insights.statistics).map(([column, stats]) => (
                        <div key={column} className="p-2 sm:p-3 rounded bg-white">
                          <h4 className="font-medium text-xs sm:text-sm">{column}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Type: {stats.type}
                          </p>
                          {stats.type === 'numeric' && (
                            <div className="text-xs mt-1">
                              <p>Avg: {stats.average}</p>
                              <p>Range: {stats.range}</p>
                            </div>
                          )}
                          {stats.type === 'categorical' && (
                            <div className="text-xs mt-1">
                              <p>Unique: {stats.uniqueValues}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data Quality */}
                {currentInsight.insights.dataQuality && Object.keys(currentInsight.insights.dataQuality).length > 0 && (
                  <div className="p-3 sm:p-4 rounded-lg bg-gray-50">
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">✅ Data Quality</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {Object.entries(currentInsight.insights.dataQuality).map(([column, quality]) => (
                        <div key={column} className="p-2 sm:p-3 rounded bg-white">
                          <h4 className="font-medium text-xs sm:text-sm">{column}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Completeness: {quality.completeness}
                          </p>
                          <p className="text-xs text-gray-500">
                            Missing: {quality.missingValues} / {quality.totalValues}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recent Insights */}
        {insights.length > 0 && (
          <div className="p-4 sm:p-6 rounded-lg shadow-lg bg-white">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recent AI Insights</h2>
            <div className="space-y-3 sm:space-y-4">
              {insights.slice(0, 5).map((insight) => (
                <div
                  key={insight.fileId}
                  className="p-3 sm:p-4 border rounded-lg border-gray-300"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm sm:text-base">{insight.fileName}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {new Date(insight.uploadedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs sm:text-sm mt-2">
                        {insight.insights.summary}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const file = files.find(f => f._id === insight.fileId);
                        if (file) {
                          handleFileSelect(file);
                        }
                      }}
                      className="px-2 sm:px-3 py-1 rounded text-xs sm:text-sm bg-teal-500 hover:bg-teal-600 text-white self-start sm:self-auto"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 sm:p-4 rounded-lg bg-red-100 text-red-700 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center p-6 sm:p-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-teal-500"></div>
            <span className="ml-2 text-sm sm:text-base">Loading insights...</span>
          </div>
        )}

        {/* No Data Message */}
        {!isLoading && files.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🤖</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No Files Available</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Upload Excel files to start generating AI insights.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;