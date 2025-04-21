import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h3>Fixly</h3>
          <p>Your trusted platform for home services</p>
        </div>
        <div className="footer-links">
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>For Providers</h4>
            <ul>
              <li><Link to="/tasker">Become a Provider</Link></li>
              <li><Link to="/provider/dashboard">Provider Dashboard</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Fixly. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
