// Chart configuration utility
export const CHART_LIBRARIES = {
  GOOGLE_CHARTS: 'google-charts',
  CHART_JS: 'chart-js',
  AUTO: 'auto'
};

// Get user's preferred chart library
export const getPreferredChartLibrary = () => {
  return localStorage.getItem('preferredChartLibrary') || CHART_LIBRARIES.AUTO;
};

// Set user's preferred chart library
export const setPreferredChartLibrary = (library) => {
  localStorage.setItem('preferredChartLibrary', library);
};

// Check if we should use fallback due to known issues
export const shouldUseFallback = () => {
  const preferred = getPreferredChartLibrary();
  
  if (preferred === CHART_LIBRARIES.CHART_JS) {
    return true;
  }
  
  if (preferred === CHART_LIBRARIES.GOOGLE_CHARTS) {
    return false;
  }
  
  // Auto mode: check for known issues
  const hasGoogleChartsError = localStorage.getItem('googleChartsError');
  return hasGoogleChartsError === 'true';
};

// Mark Google Charts as having errors
export const markGoogleChartsError = () => {
  localStorage.setItem('googleChartsError', 'true');
};

// Clear Google Charts error flag
export const clearGoogleChartsError = () => {
  localStorage.removeItem('googleChartsError');
};

// Enhanced safe chart options that avoid known issues including legendItemText.reduce
export const getSafeChartOptions = (options) => {
  const safeOptions = {
    ...options,
    // Ensure legend configuration is completely safe
    legend: {
      position: options.legend?.position || 'bottom',
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
    colors: options.colors || [
      '#0EA5E9', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'
    ]
  };

  // Remove any other potentially problematic properties
  delete safeOptions.legendItemText;
  delete safeOptions.legendTextStyle;
  
  return safeOptions;
};

// Enhanced error detection for chart errors
export const isChartError = (error) => {
  if (!error || !error.message) return false;
  
  const errorMessage = error.message.toLowerCase();
  return errorMessage.includes('legenditemtext.reduce') || 
         errorMessage.includes('legenditemtext') ||
         errorMessage.includes('chart') ||
         errorMessage.includes('google');
};

// Global error handler for chart errors
export const setupChartErrorHandler = (onError) => {
  const handleGlobalError = (event) => {
    if (isChartError(event.error)) {
      console.warn('Caught chart error:', event.error.message);
      if (onError) onError(event.error);
      event.preventDefault();
      return false;
    }
  };

  const handleUnhandledRejection = (event) => {
    if (isChartError(event.reason)) {
      console.warn('Caught unhandled chart error:', event.reason.message);
      if (onError) onError(event.reason);
      event.preventDefault();
      return false;
    }
  };

  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  
  return () => {
    window.removeEventListener('error', handleGlobalError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  };
};

// Validate chart data structure
export const validateChartData = (data) => {
  return data && 
    Array.isArray(data) && 
    data.length > 0 && 
    data.every(row => Array.isArray(row) && row.length >= 2);
};

// Clean chart data to ensure it's safe
export const cleanChartData = (data) => {
  if (!validateChartData(data)) {
    return null;
  }
  
  return data.filter(row => 
    Array.isArray(row) && 
    row.length >= 2 && 
    typeof row[0] === 'string' && 
    (typeof row[1] === 'number' || typeof row[1] === 'string')
  );
};

// Convert Google Charts data to Chart.js format
export const convertToChartJSData = (googleData, chartType = 'BarChart') => {
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

// Convert Google Charts options to Chart.js options
export const convertToChartJSOptions = (googleOptions, chartType = 'BarChart') => {
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