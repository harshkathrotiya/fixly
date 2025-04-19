import React from 'react';

/**
 * Simple Chart Component for Admin Dashboard
 *
 * @param {Object} props
 * @param {String} props.type - Chart type ('bar', 'line')
 * @param {Array} props.data - Chart data
 * @param {String} props.title - Chart title
 * @param {String} props.height - Chart height
 */
function Chart({ type = 'bar', data = [], title, height = '300px' }) {
  // This is a simple placeholder for a chart component
  // In a real application, you would use a library like Chart.js, Recharts, etc.

  const maxValue = Math.max(...data.map(item => item.value), 1); // Ensure minimum of 1 to avoid division by zero

  return (
    <div className="chart-section">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <span className="text-xs text-gray-500">Current Period</span>
          </div>
        </div>
      )}

      <div style={{ height }} className="relative">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-chart-bar text-gray-300 text-4xl mb-3"></i>
              <p className="text-gray-500">No data available</p>
            </div>
          </div>
        ) : (
          <div className="flex items-end justify-between h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 25, 50, 75, 100].map((tick) => (
                <div key={tick} className="w-full h-px bg-gray-100 relative">
                  {tick > 0 && <span className="absolute -left-6 -top-2 text-xs text-gray-400">{Math.round(maxValue * tick / 100)}</span>}
                </div>
              ))}
            </div>

            {data.map((item, index) => {
              const percentage = (item.value / maxValue) * 100;
              const tooltipId = `tooltip-${index}`;

              return (
                <div key={index} className="flex flex-col items-center flex-1 z-10 group relative">
                  {type === 'bar' ? (
                    <>
                      <div
                        className="w-full mx-1 rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-400 hover:from-indigo-700 hover:to-indigo-500 transition-all duration-300 relative group"
                        style={{ height: `${percentage}%`, minHeight: percentage > 0 ? '4px' : '0' }}
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20">
                          {item.value}
                        </div>
                      </div>
                      <div className="h-1 w-full bg-indigo-100 mt-1"></div>
                    </>
                  ) : (
                    <div className="relative w-full">
                      {index > 0 && (
                        <div
                          className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500"
                          style={{
                            transform: `rotate(${Math.atan2(
                              (data[index].value - data[index-1].value) / (maxValue || 1) * 100,
                              100 / data.length
                            )}deg)`,
                            transformOrigin: 'left bottom',
                            width: '100%'
                          }}
                        ></div>
                      )}
                      <div className="w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow-md mx-auto"></div>
                    </div>
                  )}
                  <span className="text-xs text-gray-700 mt-3 font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Chart;
