import '../../styles/admin/admin.css';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'admin-lte/dist/css/adminlte.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuth } from '../../context/authcontext';

const AdminLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="wrapper">
      {/* Navbar */}
      <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        <ul className="navbar-nav">
          <li className="nav-item">
            <a className="nav-link" data-widget="pushmenu" href="#" role="button">
              <i className="fas fa-bars"></i>
            </a>
          </li>
        </ul>

        <ul className="navbar-nav ml-auto">
          <li className="nav-item dropdown">
            <a className="nav-link" data-toggle="dropdown" href="#">
              <i className="far fa-user"></i> {user?.firstName || 'Admin'}
            </a>
            <div className="dropdown-menu dropdown-menu-right">
              <button onClick={handleLogout} className="dropdown-item">
                <i className="fas fa-sign-out-alt mr-2"></i> Logout
              </button>
            </div>
          </li>
        </ul>
      </nav>

      {/* Main Sidebar */}
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <Link to="/admin" className="brand-link">
          <span className="brand-text font-weight-light">Fixly Admin</span>
        </Link>

        <div className="sidebar">
          <nav className="mt-2">
            <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
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
                <li className="nav-item" key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <i className={`nav-icon fas fa-${item.icon}`}></i>
                    <p>{item.label}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Content Wrapper */}
      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">{title}</h1>
              </div>
            </div>
          </div>
        </div>

        <section className="content">
          <div className="container-fluid">
            {children}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="main-footer">
        <strong>Copyright © {new Date().getFullYear()} Fixly.</strong>
        All rights reserved.
      </footer>
    </div>
  );
};

export default AdminLayout;