import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

import ExplainableAIModal from './ExplainableAIModal';

const AIInsightPanel = ({ data, fileId }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);

  const [analysisType] = useState('general');

  // Explainable AI State
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState('');
  const [insightContext, setInsightContext] = useState({});

  const handleExplain = (insightText) => {
    setSelectedInsight(insightText);
    setInsightContext({
      fileId: fileId,
      analysisType: analysisType,
      fullInsights: insights
    });
    setExplainModalOpen(true);
  };

  const generateInsights = async () => {
    if (!data || data.length === 0) {
      setError("No data available to analyze");
      return;
    }

    setLoading(true);
    setError(null);
    setInsights(null);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_BASE_URL}ai/analyze`,
        { data, analysisType },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setInsights(response.data.insights);
      } else {
        setError(response.data.error || "Failed to generate insights");
        if (response.data.fallback) {
          setInsights(response.data.fallback);
        }
      }
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError(err.response?.data?.error || "Failed to connect to AI service");
      setInsights({
        trends: ["Unable to generate trends - connection error"],
        anomalies: ["Unable to detect anomalies - connection error"],
        recommendations: ["Please check your API key and try again"]
      });
    } finally {
      setLoading(false);
    }
  };

  const exportInsights = () => {
    if (!insights) return;

    const text = `
AI Data Analysis Insights
========================

KEY TRENDS:
${insights.trends?.map(t => `• ${t}`).join('\n') || 'No trends detected'}

ANOMALIES:
${insights.anomalies?.map(a => `• ${a}`).join('\n') || 'No anomalies detected'}

RECOMMENDATIONS:
${insights.recommendations?.map(r => `• ${r}`).join('\n') || 'No recommendations available'}
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      alert('Insights copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const InsightCard = ({ title, items, svgIcon, color }) => {
    const colorClasses = {
      blue: "bg-sky-50/60 border-sky-200/80 text-sky-900",
      red: "bg-rose-50/60 border-rose-200/80 text-rose-900",
      green: "bg-emerald-50/60 border-emerald-200/80 text-emerald-900"
    };

    return (
      <div className={`p-4 rounded-xl border shadow-sm ${colorClasses[color] || colorClasses.blue}`}>
        <div className="flex items-center gap-2 mb-3">
          <span>{svgIcon}</span>
          <h3 className="font-bold text-xs uppercase tracking-wider">{title}</h3>
        </div>
        <ul className="space-y-2">
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <li key={index} className="text-xs flex justify-between items-start group leading-relaxed">
                <span className="mr-2 flex items-start gap-1.5">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                  <span>{item}</span>
                </span>
                <button
                  onClick={() => handleExplain(item)}
                  className="opacity-0 group-hover:opacity-100 text-[10px] px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded hover:bg-slate-50 transition-all whitespace-nowrap shrink-0"
                  title="Explain why?"
                >
                  Why?
                </button>
              </li>
            ))
          ) : (
            <li className="text-xs italic text-slate-400">No {title.toLowerCase()} detected</li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              AI Data Copilot
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">Automated pattern recognition & anomaly diagnostic engine.</p>
          </div>
        </div>

        <button
          onClick={generateInsights}
          disabled={loading || !data || data.length === 0}
          className={`btn-primary text-xs py-2 px-4 flex items-center gap-2 ${loading || !data || data.length === 0 ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Get Decision Insights</span>
            </>
          )}
        </button>
      </div>

      {/* Data Summary */}
      {data && data.length > 0 && (
        <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-xl flex items-center justify-between text-xs text-sky-900">
          <span>Active Dataset Profile:</span>
          <span className="font-bold">{data.length} records • {Object.keys(data[0] || {}).length} columns</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-sky-500 border-t-transparent"></div>
          <p className="mt-2 text-xs font-medium text-slate-500">AI inspecting business anomalies and trend lines...</p>
        </div>
      )}

      {/* Insights Results */}
      {insights && !loading && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-end">
            <button
              onClick={exportInsights}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy Summary</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InsightCard
              title="Key Trends"
              items={insights.trends}
              svgIcon={
                <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              color="blue"
            />
            <InsightCard
              title="Anomalies"
              items={insights.anomalies}
              svgIcon={
                <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              color="red"
            />
            <InsightCard
              title="Recommendations"
              items={insights.recommendations}
              svgIcon={
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="green"
            />
          </div>
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

export default AIInsightPanel;

