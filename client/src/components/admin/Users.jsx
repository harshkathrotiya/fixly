import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';
import Table from './shared/Table';
import Button from './shared/Button';
import Badge from './shared/Badge';
import { cardStyles, formStyles, alertStyles, tableStyles } from './shared/adminStyles';
import './shared/userStyles.css';
import './shared/AdminFilterStyles.css';
import { toast } from 'react-toastify';

function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
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

  // Function to fetch users with filters, search, sorting, and pagination
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}&sort=${sortConfig.key}&order=${sortConfig.direction}`;

      if (filterRole !== 'all') {
        queryParams += `&role=${filterRole}`;
      }

      if (filterStatus !== 'all') {
        queryParams += `&status=${filterStatus}`;
      }

      if (searchTerm) {
        queryParams += `&search=${encodeURIComponent(searchTerm)}`;
      }

      console.log('Fetching users with params:', queryParams);
      const response = await axios.get(
        `http://localhost:5000/api/users?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Fetched users:', response.data);
      setUsers(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        pages: response.data.pages || 1
      }));
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Call fetchUsers when dependencies change
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, pagination.page, pagination.limit, sortConfig.key, sortConfig.direction, filterRole, filterStatus, searchTerm]);

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
    fetchUsers();
  };

  // Direct delete without confirmation modal
  const handleDeleteUser = async (user) => {
    try {
      // Show loading toast
      const toastId = toast.loading('Deleting user...');

      console.log('Directly deleting user:', user._id);

      // Make the API call
      await axios.delete(
        `http://localhost:5000/api/users/${user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setUsers(users.filter(u => u._id !== user._id));

      // Show success message
      toast.update(toastId, {
        render: 'User deleted successfully',
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      // Refresh the user list
      setTimeout(() => fetchUsers(), 100);
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete user';
      toast.error(errorMessage);
    }
  };

  // Direct toggle status without confirmation modal
  const handleToggleStatus = async (user) => {
    try {
      console.log('Directly toggling status for user:', user._id);

      // Show loading toast
      const toastId = toast.loading(`${user.isActive ? 'Deactivating' : 'Activating'} user...`);

      // Make the API call
      const response = await axios.put(
        `http://localhost:5000/api/users/${user._id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Toggle status response:', response.data);

      // Update the user in the local state
      setUsers(users.map(u =>
        u._id === user._id ? response.data.data : u
      ));

      // Show success message
      const statusMessage = response.data.data.isActive ? 'activated' : 'deactivated';
      toast.update(toastId, {
        render: `User ${statusMessage} successfully`,
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      // Refresh the user list to ensure we have the latest data
      setTimeout(() => fetchUsers(), 100);
    } catch (err) {
      console.error('Error toggling user status:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update user status';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Define table columns
  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      Cell: (user) => (
        <div className="user-cell-with-image">
          <div className="user-image-container">
            <img
              className="user-image"
              src={user.profilePicture || "/placeholder-user.jpg"}
              alt={`${user.firstName || ''}`}
              onError={(e) => { e.target.src = '/placeholder-user.jpg'; }}
            />
          </div>
          <div className="user-details">
            <div className="user-name">
              {user.firstName} {user.lastName}
            </div>
            <div className="user-email">
              <i className="fas fa-envelope mr-1"></i>
              {user.email}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'userType',
      Cell: (user) => (
        <Badge
          type={user.userType || 'user'}
          text={user.userType === 'service_provider' ? 'Provider' : user.userType || 'User'}
        />
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      Cell: (user) => (
        <Badge
          type={user.isActive ? 'active' : 'inactive'}
          text={user.isActive ? 'Active' : 'Inactive'}
          icon={user.isActive ? 'check-circle' : 'times-circle'}
        />
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: (user) => {
        // Add console log to debug the user object
        console.log('Rendering action buttons for user:', user);

        return (
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('Toggle status button clicked for user:', user);
                handleToggleStatus(user);
              }}
              className={user.isActive ? "text-yellow-600 hover:text-yellow-900 text-lg" : "text-green-600 hover:text-green-900 text-lg"}
              title={user.isActive ? "Deactivate user" : "Activate user"}
            >
              <i className={`fas fa-${user.isActive ? 'ban' : 'check'}`}></i>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('Delete button clicked for user:', user);
                handleDeleteUser(user);
              }}
              className="text-red-600 hover:text-red-900 text-lg"
              title="Delete user"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        );
      }
    }
  ];

  // Modal-related functions removed

  return (
    <AdminLayout title="User Management">
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

        {/* Role Filter */}
        <div className="filter-group">
          <div className="filter-group-label">User Role</div>
          <div className="filter-select">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="service_provider">Service Provider</option>
              <option value="user">User</option>
            </select>
            <div className="select-icon">
              <i className="fas fa-chevron-down"></i>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <div className="filter-group-label">Account Status</div>
          <div className="filter-select">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
              setFilterRole('all');
              setFilterStatus('all');
              setPagination(prev => ({ ...prev, page: 1 }));
              // Fetch users with reset filters
              setTimeout(() => fetchUsers(), 0);
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
            All Users
            {users.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({pagination.total} total)
              </span>
            )}
          </h2>

          <Button
            variant="primary"
            icon="plus"
            to="/admin/users/create"
          >
            Create User
          </Button>
        </div>

        <Table
          columns={columns}
          data={users}
          onSort={handleSort}
          sortConfig={sortConfig}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          emptyMessage="No users found"
        />
      </div>

      {/* Modal removed as it's not working properly */}
    </AdminLayout>
  );
}

export default Users;