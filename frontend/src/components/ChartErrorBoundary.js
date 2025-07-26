import React, { Component } from 'react';

class ChartErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('Chart Error Boundary caught an error:', error, errorInfo);
    
    // Check if this is a chart-related error
    if (this.isChartError(error)) {
      console.warn('Chart error detected, showing fallback UI');
      this.setState({ 
        hasError: true, 
        error, 
        errorInfo 
      });
    }
  }

  isChartError(error) {
    if (!error || !error.message) return false;
    
    const errorMessage = error.message.toLowerCase();
    return errorMessage.includes('legenditemtext.reduce') || 
           errorMessage.includes('legenditemtext') ||
           errorMessage.includes('chart') ||
           errorMessage.includes('google') ||
           errorMessage.includes('plotly') ||
           errorMessage.includes('chart.js');
  }

  componentDidMount() {
    // Set up global error handlers for chart errors
    this.handleGlobalError = (event) => {
      if (this.isChartError(event.error)) {
        console.warn('Global chart error caught:', event.error.message);
        this.setState({ 
          hasError: true, 
          error: event.error 
        });
        event.preventDefault();
        return false;
      }
    };

    this.handleUnhandledRejection = (event) => {
      if (this.isChartError(event.reason)) {
        console.warn('Global unhandled chart error caught:', event.reason.message);
        this.setState({ 
          hasError: true, 
          error: event.reason 
        });
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', this.handleGlobalError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    // Clean up event listeners
    if (this.handleGlobalError) {
      window.removeEventListener('error', this.handleGlobalError);
    }
    if (this.handleUnhandledRejection) {
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chart Error Detected
            </h3>
            <p className="text-gray-600 mb-4">
              There was an issue with the chart rendering. This has been automatically handled.
            </p>
            {this.state.error && (
              <details className="text-left mb-4">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700">
                  {this.state.error.message}
                </div>
              </details>
            )}
            <div className="flex gap-2 justify-center">
              <button 
                onClick={this.handleRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
              {this.props.onFallback && (
                <button 
                  onClick={() => this.props.onFallback(this.state.error)}
                  className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                >
                  Use Alternative
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary; 