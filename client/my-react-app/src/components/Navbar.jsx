import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  
  return (
    <div className="navbar">
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <h1>Fixly</h1>
      </Link>
      <div className="nav-links">
        {location.pathname !== '/' && (
          <Link to="/" className="btn home">Home</Link>
        )}
        {!location.pathname.includes('/login') && (
          <Link to="/login" className="btn login">Login</Link>
        )}
        {!location.pathname.includes('/signup') && (
          <Link to="/signup" className="btn signup">Sign up</Link>
        )}
        {!location.pathname.includes('/tasker') && (
          <Link to="/tasker" className="btn tasker">Become a Tasker</Link>
        )}
      </div>
    </div>
  );
}

export default Navbar;