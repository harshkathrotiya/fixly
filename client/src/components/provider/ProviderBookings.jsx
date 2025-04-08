import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import './ProviderBookings.css';

function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const { token } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/bookings/provider', {
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

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, bookingStatus: newStatus } 
          : booking
      ));
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status. Please try again.');
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

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'pending') return booking.bookingStatus === 'Pending';
    if (activeTab === 'confirmed') return booking.bookingStatus === 'Confirmed';
    if (activeTab === 'completed') return booking.bookingStatus === 'Completed';
    if (activeTab === 'cancelled') return booking.bookingStatus === 'Cancelled';
    return true;
  });

  return (
    <div className="provider-bookings-container">
      <h2>Booking Requests</h2>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button 
          className={`tab ${activeTab === 'confirmed' ? 'active' : ''}`}
          onClick={() => setActiveTab('confirmed')}
        >
          Confirmed
        </button>
        <button 
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
        <button 
          className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled
        </button>
      </div>
      
      {isLoading ? (
        <div className="loading-spinner">Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <p>No {activeTab} bookings found.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <div className="service-info">
                  <h3>{booking.serviceListingId?.serviceTitle}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(booking.bookingStatus)}`}>
                    {booking.bookingStatus}
                  </span>
                </div>
                <div className="customer-info">
                  <div className="customer-avatar">
                    <img 
                      src={booking.customerId?.profilePicture || 'https://via.placeholder.com/40'} 
                      alt={`${booking.customerId?.firstName || 'Anonymous'}`} 
                      className="avatar-img"
                    />
                  </div>
                  <div className="customer-details">
                    <h4>{booking.customerId?.firstName} {booking.customerId?.lastName}</h4>
                    <p>{booking.customerId?.email}</p>
                  </div>
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
              
              {booking.specialInstructions && (
                <div className="special-instructions">
                  <h4>Special Instructions:</h4>
                  <p>{booking.specialInstructions}</p>
                </div>
              )}
              
              <div className="booking-actions">
                {booking.bookingStatus === 'Pending' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(booking._id, 'Confirmed')}
                      className="confirm-btn"
                    >
                      Confirm Booking
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(booking._id, 'Cancelled')}
                      className="reject-btn"
                    >
                      Reject Booking
                    </button>
                  </>
                )}
                
                {booking.bookingStatus === 'Confirmed' && (
                  <button 
                    onClick={() => handleUpdateStatus(booking._id, 'Completed')}
                    className="complete-btn"
                  >
                    Mark as Completed
                  </button>
                )}
                
                {booking.bookingStatus === 'Completed' && (
                  <div className="payment-info">
                    <span className="payment-label">Payment Status:</span>
                    <span className={`payment-status ${booking.isPaid ? 'paid' : 'unpaid'}`}>
                      {booking.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProviderBookings;