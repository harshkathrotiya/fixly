import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import AdminLayout from './AdminLayout';
import Table from './shared/Table';
import Modal from './shared/Modal';
import Button from './shared/Button';
import Badge from './shared/Badge';
import { cardStyles, formStyles, alertStyles, tableStyles, filterStyles } from './shared/adminStyles';
import './AdminBookings.css';

// Base64 encoded small placeholder image
const PLACEHOLDER_IMAGE_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH5gQTEDkQFLMFhwAAA7hJREFUaN7tmU1oXFUUx3/nvjeZSdOJTROtNqRJ1VqsVkGlKCguxMVUV7oQXbgQBDfiwoW4FVwIrkTEhYgoiC5c6KJuXFS0rR+1tR+xX2maNt/NvHfPcTHzJpPJvJl5M5k3Jgn3wGPmvfPxP+fcc8+5574RVWUzm9nsBvQtQFVFRLpAJ3JbgBHgQeABYDdwB7ATuA3YCmwBCkAJKAIWiIEVYBmYB+aAWWAa+AX4GfgJ+F5Vl0XEbQgAEXFAFXgCeBx4BLgXGM7w6jowCUwAnwFfAF+qaiNTABEZBp4HXgD2ZgEtpT0LfAK8p6pnuuLTKwARKQKvAK8Ct3ZrSJ82C7wNvKOqK6kBRGQf8D5wX0bG9WtngOOqOtEVQOSP3wTeAEpZWzZAWwPeUtU3O0F0BBCRMvAh8NRmMb6DnQJeUtWlRAARGQU+Bx7aIOP/s++AZ1R1JhGAiOwCvgZ2bLDxsU0Dj6rqVNuYEJFtwFc3ifEAu4Cv/H63A9gPPLrRPZ/CjgIHEgH4MPn0JgaI7ZP2sNoGHAYe3gTZJq0dBg63ARCRMvAasG+jLemD7QNe9/3/F8BR4IlNElLT2hO+/1sAqnoJeHGjremTvaSql2IAqloHXt5oS/pkL/s+bwHw8fMscGCjLemDHQCe9X1OvAYOAcc22pI+2DG/76QAqnoBeG6jLemDPef7nJiNquo3wLGNtqRPdszvc6tJiIjsAb4Ftm+0NSnsBnCfqp5vC6OqOgUcAZY22po+2xJwJDY+KYyq6iRwGFjcaIv6aIvAYd/X9gBxYVNVzwJPAysbZFQ/bAV42vc1GUBcXKvqBHAIWNgAw9LaAnDI9zMdgIeIi+2vgIPAXMaGZWFzwEHfx3QAPkzEBdckcD9wOkPjBm2nfR8n0/Z/XOLGhfcM8BjwIbCWgYGDsDXgA9+3mW76Py5142L/GvAy8CTwKbA6QEMHYau+L0/6Pl3rFUBLDyQUvleBN4B9wLvA9QEY3E+77vvwru9LT/0fl9zxRiQU31eBE8Ae4DhwsQ+G98ou+ja9D+zxfeh5AhOX3vGGJCyAloBPgHuAF4Ef+vSRXuyib8Mxv+0lv+2BzMTi8jveoBQrwgXgY+AuP9t9C1zpA8QV/87X/Lvu8m0o+G0ObiYWl+DxhqVcE68Ck8AE8AGwH3gKeBa4G7gTGKP5o0fRf2wJaADLNH/0mKf5o8cMzR89fvR/9DgDfKeqy2nL5n8A2X9bE4ZA+LsAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjItMDQtMTlUMTY6NTc6MTYrMDA6MDCjlq7LAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIyLTA0LTE5VDE2OjU3OjE2KzAwOjAw0ssWdwAAAABJRU5ErkJggg==';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'cancel'
  const [sortConfig, setSortConfig] = useState({ key: 'bookingDate', direction: 'desc' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const { token } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, [token, pagination.page, sortConfig, filterStatus, dateRange]);

  // Preload images when bookings change
  useEffect(() => {
    if (bookings.length > 0) {
      // Preload service images
      bookings.forEach(booking => {
        if (booking.serviceListingId?.serviceImage) {
          const img = new Image();
          img.src = debugImageUrl(booking.serviceListingId.serviceImage);
          img.onerror = () => console.warn(`Preload failed for: ${booking.serviceListingId.serviceImage}`);
        }
      });
    }
  }, [bookings]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}`;

      // Add sorting
      if (sortConfig.key && sortConfig.direction) {
        queryParams += `&sort=${sortConfig.key}&order=${sortConfig.direction}`;
      }

      // Add status filter
      if (filterStatus !== 'all') {
        queryParams += `&status=${filterStatus}`;
      }

      // Add date range filters
      if (dateRange.start) {
        queryParams += `&from=${dateRange.start}`;
      }

      if (dateRange.end) {
        queryParams += `&to=${dateRange.end}`;
      }

      // Call the admin bookings endpoint
      const response = await axios.get(`http://localhost:5000/api/bookings?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Bookings response:', response.data);

      // Update state with the response data
      setBookings(response.data.data || []);

      // Update pagination with total count from response
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 1
      }));
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle date range change
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  // Handle filter status change
  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  // Handle image loading errors
  const handleImageError = (e, size = 48) => {
    const originalSrc = e.target.src;
    console.warn(`Image failed to load: ${originalSrc}`);
    e.target.onerror = null;
    // Use the data URL placeholder image
    e.target.src = PLACEHOLDER_IMAGE_DATA;
  };

  // Debug function to check image URLs
  const debugImageUrl = (url) => {
    if (!url) return PLACEHOLDER_IMAGE_DATA;
    if (!url.startsWith('http')) {
      // If URL is relative, prepend the API base URL
      return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return url;
  };

  // Handle view booking details
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setModalMode('view');
    setIsModalOpen(true);
  };

  // Handle cancel booking
  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setModalMode('cancel');
    setIsModalOpen(true);
  };

  // Handle complete booking
  const handleCompleteBooking = async (booking) => {
    try {
      // Call the API to update booking status to Completed
      await axios.put(`http://localhost:5000/api/bookings/${booking._id}/status`,
        { status: 'Completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setBookings(bookings.map(item =>
        item._id === booking._id
          ? { ...item, bookingStatus: 'Completed' }
          : item
      ));

      // Show success message
      setError(null);

      // Refresh bookings to ensure we have the latest data
      fetchBookings();
    } catch (err) {
      console.error('Error completing booking:', err);
      setError('Failed to mark booking as completed. Please try again.');
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  // Confirm booking cancellation
  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;

    try {
      // Call the API to update booking status to Cancelled
      await axios.put(`http://localhost:5000/api/bookings/${selectedBooking._id}/status`,
        { status: 'Cancelled' }, // Note: Backend expects 'Cancelled' with capital C
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setBookings(bookings.map(booking =>
        booking._id === selectedBooking._id
          ? { ...booking, bookingStatus: 'Cancelled' }
          : booking
      ));

      // Close modal and clear selection
      setIsModalOpen(false);
      setSelectedBooking(null);

      // Refresh bookings to ensure we have the latest data
      fetchBookings();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    }
  };

  const getStatusClass = (status) => {
    // Convert to lowercase for case-insensitive comparison
    const statusLower = status?.toLowerCase() || '';

    switch (statusLower) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    // Convert to lowercase for case-insensitive comparison
    const statusLower = status?.toLowerCase() || '';

    switch (statusLower) {
      case 'pending':
        return 'clock';
      case 'confirmed':
        return 'calendar-check';
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'times-circle';
      case 'rejected':
        return 'ban';
      default:
        return 'clock';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Define table columns
  const columns = [
    {
      header: 'Booking ID',
      accessor: '_id',
      Cell: (booking) => (
        <div className="booking-id">
          {booking._id.substring(0, 8)}
        </div>
      )
    },
    {
      header: 'Service',
      accessor: 'serviceListingId',
      Cell: (booking) => (
        <div className="service-cell">
          <div className="service-image-container">
            <img
              className="service-image"
              src={debugImageUrl(booking.serviceListingId?.serviceImage)}
              alt={booking.serviceListingId?.serviceTitle || 'Service'}
              onError={(e) => handleImageError(e, 48)}
            />
          </div>
          <div className="service-details">
            <div className="service-title">
              {booking.serviceListingId?.serviceTitle || 'N/A'}
            </div>
            {booking.serviceListingId?.categoryId && (
              <div className="service-category">
                <i className="fas fa-tag mr-1"></i>
                {booking.serviceListingId.categoryId.categoryName}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Customer',
      accessor: 'customerId',
      Cell: (booking) => {
        const customer = booking.customerId || {};
        return (
          <div className="user-cell-with-image">
            <div className="user-image-container">
              <img
                className="user-image"
                src={debugImageUrl(customer.profilePicture)}
                alt={`${customer.firstName || 'Customer'}`}
                onError={(e) => handleImageError(e, 40)}
              />
            </div>
            <div className="user-details">
              <div className="user-name">
                {customer.firstName} {customer.lastName || ''}
              </div>
              <div className="user-email">
                <i className="fas fa-envelope mr-1"></i>
                {customer.email || 'N/A'}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Provider',
      accessor: 'serviceProviderId',
      Cell: (booking) => {
        const provider = booking.serviceProviderId?.userId || {};
        return (
          <div className="user-cell-with-image">
            <div className="user-image-container">
              <img
                className="user-image"
                src={debugImageUrl(provider.profilePicture)}
                alt={`${provider.firstName || 'Provider'}`}
                onError={(e) => handleImageError(e, 40)}
              />
            </div>
            <div className="user-details">
              <div className="user-name">
                {provider.firstName} {provider.lastName || ''}
              </div>
              {provider.email && (
                <div className="user-email">
                  <i className="fas fa-envelope mr-1"></i>
                  {provider.email}
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Date & Time',
      accessor: 'serviceDateTime',
      Cell: (booking) => {
        const date = new Date(booking.serviceDateTime);
        return (
          <div className="date-cell">
            <div className="date-value">
              {date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
            <div className="time-value">
              <i className="fas fa-clock mr-1"></i>
              {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Amount',
      accessor: 'totalAmount',
      Cell: (booking) => (
        <div className="font-medium text-indigo-600">
          ₹{booking.totalAmount?.toLocaleString() || '0'}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'bookingStatus',
      Cell: (booking) => (
        <div className={`status-badge ${getStatusClass(booking.bookingStatus)}`}>
          <i className={`fas fa-${getStatusIcon(booking.bookingStatus)}`}></i>
          {booking.bookingStatus || 'Pending'}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: (booking) => (
        <div className="action-buttons">
          <button
            onClick={() => handleViewBooking(booking)}
            className="action-button view-button"
            title="View Details"
          >
            <i className="fas fa-eye"></i>
          </button>
          {booking.bookingStatus !== 'Cancelled' && booking.bookingStatus !== 'Completed' && (
            <button
              onClick={() => handleCancelBooking(booking)}
              className="action-button cancel-button"
              title="Cancel Booking"
            >
              <i className="fas fa-times-circle"></i>
            </button>
          )}
          {booking.bookingStatus === 'Confirmed' && (
            <button
              onClick={() => handleCompleteBooking(booking)}
              className="action-button complete-button"
              title="Mark as Completed"
            >
              <i className="fas fa-check-circle"></i>
            </button>
          )}
        </div>
      )
    }
  ];

  // Render booking details in modal
  const renderBookingDetails = () => {
    if (!selectedBooking) return null;

    // Get provider info
    const provider = selectedBooking.serviceProviderId?.userId || {};
    // Get service info
    const service = selectedBooking.serviceListingId || {};
    // Get customer info
    const customer = selectedBooking.customerId || {};
    // Format dates
    const bookingDate = new Date(selectedBooking.bookingDateTime || Date.now());
    const serviceDate = new Date(selectedBooking.serviceDateTime || Date.now());

    return (
      <div className="space-y-6">
        {/* Booking Header with ID and Status */}
        <div className="booking-detail-header">
          <div className="booking-id-display">
            <div className="booking-id-label">Booking ID</div>
            <div className="booking-id-value">{selectedBooking._id}</div>
          </div>
          <div className="booking-status-display">
            <div className="booking-status-label">Status</div>
            <div className={`status-badge ${getStatusClass(selectedBooking.bookingStatus)}`}>
              <i className={`fas fa-${getStatusIcon(selectedBooking.bookingStatus)}`}></i>
              {selectedBooking.bookingStatus || 'Pending'}
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="booking-detail-section">
          <h3 className="booking-detail-section-title">
            <i className="fas fa-concierge-bell"></i> Service Details
          </h3>
          <div className="flex items-center mb-4">
            <div className="service-image-detail-container">
              <img
                src={debugImageUrl(service.serviceImage)}
                alt={service.serviceTitle || 'Service'}
                className="service-image-detail"
                onError={(e) => handleImageError(e, 80)}
              />
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900">{service.serviceTitle || 'N/A'}</h4>
              {service.categoryId && (
                <div className="text-sm text-gray-600">
                  <i className="fas fa-tag mr-1"></i>
                  {service.categoryId.categoryName}
                </div>
              )}
            </div>
          </div>

          <div className="booking-detail-grid">
            <div className="booking-detail-item">
              <div className="booking-detail-label">Price</div>
              <div className="booking-detail-value text-indigo-600 font-semibold">
                ₹{selectedBooking.totalAmount?.toLocaleString() || '0'}
              </div>
            </div>
            <div className="booking-detail-item">
              <div className="booking-detail-label">Commission</div>
              <div className="booking-detail-value">
                ₹{selectedBooking.commissionAmount?.toLocaleString() || '0'}
              </div>
            </div>
          </div>
        </div>

        {/* Customer and Provider Info */}
        <div className="booking-detail-grid">
          {/* Customer Info */}
          <div className="booking-detail-section">
            <h3 className="booking-detail-section-title">
              <i className="fas fa-user"></i> Customer Information
            </h3>
            <div className="user-detail-header">
              <div className="user-detail-image-container">
                <img
                  className="user-detail-image"
                  src={debugImageUrl(customer.profilePicture)}
                  alt={`${customer.firstName || 'Customer'}`}
                  onError={(e) => handleImageError(e, 48)}
                />
              </div>
              <div className="user-detail-name">
                {customer.firstName} {customer.lastName || ''}
              </div>
            </div>
            <div className="space-y-3">
              <div className="booking-detail-item">
                <div className="booking-detail-label">Email</div>
                <div className="booking-detail-value">{customer.email || 'N/A'}</div>
              </div>
              {customer.phone && (
                <div className="booking-detail-item">
                  <div className="booking-detail-label">Phone</div>
                  <div className="booking-detail-value">{customer.phone}</div>
                </div>
              )}
            </div>
          </div>

          {/* Provider Info */}
          <div className="booking-detail-section">
            <h3 className="booking-detail-section-title">
              <i className="fas fa-user-tie"></i> Provider Information
            </h3>
            <div className="user-detail-header">
              <div className="user-detail-image-container">
                <img
                  className="user-detail-image"
                  src={debugImageUrl(provider.profilePicture)}
                  alt={`${provider.firstName || 'Provider'}`}
                  onError={(e) => handleImageError(e, 48)}
                />
              </div>
              <div className="user-detail-name">
                {provider.firstName} {provider.lastName || ''}
              </div>
            </div>
            <div className="space-y-3">
              <div className="booking-detail-item">
                <div className="booking-detail-label">Email</div>
                <div className="booking-detail-value">{provider.email || 'N/A'}</div>
              </div>
              {provider.phone && (
                <div className="booking-detail-item">
                  <div className="booking-detail-label">Phone</div>
                  <div className="booking-detail-value">{provider.phone}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dates and Times */}
        <div className="booking-detail-section">
          <h3 className="booking-detail-section-title">
            <i className="fas fa-calendar-alt"></i> Booking Schedule
          </h3>
          <div className="booking-detail-grid">
            <div className="booking-detail-item">
              <div className="booking-detail-label">Booking Created</div>
              <div className="booking-detail-value">
                {bookingDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                <div className="text-xs text-gray-500 mt-1">
                  {bookingDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <div className="booking-detail-item">
              <div className="booking-detail-label">Service Date & Time</div>
              <div className="booking-detail-value">
                {serviceDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                <div className="text-xs text-gray-500 mt-1">
                  {serviceDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        {selectedBooking.specialInstructions && (
          <div className="booking-detail-section">
            <h3 className="booking-detail-section-title">
              <i className="fas fa-info-circle"></i> Special Instructions
            </h3>
            <div className="booking-notes">
              {selectedBooking.specialInstructions}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render modal content based on mode
  const renderModalContent = () => {
    switch (modalMode) {
      case 'view':
        return renderBookingDetails();
      case 'cancel':
        return (
          <div className="cancel-confirmation">
            <div className="cancel-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3 className="cancel-title">Cancel Booking</h3>
            <p className="cancel-description">
              Are you sure you want to cancel this booking? This action cannot be undone and will notify the customer and service provider.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Render modal footer based on mode
  const renderModalFooter = () => {
    switch (modalMode) {
      case 'view':
        return (
          <Button
            variant="secondary"
            onClick={handleCloseModal}
          >
            Close
          </Button>
        );
      case 'cancel':
        return (
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
            >
              No, Keep It
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
            >
              Yes, Cancel Booking
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="Booking Management">
      <div className="admin-bookings">
        {error && (
          <div className={`${alertStyles.base} ${alertStyles.error}`} role="alert">
            <p className={alertStyles.messageError}>{error}</p>
          </div>
        )}

        <div className="bookings-card">
          <div className="bookings-header">
            <h2 className="bookings-title">
              <i className="fas fa-calendar-check"></i>
              All Bookings
            </h2>

            <Button
              variant="primary"
              icon="sync"
              onClick={fetchBookings}
            >
              Refresh
            </Button>
          </div>

          <div className="filter-controls-container">
            {/* Status Filter */}
            <div className="filter-group">
              <div className="filter-group-label">Status</div>
              <div className="filter-select">
                <select
                  value={filterStatus}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <div className="select-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="filter-group">
              <div className="filter-group-label">Date Range</div>
              <div className="date-range-filter">
                <input
                  type="date"
                  name="start"
                  className="date-input"
                  value={dateRange.start}
                  onChange={handleDateRangeChange}
                  placeholder="Start Date"
                />
                <span className="date-separator">to</span>
                <input
                  type="date"
                  name="end"
                  className="date-input"
                  value={dateRange.end}
                  onChange={handleDateRangeChange}
                  placeholder="End Date"
                />
              </div>
            </div>

            <div className="filter-actions">
              <button
                onClick={fetchBookings}
                className="filter-button primary"
              >
                <i className="fas fa-filter"></i> Apply Filters
              </button>
              <button
                onClick={() => {
                  setDateRange({ start: '', end: '' });
                  setFilterStatus('all');
                  setSortConfig({ key: 'serviceDateTime', direction: 'desc' });
                  setPagination(prev => ({ ...prev, page: 1 }));
                  fetchBookings();
                }}
                className="filter-button secondary"
              >
                <i className="fas fa-redo-alt"></i> Reset
              </button>
            </div>
          </div>

          <Table
            columns={columns}
            data={bookings}
            onSort={handleSort}
            sortConfig={sortConfig}
            pagination={pagination}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            emptyMessage="No bookings found"
            className="admin-table"
          />
        </div>

        {/* Booking Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={modalMode === 'view' ? 'Booking Details' : 'Cancel Booking'}
          footer={renderModalFooter()}
          size="lg"
          className="booking-details-modal"
        >
          {renderModalContent()}
        </Modal>
      </div>
    </AdminLayout>
  );
}

export default Bookings;