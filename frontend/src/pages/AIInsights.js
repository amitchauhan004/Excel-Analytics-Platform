import React, { useEffect, useState } from "react";
import API_BASE_URL from "../apiConfig";

import axios from "axios";
import { useHistory, useLocation } from "react-router-dom";
import AIInsightPanel from "../components/AIInsightPanel";

const AIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentInsight, setCurrentInsight] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFileData, setSelectedFileData] = useState(null);

  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    fetchFiles();
    fetchInsights();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fileId = urlParams.get('fileId');

    if (fileId && files.length > 0) {
      const file = files.find(f => f._id === fileId);
      if (file) {
        handleFileSelect(file);
        const existingInsight = insights.find(insight => insight.fileId === fileId);
        if (!existingInsight) {
          analyzeFile(fileId);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, location.search]);

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}files`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setFiles(res.data);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError(err.response?.data?.error || "Failed to fetch files.");
    }
  };

  const fetchInsights = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}insights`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setInsights(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError(err.response?.data?.error || "Failed to fetch AI insights.");
      setIsLoading(false);
    }
  };

  const analyzeFile = async (fileId) => {
    setIsAnalyzing(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}insights/${fileId}/analyze`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const updatedInsights = insights.filter(insight => insight.fileId !== fileId);
      updatedInsights.unshift(res.data);
      setInsights(updatedInsights);

      setCurrentInsight(res.data);
      setIsAnalyzing(false);
    } catch (err) {
      console.error("Error analyzing file:", err);
      setError(err.response?.data?.error || "Failed to analyze file for AI insights.");
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setSelectedFileData(null);

    try {
      const res = await axios.get(`${API_BASE_URL}data/file/${file._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (Array.isArray(res.data)) {
        setSelectedFileData(res.data);
      }
    } catch (err) {
      console.error("Error fetching file data:", err);
    }

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
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-slate-900">
                AI Insights & Data Copilot
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 border border-sky-200 text-sky-700">
                Copilot v2.0
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1">Autonomous data pattern detection, quality statistics & strategic Copilot assistant.</p>
          </div>
        </div>
      </div>

      {/* File Selection Section */}
      <div className="card-premium p-6">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Select File for AI Analysis
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {files.map((file) => {
            const isSelected = selectedFile?._id === file._id;
            return (
              <div
                key={file._id}
                onClick={() => handleFileSelect(file)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${isSelected ? "border-sky-500 bg-sky-50/70 ring-2 ring-sky-100 shadow-sm" : "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100"}`}
              >
                <div className="overflow-hidden">
                  <h3 className={`font-semibold text-xs truncate ${isSelected ? 'text-sky-900' : 'text-slate-800'}`}>{file.originalName}</h3>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                    <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{file.rowCount || 0} rows</span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 bg-white'}`}>
                  {isSelected && (
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Data Copilot Section */}
      {selectedFile && selectedFileData && selectedFileData.length > 0 && (
        <div>
          <AIInsightPanel data={selectedFileData} fileId={selectedFile._id} />
        </div>
      )}

      {/* Analysis Section */}
      {selectedFile && (
        <div className="card-premium p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-slate-100 gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Detailed Analysis: <span className="text-sky-600">{selectedFile.originalName}</span>
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">Run deep statistical profiling and pattern recognition.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => analyzeFile(selectedFile._id)}
                disabled={isAnalyzing}
                className={`btn-primary text-xs py-2 px-4 flex items-center gap-2 ${isAnalyzing ? "opacity-70 cursor-wait" : ""}`}
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Generate AI Insights</span>
                  </>
                )}
              </button>
              <button
                onClick={() => navigateToAnalyze(selectedFile._id)}
                className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Analyze Charts</span>
              </button>
            </div>
          </div>

          {currentInsight && (
            <div className="space-y-5 animate-fadeIn">
              {/* Summary */}
              <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-sky-800 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Executive Summary
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">{currentInsight.insights.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Patterns */}
                {currentInsight.insights.patterns && currentInsight.insights.patterns.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Key Patterns Detected
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {currentInsight.insights.patterns.map((pattern, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span>{pattern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {currentInsight.insights.recommendations && currentInsight.insights.recommendations.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      AI Recommendations
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {currentInsight.insights.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Statistics */}
              {currentInsight.insights.statistics && Object.keys(currentInsight.insights.statistics).length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Column Statistics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(currentInsight.insights.statistics).map(([column, stats]) => (
                      <div key={column} className="p-3 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
                        <h4 className="font-semibold text-xs text-slate-800 truncate">{column}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 block">{stats.type}</span>
                        {stats.type === 'numeric' && (
                          <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                            <p>Average: <strong className="text-slate-800">{stats.average}</strong></p>
                            <p>Range: <strong className="text-slate-800">{stats.range}</strong></p>
                          </div>
                        )}
                        {stats.type === 'categorical' && (
                          <div className="text-[11px] text-slate-600 mt-1">
                            <p>Unique Values: <strong className="text-slate-800">{stats.uniqueValues}</strong></p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Quality */}
              {currentInsight.insights.dataQuality && Object.keys(currentInsight.insights.dataQuality).length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Data Health & Quality Metrics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(currentInsight.insights.dataQuality).map(([column, quality]) => (
                      <div key={column} className="p-3 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
                        <h4 className="font-semibold text-xs text-slate-800 truncate">{column}</h4>
                        <div className="mt-1 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Completeness:</span>
                          <span className="font-bold text-emerald-700">{quality.completeness}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
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
        <div className="card-premium p-6">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent AI Insights History
          </h2>
          <div className="space-y-3">
            {insights.slice(0, 5).map((insight) => (
              <div
                key={insight.fileId}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-xs text-slate-900 truncate">{insight.fileName}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Analyzed on {new Date(insight.uploadedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
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
                  className="btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto shrink-0"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center p-8 bg-white rounded-2xl border border-slate-200/80">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-sky-500 border-t-transparent"></div>
          <span className="ml-3 text-xs font-semibold text-slate-600">Loading AI insights...</span>
        </div>
      )}

      {/* No Data Message */}
      {!isLoading && files.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center p-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-800">No Files Available</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Upload Excel datasets from the Upload page to start generating AI insights and copilot analytics.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;