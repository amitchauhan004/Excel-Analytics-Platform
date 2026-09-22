import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../apiConfig';

import axios from 'axios';
import DecisionSimulator from '../components/DecisionSimulator';
import AutonomousAgent from '../components/AutonomousAgent';
import PredictiveForecast from '../components/PredictiveForecast';
import MultiDatasetIntelligence from '../components/MultiDatasetIntelligence';

const Simulation = () => {
    const [data, setData] = useState([]);
    const [files, setFiles] = useState([]);
    const [selectedFileId, setSelectedFileId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFiles();
    }, []);

    useEffect(() => {
        if (selectedFileId) {
            fetchData(selectedFileId);
        }
    }, [selectedFileId]);

    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}files`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFiles(response.data);

            if (response.data.length > 0) {
                setSelectedFileId(response.data[0]._id);
            }
        } catch (err) {
            console.error("Error fetching files:", err);
            setError("Failed to load file list.");
        }
    };

    const fetchData = async (fileId) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}data/file/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load data for simulation.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFileId(e.target.value);
    };

    const currentFileName = files.find(f => f._id === selectedFileId)?.originalName || '';

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Glassmorphism Banner */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-display font-bold text-slate-900">
                                Business Simulation Workbench
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 border border-sky-200 text-sky-700">
                                Real-time AI
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">
                            Project future revenue and cost outcomes using interactive scenario modeling, linear forecasting & cross-dataset linking.
                        </p>
                    </div>
                </div>

                <div className="w-full md:w-80 shrink-0">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                        <span>Active Dataset</span>
                        {currentFileName && <span className="text-sky-600 font-semibold truncate max-w-[140px]">{currentFileName}</span>}
                    </label>
                    <div className="relative">
                        <select
                            value={selectedFileId}
                            onChange={handleFileChange}
                            className="input-premium py-2.5 text-xs font-medium pl-9"
                        >
                            {files.map((file) => (
                                <option key={file._id} value={file._id}>
                                    {file.originalName}
                                </option>
                            ))}
                        </select>
                        <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl border border-slate-200/80 p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-sky-500 border-t-transparent mb-3"></div>
                    <p className="text-xs text-slate-500 font-medium">Loading simulation parameters...</p>
                </div>
            ) : error ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-4 rounded-2xl text-xs font-medium" role="alert">
                    <strong className="font-bold">Error loading dataset: </strong>
                    <span>{error}</span>
                </div>
            ) : (!data || data.length === 0) ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-5 rounded-2xl text-xs font-medium">
                    <strong className="font-bold">No active records! </strong>
                    <span>Please upload an Excel dataset from the Upload page to run simulations.</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Row 1: Decision Simulator */}
                    <DecisionSimulator initialData={data} />

                    {/* Row 2: Grid 2 Columns for AI Insights and Predictive Forecast */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AutonomousAgent data={data} />
                        <PredictiveForecast data={data} />
                    </div>

                    {/* Row 3: Multi-Dataset Intelligence */}
                    <MultiDatasetIntelligence availableFiles={files} />
                </div>
            )}
        </div>
    );
};

export default Simulation;

