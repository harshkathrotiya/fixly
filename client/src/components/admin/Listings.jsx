import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import AdminLayout from './AdminLayout';
import Table from './shared/Table';
import Modal from './shared/Modal';
import Button from './shared/Button';
import Badge from './shared/Badge';
import { cardStyles, formStyles, alertStyles, tableStyles, filterStyles } from './shared/adminStyles';

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
      await axios.put(`http://localhost:5000/api/listings/${listing._id}/status`, {
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Define table columns
  const columns = [
    {
      header: 'Service',
      accessor: 'serviceTitle',
      Cell: (listing) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              className="h-10 w-10 rounded-lg object-cover"
              src={listing.serviceImage || 'https://via.placeholder.com/40'}
              alt=""
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {listing.serviceTitle}
            </div>
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {listing.serviceDetails?.substring(0, 50)}...
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Provider',
      accessor: 'providerId',
      Cell: (listing) => (
        <div>
          <div className="text-sm text-gray-900">
            {listing.providerId?.userId?.firstName} {listing.providerId?.userId?.lastName}
          </div>
          <div className="text-sm text-gray-500">
            {listing.providerId?.userId?.email || 'N/A'}
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'categoryId',
      Cell: (listing) => (
        <div className="text-sm text-gray-900">
          {listing.categoryId?.categoryName || 'N/A'}
        </div>
      )
    },
    {
      header: 'Price',
      accessor: 'servicePrice',
      Cell: (listing) => (
        <div className="text-sm text-gray-900">
          {formatCurrency(listing.servicePrice)}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      Cell: (listing) => (
        <Badge
          type={listing.isActive ? 'active' : 'inactive'}
          text={listing.isActive ? 'Active' : 'Inactive'}
          icon={listing.isActive ? 'check-circle' : 'times-circle'}
        />
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: (listing) => (
        <div className={tableStyles.actions}>
          <button
            onClick={() => handleViewListing(listing)}
            className={tableStyles.viewButton}
            title="View Details"
          >
            <i className="fas fa-eye"></i>
          </button>
          <button
            onClick={() => handleEditListing(listing)}
            className={tableStyles.editButton}
            title="Edit Listing"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={() => handleToggleStatus(listing)}
            className={tableStyles.deleteButton}
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
        <div className="flex justify-center mb-4">
          <img
            src={selectedListing.serviceImage || "https://via.placeholder.com/300x200"}
            alt={selectedListing.serviceTitle}
            className="h-48 w-auto object-cover rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Service Title</p>
            <p className="text-sm font-medium">{selectedListing.serviceTitle}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Category</p>
            <p className="text-sm">{selectedListing.categoryId?.categoryName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Price</p>
            <p className="text-sm">{formatCurrency(selectedListing.servicePrice)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className="text-sm">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                selectedListing.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedListing.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Provider</p>
            <p className="text-sm">
              {selectedListing.providerId?.userId?.firstName} {selectedListing.providerId?.userId?.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Provider Email</p>
            <p className="text-sm">{selectedListing.providerId?.userId?.email || 'N/A'}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Service Description</p>
          <p className="text-sm bg-gray-50 p-3 rounded mt-1">
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
      {error && (
        <div className={`${alertStyles.base} ${alertStyles.error}`} role="alert">
          <p className={alertStyles.messageError}>{error}</p>
        </div>
      )}

      <div className={cardStyles.container}>
        <div className={cardStyles.header}>
          <h2 className={cardStyles.title}>All Service Listings</h2>

          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <div className="relative">
              <select
                className={formStyles.select}
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
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                className={formStyles.select}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
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
        />
      </div>

      {/* Listing Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === 'view' ? 'Listing Details' : 'Edit Listing'}
        footer={renderModalFooter()}
        size="lg"
      >
        {renderModalContent()}
      </Modal>
    </AdminLayout>
  );
}

export default Listings;