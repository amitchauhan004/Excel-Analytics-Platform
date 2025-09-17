import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import HistoryTable from "../components/HistoryTable";
import RobustChart from "../components/RobustChart";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { getProfilePicUrl, getUserInitials } from "../utils/profileUtils";
import { cleanChartData } from "../utils/chartConfig";

const Dashboard = () => {
  const [summary, setSummary] = useState({
    fileCount: 0,
    rowCount: 0,
    latestFiles: [],
  });
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [historyType, setHistoryType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [historyStats, setHistoryStats] = useState({});
  const [selectedHistoryView, setSelectedHistoryView] = useState("recent");

  const fileInputRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const history = useHistory();

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
      .get("https://excel-analytics-platform-flame.vercel.app/api/dashboard/summary", {
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
      .get("https://excel-analytics-platform-flame.vercel.app/api/dashboard/activity", {
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
      .get("https://excel-analytics-platform-flame.vercel.app/api/dashboard/history/stats", {
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
    if (!window.confirm("Are you sure you want to delete this file? This action cannot be undone.")) return;

    axios
      .delete(`https://excel-analytics-platform-flame.vercel.app/api/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        console.log("File deleted successfully:", response.data);
        
        // Show detailed success message
        const details = response.data.details;
        const message = `✅ File deleted successfully!\n\n` +
          `📄 File: ${details.fileName}\n` +
          `🗂️ Data rows deleted: ${details.dataRowsDeleted}\n` +
          `💾 File removed from storage: ${details.fileDeletedFromStorage ? 'Yes' : 'No'}\n` +
          `📏 File size: ${(details.fileSize / 1024 / 1024).toFixed(2)} MB`;
        
        alert(message);
        
        // Refresh dashboard data after successful deletion
        fetchDashboardData();
      })
      .catch((err) => {
        console.error("Error deleting file:", err);
        const errorMessage = err.response?.data?.error || "Failed to delete file.";
        alert(`❌ Error: ${errorMessage}`);
      });
  };

  const handleAnalyzeFile = (fileId) => {
    // Navigate to analyze page with file ID
    history.push(`/analyze?fileId=${fileId}`);
  };

  const handleAIInsights = (fileId) => {
    // Navigate to AI insights page with file ID
    history.push(`/ai-insights?fileId=${fileId}`);
  };

  const handleDownloadFile = (file) => {
    if (file.downloadUrl) {
      window.open(`https://excel-analytics-platform-flame.vercel.app${file.downloadUrl}`, "_blank");
    } else {
      alert("Download URL not available");
    }
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
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-secondary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="text-xl sm:text-2xl font-display font-bold gradient-text">
                Dashboard
              </h1>
              <div className="text-secondary-600 text-sm sm:text-base hidden sm:block">
                Welcome back, <span className="font-semibold text-primary-600">{user ? user.name : "User"}</span>!
              </div>
            </div>
            
            {/* User Profile */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                className="flex items-center gap-2 sm:gap-3 p-2 rounded-xl hover:bg-secondary-100 transition-all duration-300"
                onClick={toggleProfileDropdown}
              >
                {user?.profilePic ? (
                  <img
                    src={user.profilePic.startsWith('http') ? user.profilePic : `https://excel-analytics-platform-flame.vercel.app${user.profilePic}`}
                    alt="User Profile"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-primary-200"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gradient-premium text-white font-bold text-sm sm:text-base">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="font-semibold text-secondary-900 text-sm">{user?.name || "User Name"}</p>
                  <p className="text-xs text-secondary-600">{user?.email || "user@example.com"}</p>
                </div>
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 card-premium min-w-[200px] sm:min-w-[250px] z-50">
                  <div className="p-3 sm:p-4 border-b border-secondary-100">
                    <p className="font-semibold text-secondary-900 text-sm sm:text-base">{user?.name || "User Name"}</p>
                    <p className="text-xs sm:text-sm text-secondary-600">{user?.email || "user@example.com"}</p>
                  </div>
                  <button
                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-secondary-50 transition-colors rounded-b-2xl"
                    onClick={handleLogout}
                  >
                    <span className="text-secondary-700 text-sm sm:text-base">🚪 Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Upload Progress */}
        {uploadProgress > 0 && (
          <div className="card-premium p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4 mb-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-secondary-700 text-sm sm:text-base">Uploading...</span>
            </div>
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="card-premium-hover p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 font-medium text-sm sm:text-base">Total Files</p>
                <p className="text-2xl sm:text-3xl font-display font-bold gradient-text">{summary.fileCount}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-premium rounded-xl flex items-center justify-center">
                <span className="text-lg sm:text-xl">📁</span>
              </div>
            </div>
          </div>
          
          <div className="card-premium-hover p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 font-medium text-sm sm:text-base">Total Rows</p>
                <p className="text-2xl sm:text-3xl font-display font-bold gradient-text">{summary.rowCount.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-premium-2 rounded-xl flex items-center justify-center">
                <span className="text-lg sm:text-xl">📊</span>
              </div>
            </div>
          </div>
          
          <div className="card-premium-hover p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 font-medium text-sm sm:text-base">Recent Uploads</p>
                <p className="text-2xl sm:text-3xl font-display font-bold gradient-text">{summary.latestFiles.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-premium-3 rounded-xl flex items-center justify-center">
                <span className="text-lg sm:text-xl">📤</span>
              </div>
            </div>
          </div>
        </div>

        {/* History Overview */}
        <div className="card-premium p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 sm:mb-6 gradient-text">History Overview</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {[
              { key: "recent", label: "Today", count: historyStats.todayFiles || 0, icon: "📅" },
              { key: "week", label: "This Week", count: historyStats.weekFiles || 0, icon: "📆" },
              { key: "large", label: "Large Files", count: historyStats.largeFiles || 0, icon: "📈" },
              { key: "all", label: "All Files", count: historyStats.totalFiles || 0, icon: "📋" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setSelectedHistoryView(item.key)}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 hover:transform hover:-translate-y-1 ${
                  selectedHistoryView === item.key
                    ? "border-primary-500 bg-primary-50 text-primary-700 shadow-premium"
                    : "border-secondary-200 hover:border-secondary-300 bg-white"
                }`}
              >
                <div className="text-center">
                  <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{item.icon}</div>
                  <div className="text-lg sm:text-2xl font-display font-bold">{item.count}</div>
                  <div className="text-xs sm:text-sm text-secondary-600">{item.label}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <select
              value={historyType}
              onChange={(e) => setHistoryType(e.target.value)}
              className="input-premium w-full sm:max-w-xs text-sm sm:text-base"
            >
              <option value="all">All Types</option>
              <option value="recent">Recent (7 days)</option>
              <option value="large">Large Files (1000+ rows)</option>
              <option value="small">Small Files (&lt;100 rows)</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-premium w-full sm:max-w-xs text-sm sm:text-base"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="card-premium p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 sm:mb-6 gradient-text">Analytics Overview</h2>
          <div className="h-64 sm:h-80 lg:h-96">
            <ChartErrorBoundary>
              <RobustChart
                chartType="PieChart"
                data={getHistoryChartData()}
                options={{
                  title: "File Distribution",
                  backgroundColor: "transparent",
                  titleTextStyle: { 
                    color: "#374151", 
                    fontSize: window.innerWidth < 640 ? 14 : 18, 
                    fontFamily: "Poppins, sans-serif",
                    bold: true 
                  },
                  legend: { 
                    position: 'bottom',
                    textStyle: { 
                      color: "#6B7280", 
                      fontSize: window.innerWidth < 640 ? 12 : 14,
                      fontFamily: "Inter, sans-serif"
                    }
                  },
                  pieSliceTextStyle: {
                    color: "#FFFFFF",
                    fontSize: window.innerWidth < 640 ? 10 : 12,
                    fontFamily: "Inter, sans-serif",
                    bold: true
                  },
                  colors: ['#0EA5E9', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'],
                  chartArea: { width: '80%', height: '80%' }
                }}
                width="100%"
                height="100%"
              />
            </ChartErrorBoundary>
          </div>
        </div>

        {/* Recent Files Table */}
        <div className="card-premium p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 sm:mb-6 gradient-text">Recent Files</h2>
          <div className="overflow-x-auto">
            <HistoryTable
              files={summary.latestFiles.filter((file) =>
                file.originalName && file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              onFileDeleted={handleFileDeleted}
              historyType={historyType}
              dateRange={dateRange}
              selectedView={selectedHistoryView}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-premium p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 sm:mb-6 gradient-text">Recent Activity</h2>
          <div className="space-y-2 sm:space-y-3">
            {Array.isArray(recentActivity) && recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-secondary-50 rounded-xl border border-secondary-100"
                >
                  <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                  <span className="text-secondary-700 text-sm sm:text-base">{activity.message}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8 text-secondary-500">
                <div className="text-3xl sm:text-4xl mb-2">📝</div>
                <p className="text-sm sm:text-base">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
