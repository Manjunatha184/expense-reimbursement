import { useState } from 'react';
import { ticketAPI } from '../../services/api';
import { MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

const RaiseTicket = () => {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general_query',
    description: '',
    expenseId: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await ticketAPI.create(formData);
      setSuccess(true);
      setFormData({ subject: '', category: 'general_query', description: '', expenseId: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Raise Support Ticket</h1>
        <p className="text-gray-600">Need help? Dispute a rejection or report an issue</p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>Ticket created successfully! Admin will respond soon.</span>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Brief summary of your issue"
            />
          </div>

          {/* Category (mobile-safe wrapper) */}
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full overflow-hidden rounded-lg border border-gray-300 focus-ring select-wrap">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="select-reset block w-full max-w-full appearance-none bg-white px-4 py-3 pr-10 text-sm leading-5 outline-none truncate"
              >
                <option value="general_query">General Query</option>
                <option value="rejection_dispute">Dispute Rejection</option>
                <option value="payment_not_received">Payment Not Received</option>
                <option value="other">Other</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
            </div>
           </div>

          {/* Related Expense ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Related Expense ID</label>
            <input
              type="text"
              value={formData.expenseId}
              onChange={(e) => setFormData({ ...formData, expenseId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter expense ID (EXP001)"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Explain your issue in detail..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
            <button
              type="button"
              onClick={() => setFormData({ subject: '', category: 'general_query', description: '', expenseId: '' })}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseTicket;
