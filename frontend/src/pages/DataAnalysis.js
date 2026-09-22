import React, { useState, useEffect } from "react";
import API_BASE_URL from "../apiConfig";

import axios from "axios";
import { useLocation, useHistory } from "react-router-dom";
import ChartGenerator from "../components/ChartGenerator";

const DataAnalysis = () => {
  const [excelData, setExcelData] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [fileStats, setFileStats] = useState(null);
  const [allFiles, setAllFiles] = useState([]);

  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    // Get fileId from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const fileId = urlParams.get('fileId');

    // Fetch uploaded file data from the backend
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        let res;
        let file;

        // First, fetch all files for the selector
        const filesRes = await axios.get(`${API_BASE_URL}files`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAllFiles(filesRes.data);

        if (fileId) {
          // Fetch specific file data
          res = await axios.get(`${API_BASE_URL}data/file/${fileId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          file = filesRes.data.find(f => f._id === fileId);
        } else {
          if (filesRes.data && filesRes.data.length > 0) {
            // Get the most recent file
            const latestFile = filesRes.data.sort((a, b) =>
              new Date(b.uploadedAt) - new Date(a.uploadedAt)
            )[0];

            file = latestFile;

            // Fetch data for the latest file
            res = await axios.get(`${API_BASE_URL}data/file/${latestFile._id}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });

            // Update URL to include the file ID
            window.history.pushState({}, '', `/analyze?fileId=${latestFile._id}`);
          } else {
            // No files available
            setExcelData([]);
            setCurrentFile(null);
            setFileStats(null);
            setIsLoading(false);
            return;
          }
        }

        setCurrentFile(file);

        // Calculate file statistics
        if (res.data && res.data.length > 0) {
          calculateFileStats(res.data);
        }

        setExcelData(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
        setExcelData([]);
        setCurrentFile(null);
        setFileStats(null);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [location.search]);

  // Listen for user changes and refresh data
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        // Refresh data when user changes
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const calculateFileStats = (data) => {
    if (!data || data.length === 0) return;

    const columns = Object.keys(data[0]);
    const stats = {
      totalRows: data.length,
      totalColumns: columns.length,
      columnTypes: {},
      dataQuality: {}
    };

    columns.forEach(column => {
      const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined && val !== '');
      const nullCount = data.length - values.length;
      const completeness = ((values.length / data.length) * 100).toFixed(1);

      // Check if numeric
      const numericValues = values.filter(val => !isNaN(parseFloat(val))).map(val => parseFloat(val));

      if (numericValues.length > 0) {
        const sum = numericValues.reduce((a, b) => a + b, 0);
        const avg = sum / numericValues.length;
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);

        stats.columnTypes[column] = {
          type: 'numeric',
          count: numericValues.length,
          average: avg.toFixed(2),
          min: min,
          max: max,
          range: (max - min).toFixed(2)
        };
      } else {
        const uniqueValues = [...new Set(values)];
        stats.columnTypes[column] = {
          type: 'categorical',
          count: values.length,
          uniqueValues: uniqueValues.length,
          topValues: uniqueValues.slice(0, 5)
        };
      }

      stats.dataQuality[column] = {
        completeness: `${completeness}%`,
        missingValues: nullCount,
        totalValues: data.length
      };
    });

    setFileStats(stats);
  };

  const resetData = () => {
    setExcelData([]);
    setError("");
    setCurrentFile(null);
    setFileStats(null);
    // Remove fileId from URL
    window.history.pushState({}, '', '/analyze');
  };

  const navigateToAIInsights = () => {
    if (currentFile) {
      history.push(`/ai-insights?fileId=${currentFile._id}`);
    }
  };

  const handleFileChange = (selectedFileId) => {
    if (selectedFileId) {
      history.push(`/analyze?fileId=${selectedFileId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs px-4 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-display">
                  Data Analysis
                </h1>
                {currentFile ? (
                  <p className="text-xs text-slate-500 font-medium">
                    Analyzing <span className="font-semibold text-slate-900">{currentFile.originalName}</span> • Uploaded by {typeof currentFile.uploadedBy === 'object' ? (currentFile.uploadedBy?.name || currentFile.uploadedBy?.email || "User") : (currentFile.uploadedBy || "User")} on {new Date(currentFile.uploadedAt).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 font-medium">
                    Select a dataset to view column stats, quality metrics, and interactive visualizations
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* File Selector */}
            {allFiles.length > 0 && (
              <select
                value={currentFile?._id || ""}
                onChange={(e) => handleFileChange(e.target.value)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200/80 text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20"
              >
                {allFiles.map((file) => (
                  <option key={file._id} value={file._id}>
                    {file.originalName} ({new Date(file.uploadedAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}

            {currentFile && (
              <div className="flex items-center gap-2">
                <button
                  onClick={navigateToAIInsights}
                  className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold shadow-md shadow-sky-500/10 px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>AI Insights</span>
                </button>
                <button
                  onClick={resetData}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition-all border border-slate-200"
                >
                  Clear Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Loading Indicator */}
        {isLoading && (
          <div className="card-premium p-8 text-center bg-white rounded-2xl border border-slate-200/80">
            <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold text-slate-600">Loading dataset details and statistics...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* File Overview Section */}
        {currentFile && fileStats && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">File Metrics & Overview</h2>
                <p className="text-xs text-slate-500 font-medium">Dataset size, data types, and quality breakdown</p>
              </div>
            </div>

            {/* Basic Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-premium-hover p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Total Rows</span>
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 font-display">{fileStats.totalRows.toLocaleString()}</p>
              </div>

              <div className="card-premium-hover p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Total Columns</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 font-display">{fileStats.totalColumns}</p>
              </div>

              <div className="card-premium-hover p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Numeric Columns</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 font-display">
                  {Object.values(fileStats.columnTypes).filter(col => col.type === 'numeric').length}
                </p>
              </div>

              <div className="card-premium-hover p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Categorical Columns</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 12h.01M7 17h.01M12 7h7M12 12h7M12 17h7" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 font-display">
                  {Object.values(fileStats.columnTypes).filter(col => col.type === 'categorical').length}
                </p>
              </div>
            </div>

            {/* Column Analysis & Quality Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Column Types */}
              <div className="card-premium p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Column Analysis</h3>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {Object.entries(fileStats.columnTypes).map(([column, stats]) => (
                    <div key={column} className="flex items-center justify-between p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">{column}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${stats.type === 'numeric'
                          ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                          : 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
                          }`}>
                          {stats.type}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-500">
                        {stats.type === 'numeric'
                          ? `avg: ${stats.average}`
                          : `${stats.uniqueValues} unique`
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Quality */}
              <div className="card-premium p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Data Quality</h3>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {Object.entries(fileStats.dataQuality).map(([column, quality]) => {
                    const completenessVal = parseFloat(quality.completeness);
                    return (
                      <div key={column} className="flex items-center justify-between p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60">
                        <span className="font-bold text-xs text-slate-800">{column}</span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${completenessVal > 90
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : completenessVal > 70
                            ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                            : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                          }`}>
                          {quality.completeness} complete
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Preview Section */}
        {excelData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Data Preview</h2>
                <p className="text-xs text-slate-500 font-medium">First 10 rows of {excelData.length} total rows</p>
              </div>
            </div>

            <div className="card-premium overflow-hidden border border-slate-200/80 bg-white rounded-2xl shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200">
                      {Object.keys(excelData[0]).map((key) => (
                        <th
                          key={key}
                          className="p-3 text-xs font-bold text-slate-700 tracking-wider whitespace-nowrap"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {excelData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="hover:bg-sky-50/40 transition-colors">
                        {Object.values(row).map((value, idx) => (
                          <td
                            key={idx}
                            className="p-3 text-xs text-slate-600 whitespace-nowrap"
                          >
                            <div className="max-w-xs truncate" title={String(value)}>
                              {value}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Data Visualization Section */}
        {excelData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Data Visualization</h2>
                <p className="text-xs text-slate-500 font-medium">Generate 2D and interactive 3D charts</p>
              </div>
            </div>

            <div className="w-full">
              <ChartGenerator data={excelData} />
            </div>
          </div>
        )}

        {/* No Data Message */}
        {!isLoading && excelData.length === 0 && !error && (
          <div className="card-premium p-12 text-center bg-white rounded-2xl border border-slate-200/80 my-8">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 font-display">No Dataset Selected</h3>
            <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
              {allFiles.length === 0
                ? "No files have been uploaded yet. Upload an Excel file to start analyzing your data."
                : "Select a file from the dropdown above to start analyzing and visualizing your data."
              }
            </p>
            {allFiles.length === 0 && (
              <button
                onClick={() => history.push('/upload')}
                className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-sky-500/10 transition-all inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload File</span>
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DataAnalysis;