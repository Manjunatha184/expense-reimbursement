import { useState, useEffect } from 'react';
import { policyAPI } from '../../services/api';
import { categoryAPI } from '../../services/api';
import { Shield, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    rules: {
      maxAmount: '',
      requiresReceipt: true,
      requiresApprovalAbove: 5000,
      allowedVendors: '',
      blockedVendors: '',
      maxPerDay: '',
      maxPerMonth: '',
      requiresManagerApproval: true
    },
    isActive: true
  });

  useEffect(() => {
    fetchPolicies();
    fetchCategories();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await policyAPI.getAllPolicies();
      setPolicies(response.data.policies);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories();
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      category: formData.category || null,
      rules: {
        ...formData.rules,
        maxAmount: formData.rules.maxAmount ? Number(formData.rules.maxAmount) : null,
        maxPerDay: formData.rules.maxPerDay ? Number(formData.rules.maxPerDay) : null,
        maxPerMonth: formData.rules.maxPerMonth ? Number(formData.rules.maxPerMonth) : null,
        requiresApprovalAbove: Number(formData.rules.requiresApprovalAbove),
        allowedVendors: formData.rules.allowedVendors ? formData.rules.allowedVendors.split(',').map(v => v.trim()) : [],
        blockedVendors: formData.rules.blockedVendors ? formData.rules.blockedVendors.split(',').map(v => v.trim()) : []
      }
    };

    try {
      if (editingPolicy) {
        await policyAPI.updatePolicy(editingPolicy._id, payload);
        alert('✅ Policy updated successfully!');
      } else {
        await policyAPI.createPolicy(payload);
        alert('✅ Policy created successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchPolicies();
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Failed to save policy');
    }
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description,
      category: policy.category?._id || '',
      rules: {
        maxAmount: policy.rules.maxAmount || '',
        requiresReceipt: policy.rules.requiresReceipt,
        requiresApprovalAbove: policy.rules.requiresApprovalAbove,
        allowedVendors: policy.rules.allowedVendors.join(', '),
        blockedVendors: policy.rules.blockedVendors.join(', '),
        maxPerDay: policy.rules.maxPerDay || '',
        maxPerMonth: policy.rules.maxPerMonth || '',
        requiresManagerApproval: policy.rules.requiresManagerApproval
      },
      isActive: policy.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    
    try {
      await policyAPI.deletePolicy(id);
      alert('✅ Policy deleted!');
      fetchPolicies();
    } catch (err) {
      alert('❌ Failed to delete policy');
    }
  };

  const resetForm = () => {
    setEditingPolicy(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      rules: {
        maxAmount: '',
        requiresReceipt: true,
        requiresApprovalAbove: 5000,
        allowedVendors: '',
        blockedVendors: '',
        maxPerDay: '',
        maxPerMonth: '',
        requiresManagerApproval: true
      },
      isActive: true
    });
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Policy Management</h1>
          <p className="text-gray-600">Configure expense policies and compliance rules</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Create Policy
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Policies</h3>
          <p className="text-3xl font-bold text-gray-800">{policies.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Active</h3>
          <p className="text-3xl font-bold text-green-600">
            {policies.filter(p => p.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Inactive</h3>
          <p className="text-3xl font-bold text-gray-600">
            {policies.filter(p => !p.isActive).length}
          </p>
        </div>
      </div>

      {/* Policies Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {policies.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No policies configured</p>
            <p className="text-gray-400 text-sm">Create your first policy to enforce compliance</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {policies.map((policy) => (
                <tr key={policy._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-blue-600 font-semibold">
                    {policy.policyId}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{policy.name}</p>
                      <p className="text-xs text-gray-500">{policy.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {policy.category?.name || 'All Categories'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {policy.rules.maxAmount ? `₹${policy.rules.maxAmount}` : 'No Limit'}
                  </td>
                  <td className="px-6 py-4">
                    {policy.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(policy)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(policy._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Policy Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Basic Info */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Policy Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Rules */}
              <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">Policy Rules</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Amount (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.rules.maxAmount}
                    onChange={(e) => setFormData({...formData, rules: {...formData.rules, maxAmount: e.target.value}})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="No limit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requires Approval Above
                  </label>
                  <input
                    type="number"
                    value={formData.rules.requiresApprovalAbove}
                    onChange={(e) => setFormData({...formData, rules: {...formData.rules, requiresApprovalAbove: e.target.value}})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Per Day (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.rules.maxPerDay}
                    onChange={(e) => setFormData({...formData, rules: {...formData.rules, maxPerDay: e.target.value}})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="No limit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Per Month (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.rules.maxPerMonth}
                    onChange={(e) => setFormData({...formData, rules: {...formData.rules, maxPerMonth: e.target.value}})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="No limit"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Vendors (comma-separated, optional)
                </label>
                <input
                  type="text"
                  value={formData.rules.allowedVendors}
                  onChange={(e) => setFormData({...formData, rules: {...formData.rules, allowedVendors: e.target.value}})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Amazon, Flipkart, Swiggy"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blocked Vendors (comma-separated, optional)
                </label>
                <input
                  type="text"
                  value={formData.rules.blockedVendors}
                  onChange={(e) => setFormData({...formData, rules: {...formData.rules, blockedVendors: e.target.value}})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Vendor1, Vendor2"
                />
              </div>

              <div className="mb-4 flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.rules.requiresReceipt}
                    onChange={(e) => setFormData({...formData, rules: {...formData.rules, requiresReceipt: e.target.checked}})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Requires Receipt</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.rules.requiresManagerApproval}
                    onChange={(e) => setFormData({...formData, rules: {...formData.rules, requiresManagerApproval: e.target.checked}})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Requires Manager Approval</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                >
                  {editingPolicy ? 'Update Policy' : 'Create Policy'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;
