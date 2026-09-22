import React, { useEffect, useState } from "react";
import API_BASE_URL from "../apiConfig";

import axios from "axios";
import ConfirmationModal from "../components/ConfirmationModal";

const History = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filesPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, fileId: null, fileName: '' });

  const fetchFiles = () => {
    setIsLoading(true);
    setError("");
    axios
      .get(`${API_BASE_URL}files`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setFiles(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching files:", err);
        setError("Failed to fetch file history.");
        setFiles([]);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        fetchFiles();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const filteredFiles = files.filter((file) =>
    file.originalName && file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDeleteClick = (fileId, fileName) => {
    setDeleteModal({ show: true, fileId, fileName });
  };

  const confirmDelete = async () => {
    const { fileId } = deleteModal;
    setDeleteModal({ show: false, fileId: null, fileName: '' });

    try {
      await axios.delete(`${API_BASE_URL}files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchFiles();

      if (currentFiles.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Failed to delete file. Please try again.");
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, fileId: null, fileName: '' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-slate-900">
                Dataset Upload History
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 border border-sky-200 text-sky-700">
                {files.length} Records
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Inspect, download raw files, or purge uploaded datasets from your account history.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-72 shrink-0 relative">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-premium py-2.5 text-xs font-medium pl-9 pr-8"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center items-center h-48 bg-white rounded-2xl border border-slate-200/80">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-sky-500 border-t-transparent mb-2"></div>
        </div>
      )}

      {/* File List */}
      {currentFiles.length > 0 ? (
        <div className="space-y-3">
          {currentFiles.map((file) => (
            <div
              key={file._id}
              className="card-premium p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="overflow-hidden">
                  <h2 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{file.originalName}</h2>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span>Uploaded: {new Date(file.uploadedAt).toLocaleString()}</span>
                    {file.uploadedBy && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[140px]">
                          User: {typeof file.uploadedBy === 'object' ? (file.uploadedBy.name || file.uploadedBy.email || "User") : file.uploadedBy}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    if (file.storedName) {
                      window.open(`${API_BASE_URL}files/download/${file.storedName}`, "_blank");
                    } else if (file.downloadUrl) {
                      window.open(`${API_BASE_URL.replace('/api/', '')}${file.downloadUrl}`, "_blank");
                    } else {
                      alert("Download not available for this file");
                    }
                  }}
                  className="btn-secondary text-xs py-2 px-4.5 flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                </button>

                <button
                  onClick={() => handleDeleteClick(file._id, file.originalName)}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800">No Records Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {searchQuery ? `No dataset matches "${searchQuery}".` : 'You have not uploaded any datasets yet.'}
            </p>
          </div>
        )
      )}

      {/* Pagination */}
      {filteredFiles.length > filesPerPage && (
        <div className="mt-6 flex justify-center">
          <nav>
            <ul className="flex items-center gap-1.5">
              {Array.from(
                { length: Math.ceil(filteredFiles.length / filesPerPage) },
                (_, index) => (
                  <li key={index}>
                    <button
                      onClick={() => paginate(index + 1)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${currentPage === index + 1
                        ? "bg-sky-600 text-white shadow-md shadow-sky-500/20"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                    >
                      {index + 1}
                    </button>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.show}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete File Record"
        message={`Are you sure you want to delete "${deleteModal.fileName}"? This action will permanently remove the dataset and associated analysis records.`}
        confirmText="Delete Record"
        cancelText="Cancel"
        danger={true}
      />
    </div>
  );
};

export default History;