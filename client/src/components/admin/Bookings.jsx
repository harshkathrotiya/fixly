import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import AdminLayout from './AdminLayout';
import Table from './shared/Table';
import Modal from './shared/Modal';
import Button from './shared/Button';
import Badge from './shared/Badge';
import { cardStyles, formStyles, alertStyles, tableStyles, filterStyles } from './shared/adminStyles';

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

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}&sort=${sortConfig.key}&order=${sortConfig.direction}`;

      if (filterStatus !== 'all') {
        queryParams += `&status=${filterStatus}`;
      }

      if (dateRange.start) {
        queryParams += `&startDate=${dateRange.start}`;
      }

      if (dateRange.end) {
        queryParams += `&endDate=${dateRange.end}`;
      }

      const response = await axios.get(`http://localhost:5000/api/bookings?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookings(response.data.data || []);
      setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
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

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  // Confirm booking cancellation
  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;

    try {
      await axios.put(`http://localhost:5000/api/bookings/${selectedBooking._id}/status`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setBookings(bookings.map(booking =>
        booking._id === selectedBooking._id
          ? { ...booking, status: 'cancelled' }
          : booking
      ));

      setIsModalOpen(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <div className="text-sm text-gray-900">
          {booking._id.substring(0, 8)}...
        </div>
      )
    },
    {
      header: 'Service',
      accessor: 'serviceId',
      Cell: (booking) => (
        <div className="text-sm font-medium text-gray-900">
          {booking.serviceId?.serviceTitle || 'N/A'}
        </div>
      )
    },
    {
      header: 'Customer',
      accessor: 'userId',
      Cell: (booking) => (
        <div>
          <div className="text-sm text-gray-900">
            {booking.userId?.firstName} {booking.userId?.lastName}
          </div>
          <div className="text-sm text-gray-500">
            {booking.userId?.email || 'N/A'}
          </div>
        </div>
      )
    },
    {
      header: 'Provider',
      accessor: 'providerId',
      Cell: (booking) => (
        <div className="text-sm text-gray-900">
          {booking.providerId?.userId?.firstName} {booking.providerId?.userId?.lastName || 'N/A'}
        </div>
      )
    },
    {
      header: 'Date & Time',
      accessor: 'bookingDate',
      Cell: (booking) => (
        <div className="text-sm text-gray-900">
          {formatDate(booking.bookingDate)}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      Cell: (booking) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(booking.status)}`}>
          {(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: (booking) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewBooking(booking)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <i className="fas fa-eye"></i>
          </button>
          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <button
              onClick={() => handleCancelBooking(booking)}
              className="text-red-600 hover:text-red-900"
            >
              <i className="fas fa-times-circle"></i>
            </button>
          )}
        </div>
      )
    }
  ];

  // Render booking details in modal
  const renderBookingDetails = () => {
    if (!selectedBooking) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Booking ID</p>
            <p className="text-sm">{selectedBooking._id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(selectedBooking.status)}`}>
                {(selectedBooking.status || 'pending').charAt(0).toUpperCase() + (selectedBooking.status || 'pending').slice(1)}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Service</p>
            <p className="text-sm">{selectedBooking.serviceId?.serviceTitle || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Price</p>
            <p className="text-sm">${selectedBooking.price || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Customer</p>
            <p className="text-sm">{selectedBooking.userId?.firstName} {selectedBooking.userId?.lastName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Customer Email</p>
            <p className="text-sm">{selectedBooking.userId?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Provider</p>
            <p className="text-sm">{selectedBooking.providerId?.userId?.firstName} {selectedBooking.providerId?.userId?.lastName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Booking Date</p>
            <p className="text-sm">{formatDate(selectedBooking.bookingDate)}</p>
          </div>
        </div>

        {selectedBooking.notes && (
          <div>
            <p className="text-sm font-medium text-gray-500">Notes</p>
            <p className="text-sm">{selectedBooking.notes}</p>
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
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <i className="fas fa-exclamation-triangle text-red-600"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cancel Booking</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
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
          <button
            type="button"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none"
            onClick={handleCloseModal}
          >
            Close
          </button>
        );
      case 'cancel':
        return (
          <>
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none"
              onClick={handleCloseModal}
            >
              No, Keep It
            </button>
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none"
              onClick={handleConfirmCancel}
            >
              Yes, Cancel Booking
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="Booking Management">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <h2 className="text-xl font-semibold text-gray-800">All Bookings</h2>

            <div className="flex flex-wrap items-center gap-4">
              {/* Status Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={filterStatus}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  name="start"
                  value={dateRange.start}
                  onChange={handleDateRangeChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  name="end"
                  value={dateRange.end}
                  onChange={handleDateRangeChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
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
        />
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === 'view' ? 'Booking Details' : 'Cancel Booking'}
        footer={renderModalFooter()}
      >
        {renderModalContent()}
      </Modal>
    </AdminLayout>
  );
}

export default Bookings;