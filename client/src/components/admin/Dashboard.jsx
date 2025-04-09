// Fix the import path for AuthContext
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // Correct casing for AuthContext
import AdminLayout from './AdminLayout';
import Card from './shared/Card';
import Chart from './shared/Chart';
import PieChart from './shared/PieChart';

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
    userGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Build query parameters for date filtering
      let dateParams = '';
      if (dateRange.start && dateRange.end) {
        dateParams = `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
      } else if (dateRange.start) {
        dateParams = `?startDate=${dateRange.start}`;
      } else if (dateRange.end) {
        dateParams = `?endDate=${dateRange.end}`;
      }

      const [usersRes, providersRes, listingsRes, bookingsRes, paymentsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/users${dateParams}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/providers${dateParams}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/listings${dateParams}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/bookings${dateParams}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/payments/admin${dateParams}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      // Get recent bookings and users
      const bookings = bookingsRes.data.data || [];
      const users = usersRes.data.data || [];

      // Calculate bookings by status
      const pendingBookings = bookings.filter(booking => booking.status === 'pending').length;
      const completedBookings = bookings.filter(booking => booking.status === 'completed').length;
      const cancelledBookings = bookings.filter(booking => booking.status === 'cancelled').length;

      // Calculate total revenue
      const payments = paymentsRes.data.data || [];
      const revenue = payments.reduce((total, payment) => total + (payment.amount || 0), 0);

      // Calculate performance metrics
      const conversionRate = bookings.length > 0 ? (completedBookings / bookings.length * 100).toFixed(1) : 0;
      const avgBookingValue = completedBookings > 0 ? (revenue / completedBookings).toFixed(2) : 0;

      // Calculate user growth (mock data for demo)
      const userGrowth = 12.5; // In a real app, this would be calculated from historical data

      // Set recent bookings and users
      setRecentBookings(bookings.slice(0, 5));
      setRecentUsers(users.slice(0, 5));

      // Create chart data for bookings and revenue by day
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const bookingsByDay = last7Days.map(day => {
        const count = bookings.filter(booking =>
          booking.createdAt && booking.createdAt.split('T')[0] === day
        ).length;
        return { label: day.split('-')[2], value: count };
      });

      const revenueByDay = last7Days.map(day => {
        const dayPayments = payments.filter(payment =>
          payment.createdAt && payment.createdAt.split('T')[0] === day
        );
        const dayRevenue = dayPayments.reduce((total, payment) => total + (payment.amount || 0), 0);
        return { label: day.split('-')[2], value: dayRevenue };
      });

      setChartData(bookingsByDay);
      setRevenueChartData(revenueByDay);

      setStats({
        users: usersRes.data.count || usersRes.data.data?.length || 0,
        providers: providersRes.data.count || providersRes.data.data?.length || 0,
        listings: listingsRes.data.count || listingsRes.data.data?.length || 0,
        bookings: bookingsRes.data.count || bookingsRes.data.data?.length || 0,
        revenue,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        conversionRate,
        avgBookingValue,
        userGrowth
      });
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
  }, [token, user, navigate]);

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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">From</label>
              <input
                type="date"
                id="startDate"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">To</label>
              <input
                type="date"
                id="endDate"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 self-end">
            <button
              onClick={handleClearFilters}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors h-10"
              disabled={!dateRange.start && !dateRange.end}
            >
              <i className="fas fa-times mr-2"></i>
              Clear Filters
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors h-10"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card
          title="Total Users"
          value={stats.users.toString()}
          icon={<i className="fas fa-users text-lg"></i>}
          color="blue"
          trend="up"
          trendValue="+5%"
          subtitle="vs last month"
          onClick={() => navigate('/admin/users')}
        />

        <Card
          title="Service Providers"
          value={stats.providers.toString()}
          icon={<i className="fas fa-toolbox text-lg"></i>}
          color="green"
          trend="up"
          trendValue="+3%"
          subtitle="vs last month"
          onClick={() => navigate('/admin/providers')}
        />

        <Card
          title="Active Listings"
          value={stats.listings.toString()}
          icon={<i className="fas fa-list-alt text-lg"></i>}
          color="purple"
          trend="up"
          trendValue="+8%"
          subtitle="vs last month"
          onClick={() => navigate('/admin/listings')}
        />

        <Card
          title="Total Revenue"
          value={formatCurrency(stats.revenue)}
          icon={<i className="fas fa-dollar-sign text-lg"></i>}
          color="indigo"
          trend="up"
          trendValue="+12%"
          subtitle="vs last month"
        />
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-500 text-xl font-semibold">{stats.bookings}</div>
                <div className="text-gray-500 text-sm">Total Bookings</div>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <i className="fas fa-calendar-check text-blue-500"></i>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-500 text-xl font-semibold">{formatCurrency(stats.revenue)}</div>
                <div className="text-gray-500 text-sm">Total Revenue</div>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <i className="fas fa-dollar-sign text-green-500"></i>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-500 text-xl font-semibold">{stats.users}</div>
                <div className="text-gray-500 text-sm">Total Users</div>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <i className="fas fa-users text-purple-500"></i>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-yellow-500 text-xl font-semibold">{stats.listings}</div>
                <div className="text-gray-500 text-sm">Active Listings</div>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <i className="fas fa-list-alt text-yellow-500"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Chart
          type="bar"
          title="Bookings Last 7 Days"
          data={chartData}
        />

        <PieChart
          title="Booking Status Distribution"
          data={[
            { label: 'Pending', value: stats.pendingBookings, color: '#FBBF24' },
            { label: 'Completed', value: stats.completedBookings, color: '#10B981' },
            { label: 'Cancelled', value: stats.cancelledBookings, color: '#EF4444' }
          ]}
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Revenue Trend (Last 7 Days)</h3>
        <div style={{ height: '300px' }} className="relative">
          {revenueChartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No revenue data available</p>
            </div>
          ) : (
            <div className="flex items-end justify-between h-full">
              {revenueChartData.map((item, index) => {
                const maxValue = Math.max(...revenueChartData.map(d => d.value));
                const percentage = maxValue === 0 ? 0 : (item.value / maxValue) * 100;

                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full mx-1 rounded-t-sm bg-green-500 hover:bg-green-600 transition-all"
                      style={{ height: `${percentage}%`, minHeight: percentage > 0 ? '4px' : '0' }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{item.label}</span>
                    <span className="text-xs font-medium text-gray-700 mt-1">{formatCurrency(item.value)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking Status */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Booking Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-500 text-xl font-semibold">{stats.bookings}</div>
            <div className="text-gray-500 text-sm">Total Bookings</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-yellow-500 text-xl font-semibold">{stats.pendingBookings}</div>
            <div className="text-gray-500 text-sm">Pending</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-500 text-xl font-semibold">{stats.completedBookings}</div>
            <div className="text-gray-500 text-sm">Completed</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-red-500 text-xl font-semibold">{stats.cancelledBookings}</div>
            <div className="text-gray-500 text-sm">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-500">Conversion Rate</h4>
              <div className="bg-indigo-100 p-2 rounded-full">
                <i className="fas fa-chart-line text-indigo-500"></i>
              </div>
            </div>
            <div className="flex items-end">
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <div className="text-sm text-green-500 ml-2 mb-1">
                <i className="fas fa-arrow-up mr-1"></i>
                2.1%
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Bookings completed vs. total</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-500">Avg. Booking Value</h4>
              <div className="bg-green-100 p-2 rounded-full">
                <i className="fas fa-dollar-sign text-green-500"></i>
              </div>
            </div>
            <div className="flex items-end">
              <div className="text-2xl font-bold">{formatCurrency(stats.avgBookingValue)}</div>
              <div className="text-sm text-green-500 ml-2 mb-1">
                <i className="fas fa-arrow-up mr-1"></i>
                5.3%
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Revenue per completed booking</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-500">User Growth</h4>
              <div className="bg-blue-100 p-2 rounded-full">
                <i className="fas fa-users text-blue-500"></i>
              </div>
            </div>
            <div className="flex items-end">
              <div className="text-2xl font-bold">{stats.userGrowth}%</div>
              <div className="text-sm text-green-500 ml-2 mb-1">
                <i className="fas fa-arrow-up mr-1"></i>
                1.8%
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">New users this month</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
          </div>

          <div className="divide-y divide-gray-200">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking, index) => (
                <div key={booking.id || index} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{booking.serviceTitle || 'Service Booking'}</div>
                      <div className="text-sm text-gray-500">
                        {booking.customerName || 'Customer'} • {formatDate(booking.bookingDate)}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-sm text-gray-500">
                No recent bookings to display.
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Recent Users</h3>
            <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
          </div>

          <div className="divide-y divide-gray-200">
            {recentUsers.length > 0 ? (
              recentUsers.map((user, index) => (
                <div key={user.id || index} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.profileImage || "https://via.placeholder.com/40"}
                        alt=""
                      />
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <div className="ml-auto">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.userType === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.userType === 'service_provider' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.userType || 'user'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-sm text-gray-500">
                No recent users to display.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
