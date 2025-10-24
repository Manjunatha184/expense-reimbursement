import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expenseAPI, approvalAPI } from '../../services/api';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Users, 
  XCircle, 
  CreditCard,
  CheckSquare,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingCount: 0,
    approvedCount: 0,
    paidCount: 0,
    rejectedCount: 0,
    totalAmount: 0,
  });
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await expenseAPI.getAllExpenses();
      const expenses = response.data.expenses;

      // ONLY approved and paid expenses count toward total amount
      const totalAmount = expenses
        .filter(exp => exp.status === 'approved' || exp.status === 'paid')
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      const pendingCount = expenses.filter(exp => 
        exp.status === 'pending' || 
        exp.status === 'pending_manager' || 
        exp.status === 'pending_finance'
      ).length;
      
      const approvedCount = expenses.filter(exp => exp.status === 'approved').length;
      const paidCount = expenses.filter(exp => exp.status === 'paid').length;
      const rejectedCount = expenses.filter(exp => exp.status === 'rejected').length;

      setStats({
        totalExpenses: expenses.length,
        pendingCount,
        approvedCount,
        paidCount,
        rejectedCount,
        totalAmount,
      });

      // Fetch pending approvals
      try {
        const approvalsRes = await approvalAPI.getPendingApprovals();
        setPendingApprovals(approvalsRes.data.expenses.length);
      } catch (err) {
        console.error('Approvals fetch error:', err);
        setPendingApprovals(0);
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Dashboard</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Pending Approvals Alert */}
      {pendingApprovals > 0 && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            <div className="flex-1">
              <p className="font-semibold text-orange-900">
                You have {pendingApprovals} expense{pendingApprovals > 1 ? 's' : ''} waiting for approval
              </p>
              <p className="text-sm text-orange-700 mt-1">
                Review and approve pending expenses to keep workflow moving
              </p>
            </div>
            <Link
              to="/admin/approvals"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Review Now
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Total Approved Amount */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Approved</h3>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            ₹{stats.totalAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Approved + Paid only
          </p>
        </div>

      
        {/* Pending */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Pending</h3>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.pendingCount}</p>
          <p className="text-sm text-yellow-600 mt-2">Awaiting approval</p>
        </div>

        {/* Approved */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Approved</h3>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.approvedCount}</p>
          <p className="text-sm text-green-600 mt-2">Ready for payment</p>
        </div>

        {/* Paid */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Paid</h3>
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.paidCount}</p>
          <p className="text-sm text-blue-600 mt-2">Payment completed</p>
        </div>

        {/* Rejected */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Rejected</h3>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.rejectedCount}</p>
          <p className="text-sm text-red-600 mt-2">Not approved</p>
        </div>

        {/* Total Claims */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Claims</h3>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalExpenses}</p>
          <p className="text-sm text-gray-600 mt-2">All statuses</p>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
