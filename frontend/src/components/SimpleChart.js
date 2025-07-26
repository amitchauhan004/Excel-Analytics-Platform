import React, { useState, useEffect } from 'react';
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

const SimpleChart = ({ chartType, data, options, width, height }) => {
  const [useChartJS, setUseChartJS] = useState(false);
  const [chartError, setChartError] = useState(false);

  // Enhanced error handling for chart errors
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

  // Convert Google Charts data format to Chart.js format
  const convertData = (googleData) => {
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
      // Bar or Line chart
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

  // Convert Google Charts options to Chart.js options
  const convertOptions = (googleOptions) => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: googleOptions.legend?.position || 'top',
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
          text: googleOptions.title || `${chartType} Chart`,
          font: {
            family: 'Poppins, sans-serif',
            size: 18,
            weight: '600'
          },
          color: '#374151',
          padding: 20,
        },
      },
    };

    if (chartType !== 'PieChart') {
      baseOptions.scales = {
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
      };
    }

    return baseOptions;
  };

  const chartData = convertData(data);
  const chartOptions = convertOptions(options);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-600">No valid data available</p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'PieChart':
        return <Pie data={chartData} options={chartOptions} />;
      case 'BarChart':
        return <Bar data={chartData} options={chartOptions} />;
      case 'LineChart':
        return <Line data={chartData} options={chartOptions} />;
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };

  return (
    <div style={{ width, height }}>
      {renderChart()}
    </div>
  );
};

export default SimpleChart; 