import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';
import Table from './shared/Table';
import Button from './shared/Button';
import Badge from './shared/Badge';
import { cardStyles, alertStyles, tableStyles } from './shared/adminStyles';
import './shared/userStyles.css';
import './shared/AdminFilterStyles.css';
import { toast } from 'react-toastify';

function Providers() {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [filterVerification, setFilterVerification] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuth();

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Function to fetch providers with filters, search, sorting, and pagination
  const fetchProviders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}&sort=${sortConfig.key}&order=${sortConfig.direction}`;

      if (filterVerification !== 'all') {
        queryParams += `&verificationStatus=${filterVerification}`;
      }

      if (searchTerm) {
        queryParams += `&search=${encodeURIComponent(searchTerm)}`;
      }

      console.log('Fetching providers with params:', queryParams);
      const response = await axios.get(
        `http://localhost:5000/api/providers?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Fetched providers:', response.data);
      setProviders(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        pages: response.data.pages || 1
      }));
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError('Failed to load service providers. Please try again.');
      toast.error('Failed to load service providers');
    } finally {
      setIsLoading(false);
    }
  };

  // Call fetchProviders when dependencies change
  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, pagination.page, pagination.limit, sortConfig.key, sortConfig.direction, filterVerification, searchTerm]);

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

  // Handle search input
  const handleSearch = () => {
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, page: 1 }));
    // Trigger the search
    fetchProviders();
  };

  // Handle verification status toggle
  const handleToggleVerification = async (provider) => {
    try {
      console.log('Toggling verification for provider:', provider._id);

      // Show loading toast
      const toastId = toast.loading(`${provider.verificationStatus === 'Verified' ? 'Rejecting' : 'Verifying'} provider...`);

      // Determine the new status
      const newStatus = provider.verificationStatus === 'Verified' ? 'Rejected' : 'Verified';

      // Make the API call
      const response = await axios.put(
        `http://localhost:5000/api/admin/providers/${provider._id}/verify`,
        { verificationStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Toggle verification response:', response.data);

      // Update the provider in the local state
      setProviders(providers.map(p =>
        p._id === provider._id ? response.data.data : p
      ));

      // Show success message
      toast.update(toastId, {
        render: `Provider ${newStatus === 'Verified' ? 'verified' : 'rejected'} successfully`,
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      // Refresh the provider list to ensure we have the latest data
      setTimeout(() => fetchProviders(), 100);
    } catch (err) {
      console.error('Error toggling provider verification:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update provider verification status';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Define table columns
  const columns = [
    {
      header: 'Provider',
      accessor: 'userId',
      Cell: (provider) => (
        <div className="user-cell-with-image">
          <div className="user-image-container">
            <img
              className="user-image"
              src={provider.userId?.profilePicture || '/placeholder-user.jpg'}
              alt={`${provider.userId?.firstName || ''} ${provider.userId?.lastName || ''}`}
              onError={(e) => { e.target.src = '/placeholder-user.jpg'; }}
            />
          </div>
          <div className="user-details">
            <div className="user-name">
              {provider.userId?.firstName} {provider.userId?.lastName}
            </div>
            <div className="user-email">
              <i className="fas fa-envelope mr-1"></i>
              {provider.userId?.email}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Service Category',
      accessor: 'serviceCategory',
      Cell: (provider) => (
        <div className="text-sm text-gray-900">
          {provider.serviceCategory?.map(cat => cat.categoryName).join(', ') || 'N/A'}
        </div>
      )
    },
    {
      header: 'Description',
      accessor: 'serviceDescription',
      Cell: (provider) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {provider.serviceDescription || 'No description'}
        </div>
      )
    },
    {
      header: 'Availability',
      accessor: 'availability',
      Cell: (provider) => (
        <div className="text-sm text-gray-900">{provider.availability || 'Not specified'}</div>
      )
    },
    {
      header: 'Verification',
      accessor: 'verificationStatus',
      Cell: (provider) => (
        <Badge
          type={provider.verificationStatus === 'Verified' ? 'active' : provider.verificationStatus === 'Rejected' ? 'inactive' : 'pending'}
          text={provider.verificationStatus || 'Pending'}
          icon={provider.verificationStatus === 'Verified' ? 'check-circle' : provider.verificationStatus === 'Rejected' ? 'times-circle' : 'clock'}
        />
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: (provider) => (
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('Toggle verification button clicked for provider:', provider);
              handleToggleVerification(provider);
            }}
            className={provider.verificationStatus === 'Verified' ? "text-yellow-600 hover:text-yellow-900 text-lg" : "text-green-600 hover:text-green-900 text-lg"}
            title={provider.verificationStatus === 'Verified' ? "Reject provider" : "Verify provider"}
          >
            <i className={`fas fa-${provider.verificationStatus === 'Verified' ? 'ban' : 'check'}`}></i>
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout title="Service Provider Management">
      {success && (
        <div className={`${alertStyles.base} ${alertStyles.success}`} role="alert">
          <p className={alertStyles.messageSuccess}>{success}</p>
        </div>
      )}

      {error && (
        <div className={`${alertStyles.base} ${alertStyles.error}`} role="alert">
          <p className={alertStyles.messageError}>{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="filter-controls-container">
        {/* Search Filter */}
        <div className="filter-group">
          <div className="filter-group-label">Search</div>
          <div className="filter-search">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Verification Status Filter */}
        <div className="filter-group">
          <div className="filter-group-label">Verification Status</div>
          <div className="filter-select">
            <select
              value={filterVerification}
              onChange={(e) => setFilterVerification(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
            <div className="select-icon">
              <i className="fas fa-chevron-down"></i>
            </div>
          </div>
        </div>

        <div className="filter-actions">
          <button
            type="button"
            className="filter-button secondary"
            onClick={() => {
              setSearchTerm('');
              setFilterVerification('all');
              setPagination(prev => ({ ...prev, page: 1 }));
              // Fetch providers with reset filters
              setTimeout(() => fetchProviders(), 0);
            }}
          >
            <i className="fas fa-undo"></i> Reset
          </button>
          <button
            type="button"
            className="filter-button primary"
            onClick={handleSearch}
          >
            <i className="fas fa-filter"></i> Apply Filters
          </button>
        </div>
      </div>

      <div className={cardStyles.container}>
        <div className={cardStyles.header}>
          <h2 className={cardStyles.title}>
            All Service Providers
            {providers.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({pagination.total} total)
              </span>
            )}
          </h2>
        </div>

        <Table
          columns={columns}
          data={providers}
          onSort={handleSort}
          sortConfig={sortConfig}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          emptyMessage="No service providers found"
        />
      </div>
    </AdminLayout>
  );
}

export default Providers;