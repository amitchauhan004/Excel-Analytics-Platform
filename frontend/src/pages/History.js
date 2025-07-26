import React, { useEffect, useState } from "react";
import axios from "axios";

const History = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filesPerPage] = useState(5); // Number of files per page
  const [isLoading, setIsLoading] = useState(false);

  const fetchFiles = () => {
    setIsLoading(true);
    setError("");
    axios
      .get("http://localhost:5000/api/files", {
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

  // Listen for user changes and refresh data
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

  // Filter files based on search query
  const filteredFiles = files.filter((file) =>
    file.originalName && file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Delete file function
  const handleDeleteFile = async (fileId, fileName) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/files/${fileId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        // Refresh the files data after successful deletion
        fetchFiles();
        
        // If current page becomes empty, go to previous page
        if (currentFiles.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        console.error("Error deleting file:", err);
        alert("Failed to delete file. Please try again.");
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Upload History</h1>

      {/* Search Bar */}
      <div className="mb-3 sm:mb-4">
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md p-2 sm:p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-white text-gray-900 border-gray-300 focus:ring-teal-500 text-sm sm:text-base"
        />
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm sm:text-base">{error}</p>}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
          <span className="ml-2 text-sm sm:text-base">Loading...</span>
        </div>
      )}

      {/* File List */}
      {currentFiles.length > 0 ? (
        <ul className="space-y-3 sm:space-y-4">
          {currentFiles.map((file) => (
            <li
              key={file._id}
              className="border p-3 sm:p-4 rounded shadow bg-white text-gray-900 border-gray-300"
            >
              <h2 className="font-bold text-sm sm:text-base mb-1">{file.originalName}</h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                Uploaded by: {file.uploadedBy} |{" "}
                {new Date(file.uploadedAt).toLocaleString()}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    if (file.downloadUrl) {
                      window.open(`http://localhost:5000${file.downloadUrl}`, "_blank");
                    } else {
                      alert("Download URL not available");
                    }
                  }}
                  className="px-3 sm:px-4 py-2 rounded bg-purple-500 hover:bg-purple-600 text-white text-sm sm:text-base"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDeleteFile(file._id, file.originalName)}
                  className="px-3 sm:px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-sm sm:text-base"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !isLoading && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📁</div>
            <p className="text-gray-600 text-sm sm:text-base">No files uploaded yet.</p>
          </div>
        )
      )}

      {/* Pagination */}
      {filteredFiles.length > filesPerPage && (
        <div className="mt-4 sm:mt-6 flex justify-center">
          <nav>
            <ul className="flex flex-wrap justify-center gap-1 sm:gap-2">
              {Array.from(
                { length: Math.ceil(filteredFiles.length / filesPerPage) },
                (_, index) => (
                  <li key={index}>
                    <button
                      onClick={() => paginate(index + 1)}
                      className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base ${
                        currentPage === index + 1
                          ? "bg-purple-500 text-white"
                          : "bg-gray-300 text-gray-900 hover:bg-gray-400"
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
    </div>
  );
};

export default History;