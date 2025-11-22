'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = {
  food: '#FF6B6B',
  transportation: '#4ECDC4',
  entertainment: '#45B7D1',
  shopping: '#96CEB4',
  utilities: '#FFEEAD',
  healthcare: '#D4A5A5',
  others: '#9FA8DA'
};

const MonthlyAnalytics = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: firstDayOfMonth.toISOString().split('T')[0],
      endDate: lastDayOfMonth.toISOString().split('T')[0]
    };
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://smart-expense-analyser-backend.onrender.com/api/analytics/monthly`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      console.log('Raw response:', response);
      console.log('Response headers:', response.headers);
      setAnalytics(response.data);
      console.log('Analytics data:', response.data);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Analytics error:', err);
      if (axios.isAxiosError(err)) {
        console.error('Axios error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-red-500 font-semibold">{error}</div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const categoryData = Object.entries(analytics.categoryTotals).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">Expense Analytics</h1>
        <p className="text-gray-500 text-center mb-6">Visualize your spending and trends for any period.</p>
        <div className="flex flex-wrap gap-4 items-center justify-center bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <label htmlFor="startDate" className="font-medium">From:</label>
            <input
              type="date"
              id="startDate"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-4 py-2 border rounded-md"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="endDate" className="font-medium">To:</label>
            <input
              type="date"
              id="endDate"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-4 py-2 border rounded-md"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                setDateRange({
                  startDate: firstDay.toISOString().split('T')[0],
                  endDate: lastDay.toISOString().split('T')[0]
                });
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              This Month
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), 0, 1);
                const lastDay = new Date(now.getFullYear(), 11, 31);
                setDateRange({
                  startDate: firstDay.toISOString().split('T')[0],
                  endDate: lastDay.toISOString().split('T')[0]
                });
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              This Year
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Total Spending Overview */}
        <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Total Overview</h2>
          <div className="text-4xl font-extrabold text-green-600 mb-1">
            ${analytics.monthlyTotal.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            Total spending from {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}
          </div>
        </div>

        {/* Receipt Count */}
        <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Receipt Count</h2>
          <div className="text-4xl font-extrabold text-blue-600 mb-1">
            {analytics.metadata.receiptCount}
          </div>
          <div className="text-sm text-gray-500">
            Total receipts processed
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-lg col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Spending Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-lg col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Daily Spending Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.dailySpending}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" name="Daily Total" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Merchants */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Top Merchants</h2>
          <div className="space-y-4">
            {analytics.topMerchants.map((merchant: any) => (
              <div key={merchant._id} className="flex justify-between items-center">
                <span className="font-medium text-gray-700">{merchant._id}</span>
                <span className="text-green-600 font-semibold">${merchant.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Most Frequent Items</h2>
          <div className="space-y-4">
            {analytics.topItems.map((item: any) => (
              <div key={item._id} className="flex justify-between items-center">
                <span className="font-medium text-gray-700">{item._id}</span>
                <div className="text-right">
                  <div className="text-green-600 font-semibold">${item.totalSpent.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">Bought {item.count} times</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyAnalytics; 