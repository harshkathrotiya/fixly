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
 * @param {Boolean} props.loading - Loading state
 */
function Card({
  title,
  icon,
  value,
  subtitle,
  trend,
  trendValue,
  color = 'indigo',
  onClick,
  loading = false
}) {
  // Define color classes based on color prop
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          iconBg: 'bg-blue-500',
          iconText: 'text-white',
          border: 'border-blue-100',
          gradient: 'from-blue-500 to-blue-600'
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          iconBg: 'bg-green-500',
          iconText: 'text-white',
          border: 'border-green-100',
          gradient: 'from-green-500 to-green-600'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          iconBg: 'bg-purple-500',
          iconText: 'text-white',
          border: 'border-purple-100',
          gradient: 'from-purple-500 to-purple-600'
        };
      case 'yellow':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          iconBg: 'bg-amber-500',
          iconText: 'text-white',
          border: 'border-amber-100',
          gradient: 'from-amber-500 to-amber-600'
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          iconBg: 'bg-red-500',
          iconText: 'text-white',
          border: 'border-red-100',
          gradient: 'from-red-500 to-red-600'
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          iconBg: 'bg-indigo-500',
          iconText: 'text-white',
          border: 'border-indigo-100',
          gradient: 'from-indigo-500 to-indigo-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          iconBg: 'bg-gray-500',
          iconText: 'text-white',
          border: 'border-gray-100',
          gradient: 'from-gray-500 to-gray-600'
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
          color: 'text-green-600',
          bg: 'bg-green-50'
        };
      case 'down':
        return {
          icon: 'fas fa-arrow-down',
          color: 'text-red-600',
          bg: 'bg-red-50'
        };
      default:
        return {
          icon: 'fas fa-minus',
          color: 'text-gray-600',
          bg: 'bg-gray-50'
        };
    }
  };

  const colorClasses = getColorClasses();
  const trendClasses = getTrendClasses();

  return (
    <div
      className={`stat-card ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`stat-icon ${color}-icon`}>
        {icon}
      </div>
      <div className="stat-details">
        <h3>{title}</h3>
        {loading ? (
          <div className="admin-spinner admin-spinner-sm"></div>
        ) : (
          <p className="stat-value">{value}</p>
        )}
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        {trend && (
          <div className={`trend ${trend}`}>
            <i className={`${trendClasses.icon}`}></i>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;
