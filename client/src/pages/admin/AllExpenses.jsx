import { useState, useEffect } from 'react';
import { expenseAPI, categoryAPI } from '../../services/api';
import { Eye, CheckCircle, XCircle, DollarSign } from 'lucide-react';

const AllExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [paymentData, setPaymentData] = useState({
    paymentMethod: '',
    paymentReference: '',
    paymentProof: null
  });
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await expenseAPI.getAllExpenses();
      setExpenses(response.data.expenses || response.data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll?.() || await categoryAPI.getCategories?.();
      setCategories(response?.data?.categories || response?.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleApprove = async (expenseId) => {
    if (!window.confirm('Are you sure you want to approve this expense?')) return;
    setActionLoading(true);
    try {
      await expenseAPI.approve(expenseId, { comments: 'Approved by admin' });
      alert('✅ Expense approved successfully!');
      await fetchExpenses();
      setShowModal(false);
    } catch (err) {
      alert('❌ Failed to approve expense: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (expenseId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    setActionLoading(true);
    try {
      await expenseAPI.reject(expenseId, { reason });
      alert('❌ Expense rejected');
      await fetchExpenses();
      setShowModal(false);
    } catch (err) {
      alert('Failed to reject expense: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentProofChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentData(prev => ({ ...prev, paymentProof: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPaymentProofPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentData.paymentMethod) {
      alert('Please select payment method');
      return;
    }
    setActionLoading(true);
    try {
      const form = new FormData();
      form.append('paymentMethod', paymentData.paymentMethod);
      form.append('paymentReference', paymentData.paymentReference || '');
      if (paymentData.paymentProof) form.append('paymentProof', paymentData.paymentProof);

      await expenseAPI.processPayment(selectedExpense._id, form);

      alert('✅ Payment processed successfully!');
      setPaymentData({ paymentMethod: '', paymentReference: '', paymentProof: null });
      setPaymentProofPreview(null);
      await fetchExpenses();
      setShowPaymentModal(false);
      setShowModal(false);
    } catch (err) {
      console.error('Payment error:', err);
      alert('❌ Failed to process payment: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || expense.category?._id === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const getStatusCount = (status) => expenses.filter((exp) => exp.status === status).length;

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {String(status || '').toUpperCase()}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">All Expenses</h1>
        <p className="text-gray-600">Review and approve employee expenses</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md mb-6 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All', count: expenses.length },
                { value: 'pending', label: 'Pending', count: getStatusCount('pending') },
                { value: 'approved', label: 'Approved', count: getStatusCount('approved') },
                { value: 'rejected', label: 'Rejected', count: getStatusCount('rejected') },
                { value: 'paid', label: 'Paid', count: getStatusCount('paid') },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    statusFilter === status.value ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.label}
                  {status.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${statusFilter === status.value ? 'bg-blue-700' : 'bg-gray-300'}`}>
                      {status.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {(statusFilter !== 'all' || categoryFilter !== 'all') && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active Filters:</span>
            {statusFilter !== 'all' && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('all')} className="hover:text-blue-900">×</button>
              </span>
            )}
            {categoryFilter !== 'all' && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
                Category: {categories.find((c) => c._id === categoryFilter)?.name}
                <button onClick={() => setCategoryFilter('all')} className="hover:text-green-900">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing <span className="font-semibold">{filteredExpenses.length}</span> of{' '}
        <span className="font-semibold">{expenses.length}</span> expenses
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No expenses found matching your filters</p>
            <button
              onClick={() => {
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="mt-4 text-blue-600 hover:text-blue-800 underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{expense.employeeId?.name}</p>
                        <p className="text-xs text-gray-500">{expense.employeeId?.department}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(expense.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{expense.category?.name}</td>
                    <td className="px-6 py-4 text-sm">{expense.vendor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      ₹{Number(expense.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(expense.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedExpense(expense);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Detail Modal with sticky footer */}
      {showModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Expense Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* your existing details content unchanged */}
              {/* keep receipt, payment details, rejection block */}
            </div>

            <div className="p-6 border-t flex gap-3">
              {selectedExpense.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(selectedExpense._id)}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedExpense._id)}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                </>
              )}
              {selectedExpense.status === 'approved' && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={actionLoading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-5 h-5" />
                  Process Payment
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Process Payment</h2>
              <p className="text-gray-600 mb-6">
                Processing payment of{' '}
                <span className="font-bold text-blue-600">
                  ₹{Number(selectedExpense.amount).toLocaleString('en-IN')}
                </span>{' '}
                to {selectedExpense.employeeId?.name}
              </p>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select method</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Check">Check</option>
                    <option value="Cash">Cash</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID / Reference Number</label>
                  <input
                    type="text"
                    value={paymentData.paymentReference}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentReference: e.target.value })}
                    placeholder="e.g., TXN123456789"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Proof (optional)</label>
                  <input type="file" accept="image/*,application/pdf" onChange={handlePaymentProofChange} className="w-full" />
                  {paymentProofPreview && (
                    <img src={paymentProofPreview} alt="Proof preview" className="mt-2 max-h-32 rounded border" />
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Confirm Payment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentData({ paymentMethod: '', paymentReference: '', paymentProof: null });
                      setPaymentProofPreview(null);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AllExpenses;
