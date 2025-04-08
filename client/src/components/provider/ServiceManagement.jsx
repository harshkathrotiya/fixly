import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import './ServiceManagement.css';

function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/services/provider', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setServices(response.data.data || []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchServices();
    }
  }, [token]);

  const handleToggleActive = async (serviceId, currentStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/services/${serviceId}/status`, {
        isActive: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setServices(services.map(service => 
        service._id === serviceId 
          ? { ...service, isActive: !currentStatus } 
          : service
      ));
    } catch (err) {
      console.error('Error updating service status:', err);
      setError('Failed to update service status. Please try again.');
    }
  };

  return (
    <div className="service-management-container">
      <div className="service-management-header">
        <h2>My Services</h2>
        <Link to="/provider/services/new" className="add-service-btn">
          Add New Service
        </Link>
      </div>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {isLoading ? (
        <div className="loading-spinner">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="no-services">
          <p>You haven't added any services yet.</p>
          <Link to="/provider/services/new" className="add-service-btn-large">
            Add Your First Service
          </Link>
        </div>
      ) : (
        <div className="services-list">
          {services.map((service) => (
            <div key={service._id} className={`service-card ${!service.isActive ? 'inactive' : ''}`}>
              <div className="service-image">
                <img 
                  src={service.serviceImages[0] || 'https://via.placeholder.com/300x200?text=No+Image'} 
                  alt={service.serviceTitle} 
                />
                {!service.isActive && (
                  <div className="inactive-overlay">Inactive</div>
                )}
              </div>
              
              <div className="service-content">
                <h3>{service.serviceTitle}</h3>
                <p className="service-category">{service.serviceCategory}</p>
                <p className="service-price">₹{service.price.toFixed(2)}</p>
                <p className="service-description">{service.serviceDescription.substring(0, 100)}...</p>
                
                <div className="service-stats">
                  <div className="stat-item">
                    <span className="stat-label">Bookings:</span>
                    <span className="stat-value">{service.bookingCount || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Rating:</span>
                    <span className="stat-value">
                      {service.averageRating ? service.averageRating.toFixed(1) : 'N/A'} 
                      {service.averageRating && <span className="star">★</span>}
                    </span>
                  </div>
                </div>
                
                <div className="service-actions">
                  <Link to={`/provider/services/edit/${service._id}`} className="edit-btn">
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleToggleActive(service._id, service.isActive)}
                    className={service.isActive ? "deactivate-btn" : "activate-btn"}
                  >
                    {service.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ServiceManagement;