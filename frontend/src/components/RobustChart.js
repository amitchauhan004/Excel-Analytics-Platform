import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'react-google-charts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import SafePieChart from './SafePieChart';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const RobustChart = ({ chartType, data, options, width, height, ...props }) => {
  const [chartError, setChartError] = useState(false);
  const [useChartJS, setUseChartJS] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const chartRef = useRef(null);

  // Clean and validate data
  const cleanData = (rawData) => {
    if (!rawData || !Array.isArray(rawData) || rawData.length < 2) {
      return null;
    }
    
    return rawData.filter(row => 
      Array.isArray(row) && 
      row.length >= 2 && 
      typeof row[0] === 'string' && 
      (typeof row[1] === 'number' || typeof row[1] === 'string')
    );
  };

  const validData = cleanData(data);
  const isValidData = validData && validData.length > 0;

  // Enhanced safe options for Google Charts to prevent legendItemText.reduce error
  const getSafeGoogleOptions = (originalOptions) => {
    const safeOptions = {
      ...originalOptions,
      // Ensure legend configuration is completely safe
      legend: {
        position: originalOptions.legend?.position || 'bottom',
        textStyle: {
          color: "#6B7280",
          fontSize: 12,
          fontFamily: "Inter, sans-serif"
        },
        // Remove any problematic legend properties
        alignment: 'center',
        maxLines: 3
      },
      // Remove problematic properties that cause legendItemText.reduce error
      legendTextStyle: undefined,
      legendItemText: undefined,
      // Ensure chartArea is properly defined
      chartArea: {
        width: '80%', 
        height: '80%',
        left: '10%',
        top: '10%'
      },
      // Add safe defaults for other properties
      backgroundColor: "transparent",
      titleTextStyle: {
        color: "#374151",
        fontSize: 16,
        fontFamily: "Poppins, sans-serif",
        bold: true
      },
      // Add safe colors array
      colors: originalOptions.colors || [
        '#0EA5E9', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'
      ],
      // Ensure proper chart dimensions
      width: width,
      height: height
    };

    // Remove any other potentially problematic properties
    delete safeOptions.legendItemText;
    delete safeOptions.legendTextStyle;
    
    return safeOptions;
  };

  // Convert data for Chart.js
  const convertToChartJSData = (googleData) => {
    if (!googleData || googleData.length < 2) return null;
    
    const headers = googleData[0];
    const rows = googleData.slice(1);
    
    if (chartType === 'PieChart') {
      return {
        labels: rows.map(row => row[0]),
        datasets: [{
          data: rows.map(row => parseFloat(row[1]) || 0),
          backgroundColor: [
            'rgba(14, 165, 233, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgba(14, 165, 233, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 2,
        }]
      };
    } else {
      return {
        labels: rows.map(row => row[0]),
        datasets: [{
          label: headers[1] || 'Value',
          data: rows.map(row => parseFloat(row[1]) || 0),
          backgroundColor: 'rgba(14, 165, 233, 0.6)',
          borderColor: 'rgba(14, 165, 233, 1)',
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        }]
      };
    }
  };

  // Chart.js options
  const getChartJSOptions = (originalOptions) => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: originalOptions.legend?.position || 'top',
          labels: {
            font: {
              family: 'Inter, sans-serif',
              size: 12,
              weight: '500'
            },
            padding: 20,
            usePointStyle: true,
          },
        },
        title: {
          display: true,
          text: originalOptions.title || `${chartType} Chart`,
          font: {
            family: 'Poppins, sans-serif',
            size: 18,
            weight: '600'
          },
          color: '#374151',
          padding: 20,
        },
      },
      ...(chartType !== 'PieChart' && {
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              font: {
                family: 'Inter, sans-serif',
                size: 11,
              },
              color: '#6B7280',
            },
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              font: {
                family: 'Inter, sans-serif',
                size: 11,
              },
              color: '#6B7280',
            },
          },
        },
      }),
    };
  };

  const handleGoogleChartError = (error) => {
    console.error('Google Charts error:', error);
    // Automatically switch to Chart.js on any Google Charts error
    setUseChartJS(true);
    setChartError(false);
  };

  const handleRetry = () => {
    setChartError(false);
    setRetryCount(prev => prev + 1);
  };

  const handleUseChartJS = () => {
    setUseChartJS(true);
    setChartError(false);
  };

  const handleUseGoogleCharts = () => {
    setUseChartJS(false);
    setChartError(false);
  };

  // Enhanced global error handler to catch legendItemText.reduce error
  useEffect(() => {
    const handleGlobalError = (event) => {
      if (event.error && event.error.message) {
        const errorMessage = event.error.message.toLowerCase();
        if (errorMessage.includes('legenditemtext.reduce') || 
            errorMessage.includes('legenditemtext') ||
            errorMessage.includes('chart') ||
            errorMessage.includes('google')) {
          console.warn('Caught chart error, switching to Chart.js...', event.error.message);
          setUseChartJS(true);
          setChartError(false);
          event.preventDefault();
          return false;
        }
      }
    };

    // Also listen for unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      if (event.reason && event.reason.message) {
        const errorMessage = event.reason.message.toLowerCase();
        if (errorMessage.includes('legenditemtext.reduce') || 
            errorMessage.includes('legenditemtext') ||
            errorMessage.includes('chart') ||
            errorMessage.includes('google')) {
          console.warn('Caught unhandled chart error, switching to Chart.js...', event.reason.message);
          setUseChartJS(true);
          setChartError(false);
          event.preventDefault();
          return false;
        }
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // For PieChart, always use SafePieChart to avoid legendItemText.reduce error
  if (chartType === 'PieChart') {
    return (
      <SafePieChart
        data={data}
        options={options}
        width={width}
        height={height}
        {...props}
      />
    );
  }

  // Render Chart.js component
  if (useChartJS) {
    const chartJSData = convertToChartJSData(validData);
    const chartJSOptions = getChartJSOptions(options);

    if (!chartJSData) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center p-4">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-600">No valid data for Chart.js</p>
            <button 
              onClick={handleUseGoogleCharts}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Try Google Charts
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="relative" style={{ width, height }}>
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            Chart.js
          </div>
        </div>
        {chartType === 'BarChart' && <Bar data={chartJSData} options={chartJSOptions} />}
        {chartType === 'LineChart' && <Line data={chartJSData} options={chartJSOptions} />}
      </div>
    );
  }

  // Error state
  if (chartError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-600">Chart could not be loaded</p>
          <p className="text-gray-500 text-sm mb-2">Google Charts encountered an error</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={handleRetry}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Retry ({retryCount + 1})
            </button>
            <button 
              onClick={handleUseChartJS}
              className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Use Chart.js
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No valid data
  if (!isValidData) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-600">No valid data available</p>
          <p className="text-gray-500 text-sm">Please ensure data is properly formatted</p>
        </div>
      </div>
    );
  }

  // Render Google Charts with enhanced error handling
  return (
    <div ref={chartRef} style={{ width, height }}>
      <Chart
        key={`google-chart-${retryCount}`}
        chartType={chartType}
        data={validData}
        options={getSafeGoogleOptions(options)}
        width={width}
        height={height}
        onError={handleGoogleChartError}
        {...props}
      />
    </div>
  );
};

export default RobustChart; 