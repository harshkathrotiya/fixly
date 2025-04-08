import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/authcontext';
import './ComplaintForm.css';

function ComplaintForm() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [complaintType, setComplaintType] = useState('Service Quality');
  const [complaintText, setComplaintText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBooking(response.data.data);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details. Please try again.');
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (complaintText.trim() === '') {
      setError('Please provide details about your complaint.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await axios.post('http://localhost:5000/api/complaints', {
        bookingId,
        complaintType,
        complaintText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/appointments');
      }, 2000);
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking && !error) {
    return <div className="loading">Loading booking details...</div>;
  }

  return (
    <div className="complaint-form-container">
      <h2>Submit a Complaint</h2>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {success ? (
        <div className="success-message">
          <h3>Complaint Submitted Successfully</h3>
          <p>We've received your complaint and will review it shortly.</p>
          <p>Redirecting to your appointments...</p>
        </div>
      ) : (
        booking && (
          <form onSubmit={handleSubmit} className="complaint-form">
            <div className="service-info">
              <h3>{booking.serviceListingId?.serviceTitle}</h3>
              <p>Provider: {booking.serviceProviderId?.userId?.firstName} {booking.serviceProviderId?.userId?.lastName}</p>
              <p>Date: {new Date(booking.serviceDateTime).toLocaleDateString()}</p>
              <p>Status: {booking.bookingStatus}</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="complaintType">Complaint Type:</label>
              <select
                id="complaintType"
                value={complaintType}
                onChange={(e) => setComplaintType(e.target.value)}
                className="complaint-select"
              >
                <option value="Service Quality">Service Quality</option>
                <option value="Provider Behavior">Provider Behavior</option>
                <option value="Pricing Issue">Pricing Issue</option>
                <option value="Booking Issue">Booking Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="complaintText">Complaint Details:</label>
              <textarea
                id="complaintText"
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Please provide details about your complaint..."
                rows={5}
                maxLength={1000}
              ></textarea>
              <div className="char-count">{complaintText.length}/1000</div>
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        )
      )}
    </div>
  );
}

export default ComplaintForm;