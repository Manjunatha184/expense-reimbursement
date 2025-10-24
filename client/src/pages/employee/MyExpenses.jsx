import { useState, useEffect } from 'react';
import { expenseAPI } from '../../services/api';
import { Copy } from 'lucide-react';

const MyExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getMyExpenses();
      setExpenses(response.data.expenses);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Expenses</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No expenses found. Submit your first expense!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expense ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 font-semibold">{expense.expenseId}</span>
                        <button
                          onClick={() => copyToClipboard(expense.expenseId)}
                          className="text-gray-400 hover:text-blue-600"
                          title="Copy ID"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">{expense.category?.name}</td>
                    <td className="px-6 py-4 text-sm">{expense.vendor}</td>
                    <td className="px-6 py-4 text-sm font-semibold">₹{expense.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">{getStatusBadge(expense.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyExpenses;
