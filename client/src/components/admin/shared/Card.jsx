import React from 'react';

/**
 * Reusable Card Component for Admin Pages
 *
 * @param {Object} props
 * @param {String} props.title - Card title
 * @param {ReactNode} props.icon - Card icon
 * @param {String} props.value - Card main value
 * @param {String} props.subtitle - Card subtitle
 * @param {String} props.trend - Trend direction ('up', 'down', 'neutral')
 * @param {String} props.trendValue - Trend value (e.g., '+15%')
 * @param {String} props.color - Card accent color
 * @param {Function} props.onClick - Click handler
 */
function Card({
  title,
  icon,
  value,
  subtitle,
  trend,
  trendValue,
  color = 'blue',
  onClick
}) {
  // Define color classes based on color prop
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          iconBg: 'bg-blue-500',
          iconText: 'text-white'
        };
      case 'green':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          iconBg: 'bg-green-500',
          iconText: 'text-white'
        };
      case 'purple':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          iconBg: 'bg-purple-500',
          iconText: 'text-white'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          iconBg: 'bg-yellow-500',
          iconText: 'text-white'
        };
      case 'red':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          iconBg: 'bg-red-500',
          iconText: 'text-white'
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-100',
          text: 'text-indigo-800',
          iconBg: 'bg-indigo-500',
          iconText: 'text-white'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          iconBg: 'bg-gray-500',
          iconText: 'text-white'
        };
    }
  };

  // Get trend icon and color
  const getTrendClasses = () => {
    if (!trend) return {};

    switch (trend) {
      case 'up':
        return {
          icon: 'fas fa-arrow-up',
          color: 'text-green-600'
        };
      case 'down':
        return {
          icon: 'fas fa-arrow-down',
          color: 'text-red-600'
        };
      default:
        return {
          icon: 'fas fa-minus',
          color: 'text-gray-600'
        };
    }
  };

  const colorClasses = getColorClasses();
  const trendClasses = getTrendClasses();

  return (
    <div
      className={`p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>

          {(subtitle || trend) && (
            <div className="mt-2 flex items-center text-sm">
              {trend && (
                <span className={`mr-1 ${trendClasses.color}`}>
                  <i className={`${trendClasses.icon} mr-1`} style={{ fontFamily: '"Font Awesome 6 Free"', fontWeight: 900 }}></i>
                  {trendValue}
                </span>
              )}
              {subtitle && <span className="text-gray-500">{subtitle}</span>}
            </div>
          )}
        </div>

        <div className={`${colorClasses.iconBg} rounded-full p-3 ${colorClasses.iconText} flex items-center justify-center`} style={{ width: '48px', height: '48px' }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Card;
