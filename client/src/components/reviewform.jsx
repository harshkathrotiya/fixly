import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/authcontext';
import './ReviewForm.css';

function ReviewForm() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
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
        
        // Check if booking is completed
        if (response.data.data.bookingStatus !== 'Completed') {
          setError('You can only review completed bookings.');
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details. Please try again.');
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, token]);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    
    if (reviewText.trim() === '') {
      setError('Please provide review text.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await axios.post('http://localhost:5000/api/reviews', {
        bookingId,
        rating,
        reviewText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/appointments');
      }, 2000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking && !error) {
    return <div className="loading">Loading booking details...</div>;
  }

  return (
    <div className="review-form-container">
      <h2>Write a Review</h2>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {success ? (
        <div className="success-message">
          <h3>Thank you for your review!</h3>
          <p>Your feedback helps improve our service provider community.</p>
          <p>Redirecting to your appointments...</p>
        </div>
      ) : (
        booking && booking.bookingStatus === 'Completed' && (
          <form onSubmit={handleSubmit} className="review-form">
            <div className="service-info">
              <h3>{booking.serviceListingId?.serviceTitle}</h3>
              <p>Provider: {booking.serviceProviderId?.userId?.firstName} {booking.serviceProviderId?.userId?.lastName}</p>
              <p>Date: {new Date(booking.serviceDateTime).toLocaleDateString()}</p>
            </div>
            
            <div className="rating-container">
              <label>Your Rating:</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= rating ? 'star filled' : 'star'}
                    onClick={() => handleRatingChange(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="reviewText">Your Review:</label>
              <textarea
                id="reviewText"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this service..."
                rows={5}
                maxLength={500}
              ></textarea>
              <div className="char-count">{reviewText.length}/500</div>
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )
      )}
    </div>
  );
}

export default ReviewForm;
