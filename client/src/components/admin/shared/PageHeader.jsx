import React from 'react';
import { motion } from 'framer-motion';
import Breadcrumbs from './Breadcrumbs';

/**
 * Page Header Component for Admin Pages
 * 
 * @param {Object} props
 * @param {String} props.title - Page title
 * @param {String} props.subtitle - Optional subtitle
 * @param {ReactNode} props.actions - Optional action buttons
 * @param {String} props.icon - Optional icon
 * @param {Boolean} props.showBreadcrumbs - Whether to show breadcrumbs
 */
function PageHeader({ 
  title, 
  subtitle, 
  actions, 
  icon,
  showBreadcrumbs = true
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center"
        >
          {icon && (
            <div className="mr-3 bg-indigo-100 text-indigo-700 p-2.5 rounded-lg">
              <i className={`fas fa-${icon} text-lg`}></i>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
        </motion.div>

        {actions && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-wrap items-center gap-3"
          >
            {actions}
          </motion.div>
        )}
      </div>

      {showBreadcrumbs && (
        <div className="mt-4">
          <Breadcrumbs />
        </div>
      )}
    </div>
  );
}

export default PageHeader;
