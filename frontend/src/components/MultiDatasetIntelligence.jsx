import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const MultiDatasetIntelligence = ({ availableFiles }) => {
    const [selectedFileIds, setSelectedFileIds] = useState([]);
    const [merging, setMerging] = useState(false);
    const [mergeResult, setMergeResult] = useState(null);
    const [error, setError] = useState(null);

    const toggleFileSelection = (fileId) => {
        setSelectedFileIds(prev =>
            prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        );
    };

    const handleAnalyze = async () => {
        if (selectedFileIds.length < 2) return;
        setMerging(true);
        setError(null);
        setMergeResult(null);

        try {
            const token = localStorage.getItem('token');
            const selectedDatasets = await Promise.all(
                selectedFileIds.map(async (id) => {
                    const res = await axios.get(`${API_BASE_URL}data/file/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const file = availableFiles.find(f => f._id === id);
                    return { name: file.originalName, data: res.data };
                })
            );

            const response = await axios.post(`${API_BASE_URL}multilink/analyze`, {
                datasets: selectedDatasets
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMergeResult(response.data);

        } catch (err) {
            console.error("Merge failed", err);
            setError("Failed to link datasets. Ensure files have common key columns.");
        } finally {
            setMerging(false);
        }
    };

    return (
        <div className="card-premium p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-5 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-900">Multi-Dataset Intelligence Engine</h2>
                        <p className="text-slate-500 text-xs mt-0.5">Detect cross-table schema relationships and auto-merge data across multiple Excel files.</p>
                    </div>
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={merging || selectedFileIds.length < 2}
                    className={`btn-primary text-xs py-2.5 px-5 flex items-center gap-2 ${merging || selectedFileIds.length < 2 ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {merging ? 'Analyzing & Linking...' : 'Analyze & Link Selected Files'}
                </button>
            </div>

            {/* File Selection */}
            <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Select Files to Link (Minimum 2)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {availableFiles.map(file => {
                        const isSelected = selectedFileIds.includes(file._id);
                        return (
                            <div
                                key={file._id}
                                onClick={() => toggleFileSelection(file._id)}
                                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${isSelected ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-100 shadow-sm' : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-100'}`}
                            >
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                    <svg className={`w-4 h-4 shrink-0 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className={`text-xs font-semibold truncate ${isSelected ? 'text-sky-900' : 'text-slate-700'}`}>
                                        {file.originalName}
                                    </span>
                                </div>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 bg-white'}`}>
                                    {isSelected && (
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {error && (
                <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-medium">
                    {error}
                </div>
            )}

            {mergeResult && (
                <div className="mt-6 animate-fadeIn space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">Merge Analysis Results</h3>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${mergeResult.success ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800'}`}>
                            {mergeResult.success ? 'Link Successful' : 'Link Failed'}
                        </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard label="Total Merged Rows" value={mergeResult.totalRows} />
                        <StatCard label="Common Join Keys" value={mergeResult.commonKeys?.join(', ') || 'None'} />
                    </div>

                    {/* Merge Log */}
                    <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 text-xs font-mono">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Execution Log:</p>
                        <ul className="space-y-1">
                            {mergeResult.mergeLog.map((log, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <span className="text-sky-400">&gt;</span>
                                    <span>{log.step}: {log.key ? `Joined on [${log.key}]` : log.error} {log.matches ? `(${log.matches} matches)` : ''}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Preview Table */}
                    {mergeResult.mergedData && mergeResult.mergedData.length > 0 && (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                            <table className="min-w-full divide-y divide-slate-200 bg-white text-xs">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {Object.keys(mergeResult.mergedData[0]).map(header => (
                                            <th key={header} className="px-4 py-2.5 text-left font-semibold text-slate-600 uppercase tracking-wider">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {mergeResult.mergedData.slice(0, 5).map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            {Object.values(row).map((val, j) => (
                                                <td key={j} className="px-4 py-2.5 whitespace-nowrap text-slate-700">
                                                    {val}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 italic">
                                Previewing top 5 merged records.
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const StatCard = ({ label, value }) => (
    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-slate-900 truncate mt-0.5" title={value}>{value}</p>
    </div>
);

export default MultiDatasetIntelligence;

