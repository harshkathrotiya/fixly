import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import AdminLayout from './AdminLayout';
import Table from './shared/Table';
import Button from './shared/Button';
import Badge from './shared/Badge';
import { cardStyles, alertStyles, tableStyles } from './shared/adminStyles';

function Providers() {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/providers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProviders(response.data.data || []);
      } catch (err) {
        console.error('Error fetching providers:', err);
        setError('Failed to load service providers. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [token]);

  // Define table columns
  const columns = [
    {
      header: 'Provider',
      accessor: 'provider',
      Cell: (provider) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={provider.userId?.profileImage || '/placeholder-user.jpg'}
              alt={`${provider.userId?.firstName || ''} ${provider.userId?.lastName || ''}`}
              onError={(e) => { e.target.src = '/placeholder-user.jpg'; }}
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
      header: 'Service Category',
      accessor: 'serviceCategory',
      Cell: (provider) => (
        <div className="text-sm text-gray-900">
          {provider.serviceCategory?.map(cat => cat.categoryName).join(', ') || 'N/A'}
        </div>
      )
    },
    {
      header: 'Availability',
      accessor: 'availability',
      Cell: (provider) => (
        <div className="text-sm text-gray-900">{provider.availability}</div>
      )
    },
    {
      header: 'Verification',
      accessor: 'isVerified',
      Cell: (provider) => (
        <Badge
          type={provider.isVerified ? 'active' : 'pending'}
          text={provider.isVerified ? 'Verified' : 'Pending'}
          icon={provider.isVerified ? 'check-circle' : 'clock'}
        />
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: (provider) => (
        <div className={tableStyles.actions}>
          <button
            className={tableStyles.viewButton}
            onClick={() => {}}
          >
            <i className="fas fa-eye"></i>
          </button>
          {!provider.isVerified && (
            <button
              className={tableStyles.actionButton}
              onClick={() => {}}
            >
              <i className="fas fa-check"></i>
            </button>
          )}
          <button
            className={tableStyles.deleteButton}
            onClick={() => {}}
          >
            <i className="fas fa-ban"></i>
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout title="Service Provider Management">
      {error && (
        <div className={`${alertStyles.base} ${alertStyles.error}`} role="alert">
          <p className={alertStyles.messageError}>{error}</p>
        </div>
      )}

      <div className={cardStyles.container}>
        <div className={cardStyles.header}>
          <h2 className={cardStyles.title}>All Service Providers</h2>
          <Button
            variant="primary"
            icon="plus"
            onClick={() => {}}
          >
            Add Provider
          </Button>
        </div>

        <Table
          columns={columns}
          data={providers}
          isLoading={isLoading}
          emptyMessage="No service providers found"
        />
      </div>
    </AdminLayout>
  );
}

export default Providers;