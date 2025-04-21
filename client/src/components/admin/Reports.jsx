import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('revenue');
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [reportType, timeFrame]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(
        `/api/reports/${reportType}?timeFrame=${timeFrame}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      setReportData(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data');
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };

  const renderChart = () => {
    if (!reportData || !reportData.labels || !reportData.datasets) {
      return <div className="p-6 text-center text-gray-500">No data available for the selected criteria</div>;
    }

    const chartData = {
      labels: reportData.labels,
      datasets: reportData.datasets
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: getChartTitle(),
        },
      },
    };

    switch (reportType) {
      case 'revenue':
      case 'bookings':
        return <Bar data={chartData} options={options} height={300} />;
      case 'users':
      case 'providers':
        return <Line data={chartData} options={options} height={300} />;
      case 'categories':
      case 'services':
        return <Pie data={chartData} options={options} height={300} />;
      default:
        return <Bar data={chartData} options={options} height={300} />;
    }
  };

  const getChartTitle = () => {
    const titles = {
      revenue: 'Revenue Report',
      bookings: 'Bookings Report',
      users: 'User Growth Report',
      providers: 'Service Provider Growth Report',
      categories: 'Category Distribution Report',
      services: 'Services Distribution Report'
    };
    
    return titles[reportType] || 'Report';
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-6">Reports & Analytics</h1>
        
        {/* Report controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="revenue">Revenue</option>
                <option value="bookings">Bookings</option>
                <option value="users">User Growth</option>
                <option value="providers">Provider Growth</option>
                <option value="categories">Category Distribution</option>
                <option value="services">Services Distribution</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Frame</label>
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="self-center">to</span>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={fetchReportData}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="h-96">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : (
              renderChart()
            )}
          </div>
        </div>
        
        {/* Summary stats */}
        {reportData && reportData.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Object.entries(reportData.summary).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-500 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="text-2xl font-bold">
                  {key.includes('revenue') || key.includes('amount') ? `$${value.toFixed(2)}` : value}
                </p>
              </div>
            ))}
          </div>
        )}
        
        {/* Data table */}
        {reportData && reportData.tableData && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {reportData.tableHeaders.map((header, index) => (
                      <th 
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.tableData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {Object.values(row).map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {typeof cell === 'number' && (reportData.tableHeaders[cellIndex].toLowerCase().includes('revenue') || 
                                                       reportData.tableHeaders[cellIndex].toLowerCase().includes('amount'))
                            ? `$${cell.toFixed(2)}`
                            : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Reports;