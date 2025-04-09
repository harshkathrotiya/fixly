import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import AdminLayout from './AdminLayout';
import Table from './shared/Table';
import Modal from './shared/Modal';
import '../../styles/admin/admin.css';
import '../../styles/admin/users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'delete'
  const [filterRole, setFilterRole] = useState('all');
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/users?page=${pagination.page}&limit=${pagination.limit}&sort=${sortConfig.key}&order=${sortConfig.direction}${filterRole !== 'all' ? `&role=${filterRole}` : ''}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setUsers(response.data.data || []);
        setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [token, pagination.page, sortConfig, filterRole]);

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

  // Handle user actions
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setModalMode('delete');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Define table columns
  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      Cell: (user) => <span className="font-medium text-gray-900">{user.firstName} {user.lastName}</span>
    },
    {
      header: 'Email',
      accessor: 'email'
    },
    {
      header: 'Role',
      accessor: 'userType',
      Cell: (user) => (
        <span className="user-role-badge">
          {user.userType || 'user'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      Cell: (user) => (
        <span className={user.status === 'active' ? 'user-status-active' : 'user-status-inactive'}>
          {user.status || 'active'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: (user) => (
        <div className="user-actions">
          <button
            onClick={() => handleViewUser(user)}
            className="text-blue-600 hover:text-blue-900 mr-2"
          >
            <i className="fas fa-eye"></i>
          </button>
          <button
            onClick={() => handleEditUser(user)}
            className="text-indigo-600 hover:text-indigo-900 mr-2"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={() => handleDeleteUser(user)}
            className="text-red-600 hover:text-red-900"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      )
    }
  ];

  // Render user modal content based on mode
  const renderModalContent = () => {
    if (!selectedUser) return null;

    switch (modalMode) {
      case 'view':
        return (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <img
                src={selectedUser.profileImage || "https://via.placeholder.com/100"}
                alt="User profile"
                className="h-24 w-24 rounded-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">First Name</p>
                <p>{selectedUser.firstName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Name</p>
                <p>{selectedUser.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p>{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p>{selectedUser.userType || 'user'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p>{selectedUser.status || 'active'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Joined</p>
                <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        );
      case 'delete':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <i className="fas fa-exclamation-triangle text-red-600"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete User</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
          </div>
        );
      default:
        return null;
    }
  };

  // Render modal footer based on mode
  const renderModalFooter = () => {
    switch (modalMode) {
      case 'view':
        return (
          <button
            type="button"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none"
            onClick={handleCloseModal}
          >
            Close
          </button>
        );
      case 'delete':
        return (
          <>
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none"
              onClick={() => {
                // Handle delete logic here
                handleCloseModal();
              }}
            >
              Delete
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="User Management">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">All Users</h2>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="service_provider">Service Provider</option>
                <option value="user">User</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
            </div>

            <Link
              to="/admin/users/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              <i className="fas fa-plus mr-2"></i> Create User
            </Link>
          </div>
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

      {/* User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === 'view' ? 'User Details' : modalMode === 'edit' ? 'Edit User' : 'Delete User'}
        footer={renderModalFooter()}
      >
        {renderModalContent()}
      </Modal>
    </AdminLayout>
  );
}

export default Users;