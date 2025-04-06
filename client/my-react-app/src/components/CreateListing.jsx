import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from "../context/authcontext"; // Ensure correct case
import './CreateListing.css'; // Make sure this import is present
import { uploadToCloudinary } from '../utils/cloudinary';

function CreateListing() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    serviceTitle: '',
    servicePrice: '',
    serviceDetails: '',
    categoryId: '',
    location: '',
    availability: true,
    serviceImage: '' // Add serviceImage to the initial state
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        setCategories(response.data.data || response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }
      
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(''); // Clear any existing errors
    }
  };

  // Update the axios request in your handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    setLoading(true);
    setError('');
  
    try {
      // Validate required fields
      if (!formData.serviceTitle || !formData.servicePrice || !formData.categoryId || !formData.serviceDetails) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Create a new object for the data to send
      let listingData = { ...formData };
      
      // Upload image to Cloudinary if available
      if (image) {
        try {
          const imageUrl = await uploadToCloudinary(image);

          
          // Add the image URL directly to the listing data
          listingData.serviceImage = imageUrl;
        } catch (uploadError) { 
          console.error('Cloudinary upload error:', uploadError);
          setError('Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('authToken');

      
      if (!token) {
        setError('You must be logged in to create a listing');
        setLoading(false);
        return;
      }
        
      // Send the data to the server with proper authorization header
      const response = await axios.post(
        'http://localhost:5000/api/listings',
        listingData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      

      
      if (response.data.success) {
        navigate('/provider/dashboard');
      } else {
        setError(response.data.message || 'Failed to create listing');
      }
      
    } catch (err) {
      console.error('Error creating listing:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'An error occurred while creating the listing');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="create-listing-container">
      <div className="create-listing-header">
        <h2>Create New Service Listing</h2>
        <button onClick={() => navigate('/provider/dashboard')} className="back-button">
          Back to Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="listing-form">
        <div className="form-group">
          <label htmlFor="serviceTitle">Service Title*</label>
          <input
            type="text"
            id="serviceTitle"
            name="serviceTitle"
            value={formData.serviceTitle}
            onChange={handleChange}
            placeholder="Enter service title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoryId">Category*</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.length > 0 ? (
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name || category.categoryName}
                </option>
              ))
            ) : (
              <option disabled>Loading categories...</option>
            )}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="servicePrice">Price (per hour)*</label>
          <input
            type="number"
            id="servicePrice"
            name="servicePrice"
            value={formData.servicePrice}
            onChange={handleChange}
            placeholder="Enter hourly rate"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Service location"
          />
        </div>

        <div className="form-group">
          <label htmlFor="serviceDetails">Description*</label>
          <textarea
            id="serviceDetails"
            name="serviceDetails"
            value={formData.serviceDetails}
            onChange={handleChange}
            placeholder="Describe your service"
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="serviceImage">Service Image</label>
          <input
            type="file"
            id="serviceImage"
            name="serviceImage"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
          <small>Max file size: 5MB. Recommended dimensions: 800x600px</small>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="availability"
              checked={formData.availability}
              onChange={handleChange}
            />
            Service is currently available
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/provider/dashboard')} 
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateListing;
