import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../apiConfig";

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
        `${API_BASE_URL}dashboard/history?page=${page}&limit=10&type=${type}&dateRange=${range}`,
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
    setCurrentPage(1);
    fetchHistory(1, historyType, dateRange);
  }, [historyType, dateRange, selectedView]);

  const handleAnalyze = (fileId) => {
    history.push(`/analyze?fileId=${fileId}`);
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      await axios.delete(`${API_BASE_URL}files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("File deleted successfully.");
      onFileDeleted();
      fetchHistory(currentPage, historyType, dateRange);
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
      const response = await axios.delete(`${API_BASE_URL}files/bulk/delete`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: { fileIds: selectedFiles }
      });

      const results = response.data.results;
      const successCount = results.totalDeleted;
      const failedCount = results.failed.length;

      let message = `Bulk delete completed!\n\n`;
      message += `Successfully deleted: ${successCount} file${successCount !== 1 ? 's' : ''}\n`;
      message += `Total data rows deleted: ${results.totalDataRowsDeleted}\n`;

      if (failedCount > 0) {
        message += `Failed to delete: ${failedCount} file${failedCount !== 1 ? 's' : ''}\n`;
      }

      alert(message);

      setSelectedFiles([]);
      onFileDeleted();
      fetchHistory(currentPage, historyType, dateRange);
    } catch (err) {
      console.error("Bulk delete error:", err);
      const errorMessage = err.response?.data?.error || "Failed to perform bulk delete.";
      alert(`Error: ${errorMessage}`);
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
      window.open(`${API_BASE_URL.replace('/api/', '')}${file.downloadUrl}`, "_blank");
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
          <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 text-xs font-medium">Loading dataset history...</p>
        </div>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="card-premium p-8">
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">{getViewTitle()}</h3>
          <p className="text-slate-500 text-xs">No files found matching the selected criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{getViewTitle()}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{getFilterDescription()} • Total: {totalFiles} files</p>
        </div>

        {/* Bulk Actions */}
        {selectedFiles.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold py-1.5 px-3 rounded-xl border border-rose-200 text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{isDeleting ? 'Deleting...' : `Delete ${selectedFiles.length}`}</span>
            </button>
          </div>
        )}
      </div>

      {/* Files List */}
      <div className="space-y-3">
        {/* Select All */}
        {files.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
            <input
              type="checkbox"
              checked={selectedFiles.length === files.length && files.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-sky-600 bg-white border-slate-300 rounded focus:ring-sky-500"
            />
            <span className="text-xs font-bold text-slate-700">
              Select all {files.length} files
            </span>
          </div>
        )}

        {files.map((file) => (
          <div key={file._id} className="card-premium p-4 hover:border-sky-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file._id)}
                  onChange={() => handleSelectFile(file._id)}
                  className="w-4 h-4 text-sky-600 bg-white border-slate-300 rounded focus:ring-sky-500 shrink-0"
                />

                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>

                <div className="overflow-hidden flex-1">
                  <h3 className="font-bold text-xs text-slate-900 truncate">{file.originalName}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Uploaded by {typeof file.uploadedBy === 'object' ? (file.uploadedBy?.name || file.uploadedBy?.email || "User") : (file.uploadedBy || "User")} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                      {file.rowCount || "0"} rows
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                      {file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDownload(file)}
                  className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleAnalyze(file._id)}
                  className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Analyze</span>
                </button>
                <button
                  onClick={() => handleDelete(file._id)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold py-1.5 px-3 rounded-xl border border-rose-200 text-xs transition-all flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs text-slate-500">
          <span>Page {currentPage} of {totalPages} • {totalFiles} total files</span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-50"
            >
              ← Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-50"
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