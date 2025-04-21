// Fixes applied:
// - Refactored hardcoded API URLs into environment variables.
// - Added error handling for navigation.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/bookings/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        setBooking(response.data.data);
      } catch (err) {
        setError('Error fetching booking details');
      }
    };

    fetchBooking();
  }, [id]);

  const handleStatusUpdate = async (status) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/bookings/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      setBooking({ ...booking, status });
    } catch (err) {
      setError('Error updating booking status');
    }
  };

  if (!booking) {
    return <div>Loading...</div>;
  }

  return (
    <div className="booking-details">
      <h2>Booking Details</h2>
      {error && <p className="error">{error}</p>}

      <div className="booking-info">
        <h3>Booking #{booking._id}</h3>
        <p>Client: {booking.clientName}</p>
        <p>Service: {booking.serviceTitle}</p>
        <p>Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>
        <p>Time: {booking.bookingTime}</p>
        <p>Status: {booking.status}</p>
        <p>Address: {booking.address}</p>
        <p>Contact: {booking.contactNumber}</p>
        {booking.specialInstructions && (
          <p>Special Instructions: {booking.specialInstructions}</p>
        )}
      </div>

      <div className="status-actions">
        <button
          onClick={() => handleStatusUpdate('accepted')}
          disabled={booking.status === 'accepted'}
        >
          Accept
        </button>
        <button
          onClick={() => handleStatusUpdate('completed')}
          disabled={booking.status === 'completed'}
        >
          Mark as Completed
        </button>
        <button
          onClick={() => handleStatusUpdate('cancelled')}
          disabled={booking.status === 'cancelled'}
        >
          Cancel
        </button>
      </div>

      <button onClick={() => navigate('/provider/dashboard').catch(() => setError('Navigation failed'))}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default BookingDetails;