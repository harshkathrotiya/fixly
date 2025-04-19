import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { breadcrumbStyles } from './adminStyles';

/**
 * Breadcrumbs Component for Admin Pages
 *
 * @param {Object} props
 * @param {Array} props.items - Custom breadcrumb items (optional)
 * @param {Boolean} props.showHome - Whether to show the home/dashboard link
 */
function Breadcrumbs({ items, showHome = true }) {
  const location = useLocation();

  // Generate breadcrumb items from current path if not provided
  const getBreadcrumbItems = () => {
    if (items) return items;

    const pathnames = location.pathname.split('/').filter(x => x);

    // Start with home/dashboard if showHome is true
    const breadcrumbs = showHome ? [{ label: 'Dashboard', path: '/admin', icon: 'home' }] : [];

    // Add path segments
    pathnames.forEach((value, index) => {
      if (index === 0 && value === 'admin') return; // Skip 'admin' in path

      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

      // Determine icon based on path segment
      let icon = '';
      switch (value) {
        case 'users': icon = 'users'; break;
        case 'providers': icon = 'user-tie'; break;
        case 'listings': icon = 'list'; break;
        case 'bookings': icon = 'calendar-check'; break;
        case 'categories': icon = 'tags'; break;
        case 'commissions': icon = 'percentage'; break;
        case 'complaints': icon = 'exclamation-circle'; break;
        case 'reports': icon = 'chart-bar'; break;
        case 'settings': icon = 'cog'; break;
        default: icon = 'circle'; break;
      }

      breadcrumbs.push({ label, path, icon });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav className={breadcrumbStyles.container} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <motion.li
              key={item.path}
              className="inline-flex items-center"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              {index > 0 && (
                <span className={breadcrumbStyles.separator}>
                  <i className="fas fa-chevron-right text-xs"></i>
                </span>
              )}

              {isLast ? (
                <span className={breadcrumbStyles.active}>
                  {item.icon && <i className={`fas fa-${item.icon} mr-1.5 text-gray-400`}></i>}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className={breadcrumbStyles.item}
                >
                  {item.icon && <i className={`fas fa-${item.icon} mr-1.5`}></i>}
                  {item.label}
                </Link>
              )}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
