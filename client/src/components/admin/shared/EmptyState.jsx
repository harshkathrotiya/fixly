import React from 'react';
import { motion } from 'framer-motion';

/**
 * Empty State Component for Admin Pages
 * 
 * @param {Object} props
 * @param {String} props.title - Main message
 * @param {String} props.description - Optional description
 * @param {ReactNode} props.action - Optional action button
 * @param {String} props.icon - Icon name (FontAwesome)
 * @param {String} props.iconColor - Icon color (primary, success, warning, danger, info)
 */
function EmptyState({ 
  title = 'No data found', 
  description, 
  action,
  icon = 'inbox',
  iconColor = 'primary'
}) {
  // Get icon color classes
  const getIconColorClasses = () => {
    switch (iconColor) {
      case 'primary': return 'bg-indigo-100 text-indigo-500';
      case 'success': return 'bg-green-100 text-green-500';
      case 'warning': return 'bg-amber-100 text-amber-500';
      case 'danger': return 'bg-red-100 text-red-500';
      case 'info': return 'bg-blue-100 text-blue-500';
      default: return 'bg-indigo-100 text-indigo-500';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-lg border border-gray-200 shadow-sm"
    >
      <div className={`rounded-full ${getIconColorClasses()} p-4 mb-4`}>
        <i className={`fas fa-${icon} text-2xl`}></i>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-md mb-6">{description}</p>
      )}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  );
}

export default EmptyState;
