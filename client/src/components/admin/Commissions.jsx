import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import AdminLayout from './AdminLayout';

function Commissions() {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProvider, setEditingProvider] = useState(null);
  const [commissionRate, setCommissionRate] = useState(10);
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

  const handleEditCommission = (provider) => {
    setEditingProvider(provider);
    setCommissionRate(provider.commissionRate);
  };

  const handleCancelEdit = () => {
    setEditingProvider(null);
    setCommissionRate(10);
  };

  const handleSaveCommission = async () => {
    try {
      await axios.put(`http://localhost:5000/api/providers/${editingProvider._id}/commission`, {
        commissionRate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setProviders(providers.map(provider => 
        provider._id === editingProvider._id 
          ? { ...provider, commissionRate } 
          : provider
      ));
      
      setEditingProvider(null);
    } catch (err) {
      console.error('Error updating commission rate:', err);
      setError('Failed to update commission rate. Please try again.');
    }
  };

  return (
    <AdminLayout title="Commission Management">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">Service Provider Commissions</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage commission rates for service providers on the platform.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Earnings
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Commission Paid
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {providers.length > 0 ? (
                  providers.map((provider) => (
                    <tr key={provider._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₹{provider.totalEarnings?.toFixed(2) || '0.00'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingProvider && editingProvider._id === provider._id ? (
                          <div className="flex items-center">
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={commissionRate}
                              onChange={(e) => setCommissionRate(Number(e.target.value))}
                              className="w-16 p-1 border border-gray-300 rounded"
                            />
                            <span className="ml-1">%</span>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-900">
                            {provider.commissionRate}%
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₹{provider.totalCommissionPaid?.toFixed(2) || '0.00'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingProvider && editingProvider._id === provider._id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveCommission}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditCommission(provider)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit Commission
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No service providers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default Commissions;