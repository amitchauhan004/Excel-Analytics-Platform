import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../apiConfig';
import axios from 'axios';

const DataStoryMode = () => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}files`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setFiles(res.data);
            if (res.data.length > 0) setSelectedFile(res.data[0]);
        } catch (err) {
            console.error("Failed to fetch files", err);
            setError("Failed to load your datasets.");
        }
    };

    const generateStory = async () => {
        if (!selectedFile) return;
        setLoading(true);
        setError(null);
        setStory(null);

        try {
            const dataRes = await axios.get(`${API_BASE_URL}data/file/${selectedFile._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const fileData = dataRes.data.data || dataRes.data;

            const storyRes = await axios.post(`${API_BASE_URL}story/generate`, {
                data: fileData,
                summary: {}
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            setStory(storyRes.data);
        } catch (err) {
            console.error("Story Generation Error", err);
            setError("The AI could not weave a story this time. Please check your data or API key.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">

            {/* Header Panel */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-display font-bold text-slate-900">
                                Data Story Mode
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700">
                                Executive Narrative
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">High-level strategic business story synthesized from your dataset records.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <select
                        className="input-premium text-xs py-2.5 px-3 bg-white w-full sm:w-56"
                        value={selectedFile?._id || ''}
                        onChange={(e) => setSelectedFile(files.find(f => f._id === e.target.value))}
                    >
                        {files.map(f => (
                            <option key={f._id} value={f._id}>{f.originalName}</option>
                        ))}
                    </select>

                    <button
                        className={`btn-primary text-xs py-2.5 px-5 flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        onClick={generateStory}
                        disabled={loading || !selectedFile}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Weaving Story...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Generate Executive Summary</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="py-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-indigo-500 border-t-transparent"></div>
                    <p className="text-slate-600 text-xs font-medium animate-pulse">Our business analyst is reviewing your records...</p>
                </div>
            )}

            {/* Story Display */}
            {story && !loading && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                                Strategic Brief
                            </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 mb-4 leading-tight">
                            {story.title}
                        </h2>

                        <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-100 mb-8">
                            <p className="text-base text-slate-700 leading-relaxed italic text-justify font-serif">
                                "{story.storyline}"
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100">
                                <h3 className="flex items-center gap-2 text-sky-800 font-bold text-sm mb-3">
                                    <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    Key Highlights
                                </h3>
                                <ul className="space-y-2">
                                    {story.highlights.map((h, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                                            <span>{h}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-100">
                                <h3 className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-3">
                                    <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Identified Risks
                                </h3>
                                <ul className="space-y-2">
                                    {story.risks.map((r, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                            <span>{r}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-6 p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                            <h3 className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-3">
                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Growth Opportunities
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {story.opportunities.map((o, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        <span>{o}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-8 bg-gradient-to-r from-sky-600 to-blue-700 p-6 rounded-2xl text-white shadow-md">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-sky-200 mb-1.5">Executive Conclusion</h4>
                            <p className="text-sm font-medium leading-relaxed text-sky-50">
                                {story.conclusion}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!story && !loading && !error && (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center p-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Your Data Story Awaits</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Select an active dataset above and click <strong>Generate Executive Summary</strong> to synthesize strategic insights.
                    </p>
                </div>
            )}
        </div>
    );
};

export default DataStoryMode;

