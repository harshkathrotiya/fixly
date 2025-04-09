import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import AdminLayout from './AdminLayout';
import Table from './shared/Table';
import Modal from './shared/Modal';

function Commissions() {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [commissionRate, setCommissionRate] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'history'
  const [sortConfig, setSortConfig] = useState({ key: 'totalEarnings', direction: 'desc' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [commissionHistory, setCommissionHistory] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchProviders();
  }, [token, pagination.page, sortConfig]);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}&sort=${sortConfig.key}&order=${sortConfig.direction}`;

      const response = await axios.get(`http://localhost:5000/api/providers?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProviders(response.data.data || []);
      setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError('Failed to load service providers. Please try again.');
    } finally {
      setIsLoading(false);
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

  // Fetch commission history for a provider
  const fetchCommissionHistory = async (providerId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/providers/${providerId}/commission-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCommissionHistory(response.data.data || []);
    } catch (err) {
      console.error('Error fetching commission history:', err);
      setError('Failed to load commission history. Please try again.');
    }
  };

  // View provider details
  const handleViewProvider = (provider) => {
    setSelectedProvider(provider);
    setModalMode('view');
    setIsModalOpen(true);
  };

  // Edit provider commission
  const handleEditCommission = (provider) => {
    setSelectedProvider(provider);
    setCommissionRate(provider.commissionRate || 10);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // View commission history
  const handleViewHistory = (provider) => {
    setSelectedProvider(provider);
    fetchCommissionHistory(provider._id);
    setModalMode('history');
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProvider(null);
    setCommissionRate(10);
    setCommissionHistory([]);
  };

  // Save commission rate
  const handleSaveCommission = async () => {
    if (!selectedProvider) return;

    try {
      await axios.put(`http://localhost:5000/api/providers/${selectedProvider._id}/commission`, {
        commissionRate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setProviders(providers.map(provider =>
        provider._id === selectedProvider._id
          ? { ...provider, commissionRate }
          : provider
      ));

      handleCloseModal();
    } catch (err) {
      console.error('Error updating commission rate:', err);
      setError('Failed to update commission rate. Please try again.');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Define table columns
  const columns = [
    {
      header: 'Provider',
      accessor: 'userId',
      Cell: (provider) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={provider.userId?.profileImage || 'https://via.placeholder.com/40'}
              alt=""
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {provider.userId?.firstName} {provider.userId?.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {provider.userId?.email}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Total Earnings',
      accessor: 'totalEarnings',
      Cell: (provider) => (
        <div className="text-sm text-gray-900">
          {formatCurrency(provider.totalEarnings)}
        </div>
      )
    },
    {
      header: 'Commission Rate',
      accessor: 'commissionRate',
      Cell: (provider) => (
        <div className="text-sm text-gray-900">
          {provider.commissionRate || 10}%
        </div>
      )
    },
    {
      header: 'Total Commission Paid',
      accessor: 'totalCommissionPaid',
      Cell: (provider) => (
        <div className="text-sm text-gray-900">
          {formatCurrency(provider.totalCommissionPaid)}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: (provider) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewProvider(provider)}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          >
            <i className="fas fa-eye"></i>
          </button>
          <button
            onClick={() => handleEditCommission(provider)}
            className="text-indigo-600 hover:text-indigo-900"
            title="Edit Commission"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={() => handleViewHistory(provider)}
            className="text-green-600 hover:text-green-900"
            title="View History"
          >
            <i className="fas fa-history"></i>
          </button>
        </div>
      )
    }
  ];

  // Render modal content based on mode
  const renderModalContent = () => {
    if (!selectedProvider) return null;

    switch (modalMode) {
      case 'view':
        return (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <img
                src={selectedProvider.userId?.profileImage || "https://via.placeholder.com/100"}
                alt="Provider profile"
                className="h-24 w-24 rounded-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Provider Name</p>
                <p className="text-sm">
                  {selectedProvider.userId?.firstName} {selectedProvider.userId?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm">{selectedProvider.userId?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-sm">{selectedProvider.userId?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Joined Date</p>
                <p className="text-sm">{formatDate(selectedProvider.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                <p className="text-sm">{formatCurrency(selectedProvider.totalEarnings)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Commission Rate</p>
                <p className="text-sm">{selectedProvider.commissionRate || 10}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Commission Paid</p>
                <p className="text-sm">{formatCurrency(selectedProvider.totalCommissionPaid)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Services</p>
                <p className="text-sm">{selectedProvider.serviceCount || 0}</p>
              </div>
            </div>
          </div>
        );
      case 'edit':
        return (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <img
                src={selectedProvider.userId?.profileImage || "https://via.placeholder.com/100"}
                alt="Provider profile"
                className="h-24 w-24 rounded-full"
              />
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Provider Name</p>
              <p className="text-sm font-medium">
                {selectedProvider.userId?.firstName} {selectedProvider.userId?.lastName}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Current Commission Rate</p>
              <p className="text-sm">{selectedProvider.commissionRate || 10}%</p>
            </div>

            <div>
              <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-500 mb-1">
                New Commission Rate (%)
              </label>
              <div className="flex items-center">
                <input
                  id="commissionRate"
                  type="number"
                  min="0"
                  max="30"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-24 p-2 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="ml-2">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Commission rate must be between 0% and 30%</p>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Provider</p>
              <p className="text-sm font-medium">
                {selectedProvider.userId?.firstName} {selectedProvider.userId?.lastName}
              </p>
            </div>

            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Old Rate
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Rate
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Changed By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {commissionHistory.length > 0 ? (
                    commissionHistory.map((history, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(history.createdAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {history.oldRate}%
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {history.newRate}%
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {history.adminId?.firstName} {history.adminId?.lastName}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-3 text-center text-sm text-gray-500">
                        No commission history found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
      case 'history':
        return (
          <button
            type="button"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none"
            onClick={handleCloseModal}
          >
            Close
          </button>
        );
      case 'edit':
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
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none"
              onClick={handleSaveCommission}
            >
              Save Changes
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="Commission Management">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Service Provider Commissions</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage commission rates for service providers on the platform.
          </p>
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

      {/* Provider Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === 'view' ? 'Provider Details' :
               modalMode === 'edit' ? 'Edit Commission Rate' :
               'Commission History'}
        footer={renderModalFooter()}
        size={modalMode === 'history' ? 'lg' : 'md'}
      >
        {renderModalContent()}
      </Modal>
    </AdminLayout>
  );
}

export default Commissions;