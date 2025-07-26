import React, { useState, useRef, useEffect } from "react";
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
import { Bar, Line, Pie } from "react-chartjs-2";
import Plot from "react-plotly.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import SafePieChart from "./SafePieChart";

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

const ChartGenerator = ({ data }) => {
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [zAxis, setZAxis] = useState("");
  const [chartType, setChartType] = useState("bar2d");
  const [chartError, setChartError] = useState(false);
  const [viewMode, setViewMode] = useState("3d");
  const [colorBy, setColorBy] = useState("");
  const [sizeBy, setSizeBy] = useState("");
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [cameraPosition, setCameraPosition] = useState({ x: 1.5, y: 1.5, z: 1.5 });
  const chartRef = useRef(null);

  // Enhanced error handling for chart errors
  useEffect(() => {
    const handleGlobalError = (event) => {
      if (event.error && event.error.message) {
        const errorMessage = event.error.message.toLowerCase();
        if (errorMessage.includes('legenditemtext.reduce') || 
            errorMessage.includes('legenditemtext') ||
            errorMessage.includes('chart') ||
            errorMessage.includes('google')) {
          console.warn('Caught chart error in ChartGenerator...', event.error.message);
          setChartError(true);
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
          console.warn('Caught unhandled chart error in ChartGenerator...', event.reason.message);
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

  if (!data || data.length === 0) {
    return (
      <div className="card-premium p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-xl font-display font-bold text-secondary-900 mb-2">No Data Available</h3>
          <p className="text-secondary-600">Please load data to generate charts.</p>
        </div>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  // 2D Chart.js data with premium colors
  const chartData = {
    labels: data.map(row => row[xAxis]),
    datasets: [
      {
        label: yAxis,
        data: data.map(row => row[yAxis]),
        backgroundColor: "rgba(14, 165, 233, 0.6)",
        borderColor: "rgba(14, 165, 233, 1)",
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Chart options with premium styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
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
        text: `${chartType.toUpperCase()} Chart`,
        font: {
          family: 'Poppins, sans-serif',
          size: 18,
          weight: '600'
        },
        color: '#374151',
        padding: 20,
      },
    },
    scales: chartType === "pie2d" ? {} : {
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
  };

  // Pie chart specific options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: '500'
          },
        },
      },
      title: {
        display: true,
        text: 'Pie Chart',
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

  // Pie chart data
  const pieChartData = {
    labels: data.map(row => row[xAxis]),
    datasets: [
      {
        data: data.map(row => row[yAxis]),
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
      },
    ],
  };

  // Enhanced 3D Plotly data with multiple chart types
  const generate3DData = () => {
    if (!xAxis || !yAxis || !zAxis) return [];

    const xValues = data.map(row => row[xAxis]);
    const yValues = data.map(row => row[yAxis]);
    const zValues = data.map(row => row[zAxis]);
    
    // Color mapping
    let colors = [];
    if (colorBy && columns.includes(colorBy)) {
      const colorValues = data.map(row => row[colorBy]);
      const uniqueValues = [...new Set(colorValues)];
      const colorMap = [
        '#0EA5E9', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', 
        '#EF4444', '#A855F7', '#EC4899', '#22C55E', '#FB923C'
      ];
      colors = colorValues.map(val => colorMap[uniqueValues.indexOf(val) % colorMap.length]);
    } else {
      colors = Array(data.length).fill('#0EA5E9');
    }

    // Size mapping
    let sizes = [];
    if (sizeBy && columns.includes(sizeBy)) {
      const sizeValues = data.map(row => parseFloat(row[sizeBy]) || 0);
      const maxSize = Math.max(...sizeValues);
      const minSize = Math.min(...sizeValues);
      sizes = sizeValues.map(val => ((val - minSize) / (maxSize - minSize)) * 20 + 5);
    } else {
      sizes = Array(data.length).fill(8);
    }

    // Text labels
    const textLabels = showLabels ? data.map(row => 
      `${xAxis}: ${row[xAxis]}<br>${yAxis}: ${row[yAxis]}<br>${zAxis}: ${row[zAxis]}`
    ) : [];

    switch (chartType) {
      case "scatter3d":
        return [{
          x: xValues,
          y: yValues,
          z: zValues,
          type: "scatter3d",
          mode: "markers",
          marker: { 
            color: colors,
            size: sizes,
            opacity: 0.8,
            line: {
              color: '#ffffff',
              width: 1
            }
          },
          text: textLabels,
          hovertemplate: '<b>%{text}</b><extra></extra>'
        }];

      case "surface3d":
        // Create surface plot data
        const uniqueX = [...new Set(xValues)];
        const uniqueY = [...new Set(yValues)];
        const zMatrix = uniqueY.map(y => 
          uniqueX.map(x => {
            const point = data.find(row => row[xAxis] === x && row[yAxis] === y);
            return point ? point[zAxis] : 0;
          })
        );
        
        return [{
          x: uniqueX,
          y: uniqueY,
          z: zMatrix,
          type: "surface",
          colorscale: 'Viridis',
          opacity: 0.8,
          contours: {
            z: {
              show: true,
              usecolormap: true,
              highlightcolor: "#42f462",
              project: { z: true }
            }
          }
        }];

      case "mesh3d":
        return [{
          x: xValues,
          y: yValues,
          z: zValues,
          type: "mesh3d",
          color: colors[0],
          opacity: 0.8,
          delaunayaxis: 'x'
        }];

      case "volume3d":
        return [{
          x: xValues,
          y: yValues,
          z: zValues,
          type: "volume",
          colorscale: 'Viridis',
          opacityscale: 'max',
          surface_count: 17,
          value: data.map(row => parseFloat(row[zAxis]) || 0)
        }];

      case "cone3d":
        return [{
          x: xValues,
          y: yValues,
          z: zValues,
          u: data.map(row => parseFloat(row[xAxis]) * 0.1),
          v: data.map(row => parseFloat(row[yAxis]) * 0.1),
          w: data.map(row => parseFloat(row[zAxis]) * 0.1),
          type: "cone",
          colorscale: 'Viridis',
          sizeref: 0.5
        }];

      default:
        return [{
          x: xValues,
          y: yValues,
          z: zValues,
          type: "scatter3d",
          mode: "markers",
          marker: { 
            color: colors,
            size: sizes,
            opacity: 0.8,
          },
          text: textLabels,
          hovertemplate: '<b>%{text}</b><extra></extra>'
        }];
    }
  };

  // Enhanced 3D layout configuration
  const get3DLayout = () => {
    const baseLayout = {
      title: {
        text: `3D ${chartType.toUpperCase()} Visualization`,
        font: {
          family: 'Poppins, sans-serif',
          size: 20,
          color: '#374151'
        }
      },
      scene: {
        xaxis: { 
          title: xAxis,
          gridcolor: showGrid ? 'rgba(0,0,0,0.1)' : 'transparent',
          showgrid: showGrid,
          zeroline: true,
          zerolinecolor: '#6B7280'
        },
        yaxis: { 
          title: yAxis,
          gridcolor: showGrid ? 'rgba(0,0,0,0.1)' : 'transparent',
          showgrid: showGrid,
          zeroline: true,
          zerolinecolor: '#6B7280'
        },
        zaxis: { 
          title: zAxis,
          gridcolor: showGrid ? 'rgba(0,0,0,0.1)' : 'transparent',
          showgrid: showGrid,
          zeroline: true,
          zerolinecolor: '#6B7280'
        },
        camera: {
          eye: cameraPosition
        },
        aspectmode: 'cube'
      },
      margin: { l: 0, r: 0, b: 0, t: 60 },
      height: 600,
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        family: 'Inter, sans-serif',
        size: 12,
        color: '#374151'
      },
      showlegend: colorBy ? true : false,
      legend: colorBy ? {
        x: 1.05,
        y: 0.5,
        font: {
          family: 'Inter, sans-serif',
          size: 12,
          color: '#374151'
        }
      } : {}
    };

    return baseLayout;
  };

  // Convert data for SafePieChart
  const convertToPieChartData = () => {
    if (!xAxis || !yAxis) return null;
    
    const pieData = [
      ['Category', 'Value'],
      ...data.map(row => [row[xAxis], row[yAxis]])
    ];
    
    return pieData;
  };

  // Download as Image
  const handleDownloadImage = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement("a");
      link.download = "chart.png";
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  // Download as PDF
  const downloadChart = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('chart.pdf');
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  // Handle chart error recovery
  const handleChartError = () => {
    setChartError(false);
  };

  // Camera position controls
  const handleCameraReset = () => {
    setCameraPosition({ x: 1.5, y: 1.5, z: 1.5 });
  };

  const handleCameraTop = () => {
    setCameraPosition({ x: 0, y: 0, z: 2 });
  };

  const handleCameraSide = () => {
    setCameraPosition({ x: 2, y: 0, z: 0 });
  };

  // Data analysis functions
  const getDataStats = () => {
    if (!xAxis || !yAxis || !zAxis) return null;

    const xValues = data.map(row => parseFloat(row[xAxis]) || 0);
    const yValues = data.map(row => parseFloat(row[yAxis]) || 0);
    const zValues = data.map(row => parseFloat(row[zAxis]) || 0);

    return {
      x: {
        min: Math.min(...xValues),
        max: Math.max(...xValues),
        avg: xValues.reduce((a, b) => a + b, 0) / xValues.length,
        count: xValues.length
      },
      y: {
        min: Math.min(...yValues),
        max: Math.max(...yValues),
        avg: yValues.reduce((a, b) => a + b, 0) / yValues.length,
        count: yValues.length
      },
      z: {
        min: Math.min(...zValues),
        max: Math.max(...zValues),
        avg: zValues.reduce((a, b) => a + b, 0) / zValues.length,
        count: zValues.length
      }
    };
  };

  if (chartError) {
    return (
      <div className="space-y-6">
        <div className="card-premium p-6">
          <h3 className="text-xl font-display font-bold gradient-text mb-6">Chart Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                X Axis
              </label>
              <select 
                value={xAxis} 
                onChange={e => setXAxis(e.target.value)}
                className="input-premium"
              >
                <option value="">Select X Axis</option>
                {columns.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Y Axis
              </label>
              <select 
                value={yAxis} 
                onChange={e => setYAxis(e.target.value)}
                className="input-premium"
              >
                <option value="">Select Y Axis</option>
                {columns.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Chart Type
              </label>
              <select 
                value={chartType} 
                onChange={e => setChartType(e.target.value)}
                className="input-premium"
              >
                <option value="bar2d">Bar Chart (2D)</option>
                <option value="line2d">Line Chart (2D)</option>
                <option value="pie2d">Pie Chart (2D)</option>
                <option value="scatter3d">Scatter Plot (3D)</option>
                <option value="surface3d">Surface Plot (3D)</option>
                <option value="mesh3d">Mesh Plot (3D)</option>
                <option value="volume3d">Volume Plot (3D)</option>
                <option value="cone3d">Cone Plot (3D)</option>
              </select>
            </div>
            
            {chartType.includes("3d") && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Z Axis
                </label>
                <select 
                  value={zAxis} 
                  onChange={e => setZAxis(e.target.value)}
                  className="input-premium"
                >
                  <option value="">Select Z Axis</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
        
        <div className="card-premium p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-display font-bold text-secondary-900 mb-2">Chart Error Detected</h3>
            <p className="text-secondary-600 mb-4">There was an issue with the chart rendering. This has been automatically handled.</p>
            <button 
              onClick={handleChartError}
              className="btn-primary py-2 px-4 text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dataStats = getDataStats();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card-premium p-6">
        <h3 className="text-xl font-display font-bold gradient-text mb-6">Chart Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              X Axis
            </label>
            <select 
              value={xAxis} 
              onChange={e => setXAxis(e.target.value)}
              className="input-premium"
            >
              <option value="">Select X Axis</option>
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Y Axis
            </label>
            <select 
              value={yAxis} 
              onChange={e => setYAxis(e.target.value)}
              className="input-premium"
            >
              <option value="">Select Y Axis</option>
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Chart Type
            </label>
            <select 
              value={chartType} 
              onChange={e => setChartType(e.target.value)}
              className="input-premium"
            >
              <option value="bar2d">Bar Chart (2D)</option>
              <option value="line2d">Line Chart (2D)</option>
              <option value="pie2d">Pie Chart (2D)</option>
              <option value="scatter3d">Scatter Plot (3D)</option>
              <option value="surface3d">Surface Plot (3D)</option>
              <option value="mesh3d">Mesh Plot (3D)</option>
              <option value="volume3d">Volume Plot (3D)</option>
              <option value="cone3d">Cone Plot (3D)</option>
            </select>
          </div>
          
          {chartType.includes("3d") && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Z Axis
              </label>
              <select 
                value={zAxis} 
                onChange={e => setZAxis(e.target.value)}
                className="input-premium"
              >
                <option value="">Select Z Axis</option>
                {columns.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* 3D Advanced Controls */}
        {chartType.includes("3d") && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Color By
              </label>
              <select 
                value={colorBy} 
                onChange={e => setColorBy(e.target.value)}
                className="input-premium"
              >
                <option value="">None</option>
                {columns.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Size By
              </label>
              <select 
                value={sizeBy} 
                onChange={e => setSizeBy(e.target.value)}
                className="input-premium"
              >
                <option value="">None</option>
                {columns.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                View Mode
              </label>
              <select 
                value={viewMode} 
                onChange={e => setViewMode(e.target.value)}
                className="input-premium"
              >
                <option value="3d">3D View</option>
                <option value="2d">2D Projection</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowGrid(!showGrid)}
                  className={`px-3 py-2 text-sm rounded ${showGrid ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {showGrid ? 'Hide Grid' : 'Show Grid'}
                </button>
                <button 
                  onClick={() => setShowLabels(!showLabels)}
                  className={`px-3 py-2 text-sm rounded ${showLabels ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {showLabels ? 'Hide Labels' : 'Show Labels'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Download buttons */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleDownloadImage} 
            className="btn-primary py-2 px-4 text-sm"
          >
            📥 Download Image
          </button>
          <button 
            onClick={downloadChart} 
            className="btn-accent py-2 px-4 text-sm"
          >
            📄 Download PDF
          </button>
        </div>
      </div>

      {/* 3D Camera Controls */}
      {chartType.includes("3d") && (
        <div className="card-premium p-4">
          <h4 className="text-lg font-display font-bold text-secondary-900 mb-4">3D Camera Controls</h4>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleCameraReset}
              className="btn-secondary py-2 px-4 text-sm"
            >
              🎯 Reset View
            </button>
            <button 
              onClick={handleCameraTop}
              className="btn-secondary py-2 px-4 text-sm"
            >
              📐 Top View
            </button>
            <button 
              onClick={handleCameraSide}
              className="btn-secondary py-2 px-4 text-sm"
            >
              📐 Side View
            </button>
          </div>
        </div>
      )}
      
      {/* Chart Display */}
      {xAxis && yAxis && (
        <div className="card-premium p-6">
          <h3 className="text-xl font-display font-bold gradient-text mb-6">Chart Preview</h3>
          
          {/* Chart container for download */}
          <div ref={chartRef} className="min-h-96 bg-white rounded-xl border border-secondary-200 p-4">
            {/* Render Chart */}
            {chartType === "bar2d" && <Bar data={chartData} options={chartOptions} />}
            {chartType === "line2d" && <Line data={chartData} options={chartOptions} />}
            {chartType === "pie2d" && (
              <div style={{ height: '400px', width: '100%' }}>
                <SafePieChart 
                  data={convertToPieChartData()}
                  options={{
                    title: 'Pie Chart',
                    legend: { position: 'right' }
                  }}
                  width="100%"
                  height="400px"
                />
              </div>
            )}
            {chartType.includes("3d") && zAxis && (
              <Plot
                data={generate3DData()}
                layout={get3DLayout()}
                config={{
                  displayModeBar: true,
                  displaylogo: false,
                  modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
                  responsive: true
                }}
                style={{ width: '100%', height: '600px' }}
                useResizeHandler={true}
              />
            )}
          </div>
        </div>
      )}

      {/* Data Analysis Panel */}
      {chartType.includes("3d") && dataStats && (
        <div className="card-premium p-6">
          <h3 className="text-xl font-display font-bold gradient-text mb-6">3D Data Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* X Axis Stats */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">{xAxis} Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Min:</span>
                  <span className="font-medium">{dataStats.x.min.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Max:</span>
                  <span className="font-medium">{dataStats.x.max.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Average:</span>
                  <span className="font-medium">{dataStats.x.avg.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Count:</span>
                  <span className="font-medium">{dataStats.x.count}</span>
                </div>
              </div>
            </div>

            {/* Y Axis Stats */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-3">{yAxis} Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Min:</span>
                  <span className="font-medium">{dataStats.y.min.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Max:</span>
                  <span className="font-medium">{dataStats.y.max.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Average:</span>
                  <span className="font-medium">{dataStats.y.avg.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Count:</span>
                  <span className="font-medium">{dataStats.y.count}</span>
                </div>
              </div>
            </div>

            {/* Z Axis Stats */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-3">{zAxis} Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-700">Min:</span>
                  <span className="font-medium">{dataStats.z.min.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Max:</span>
                  <span className="font-medium">{dataStats.z.max.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Average:</span>
                  <span className="font-medium">{dataStats.z.avg.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Count:</span>
                  <span className="font-medium">{dataStats.z.count}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Insights */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Data Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-700">
                  <strong>Data Range:</strong> {dataStats.x.min.toFixed(2)} to {dataStats.x.max.toFixed(2)} ({xAxis}), 
                  {dataStats.y.min.toFixed(2)} to {dataStats.y.max.toFixed(2)} ({yAxis}), 
                  {dataStats.z.min.toFixed(2)} to {dataStats.z.max.toFixed(2)} ({zAxis})
                </p>
              </div>
              <div>
                <p className="text-gray-700">
                  <strong>Data Points:</strong> {dataStats.x.count} total observations
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartGenerator;