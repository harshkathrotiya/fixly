import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/authcontext';
import './Reviews.css';

function Reviews() {
  const { providerId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/reviews/provider/${providerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReviews(response.data.data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (providerId) {
      fetchReviews();
    }
  }, [providerId, token]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="reviews-container">
      <h2>Customer Reviews</h2>
      
      {isLoading ? (
        <div className="loading-spinner">Loading reviews...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No reviews yet for this service provider.</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <img 
                    src={review.customerId?.profilePicture || 'https://via.placeholder.com/40'} 
                    alt={`${review.customerId?.firstName || 'Anonymous'}`} 
                    className="reviewer-avatar"
                  />
                  <div>
                    <h4>{review.customerId?.firstName} {review.customerId?.lastName}</h4>
                    <p className="review-date">{formatDate(review.reviewDateTime)}</p>
                  </div>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
              </div>
              <div className="review-content">
                <p>{review.reviewText}</p>
              </div>
              <div className="review-service">
                <span>Service: </span>
                <span className="service-name">{review.bookingId?.serviceListingId?.serviceTitle || 'Unknown Service'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reviews;