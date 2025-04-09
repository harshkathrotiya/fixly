import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import AdminLayout from './AdminLayout';
import Table from './shared/Table';
import Modal from './shared/Modal';

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [responseStatus, setResponseStatus] = useState('In Progress');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [filterStatus, setFilterStatus] = useState('all');
  const { token } = useAuth();

  useEffect(() => {
    fetchComplaints();
  }, [token, pagination.page, sortConfig, filterStatus]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}&sort=${sortConfig.key}&order=${sortConfig.direction}`;

      if (filterStatus !== 'all') {
        queryParams += `&status=${filterStatus}`;
      }

      const response = await axios.get(`http://localhost:5000/api/complaints?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComplaints(response.data.data || []);
      setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints. Please try again.');
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

  // Handle filter status change
  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setAdminResponse(complaint.adminResponse || '');
    setResponseStatus(complaint.status || 'In Progress');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
    setAdminResponse('');
    setResponseStatus('In Progress');
  };

  const handleSubmitResponse = async () => {
    try {
      await axios.put(`http://localhost:5000/api/complaints/${selectedComplaint._id}`, {
        adminResponse,
        status: responseStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setComplaints(complaints.map(complaint =>
        complaint._id === selectedComplaint._id
          ? { ...complaint, adminResponse, status: responseStatus }
          : complaint
      ));

      handleCloseModal();
    } catch (err) {
      console.error('Error updating complaint:', err);
      setError('Failed to update complaint. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Define table columns
  const columns = [
    {
      header: 'Customer',
      accessor: 'customerId',
      Cell: (complaint) => (
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {complaint.customerId?.firstName} {complaint.customerId?.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {complaint.customerId?.email}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Service',
      accessor: 'bookingId',
      Cell: (complaint) => (
        <div className="text-sm text-gray-900">
          {complaint.bookingId?.serviceListingId?.serviceTitle || 'N/A'}
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'complaintType',
      Cell: (complaint) => (
        <div className="text-sm text-gray-900">
          {complaint.complaintType}
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      Cell: (complaint) => (
        <div className="text-sm text-gray-900">
          {formatDate(complaint.createdAt)}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      Cell: (complaint) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(complaint.status)}`}>
          {complaint.status || 'Pending'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: (complaint) => (
        <button
          onClick={() => handleViewComplaint(complaint)}
          className="text-indigo-600 hover:text-indigo-900"
        >
          <i className="fas fa-eye mr-1"></i> View Details
        </button>
      )
    }
  ];

  // Render modal content
  const renderModalContent = () => {
    if (!selectedComplaint) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Customer</p>
            <p className="text-sm">
              {selectedComplaint.customerId?.firstName} {selectedComplaint.customerId?.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-sm">{selectedComplaint.customerId?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Service</p>
            <p className="text-sm">
              {selectedComplaint.bookingId?.serviceListingId?.serviceTitle || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Provider</p>
            <p className="text-sm">
              {selectedComplaint.bookingId?.serviceProviderId?.userId?.firstName} {selectedComplaint.bookingId?.serviceProviderId?.userId?.lastName || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Complaint Type</p>
            <p className="text-sm">{selectedComplaint.complaintType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date Submitted</p>
            <p className="text-sm">{formatDate(selectedComplaint.createdAt)}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Complaint Text</p>
          <p className="text-sm bg-gray-50 p-3 rounded mt-1">
            {selectedComplaint.complaintText}
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-500">Admin Response</p>
          <textarea
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            rows="4"
            placeholder="Enter your response to this complaint..."
          ></textarea>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Status</p>
          <select
            value={responseStatus}
            onChange={(e) => setResponseStatus(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>
    );
  };

  // Render modal footer
  const renderModalFooter = () => {
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
          onClick={handleSubmitResponse}
        >
          Save Response
        </button>
      </>
    );
  };

  return (
    <AdminLayout title="Complaint Management">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Customer Complaints</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage and respond to customer complaints.
              </p>
            </div>

            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={filterStatus}
                onChange={handleStatusFilterChange}
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>
        </div>

        <Table
          columns={columns}
          data={complaints}
          onSort={handleSort}
          sortConfig={sortConfig}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          emptyMessage="No complaints found"
        />
      </div>

      {/* Complaint Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Complaint Details"
        footer={renderModalFooter()}
        size="lg"
      >
        {renderModalContent()}
      </Modal>
    </AdminLayout>
  );
}

export default Complaints;