import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import AdminLayout from './AdminLayout';
import Table from './shared/Table';
import Modal from './shared/Modal';
import Button from './shared/Button';
import Badge from './shared/Badge';
import { cardStyles, formStyles, alertStyles, tableStyles, filterStyles } from './shared/adminStyles';
import './AdminListings.css';

// Import local placeholder image
import PlaceholderImg from '../images/plumbing.png';

function Listings() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'delete'
  const [sortConfig, setSortConfig] = useState({ key: 'serviceTitle', direction: 'asc' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [categories, setCategories] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchListings();
    fetchCategories();
  }, [token, pagination.page, sortConfig, filterCategory, filterStatus]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}&sort=${sortConfig.key}&order=${sortConfig.direction}`;

      if (filterCategory !== 'all') {
        queryParams += `&category=${filterCategory}`;
      }

      if (filterStatus !== 'all') {
        queryParams += `&status=${filterStatus === 'active' ? 'true' : 'false'}`;
      }

      const response = await axios.get(`http://localhost:5000/api/listings?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setListings(response.data.data || []);
      setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load service listings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle view listing details
  const handleViewListing = (listing) => {
    setSelectedListing(listing);
    setModalMode('view');
    setIsModalOpen(true);
  };

  // Handle edit listing
  const handleEditListing = (listing) => {
    setSelectedListing(listing);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Handle toggle listing status
  const handleToggleStatus = async (listing) => {
    try {
      console.log('Current auth token:', token);
      // Use the admin-specific endpoint for updating listing status
      await axios.put(`http://localhost:5000/api/admin/listings/${listing._id}/status`, {
        isActive: !listing.isActive
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setListings(listings.map(item =>
        item._id === listing._id
          ? { ...item, isActive: !item.isActive }
          : item
      ));

      // Show success message
      setError(null); // Clear any existing errors
      // You could add a success message here if you have a success notification system
    } catch (err) {
      console.error('Error updating listing status:', err);
      setError('Failed to update listing status. Please try again.');
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Define table columns
  const columns = [
    {
      header: 'Service',
      accessor: 'serviceTitle',
      Cell: (listing) => (
        <div className="service-cell">
          <div className="service-image-container">
            <img
              className="service-image"
              src={listing.serviceImage || PlaceholderImg}
              alt={listing.serviceTitle}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = PlaceholderImg;
              }}
            />
          </div>
          <div className="service-details">
            <div className="service-title">
              {listing.serviceTitle}
            </div>
            <div className="service-description">
              {listing.serviceDetails?.substring(0, 50)}...
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Provider',
      accessor: 'providerId',
      Cell: (listing) => {
        const provider = listing.providerId?.userId || {};
        return (
          <div className="provider-cell">
            <div className="provider-image-container">
              <img
                className="provider-image"
                src={provider.profileImage || '/placeholder-user.jpg'}
                alt={`${provider.firstName || 'Provider'}`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-user.jpg';
                }}
              />
            </div>
            <div className="provider-details">
              <div className="font-medium">
                {provider.firstName} {provider.lastName}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {provider.email || 'N/A'}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Category',
      accessor: 'categoryId',
      Cell: (listing) => (
        <div className="font-medium">
          {listing.categoryId?.categoryName || 'N/A'}
        </div>
      )
    },
    {
      header: 'Price',
      accessor: 'servicePrice',
      Cell: (listing) => (
        <div className="font-medium">
          {formatCurrency(listing.servicePrice)}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      Cell: (listing) => (
        <div className={`status-badge ${listing.isActive ? 'status-active' : 'status-inactive'}`}>
          <i className={`fas fa-${listing.isActive ? 'check-circle' : 'times-circle'}`}></i>
          {listing.isActive ? 'Active' : 'Inactive'}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: (listing) => (
        <div className="action-buttons">
          <button
            onClick={() => handleViewListing(listing)}
            className="action-button view-button"
            title="View Details"
          >
            <i className="fas fa-eye"></i>
          </button>
          <button
            onClick={() => handleEditListing(listing)}
            className="action-button edit-button"
            title="Edit Listing"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={() => handleToggleStatus(listing)}
            className={`action-button toggle-button ${!listing.isActive ? 'activate' : ''}`}
            title={listing.isActive ? 'Deactivate' : 'Activate'}
          >
            <i className={`fas fa-${listing.isActive ? 'ban' : 'check-circle'}`}></i>
          </button>
        </div>
      )
    }
  ];

  // Render listing details in modal
  const renderListingDetails = () => {
    if (!selectedListing) return null;

    return (
      <div className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-md h-56 rounded-lg overflow-hidden shadow-md bg-gray-100">
            <img
              src={selectedListing.serviceImage || "https://via.placeholder.com/600x400"}
              alt={selectedListing.serviceTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/600x400/f1f5f9/64748b?text=No+Image';
              }}
            />
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-indigo-800 mb-2">{selectedListing.serviceTitle}</h3>
          <div className="flex items-center gap-3 mb-2">
            <div className={`status-badge ${selectedListing.isActive ? 'status-active' : 'status-inactive'}`}>
              <i className={`fas fa-${selectedListing.isActive ? 'check-circle' : 'times-circle'}`}></i>
              {selectedListing.isActive ? 'Active' : 'Inactive'}
            </div>
            <div className="text-sm text-gray-600">
              <i className="fas fa-tag mr-1"></i>
              {selectedListing.categoryId?.categoryName || 'Uncategorized'}
            </div>
            <div className="text-sm font-semibold text-indigo-600">
              <i className="fas fa-rupee-sign mr-1"></i>
              {formatCurrency(selectedListing.servicePrice)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <i className="fas fa-user-tie mr-2 text-indigo-500"></i>
              Provider Information
            </h4>
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 mr-3">
                <img
                  src={selectedListing.providerId?.userId?.profileImage || "/placeholder-user.jpg"}
                  alt={`${selectedListing.providerId?.userId?.firstName || 'Provider'}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-user.jpg';
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {selectedListing.providerId?.userId?.firstName} {selectedListing.providerId?.userId?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedListing.providerId?.userId?.email || 'N/A'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {selectedListing.providerId?.userId?.phone && (
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm">{selectedListing.providerId?.userId?.phone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <i className="fas fa-info-circle mr-2 text-indigo-500"></i>
              Service Details
            </h4>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-sm font-medium">{selectedListing.categoryId?.categoryName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Price</p>
                <p className="text-sm font-medium">{formatCurrency(selectedListing.servicePrice)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <i className="fas fa-align-left mr-2 text-indigo-500"></i>
            Description
          </h4>
          <p className="text-sm bg-gray-50 p-4 rounded-lg">
            {selectedListing.serviceDetails}
          </p>
        </div>
      </div>
    );
  };

  // Render modal content based on mode
  const renderModalContent = () => {
    switch (modalMode) {
      case 'view':
        return renderListingDetails();
      default:
        return null;
    }
  };

  // Render modal footer based on mode
  const renderModalFooter = () => {
    switch (modalMode) {
      case 'view':
        return (
          <Button
            variant="secondary"
            onClick={handleCloseModal}
          >
            Close
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="Service Listings Management">
      <div className="admin-listings">
        {error && (
          <div className={`${alertStyles.base} ${alertStyles.error}`} role="alert">
            <p className={alertStyles.messageError}>{error}</p>
          </div>
        )}

        <div className="listings-card">
          <div className="listings-header">
            <h2 className="listings-title">
              <i className="fas fa-list-alt"></i>
              All Service Listings
            </h2>

            <Button
              variant="primary"
              icon="plus"
              onClick={() => {}}
            >
              Add New Listing
            </Button>
          </div>

          <div className="filter-controls-container">
            {/* Category Filter */}
            <div className="filter-select">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
              <div className="select-icon">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>

            {/* Status Filter */}
            <div className="filter-select">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="select-icon">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
          </div>

          <Table
            columns={columns}
            data={listings}
            onSort={handleSort}
            sortConfig={sortConfig}
            pagination={pagination}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            emptyMessage="No service listings found"
            className="admin-table-container"
          />
        </div>
      </div>

      {/* Listing Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === 'view' ? 'Listing Details' : 'Edit Listing'}
        footer={renderModalFooter()}
        size="lg"
        className="listing-details-modal"
      >
        {renderModalContent()}
      </Modal>
    </AdminLayout>
  );
}

export default Listings;