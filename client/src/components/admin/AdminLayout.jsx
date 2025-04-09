import '../../styles/admin/admin.css';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../context/AuthContext';
import Breadcrumbs from './shared/Breadcrumbs';

const AdminLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if sidebar was collapsed in previous session
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Handle page title
  const getPageTitle = () => {
    if (title) return title;

    const paths = location.pathname.split('/').filter(path => path);
    if (paths.length <= 1) return 'Dashboard';

    const lastPath = paths[paths.length - 1];
    return lastPath.charAt(0).toUpperCase() + lastPath.slice(1).replace(/-/g, ' ');
  };

  // Check if Font Awesome is loaded
  useEffect(() => {
    // Add a small script to check if Font Awesome is loaded
    const checkFontAwesome = () => {
      const span = document.createElement('span');
      span.className = 'fa';
      span.style.display = 'none';
      document.body.insertBefore(span, document.body.firstChild);

      const isFontAwesomeLoaded = window.getComputedStyle(span).fontFamily.includes('FontAwesome');

      if (!isFontAwesomeLoaded) {
        console.warn('Font Awesome is not loaded properly. Adding it dynamically.');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(link);
      }

      document.body.removeChild(span);
    };

    checkFontAwesome();
  }, []);

  return (
    <div className={`wrapper ${sidebarCollapsed ? 'sidebar-collapse' : ''}`}>
      {/* Navbar */}
      <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        <ul className="navbar-nav">
          <li className="nav-item">
            <button className="nav-link" onClick={toggleSidebar} role="button">
              <i className="fas fa-bars"></i>
            </button>
          </li>
        </ul>

        {/* Search Form */}
        <form className="form-inline ml-3">
          <div className="input-group input-group-sm">
            <input
              className="form-control form-control-navbar"
              type="search"
              placeholder="Search"
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="input-group-append">
              <button className="btn btn-navbar" type="submit">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
        </form>

        <ul className="navbar-nav ml-auto">
          {/* Notifications Dropdown */}
          <li className="nav-item dropdown">
            <a className="nav-link" data-toggle="dropdown" href="#">
              <i className="far fa-bell"></i>
              <span className="badge badge-warning navbar-badge">3</span>
            </a>
            <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
              <span className="dropdown-item dropdown-header">3 Notifications</span>
              <div className="dropdown-divider"></div>
              <a href="#" className="dropdown-item">
                <i className="fas fa-envelope mr-2"></i> 2 new bookings
                <span className="float-right text-muted text-sm">3 mins</span>
              </a>
              <div className="dropdown-divider"></div>
              <a href="#" className="dropdown-item">
                <i className="fas fa-users mr-2"></i> 1 new provider
                <span className="float-right text-muted text-sm">12 hours</span>
              </a>
              <div className="dropdown-divider"></div>
              <a href="#" className="dropdown-item dropdown-footer">See All Notifications</a>
            </div>
          </li>

          {/* User Dropdown */}
          <li className="nav-item dropdown">
            <a className="nav-link" href="#" onClick={toggleDropdown}>
              <i className="far fa-user"></i> {user?.firstName || 'Admin'}
            </a>
            <div className={`dropdown-menu dropdown-menu-right ${dropdownOpen ? 'show' : ''}`}>
              <Link to="/admin/profile" className="dropdown-item">
                <i className="fas fa-user-circle mr-2"></i> My Profile
              </Link>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item">
                <i className="fas fa-sign-out-alt mr-2"></i> Logout
              </button>
            </div>
          </li>
        </ul>
      </nav>

      {/* Main Sidebar */}
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <Link to="/admin" className="brand-link flex items-center justify-center py-4 border-b border-gray-700">
          <i className="fas fa-tools text-white mr-2"></i>
          <span className="text-white text-lg font-semibold">Fixly Admin</span>
        </Link>

        <div className="sidebar">
          <div className="flex items-center p-4 border-b border-gray-700">
            <div className="flex-shrink-0">
              <img
                src={user?.profileImage || "https://via.placeholder.com/160x160"}
                className="h-10 w-10 rounded-full"
                alt="User Image"
              />
            </div>
            <div className="ml-3">
              <p className="text-white text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-gray-300 text-xs">{user?.email}</p>
            </div>
          </div>

          <nav className="mt-6">
            <ul className="nav-sidebar">
              {[
                { path: '/admin', icon: 'tachometer-alt', label: 'Dashboard' },
                { path: '/admin/users', icon: 'users', label: 'Users' },
                { path: '/admin/providers', icon: 'user-tie', label: 'Service Providers' },
                { path: '/admin/listings', icon: 'list', label: 'Listings' },
                { path: '/admin/bookings', icon: 'calendar-check', label: 'Bookings' },
                { path: '/admin/categories', icon: 'tags', label: 'Categories' },
                { path: '/admin/commissions', icon: 'percentage', label: 'Commissions' },
                { path: '/admin/complaints', icon: 'exclamation-circle', label: 'Complaints' }
              ].map((item) => (
                <li className="mb-2" key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <i className={`fas fa-${item.icon}`}></i>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Content Wrapper */}
      <main className={`content-wrapper ${sidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-200`}>
        <div className="content-header">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2 md:mb-0">{getPageTitle()}</h1>
            <Breadcrumbs />
          </div>
        </div>

        <div className="content px-6 py-4">
          <ToastContainer position="top-right" autoClose={3000} />
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className={`main-footer ${sidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-200`}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <strong>Copyright © {new Date().getFullYear()} Fixly.</strong>
            <span className="ml-1">All rights reserved.</span>
          </div>
          <div className="mt-2 md:mt-0">
            <b>Version</b> <span className="ml-1">1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;