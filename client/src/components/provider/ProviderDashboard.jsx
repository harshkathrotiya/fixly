import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ProviderLayout from './ProviderLayout';
import './ProviderDashboard.css';

function ProviderDashboard() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalEarnings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }

    // Fetch provider's listings
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/providers/me/listings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setListings(response.data.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('Failed to load your listings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch dashboard stats
    const fetchDashboardStats = async () => {
      setIsStatsLoading(true);
      try {
        // Get booking stats
        const bookingsResponse = await axios.get('http://localhost:5000/api/bookings/provider', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const bookings = bookingsResponse.data.data || [];

        // Calculate stats from bookings
        const stats = {
          totalBookings: bookings.length,
          pendingBookings: bookings.filter(b => b.bookingStatus === 'Pending').length,
          confirmedBookings: bookings.filter(b => b.bookingStatus === 'Confirmed').length,
          completedBookings: bookings.filter(b => b.bookingStatus === 'Completed').length,
          totalEarnings: bookings
            .filter(b => b.bookingStatus === 'Completed' && b.isPaid)
            .reduce((sum, booking) => sum + (booking.providerEarning || booking.price || 0), 0)
        };

        setDashboardStats(stats);

        // Get recent bookings (last 5)
        const recentBookings = bookings
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setRecentBookings(recentBookings);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchListings();
    fetchDashboardStats();
  }, [token, user, navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <ProviderLayout>
      <div className="provider-dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="header-actions">
            <Link to="/provider/services/new" className="add-service-btn">
              <i className="fas fa-plus"></i> Add New Service
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon bookings-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="stat-details">
              <h3>Total Bookings</h3>
              <p className="stat-value">{isStatsLoading ? '...' : dashboardStats.totalBookings}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-details">
              <h3>Pending</h3>
              <p className="stat-value">{isStatsLoading ? '...' : dashboardStats.pendingBookings}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon confirmed-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-details">
              <h3>Confirmed</h3>
              <p className="stat-value">{isStatsLoading ? '...' : dashboardStats.confirmedBookings}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed-icon">
              <i className="fas fa-tasks"></i>
            </div>
            <div className="stat-details">
              <h3>Completed</h3>
              <p className="stat-value">{isStatsLoading ? '...' : dashboardStats.completedBookings}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon earnings-icon">
              <i className="fas fa-rupee-sign"></i>
            </div>
            <div className="stat-details">
              <h3>Total Earnings</h3>
              <p className="stat-value">{isStatsLoading ? '...' : formatCurrency(dashboardStats.totalEarnings)}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Recent Bookings */}
          <div className="recent-bookings-section">
            <div className="section-header">
              <h2>Recent Bookings</h2>
              <Link to="/provider/bookings" className="view-all-link">View All</Link>
            </div>

            {isStatsLoading ? (
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading bookings...</p>
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="no-data-message">
                <i className="fas fa-calendar-times"></i>
                <p>No bookings found. Your recent bookings will appear here.</p>
              </div>
            ) : (
              <div className="recent-bookings-list">
                {recentBookings.map(booking => (
                  <div key={booking._id} className="booking-item">
                    <div className="booking-item-header">
                      <div className="service-title">
                        <h3>{booking.serviceTitle}</h3>
                        <span className={`status-badge ${booking.bookingStatus.toLowerCase()}`}>
                          {booking.bookingStatus}
                        </span>
                      </div>
                      <div className="booking-date">
                        <i className="far fa-calendar-alt"></i> {formatDate(booking.serviceDateTime)}
                        <span className="booking-time">
                          <i className="far fa-clock"></i> {formatTime(booking.serviceDateTime)}
                        </span>
                      </div>
                    </div>

                    <div className="booking-item-details">
                      <div className="customer-info">
                        <img
                          src={booking.customerAvatar || "/placeholder-user.jpg"}
                          alt={booking.customerName}
                          className="customer-avatar"
                          onError={(e) => { e.target.src = '/placeholder-user.jpg'; }}
                        />
                        <div className="customer-details">
                          <p className="customer-name">{booking.customerName}</p>
                          <p className="booking-id">ID: {booking._id.substring(0, 8)}...</p>
                        </div>
                      </div>

                      <div className="booking-price">
                        <p className="price-amount">₹{booking.price?.toFixed(2)}</p>
                        <span className={`payment-status ${booking.isPaid ? 'paid' : 'unpaid'}`}>
                          {booking.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </div>

                    <div className="booking-item-actions">
                      <Link to={`/provider/bookings?id=${booking._id}`} className="view-details-btn">
                        <i className="fas fa-eye"></i> View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Services */}
          <div className="my-services-section">
            <div className="section-header">
              <h2>My Services</h2>
              <Link to="/provider/services" className="view-all-link">Manage Services</Link>
            </div>

            {isLoading ? (
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading services...</p>
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : listings.length === 0 ? (
              <div className="no-data-message">
                <i className="fas fa-list-alt"></i>
                <p>You haven't added any services yet. Add your first service to start receiving bookings.</p>
                <Link to="/provider/services/new" className="add-service-btn">
                  <i className="fas fa-plus"></i> Add New Service
                </Link>
              </div>
            ) : (
              <div className="services-grid">
                {listings.slice(0, 3).map(listing => (
                  <div key={listing._id} className="service-card">
                    <div className="service-image">
                      <img
                        src={listing.serviceImage || "/placeholder-service.jpg"}
                        onError={(e) => { e.target.src = '/placeholder-service.jpg'; }}
                        alt={listing.serviceTitle}
                      />
                      <span className={`status-indicator ${listing.isActive ? 'active' : 'inactive'}`}>
                        {listing.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="service-details">
                      <h3>{listing.serviceTitle}</h3>
                      <p className="service-price">₹{listing.servicePrice?.toFixed(2)}</p>
                      <div className="service-actions">
                        <Link to={`/provider/services/edit/${listing._id}`} className="edit-btn">
                          <i className="fas fa-edit"></i> Edit
                        </Link>
                        <Link to={`/listing/${listing._id}`} className="view-btn">
                          <i className="fas fa-external-link-alt"></i> View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {listings.length > 3 && (
                  <div className="more-services-card">
                    <div className="more-services-content">
                      <i className="fas fa-ellipsis-h"></i>
                      <p>{listings.length - 3} more services</p>
                      <Link to="/provider/services" className="view-all-btn">View All</Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}

export default ProviderDashboard;