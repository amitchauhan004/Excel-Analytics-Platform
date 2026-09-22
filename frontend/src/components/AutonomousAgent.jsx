import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const AutonomousAgent = ({ data }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const generateInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}agent/analyze`, {
                data
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(response.data);
        } catch (err) {
            console.error("Agent failed", err);
            setError("Failed to generate insights. Ensure server is running and API key is set.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card-premium p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-5 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-900">Autonomous Insight Agent</h2>
                        <p className="text-slate-500 text-xs mt-0.5">AI-powered strategic analysis & automated anomaly detection.</p>
                    </div>
                </div>

                <button
                    onClick={generateInsights}
                    disabled={loading}
                    className={`btn-primary text-xs py-2.5 px-5 flex items-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Analyzing Data...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span>Generate Strategic Insights</span>
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 text-xs font-medium">
                    {error}
                </div>
            )}

            {!result && !loading && (
                <div className="py-8 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-xs text-slate-500">Click <strong>Generate Strategic Insights</strong> to uncover AI findings from active dataset.</p>
                </div>
            )}

            {result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                    {/* Insights Card */}
                    <AgentCard
                        title="Key Insights"
                        svgIcon={
                            <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        items={result.insights}
                        color="bg-sky-50/60 border-sky-200/80 text-sky-900"
                        itemColor="text-sky-900"
                    />

                    {/* Risks Card */}
                    <AgentCard
                        title="Potential Risks"
                        svgIcon={
                            <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        }
                        items={result.risks}
                        color="bg-rose-50/60 border-rose-200/80 text-rose-900"
                        itemColor="text-rose-900"
                    />

                    {/* Opportunities Card */}
                    <AgentCard
                        title="Opportunities"
                        svgIcon={
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        }
                        items={result.opportunities}
                        color="bg-emerald-50/60 border-emerald-200/80 text-emerald-900"
                        itemColor="text-emerald-900"
                    />

                    {/* Actions Card */}
                    <AgentCard
                        title="Recommended Actions"
                        svgIcon={
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        items={result.actions}
                        color="bg-indigo-50/60 border-indigo-200/80 text-indigo-900"
                        itemColor="text-indigo-900"
                    />
                </div>
            )}
        </div>
    );
};

const AgentCard = ({ title, svgIcon, items, color, itemColor }) => (
    <div className={`p-4 rounded-xl border shadow-sm ${color}`}>
        <h3 className="text-sm font-bold mb-2.5 flex items-center gap-2">
            <span>{svgIcon}</span>
            <span>{title}</span>
        </h3>
        <ul className="space-y-1.5">
            {items?.map((item, index) => (
                <li key={index} className={`flex items-start gap-2 text-xs leading-relaxed ${itemColor || 'text-slate-700'}`}>
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

export default AutonomousAgent;

