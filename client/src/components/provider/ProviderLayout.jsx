import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ProviderLayout.css';

function ProviderLayout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    // Call the logout function from AuthContext
    logout();
  };

  return (
    <div className="provider-layout">
      <div className={`provider-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="logo">
            <h2>Fixly</h2>
          </Link>
          <div className="provider-info">
            <div className="provider-avatar">
              <img
                src={user?.profilePicture || "/placeholder-user.jpg"}
                alt={user?.firstName ? `${user?.firstName} ${user?.lastName}` : 'Provider'}
                onError={(e) => { e.target.src = '/placeholder-user.jpg'; }}
              />
            </div>
            <div className="provider-details">
              <h3>{user?.firstName ? `${user?.firstName} ${user?.lastName || ''}` : 'Provider'}</h3>
              <p>Service Provider</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/provider/dashboard" className={isActive('/provider/dashboard')}>
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/provider/bookings" className={isActive('/provider/bookings')}>
                <i className="fas fa-calendar-check"></i>
                <span>Bookings</span>
              </Link>
            </li>
            <li>
              <Link to="/provider/services" className={isActive('/provider/services')}>
                <i className="fas fa-list-alt"></i>
                <span>My Services</span>
              </Link>
            </li>
            <li>
              <Link to="/provider/profile" className={isActive('/provider/profile')}>
                <i className="fas fa-user-circle"></i>
                <span>Profile</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} disabled={isLoggingOut}>
            <i className="fas fa-sign-out-alt"></i>
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </div>

      <div className="provider-content">
        <div className="provider-header">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </button>
          <div className="header-actions">
            <div className="notification-bell">
              <i className="far fa-bell"></i>
            </div>
            <div className="user-menu">
              <img
                src={user?.profilePicture || "/placeholder-user.jpg"}
                alt={user?.firstName ? `${user?.firstName} ${user?.lastName}` : 'Provider'}
                onError={(e) => { e.target.src = '/placeholder-user.jpg'; }}
              />
              <span>{user?.firstName ? `${user?.firstName} ${user?.lastName || ''}` : 'Provider'}</span>
            </div>
          </div>
        </div>
        <div className="provider-main-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default ProviderLayout;