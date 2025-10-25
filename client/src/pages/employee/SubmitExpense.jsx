import { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { categoryAPI, expenseAPI, policyAPI } from '../../services/api';

const SubmitExpense = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: '',
    vendor: '',
    description: '',
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [policyWarnings, setPolicyWarnings] = useState([]);
  const [complianceCheck, setComplianceCheck] = useState(null);
  const [showComplianceModal, setShowComplianceModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data?.categories || response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    if (name === 'amount' || name === 'category') {
      checkBasicCompliance(next.amount, next.category);
    }
  };

  const checkBasicCompliance = (amount, categoryId) => {
    const warnings = [];
    const selectedCategory = categories.find((c) => c._id === categoryId);
    if (selectedCategory && amount) {
      const numAmount = parseFloat(amount);
      if (selectedCategory.perDayLimit && numAmount > selectedCategory.perDayLimit) {
        warnings.push(`Amount exceeds daily limit of ₹${selectedCategory.perDayLimit}`);
      }
      if (selectedCategory.requireReceipt && !receiptFile) {
        warnings.push('Receipt is required for this category');
      }
      if (selectedCategory.approvalThreshold && numAmount >= selectedCategory.approvalThreshold) {
        warnings.push(`Amount requires multi-level approval (threshold: ₹${selectedCategory.approvalThreshold})`);
      }
    }
    setPolicyWarnings(warnings);
  };

  const checkFullCompliance = async () => {
    if (!formData.category || !formData.amount || !formData.vendor) {
      alert('Please fill in category, amount, and vendor first');
      return;
    }
    try {
      const response = await policyAPI.checkCompliance({
        categoryId: formData.category,
        amount: Number(formData.amount),
        vendor: formData.vendor,
        date: formData.date || new Date().toISOString().split('T')[0],
      });
      setComplianceCheck(response.data);
      setShowComplianceModal(true);
    } catch (err) {
      console.error('Error checking compliance:', err);
      alert('Failed to check compliance. You can still submit the expense.');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setReceiptPreview(reader.result);
    reader.readAsDataURL(file);
    checkBasicCompliance(formData.amount, formData.category);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.category && formData.amount && formData.vendor) {
      try {
        const complianceResponse = await policyAPI.checkCompliance({
          categoryId: formData.category,
          amount: Number(formData.amount),
          vendor: formData.vendor,
          date: formData.date || new Date().toISOString().split('T')[0],
        });
        if (!complianceResponse.data.isCompliant) {
          setComplianceCheck(complianceResponse.data);
          setShowComplianceModal(true);
          return;
        }
      } catch (err) {
        console.warn('Compliance check failed; continuing:', err?.response?.data || err.message);
      }
    }
    await submitExpense();
  };

  const submitExpense = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    setSuccessMessage('');
    try {
      const submitData = new FormData();
      submitData.append('category', formData.category);
      submitData.append('amount', formData.amount);
      submitData.append('date', formData.date);
      submitData.append('vendor', formData.vendor);
      submitData.append('description', formData.description);
      if (receiptFile) submitData.append('receipt', receiptFile);

      const response = await expenseAPI.create(submitData);
      const expenseId = response.data?.expense?.expenseId || 'ID-PENDING';

      setSuccess(true);
      setSuccessMessage(`Expense submitted successfully! Reference ID: ${expenseId}`);

      setFormData({ category: '', amount: '', date: '', vendor: '', description: '' });
      setReceiptFile(null);
      setReceiptPreview(null);
      setPolicyWarnings([]);
      setShowComplianceModal(false);

      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage('');
      }, 8000);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Failed to submit expense');
    } finally {
      setLoading(false);
    }
  };

  const handleForceSubmit = async () => {
    setShowComplianceModal(false);
    await submitExpense();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Submit Expense</h1>
        <p className="text-gray-600">Upload receipt and fill in expense details</p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
            <div>
              <p className="text-green-800 font-semibold">{successMessage}</p>
              <p className="text-green-700 text-sm mt-1">
                Track your expense in{' '}
                <a href="/employee/my-expenses" className="underline font-medium">
                  My Expenses
                </a>{' '}
                page.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {policyWarnings.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Policy Warnings:</p>
              <ul className="list-disc list-inside space-y-1">
                {policyWarnings.map((warning, idx) => (
                  <li key={idx} className="text-sm">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Receipt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Receipt / Bill</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-blue-500 transition">
              <input type="file" id="receipt" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
              <label htmlFor="receipt" className="cursor-pointer block">
                {receiptPreview ? (
                  <div className="space-y-3">
                    <img src={receiptPreview} alt="Receipt preview" className="max-h-48 mx-auto rounded" />
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptFile(null);
                        setReceiptPreview(null);
                      }}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-1">Tap to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG, PDF up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Category (mobile-safe) */}
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expense Category <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full overflow-hidden rounded-lg border border-gray-300 focus-ring select-wrap">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="select-reset block w-full max-w-full appearance-none bg-white px-4 py-3 pr-10 text-sm leading-5 outline-none truncate"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id} className="whitespace-normal">
                    {cat.name} {typeof cat.budgetLimit === 'number' ? `- Budget: ₹${cat.budgetLimit}` : ''}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
            </div>
                      </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              inputMode="decimal"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expense Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor / Merchant <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Uber, Hotel Taj, Amazon"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Provide details about the expense..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="sm:flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Expense'
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ category: '', amount: '', date: '', vendor: '', description: '' });
                setReceiptFile(null);
                setReceiptPreview(null);
                setPolicyWarnings([]);
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Compliance Modal */}
      {showComplianceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Compliance Check</h3>
            {complianceCheck?.isCompliant ? (
              <p className="text-green-700">This expense appears compliant with current policies.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-red-700 font-medium">Potential policy violations:</p>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {(complianceCheck?.issues || []).map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowComplianceModal(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Close
              </button>
              {!complianceCheck?.isCompliant && (
                <button onClick={handleForceSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Submit Anyway
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitExpense;
