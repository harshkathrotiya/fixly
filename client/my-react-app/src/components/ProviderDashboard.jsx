import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './ProviderDashboard.css';
import { useAuth } from "../context/authcontext"; // Ensure correct case

function ProviderDashboard() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  useEffect(() => {
    // Fetch provider's listings
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/providers/me/listings', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        });
        setListings(response.data.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('Failed to load your listings. Please try again later.');
        if (error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="main-header">
        <div className="header-content">
          <div className="logo">
            <Link to="/">Fixly</Link>
          </div>
          <nav className="main-nav">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>
          <div className="auth-buttons">
            <Link to="/provider/profile" className="nav-button profile">My Profile</Link>
            <button onClick={handleLogout} className="nav-button logout">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="provider-dashboard">
        <nav className="dashboard-nav">
          <h1>Service Provider Dashboard</h1>
          <div className="nav-links">
            <Link to="/provider/create-listing" className="nav-button create">
              Create New Listing
            </Link>
          </div>
        </nav>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Active Listings</h3>
            <p>{listings.filter(listing => listing.isActive).length}</p>
          </div>
        </div>

        <div className="dashboard-content">
          <section className="listings-section">
            <h2>My Service Listings</h2>
            
            {isLoading && <p>Loading your listings...</p>}
            
            {error && <p className="error-message">{error}</p>}
            
            {!isLoading && !error && listings.length === 0 && (
              <p>You don't have any listings yet. Create your first listing to get started!</p>
            )}
            
            {!isLoading && !error && listings.length > 0 && (
              <div className="listings-grid">
                {listings.map(listing => (
                  <div key={listing._id} className="listing-card">
                    <div className="listing-image-container">
                      <img 
                        src={listing.serviceImage || '/default-service.jpg'} 
                        alt={listing.serviceTitle}
                        onError={(e) => {
                          e.target.src = '/default-service.jpg';
                          e.target.onerror = null;
                        }}
                      />
                      {!listing.isActive && <div className="inactive-overlay">Inactive</div>}
                    </div>
                    <h3>{listing.serviceTitle}</h3>
                    <p className="listing-details">{listing.serviceDetails}</p>
                    <p className="listing-price">Price: ₹{listing.servicePrice}</p>
                    <div className="card-actions">
                      <button onClick={() => navigate(`/provider/edit-listing/${listing._id}`)}>
                        Edit
                      </button>
                      <button onClick={() => navigate(`/provider/listing/${listing._id}`)}>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Footer */}
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
                <li><Link to="/provider/dashboard">Dashboard</Link></li>
                <li><Link to="/provider/profile">My Profile</Link></li>
                <li><Link to="/provider/create-listing">Create Listing</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Fixly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default ProviderDashboard;
