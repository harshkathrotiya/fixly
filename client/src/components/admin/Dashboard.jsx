import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // Correct casing for AuthContext
import AdminLayout from './AdminLayout';
import Card from './shared/Card';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    providers: 0,
    listings: 0,
    bookings: 0,
    revenue: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    conversionRate: 0,
    avgBookingValue: 0,
    userGrowth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      let dateParams = '';
      if (dateRange.start && dateRange.end) {
        dateParams = `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
      } else if (dateRange.start) {
        dateParams = `?startDate=${dateRange.start}`;
      } else if (dateRange.end) {
        dateParams = `?endDate=${dateRange.end}`;
      }

      const response = await axios.get(
        `http://localhost:5000/api/admin/dashboard${dateParams}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const dashboardData = response.data.data;

      // Data for charts and recent activities removed
      setStats({
        users: dashboardData.counts.users,
        providers: dashboardData.counts.providers,
        listings: dashboardData.counts.listings,
        bookings: dashboardData.counts.bookings,
        revenue: dashboardData.financial.totalRevenue,
        pendingBookings: dashboardData.counts.pendingBookings,
        completedBookings: dashboardData.counts.completedBookings,
        cancelledBookings: dashboardData.counts.cancelledBookings,
        conversionRate: dashboardData.performance.conversionRate,
        avgBookingValue: dashboardData.financial.avgBookingValue,
        userGrowth: dashboardData.performance.userGrowth,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.userType !== 'admin') {
      navigate('/login');
      return;
    }

    fetchDashboardData();

    let pollingInterval;
    if (isAutoRefresh) {
      pollingInterval = setInterval(() => {
        fetchDashboardData();
      }, 30000); // 30 seconds
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [token, user, navigate, isAutoRefresh]);

  useEffect(() => {
    if (user && user.userType === 'admin') {
      fetchDashboardData();
    }
  }, [dateRange.start, dateRange.end]);

  if (isLoading) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="flex items-center justify-center min-h-64 bg-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    fetchDashboardData();
  };

  const handleClearFilters = () => {
    setDateRange({ start: '', end: '' });
    setIsLoading(true);
    setError(null);
    fetchDashboardData();
  };

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <h1>Dashboard Overview</h1>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500 bg-white rounded-full px-3 py-1 shadow-sm">
                <i className="fas fa-clock mr-1"></i>
                Last updated: {lastUpdated.toLocaleTimeString()}
                {isAutoRefresh && (
                  <span className="ml-2 text-green-500">
                    <i className="fas fa-sync-alt animate-spin mr-1"></i>
                    Auto-refreshing
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="filter-controls">
            <div className="date-filters">
              <div className="filter-group">
                <label htmlFor="startDate">From</label>
                <input
                  type="date"
                  id="startDate"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="filter-group">
                <label htmlFor="endDate">To</label>
                <input
                  type="date"
                  id="endDate"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>

            <div className="filter-actions">
              <button
                onClick={handleClearFilters}
                className="filter-btn clear-btn"
                disabled={!dateRange.start && !dateRange.end}
              >
                <i className="fas fa-times"></i>
                Clear Filters
              </button>
              <button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={`filter-btn ${isAutoRefresh ? 'auto-refresh-btn' : 'auto-refresh-btn paused'}`}
              >
                <i className={`fas fa-${isAutoRefresh ? 'pause' : 'play'}`}></i>
                {isAutoRefresh ? 'Pause Auto-refresh' : 'Enable Auto-refresh'}
              </button>
              <button onClick={handleRefresh} className="filter-btn refresh-btn">
                <i className="fas fa-sync-alt"></i>
                Refresh Now
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl shadow-sm p-4 mb-6 flex items-center" role="alert">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <i className="fas fa-exclamation-triangle text-red-500"></i>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-500">
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="stats-cards">
            <Card
              title="Total Users"
              value={stats.users.toString()}
              icon={<i className="fas fa-users"></i>}
              color="blue"
              trend={parseFloat(stats.userGrowth) >= 0 ? 'up' : 'down'}
              trendValue={`${parseFloat(stats.userGrowth) >= 0 ? '+' : ''}${stats.userGrowth}%`}
              subtitle="vs last month"
              onClick={() => navigate('/admin/users')}
            />

            <Card
              title="Service Providers"
              value={stats.providers.toString()}
              icon={<i className="fas fa-toolbox"></i>}
              color="green"
              trend="up"
              trendValue="+3%"
              subtitle="vs last month"
              onClick={() => navigate('/admin/providers')}
            />

            <Card
              title="Active Listings"
              value={stats.listings.toString()}
              icon={<i className="fas fa-list-alt"></i>}
              color="purple"
              trend="up"
              trendValue="+8%"
              subtitle="vs last month"
              onClick={() => navigate('/admin/listings')}
            />

            <Card
              title="Total Revenue"
              value={formatCurrency(stats.revenue)}
              icon={<i className="fas fa-rupee-sign"></i>}
              color="indigo"
              trend="up"
              trendValue="+12%"
              subtitle="vs last month"
              onClick={() => navigate('/admin/earnings')}
            />

            <Card
              title="Pending Bookings"
              value={stats.pendingBookings.toString()}
              icon={<i className="fas fa-clock"></i>}
              color="yellow"
              onClick={() => navigate('/admin/bookings?status=pending')}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
