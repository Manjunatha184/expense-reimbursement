import { useState, useEffect } from 'react';
import { ticketAPI } from '../../services/api';
import { MessageSquare, User, FileText } from 'lucide-react';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await ticketAPI.getAllTickets();
      setTickets(response.data.tickets || response.data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
    setReplyMessage('');
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) return;
    try {
      await ticketAPI.addReply(selectedTicket._id, { message: replyMessage });
      alert('✅ Reply sent!');
      setReplyMessage('');
      fetchTickets();
      setShowModal(false);
    } catch (err) {
      alert('❌ Failed to send reply');
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await ticketAPI.updateStatus(ticketId, { status: newStatus });
      alert(`✅ Ticket status updated to ${newStatus}`);
      fetchTickets();
      setShowModal(false);
    } catch (err) {
      alert('❌ Failed to update status');
    }
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
        {String(category || '').replace('_', ' ').toUpperCase()}
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Support Tickets</h1>
        <p className="text-gray-600">Manage employee support requests</p>
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
            {tickets.filter(t => t.status === 'open').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">In Progress</h3>
          <p className="text-3xl font-bold text-blue-600">
            {tickets.filter(t => t.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Resolved</h3>
          <p className="text-3xl font-bold text-green-600">
            {tickets.filter(t => t.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tickets yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expense ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-blue-600 font-semibold">{ticket.ticketId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{ticket.employeeId?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{ticket.subject}</td>
                    <td className="px-6 py-4">
                      {ticket.expenseId ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-blue-100 text-blue-800">
                          <FileText className="w-3 h-3 mr-1" />
                          {ticket.expenseId}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getCategoryBadge(ticket.category)}</td>
                    <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewTicket(ticket)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View & Reply
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
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Ticket {selectedTicket.ticketId}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ✕
              </button>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Left info column */}
                <div className="lg:col-span-1 p-6 border-b lg:border-b-0 lg:border-r min-w-0">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Employee</p>
                      <p className="font-semibold break-words">{selectedTicket.employeeId?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-semibold break-words">
                        {String(selectedTicket.category || '').replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Related Expense</p>
                      {selectedTicket.expenseId ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-blue-100 text-blue-800 break-all">
                          <FileText className="w-3 h-3 mr-1" />
                          {selectedTicket.expenseId}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right thread and reply form */}
                <div className="lg:col-span-2 p-6">
                  {/* Subject */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Subject</h3>
                    <p className="text-gray-700 break-words">{selectedTicket.subject}</p>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap break-words">{selectedTicket.description}</p>
                  </div>

                  {/* Replies */}
                  {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3">
                        Replies ({selectedTicket.replies.length})
                      </h3>
                      <div className="space-y-3">
                        {selectedTicket.replies.map((reply, idx) => (
                          <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                              <p className="text-sm font-semibold text-gray-800 break-words">
                                {reply.userId?.name || 'Admin'}
                                <span className="ml-2 text-xs font-normal text-blue-600">
                                  ({reply.userId?.role || 'Admin'})
                                </span>
                              </p>
                              <p className="text-xs text-gray-500 whitespace-nowrap">
                                {new Date(reply.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <p className="text-gray-700 break-words">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reply Box */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Reply</label>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Type your response..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky footer with action buttons */}
            <div className="px-6 py-4 border-t shrink-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReply}
                  disabled={!replyMessage.trim()}
                  className="sm:flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Send Reply
                </button>

                {selectedTicket.status !== 'resolved' && (
                  <button
                    onClick={() => handleStatusChange(selectedTicket._id, 'resolved')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Mark Resolved
                  </button>
                )}

                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Tickets;
