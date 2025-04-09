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
    <div className="bg-white rounded-lg shadow-sm p-6">
      {title && <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>}
      
      <div style={{ height }} className="relative">
        {data.length === 0 || total === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No data available</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between h-full">
            <div className="relative" style={{ width: '200px', height: '200px' }}>
              <svg viewBox="0 0 200 200" width="100%" height="100%">
                {segments.map((segment, index) => createPieSegment(segment, index))}
              </svg>
            </div>
            
            <div className="mt-4 md:mt-0">
              <ul className="space-y-2">
                {segments.map((segment, index) => (
                  <li key={index} className="flex items-center">
                    <span 
                      className="inline-block w-4 h-4 mr-2 rounded-sm" 
                      style={{ backgroundColor: segment.color }}
                    ></span>
                    <span className="text-sm text-gray-700">
                      {segment.label}: {segment.value} ({segment.percentage.toFixed(1)}%)
                    </span>
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
