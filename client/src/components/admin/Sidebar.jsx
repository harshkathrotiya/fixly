import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: 'home' },
    { path: '/admin/users', label: 'Users', icon: 'users' },
    { path: '/admin/providers', label: 'Service Providers', icon: 'briefcase' },
    { path: '/admin/listings', label: 'Service Listings', icon: 'clipboard-list' },
    { path: '/admin/bookings', label: 'Bookings', icon: 'calendar' },
    { path: '/admin/categories', label: 'Categories', icon: 'tag' },
  ];

  return (
    <div className="bg-gray-900 text-white w-64 flex-shrink-0 hidden md:block">
      <div className="px-6 py-5 border-b border-gray-800">
        <h2 className="text-2xl font-bold">Fixly Admin</h2>
      </div>
      
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link 
                to={item.path} 
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-150 ${
                  isActive(item.path) 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <i className={`fas fa-${item.icon} w-5 h-5 mr-3`}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
