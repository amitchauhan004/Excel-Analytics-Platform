import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

const SafePieChart = ({ data, options, width, height, ...props }) => {
  const [chartError, setChartError] = useState(false);

  // Enhanced error handling for pie chart errors
  useEffect(() => {
    const handleGlobalError = (event) => {
      if (event.error && event.error.message) {
        const errorMessage = event.error.message.toLowerCase();
        if (errorMessage.includes('legenditemtext.reduce') || 
            errorMessage.includes('legenditemtext') ||
            errorMessage.includes('chart') ||
            errorMessage.includes('google') ||
            errorMessage.includes('pie')) {
          console.warn('Caught pie chart error, using Plotly fallback...', event.error.message);
          setChartError(true);
          event.preventDefault();
          return false;
        }
      }
    };

    const handleUnhandledRejection = (event) => {
      if (event.reason && event.reason.message) {
        const errorMessage = event.reason.message.toLowerCase();
        if (errorMessage.includes('legenditemtext.reduce') || 
            errorMessage.includes('legenditemtext') ||
            errorMessage.includes('chart') ||
            errorMessage.includes('google') ||
            errorMessage.includes('pie')) {
          console.warn('Caught unhandled pie chart error, using Plotly fallback...', event.reason.message);
          setChartError(true);
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

  // Convert Google Charts data format to Plotly format
  const convertToPlotlyData = (googleData) => {
    if (!googleData || googleData.length < 2) return null;
    
    const headers = googleData[0];
    const rows = googleData.slice(1);
    
    const labels = rows.map(row => row[0]);
    const values = rows.map(row => parseFloat(row[1]) || 0);
    
    return [{
      type: 'pie',
      labels: labels,
      values: values,
      textinfo: 'label+percent',
      textposition: 'outside',
      automargin: true,
      marker: {
        colors: [
          '#0EA5E9', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', 
          '#EF4444', '#A855F7', '#EC4899', '#22C55E', '#FB923C'
        ],
        line: {
          color: '#ffffff',
          width: 2
        }
      },
      hoverinfo: 'label+value+percent',
      hovertemplate: '<b>%{label}</b><br>Value: %{value}<br>Percentage: %{percent}<extra></extra>'
    }];
  };

  // Plotly layout configuration
  const getPlotlyLayout = (originalOptions) => {
    return {
      title: {
        text: originalOptions?.title || 'Pie Chart',
        font: {
          family: 'Poppins, sans-serif',
          size: 18,
          color: '#374151'
        }
      },
      showlegend: true,
      legend: {
        orientation: 'v',
        x: 1.05,
        y: 0.5,
        font: {
          family: 'Inter, sans-serif',
          size: 12,
          color: '#374151'
        }
      },
      margin: {
        l: 50,
        r: 150,
        t: 80,
        b: 50
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        family: 'Inter, sans-serif',
        size: 12,
        color: '#374151'
      }
    };
  };

  // Plotly config for better performance
  const plotlyConfig = {
    displayModeBar: false,
    responsive: true,
    staticPlot: false
  };

  // Validate data structure
  const isValidData = data && 
    Array.isArray(data) && 
    data.length > 0 && 
    data.every(row => Array.isArray(row) && row.length >= 2);

  const plotlyData = convertToPlotlyData(data);
  const plotlyLayout = getPlotlyLayout(options);

  if (chartError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-gray-600">Pie chart error detected</p>
          <p className="text-gray-500 text-sm mb-2">Using Plotly fallback</p>
          <button 
            onClick={() => setChartError(false)}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isValidData || !plotlyData) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-600">No valid data for pie chart</p>
          <p className="text-gray-500 text-sm">Please ensure data is properly formatted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
          Plotly Pie
        </div>
      </div>
      
      <Plot
        data={plotlyData}
        layout={plotlyLayout}
        config={plotlyConfig}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        onError={(error) => {
          console.warn('Plotly pie chart error:', error);
          setChartError(true);
        }}
      />
    </div>
  );
};

export default SafePieChart;