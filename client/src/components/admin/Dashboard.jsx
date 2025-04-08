import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import AdminLayout from './AdminLayout';

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    providers: 0,
    listings: 0,
    bookings: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  useEffect(() => {
    if (!user || user.userType !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [usersRes, providersRes, listingsRes, bookingsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/providers', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/listings', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/bookings', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setStats({
          users: usersRes.data.count || usersRes.data.data?.length || 0,
          providers: providersRes.data.count || providersRes.data.data?.length || 0,
          listings: listingsRes.data.count || listingsRes.data.data?.length || 0,
          bookings: bookingsRes.data.count || bookingsRes.data.data?.length || 0,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Total Users', 
      count: stats.users, 
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      label: 'Service Providers', 
      count: stats.providers, 
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      label: 'Service Listings', 
      count: stats.listings, 
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      label: 'Total Bookings', 
      count: stats.bookings, 
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`${card.bgColor} ${card.textColor} p-3 rounded-full`}>
                      {card.icon}
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">{card.label}</p>
                      <p className="mt-1 text-2xl font-semibold text-gray-900">{card.count}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700">View all</button>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">No recent activity to display.</p>
            </div>
          </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
