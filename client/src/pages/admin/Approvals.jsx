import { useState, useEffect } from 'react';
import { approvalAPI } from '../../services/api';
import { CheckCircle, XCircle, Eye, Clock, User, DollarSign, Calendar } from 'lucide-react';

const Approvals = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [comments, setComments] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await approvalAPI.getPendingApprovals();
      setExpenses(response.data.expenses);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await approvalAPI.approveAtLevel(selectedExpense._id, { comments });
      alert('✅ Expense approved at current level!');
      setShowModal(false);
      setComments('');
      fetchPendingApprovals();
    } catch (err) {
      console.error('Error:', err);
      alert(err.response?.data?.message || '❌ Failed to approve');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setSubmitting(true);
    try {
      await approvalAPI.rejectAtLevel(selectedExpense._id, { reason });
      alert('✅ Expense rejected!');
      setShowModal(false);
      setReason('');
      fetchPendingApprovals();
    } catch (err) {
      console.error('Error:', err);
      alert(err.response?.data?.message || '❌ Failed to reject');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (expense, type) => {
    setSelectedExpense(expense);
    setActionType(type);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      pending_manager: 'bg-blue-100 text-blue-800',
      pending_finance: 'bg-purple-100 text-purple-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status.toUpperCase().replace('_', ' ')}
      </span>
    );
  };

  const getLevelBadge = (level) => {
    const styles = {
      manager: 'bg-blue-100 text-blue-800',
      finance: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[level]}`}>
        {level.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pending Approvals</h1>
        <p className="text-gray-600">Review and approve expenses at your level</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Approvals</h3>
          <p className="text-3xl font-bold text-blue-600">{expenses.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Amount</h3>
          <p className="text-3xl font-bold text-gray-800">
            ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Awaiting Action</h3>
          <p className="text-3xl font-bold text-orange-600">
            {expenses.filter(e => e.status.startsWith('pending')).length}
          </p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No pending approvals</p>
            <p className="text-gray-400 text-sm">All expenses have been reviewed</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expense ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-blue-600 font-semibold">
                    {expense.expenseId}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{expense.employeeId?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ₹{expense.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {expense.category?.name}
                  </td>
                  <td className="px-6 py-4">
                    {getLevelBadge(expense.currentApprovalLevel)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(expense.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {new Date(expense.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(expense, 'approve')}
                        className="text-green-600 hover:text-green-800"
                        title="Approve"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openModal(expense, 'reject')}
                        className="text-red-600 hover:text-red-800"
                        title="Reject"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openModal(expense, 'view')}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Action Modal */}
      {showModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {actionType === 'approve' ? 'Approve Expense' : actionType === 'reject' ? 'Reject Expense' : 'Expense Details'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Expense Details */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Expense ID</p>
                  <p className="font-mono font-semibold text-blue-600">{selectedExpense.expenseId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employee</p>
                  <p className="font-semibold">{selectedExpense.employeeId?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold text-lg">₹{selectedExpense.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold">{selectedExpense.category?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vendor</p>
                  <p className="font-semibold">{selectedExpense.vendor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{new Date(selectedExpense.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-700">{selectedExpense.description}</p>
            </div>

            {/* Workflow Progress */}
            {selectedExpense.approvalWorkflow && selectedExpense.approvalWorkflow.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Approval Workflow</h3>
                <div className="space-y-2">
                  {selectedExpense.approvalWorkflow.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.status === 'approved' ? 'bg-green-100 text-green-600' :
                        step.status === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {step.status === 'approved' ? <CheckCircle className="w-5 h-5" /> :
                         step.status === 'rejected' ? <XCircle className="w-5 h-5" /> :
                         <Clock className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {step.level.charAt(0).toUpperCase() + step.level.slice(1)} Level
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                        </p>
                        {step.comments && (
                          <p className="text-sm text-gray-500 mt-1">Comment: {step.comments}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Forms */}
            {actionType === 'approve' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any comments..."
                />
              </div>
            )}

            {actionType === 'reject' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Provide reason for rejection..."
                  required
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {actionType === 'approve' && (
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Approving...' : 'Approve Expense'}
                </button>
              )}
              
              {actionType === 'reject' && (
                <button
                  onClick={handleReject}
                  disabled={submitting}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? 'Rejecting...' : 'Reject Expense'}
                </button>
              )}
              
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
