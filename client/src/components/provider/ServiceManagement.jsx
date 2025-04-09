import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ProviderLayout from './ProviderLayout';
import './ServiceManagement.css';

function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const { token } = useAuth();

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/providers/me/listings', {
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
      await axios.put(`http://localhost:5000/api/listings/${serviceId}/status`, {
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

  const handleDeleteService = async (serviceId) => {
    try {
      await axios.delete(`http://localhost:5000/api/listings/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setServices(services.filter(service => service._id !== serviceId));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Failed to delete service. Please try again.');
    }
  };

  // Filter and sort services
  const filteredServices = services
    .filter(service => {
      // Filter by active status
      if (filterActive === 'active') return service.isActive;
      if (filterActive === 'inactive') return !service.isActive;
      return true;
    })
    .filter(service => {
      // Filter by search term
      if (!searchTerm) return true;
      return service.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
             service.serviceDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
             service.serviceCategory.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      // Sort services
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'priceHigh') return b.price - a.price;
      if (sortBy === 'priceLow') return a.price - b.price;
      if (sortBy === 'nameAZ') return a.serviceTitle.localeCompare(b.serviceTitle);
      if (sortBy === 'nameZA') return b.serviceTitle.localeCompare(a.serviceTitle);
      if (sortBy === 'bookings') return (b.bookingCount || 0) - (a.bookingCount || 0);
      return 0;
    });

  return (
    <ProviderLayout>
      <div className="service-management-container">
        <div className="service-management-header">
          <div className="header-left">
            <h2>My Services</h2>
            <p>Manage your service listings</p>
          </div>
          <Link to="/provider/services/new" className="add-service-btn">
            <i className="fas fa-plus"></i> Add New Service
          </Link>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        <div className="service-management-controls">
          <div className="search-filter-container">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            <div className="filter-options">
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Services</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="nameAZ">Name: A to Z</option>
                <option value="nameZA">Name: Z to A</option>
                <option value="bookings">Most Bookings</option>
              </select>
            </div>
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <i className="fas fa-th"></i>
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading your services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="no-services">
            {searchTerm ? (
              <>
                <i className="fas fa-search"></i>
                <p>No services match your search criteria.</p>
                <button className="clear-filters-btn" onClick={() => setSearchTerm('')}>
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <i className="fas fa-clipboard-list"></i>
                <p>You haven't added any services yet.</p>
                <Link to="/provider/services/new" className="add-service-btn-large">
                  <i className="fas fa-plus"></i> Add Your First Service
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className={`services-${viewMode === 'grid' ? 'grid' : 'list'}`}>
            {filteredServices.map((service) => (
              <div key={service._id} className={`service-card ${!service.isActive ? 'inactive' : ''} ${viewMode}`}>
                <div className="service-image">
                  <img
                    src={service.serviceImage || '/placeholder-service.jpg'}
                    alt={service.serviceTitle || 'Service'}
                    onError={(e) => { e.target.src = '/placeholder-service.jpg'; }}
                  />
                  {!service.isActive && (
                    <div className="inactive-overlay">Inactive</div>
                  )}
                </div>

                <div className="service-content">
                  <h3>{service.serviceTitle || 'Untitled Service'}</h3>
                  <div className="service-meta">
                    <span className="service-category">
                      <i className="fas fa-tag"></i> {service.serviceCategory || 'Uncategorized'}
                    </span>
                    <span className="service-price">
                      <i className="fas fa-rupee-sign"></i> {service.price ? service.price.toFixed(2) : '0.00'}
                    </span>
                  </div>

                  <p className="service-description">
                    {viewMode === 'grid'
                      ? service.serviceDescription
                        ? `${service.serviceDescription.substring(0, 100)}${service.serviceDescription.length > 100 ? '...' : ''}`
                        : 'No description available'
                      : service.serviceDescription || 'No description available'
                    }
                  </p>

                  <div className="service-stats">
                    <div className="stat-item">
                      <i className="fas fa-calendar-check"></i>
                      <span className="stat-value">{service.bookingCount || 0} Bookings</span>
                    </div>
                    <div className="stat-item">
                      <i className="fas fa-star"></i>
                      <span className="stat-value">
                        {service.averageRating ? `${service.averageRating.toFixed(1)} Rating` : 'No Ratings'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <i className="fas fa-clock"></i>
                      <span className="stat-value">
                        Added {new Date(service.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="service-actions">
                    <Link to={`/provider/services/edit/${service._id}`} className="edit-btn">
                      <i className="fas fa-edit"></i> {viewMode === 'list' && 'Edit'}
                    </Link>

                    <button
                      className={`toggle-btn ${service.isActive ? 'deactivate' : 'activate'}`}
                      onClick={() => handleToggleActive(service._id, service.isActive)}
                    >
                      <i className={`fas fa-${service.isActive ? 'eye-slash' : 'eye'}`}></i>
                      {viewMode === 'list' && (service.isActive ? 'Deactivate' : 'Activate')}
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => setConfirmDelete(service._id)}
                    >
                      <i className="fas fa-trash-alt"></i> {viewMode === 'list' && 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmDelete && (
          <div className="modal-overlay">
            <div className="confirm-modal">
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete this service? This action cannot be undone.</p>
              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="confirm-btn"
                  onClick={() => handleDeleteService(confirmDelete)}
                >
                  Yes, Delete Service
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}

export default ServiceManagement;