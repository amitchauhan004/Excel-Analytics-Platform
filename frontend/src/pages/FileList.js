import React, { useEffect, useState } from "react";
import axios from "axios";

const FileList = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    axios.get("https://excel-analytics-platform-flame.vercel.app/api/files")
      .then(res => setFiles(res.data));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Uploaded Excel Files</h2>
      <ul className="space-y-2 mt-4">
        {files.map((file) => (
          <li key={file._id} className="border p-2 flex justify-between">
            <div>
              <strong>{file.originalName}</strong>
              <p className="text-sm text-gray-600">By: {file.uploadedBy} | {new Date(file.uploadedAt).toLocaleString()}</p>
            </div>
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={() => alert("TODO: Load and show this file")}
            >
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
