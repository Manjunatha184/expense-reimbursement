import { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';
import { Plus, Edit, Trash2, Folder } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budgetLimit: '',
    perDayLimit: '',
    approvalThreshold: '',
    requireReceipt: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, formData);
        alert('Category updated successfully!');
      } else {
        await categoryAPI.create(formData);
        alert('Category created successfully!');
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        budgetLimit: '',
        perDayLimit: '',
        approvalThreshold: '',
        requireReceipt: true,
      });
      fetchCategories();
    } catch (err) {
      alert('Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      budgetLimit: category.budgetLimit,
      perDayLimit: category.perDayLimit,
      approvalThreshold: category.approvalThreshold,
      requireReceipt: category.requireReceipt,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryAPI.delete(id);
      alert('Category deleted successfully!');
      fetchCategories();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Categories</h1>
          <p className="text-gray-600">Configure expense categories and policies</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({
              name: '',
              description: '',
              budgetLimit: '',
              perDayLimit: '',
              approvalThreshold: '',
              requireReceipt: true,
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No categories found. Create your first category!</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Folder className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget Limit:</span>
                  <span className="font-semibold text-gray-900">₹{category.budgetLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Per Day Limit:</span>
                  <span className="font-semibold text-gray-900">₹{category.perDayLimit?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Approval Threshold:</span>
                  <span className="font-semibold text-gray-900">₹{category.approvalThreshold.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Receipt Required:</span>
                  <span className={`font-semibold ${category.requireReceipt ? 'text-green-600' : 'text-gray-500'}`}>
                    {category.requireReceipt ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Travel, Meals"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Limit (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.budgetLimit}
                    onChange={(e) => setFormData({ ...formData, budgetLimit: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Per Day Limit (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.perDayLimit}
                    onChange={(e) => setFormData({ ...formData, perDayLimit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Threshold (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.approvalThreshold}
                    onChange={(e) => setFormData({ ...formData, approvalThreshold: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="requireReceipt"
                    checked={formData.requireReceipt}
                    onChange={(e) => setFormData({ ...formData, requireReceipt: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="requireReceipt" className="text-sm font-medium text-gray-700">
                    Require Receipt
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingCategory ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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

export default Categories;
