import React from "react";
import { useHistory } from "react-router-dom";
import FileUploader from "../components/FileUploader";

const Upload = () => {
  const history = useHistory();

  const handleUploadSuccess = (data) => {
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Glassmorphism Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-slate-900">
                Upload Dataset Records
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                Auto-Parsing
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Upload Excel spreadsheets (.xlsx, .xls) or CSV files to trigger automated AI modeling and chart visualization.
            </p>
          </div>
        </div>
      </div>

      {/* Main Uploader Box */}
      <div className="card-premium p-6 sm:p-8">
        <FileUploader
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          accept=".xlsx,.xls,.csv"
        />
      </div>

      {/* Supported Formats Grid */}
      <div className="card-premium p-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-4">Supported File Formats</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">Excel (.xlsx)</p>
              <p className="text-[10px] text-slate-500">Modern Excel workbook</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">Excel (.xls)</p>
              <p className="text-[10px] text-slate-500">Legacy Excel format</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">CSV (.csv)</p>
              <p className="text-[10px] text-slate-500">Comma-separated text</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            100% Encrypted Storage • Maximum File Size: 10MB
          </span>
        </div>
      </div>
    </div>
  );
};

export default Upload;