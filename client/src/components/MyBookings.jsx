import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyBookings.css';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import PlaceholderImg from './images/plumbing.png';

function MyBookings({ hideNavbar = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/bookings' } });
      return;
    }

    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Determine which endpoint to use based on user role
      const endpoint = user.role === 'service_provider'
        ? 'http://localhost:5000/api/bookings/provider'
        : 'http://localhost:5000/api/bookings/customer';

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookings(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load your bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh bookings after status update
      fetchBookings();
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    const now = new Date();
    const serviceDate = new Date(booking.serviceDateTime);

    if (activeTab === 'upcoming') {
      return serviceDate >= now && ['Pending', 'Confirmed'].includes(booking.bookingStatus);
    } else if (activeTab === 'completed') {
      return booking.bookingStatus === 'Completed';
    } else if (activeTab === 'cancelled') {
      return ['Cancelled', 'Rejected'].includes(booking.bookingStatus);
    }
    return true; // Show all if tab is not recognized
  });

  if (loading) {
    return (
      <div className="my-bookings-page">
        {!hideNavbar && <Navbar />}
        <div className="my-bookings-container">
          <div className="loading-container">
            <div className="loading-spinner-container">
              <i className="fas fa-spinner fa-spin loading-spinner"></i>
            </div>
            <p>Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      {!hideNavbar && <Navbar />}
      <div className="my-bookings-container">
        <div className="my-bookings-header">
          <h1>{user?.role === 'service_provider' ? 'Service Requests' : 'My Bookings'}</h1>
          <p>Manage your {user?.role === 'service_provider' ? 'service requests' : 'service bookings'}</p>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
          </div>
        )}

        <div className="bookings-tabs">
          <button
            className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
          <button
            className={`tab-button ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="no-bookings-message">
            <i className="fas fa-calendar-times"></i>
            <p>No {activeTab} bookings found.</p>
            {activeTab === 'upcoming' && user?.role !== 'service_provider' && (
              <button
                className="browse-services-button"
                onClick={() => navigate('/services')}
              >
                Browse Services
              </button>
            )}
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-id">
                    <span>Booking ID: {booking._id.substring(booking._id.length - 8)}</span>
                  </div>
                  <div className={`booking-status ${booking.bookingStatus.toLowerCase()}`}>
                    {booking.bookingStatus}
                  </div>
                </div>

                <div className="booking-details">
                  <div className="service-info">
                    <img
                      src={booking.serviceListingId?.serviceImage || PlaceholderImg}
                      alt={booking.serviceListingId?.serviceTitle}
                      className="service-image"
                      onError={(e) => {
                        e.target.src = PlaceholderImg;
                      }}
                    />
                    <div className="service-details">
                      <h3>{booking.serviceListingId?.serviceTitle || 'Service Unavailable'}</h3>
                      <p className="service-category">
                        {booking.serviceListingId?.categoryId?.categoryName || 'General Service'}
                      </p>
                      <div className="booking-date">
                        <i className="fas fa-calendar-alt"></i>
                        <span>{formatDate(booking.serviceDateTime)}</span>
                      </div>
                      <div className="booking-price">
                        <i className="fas fa-tag"></i>
                        <span>₹{booking.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="provider-info">
                    <h4>{user?.role === 'service_provider' ? 'Customer' : 'Provider'}</h4>
                    <div className="provider-details">
                      {user?.role === 'service_provider' ? (
                        <p>{booking.customerId?.firstName} {booking.customerId?.lastName}</p>
                      ) : (
                        <p>
                          {booking.serviceProviderId?.userId?.firstName} {booking.serviceProviderId?.userId?.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {booking.specialInstructions && (
                  <div className="booking-instructions">
                    <h4>Special Instructions:</h4>
                    <p>{booking.specialInstructions}</p>
                  </div>
                )}

                <div className="booking-actions">
                  {user?.role === 'service_provider' && booking.bookingStatus === 'Pending' && (
                    <>
                      <button
                        className="accept-button"
                        onClick={() => handleUpdateStatus(booking._id, 'Confirmed')}
                      >
                        <i className="fas fa-check"></i> Accept
                      </button>
                      <button
                        className="reject-button"
                        onClick={() => handleUpdateStatus(booking._id, 'Rejected')}
                      >
                        <i className="fas fa-times"></i> Reject
                      </button>
                    </>
                  )}

                  {user?.role === 'service_provider' && booking.bookingStatus === 'Confirmed' && (
                    <button
                      className="complete-button"
                      onClick={() => handleUpdateStatus(booking._id, 'Completed')}
                    >
                      <i className="fas fa-check-circle"></i> Mark as Completed
                    </button>
                  )}

                  {user?.role === 'user' && booking.bookingStatus === 'Pending' && (
                    <button
                      className="cancel-button"
                      onClick={() => handleUpdateStatus(booking._id, 'Cancelled')}
                    >
                      <i className="fas fa-ban"></i> Cancel Booking
                    </button>
                  )}

                  {booking.bookingStatus === 'Completed' && user?.role === 'user' && !booking.isReviewed && (
                    <button
                      className="review-button"
                      onClick={() => navigate(`/review/${booking._id}`)}
                    >
                      <i className="fas fa-star"></i> Leave Review
                    </button>
                  )}

                  <button
                    className="details-button"
                    onClick={() => navigate(`/booking/${booking._id}`)}
                  >
                    <i className="fas fa-info-circle"></i> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;