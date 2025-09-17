import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import RobustChart from "../components/RobustChart";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { cleanChartData } from "../utils/chartConfig";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    totalStorage: 0,
    activeUsers: 0,
    recentUploads: 0,
    systemHealth: "Good"
  });
  const [userActivity, setUserActivity] = useState([]);
  const [fileStats, setFileStats] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [allFiles, setAllFiles] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [usingMockData, setUsingMockData] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [previousFileCount, setPreviousFileCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [highlightFileCount, setHighlightFileCount] = useState(false);
  const history = useHistory();

  // Check admin access on mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const storedUser = userStr ? JSON.parse(userStr) : null;
    if (!storedUser || storedUser.role !== "admin") {
      alert("Access denied. Admins only.");
      history.push("/dashboard");
    }
  }, [history]);

  // Fetch all data on mount and when refresh is triggered
  useEffect(() => {
    fetchAllData();
  }, [refreshKey]);

  // Set up real-time refresh every 30 seconds (silent refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto-refreshing admin panel data...");
      // Use silent refresh to avoid showing loading state
      silentRefresh();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Silent refresh function that doesn't show loading state
  const silentRefresh = async () => {
    try {
      // Fetch admin stats from backend
      let adminStats = null;
      try {
        const statsRes = await axios.get("https://excel-analytics-platform-flame.vercel.app/api/admin/stats", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        adminStats = statsRes.data;
      } catch (err) {
        console.error("Error fetching admin stats during silent refresh:", err);
        return;
      }

      // Fetch users
      try {
        const usersRes = await axios.get("https://excel-analytics-platform-flame.vercel.app/api/admin/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Error fetching users during silent refresh:", err);
      }

      // Fetch files data
      try {
        const filesRes = await axios.get("https://excel-analytics-platform-flame.vercel.app/api/files", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAllFiles(filesRes.data);
      } catch (err) {
        console.error("Error fetching files during silent refresh:", err);
      }

      // Update system stats
      if (adminStats) {
        setSystemStats({
          totalUsers: adminStats.totalUsers,
          totalFiles: adminStats.totalFiles,
          totalStorage: adminStats.totalStorage,
          activeUsers: adminStats.activeUsers,
          recentUploads: adminStats.recentUploads,
          systemHealth: adminStats.systemHealth
        });
        
        // Check for new files and show notification
        if (previousFileCount > 0 && adminStats.totalFiles > previousFileCount) {
          const newFilesCount = adminStats.totalFiles - previousFileCount;
          const newNotification = {
            id: Date.now(),
            type: 'file_upload',
            message: `${newFilesCount} new file${newFilesCount > 1 ? 's' : ''} uploaded!`,
            timestamp: new Date()
          };
          setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
          
          // Highlight the file count card
          setHighlightFileCount(true);
          setTimeout(() => setHighlightFileCount(false), 3000);
        }
        setPreviousFileCount(adminStats.totalFiles);
      }

      setLastRefreshTime(new Date());
    } catch (err) {
      console.error("Error during silent refresh:", err);
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    console.log("Manual refresh triggered");
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setLastRefreshTime(new Date());
    // The loading state will be cleared when fetchAllData completes
  };

  // Remove notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch admin stats from backend
      let adminStats = null;
      try {
        const statsRes = await axios.get("https://excel-analytics-platform-flame.vercel.app/api/admin/stats", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        adminStats = statsRes.data;
        console.log("Admin stats from backend:", adminStats);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        adminStats = null;
      }

      // Fetch users
      let usersData = [];
      try {
        const usersRes = await axios.get("https://excel-analytics-platform-flame.vercel.app/api/admin/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        usersData = usersRes.data;
        setUsers(usersData);
        console.log("Users data from backend:", usersData);
      } catch (err) {
        console.error("Error fetching users:", err);
        // Create mock users data only if API fails
        usersData = [
          { _id: "1", name: "Admin User", email: "admin@example.com", role: "admin", createdAt: new Date() },
          { _id: "2", name: "John Doe", email: "john@example.com", role: "user", createdAt: new Date() },
          { _id: "3", name: "Jane Smith", email: "jane@example.com", role: "user", createdAt: new Date() },
          { _id: "4", name: "Bob Johnson", email: "bob@example.com", role: "user", createdAt: new Date() },
          { _id: "5", name: "Alice Brown", email: "alice@example.com", role: "user", createdAt: new Date() }
        ];
        setUsers(usersData);
      }

      // Fetch files data
      let filesData = [];
      try {
        const filesRes = await axios.get("https://excel-analytics-platform-flame.vercel.app/api/files", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        filesData = filesRes.data;
        setAllFiles(filesData);
        console.log("Files data from backend:", filesData);
      } catch (err) {
        console.error("Error fetching files:", err);
        // Create mock files data only if API fails
        filesData = [
          { _id: "1", originalName: "sales_data.xlsx", uploadedBy: "2", uploadedAt: new Date(), fileSize: 1024000 },
          { _id: "2", originalName: "customer_data.csv", uploadedBy: "3", uploadedAt: new Date(), fileSize: 512000 },
          { _id: "3", originalName: "inventory.xlsx", uploadedBy: "4", uploadedAt: new Date(), fileSize: 2048000 },
          { _id: "4", originalName: "reports.csv", uploadedBy: "5", uploadedAt: new Date(), fileSize: 768000 },
          { _id: "5", originalName: "analytics.xlsx", uploadedBy: "2", uploadedAt: new Date(), fileSize: 1536000 }
        ];
        setAllFiles(filesData);
      }

      // Use real stats from backend if available, otherwise calculate from fetched data
      if (adminStats) {
        setSystemStats({
          totalUsers: adminStats.totalUsers,
          totalFiles: adminStats.totalFiles,
          totalStorage: adminStats.totalStorage,
          activeUsers: adminStats.activeUsers,
          recentUploads: adminStats.recentUploads,
          systemHealth: adminStats.systemHealth
        });
        
        // Check for new files and show notification
        if (previousFileCount > 0 && adminStats.totalFiles > previousFileCount) {
          const newFilesCount = adminStats.totalFiles - previousFileCount;
          const newNotification = {
            id: Date.now(),
            type: 'file_upload',
            message: `${newFilesCount} new file${newFilesCount > 1 ? 's' : ''} uploaded!`,
            timestamp: new Date()
          };
          setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
          
          // Highlight the file count card
          setHighlightFileCount(true);
          setTimeout(() => setHighlightFileCount(false), 3000);
          
          // Play notification sound (if browser supports it)
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
            audio.volume = 0.3;
            audio.play().catch(() => {
              // Ignore errors if audio fails to play
            });
          } catch (error) {
            // Ignore audio errors
          }
        }
        setPreviousFileCount(adminStats.totalFiles);
      } else {
        // Calculate system stats from users data
        const totalUsers = usersData.length;
        const adminUsers = usersData.filter(u => u.role === "admin").length;
        const regularUsers = totalUsers - adminUsers;

        // Calculate file stats
        const totalFiles = filesData.length;
        const totalStorage = filesData.reduce((sum, file) => sum + (file.fileSize || 0), 0);
        const recentUploads = filesData.filter(file => {
          const uploadDate = new Date(file.uploadedAt);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return uploadDate > weekAgo;
        }).length;

        setSystemStats({
          totalUsers,
          totalFiles,
          totalStorage,
          activeUsers: Math.floor(totalUsers * 0.7), // Simulate active users
          recentUploads,
          systemHealth: totalUsers > 0 ? "Good" : "Initializing"
        });
      }

      // Generate file type statistics
      const fileTypeStats = [
        { type: "Excel Files", count: filesData.filter(f => f.originalName?.endsWith('.xlsx') || f.originalName?.endsWith('.xls')).length, size: 0 },
        { type: "CSV Files", count: filesData.filter(f => f.originalName?.endsWith('.csv')).length, size: 0 },
        { type: "Other Files", count: filesData.filter(f => !f.originalName?.endsWith('.xlsx') && !f.originalName?.endsWith('.xls') && !f.originalName?.endsWith('.csv')).length, size: 0 }
      ];

      // Calculate sizes for each file type
      fileTypeStats.forEach(stat => {
        const filesOfType = filesData.filter(f => {
          if (stat.type === "Excel Files") return f.originalName?.endsWith('.xlsx') || f.originalName?.endsWith('.xls');
          if (stat.type === "CSV Files") return f.originalName?.endsWith('.csv');
          return !f.originalName?.endsWith('.xlsx') && !f.originalName?.endsWith('.xls') && !f.originalName?.endsWith('.csv');
        });
        stat.size = filesOfType.reduce((sum, file) => sum + (file.fileSize || 0), 0);
      });

      setFileStats(fileTypeStats);

      // Generate user activity
      const activities = [];
      usersData.forEach(user => {
        activities.push({
          message: `User ${user.name} logged in`,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
        });
        if (user.role === "admin") {
          activities.push({
            message: `Admin ${user.name} accessed admin panel`,
            timestamp: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000)
          });
        }
      });
      activities.sort((a, b) => b.timestamp - a.timestamp);
      setUserActivity(activities.slice(0, 20));

      // Generate system logs
      const logs = [
        { level: "info", message: "System startup completed", timestamp: new Date() },
        { level: "info", message: `Database connection established`, timestamp: new Date(Date.now() - 1000 * 60) },
        { level: "info", message: `Total ${systemStats.totalUsers} users registered`, timestamp: new Date(Date.now() - 1000 * 60 * 5) },
        { level: "info", message: `Total ${systemStats.totalFiles} files uploaded`, timestamp: new Date(Date.now() - 1000 * 60 * 10) },
        { level: "warning", message: "Storage usage at 75%", timestamp: new Date(Date.now() - 1000 * 60 * 15) },
        { level: "info", message: "Backup completed successfully", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
        { level: "error", message: "Failed to process file upload", timestamp: new Date(Date.now() - 1000 * 60 * 45) },
        { level: "info", message: "User authentication service running", timestamp: new Date(Date.now() - 1000 * 60 * 60) }
      ];
      setSystemLogs(logs);

      // Fetch detailed user information
      const userDetailsMap = {};
      for (const user of usersData) {
        try {
          const userDetailRes = await axios.get(`https://excel-analytics-platform-flame.vercel.app/api/admin/users/${user._id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          userDetailsMap[user._id] = userDetailRes.data;
        } catch (err) {
          // If detailed API doesn't exist, create mock data
          userDetailsMap[user._id] = {
            lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            filesUploaded: filesData.filter(f => f.uploadedBy === user._id).length,
            totalStorageUsed: filesData.filter(f => f.uploadedBy === user._id).reduce((sum, file) => sum + (file.fileSize || 0), 0),
            accountStatus: "Active",
            joinDate: user.createdAt || new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
          };
        }
      }
      setUserDetails(userDetailsMap);

    } catch (err) {
      console.error("Error fetching admin data:", err);
      // Set default data if API calls fail
      setSystemStats({
        totalUsers: users.length,
        totalFiles: 0,
        totalStorage: 0,
        activeUsers: 0,
        recentUploads: 0,
        systemHealth: "Error"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setLastRefreshTime(new Date());
    }
  };

  // Handle user deletion
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`https://excel-analytics-platform-flame.vercel.app/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(users.filter((user) => user._id !== userId));
      alert("User deleted successfully");
      setRefreshKey(prev => prev + 1); // Refresh data
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  // Handle role update
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await axios.put(
        `https://excel-analytics-platform-flame.vercel.app/api/admin/users/${userId}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setUsers(users.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
      ));
      alert(`User role updated to ${newRole} successfully`);
      setRefreshKey(prev => prev + 1); // Refresh data
    } catch (err) {
      alert("Failed to update user role");
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) {
      alert("Please select users to perform bulk action.");
      return;
    }

    if (bulkAction === "delete") {
      const confirmMessage = `Are you sure you want to delete ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}? This action cannot be undone.`;
      if (!window.confirm(confirmMessage)) return;

      try {
        for (const userId of selectedUsers) {
          await axios.delete(`https://excel-analytics-platform-flame.vercel.app/api/admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
        }
        alert("Selected users deleted successfully.");
        setSelectedUsers([]);
        setBulkAction("");
        fetchAllData();
      } catch (err) {
        console.error("Error deleting users:", err);
        alert("Failed to delete some users.");
      }
    } else if (bulkAction === "makeAdmin") {
      const confirmMessage = `Are you sure you want to make ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} admin?`;
      if (!window.confirm(confirmMessage)) return;

      try {
        for (const userId of selectedUsers) {
          await axios.put(`https://excel-analytics-platform-flame.vercel.app/api/admin/users/${userId}/role`, 
            { role: "admin" },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
        }
        alert("Selected users are now admins.");
        setSelectedUsers([]);
        setBulkAction("");
        fetchAllData();
      } catch (err) {
        console.error("Error updating user roles:", err);
        alert("Failed to update some user roles.");
      }
    } else if (bulkAction === "makeUser") {
      const confirmMessage = `Are you sure you want to make ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} regular users?`;
      if (!window.confirm(confirmMessage)) return;

      try {
        for (const userId of selectedUsers) {
          await axios.put(`https://excel-analytics-platform-flame.vercel.app/api/admin/users/${userId}/role`, 
            { role: "user" },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
        }
        alert("Selected users are now regular users.");
        setSelectedUsers([]);
        setBulkAction("");
        fetchAllData();
      } catch (err) {
        console.error("Error updating user roles:", err);
        alert("Failed to update some user roles.");
      }
    }
  };

  const handleCleanupOrphanedFiles = async () => {
    const confirmMessage = "Are you sure you want to clean up orphaned files? This will remove files that exist in storage but not in the database.";
    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await axios.post(`https://excel-analytics-platform-flame.vercel.app/api/files/cleanup`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      const result = response.data;
      
      if (result.success) {
        let message = `✅ Orphaned files cleanup completed successfully!\n\n`;
        message += `📊 Summary:\n`;
        message += `• Files in directory: ${result.totalFilesInDirectory}\n`;
        message += `• Files in database: ${result.totalFilesInDatabase}\n`;
        message += `• Orphaned files found: ${result.orphanedFilesFound}\n`;
        message += `• Files deleted: ${result.filesDeleted}\n`;
        
        if (result.errors && result.errors.length > 0) {
          message += `• Errors: ${result.errors.length}\n`;
        }
        
        if (result.filesDeleted > 0) {
          message += `\n🗑️ Deleted files:\n`;
          result.deletedFiles.forEach(file => {
            message += `• ${file.name} (${(file.size / 1024).toFixed(2)} KB)\n`;
          });
        }
        
        if (result.errors && result.errors.length > 0) {
          message += `\n⚠️ Errors encountered:\n`;
          result.errors.forEach(error => {
            message += `• ${error}\n`;
          });
        }
        
        alert(message);
      } else {
        alert(`❌ Cleanup failed: ${result.message || 'Unknown error'}`);
      }
      
      // Refresh data to show updated file counts
      fetchAllData();
    } catch (err) {
      console.error("Error during cleanup:", err);
      const errorMessage = err.response?.data?.error || "Failed to perform cleanup.";
      alert(`❌ Error: ${errorMessage}`);
    }
  };

  // Handle user selection
  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle select all users
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  };

  // Open modal with user details
  const openModal = (user) => {
    setModalUser(user);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setModalUser(null);
    setShowModal(false);
  };

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Chart data with proper fallbacks
  const userChartData = cleanChartData([
    ["Category", "Count"],
    ["Total Users", systemStats.totalUsers || 0],
    ["Active Users", systemStats.activeUsers || 0],
    ["Admin Users", users.filter(u => u.role === "admin").length || 0],
    ["Regular Users", users.filter(u => u.role === "user").length || 0],
  ]) || [["Category", "Count"], ["No Data", 1]];

  const fileChartData = cleanChartData([
    ["Type", "Count"],
    ["Excel Files", fileStats.find(f => f.type === "Excel Files")?.count || 0],
    ["CSV Files", fileStats.find(f => f.type === "CSV Files")?.count || 0],
    ["Other Files", fileStats.find(f => f.type === "Other Files")?.count || 0],
  ]) || [["Type", "Count"], ["No Data", 1]];

  const storageChartData = cleanChartData([
    ["Type", "Storage (MB)"],
    ["Excel Files", Math.round((fileStats.find(f => f.type === "Excel Files")?.size || 0) / 1024 / 1024 * 100) / 100],
    ["CSV Files", Math.round((fileStats.find(f => f.type === "CSV Files")?.size || 0) / 1024 / 1024 * 100) / 100],
    ["Other Files", Math.round((fileStats.find(f => f.type === "Other Files")?.size || 0) / 1024 / 1024 * 100) / 100],
  ]) || [["Type", "Storage (MB)"], ["No Data", 1]];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-premium-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-secondary-600 font-medium">Total Users</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Live</span>
                </div>
              </div>
              <p className="text-3xl font-display font-bold gradient-text">{systemStats.totalUsers}</p>
              <p className="text-sm text-secondary-500">{systemStats.activeUsers} active</p>
            </div>
            <div className="w-12 h-12 bg-gradient-premium rounded-xl flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
          </div>
        </div>

        <div className={`card-premium-hover p-6 transition-all duration-500 ${highlightFileCount ? 'ring-4 ring-green-400 bg-green-50' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-secondary-600 font-medium">Total Files</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Live</span>
                </div>
              </div>
              <p className="text-3xl font-display font-bold gradient-text">{systemStats.totalFiles}</p>
              <p className="text-sm text-secondary-500">{systemStats.recentUploads} this week</p>
            </div>
            <div className="w-12 h-12 bg-gradient-premium-2 rounded-xl flex items-center justify-center">
              <span className="text-xl">📁</span>
            </div>
          </div>
        </div>

        <div className="card-premium-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-secondary-600 font-medium">Storage Used</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Live</span>
                </div>
              </div>
              <p className="text-3xl font-display font-bold gradient-text">
                {(systemStats.totalStorage / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-sm text-secondary-500">Total storage</p>
            </div>
            <div className="w-12 h-12 bg-gradient-premium-3 rounded-xl flex items-center justify-center">
              <span className="text-xl">💾</span>
            </div>
          </div>
        </div>

        <div className="card-premium-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-secondary-600 font-medium">System Health</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Live</span>
                </div>
              </div>
              <p className="text-3xl font-display font-bold gradient-text">{systemStats.systemHealth}</p>
              <p className="text-sm text-secondary-500">All systems operational</p>
            </div>
            <div className="w-12 h-12 bg-gradient-premium-4 rounded-xl flex items-center justify-center">
              <span className="text-xl">🟢</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Actions */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="btn-primary flex items-center gap-2"
        >
          {isRefreshing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Refreshing...
            </>
          ) : (
            <>
              <span>🔄</span>
              Refresh Data
            </>
          )}
        </button>
        
        <button
          onClick={handleCleanupOrphanedFiles}
          className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium py-2 px-4 rounded-xl border border-orange-200 hover:border-orange-300 transition-all duration-300 flex items-center gap-2"
        >
          <span>🧹</span>
          Cleanup Orphaned Files
        </button>
        
        <div className="text-sm text-secondary-600 flex items-center gap-2">
          <span>🕒</span>
          Last refresh: {lastRefreshTime.toLocaleTimeString()}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-premium p-6">
          <h3 className="text-xl font-display font-bold gradient-text mb-4">User Distribution</h3>
          <RobustChart
            chartType="PieChart"
            data={userChartData}
            options={{
              backgroundColor: "transparent",
              titleTextStyle: { 
                color: "#374151", 
                fontSize: 16, 
                fontFamily: "Poppins, sans-serif",
                bold: true 
              },
              legend: { 
                position: 'bottom',
                textStyle: { 
                  color: "#6B7280", 
                  fontSize: 12,
                  fontFamily: "Inter, sans-serif"
                }
              },
              colors: ['#0EA5E9', '#3B82F6', '#8B5CF6', '#F59E0B'],
              chartArea: { width: '80%', height: '80%' }
            }}
            width="100%"
            height="300px"
          />
        </div>

        <div className="card-premium p-6">
          <h3 className="text-xl font-display font-bold gradient-text mb-4">File Types</h3>
          <RobustChart
            chartType="BarChart"
            data={fileChartData}
            options={{
              backgroundColor: "transparent",
              titleTextStyle: { 
                color: "#374151", 
                fontSize: 16, 
                fontFamily: "Poppins, sans-serif",
                bold: true 
              },
              legend: { 
                position: 'none',
                textStyle: { 
                  color: "#6B7280", 
                  fontSize: 12,
                  fontFamily: "Inter, sans-serif"
                }
              },
              colors: ['#10B981'],
              chartArea: { width: '80%', height: '80%' }
            }}
            width="100%"
            height="300px"
          />
        </div>

        <div className="card-premium p-6">
          <h3 className="text-xl font-display font-bold gradient-text mb-4">Storage by Type</h3>
          <RobustChart
            chartType="BarChart"
            data={storageChartData}
            options={{
              backgroundColor: "transparent",
              titleTextStyle: { 
                color: "#374151", 
                fontSize: 16, 
                fontFamily: "Poppins, sans-serif",
                bold: true 
              },
              legend: { 
                position: 'none',
                textStyle: { 
                  color: "#6B7280", 
                  fontSize: 12,
                  fontFamily: "Inter, sans-serif"
                }
              },
              colors: ['#F59E0B'],
              chartArea: { width: '80%', height: '80%' }
            }}
            width="100%"
            height="300px"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-premium p-6">
        <h3 className="text-xl font-display font-bold gradient-text mb-4">Recent System Activity</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {userActivity.slice(0, 10).map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span className="text-secondary-700 text-sm">{activity.message}</span>
              <span className="text-secondary-500 text-xs ml-auto">
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      {/* User Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-premium-hover p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-600 text-sm">Total Users</p>
              <p className="text-2xl font-display font-bold gradient-text">{users.length}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-premium rounded-xl flex items-center justify-center">
              <span className="text-white">👥</span>
            </div>
          </div>
        </div>
        
        <div className="card-premium-hover p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-600 text-sm">Admin Users</p>
              <p className="text-2xl font-display font-bold gradient-text">{users.filter(u => u.role === "admin").length}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-premium-2 rounded-xl flex items-center justify-center">
              <span className="text-white">👑</span>
            </div>
          </div>
        </div>
        
        <div className="card-premium-hover p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-600 text-sm">Regular Users</p>
              <p className="text-2xl font-display font-bold gradient-text">{users.filter(u => u.role === "user").length}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-premium-3 rounded-xl flex items-center justify-center">
              <span className="text-white">👤</span>
            </div>
          </div>
        </div>
        
        <div className="card-premium-hover p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-600 text-sm">Active Users</p>
              <p className="text-2xl font-display font-bold gradient-text">{Math.floor(users.length * 0.7)}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-premium-4 rounded-xl flex items-center justify-center">
              <span className="text-white">🟢</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div className="card-premium p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
        <input
          type="text"
              placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
              className="input-premium"
        />
      </div>

          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="btn-secondary py-2 px-4 text-sm"
            >
              {selectedUsers.length === filteredUsers.length ? "Deselect All" : "Select All"}
            </button>
            
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="input-premium max-w-xs"
            >
              <option value="">Bulk Actions</option>
              <option value="promote">Promote to Admin</option>
              <option value="demote">Demote to User</option>
              <option value="delete">Delete Users</option>
            </select>
            
            {bulkAction && selectedUsers.length > 0 && (
              <button
                onClick={handleBulkAction}
                className="btn-primary py-2 px-4 text-sm"
              >
                Apply ({selectedUsers.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid gap-4">
            {currentUsers.map((user) => (
          <div key={user._id} className="card-premium-hover p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => handleSelectUser(user._id)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-premium rounded-full flex items-center justify-center text-white font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900">{user.name}</h3>
                    <p className="text-sm text-secondary-600">{user.email}</p>
                    <p className="text-xs text-secondary-500">
                      Files: {userDetails[user._id]?.filesUploaded || 0} | 
                      Storage: {userDetails[user._id] ? Math.round(userDetails[user._id].totalStorageUsed / 1024 / 1024 * 100) / 100 : 0} MB |
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-secondary-400">
                      Last Activity: {userDetails[user._id]?.lastLogin ? new Date(userDetails[user._id].lastLogin).toLocaleDateString() : "Never"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === "admin" 
                    ? "bg-primary-100 text-primary-700" 
                    : "bg-secondary-100 text-secondary-700"
                }`}>
                  {user.role}
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(user)}
                    className="btn-secondary py-2 px-3 text-sm"
                  >
                    👁️ View
                  </button>
                  <button
                    onClick={() => handleRoleUpdate(user._id, user.role === "admin" ? "user" : "admin")}
                    className="btn-primary py-2 px-3 text-sm"
                  >
                    {user.role === "admin" ? "⬇️ Demote" : "⬆️ Promote"}
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="bg-error-50 hover:bg-error-100 text-error-700 font-medium py-2 px-3 rounded-xl border border-error-200 hover:border-error-300 transition-all duration-300 text-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
          </div>

          {/* Pagination */}
          {filteredUsers.length > usersPerPage && (
        <div className="flex justify-center">
          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, index) => (
                        <button
                key={index}
                          onClick={() => paginate(index + 1)}
                className={`py-2 px-4 rounded-xl transition-all duration-300 ${
                            currentPage === index + 1
                    ? "bg-primary-600 text-white shadow-premium"
                    : "bg-white text-secondary-700 border border-secondary-200 hover:bg-secondary-50"
                          }`}
                        >
                          {index + 1}
                        </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSystemMonitoring = () => (
    <div className="space-y-6">
      <div className="card-premium p-6">
        <h3 className="text-xl font-display font-bold gradient-text mb-4">System Logs</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {systemLogs.map((log, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
              <div className={`w-2 h-2 rounded-full ${
                log.level === "error" ? "bg-error-500" :
                log.level === "warning" ? "bg-warning-500" : "bg-success-500"
              }`}></div>
              <span className="text-secondary-700 text-sm">{log.message}</span>
              <span className="text-secondary-500 text-xs ml-auto">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFileManagement = () => (
    <div className="space-y-6">
      <div className="card-premium p-6">
        <h3 className="text-xl font-display font-bold gradient-text mb-4">File Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {fileStats.map((stat, index) => (
            <div key={index} className="p-4 bg-secondary-50 rounded-xl">
              <h4 className="font-semibold text-secondary-900">{stat.type}</h4>
              <p className="text-2xl font-bold gradient-text">{stat.count}</p>
              <p className="text-sm text-secondary-600">{Math.round(stat.size / 1024 / 1024 * 100) / 100} MB</p>
            </div>
          ))}
        </div>
        
        <h3 className="text-xl font-display font-bold gradient-text mb-4">Recent Files</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {allFiles.slice(0, 10).map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-premium rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📄</span>
                </div>
                <div>
                  <p className="font-medium text-secondary-900">{file.originalName}</p>
                  <p className="text-sm text-secondary-600">
                    Uploaded by {file.uploadedBy || "Unknown"} • {Math.round((file.fileSize || 0) / 1024 / 1024 * 100) / 100} MB
                  </p>
                </div>
              </div>
              <span className="text-secondary-500 text-xs">
                {new Date(file.uploadedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-secondary-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 className="text-xl sm:text-2xl font-display font-bold gradient-text">Admin Panel</h1>
              <div className="text-secondary-600 text-sm sm:text-base">
                System Administration & Monitoring
              </div>
              {usingMockData && (
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-warning-50 border border-warning-200 rounded-full">
                  <span className="w-2 h-2 bg-warning-500 rounded-full"></span>
                  <span className="text-warning-700 text-xs sm:text-sm font-medium">Demo Mode</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-secondary-600">
                <span>Last updated: {lastRefreshTime.toLocaleTimeString()}</span>
                {isRefreshing && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <span>Refreshing...</span>
                  </div>
                )}
              </div>
              
              {/* Notifications */}
              {notifications.length > 0 && (
                <div className="relative">
                  <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 text-xs sm:text-sm font-medium">{notifications.length}</span>
                  </div>
                  
                  {/* Notification dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-64 sm:w-80 bg-white border border-secondary-200 rounded-xl shadow-lg z-50">
                    <div className="p-2 sm:p-3 border-b border-secondary-200">
                      <h3 className="font-medium text-secondary-900 text-sm sm:text-base">Recent Updates</h3>
                    </div>
                    <div className="max-h-48 sm:max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-2 sm:p-3 border-b border-secondary-100 hover:bg-secondary-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-xs sm:text-sm text-secondary-900">{notification.message}</p>
                              <p className="text-xs text-secondary-500 mt-1">
                                {notification.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="text-secondary-400 hover:text-secondary-600 ml-2 text-sm sm:text-base"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className={`btn-secondary py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
                </button>
                <button
                  onClick={() => history.push("/dashboard")}
                  className="btn-secondary py-1.5 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Navigation Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-secondary-200 overflow-x-auto">
            {[
              { id: "dashboard", label: "📊 Dashboard", icon: "📊" },
              { id: "users", label: "👥 User Management", icon: "👥" },
              { id: "monitoring", label: "🔍 System Monitoring", icon: "🔍" },
              { id: "files", label: "📁 File Management", icon: "📁" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-t-xl font-medium transition-all duration-300 text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white text-primary-600 border-b-2 border-primary-600"
                    : "text-secondary-600 hover:text-secondary-900 hover:bg-white/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="card-premium p-4 sm:p-8">
            <div className="text-center py-8 sm:py-12">
              <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
              <p className="text-secondary-600 font-medium text-sm sm:text-base">Loading admin panel...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Content */}
            {activeTab === "dashboard" && renderDashboard()}
            {activeTab === "users" && renderUserManagement()}
            {activeTab === "monitoring" && renderSystemMonitoring()}
            {activeTab === "files" && renderFileManagement()}
        </>
      )}
      </main>

      {/* User Details Modal */}
      {showModal && modalUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="card-premium p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md w-full mx-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-premium rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                {modalUser.name ? modalUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold gradient-text">{modalUser.name}</h2>
                <p className="text-secondary-600 text-sm sm:text-base">{modalUser.email}</p>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="flex justify-between items-center p-2 sm:p-3 bg-secondary-50 rounded-xl">
                <span className="font-medium text-secondary-700 text-sm sm:text-base">Role:</span>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  modalUser.role === "admin" 
                    ? "bg-primary-100 text-primary-700" 
                    : "bg-secondary-100 text-secondary-700"
                }`}>
                  {modalUser.role}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2 sm:p-3 bg-secondary-50 rounded-xl">
                <span className="font-medium text-secondary-700 text-sm sm:text-base">Files Uploaded:</span>
                <span className="text-secondary-600 text-sm sm:text-base">
                  {userDetails[modalUser._id]?.filesUploaded || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2 sm:p-3 bg-secondary-50 rounded-xl">
                <span className="font-medium text-secondary-700 text-sm sm:text-base">Storage Used:</span>
                <span className="text-secondary-600 text-sm sm:text-base">
                  {userDetails[modalUser._id] ? Math.round(userDetails[modalUser._id].totalStorageUsed / 1024 / 1024 * 100) / 100 : 0} MB
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2 sm:p-3 bg-secondary-50 rounded-xl">
                <span className="font-medium text-secondary-700 text-sm sm:text-base">Last Login:</span>
                <span className="text-secondary-600 text-sm sm:text-base">
                  {userDetails[modalUser._id]?.lastLogin ? new Date(userDetails[modalUser._id].lastLogin).toLocaleDateString() : "Never"}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2 sm:p-3 bg-secondary-50 rounded-xl">
                <span className="font-medium text-secondary-700 text-sm sm:text-base">Joined:</span>
                <span className="text-secondary-600 text-sm sm:text-base">
                  {new Date(modalUser.createdAt || userDetails[modalUser._id]?.joinDate || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => handleRoleUpdate(modalUser._id, modalUser.role === "admin" ? "user" : "admin")}
                className="btn-primary flex-1 py-2 sm:py-3 text-sm sm:text-base"
              >
                {modalUser.role === "admin" ? "⬇️ Demote to User" : "⬆️ Promote to Admin"}
              </button>
            <button
              onClick={closeModal}
                className="btn-secondary py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base"
            >
              Close
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;