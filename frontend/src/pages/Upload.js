import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import FileUploader from "../components/FileUploader";

const Upload = () => {
  const history = useHistory();

  const handleUploadSuccess = (data) => {
    // Redirect to Analyze Data page with the uploaded file ID
    if (data.fileMeta && data.fileMeta._id) {
      history.push(`/analyze?fileId=${data.fileMeta._id}`);
    } else {
      history.push("/analyze");
    }
  };

  const handleUploadError = (error) => {
    console.error("Upload error:", error);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">
            Upload Excel File
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Upload your Excel file to start analyzing your data
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          <FileUploader
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            accept=".xlsx,.xls,.csv"
          />
        </div>

        <div className="mt-6 sm:mt-8 text-center text-gray-600">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Supported File Types</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
            <div className="text-center">
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📊</div>
              <p className="text-xs sm:text-sm">Excel (.xlsx)</p>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📈</div>
              <p className="text-xs sm:text-sm">Excel (.xls)</p>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📋</div>
              <p className="text-xs sm:text-sm">CSV (.csv)</p>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center text-gray-500">
          <p className="text-xs sm:text-sm">
            Maximum file size: 10MB | Supported formats: Excel (.xlsx, .xls) and CSV files
          </p>
        </div>
      </div>
    </div>
  );
};

export default Upload;