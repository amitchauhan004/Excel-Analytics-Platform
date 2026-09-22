import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExplainableAIModal from '../components/ExplainableAIModal';
import API_BASE_URL from '../apiConfig';

const WorkflowAdvisor = () => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);

    // Explainable AI State
    const [explainModalOpen, setExplainModalOpen] = useState(false);
    const [selectedInsight, setSelectedInsight] = useState('');
    const [insightContext, setInsightContext] = useState({});

    const handleExplain = (rec) => {
        setSelectedInsight(rec);
        setInsightContext({
            fileId: selectedFile?._id,
            source: 'WorkflowAdvisor',
            fullRecommendations: recommendations
        });
        setExplainModalOpen(true);
    };

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
        }
    };

    const generateRecommendations = async () => {
        if (!selectedFile) return;
        setLoading(true);
        setRecommendations(null);

        try {
            const dataRes = await axios.get(`${API_BASE_URL}data/file/${selectedFile._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const fileData = dataRes.data.data || dataRes.data;

            const recRes = await axios.post(`${API_BASE_URL}workflow/recommend`, {
                data: fileData
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            setRecommendations(recRes.data);

        } catch (err) {
            console.error("Recommendation Error", err);
            alert("Failed to generate recommendations");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-display font-bold text-slate-900">
                                Workflow Advisor
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-700">
                                Process Intelligence
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">AI-driven actionable recommendations to optimize process bottlenecks.</p>
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
                        onClick={generateRecommendations}
                        disabled={loading || !selectedFile}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Evaluating...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Identify Improvements</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            {recommendations ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
                    {recommendations.recommendations.map((rec, idx) => (
                        <RecommendationCard
                            key={idx}
                            title={rec}
                            priority={recommendations.priority[idx]}
                            impact={recommendations.expectedImpact[idx]}
                            onExplain={() => handleExplain(rec)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center p-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Ready to Optimize?</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Select an active dataset above to let our AI identify process bottlenecks and suggest automation strategies.
                    </p>
                </div>
            )}

            <ExplainableAIModal
                isOpen={explainModalOpen}
                onClose={() => setExplainModalOpen(false)}
                insight={selectedInsight}
                context={insightContext}
            />
        </div>
    );
};

const RecommendationCard = ({ title, priority, impact, onExplain }) => {
    const priorityColors = {
        High: "bg-rose-50 text-rose-700 border-rose-200",
        Medium: "bg-amber-50 text-amber-700 border-amber-200",
        Low: "bg-emerald-50 text-emerald-700 border-emerald-200"
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${priorityColors[priority] || priorityColors.Medium}`}>
                            {priority} Priority
                        </span>
                        <button
                            onClick={onExplain}
                            className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 rounded-lg transition-colors font-medium flex items-center gap-1"
                        >
                            <svg className="w-3 h-3 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Why?</span>
                        </button>
                    </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-3 leading-snug">
                    {title}
                </h3>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Expected Impact</span>
                <span className="font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">{impact}</span>
            </div>
        </div>
    );
};

export default WorkflowAdvisor;

