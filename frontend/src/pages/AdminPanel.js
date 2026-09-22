import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import RobustChart from "../components/RobustChart";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { cleanChartData } from "../utils/chartConfig";
import { useToast } from "../components/Toast";
import API_BASE_URL from "../apiConfig";


const AdminPanel = () => {
  const { success, error } = useToast();
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [previousFileCount, setPreviousFileCount] = useState(0);
  const [highlightFileCount, setHighlightFileCount] = useState(false);

  // Contact Messages State
  const [contactMessages, setContactMessages] = useState([]);
  const [selectedMessageModal, setSelectedMessageModal] = useState(null);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [contactStatusFilter, setContactStatusFilter] = useState("all");

  // Admin Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const handleAdminPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      error("Please fill in all password fields.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error("New password and confirm password do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      error("New password must be at least 6 characters long.");
      return;
    }

    try {
      setPasswordSubmitting(true);
      const res = await axios.put(
        `${API_BASE_URL}admin/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );

      if (res.data && res.data.success) {
        success("Admin password changed successfully!");
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        error(res.data?.message || "Failed to update password.");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Error changing password.";
      error(errMsg);
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const history = useHistory();

  // Check admin access on mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const storedUser = userStr ? JSON.parse(userStr) : null;
    if (!storedUser || storedUser.role !== "admin") {
      error("Access denied. Admins only.");
      history.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  // Fetch all data on mount and when refresh is triggered
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Set up real-time refresh every 30 seconds (silent refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto-refreshing admin panel data...");
      silentRefresh();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Silent refresh function that doesn't show loading state
  const silentRefresh = async () => {
    try {
      // Fetch admin stats from backend
      let adminStats = null;
      try {
        const statsRes = await axios.get(`${API_BASE_URL}admin/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        adminStats = statsRes.data;
      } catch (err) {
        console.error("Error fetching admin stats during silent refresh:", err);
        return;
      }

      // Fetch users
      try {
        const usersRes = await axios.get(`${API_BASE_URL}admin/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Error fetching users during silent refresh:", err);
      }

      // Fetch files data
      try {
        const filesRes = await axios.get(`${API_BASE_URL}files`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAllFiles(filesRes.data);
      } catch (err) {
        console.error("Error fetching files during silent refresh:", err);
      }

      // Fetch contact messages
      try {
        const contactRes = await axios.get(`${API_BASE_URL}contact`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (contactRes.data && contactRes.data.success) {
          setContactMessages(contactRes.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching contact messages during silent refresh:", err);
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

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch admin stats from backend
      let adminStats = null;
      try {
        const statsRes = await axios.get(`${API_BASE_URL}admin/stats`, {
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
        const usersRes = await axios.get(`${API_BASE_URL}admin/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        usersData = usersRes.data;
        setUsers(usersData);
        console.log("Users data from backend:", usersData);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsers([]);
      }

      // Fetch files data
      let filesData = [];
      try {
        const filesRes = await axios.get(`${API_BASE_URL}files`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        filesData = filesRes.data;
        setAllFiles(filesData);
        console.log("Files data from backend:", filesData);
      } catch (err) {
        console.error("Error fetching files:", err);
        setAllFiles([]);
      }

      // Fetch contact messages
      try {
        const contactRes = await axios.get(`${API_BASE_URL}contact`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (contactRes.data && contactRes.data.success) {
          setContactMessages(contactRes.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching contact messages:", err);
        setContactMessages([]);
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

        // Check for new files
        if (previousFileCount > 0 && adminStats.totalFiles > previousFileCount) {
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
          const userDetailRes = await axios.get(`${API_BASE_URL}admin/users/${user._id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          userDetailsMap[user._id] = userDetailRes.data;
        } catch (err) {
          // If detailed API doesn't exist, create mock data
          userDetailsMap[user._id] = {
            lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            filesUploaded: filesData.filter(f => (typeof f.uploadedBy === 'object' ? f.uploadedBy?._id : f.uploadedBy) === user._id).length,
            totalStorageUsed: filesData.filter(f => (typeof f.uploadedBy === 'object' ? f.uploadedBy?._id : f.uploadedBy) === user._id).reduce((sum, file) => sum + (file.fileSize || 0), 0),
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
      await axios.delete(`${API_BASE_URL}admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(users.filter((user) => user._id !== userId));
      success("User deleted successfully");
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      error("Failed to delete user");
    }
  };

  // Handle contact message status update
  const handleUpdateContactStatus = async (messageId, newStatus) => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}contact/${messageId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.data && res.data.success) {
        setContactMessages((prev) =>
          prev.map((msg) => (msg._id === messageId ? { ...msg, status: newStatus } : msg))
        );
        if (selectedMessageModal && selectedMessageModal._id === messageId) {
          setSelectedMessageModal((prev) => ({ ...prev, status: newStatus }));
        }
        success(`Message status updated to ${newStatus}`);
      }
    } catch (err) {
      error("Failed to update message status");
    }
  };

  // Handle contact message deletion
  const handleDeleteContactMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this contact message?")) return;

    try {
      await axios.delete(`${API_BASE_URL}contact/${messageId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setContactMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      if (selectedMessageModal && selectedMessageModal._id === messageId) {
        setSelectedMessageModal(null);
      }
      success("Contact message deleted successfully");
    } catch (err) {
      error("Failed to delete contact message");
    }
  };

  // Handle role update
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await axios.put(
        `${API_BASE_URL}admin/users/${userId}`,
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
          await axios.delete(`${API_BASE_URL}admin/users/${userId}`, {
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
          await axios.put(`${API_BASE_URL}admin/users/${userId}/role`,
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
          await axios.put(`${API_BASE_URL}admin/users/${userId}/role`,
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
      const response = await axios.post(`${API_BASE_URL}files/cleanup`, {}, {
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

  // Chart options with proper padding to prevent cut-off text
  const pieChartOptions = {
    backgroundColor: "transparent",
    chartArea: { left: 20, top: 20, width: "90%", height: "80%" },
    legend: {
      position: "right",
      alignment: "center",
      textStyle: { color: "#475569", fontSize: 12, fontFamily: "Plus Jakarta Sans, sans-serif" }
    },
    colors: ["#38bdf8", "#818cf8", "#c084fc", "#f59e0b"],
    pieHole: 0.4,
    pieSliceBorderColor: "#ffffff",
    pieSliceText: "value",
  };

  const fileTypeChartOptions = {
    backgroundColor: "transparent",
    chartArea: { left: 80, top: 20, width: "80%", height: "70%" },
    legend: { position: "none" },
    colors: ["#10b981"],
    hAxis: {
      textStyle: { color: "#64748b", fontSize: 11 },
      gridlines: { color: "#f1f5f9" },
      baselineColor: "#cbd5e1"
    },
    vAxis: {
      textStyle: { color: "#334155", fontSize: 12, fontFamily: "Plus Jakarta Sans, sans-serif" }
    },
    bar: { groupWidth: "55%" }
  };

  const storageTypeChartOptions = {
    backgroundColor: "transparent",
    chartArea: { left: 80, top: 20, width: "80%", height: "70%" },
    legend: { position: "none" },
    colors: ["#f59e0b"],
    hAxis: {
      textStyle: { color: "#64748b", fontSize: 11 },
      gridlines: { color: "#f1f5f9" },
      baselineColor: "#cbd5e1"
    },
    vAxis: {
      textStyle: { color: "#334155", fontSize: 12, fontFamily: "Plus Jakarta Sans, sans-serif" }
    },
    bar: { groupWidth: "55%" }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Users</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Live
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{systemStats.totalUsers}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{systemStats.activeUsers} active now</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Files */}
        <div className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 ${highlightFileCount ? 'ring-2 ring-emerald-500 bg-emerald-50/50' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Files</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Live
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{systemStats.totalFiles}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{systemStats.recentUploads} this week</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Storage Used */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Storage Used</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Live
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {(systemStats.totalStorage / 1024 / 1024).toFixed(2)} <span className="text-lg font-bold text-slate-500">MB</span>
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Total storage occupied</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">System Health</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Live
                </span>
              </div>
              <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">{systemStats.systemHealth}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">All systems operational</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isRefreshing ? "Refreshing Data..." : "Refresh Data"}
          </button>

          <button
            onClick={handleCleanupOrphanedFiles}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-xl border border-amber-200 transition-all"
          >
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Cleanup Orphaned Files
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Last refresh: {lastRefreshTime.toLocaleTimeString()}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">User Distribution</h3>
            <span className="text-xs text-slate-400 font-medium">Breakdown</span>
          </div>
          <ChartErrorBoundary>
            <RobustChart
              chartType="PieChart"
              data={userChartData}
              options={pieChartOptions}
              width="100%"
              height="280px"
            />
          </ChartErrorBoundary>
        </div>

        {/* File Types */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">File Types</h3>
            <span className="text-xs text-slate-400 font-medium">Count</span>
          </div>
          <ChartErrorBoundary>
            <RobustChart
              chartType="BarChart"
              data={fileChartData}
              options={fileTypeChartOptions}
              width="100%"
              height="280px"
            />
          </ChartErrorBoundary>
        </div>

        {/* Storage by Type */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Storage by Type</h3>
            <span className="text-xs text-slate-400 font-medium">MB</span>
          </div>
          <ChartErrorBoundary>
            <RobustChart
              chartType="BarChart"
              data={storageChartData}
              options={storageTypeChartOptions}
              width="100%"
              height="280px"
            />
          </ChartErrorBoundary>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent System Activity</h3>
          <span className="text-xs text-slate-400 font-medium">Latest Logs</span>
        </div>
        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
          {userActivity.slice(0, 10).map((activity, index) => (
            <div key={index} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></div>
                <span className="text-xs font-medium text-slate-700">{activity.message}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono shrink-0">
                {new Date(activity.timestamp).toLocaleTimeString()}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Users</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{users.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Admin Users</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{users.filter(u => u.role === "admin").length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Regular Users</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{users.filter(u => u.role === "user").length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Users</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{Math.floor(users.length * 0.7)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Bulk Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleSelectAll}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all"
          >
            {selectedUsers.length === filteredUsers.length ? "Deselect All" : "Select All"}
          </button>

          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">Bulk Actions</option>
            <option value="makeAdmin">Promote to Admin</option>
            <option value="makeUser">Demote to User</option>
            <option value="delete">Delete Users</option>
          </select>

          {bulkAction && selectedUsers.length > 0 && (
            <button
              onClick={handleBulkAction}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl transition-all"
            >
              Apply ({selectedUsers.length})
            </button>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {currentUsers.map((user) => (
          <div key={user._id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => handleSelectUser(user._id)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />

                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{user.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                      user.role === "admin"
                        ? "bg-sky-50 text-sky-700 border border-sky-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-1 font-medium">
                    <span>Files: {userDetails[user._id]?.filesUploaded || 0}</span>
                    <span>•</span>
                    <span>Storage: {userDetails[user._id] ? Math.round(userDetails[user._id].totalStorageUsed / 1024 / 1024 * 100) / 100 : 0} MB</span>
                    <span>•</span>
                    <span>Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => openModal(user)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-all"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </button>

                <button
                  onClick={() => handleRoleUpdate(user._id, user.role === "admin" ? "user" : "admin")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded-lg border border-sky-200 transition-all"
                >
                  <svg className="w-3.5 h-3.5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  {user.role === "admin" ? "Demote" : "Promote"}
                </button>

                <button
                  onClick={() => handleDelete(user._id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-all"
                >
                  <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {filteredUsers.length > usersPerPage && (
        <div className="flex justify-center pt-2">
          <div className="flex gap-1.5">
            {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  currentPage === index + 1
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">System Logs & Diagnostic Activity</h3>
          <span className="text-xs text-slate-400 font-medium">Real-time Stream</span>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {systemLogs.map((log, index) => (
            <div key={index} className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/50">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  log.level === "error"
                    ? "bg-rose-100 text-rose-700"
                    : log.level === "warning"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}>
                  {log.level}
                </span>
                <span className="text-xs font-medium text-slate-700">{log.message}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFileManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Storage Overview by Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {fileStats.map((stat, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">{stat.type}</h4>
                <span className="text-xs text-slate-400 font-medium">{Math.round(stat.size / 1024 / 1024 * 100) / 100} MB</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{stat.count} <span className="text-xs font-normal text-slate-400">files</span></p>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Recent File Uploads</h3>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {allFiles.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No files uploaded yet.</p>
          ) : (
            allFiles.slice(0, 10).map((file, index) => {
              const uploaderName = typeof file.uploadedBy === 'object' 
                ? (file.uploadedBy?.name || file.uploadedBy?.email || "User") 
                : (file.uploadedBy || "User");
              const sizeText = file.fileSize 
                ? (file.fileSize >= 1048576 
                    ? `${(file.fileSize / 1048576).toFixed(2)} MB` 
                    : `${(file.fileSize / 1024).toFixed(1)} KB`)
                : "0 KB";

              return (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{file.originalName}</p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Uploaded by <span className="text-slate-700 font-semibold">{uploaderName}</span> • {sizeText} • {file.rowCount || 0} rows
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(file.uploadedAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderContactMessages = () => {
    const filteredMessages = contactMessages.filter((msg) => {
      const matchesSearch =
        (msg.name && msg.name.toLowerCase().includes(contactSearchQuery.toLowerCase())) ||
        (msg.email && msg.email.toLowerCase().includes(contactSearchQuery.toLowerCase())) ||
        (msg.subject && msg.subject.toLowerCase().includes(contactSearchQuery.toLowerCase())) ||
        (msg.message && msg.message.toLowerCase().includes(contactSearchQuery.toLowerCase()));

      const matchesStatus =
        contactStatusFilter === "all" ? true : msg.status === contactStatusFilter;

      return matchesSearch && matchesStatus;
    });

    const unreadCount = contactMessages.filter((m) => m.status === "unread").length;

    return (
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Inquiries</span>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{contactMessages.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unread Messages</span>
                <p className="text-3xl font-extrabold text-rose-600 tracking-tight mt-1">{unreadCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Replied</span>
                <p className="text-3xl font-extrabold text-emerald-600 tracking-tight mt-1">
                  {contactMessages.filter((m) => m.status === "replied").length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                placeholder="Search messages by name, email, subject..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={contactStatusFilter}
              onChange={(e) => setContactStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Statuses</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
              <option value="replied">Replied Only</option>
            </select>
          </div>
        </div>

        {/* Messages List Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No contact messages found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Sender</th>
                    <th className="py-3 px-4">Category / Subject</th>
                    <th className="py-3 px-4">Message Excerpt</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredMessages.map((msg) => (
                    <tr key={msg._id} className={`hover:bg-slate-50/60 transition-colors ${msg.status === 'unread' ? 'bg-sky-50/30 font-semibold' : ''}`}>
                      <td className="py-3.5 px-4">
                        <p className="text-slate-900 font-bold">{msg.name}</p>
                        <a href={`mailto:${msg.email}`} className="text-sky-600 hover:underline text-[11px]">
                          {msg.email}
                        </a>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">
                        {msg.subject || "General Inquiry"}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                        {msg.message}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(msg.createdAt).toLocaleDateString()}{" "}
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          msg.status === 'unread'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : msg.status === 'replied'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            msg.status === 'unread' ? 'bg-rose-500' : msg.status === 'replied' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}></span>
                          {msg.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedMessageModal(msg);
                              if (msg.status === "unread") {
                                handleUpdateContactStatus(msg._id, "read");
                              }
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors"
                          >
                            View
                          </button>
                          {msg.status === "replied" ? (
                            <button
                              onClick={() => handleUpdateContactStatus(msg._id, "read")}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg text-[11px] transition-colors border border-amber-200"
                              title="Mark as unreplied (moves status back to Read)"
                            >
                              Mark Unreplied
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateContactStatus(msg._id, "replied")}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[11px] transition-colors border border-emerald-200"
                            >
                              Mark Replied
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteContactMessage(msg._id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete message"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 pb-16 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">Admin Panel</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 uppercase tracking-wider">
                    Executive Control
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">System Administration & Real-Time Monitoring</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl border border-amber-200 transition-all shadow-xs"
              >
                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Change Password</span>
              </button>

              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all"
              >
                <svg className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>

              <button
                onClick={() => history.push("/dashboard")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs transition-all"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Modern Tab Bar */}
        <div className="mb-6">
          <div className="bg-slate-200/60 p-1 rounded-2xl flex flex-wrap gap-1 max-w-max">
            {[
              {
                id: "dashboard",
                label: "Dashboard",
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                )
              },
              {
                id: "users",
                label: "User Management",
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )
              },
              {
                id: "monitoring",
                label: "System Monitoring",
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                id: "files",
                label: "File Management",
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                )
              },
              {
                id: "contact",
                label: "Contact Messages",
                badge: contactMessages.filter((m) => m.status === "unread").length,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 relative ${
                  activeTab === tab.id
                    ? "bg-white text-sky-600 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {Boolean(tab.badge) && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white leading-none">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Loading State */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold text-slate-500">Loading admin controls...</p>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && renderDashboard()}
            {activeTab === "users" && renderUserManagement()}
            {activeTab === "monitoring" && renderSystemMonitoring()}
            {activeTab === "files" && renderFileManagement()}
            {activeTab === "contact" && renderContactMessages()}
          </>
        )}
      </main>

      {/* User Details Modal */}
      {showModal && modalUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-4 mb-5 border-b border-slate-100 pb-4">
              <div className="w-14 h-14 rounded-full bg-sky-600 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-xs">
                {modalUser.name ? modalUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">{modalUser.name}</h2>
                <p className="text-xs text-slate-500 font-medium">{modalUser.email}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  modalUser.role === "admin"
                    ? "bg-sky-50 text-sky-700 border border-sky-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  {modalUser.role}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 mb-6 text-xs font-medium">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500">Account Role</span>
                <span className="text-slate-800 font-bold capitalize">{modalUser.role}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500">Files Uploaded</span>
                <span className="text-slate-800 font-bold">{userDetails[modalUser._id]?.filesUploaded || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500">Storage Occupied</span>
                <span className="text-slate-800 font-bold">
                  {userDetails[modalUser._id] ? Math.round(userDetails[modalUser._id].totalStorageUsed / 1024 / 1024 * 100) / 100 : 0} MB
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500">Registration Date</span>
                <span className="text-slate-800 font-bold">
                  {new Date(modalUser.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleRoleUpdate(modalUser._id, modalUser.role === "admin" ? "user" : "admin");
                  closeModal();
                }}
                className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                {modalUser.role === "admin" ? "Demote to User" : "Promote to Admin"}
              </button>
              <button
                onClick={closeModal}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Message View Modal */}
      {selectedMessageModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                  {selectedMessageModal.subject || "General Inquiry"}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedMessageModal.name}</h3>
                <a href={`mailto:${selectedMessageModal.email}`} className="text-xs text-sky-600 hover:underline">
                  {selectedMessageModal.email}
                </a>
              </div>
              <button
                onClick={() => setSelectedMessageModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 text-xs mb-6">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Received Date:</span>
                <span className="font-mono text-slate-700">
                  {new Date(selectedMessageModal.createdAt).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Message Content:
                </label>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-800 leading-relaxed font-normal whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedMessageModal.message}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedMessageModal.email}?subject=Re: ${encodeURIComponent(selectedMessageModal.subject || "XcelFlow Inquiry")}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleUpdateContactStatus(selectedMessageModal._id, "replied")}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Reply via Email
                </a>

                {selectedMessageModal.status === "replied" ? (
                  <button
                    onClick={() => handleUpdateContactStatus(selectedMessageModal._id, "read")}
                    className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl border border-amber-200 transition-all"
                  >
                    Mark as Unreplied
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateContactStatus(selectedMessageModal._id, "replied")}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-all"
                  >
                    Mark as Replied
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedMessageModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Change Admin Password</h3>
                  <p className="text-xs text-slate-500 font-medium">Update your security credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current admin password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50"
                >
                  {passwordSubmitting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;