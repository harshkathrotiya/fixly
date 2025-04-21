import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/authcontext';
import './Bookings.css';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/bookings/customer', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(response.data.data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchBookings();
    }
  }, [token]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, bookingStatus: 'Cancelled' } 
          : booking
      ));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Confirmed':
        return 'status-confirmed';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const isUpcoming = (booking) => {
    return ['Pending', 'Confirmed'].includes(booking.bookingStatus) && 
           new Date(booking.serviceDateTime) > new Date();
  };

  const isPast = (booking) => {
    return booking.bookingStatus === 'Completed' || 
           booking.bookingStatus === 'Cancelled' ||
           (booking.bookingStatus !== 'Cancelled' && new Date(booking.serviceDateTime) < new Date());
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'upcoming') return isUpcoming(booking);
    if (activeTab === 'past') return isPast(booking);
    return true;
  });

  return (
    <div className="bookings-container">
      <h2>My Bookings</h2>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past
        </button>
      </div>
      
      {isLoading ? (
        <div className="loading-spinner">Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <p>No {activeTab} bookings found.</p>
          {activeTab === 'upcoming' && (
            <Link to="/services" className="browse-services-btn">Browse Services</Link>
          )}
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <div className="service-info">
                  <h3>{booking.serviceListingId?.serviceTitle}</h3>
                  <p className="provider-name">
                    by {booking.serviceProviderId?.userId?.firstName} {booking.serviceProviderId?.userId?.lastName}
                  </p>
                </div>
                <div className="booking-status">
                  <span className={`status-badge ${getStatusBadgeClass(booking.bookingStatus)}`}>
                    {booking.bookingStatus}
                  </span>
                </div>
              </div>
              
              <div className="booking-details">
                <div className="detail-item">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDate(booking.serviceDateTime)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{formatTime(booking.serviceDateTime)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{booking.serviceLocation}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value price">₹{booking.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="booking-actions">
                {booking.bookingStatus === 'Pending' && (
                  <button 
                    onClick={() => handleCancelBooking(booking._id)}
                    className="cancel-btn"
                  >
                    Cancel Booking
                  </button>
                )}
                
                {booking.bookingStatus === 'Confirmed' && (
                  <>
                    <button 
                      onClick={() => handleCancelBooking(booking._id)}
                      className="cancel-btn"
                    >
                      Cancel Booking
                    </button>
                    <Link 
                      to={`/payment/${booking._id}`}
                      className="pay-btn"
                    >
                      Make Payment
                    </Link>
                  </>
                )}
                
                {booking.bookingStatus === 'Completed' && !booking.isReviewed && (
                  <Link 
                    to={`/review/${booking._id}`}
                    className="review-btn"
                  >
                    Write Review
                  </Link>
                )}
                
                {booking.bookingStatus !== 'Cancelled' && (
                  <Link 
                    to={`/complaint/${booking._id}`}
                    className="complaint-btn"
                  >
                    Submit Complaint
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookings;