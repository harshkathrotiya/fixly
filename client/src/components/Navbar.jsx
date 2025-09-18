import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";


function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userType, setUserType] = useState(null);

  // Get auth context directly
  const { user, logout } = useAuth();
  // Check authentication on mount and when auth changes
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);

      if (token) {
        try {
          // Get user type if authenticated
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          setUserType(data.userType || (data.data && data.data.userType));
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    // Check immediately
    checkAuth();
    // Set up event listeners
    const handleAuthChange = () => {
      checkAuth();
    };
    window.addEventListener('auth-change', handleAuthChange);
    // Clean up
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');

    if (logout) {
      logout();
    }

    // Dispatch event to notify other components
    window.dispatchEvent(new Event('auth-change'));
    setIsAuthenticated(false);
    setUserType(null);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Fixly
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </div>

        <ul className={isMenuOpen ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'} onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/services" className={location.pathname === '/services' ? 'nav-link active' : 'nav-link'} onClick={() => setIsMenuOpen(false)}>
              Services
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className={location.pathname === '/about' ? 'nav-link active' : 'nav-link'} onClick={() => setIsMenuOpen(false)}>
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className={location.pathname === '/contact' ? 'nav-link active' : 'nav-link'} onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>
          </li>
          {isAuthenticated && (
            <li className="nav-item">
              <Link to="/bookings" className={location.pathname === '/bookings' ? 'nav-link active' : 'nav-link'} onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-calendar-alt"></i> My Bookings
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-auth">
          {isAuthenticated ? (
            <>
              {userType === 'service_provider' ? (
                <Link to="/provider/dashboard" className="auth-button dashboard-button">
                  Dashboard
                </Link>
              ) : userType === 'admin' ? (
                <Link to="/admin" className="auth-button dashboard-button">
                  Admin Dashboard
                </Link>
              ) : null}
              <button onClick={handleLogout} className="auth-button logout-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-button login-button">
                Login
              </Link>
              <Link to="/signup" className="auth-button signup-button">
                Sign Up
              </Link>
              <Link to="/tasker" className="auth-button tasker-button">
                Become a Professional
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;