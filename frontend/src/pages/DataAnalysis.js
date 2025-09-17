import React, { useState, useEffect } from "react";
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
        const filesRes = await axios.get(`https://excel-analytics-platform-flame.vercel.app/api/files`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAllFiles(filesRes.data);
        
        if (fileId) {
          // Fetch specific file data
          res = await axios.get(`https://excel-analytics-platform-flame.vercel.app/api/data/file/${fileId}`, {
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
            res = await axios.get(`https://excel-analytics-platform-flame.vercel.app/api/data/file/${latestFile._id}`, {
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
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header Section */}
      <div className="p-4 sm:p-6 border-b border-gray-300">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Data Analysis</h1>
            {currentFile ? (
              <div>
                <p className="text-gray-600 mb-2 text-sm sm:text-base">
                  Analyzing: <span className="font-semibold">{currentFile.originalName}</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Uploaded by: {currentFile.uploadedBy || "Unknown"} |{" "}
                  {new Date(currentFile.uploadedAt).toLocaleString()} |{" "}
                  {currentFile.rowCount || 0} rows
                </p>
              </div>
            ) : (
              <p className="text-gray-600 text-sm sm:text-base">
                Select a file to analyze and visualize your Excel data
              </p>
            )}
          </div>
          
          {/* File Selector */}
          {allFiles.length > 0 && (
            <div className="lg:ml-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select File:
              </label>
              <select
                value={currentFile?._id || ""}
                onChange={(e) => handleFileChange(e.target.value)}
                className="w-full lg:w-auto p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-white text-gray-900 border-gray-300 focus:ring-teal-500 text-sm sm:text-base"
              >
                {allFiles.map((file) => (
                  <option key={file._id} value={file._id}>
                    {file.originalName} ({new Date(file.uploadedAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {currentFile && (
            <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
              <button
                onClick={navigateToAIInsights}
                className="px-3 sm:px-4 py-2 rounded-lg transition-colors bg-teal-500 hover:bg-teal-600 text-white text-sm sm:text-base"
              >
                🤖 AI Insights
              </button>
              <button
                onClick={resetData}
                className="px-3 sm:px-4 py-2 rounded-lg transition-colors bg-gray-300 hover:bg-gray-400 text-gray-900 text-sm sm:text-base"
              >
                Clear Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-teal-500"></div>
            <span className="ml-2 text-sm sm:text-base">Loading data...</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 sm:p-6">
          <div className="p-3 sm:p-4 rounded-lg bg-red-100 text-red-700 text-sm sm:text-base">
            {error}
          </div>
        </div>
      )}

      {/* File Overview Section */}
      {currentFile && fileStats && (
        <div className="p-4 sm:p-6 border-b border-gray-300">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">📋 File Overview</h2>
          
          {/* Basic Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 rounded-lg bg-white shadow">
              <h3 className="font-semibold text-xs sm:text-sm text-gray-500">Total Rows</h3>
              <p className="text-xl sm:text-2xl font-bold text-teal-600">{fileStats.totalRows}</p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-white shadow">
              <h3 className="font-semibold text-xs sm:text-sm text-gray-500">Total Columns</h3>
              <p className="text-xl sm:text-2xl font-bold text-teal-600">{fileStats.totalColumns}</p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-white shadow">
              <h3 className="font-semibold text-xs sm:text-sm text-gray-500">Numeric Columns</h3>
              <p className="text-xl sm:text-2xl font-bold text-teal-600">
                {Object.values(fileStats.columnTypes).filter(col => col.type === 'numeric').length}
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-white shadow">
              <h3 className="font-semibold text-xs sm:text-sm text-gray-500">Categorical Columns</h3>
              <p className="text-xl sm:text-2xl font-bold text-teal-600">
                {Object.values(fileStats.columnTypes).filter(col => col.type === 'categorical').length}
              </p>
            </div>
          </div>

          {/* Column Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Column Types */}
            <div className="p-3 sm:p-4 rounded-lg bg-white shadow">
              <h3 className="font-semibold mb-3 text-sm sm:text-base">📊 Column Analysis</h3>
              <div className="space-y-2">
                {Object.entries(fileStats.columnTypes).map(([column, stats]) => (
                  <div key={column} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 bg-gray-50 rounded">
                    <div className="mb-1 sm:mb-0">
                      <span className="font-medium text-xs sm:text-sm">{column}</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        stats.type === 'numeric' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {stats.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
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
            <div className="p-3 sm:p-4 rounded-lg bg-white shadow">
              <h3 className="font-semibold mb-3 text-sm sm:text-base">✅ Data Quality</h3>
              <div className="space-y-2">
                {Object.entries(fileStats.dataQuality).map(([column, quality]) => (
                  <div key={column} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium text-xs sm:text-sm mb-1 sm:mb-0">{column}</span>
                    <div className="text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded ${
                        parseFloat(quality.completeness) > 90 
                          ? 'bg-green-100 text-green-800'
                          : parseFloat(quality.completeness) > 70
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {quality.completeness} complete
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Preview Section */}
      {excelData.length > 0 && (
        <div className="p-4 sm:p-6 border-b border-gray-300">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">📄 Data Preview</h2>
          <div className="overflow-x-auto border rounded-lg shadow-sm bg-white text-gray-900 border-gray-300">
            <table className="table-auto w-full min-w-full">
              <thead>
                <tr>
                  {Object.keys(excelData[0]).map((key) => (
                    <th
                      key={key}
                      className="p-2 sm:p-3 text-left bg-gray-200 text-gray-900 text-xs sm:text-sm whitespace-nowrap"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.slice(0, 10).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.values(row).map((value, idx) => (
                      <td
                        key={idx}
                        className="p-2 sm:p-3 border-t border-gray-300 text-xs sm:text-sm"
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
          <p className="text-xs sm:text-sm mt-3 text-gray-600">
            Showing first 10 rows of {excelData.length} total rows.
          </p>
        </div>
      )}

      {/* Data Visualization Section */}
      {excelData.length > 0 && (
        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">📈 Data Visualization</h2>
          <div className="w-full">
            <ChartGenerator data={excelData} />
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!isLoading && excelData.length === 0 && !error && (
        <div className="flex items-center justify-center h-48 sm:h-64 p-4">
          <div className="text-center">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📊</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              {allFiles.length === 0 
                ? "No files have been uploaded yet. Upload an Excel file to start analyzing your data."
                : "Select a file from the dropdown above to start analyzing and visualizing your data."
              }
            </p>
            {allFiles.length === 0 && (
              <button
                onClick={() => history.push('/upload')}
                className="px-3 sm:px-4 py-2 rounded-lg transition-colors bg-teal-500 hover:bg-teal-600 text-white text-sm sm:text-base"
              >
                📤 Upload File
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnalysis;