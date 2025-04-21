import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../context/AuthContext';
import Breadcrumbs from './shared/Breadcrumbs';

// Import CSS
import '../../styles/admin/admin.css';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Check if sidebar was collapsed in previous session
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  const isActive = (path) => {
    return (location.pathname === path || location.pathname.startsWith(path + '/')) ? 'active' : '';
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
      if (dropdownOpen && !event.target.closest('.user-menu')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);



  // Removed the useEffect hook that checked for Font Awesome loading

  return (
    <div className="admin-layout">
      <div className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <Link to="/admin" className="admin-logo">
            <h2>Fixly Admin</h2>
          </Link>
          <div className="admin-user-info">
            <div className="admin-avatar">
              <img
                src={user?.profilePicture || "/placeholder-user.jpg"}
                alt={user?.firstName ? `${user?.firstName} ${user?.lastName}` : 'Admin'}
                onError={(e) => { e.target.src = '/placeholder-user.jpg'; }}
              />
            </div>
            <div className="admin-user-details">
              <h3>{user?.firstName ? `${user?.firstName} ${user?.lastName || ''}` : 'Admin'}</h3>
              <p>Administrator</p>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          <ul>
            {[
              { path: '/admin', icon: 'tachometer-alt', label: 'Dashboard' },
              { path: '/admin/users', icon: 'users', label: 'Users' },
              { path: '/admin/providers', icon: 'user-tie', label: 'Service Providers' },
              { path: '/admin/listings', icon: 'list', label: 'Listings' },
              { path: '/admin/bookings', icon: 'calendar-check', label: 'Bookings' },
              { path: '/admin/categories', icon: 'tags', label: 'Categories' },
              { path: '/admin/commissions', icon: 'percentage', label: 'Commissions' },
              { path: '/admin/complaints', icon: 'exclamation-circle', label: 'Complaints' },
              { path: '/admin/reports', icon: 'chart-bar', label: 'Reports' },
              { path: '/admin/settings', icon: 'cog', label: 'Settings' }
            ].map((item) => (
              <li key={item.path}>
                <Link to={item.path} className={isActive(item.path)}>
                  <i className={`fas fa-${item.icon}`}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </button>
          <div className="header-actions">
            <div className="notification-bell">
              <i className="far fa-bell"></i>
            </div>
            <div className="user-menu">
              <div className="user-menu-trigger" onClick={toggleDropdown}>
                <img
                  src={user?.profilePicture || "/placeholder-user.jpg"}
                  alt={user?.firstName ? `${user?.firstName} ${user?.lastName}` : 'Admin'}
                  onError={(e) => { e.target.src = '/placeholder-user.jpg'; }}
                />
                <span>{user?.firstName ? `${user?.firstName} ${user?.lastName || ''}` : 'Admin'}</span>
                <i className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'} ml-1`}></i>
              </div>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <a href="/admin/profile" className="dropdown-item">
                    <i className="fas fa-user-circle"></i> My Profile
                  </a>
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }} className="dropdown-item">
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="admin-main-content">
          <div className="breadcrumbs-container">
            <Breadcrumbs />
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
