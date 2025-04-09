import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './AddService.css';

function AddService() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    serviceTitle: '',
    serviceCategory: '',
    serviceDescription: '',
    price: '',
    duration: '',
    serviceLocation: '',
    serviceImages: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState([]);

  const categories = [
    'Home Cleaning',
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Painting',
    'Appliance Repair',
    'Pest Control',
    'Gardening',
    'Interior Design',
    'Moving & Packing',
    'Beauty & Spa',
    'Computer Repair',
    'Tutoring',
    'Event Planning',
    'Photography',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Preview images
    const newImagePreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newImagePreviews]);

    // Store files for upload
    setFormData({
      ...formData,
      serviceImages: [...formData.serviceImages, ...files]
    });
  };

  const removeImage = (index) => {
    const updatedPreviews = [...imagePreview];
    updatedPreviews.splice(index, 1);
    setImagePreview(updatedPreviews);

    const updatedImages = [...formData.serviceImages];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      serviceImages: updatedImages
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.serviceTitle.trim()) {
      setError('Service title is required');
      return;
    }
    if (!formData.serviceCategory) {
      setError('Please select a category');
      return;
    }
    if (!formData.serviceDescription.trim()) {
      setError('Service description is required');
      return;
    }
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create form data for file upload
      const serviceData = new FormData();
      serviceData.append('serviceTitle', formData.serviceTitle);
      serviceData.append('serviceCategory', formData.serviceCategory);
      serviceData.append('serviceDescription', formData.serviceDescription);
      serviceData.append('price', formData.price);
      serviceData.append('duration', formData.duration);
      serviceData.append('serviceLocation', formData.serviceLocation);

      // Append each image
      formData.serviceImages.forEach(image => {
        serviceData.append('serviceImages', image);
      });

      await axios.post('http://localhost:5000/api/listings', serviceData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/provider/services');
    } catch (err) {
      console.error('Error adding service:', err);
      setError(err.response?.data?.message || 'Failed to add service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-service-container">
      <h2>Add New Service</h2>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="service-form">
        <div className="form-group">
          <label htmlFor="serviceTitle">Service Title *</label>
          <input
            type="text"
            id="serviceTitle"
            name="serviceTitle"
            value={formData.serviceTitle}
            onChange={handleChange}
            placeholder="e.g. Professional Home Cleaning"
          />
        </div>

        <div className="form-group">
          <label htmlFor="serviceCategory">Category *</label>
          <select
            id="serviceCategory"
            name="serviceCategory"
            value={formData.serviceCategory}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="serviceDescription">Description *</label>
          <textarea
            id="serviceDescription"
            name="serviceDescription"
            value={formData.serviceDescription}
            onChange={handleChange}
            rows="5"
            placeholder="Describe your service in detail..."
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="price">Price (₹) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 500"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group half">
            <label htmlFor="duration">Duration (minutes)</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 60"
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="serviceLocation">Service Location</label>
          <input
            type="text"
            id="serviceLocation"
            name="serviceLocation"
            value={formData.serviceLocation}
            onChange={handleChange}
            placeholder="e.g. Customer's home, My shop, etc."
          />
        </div>

        <div className="form-group">
          <label>Service Images</label>
          <div className="image-upload-container">
            <label htmlFor="serviceImages" className="image-upload-label">
              <div className="upload-icon">+</div>
              <span>Upload Images</span>
            </label>
            <input
              type="file"
              id="serviceImages"
              name="serviceImages"
              onChange={handleImageChange}
              multiple
              accept="image/*"
              className="image-upload-input"
            />

            {imagePreview.length > 0 && (
              <div className="image-preview-container">
                {imagePreview.map((src, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={src} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/provider/services')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding Service...' : 'Add Service'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddService;