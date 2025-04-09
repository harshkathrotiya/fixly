import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './AddService.css'; // Reusing the same CSS as AddService

function EditService() {
  const navigate = useNavigate();
  const { serviceId } = useParams();
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

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

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

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/listings/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const serviceData = response.data.data;
        console.log('Fetched service data:', serviceData);

        // Make sure we have all the data we need
        if (!serviceData) {
          throw new Error('No service data returned from the server');
        }

        setFormData({
          serviceTitle: serviceData.serviceTitle || '',
          serviceCategory: serviceData.categoryId?.categoryName || '',
          serviceDescription: serviceData.serviceDetails || '',
          price: serviceData.servicePrice ? serviceData.servicePrice.toString() : '',
          duration: serviceData.duration ? serviceData.duration.toString() : '',
          serviceLocation: serviceData.serviceLocation || '',
          serviceImages: []
        });

        if (serviceData.serviceImage) {
          setExistingImages([serviceData.serviceImage]);
        }
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token && serviceId) {
      fetchServiceDetails();
    }
  }, [token, serviceId]);

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

  const removeNewImage = (index) => {
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

  const removeExistingImage = (index) => {
    const updatedExistingImages = [...existingImages];
    updatedExistingImages.splice(index, 1);
    setExistingImages(updatedExistingImages);
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

    // Log what we're submitting for debugging
    console.log('Submitting form data:', formData);

    setIsSubmitting(true);
    setError(null);

    try {
      // Log what we're submitting
      console.log('Form data being submitted:', formData);

      // Create form data for file upload
      const serviceData = new FormData();
      serviceData.append('serviceTitle', formData.serviceTitle);
      serviceData.append('serviceDetails', formData.serviceDescription);

      // Make sure price is a valid number
      if (formData.price) {
        const priceValue = parseFloat(formData.price);
        if (!isNaN(priceValue)) {
          console.log('Appending valid price:', priceValue);
          serviceData.append('servicePrice', priceValue.toString());
        } else {
          console.log('Invalid price value:', formData.price);
        }
      }

      // Make sure duration is a valid number
      if (formData.duration) {
        const durationValue = parseInt(formData.duration);
        if (!isNaN(durationValue)) {
          serviceData.append('duration', durationValue.toString());
        }
      }

      serviceData.append('serviceLocation', formData.serviceLocation || '');

      // Add tags if needed
      serviceData.append('tags', '');

      // Handle image if needed
      if (existingImages.length > 0) {
        serviceData.append('serviceImage', existingImages[0]);
      } else if (formData.serviceImages.length > 0) {
        serviceData.append('serviceImage', formData.serviceImages[0]);
      }

      // Check if we have any file uploads
      const hasFileUploads = formData.serviceImages && formData.serviceImages.length > 0;

      let response;

      if (hasFileUploads) {
        // Use FormData for file uploads
        console.log('Using FormData for file upload');

        // Log the FormData (this won't show the actual data, just an empty object)
        console.log('Service data FormData:', serviceData);

        response = await axios.put(`http://localhost:5000/api/listings/${serviceId}`, serviceData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Use JSON for regular data updates
        console.log('Using JSON for data update');

        // Create a regular JSON object
        const jsonData = {
          serviceTitle: formData.serviceTitle,
          serviceDetails: formData.serviceDescription,
          servicePrice: parseFloat(formData.price),
          duration: formData.duration ? parseInt(formData.duration) : undefined,
          serviceLocation: formData.serviceLocation || '',
          tags: ''
        };

        // If we have existing images, include them
        if (existingImages.length > 0) {
          jsonData.serviceImage = existingImages[0];
        }

        console.log('JSON data being sent:', jsonData);

        response = await axios.put(`http://localhost:5000/api/listings/${serviceId}`, jsonData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      console.log('Update response:', response.data);

      navigate('/provider/services');
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err.response?.data?.message || 'Failed to update service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading service details...</div>;
  }

  return (
    <div className="add-service-container">
      <h2>Edit Service</h2>

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
          <label>Current Images</label>
          {existingImages.length > 0 ? (
            <div className="image-preview-container">
              {existingImages.map((src, index) => (
                <div key={`existing-${index}`} className="image-preview-item">
                  <img src={src} alt={`Service ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeExistingImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-images">No images available</p>
          )}
        </div>

        <div className="form-group">
          <label>Add New Images</label>
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
                  <div key={`new-${index}`} className="image-preview-item">
                    <img src={src} alt={`New preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeNewImage(index)}
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
            {isSubmitting ? 'Updating Service...' : 'Update Service'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditService;