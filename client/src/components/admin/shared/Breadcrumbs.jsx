import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Breadcrumbs Component for Admin Pages
 * 
 * @param {Object} props
 * @param {Array} props.items - Custom breadcrumb items (optional)
 */
function Breadcrumbs({ items }) {
  const location = useLocation();
  
  // Generate breadcrumb items from current path if not provided
  const getBreadcrumbItems = () => {
    if (items) return items;
    
    const pathnames = location.pathname.split('/').filter(x => x);
    
    // Start with home
    const breadcrumbs = [{ label: 'Dashboard', path: '/admin' }];
    
    // Add path segments
    pathnames.forEach((value, index) => {
      if (index === 0 && value === 'admin') return; // Skip 'admin' in path
      
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
      
      breadcrumbs.push({ label, path });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbItems = getBreadcrumbItems();
  
  return (
    <nav className="flex mb-5" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={item.path} className="inline-flex items-center">
              {index > 0 && (
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
              )}
              
              {isLast ? (
                <span className="text-gray-500 ml-1 md:ml-2 text-sm font-medium">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-blue-600 hover:text-blue-700 ml-1 md:ml-2 text-sm font-medium"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
