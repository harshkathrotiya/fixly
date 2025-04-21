import React from 'react';

/**
 * Simple Pie Chart Component for Admin Dashboard
 *
 * @param {Object} props
 * @param {Array} props.data - Chart data with label, value, and color
 * @param {String} props.title - Chart title
 * @param {String} props.height - Chart height
 */
function PieChart({ data = [], title, height = '300px' }) {
  // Calculate total value
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate percentages and angles
  let startAngle = 0;
  const segments = data.map(item => {
    const percentage = total === 0 ? 0 : (item.value / total) * 100;
    const angle = total === 0 ? 0 : (item.value / total) * 360;
    const segment = {
      ...item,
      percentage,
      startAngle,
      endAngle: startAngle + angle
    };
    startAngle += angle;
    return segment;
  });

  // Function to create SVG path for pie segment
  const createPieSegment = (segment, index) => {
    if (segment.value === 0) return null;

    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    // Convert angles to radians
    const startAngleRad = (segment.startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (segment.endAngle - 90) * (Math.PI / 180);

    // Calculate points
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    // Create path
    const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    return (
      <path
        key={index}
        d={pathData}
        fill={segment.color}
        stroke="#fff"
        strokeWidth="1"
      />
    );
  };

  return (
    <div className="pie-chart-section">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
      )}

      <div style={{ height }} className="relative">
        {data.length === 0 || total === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-chart-pie text-gray-300 text-4xl mb-3"></i>
              <p className="text-gray-500">No data available</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between h-full">
            <div className="relative" style={{ width: '200px', height: '200px' }}>
              {/* Add drop shadow filter */}
              <svg viewBox="0 0 200 200" width="100%" height="100%">
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
                  </filter>
                </defs>
                <g filter="url(#shadow)">
                  {segments.map((segment, index) => createPieSegment(segment, index))}
                </g>
                {/* Add center circle for donut effect */}
                <circle cx="100" cy="100" r="60" fill="white" />
                {/* Add total in center */}
                <text x="100" y="95" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1F2937">
                  {total}
                </text>
                <text x="100" y="115" textAnchor="middle" fontSize="12" fill="#6B7280">
                  Total
                </text>
              </svg>
            </div>

            <div className="mt-6 md:mt-0 w-full md:w-auto md:ml-8">
              <ul className="space-y-3">
                {segments.map((segment, index) => (
                  <li key={index} className="flex items-center justify-between group">
                    <div className="flex items-center">
                      <span
                        className="inline-block w-4 h-4 mr-3 rounded-sm shadow-sm"
                        style={{ backgroundColor: segment.color }}
                      ></span>
                      <span className="text-sm font-medium text-gray-700">
                        {segment.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {segment.value}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${segment.color}20`, color: segment.color }}>
                        {segment.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PieChart;
