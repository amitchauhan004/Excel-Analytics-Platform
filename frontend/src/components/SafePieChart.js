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
    
    const rows = googleData.slice(1);
    
    const labels = rows.map(row => row[0]);
    const values = rows.map(row => parseFloat(row[1]) || 0);
    
    return [{
      type: 'pie',
      labels: labels,
      values: values,
      textinfo: 'percent',
      textposition: 'inside',
      insidetextorientation: 'horizontal',
      automargin: true,
      hole: 0.4,
      marker: {
        colors: [
          '#38bdf8', '#818cf8', '#c084fc', '#f59e0b', '#10b981', 
          '#ef4444', '#a855f7', '#ec4899', '#22c55e', '#fb923c'
        ],
        line: {
          color: '#ffffff',
          width: 2
        }
      },
      hoverinfo: 'label+value+percent',
      hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>'
    }];
  };

  // Plotly layout configuration
  const getPlotlyLayout = (originalOptions) => {
    return {
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0.5,
        xanchor: 'center',
        y: -0.1,
        font: {
          family: 'Plus Jakarta Sans, Inter, sans-serif',
          size: 11,
          color: '#475569'
        }
      },
      margin: {
        l: 15,
        r: 15,
        t: 15,
        b: 35
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        family: 'Plus Jakarta Sans, Inter, sans-serif',
        size: 11,
        color: '#475569'
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
          <button 
            onClick={() => setChartError(false)}
            className="mt-2 px-3 py-1 bg-sky-500 text-white rounded text-sm hover:bg-sky-600"
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
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
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