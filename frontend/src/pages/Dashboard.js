import React, { useEffect, useState, useRef } from "react";
import API_BASE_URL from "../apiConfig";

import axios from "axios";
import HistoryTable from "../components/HistoryTable";
import RobustChart from "../components/RobustChart";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import AIInsightPanel from "../components/AIInsightPanel";
import { cleanChartData } from "../utils/chartConfig";
import { useToast, ConfirmDialog } from "../components/Toast";
import BusinessHealthGauge from "../components/BusinessHealthGauge";

const Dashboard = () => {
  const { success, error } = useToast();
  const [summary, setSummary] = useState({
    fileCount: 0,
    rowCount: 0,
    latestFiles: [],
  });
  const [user, setUser] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [uploadProgress] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [historyType, setHistoryType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [historyStats, setHistoryStats] = useState({});
  const [selectedHistoryView, setSelectedHistoryView] = useState("recent");
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [selectedFileData, setSelectedFileData] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, fileId: null, fileName: "" });
  const profileDropdownRef = useRef(null);

  // Handle clicking outside the profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    // Handle scroll to close dropdown
    const handleScroll = () => {
      setIsProfileOpen(false);
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isProfileOpen]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing user data:", err);
        // Clear invalid data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
  }, []);

  // Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const newUser = JSON.parse(storedUser);
          setUser(newUser);
          // Refresh data when user changes
          fetchDashboardData();
        } catch (err) {
          console.error("Error parsing user data:", err);
          // Clear invalid data
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
    };

    const handleFileUpload = () => {
      // Refresh data when a new file is uploaded
      fetchDashboardData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage', handleFileUpload); // Listen for custom storage event from Upload component
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleFileUpload);
    };
  }, []);

  // Function to fetch dashboard data
  const fetchDashboardData = () => {
    // Fetch summary data
    axios
      .get(API_BASE_URL + "dashboard/summary", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setSummary(res.data);
      })
      .catch((err) => {
        console.error("Error fetching summary:", err);
        // Reset to empty state if error
        setSummary({
          fileCount: 0,
          rowCount: 0,
          latestFiles: [],
        });
      });

    // Fetch recent activity
    axios
      .get(API_BASE_URL + "dashboard/activity", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setRecentActivity(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Error fetching recent activity:", err);
        setRecentActivity([]);
      });

    // Fetch history statistics
    axios
      .get(API_BASE_URL + "dashboard/history/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setHistoryStats(res.data);
      })
      .catch((err) => {
        console.error("Error fetching history stats:", err);
        setHistoryStats({});
      });
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleProfileDropdown = () => {
    setIsProfileOpen((prev) => !prev);
  };

  // Function to fetch file data for AI analysis
  const fetchFileDataForAI = async (fileId) => {
    setSelectedFileId(fileId);
    setSelectedFileData(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}data/file/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setSelectedFileData(response.data.data);
      } else if (Array.isArray(response.data)) {
        setSelectedFileData(response.data);
      }
    } catch (err) {
      console.error("Error fetching file data for AI:", err);
    }
  };

  const handleLogout = () => {
    // Clear all cached data
    setSummary({
      fileCount: 0,
      rowCount: 0,
      latestFiles: [],
    });
    setRecentActivity([]);
    setHistoryStats({});
    setUser(null);

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login
    window.location.href = "/login";
  };

  const handleFileDeleted = (fileId) => {
    // Show confirmation dialog instead of window.confirm
    const file = summary.latestFiles.find(f => f._id === fileId);
    setConfirmDialog({ show: true, fileId, fileName: file?.originalName || 'this file' });
  };

  const confirmDeleteFile = () => {
    const fileId = confirmDialog.fileId;
    setConfirmDialog({ show: false, fileId: null, fileName: "" });

    axios
      .delete(`${API_BASE_URL}files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        console.log("File deleted successfully:", response.data);

        // Show success message with toast
        const details = response.data.details;
        success(`✅ File "${details.fileName}" deleted successfully!`);

        // Refresh dashboard data after successful deletion
        fetchDashboardData();
      })
      .catch((err) => {
        console.error("Error deleting file:", err);
        const errorMessage = err.response?.data?.error || "Failed to delete file.";
        error(`❌ Error: ${errorMessage}`);
      });
  };

  const getHistoryChartData = () => {
    // Ensure we have valid data structure with proper fallbacks
    const chartData = [
      ["Category", "Count"],
      ["Today", historyStats.todayFiles || 0],
      ["This Week", historyStats.weekFiles || 0],
      ["This Month", historyStats.monthFiles || 0],
      ["Large Files", historyStats.largeFiles || 0],
      ["Medium Files", historyStats.mediumFiles || 0],
      ["Small Files", historyStats.smallFiles || 0],
    ];

    // Use the utility function to clean and validate data
    const cleanedData = cleanChartData(chartData);

    // If cleaned data is null or empty, return a default structure
    if (!cleanedData || cleanedData.length < 2) {
      return [
        ["Category", "Count"],
        ["No Data", 1]
      ];
    }

    return cleanedData;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-display">
                  Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Welcome back, <span className="font-semibold text-slate-900">{user ? user.name : "User"}</span>!
                </p>
              </div>
            </div>

            {/* User Profile */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-slate-100/80 transition-all duration-200 border border-slate-200/60 bg-white/50"
                onClick={toggleProfileDropdown}
              >
                {user?.profilePic ? (
                  <img
                    src={user.profilePic.startsWith('http') ? user.profilePic : `${API_BASE_URL.replace('/api/', '')}${user.profilePic}`}
                    alt="User Profile"
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-sky-500/30"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="font-bold text-slate-900 text-xs leading-tight">{user?.name || "User Name"}</p>
                  <p className="text-[11px] text-slate-500">{user?.email || "user@example.com"}</p>
                </div>
                <svg className="w-4 h-4 text-slate-400 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 card-premium min-w-[220px] shadow-xl z-50 p-2 border border-slate-200 bg-white rounded-2xl">
                  <div className="p-3 border-b border-slate-100">
                    <p className="font-bold text-slate-900 text-xs">{user?.name || "User Name"}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || "user@example.com"}</p>
                  </div>
                  <button
                    className="w-full text-left px-3 py-2.5 mt-1 hover:bg-rose-50 text-rose-600 font-semibold text-xs transition-colors rounded-xl flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Upload Progress */}
        {uploadProgress > 0 && (
          <div className="card-premium p-4 border border-sky-200 bg-sky-50/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-sky-500 rounded-full animate-ping"></div>
              <span className="font-semibold text-sky-900 text-xs">Uploading dataset...</span>
            </div>
            <div className="w-full bg-sky-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 h-full">
            <BusinessHealthGauge />
          </div>

          <div className="card-premium-hover p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Total Files</p>
                <p className="text-3xl font-black text-slate-900 mt-2 font-display">{summary.fileCount}</p>
              </div>
              <div className="w-12 h-12 bg-sky-50 text-sky-600 ring-1 ring-sky-100 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card-premium-hover p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Total Rows</p>
                <p className="text-3xl font-black text-slate-900 mt-2 font-display">{summary.rowCount.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card-premium-hover p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Recent Uploads</p>
                <p className="text-3xl font-black text-slate-900 mt-2 font-display">{summary.latestFiles.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* AI Data Copilot */}
        {summary.latestFiles && summary.latestFiles.length > 0 && (
          <div className="space-y-6">
            <div className="card-premium p-6 border border-slate-200/80 bg-white rounded-2xl shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 font-display">
                  AI Data Copilot
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-4 font-medium">
                Select a file to analyze with AI and generate instant executive insights, trend forecasts, and actionable recommendations.
              </p>

              {/* File Selector */}
              <div className="flex flex-wrap gap-2">
                {summary.latestFiles.slice(0, 5).map((file) => (
                  <button
                    key={file._id}
                    onClick={() => fetchFileDataForAI(file._id, file.originalName)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${selectedFileId === file._id
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-transparent shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200/80'
                      }`}
                  >
                    <svg className={`w-3.5 h-3.5 ${selectedFileId === file._id ? 'text-white' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{file.originalName?.substring(0, 24)}{file.originalName?.length > 24 ? '...' : ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Insight Panel */}
            {selectedFileData && selectedFileData.length > 0 && (
              <AIInsightPanel data={selectedFileData} fileId={selectedFileId} />
            )}

            {selectedFileId && (!selectedFileData || selectedFileData.length === 0) && (
              <div className="card-premium p-6 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/80">
                <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs font-semibold">Analyzing dataset with AI Copilot...</p>
              </div>
            )}
          </div>
        )}

        {/* History Overview */}
        <div className="card-premium p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">History Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Quick activity breakdown and filtering by file metrics</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                key: "recent",
                label: "Today",
                count: historyStats.todayFiles || 0,
                icon: (
                  <svg className="w-5 h-5 text-sky-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                key: "week",
                label: "This Week",
                count: historyStats.weekFiles || 0,
                icon: (
                  <svg className="w-5 h-5 text-indigo-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                key: "large",
                label: "Large Files",
                count: historyStats.largeFiles || 0,
                icon: (
                  <svg className="w-5 h-5 text-emerald-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )
              },
              {
                key: "all",
                label: "All Files",
                count: historyStats.totalFiles || 0,
                icon: (
                  <svg className="w-5 h-5 text-amber-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )
              },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setSelectedHistoryView(item.key)}
                className={`p-4 rounded-xl border transition-all duration-200 text-center ${selectedHistoryView === item.key
                  ? "border-sky-500 bg-sky-50/70 text-sky-900 shadow-sm ring-1 ring-sky-500/30"
                  : "border-slate-200/80 hover:border-slate-300 bg-slate-50/50 text-slate-800"
                  }`}
              >
                <div className="mb-2">{item.icon}</div>
                <div className="text-xl font-bold text-slate-900 font-display">{item.count}</div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">{item.label}</div>
              </button>
            ))}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={historyType}
              onChange={(e) => setHistoryType(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200/80 text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 w-full sm:max-w-xs"
            >
              <option value="all">All Types</option>
              <option value="recent">Recent (7 days)</option>
              <option value="large">Large Files (1000+ rows)</option>
              <option value="small">Small Files (&lt;100 rows)</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200/80 text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 w-full sm:max-w-xs"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="card-premium p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Analytics Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Distribution breakdown of uploaded datasets</p>
            </div>
          </div>
          <div className="h-72 sm:h-80 lg:h-96">
            <ChartErrorBoundary>
              <RobustChart
                chartType="PieChart"
                data={getHistoryChartData()}
                options={{
                  title: "File Distribution",
                  backgroundColor: "transparent",
                  titleTextStyle: {
                    color: "#0F172A",
                    fontSize: window.innerWidth < 640 ? 14 : 16,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    bold: true
                  },
                  legend: {
                    position: 'bottom',
                    textStyle: {
                      color: "#475569",
                      fontSize: window.innerWidth < 640 ? 11 : 13,
                      fontFamily: "Plus Jakarta Sans, sans-serif"
                    }
                  },
                  pieSliceTextStyle: {
                    color: "#FFFFFF",
                    fontSize: window.innerWidth < 640 ? 10 : 12,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    bold: true
                  },
                  colors: ['#0EA5E9', '#6366F1', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'],
                  chartArea: { width: '85%', height: '80%' }
                }}
                width="100%"
                height="100%"
              />
            </ChartErrorBoundary>
          </div>
        </div>

        {/* Recent Files Table */}
        <div className="card-premium p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <HistoryTable
            files={summary.latestFiles}
            onFileDeleted={handleFileDeleted}
            historyType={historyType}
            dateRange={dateRange}
            selectedView={selectedHistoryView}
          />
        </div>

        {/* Recent Activity */}
        <div className="card-premium p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 font-display mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {Array.isArray(recentActivity) && recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60"
                >
                  <div className="w-2 h-2 bg-sky-500 rounded-full shrink-0"></div>
                  <span className="text-slate-700 text-xs font-medium">{activity.message}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold">No recent activity logged</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmDialog.show}
        onClose={() => setConfirmDialog({ show: false, fileId: null, fileName: "" })}
        onConfirm={confirmDeleteFile}
        title="Delete File"
        message={`Are you sure you want to delete "${confirmDialog.fileName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Dashboard;
