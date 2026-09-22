import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const DecisionSimulator = ({ initialData }) => {
    const [adjustments, setAdjustments] = useState({
        priceChangePercent: 0,
        costChangePercent: 0,
        demandChangePercent: 0
    });

    const [simulationResult, setSimulationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSliderChange = (e) => {
        const { name, value } = e.target;
        setAdjustments(prev => ({
            ...prev,
            [name]: parseFloat(value)
        }));
    };

    const applyPreset = (price, cost, demand) => {
        const newAdj = {
            priceChangePercent: price,
            costChangePercent: cost,
            demandChangePercent: demand
        };
        setAdjustments(newAdj);
        triggerSimulation(newAdj);
    };

    const triggerSimulation = async (currentAdjustments = adjustments) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}simulate`, {
                data: initialData,
                adjustments: currentAdjustments
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSimulationResult(response.data);
        } catch (err) {
            console.error("Simulation failed", err);
            const errorMessage = err.response?.data?.error || err.message || "Failed to run simulation.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const formatNumber = (val) => {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    // Chart Data
    const chartData = simulationResult ? {
        labels: ['Revenue', 'Cost', 'Profit'],
        datasets: [
            {
                label: 'Baseline',
                data: [
                    simulationResult.baseline.revenue,
                    simulationResult.baseline.cost,
                    simulationResult.baseline.profit
                ],
                backgroundColor: 'rgba(148, 163, 184, 0.7)',
                borderColor: 'rgba(100, 116, 139, 1)',
                borderWidth: 1,
                borderRadius: 8,
            },
            {
                label: 'Projected',
                data: [
                    simulationResult.projected.revenue,
                    simulationResult.projected.cost,
                    simulationResult.projected.profit
                ],
                backgroundColor: 'rgba(2, 132, 199, 0.85)',
                borderColor: 'rgba(3, 105, 161, 1)',
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { font: { family: 'Plus Jakarta Sans', weight: '600', size: 12 }, color: '#334155', usePointStyle: true }
            },
            title: {
                display: true,
                text: 'Financial Impact Projection ($)',
                font: { family: 'Plus Jakarta Sans', weight: '700', size: 14 },
                color: '#0f172a'
            },
        },
        scales: {
            y: {
                ticks: { font: { family: 'Plus Jakarta Sans' }, color: '#64748b' },
                grid: { color: '#f1f5f9' }
            },
            x: {
                ticks: { font: { family: 'Plus Jakarta Sans', weight: '600' }, color: '#334155' },
                grid: { display: false }
            }
        }
    };

    return (
        <div className="card-premium p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-display font-bold text-slate-900">Interactive Decision Simulator</h2>
                        <p className="text-slate-500 text-xs mt-0.5">Adjust price, cost, and demand metrics to project revenue and profit outcomes instantly.</p>
                    </div>
                </div>

                {/* Presets */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Presets:</span>
                    <button
                        onClick={() => applyPreset(10, 0, 15)}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-lg transition-colors"
                    >
                        Growth (+10% P, +15% D)
                    </button>
                    <button
                        onClick={() => applyPreset(0, -10, 0)}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg transition-colors"
                    >
                        Cost Cut (-10% C)
                    </button>
                    <button
                        onClick={() => applyPreset(0, 0, 0)}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                    >
                        Reset (0%)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls */}
                <div className="space-y-6 lg:col-span-1 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Adjustment Parameters</h3>

                    {/* Price Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                                Price Change
                            </label>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${adjustments.priceChangePercent > 0 ? 'bg-emerald-100 text-emerald-700' : adjustments.priceChangePercent < 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'}`}>
                                {adjustments.priceChangePercent > 0 ? '+' : ''}{adjustments.priceChangePercent}%
                            </span>
                        </div>
                        <input
                            type="range"
                            name="priceChangePercent"
                            min="-50"
                            max="50"
                            value={adjustments.priceChangePercent}
                            onChange={handleSliderChange}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                        />
                    </div>

                    {/* Cost Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                Cost Change
                            </label>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${adjustments.costChangePercent > 0 ? 'bg-rose-100 text-rose-700' : adjustments.costChangePercent < 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                {adjustments.costChangePercent > 0 ? '+' : ''}{adjustments.costChangePercent}%
                            </span>
                        </div>
                        <input
                            type="range"
                            name="costChangePercent"
                            min="-50"
                            max="50"
                            value={adjustments.costChangePercent}
                            onChange={handleSliderChange}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                        />
                    </div>

                    {/* Demand Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                Demand Change
                            </label>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${adjustments.demandChangePercent > 0 ? 'bg-emerald-100 text-emerald-700' : adjustments.demandChangePercent < 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'}`}>
                                {adjustments.demandChangePercent > 0 ? '+' : ''}{adjustments.demandChangePercent}%
                            </span>
                        </div>
                        <input
                            type="range"
                            name="demandChangePercent"
                            min="-50"
                            max="50"
                            value={adjustments.demandChangePercent}
                            onChange={handleSliderChange}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                        />
                    </div>

                    <button
                        onClick={() => triggerSimulation(adjustments)}
                        disabled={loading}
                        className={`w-full btn-primary flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Simulating...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Run Simulation</span>
                            </>
                        )}
                    </button>

                    {error && <p className="text-rose-600 text-xs font-medium mt-2 text-center bg-rose-50 p-2 rounded-lg border border-rose-200">{error}</p>}
                </div>

                {/* Results */}
                <div className="lg:col-span-2 space-y-6">
                    {!simulationResult ? (
                        <div className="h-full min-h-[280px] flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mb-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800">Ready to Simulate</h4>
                            <p className="text-xs text-slate-500 max-w-xs mt-1">Adjust sliders on the left or click a preset scenario to project financial impact.</p>
                        </div>
                    ) : (
                        <>
                            {/* Metric Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <MetricCard
                                    label="Revenue"
                                    baseline={simulationResult.baseline.revenue}
                                    projected={simulationResult.projected.revenue}
                                    format={formatCurrency}
                                />
                                <MetricCard
                                    label="Profit"
                                    baseline={simulationResult.baseline.profit}
                                    projected={simulationResult.projected.profit}
                                    format={formatCurrency}
                                />
                                <MetricCard
                                    label="Cost"
                                    baseline={simulationResult.baseline.cost}
                                    projected={simulationResult.projected.cost}
                                    format={formatCurrency}
                                    inverse={true}
                                />
                                <MetricCard
                                    label="Quantity"
                                    baseline={simulationResult.baseline.quantity}
                                    projected={simulationResult.projected.quantity}
                                    format={formatNumber}
                                />
                            </div>

                            {/* Chart Container */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm h-72">
                                <Bar options={chartOptions} data={chartData} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, baseline, projected, format, inverse = false }) => {
    const delta = projected - baseline;
    const percentChange = baseline !== 0 ? (delta / baseline) * 100 : 0;

    let colorClass = 'text-slate-500 bg-slate-100';
    if (delta > 0) colorClass = inverse ? 'text-rose-700 bg-rose-50 border border-rose-200' : 'text-emerald-700 bg-emerald-50 border border-emerald-200';
    if (delta < 0) colorClass = inverse ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200';

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            <div className="mt-1">
                <span className="text-base font-bold text-slate-900">{format(projected)}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-xs text-slate-400 line-through">{format(baseline)}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${colorClass}`}>
                    {delta > 0 ? '+' : ''}{percentChange.toFixed(1)}%
                </span>
            </div>
        </div>
    );
};

export default DecisionSimulator;

