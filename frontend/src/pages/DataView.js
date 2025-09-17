import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import DataTable from "../components/DataTable";

const DataView = () => {
  const [files, setFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('https://excel-analytics-platform-flame.vercel.app/api/files', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(response.data);
      if (response.data.length > 0) {
        setSelectedFileId(response.data[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (fileId) => {
    setSelectedFileId(fileId);
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://excel-analytics-platform-flame.vercel.app/api/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFiles();
      if (selectedFileId === fileId) {
        setSelectedFileId(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete file');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Data View</h2>
        <button
          onClick={() => history.push('/upload')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Upload New File
        </button>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No files uploaded yet</p>
          <button
            onClick={() => history.push('/upload')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Upload Your First File
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Files</h3>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file._id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedFileId === file._id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleFileSelect(file._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.rowCount} rows
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file._id);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="lg:col-span-3">
            {selectedFileId ? (
              <DataTable fileId={selectedFileId} />
            ) : (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Select a file to view its data</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataView;
