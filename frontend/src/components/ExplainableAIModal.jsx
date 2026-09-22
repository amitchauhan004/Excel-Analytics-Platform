import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';


const ExplainableAIModal = ({ isOpen, onClose, insight, context }) => {
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && insight) {
            fetchExplanation();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, insight]);

    const fetchExplanation = async () => {
        setLoading(true);
        setError('');
        setExplanation('');

        try {
            const response = await axios.post(API_BASE_URL + 'explain', {
                insight,
                context
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setExplanation(response.data.explanation);
        } catch (err) {
            console.error("Error fetching explanation:", err);
            setError("Failed to load explanation. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">💡</span>
                        <h3 className="font-bold text-lg">AI Explanation</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600 italic">
                        "{insight}"
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                            <p className="text-sm text-gray-500"> analyzing data logic...</p>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-4 bg-red-50 rounded-lg">
                            {error}
                            <button
                                onClick={fetchExplanation}
                                className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="prose prose-sm">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Why this insight?</h4>
                            <p className="text-gray-700 leading-relaxed">
                                {explanation}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ExplainableAIModal;
