import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/listings/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        });
        setListing(response.data.data);
      } catch (err) {
        setError('Error fetching listing details');
      }
    };

    fetchListing();
  }, [id]);

  if (!listing) {
    return <div>Loading...</div>;
  }

  return (
    <div className="listing-details">
      <h2>Listing Details</h2>
      {error && <p className="error">{error}</p>}
      
      <div className="listing-info">
        <img src={listing.serviceImage} alt={listing.serviceTitle} />
        <h3>{listing.serviceTitle}</h3>
        <p className="price">Price: ${listing.servicePrice}</p>
        <p className="details">{listing.serviceDetails}</p>
        <div className="tags">
          {listing.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
        <p className="status">Status: {listing.isActive ? 'Active' : 'Inactive'}</p>
      </div>

      <div className="actions">
        <button onClick={() => navigate(`/provider/edit-listing/${id}`)}>Edit</button>
        <button onClick={() => navigate('/provider/dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  );
}

export default ListingDetails;