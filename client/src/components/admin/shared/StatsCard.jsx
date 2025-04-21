import React from 'react';
import { motion } from 'framer-motion';

/**
 * Stats Card Component for Admin Pages
 * 
 * @param {Object} props
 * @param {String} props.title - Card title
 * @param {String} props.value - Main value
 * @param {String} props.change - Change value (e.g., +15%)
 * @param {String} props.changeType - Change type (increase, decrease, neutral)
 * @param {String} props.icon - Icon name (FontAwesome)
 * @param {String} props.color - Card color (primary, success, warning, danger, info)
 * @param {Boolean} props.loading - Loading state
 * @param {Function} props.onClick - Click handler
 */
function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon,
  color = 'primary',
  loading = false,
  onClick
}) {
  // Get color classes
  const getColorClasses = () => {
    switch (color) {
      case 'primary': 
        return {
          bgGradient: 'from-indigo-500 to-indigo-600',
          lightBg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-100'
        };
      case 'success': 
        return {
          bgGradient: 'from-green-500 to-green-600',
          lightBg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-100'
        };
      case 'warning': 
        return {
          bgGradient: 'from-amber-500 to-amber-600',
          lightBg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-100'
        };
      case 'danger': 
        return {
          bgGradient: 'from-red-500 to-red-600',
          lightBg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-100'
        };
      case 'info': 
        return {
          bgGradient: 'from-blue-500 to-blue-600',
          lightBg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-100'
        };
      default: 
        return {
          bgGradient: 'from-indigo-500 to-indigo-600',
          lightBg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-100'
        };
    }
  };

  // Get change type classes
  const getChangeTypeClasses = () => {
    switch (changeType) {
      case 'increase': 
        return {
          icon: 'fa-arrow-up',
          text: 'text-green-600',
          bg: 'bg-green-50'
        };
      case 'decrease': 
        return {
          icon: 'fa-arrow-down',
          text: 'text-red-600',
          bg: 'bg-red-50'
        };
      default: 
        return {
          icon: 'fa-minus',
          text: 'text-gray-600',
          bg: 'bg-gray-50'
        };
    }
  };

  const colorClasses = getColorClasses();
  const changeClasses = getChangeTypeClasses();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`relative overflow-hidden rounded-xl border ${colorClasses.border} bg-white shadow-sm hover:shadow-md transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Colored top border */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses.bgGradient}`}></div>
      
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            
            {loading ? (
              <div className="mt-2 h-9 w-24 skeleton rounded"></div>
            ) : (
              <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            )}

            {change && !loading && (
              <div className="mt-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${changeClasses.bg} ${changeClasses.text}`}>
                  <i className={`fas ${changeClasses.icon} mr-1 text-xs`}></i>
                  {change}
                </span>
              </div>
            )}
          </div>

          {icon && (
            <div className={`rounded-full p-3 bg-gradient-to-br ${colorClasses.bgGradient} text-white shadow-sm flex items-center justify-center`} style={{ width: '52px', height: '52px' }}>
              <i className={`fas fa-${icon} text-lg`}></i>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default StatsCard;
