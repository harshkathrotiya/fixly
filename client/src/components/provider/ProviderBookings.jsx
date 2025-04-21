import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ProviderLayout from './ProviderLayout';
import './ProviderBookings.css';

function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
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

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setStatusUpdateLoading(true);
    setStatusMessage({ type: '', message: '' });

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

      setStatusMessage({
        type: 'success',
        message: `Booking status updated to ${newStatus} successfully!`
      });

      // Close modal if open
      if (isModalOpen && selectedBooking?._id === bookingId) {
        setTimeout(() => {
          closeModal();
        }, 2000);
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      setStatusMessage({
        type: 'error',
        message: 'Failed to update booking status. Please try again.'
      });
    } finally {
      setStatusUpdateLoading(false);
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
    <ProviderLayout>
      <div className="provider-bookings-container">
        <div className="provider-bookings-header">
          <h2>Booking Requests</h2>
          <div className="booking-stats">
            <div className="stat-item">
              <span className="stat-count">{bookings.filter(b => b.bookingStatus === 'Pending').length}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item">
              <span className="stat-count">{bookings.filter(b => b.bookingStatus === 'Confirmed').length}</span>
              <span className="stat-label">Confirmed</span>
            </div>
            <div className="stat-item">
              <span className="stat-count">{bookings.filter(b => b.bookingStatus === 'Completed').length}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>

        {statusMessage.type && (
          <div className={`status-message ${statusMessage.type}`}>
            {statusMessage.type === 'success' ? (
              <i className="fas fa-check-circle"></i>
            ) : (
              <i className="fas fa-exclamation-circle"></i>
            )}
            <p>{statusMessage.message}</p>
          </div>
        )}

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
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading your bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <i className="fas fa-calendar-times"></i>
            <p>No {activeTab} bookings found.</p>
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div className="service-info">
                    <h3>{booking.serviceListingId?.serviceTitle || 'Service Unavailable'}</h3>
                    <span className={`status-badge ${getStatusBadgeClass(booking.bookingStatus)}`}>
                      {booking.bookingStatus}
                    </span>
                  </div>
                  <div className="booking-date">
                    <i className="far fa-calendar-alt"></i>
                    <span>{formatDate(booking.serviceDateTime)}</span>
                    <span className="booking-time">
                      <i className="far fa-clock"></i> {formatTime(booking.serviceDateTime)}
                    </span>
                  </div>
                </div>

                <div className="booking-details">
                  <div className="customer-info">
                    <div className="customer-avatar">
                      <img
                        src={booking.customerId?.profilePicture || "/placeholder-user.jpg"}
                        alt={booking.customerId ? `${booking.customerId.firstName} ${booking.customerId.lastName}` : 'Customer'}
                        className="avatar-img"
                        onError={(e) => { e.target.src = '/placeholder-user.jpg'; }}
                      />
                    </div>
                    <div className="customer-details">
                      <h4>{booking.customerId ? `${booking.customerId.firstName} ${booking.customerId.lastName}` : 'Customer'}</h4>
                      <p>Customer ID: {booking.customerId?._id.substring(0, 8) || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="booking-summary">
                    <div className="detail-item">
                      <span className="detail-label">Booking ID</span>
                      <span className="detail-value">{booking._id.substring(0, 8)}...</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Service</span>
                      <span className="detail-value">{booking.serviceListingId?.serviceTitle || 'Service Unavailable'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Price</span>
                      <span className="detail-value price">₹{booking.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Booking Status</span>
                      <span className={`payment-status ${booking.bookingStatus.toLowerCase()}`}>
                        {booking.bookingStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {booking.specialInstructions && (
                  <div className="special-instructions">
                    <h4>Special Instructions</h4>
                    <p>{booking.specialInstructions}</p>
                  </div>
                )}

                <div className="booking-actions">
                  <button
                    className="view-details-btn"
                    onClick={() => handleViewDetails(booking)}
                  >
                    <i className="fas fa-eye"></i> View Details
                  </button>

                  {booking.bookingStatus === 'Pending' && (
                    <>
                      <button
                        className="confirm-btn"
                        onClick={() => handleUpdateStatus(booking._id, 'Confirmed')}
                        disabled={statusUpdateLoading}
                      >
                        <i className="fas fa-check"></i> Confirm
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleUpdateStatus(booking._id, 'Cancelled')}
                        disabled={statusUpdateLoading}
                      >
                        <i className="fas fa-times"></i> Reject
                      </button>
                    </>
                  )}

                  {booking.bookingStatus === 'Confirmed' && (
                    <button
                      className="complete-btn"
                      onClick={() => handleUpdateStatus(booking._id, 'Completed')}
                      disabled={statusUpdateLoading}
                    >
                      <i className="fas fa-check-circle"></i> Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Details Modal */}
        {isModalOpen && selectedBooking && (
          <div className="booking-modal-overlay" onClick={closeModal}>
            <div className="booking-modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Booking Details</h2>
                <button className="close-modal" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-body">
                <div className="booking-status-section">
                  <h3>Status</h3>
                  <div className={`status-badge large ${getStatusBadgeClass(selectedBooking.bookingStatus)}`}>
                    {selectedBooking.bookingStatus}
                  </div>

                  {statusMessage.type && (
                    <div className={`status-update-message ${statusMessage.type}`}>
                      {statusMessage.message}
                    </div>
                  )}
                </div>

                <div className="booking-info-section">
                  <h3>Booking Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Booking ID</span>
                      <span className="info-value">{selectedBooking._id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Service</span>
                      <span className="info-value">{selectedBooking.serviceListingId?.serviceTitle || 'Service Unavailable'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date</span>
                      <span className="info-value">{formatDate(selectedBooking.serviceDateTime)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Time</span>
                      <span className="info-value">{formatTime(selectedBooking.serviceDateTime)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Price</span>
                      <span className="info-value price">₹{selectedBooking.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Booking Status</span>
                      <span className={`payment-status ${selectedBooking.bookingStatus.toLowerCase()}`}>
                        {selectedBooking.bookingStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="customer-info-section">
                  <h3>Customer Information</h3>
                  <div className="customer-profile">
                    <div className="customer-avatar large">
                      <img
                        src={selectedBooking.customerId?.profilePicture || "/placeholder-user.jpg"}
                        alt={selectedBooking.customerId ? `${selectedBooking.customerId.firstName} ${selectedBooking.customerId.lastName}` : 'Customer'}
                        onError={(e) => { e.target.src = '/placeholder-user.jpg'; }}
                      />
                    </div>
                    <div className="customer-details">
                      <h4>{selectedBooking.customerId ? `${selectedBooking.customerId.firstName} ${selectedBooking.customerId.lastName}` : 'Customer'}</h4>
                      <p><i className="fas fa-user"></i> Customer ID: {selectedBooking.customerId?._id.substring(0, 8) || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {selectedBooking.specialInstructions && (
                  <div className="special-instructions-section">
                    <h3>Special Instructions</h3>
                    <p>{selectedBooking.specialInstructions}</p>
                  </div>
                )}

                <div className="booking-timeline">
                  <h3>Booking Timeline</h3>
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-icon">
                        <i className="fas fa-calendar-plus"></i>
                      </div>
                      <div className="timeline-content">
                        <h4>Booking Created</h4>
                        <p>{formatDate(selectedBooking.createdAt)} at {formatTime(selectedBooking.createdAt)}</p>
                      </div>
                    </div>

                    {selectedBooking.statusUpdates && selectedBooking.statusUpdates.map((update, index) => (
                      <div className="timeline-item" key={index}>
                        <div className="timeline-icon">
                          {update.status === 'Confirmed' && <i className="fas fa-check"></i>}
                          {update.status === 'Completed' && <i className="fas fa-check-circle"></i>}
                          {update.status === 'Cancelled' && <i className="fas fa-times-circle"></i>}
                        </div>
                        <div className="timeline-content">
                          <h4>Status Updated to {update.status}</h4>
                          <p>{formatDate(update.timestamp)} at {formatTime(update.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                {selectedBooking.bookingStatus === 'Pending' && (
                  <>
                    <button
                      className="confirm-btn"
                      onClick={() => handleUpdateStatus(selectedBooking._id, 'Confirmed')}
                      disabled={statusUpdateLoading}
                    >
                      {statusUpdateLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>} Confirm Booking
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleUpdateStatus(selectedBooking._id, 'Cancelled')}
                      disabled={statusUpdateLoading}
                    >
                      {statusUpdateLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-times"></i>} Reject Booking
                    </button>
                  </>
                )}

                {selectedBooking.bookingStatus === 'Confirmed' && (
                  <button
                    className="complete-btn"
                    onClick={() => handleUpdateStatus(selectedBooking._id, 'Completed')}
                    disabled={statusUpdateLoading}
                  >
                    {statusUpdateLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>} Mark as Completed
                  </button>
                )}

                <button className="close-btn" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}

export default ProviderBookings;