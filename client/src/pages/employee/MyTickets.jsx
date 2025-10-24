import { useState, useEffect } from 'react';
import { ticketAPI } from '../../services/api';
import { MessageSquare, RefreshCw, Eye } from 'lucide-react';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await ticketAPI.getMyTickets();
      setTickets(response.data?.tickets || []);
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleViewTicket = async (ticket) => {
    try {
      const response = await ticketAPI.getById(ticket._id);
      setSelectedTicket(response.data?.ticket || ticket);
      setShowModal(true);
    } catch (err) {
      console.error('Error loading ticket:', err);
      alert('Failed to load ticket details');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {String(status || '').toUpperCase().replace('_', ' ')}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const styles = {
      rejection_dispute: 'bg-red-100 text-red-800',
      payment_not_received: 'bg-orange-100 text-orange-800',
      general_query: 'bg-blue-100 text-blue-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[category] || 'bg-gray-100 text-gray-800'}`}>
        {String(category || 'other').replace('_', ' ').toUpperCase()}
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
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Support Tickets</h1>
          <p className="text-gray-600">Track your support requests and responses</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Tickets</h3>
          <p className="text-3xl font-bold text-gray-800">{tickets.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Open</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {tickets.filter((t) => t.status === 'open').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">In Progress</h3>
          <p className="text-3xl font-bold text-blue-600">
            {tickets.filter((t) => t.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Resolved</h3>
          <p className="text-3xl font-bold text-green-600">
            {tickets.filter((t) => t.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No tickets yet</p>
            <p className="text-gray-400 text-sm">Raise a ticket to get support</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Replies</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-blue-600 font-semibold">
                      {ticket.ticketId}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[320px] truncate" title={ticket.subject}>
                      {ticket.subject}
                    </td>
                    <td className="px-6 py-4">{getCategoryBadge(ticket.category)}</td>
                    <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ticket.replies?.length || 0} replies
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewTicket(ticket)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
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

      {/* Ticket Detail Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Ticket {selectedTicket.ticketId}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Ticket Info */}
            <div className="overflow-x-auto mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 min-w-[560px]">
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold">{String(selectedTicket.category || '').replace('_', ' ') || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Related Expense</p>
                  <p className="font-semibold">{selectedTicket.expenseId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-semibold">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Subject</h3>
              <p className="text-gray-700">{selectedTicket.subject}</p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
            </div>

            {/* Replies */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Replies ({selectedTicket.replies?.length || 0})
              </h3>

              {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
                <div className="space-y-3">
                  {selectedTicket.replies.map((reply, idx) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-800">
                          {reply.userId?.name || 'Support Team'}
                          <span className="ml-2 text-xs font-normal text-blue-600">
                            ({reply.userId?.role || 'Admin'})
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(reply.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-gray-700">{reply.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No replies yet. Admin will respond soon.</p>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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

export default MyTickets;
