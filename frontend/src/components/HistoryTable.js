import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

const HistoryTable = ({ files: propFiles, onFileDeleted, historyType, dateRange, selectedView }) => {
  const [files, setFiles] = useState(propFiles);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalFiles, setTotalFiles] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const history = useHistory();

  const fetchHistory = async (page, type = "all", range = "all") => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `https://excel-analytics-platform-flame.vercel.app/api/dashboard/history?page=${page}&limit=10&type=${type}&dateRange=${range}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setFiles(res.data.files);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
      setTotalFiles(res.data.totalFiles);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching history:", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!propFiles || propFiles.length === 0) {
      fetchHistory(currentPage, historyType, dateRange);
    } else {
      setFiles(propFiles);
    }
  }, [currentPage, propFiles, historyType, dateRange]);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
    fetchHistory(1, historyType, dateRange);
  }, [historyType, dateRange, selectedView]);

  const handleAnalyze = (fileId) => {
    // Navigate to analyze page with file ID
    history.push(`/analyze?fileId=${fileId}`);
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      // Debugging fileId and API URL
      console.log("Deleting file with ID:", fileId);
      console.log(`https://excel-analytics-platform-flame.vercel.app/api/files/${fileId}`);

      await axios.delete(`https://excel-analytics-platform-flame.vercel.app/api/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("File deleted successfully.");
      onFileDeleted(); // Notify parent component
      fetchHistory(currentPage, historyType, dateRange); // Refresh file list
    } catch (err) {
      console.error(err.response || err);
      alert("Failed to delete file.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select files to delete.");
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      const response = await axios.delete(`https://excel-analytics-platform-flame.vercel.app/api/files/bulk/delete`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: { fileIds: selectedFiles }
      });

      const results = response.data.results;
      const successCount = results.totalDeleted;
      const failedCount = results.failed.length;

      let message = `✅ Bulk delete completed!\n\n`;
      message += `📄 Successfully deleted: ${successCount} file${successCount !== 1 ? 's' : ''}\n`;
      message += `🗂️ Total data rows deleted: ${results.totalDataRowsDeleted}\n`;
      
      if (failedCount > 0) {
        message += `❌ Failed to delete: ${failedCount} file${failedCount !== 1 ? 's' : ''}\n`;
        if (results.failed.length > 0) {
          message += `\nFailed files:\n`;
          results.failed.forEach(fail => {
            message += `• ${fail.fileId}: ${fail.reason}\n`;
          });
        }
      }

      alert(message);
      
      setSelectedFiles([]);
      onFileDeleted(); // Notify parent component
      fetchHistory(currentPage, historyType, dateRange); // Refresh file list
    } catch (err) {
      console.error("Bulk delete error:", err);
      const errorMessage = err.response?.data?.error || "Failed to perform bulk delete.";
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectFile = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file._id));
    }
  };

  const handleDownload = (file) => {
    if (file.downloadUrl) {
      window.open(`https://excel-analytics-platform-flame.vercel.app${file.downloadUrl}`, "_blank");
    } else {
      alert("Download URL not available");
    }
  };

  const getViewTitle = () => {
    switch (selectedView) {
      case "recent":
        return "Today's Uploads";
      case "week":
        return "This Week's Uploads";
      case "large":
        return "Large Files (1000+ rows)";
      case "all":
        return "All Files";
      default:
        return "Upload & Analysis History";
    }
  };

  const getFilterDescription = () => {
    let description = "";
    if (historyType !== "all") {
      description += `Type: ${historyType} | `;
    }
    if (dateRange !== "all") {
      description += `Date: ${dateRange}`;
    }
    return description || "Showing all files";
  };

  if (isLoading) {
    return (
      <div className="card-premium p-8">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600 font-medium">Loading history...</p>
        </div>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="card-premium p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📁</span>
          </div>
          <h3 className="text-xl font-display font-bold text-secondary-900 mb-2">{getViewTitle()}</h3>
          <p className="text-secondary-600">No files found for the selected criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold gradient-text">{getViewTitle()}</h2>
          <p className="text-secondary-600 mt-1">{getFilterDescription()}</p>
          <p className="text-sm text-secondary-500 mt-1">Total: {totalFiles} files</p>
        </div>
        
        {/* Bulk Actions */}
        {selectedFiles.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary-600">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-error-50 hover:bg-error-100 text-error-700 font-medium py-2 px-4 rounded-xl border border-error-200 hover:border-error-300 transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? '🗑️ Deleting...' : `🗑️ Delete ${selectedFiles.length}`}
            </button>
          </div>
        )}
      </div>
      
      {/* Files Grid */}
      <div className="space-y-4">
        {/* Select All */}
        {files.length > 0 && (
          <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-xl">
            <input
              type="checkbox"
              checked={selectedFiles.length === files.length && files.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-primary-600 bg-white border-secondary-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-secondary-700">
              Select all {files.length} files
            </span>
          </div>
        )}
        
        {files.map((file) => (
          <div key={file._id} className="card-premium-hover p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file._id)}
                  onChange={() => handleSelectFile(file._id)}
                  className="w-4 h-4 text-primary-600 bg-white border-secondary-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-premium rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">📊</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900 truncate">{file.originalName}</h3>
                      <p className="text-sm text-secondary-600">
                        Uploaded by {file.uploadedBy || "Unknown"} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-secondary-600">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      {file.rowCount || "N/A"} rows
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-accent-500 rounded-full"></span>
                      {file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(file)}
                  className="btn-secondary py-2 px-4 text-sm"
                >
                  📥 Download
                </button>
                <button
                  onClick={() => handleAnalyze(file._id)}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  📊 Analyze
                </button>
                <button
                  onClick={() => handleDelete(file._id)}
                  className="bg-error-50 hover:bg-error-100 text-error-700 font-medium py-2 px-4 rounded-xl border border-error-200 hover:border-error-300 transition-all duration-300 text-sm"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-secondary-200">
          <div className="text-sm text-secondary-600">
            Page {currentPage} of {totalPages} • {totalFiles} total files
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="btn-secondary py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="btn-secondary py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTable;