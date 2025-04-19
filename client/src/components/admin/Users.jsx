import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import AdminLayout from './AdminLayout';
import Table from './shared/Table';
import Modal from './shared/Modal';
import Button from './shared/Button';
import Badge from './shared/Badge';
import { cardStyles, formStyles, alertStyles, tableStyles } from './shared/adminStyles';

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
        <Badge
          type={user.userType || 'user'}
          text={user.userType || 'user'}
        />
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      Cell: (user) => (
        <Badge
          type={user.status === 'active' ? 'active' : 'inactive'}
          text={user.status || 'active'}
          icon={user.status === 'active' ? 'check-circle' : 'times-circle'}
        />
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: (user) => (
        <div className={tableStyles.actions}>
          <button
            onClick={() => handleViewUser(user)}
            className={tableStyles.viewButton}
          >
            <i className="fas fa-eye"></i>
          </button>
          <button
            onClick={() => handleEditUser(user)}
            className={tableStyles.editButton}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={() => handleDeleteUser(user)}
            className={tableStyles.deleteButton}
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
                src={selectedUser.profileImage || "/placeholder-user.jpg"}
                alt="User profile"
                className="h-24 w-24 rounded-full object-cover"
                onError={(e) => { e.target.src = '/placeholder-user.jpg'; }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={formStyles.label}>First Name</p>
                <p>{selectedUser.firstName}</p>
              </div>
              <div>
                <p className={formStyles.label}>Last Name</p>
                <p>{selectedUser.lastName}</p>
              </div>
              <div>
                <p className={formStyles.label}>Email</p>
                <p>{selectedUser.email}</p>
              </div>
              <div>
                <p className={formStyles.label}>Role</p>
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
          <Button
            variant="secondary"
            onClick={handleCloseModal}
          >
            Close
          </Button>
        );
      case 'delete':
        return (
          <>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                // Handle delete logic here
                handleCloseModal();
              }}
            >
              Delete
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="User Management">
      {error && (
        <div className={`${alertStyles.base} ${alertStyles.error}`} role="alert">
          <p className={alertStyles.messageError}>{error}</p>
        </div>
      )}

      <div className={cardStyles.container}>
        <div className={cardStyles.header}>
          <h2 className={cardStyles.title}>All Users</h2>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                className={formStyles.select}
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

            <Button
              variant="primary"
              icon="plus"
              to="/admin/users/create"
            >
              Create User
            </Button>
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