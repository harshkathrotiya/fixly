import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import AdminLayout from './AdminLayout';
import Table from './shared/Table';
import Modal from './shared/Modal';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState({
    categoryName: '',
    categoryDescription: '',
    parentCategory: '',
    categoryImage: null
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'delete'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'categoryName', direction: 'asc' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const { token } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, [token, pagination.page, sortConfig]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/categories?page=${pagination.page}&limit=${pagination.limit}&sort=${sortConfig.key}&order=${sortConfig.direction}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCategories(response.data.data || []);
      setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      if (file) {
        setNewCategory({
          ...newCategory,
          [name]: file
        });

        // Create image preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setNewCategory({
        ...newCategory,
        [name]: value
      });
    }
  };

  // Open modal for adding a new category
  const handleAddCategory = () => {
    setNewCategory({
      categoryName: '',
      categoryDescription: '',
      parentCategory: '',
      categoryImage: null
    });
    setImagePreview('');
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Open modal for editing a category
  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setNewCategory({
      categoryName: category.categoryName,
      categoryDescription: category.categoryDescription,
      parentCategory: category.parentCategory?._id || '',
      categoryImage: null
    });
    setImagePreview(category.categoryImage || '');
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Open modal for deleting a category
  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setModalMode('delete');
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setImagePreview('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('categoryName', newCategory.categoryName);
      formData.append('categoryDescription', newCategory.categoryDescription);

      if (newCategory.parentCategory) {
        formData.append('parentCategory', newCategory.parentCategory);
      }

      if (newCategory.categoryImage) {
        formData.append('image', newCategory.categoryImage);
      }

      if (modalMode === 'add') {
        // Create new category
        await axios.post('http://localhost:5000/api/categories', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else if (modalMode === 'edit' && selectedCategory) {
        // Update existing category
        await axios.put(`http://localhost:5000/api/categories/${selectedCategory._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Reset form and close modal
      setNewCategory({
        categoryName: '',
        categoryDescription: '',
        parentCategory: '',
        categoryImage: null
      });
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(`Error ${modalMode === 'add' ? 'creating' : 'updating'} category:`, err);
      setError(`Failed to ${modalMode === 'add' ? 'create' : 'update'} category. Please try again.`);
    }
  };

  // Handle category deletion
  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      await axios.delete(`http://localhost:5000/api/categories/${selectedCategory._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
    }
  };

  // Define table columns
  const columns = [
    {
      header: 'Category',
      accessor: 'categoryName',
      Cell: (category) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={category.categoryImage || 'https://via.placeholder.com/40'}
              alt={category.categoryName}
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {category.categoryName}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Description',
      accessor: 'categoryDescription',
      Cell: (category) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {category.categoryDescription}
        </div>
      )
    },
    {
      header: 'Parent Category',
      accessor: 'parentCategory',
      Cell: (category) => (
        <div className="text-sm text-gray-900">
          {category.parentCategory?.categoryName || 'None'}
        </div>
      )
    },
    {
      header: 'Services',
      accessor: 'serviceCount',
      Cell: (category) => (
        <div className="text-sm text-gray-900">
          {category.serviceCount || 0}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: (category) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditCategory(category)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={() => handleDeleteCategory(category)}
            className="text-red-600 hover:text-red-900"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      )
    }
  ];

  // Render modal content based on mode
  const renderModalContent = () => {
    switch (modalMode) {
      case 'add':
      case 'edit':
        return (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                id="categoryName"
                name="categoryName"
                value={newCategory.categoryName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="categoryDescription"
                name="categoryDescription"
                value={newCategory.categoryDescription}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              ></textarea>
            </div>

            <div className="mb-4">
              <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 mb-1">
                Parent Category (Optional)
              </label>
              <select
                id="parentCategory"
                name="parentCategory"
                value={newCategory.parentCategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">None</option>
                {categories
                  .filter(cat => !selectedCategory || cat._id !== selectedCategory._id)
                  .map(category => (
                    <option key={category._id} value={category._id}>
                      {category.categoryName}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="categoryImage" className="block text-sm font-medium text-gray-700 mb-1">
                Category Image
              </label>
              <input
                type="file"
                id="categoryImage"
                name="categoryImage"
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                accept="image/*"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className="h-24 w-24 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </form>
        );
      case 'delete':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <i className="fas fa-exclamation-triangle text-red-600"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Category</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete the category "{selectedCategory?.categoryName}"?
              This action cannot be undone.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Render modal footer based on mode
  const renderModalFooter = () => {
    switch (modalMode) {
      case 'add':
      case 'edit':
        return (
          <>
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none"
              onClick={handleSubmit}
            >
              {modalMode === 'add' ? 'Add Category' : 'Update Category'}
            </button>
          </>
        );
      case 'delete':
        return (
          <>
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none"
              onClick={handleDelete}
            >
              Delete
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="Category Management">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Service Categories</h2>
          <button
            onClick={handleAddCategory}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          >
            <i className="fas fa-plus mr-2"></i> Add Category
          </button>
        </div>

        <Table
          columns={columns}
          data={categories}
          onSort={handleSort}
          sortConfig={sortConfig}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          emptyMessage="No categories found"
        />
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === 'add' ? 'Add New Category' : modalMode === 'edit' ? 'Edit Category' : 'Delete Category'}
        footer={renderModalFooter()}
      >
        {renderModalContent()}
      </Modal>
    </AdminLayout>
  );
}

export default Categories;