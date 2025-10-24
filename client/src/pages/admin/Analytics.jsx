import { useState, useEffect } from 'react';
import { expenseAPI, userAPI } from '../../services/api';
import { BarChart3, TrendingUp, DollarSign, Users } from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingCount: 0,
    approvedCount: 0,
    totalAmount: 0,
    categoryStats: [],
  });
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    employeeCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [expenseRes, userRes] = await Promise.all([
        expenseAPI.getAllExpenses(),
        userAPI.getStats()
      ]);

      const expenses = expenseRes.data.expenses;
      const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const pendingCount = expenses.filter(exp => exp.status === 'pending').length;
      const approvedCount = expenses.filter(exp => exp.status === 'approved').length;

      // Calculate category-wise stats
      const categoryMap = {};
      expenses.forEach(exp => {
        const catName = exp.category?.name || 'Uncategorized';
        if (!categoryMap[catName]) {
          categoryMap[catName] = { count: 0, amount: 0 };
        }
        categoryMap[catName].count++;
        categoryMap[catName].amount += exp.amount;
      });

      const categoryStats = Object.entries(categoryMap).map(([name, data]) => ({
        name,
        count: data.count,
        amount: data.amount
      })).sort((a, b) => b.amount - a.amount);

      setStats({
        totalExpenses: expenses.length,
        pendingCount,
        approvedCount,
        totalAmount,
        categoryStats
      });

      setUserStats(userRes.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics & Reports</h1>
        <p className="text-gray-600">Expense insights and trends</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-600 mt-2">{stats.totalExpenses} claims</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Pending Approvals</h3>
            <BarChart3 className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.pendingCount}</p>
          <p className="text-sm text-gray-600 mt-2">Awaiting review</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Approved This Month</h3>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.approvedCount}</p>
          <p className="text-sm text-green-600 mt-2">Ready for payment</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Active Users</h3>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{userStats.totalUsers}</p>
          <p className="text-sm text-gray-600 mt-2">Employees</p>
        </div>
      </div>

      {/* Category-wise Expenses */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Expenses by Category</h3>
        {stats.categoryStats.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No expense data available</p>
        ) : (
          <div className="space-y-3">
            {stats.categoryStats.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{cat.name}</p>
                  <p className="text-sm text-gray-500">{cat.count} claims</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-blue-600">
                    ₹{cat.amount.toLocaleString('en-IN')}
                  </p>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(cat.amount / stats.totalAmount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Department Stats */}
      {userStats.departmentStats && userStats.departmentStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Users by Department</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userStats.departmentStats.map((dept, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-800">{dept._id || 'No Department'}</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{dept.count}</p>
                <p className="text-sm text-gray-500">employees</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
