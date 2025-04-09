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

  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {title && <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>}

      <div style={{ height }} className="relative">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No data available</p>
          </div>
        ) : (
          <div className="flex items-end justify-between h-full">
            {data.map((item, index) => {
              const percentage = maxValue === 0 ? 0 : (item.value / maxValue) * 100;

              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  {type === 'bar' ? (
                    <div
                      className="w-full mx-1 rounded-t-sm bg-blue-500 hover:bg-blue-600 transition-all"
                      style={{ height: `${percentage}%`, minHeight: percentage > 0 ? '4px' : '0' }}
                    ></div>
                  ) : (
                    <div className="relative w-full">
                      {index > 0 && (
                        <div
                          className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"
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
                      <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto"></div>
                    </div>
                  )}
                  <span className="text-xs text-gray-500 mt-2">{item.label}</span>
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
