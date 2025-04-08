import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ServiceDetails.css';
import Navbar from './Navbar';
import { useAuth } from '../context/authcontext';
import PlaceholderImg from './images/plumbing.png';

function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const imageGalleryRef = useRef(null);

  // State for service data
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  
  // State for image gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  
  // State for booking
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    notes: ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/listings/${id}`);
        setListing(response.data.data);

        // Fix: Check if images exists and is an array before spreading
        const serviceImages = response.data.data.serviceImage
          ? [response.data.data.serviceImage, ...(Array.isArray(response.data.data.images) ? response.data.data.images : [])]
          : [PlaceholderImg];

        setImages(serviceImages);

        if (response.data.data.categoryId?._id) {
          fetchRelatedServices(response.data.data.categoryId._id, id);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchRelatedServices = async (categoryId, currentListingId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/listings?category=${categoryId}&limit=3`);
      const filteredRelated = response.data.data.filter(service => service._id !== currentListingId);
      setRelatedServices(filteredRelated.slice(0, 3));
    } catch (err) {
      console.error('Error fetching related services:', err);
    }
  };

  const handleImageChange = (index) => {
    setSelectedImageIndex(index);
    if (imageGalleryRef.current) {
      const thumbnailContainer = imageGalleryRef.current.querySelector('.thumbnail-images');
      const thumbnails = thumbnailContainer.querySelectorAll('.thumbnail-container');
      if (thumbnails[index]) {
        thumbnails[index].scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/login', { state: { from: `/listing/${id}` } });
      return;
    }
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e) => {
      e.preventDefault();
      setBookingError(null);
      
      try {
        // Format the date and time properly for the backend
        const bookingDateTime = new Date(`${bookingDetails.date}T${bookingDetails.time}`);
        
        // Updated booking data to match the API requirements
        const bookingData = {
          serviceListingId: id,
          serviceDateTime: bookingDateTime.toISOString(),
          specialInstructions: bookingDetails.notes || ''
        };
  
        console.log('Submitting booking with data:', bookingData);
        
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setBookingError('You must be logged in to book a service');
          return;
        }
  
        const response = await axios.post('http://localhost:5000/api/bookings', bookingData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Booking response:', response.data);
  
        // Close the form first, then show success message
        setShowBookingForm(false);
        setTimeout(() => {
          setBookingSuccess(true);
          setBookingDetails({ date: '', time: '', notes: '' });
        }, 300);
      } catch (err) {
        console.error('Error creating booking:', err.response?.data || err.message || err);
        setBookingError(err.response?.data?.message || 'Failed to create booking. Please try again.');
      }
    };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Add the missing getTimeSince function
  const getTimeSince = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval === 1 ? '1 year ago' : `${interval} years ago`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval === 1 ? '1 month ago' : `${interval} months ago`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval === 1 ? '1 day ago' : `${interval} days ago`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
    }
    
    return 'Just now';
  };

  const handleBackToServices = () => {
    navigate('/services');
  };

  const handleShareService = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.serviceTitle,
        text: `Check out this service: ${listing?.serviceTitle}`,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch((err) => console.error('Could not copy text: ', err));
    }
  };

  if (loading) {
    return (
      <div className="service-details-page">
        <Navbar />
        <div className="service-details-container">
          <div className="loading-container">
            <div className="loading-spinner-container">
              <i className="fas fa-spinner fa-spin loading-spinner"></i>
            </div>
            <p>Loading service details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="service-details-page">
        <Navbar />
        <div className="service-details-container">
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error || 'Service not found'}</p>
            <button onClick={handleBackToServices} className="error-button">Back to Services</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-details-page">
      <Navbar />
      {bookingSuccess && (
        <div className="booking-success-message">
          <i className="fas fa-check-circle"></i>
          <div>
            <h3>Booking Successful!</h3>
            <p>Your service has been booked. The provider will contact you shortly.</p>
          </div>
          <button onClick={() => setBookingSuccess(false)} aria-label="Dismiss notification">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
      
      <div className="service-details-container">
        <div className="service-details-breadcrumb">
          <button onClick={handleBackToServices} className="back-button">
            <i className="fas fa-arrow-left"></i> Back to Services
          </button>
          <div className="breadcrumb-path">
            <span onClick={handleBackToServices} className="breadcrumb-link">Services</span>
            <i className="fas fa-chevron-right"></i>
            <span onClick={() => navigate(`/services?category=${listing.categoryId?._id}`)} className="breadcrumb-link">
              {listing.categoryId?.categoryName || 'Category'}
            </span>
            <i className="fas fa-chevron-right"></i>
            <span className="current-page">{listing.serviceTitle}</span>
          </div>
        </div>
        
        <div className="service-details-content">
          <div className="service-details-main">
            <div className="service-details-gallery" ref={imageGalleryRef}>
              <div className="main-image-container">
                <img 
                  src={images[selectedImageIndex] || PlaceholderImg} 
                  alt={listing.serviceTitle} 
                  className="main-image"
                  onError={(e) => {
                    e.target.src = PlaceholderImg;
                  }}
                />
                <div className="image-navigation">
                  {images.length > 1 && (
                    <>
                      <button 
                        className="prev-image-btn"
                        onClick={() => handleImageChange((selectedImageIndex - 1 + images.length) % images.length)}
                        aria-label="Previous image"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <button 
                        className="next-image-btn"
                        onClick={() => handleImageChange((selectedImageIndex + 1) % images.length)}
                        aria-label="Next image"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {images.length > 1 && (
                <div className="thumbnail-images">
                  {images.map((image, index) => (
                    <div 
                      key={index} 
                      className={`thumbnail-container ${selectedImageIndex === index ? 'active' : ''}`}
                      onClick={() => handleImageChange(index)}
                    >
                      <img 
                        src={image} 
                        alt={`${listing.serviceTitle} ${index + 1}`} 
                        className="thumbnail-image"
                        onError={(e) => {
                          e.target.src = PlaceholderImg;
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="service-details-info">
              <div className="service-header">
                <h1 className="service-title">{listing.serviceTitle}</h1>
                <button className="share-button" onClick={handleShareService} aria-label="Share service">
                  <i className="fas fa-share-alt"></i>
                </button>
              </div>
              
              <div className="service-meta-info">
                <div className="service-category">
                  <i className="fas fa-tag"></i>
                  <span>{listing.categoryId?.categoryName || 'General Service'}</span>
                </div>
                
                <div className="service-date">
                  <i className="fas fa-clock"></i>
                  <span title={formatDate(listing.createdAt)}>Listed {getTimeSince(listing.createdAt)}</span>
                </div>
                
                {listing.averageRating > 0 && (
                  <div className="service-rating">
                    <div className="stars-container">
                      {[...Array(5)].map((_, i) => (
                        <i 
                          key={i} 
                          className={`fas fa-star ${i < Math.round(listing.averageRating) ? 'filled' : ''}`}
                        ></i>
                      ))}
                    </div>
                    <span className="rating-value">{listing.averageRating.toFixed(1)}</span>
                    <span className="review-count">({listing.reviewCount} reviews)</span>
                  </div>
                )}
                
                {listing.isActive && (
                  <div className="service-availability">
                    <i className="fas fa-check-circle"></i>
                    <span>Available Now</span>
                  </div>
                )}
              </div>
              
              <div className="service-price-section">
                <div className="service-price">${listing.servicePrice}</div>
                {user?.role === 'provider' && (
                  <div className="price-breakdown">
                    <div className="provider-earning">
                      <span>Provider Earning:</span>
                      <span>${listing.providerEarning}</span>
                    </div>
                    <div className="commission">
                      <span>Platform Fee:</span>
                      <span>${listing.commissionAmount}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="service-description">
                <h3>Service Description</h3>
                <p>{listing.serviceDetails}</p>
              </div>
              
              {listing.tags?.length > 0 && (
                <div className="service-tags-section">
                  <h3>Tags</h3>
                  <div className="service-tags">
                    {listing.tags.map((tag, index) => (
                      <span key={index} className="service-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="service-actions">
                <button className="book-now-button" onClick={handleBookNow}>
                  <i className="fas fa-calendar-check"></i> Book Now
                </button>
                <button className="contact-provider-button">
                  <i className="fas fa-comment-alt"></i> Contact Provider
                </button>
              </div>
            </div>
          </div>
          
          <div className="service-details-sidebar">
            <div className="provider-card">
              <h3>Service Provider</h3>
              <div className="provider-info">
                <div className="provider-avatar">
                  <img 
                    src={listing.serviceProviderId?.userId?.profilePicture || PlaceholderImg} 
                    alt={`${listing.serviceProviderId?.userId?.firstName || ''} ${listing.serviceProviderId?.userId?.lastName || ''}`} 
                  />
                </div>
                <div className="provider-details">
                  <h4>
                    {listing.serviceProviderId.userId 
                      ? `${listing.serviceProviderId.userId.firstName || ''} ${listing.serviceProviderId.userId.lastName || ''}` 
                      : 'Professional Provider'}
                  </h4>
                  {listing.serviceProviderId?.verificationStatus === 'verified' && (
                    <div className="verification-badge">
                      <i className="fas fa-check-circle"></i> Verified
                    </div>
                  )}
                  {listing.serviceProviderId?.rating > 0 && (
                    <div className="provider-rating">
                      <div className="stars-container">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`fas fa-star ${i < Math.round(listing.serviceProviderId.rating) ? 'filled' : ''}`}
                          ></i>
                        ))}
                      </div>
                      <span>{listing.serviceProviderId.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {listing.serviceProviderId?.description && (
                <p className="provider-bio">{listing.serviceProviderId.description}</p>
              )}
              
              <div className="provider-contact-info">
                {listing.serviceProviderId?.contactEmail && (
                  <div className="contact-item">
                    <i className="fas fa-envelope"></i>
                    <span>{listing.serviceProviderId.contactEmail}</span>
                  </div>
                )}
                {listing.serviceProviderId?.contactPhone && (
                  <div className="contact-item">
                    <i className="fas fa-phone"></i>
                    <span>{listing.serviceProviderId.contactPhone}</span>
                  </div>
                )}
              </div>
              
              <button 
                className="view-profile-button"
                onClick={() => navigate(`/provider/profile/${listing.serviceProviderId._id}`)}
              >
                View Full Profile
              </button>
            </div>
            
            <div className="service-info-card">
              <h3>Service Information</h3>
              <div className="info-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h4>Location</h4>
                  <p>{listing.location || 'Service area not specified'}</p>
                </div>
              </div>
              
              <div className="info-item">
                <i className="fas fa-calendar-alt"></i>
                <div>
                  <h4>Availability</h4>
                  <p>{listing.isActive ? 'Currently Available' : 'Currently Unavailable'}</p>
                </div>
              </div>
              
              <div className="info-item">
                <i className="fas fa-check-circle"></i>
                <div>
                  <h4>Service Guarantee</h4>
                  <p>Satisfaction guaranteed or your money back</p>
                </div>
              </div>
              
              <div className="service-cta">
                <button className="book-now-sidebar-button" onClick={handleBookNow}>
                  Book This Service
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {showBookingForm && (
          <div className="booking-form-overlay">
            <div className="booking-form-container">
              <div className="booking-form-header">
                <h3>Book "{listing.serviceTitle}"</h3>
                <button 
                  className="close-form-button"
                  onClick={() => setShowBookingForm(false)}
                  aria-label="Close booking form"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              {bookingError && (
                <div className="booking-error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  <p>{bookingError}</p>
                </div>
              )}
              
              <form onSubmit={handleBookingSubmit} className="booking-form">
                <div className="form-group">
                  <label htmlFor="bookingDate">Preferred Date</label>
                  <input
                    type="date"
                    id="bookingDate"
                    value={bookingDetails.date}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="bookingTime">Preferred Time</label>
                  <input
                    type="time"
                    id="bookingTime"
                    value={bookingDetails.time}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, time: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="bookingNotes">Additional Notes</label>
                  <textarea
                    id="bookingNotes"
                    value={bookingDetails.notes}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                    placeholder="Describe your specific needs or any questions you have for the service provider..."
                    rows="4"
                  ></textarea>
                </div>
                
                <div className="booking-summary">
                  <h4>Booking Summary</h4>
                  <div className="summary-item">
                    <span>Service:</span>
                    <span>{listing.serviceTitle}</span>
                  </div>
                  <div className="summary-item">
                    <span>Provider:</span>
                    <span>
                      {listing.serviceProviderId.userId 
                        ? `${listing.serviceProviderId.userId.firstName || ''} ${listing.serviceProviderId.userId.lastName || ''}` 
                        : 'Professional Provider'}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span>Date:</span>
                    <span>{bookingDetails.date ? new Date(bookingDetails.date).toLocaleDateString() : 'Not selected'}</span>
                  </div>
                  <div className="summary-item">
                    <span>Time:</span>
                    <span>{bookingDetails.time || 'Not selected'}</span>
                  </div>
                  <div className="summary-item total">
                    <span>Total:</span>
                    <span>${listing.servicePrice}</span>
                  </div>
                  <div className="booking-notes">
                    <p><i className="fas fa-info-circle"></i> You won't be charged until the service is completed</p>
                  </div>
                </div>
                
                <button type="submit" className="submit-booking-button">
                  <i className="fas fa-calendar-check"></i> Confirm Booking
                </button>
              </form>
            </div>
          </div>
        )}
        
        {relatedServices.length > 0 && (
          <div className="related-services-section">
            <h2>You Might Also Like</h2>
            <div className="related-services-grid">
              {relatedServices.map(service => (
                <div key={service._id} className="related-service-card">
                  <div className="related-service-image">
                    <img 
                      src={service.serviceImage || service.images?.[0] || PlaceholderImg} 
                      alt={service.serviceTitle} 
                      onError={(e) => {
                        e.target.src = PlaceholderImg;
                      }}
                    />
                  </div>
                  <div className="related-service-content">
                    <h3>{service.serviceTitle}</h3>
                    <div className="related-service-meta">
                      <div className="related-service-price">${service.servicePrice}</div>
                      {service.averageRating > 0 && (
                        <div className="related-service-rating">
                          <i className="fas fa-star"></i>
                          <span>{service.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <p className="related-service-description">
                      {service.serviceDetails.length > 60 
                        ? `${service.serviceDetails.substring(0, 60)}...` 
                        : service.serviceDetails}
                    </p>
                    <button 
                      className="view-related-button"
                      onClick={() => navigate(`/listing/${service._id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceDetails;
