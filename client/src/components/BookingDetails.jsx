import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooking(response.data.data);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Error fetching booking details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, navigate]);

  const handleStatusUpdate = async (status) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/bookings/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setBooking({ ...booking, bookingStatus: status });
      
      // Show success message
      alert(`Booking ${status.toLowerCase()} successfully!`);
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Error updating booking status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="booking-details">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="booking-details">
          <p className="error">{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div>
        <Navbar />
        <div className="booking-details">
          <p>Booking not found.</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="booking-details">
        <h2>Booking Details</h2>
        {error && <p className="error">{error}</p>}

        <div className="booking-info">
          <h3>Booking #{booking._id}</h3>
          <p><strong>Service:</strong> {booking.serviceListingId?.serviceTitle || 'Service not specified'}</p>
          <p><strong>Provider:</strong> {booking.serviceProviderId?.userId?.firstName || 'Provider'} {booking.serviceProviderId?.userId?.lastName || ''}</p>
          <p><strong>Customer:</strong> {booking.customerId?.firstName || 'Customer'} {booking.customerId?.lastName || ''}</p>
          <p><strong>Date & Time:</strong> {new Date(booking.serviceDateTime).toLocaleString()}</p>
          <p><strong>Status:</strong> {booking.bookingStatus || 'Pending'}</p>
          <p><strong>Total Amount:</strong> ₹{booking.totalAmount || 0}</p>
          <p><strong>Address:</strong> {booking.address || 'Address not provided'}</p>
          <p><strong>Contact:</strong> {booking.contactNumber || 'Contact not provided'}</p>
          {booking.specialInstructions && (
            <p><strong>Special Instructions:</strong> {booking.specialInstructions}</p>
          )}
        </div>

        <div className="status-actions">
          {booking.bookingStatus === 'Pending' && (
            <>
              <button
                onClick={() => handleStatusUpdate('Confirmed')}
              >
                Accept Booking
              </button>
              <button
                onClick={() => handleStatusUpdate('Cancelled')}
              >
                Reject Booking
              </button>
            </>
          )}
          
          {booking.bookingStatus === 'Confirmed' && (
            <button
              onClick={() => handleStatusUpdate('Completed')}
            >
              Mark as Completed
            </button>
          )}
          
          {booking.bookingStatus !== 'Completed' && booking.bookingStatus !== 'Cancelled' && (
            <button
              onClick={() => handleStatusUpdate('Cancelled')}
            >
              Cancel Booking
            </button>
          )}
        </div>

        <button onClick={() => navigate('/provider/bookings')}>
          Back to Bookings
        </button>
      </div>
    </div>
  );
}

export default BookingDetails;