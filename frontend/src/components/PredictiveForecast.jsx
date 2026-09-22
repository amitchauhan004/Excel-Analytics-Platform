import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const PredictiveForecast = ({ data }) => {
    const [columns, setColumns] = useState([]);
    const [selectedColumn, setSelectedColumn] = useState('');
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (data && data.length > 0) {
            const headers = Object.keys(data[0]);
            const numericCols = headers.filter(header => {
                const sample = data.slice(0, 10).map(row => row[header]);
                const numCount = sample.filter(v => typeof v === 'number' || !isNaN(parseFloat(v))).length;
                return numCount > sample.length * 0.5;
            });
            setColumns(numericCols);
            if (numericCols.length > 0) setSelectedColumn(numericCols[0]);
        }
    }, [data]);

    const runForecast = async () => {
        if (!selectedColumn) return;
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(API_BASE_URL + 'forecast', {
                data,
                targetColumn: selectedColumn
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForecastData(response.data);
        } catch (err) {
            console.error("Forecast failed:", err);
            setError("Failed to generate forecast.");
        } finally {
            setLoading(false);
        }
    };

    const chartData = forecastData ? {
        labels: [
            ...forecastData.historical.map((_, i) => `Point ${i + 1}`),
            ...forecastData.forecast.map((_, i) => `Forecast ${i + 1}`)
        ],
        datasets: [
            {
                label: 'Historical Trend',
                data: [...forecastData.historical, ...Array(forecastData.forecast.length).fill(null)],
                borderColor: '#0284c7',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                tension: 0.3,
                pointRadius: 3,
                pointBackgroundColor: '#0284c7',
            },
            {
                label: 'Linear Regression Forecast',
                data: [...forecastData.trendLine, ...forecastData.forecast],
                borderColor: '#e11d48',
                backgroundColor: 'transparent',
                borderDash: [6, 4],
                tension: 0,
                pointRadius: 2,
                pointBackgroundColor: '#e11d48',
            }
        ]
    } : null;

    return (
        <div className="card-premium p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-5 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-900">Predictive Forecast Engine</h2>
                        <p className="text-slate-500 text-xs mt-0.5">Project future data points using statistical linear regression modeling.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={selectedColumn}
                        onChange={(e) => setSelectedColumn(e.target.value)}
                        className="input-premium text-xs py-2 px-3 w-full md:w-48"
                    >
                        {columns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>

                    <button
                        onClick={runForecast}
                        disabled={loading || !selectedColumn}
                        className={`btn-primary text-xs py-2.5 px-4 shrink-0 flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Calculating...' : 'Run Forecast'}
                    </button>
                </div>
            </div>

            {error && <p className="text-rose-600 text-xs mb-4 p-3 bg-rose-50 rounded-xl border border-rose-200">{error}</p>}

            {forecastData ? (
                <div className="h-72 w-full bg-slate-50/50 rounded-2xl p-4 border border-slate-200/60 animate-fadeIn">
                    <Line
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'top', labels: { font: { family: 'Plus Jakarta Sans', weight: '600' }, color: '#334155', usePointStyle: true } },
                                title: { display: true, text: `Linear Projection for [${selectedColumn}]`, font: { family: 'Plus Jakarta Sans', weight: '700', size: 13 }, color: '#0f172a' }
                            },
                            scales: {
                                y: { ticks: { font: { family: 'Plus Jakarta Sans' }, color: '#64748b' }, grid: { color: '#f1f5f9' } },
                                x: { ticks: { font: { family: 'Plus Jakarta Sans' }, color: '#64748b' }, grid: { display: false } }
                            }
                        }}
                    />
                </div>
            ) : (
                <div className="h-44 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 text-center p-4">
                    <p className="text-xs text-slate-500 font-medium">Select a column above and click <strong>Run Forecast</strong> to plot regression trend lines.</p>
                </div>
            )}
        </div>
    );
};

export default PredictiveForecast;

