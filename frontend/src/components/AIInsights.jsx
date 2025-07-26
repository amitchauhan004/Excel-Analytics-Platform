import React, { useState } from "react";
import axios from "axios";

const AIInsights = ({ fileId }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetInsights = async () => {
    if (!fileId) {
      setError("No file selected for analysis");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `http://localhost:5000/api/insights/${fileId}/analyze`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setInsights(res.data);
    } catch (err) {
      console.error("AI Insights error:", err);
      setError(err.response?.data?.error || "Failed to fetch AI insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
        onClick={handleGetInsights}
        disabled={loading || !fileId}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Analyzing...</span>
          </div>
        ) : (
          "Get AI Insights"
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {insights && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
          <div className="space-y-4">
            {typeof insights === 'string' ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">{insights}</pre>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(insights).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-100 pb-3">
                    <h4 className="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <p className="text-gray-600 mt-1">{String(value)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;