import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "./AdminLayout";
import Card from "./shared/Card";

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
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      let dateParams = "";
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
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.userType !== "admin") {
      navigate("/login");
      return;
    }

    fetchDashboardData();

    let pollingInterval;
    if (isAutoRefresh) {
      pollingInterval = setInterval(() => {
        fetchDashboardData();
      }, 30000);
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [token, user, navigate, isAutoRefresh]);

  useEffect(() => {
    if (user && user.userType === "admin") {
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
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded"
          role="alert"
        >
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
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    fetchDashboardData();
  };

  const handleClearFilters = () => {
    setDateRange({ start: "", end: "" });
    setIsLoading(true);
    setError(null);
    fetchDashboardData();
  };

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="bg-gray-50 py-6 min-h-screen">
        {/* Header */}
        <div className="bg-white shadow mb-6 py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">
              Dashboard Overview
            </h1>
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
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex gap-4">
              <div className="flex flex-col">
                <label
                  htmlFor="startDate"
                  className="text-sm text-gray-600 mb-1"
                >
                  From
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      start: e.target.value,
                    }))
                  }
                  className="border rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="endDate"
                  className="text-sm text-gray-600 mb-1"
                >
                  To
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      end: e.target.value,
                    }))
                  }
                  className="border rounded px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleClearFilters}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded text-sm"
                disabled={!dateRange.start && !dateRange.end}
              >
                <i className="fas fa-times mr-1"></i>Clear Filters
              </button>
              <button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={`py-2 px-4 rounded text-sm ${
                  isAutoRefresh
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-400 text-white hover:bg-gray-500"
                }`}
              >
                <i
                  className={`fas fa-${
                    isAutoRefresh ? "pause" : "play"
                  } mr-1`}
                ></i>
                {isAutoRefresh ? "Pause Auto-refresh" : "Enable Auto-refresh"}
              </button>
              <button
                onClick={handleRefresh}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
              >
                <i className="fas fa-sync-alt mr-1"></i>Refresh Now
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
              title="Total Users"
              value={stats.users.toString()}
              icon={<i className="fas fa-users"></i>}
              color="blue"
              trend={parseFloat(stats.userGrowth) >= 0 ? "up" : "down"}
              trendValue={`${
                parseFloat(stats.userGrowth) >= 0 ? "+" : ""
              }${stats.userGrowth}%`}
              subtitle="vs last month"
              onClick={() => navigate("/admin/users")}
            />

            <Card
              title="Service Providers"
              value={stats.providers.toString()}
              icon={<i className="fas fa-toolbox"></i>}
              color="green"
              trend="up"
              trendValue="+3%"
              subtitle="vs last month"
              onClick={() => navigate("/admin/providers")}
            />

            <Card
              title="Active Listings"
              value={stats.listings.toString()}
              icon={<i className="fas fa-list-alt"></i>}
              color="purple"
              trend="up"
              trendValue="+8%"
              subtitle="vs last month"
              onClick={() => navigate("/admin/listings")}
            />

            <Card
              title="Total Revenue"
              value={formatCurrency(stats.revenue)}
              icon={<i className="fas fa-rupee-sign"></i>}
              color="indigo"
              trend="up"
              trendValue="+12%"
              subtitle="vs last month"
              onClick={() => navigate("/admin/earnings")}
            />

            <Card
              title="Pending Bookings"
              value={stats.pendingBookings.toString()}
              icon={<i className="fas fa-clock"></i>}
              color="yellow"
              onClick={() => navigate("/admin/bookings?status=pending")}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
