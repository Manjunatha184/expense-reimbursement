import { useState, useEffect } from 'react';
import { expenseAPI } from '../../services/api';
import { DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, expensesRes] = await Promise.all([
        expenseAPI.getStats(),
        expenseAPI.getMyExpenses({ limit: 5 })
      ]);
      
      setStats(statsRes.data);
      setRecentExpenses(expensesRes.data.expenses.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    if (!stats || !stats.statusStats) return { total: 0, pending: 0, approved: 0 };
    
    return stats.statusStats.reduce((acc, stat) => {
      acc.total += stat.totalAmount;
      if (stat._id === 'pending') acc.pending = stat.count;
      if (stat._id === 'approved') acc.approved = stat.count;
      return acc;
    }, { total: 0, pending: 0, approved: 0 });
  };

  const totals = calculateTotals();

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your expenses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Claimed</h3>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">₹{totals.total.toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-600 mt-2">All time</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Pending</h3>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{totals.pending}</p>
          <p className="text-sm text-gray-600 mt-2">Awaiting approval</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Approved</h3>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{totals.approved}</p>
          <p className="text-sm text-green-600 mt-2">This month</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Quick Action</h3>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
          <Link
            to="/employee/submit-expense"
            className="mt-2 block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Submit Expense
          </Link>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Expenses</h2>
          <Link to="/employee/my-expenses" className="text-blue-600 hover:underline text-sm">
            View All
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No expenses yet. Submit your first expense!</p>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <div key={expense._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{expense.vendor}</p>
                  <p className="text-sm text-gray-600">{expense.category?.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(expense.date).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    ₹{expense.amount.toLocaleString('en-IN')}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                    expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {expense.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
