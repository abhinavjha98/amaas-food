import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { FiEdit2, FiCheck, FiX, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [statistics, setStatistics] = useState(null)
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [dishesLoading, setDishesLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [editingDish, setEditingDish] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    producer_id: '',
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchStatistics()
      fetchDishes()
    }
  }, [user, filters, pagination.page])

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/admin/dashboard')
      setStatistics(response.data.statistics)
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
      setMessage('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  const fetchDishes = async () => {
    try {
      setDishesLoading(true)
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.producer_id) params.append('producer_id', filters.producer_id)
      params.append('page', pagination.page)
      params.append('per_page', pagination.per_page)

      const response = await api.get(`/admin/dishes?${params.toString()}`)
      let dishesList = response.data.dishes || []
      
      // Apply search filter client-side
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        dishesList = dishesList.filter(dish => 
          dish.name.toLowerCase().includes(searchLower) ||
          dish.description?.toLowerCase().includes(searchLower) ||
          dish.producer?.kitchen_name?.toLowerCase().includes(searchLower)
        )
      }
      
      setDishes(dishesList)
      setPagination({
        page: response.data.page || 1,
        per_page: response.data.per_page || 20,
        total: response.data.total || 0,
        pages: response.data.pages || 0
      })
    } catch (error) {
      console.error('Failed to fetch dishes:', error)
      setMessage('Failed to load dishes')
    } finally {
      setDishesLoading(false)
    }
  }

  const handleEdit = (dish) => {
    setEditingDish({ ...dish })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    try {
      setMessage('')
      // Prepare data for backend - handle allergens format
      const dishData = { ...editingDish }
      // Convert allergens array to comma-separated string if needed
      if (Array.isArray(dishData.allergens)) {
        dishData.allergens = dishData.allergens.join(',')
      }
      
      const response = await api.put(`/admin/dishes/${editingDish.id}`, dishData)
      setMessage('Dish updated successfully!')
      setShowEditModal(false)
      setEditingDish(null)
      fetchDishes()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to update dish')
    }
  }

  const handleApprove = async (dishId) => {
    if (!window.confirm('Approve this dish and make it available?')) return
    
    try {
      await api.post(`/admin/dishes/${dishId}/approve`)
      setMessage('Dish approved successfully!')
      fetchDishes()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to approve dish')
    }
  }

  const handleDisable = async (dishId) => {
    if (!window.confirm('Disable this dish and make it unavailable?')) return
    
    try {
      await api.post(`/admin/dishes/${dishId}/disable`)
      setMessage('Dish disabled successfully!')
      fetchDishes()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to disable dish')
    }
  }

  const handleDelete = async (dishId) => {
    if (!window.confirm('Are you sure you want to delete this dish? This action cannot be undone.')) return
    
    try {
      await api.delete(`/admin/dishes/${dishId}`)
      setMessage('Dish deleted successfully!')
      fetchDishes()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to delete dish')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  if (!user || user.role !== 'admin') {
    return <div className="text-center py-12">Access denied. Admin only.</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {message && (
        <div className={`mb-4 p-4 rounded ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{statistics.total_users}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Total Producers</h3>
            <p className="text-3xl font-bold text-gray-900">{statistics.total_producers}</p>
            {statistics.pending_producers > 0 && (
              <p className="text-sm text-amber-600 mt-1">{statistics.pending_producers} pending approval</p>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Total Dishes</h3>
            <p className="text-3xl font-bold text-gray-900">{statistics.total_dishes}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900">{statistics.total_orders}</p>
            {statistics.active_orders > 0 && (
              <p className="text-sm text-blue-600 mt-1">{statistics.active_orders} active</p>
            )}
          </div>
        </div>
      )}

      {/* Dish Management Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Dish Management</h2>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search dishes..."
              className="input-field pl-10"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            className="input-field"
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value })
              setPagination({ ...pagination, page: 1 })
            }}
          >
            <option value="all">All Dishes</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <input
            type="number"
            placeholder="Producer ID (optional)"
            className="input-field"
            value={filters.producer_id}
            onChange={(e) => {
              setFilters({ ...filters, producer_id: e.target.value })
              setPagination({ ...pagination, page: 1 })
            }}
          />
          <button
            onClick={fetchDishes}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <FiFilter /> Apply Filters
          </button>
        </div>

        {/* Dishes Table */}
        {dishesLoading ? (
          <div className="text-center py-8">Loading dishes...</div>
        ) : dishes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No dishes found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dish</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dishes.map((dish) => (
                    <tr key={dish.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'}
                            alt={dish.name}
                            className="h-12 w-12 rounded object-cover mr-3 bg-gray-200"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
                            }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{dish.name}</div>
                            <div className="text-sm text-gray-500">{dish.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dish.producer?.kitchen_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">ID: {dish.producer_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">£{dish.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          dish.is_available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {dish.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(dish)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          {dish.is_available ? (
                            <button
                              onClick={() => handleDisable(dish.id)}
                              className="text-amber-600 hover:text-amber-900"
                              title="Disable"
                            >
                              <FiX />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApprove(dish.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <FiCheck />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(dish.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.per_page) + 1} to{' '}
                  {Math.min(pagination.page * pagination.per_page, pagination.total)} of{' '}
                  {pagination.total} dishes
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.pages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Edit Dish</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={editingDish.name || ''}
                  onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="input-field w-full"
                  rows="3"
                  value={editingDish.description || ''}
                  onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field w-full"
                    value={editingDish.price || ''}
                    onChange={(e) => setEditingDish({ ...editingDish, price: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="input-field w-full"
                    value={editingDish.category || ''}
                    onChange={(e) => setEditingDish({ ...editingDish, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Sweets">Sweets</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Type</label>
                  <select
                    className="input-field w-full"
                    value={editingDish.dietary_type || ''}
                    onChange={(e) => setEditingDish({ ...editingDish, dietary_type: e.target.value })}
                  >
                    <option value="">Select type</option>
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spice Level</label>
                  <select
                    className="input-field w-full"
                    value={editingDish.spice_level || ''}
                    onChange={(e) => setEditingDish({ ...editingDish, spice_level: e.target.value })}
                  >
                    <option value="">Select level</option>
                    <option value="mild">Mild</option>
                    <option value="medium">Medium</option>
                    <option value="hot">Hot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  className="input-field w-full"
                  value={editingDish.image_url || ''}
                  onChange={(e) => setEditingDish({ ...editingDish, image_url: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                <textarea
                  className="input-field w-full"
                  rows="2"
                  value={editingDish.ingredients || ''}
                  onChange={(e) => setEditingDish({ ...editingDish, ingredients: e.target.value })}
                  placeholder="Enter ingredients (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergens</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={
                    Array.isArray(editingDish.allergens) 
                      ? editingDish.allergens.join(', ') 
                      : (typeof editingDish.allergens === 'string' ? editingDish.allergens.replace(/[\[\]"]/g, '').replace(/,/g, ', ') : '')
                  }
                  onChange={(e) => {
                    // Store as comma-separated string for backend
                    const allergens = e.target.value
                    setEditingDish({ ...editingDish, allergens })
                  }}
                  placeholder="Enter allergens (comma-separated, e.g., Nuts, Dairy, Gluten)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Orders Per Day</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={editingDish.max_orders_per_day || ''}
                    onChange={(e) => setEditingDish({ ...editingDish, max_orders_per_day: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={editingDish.display_order || ''}
                    onChange={(e) => setEditingDish({ ...editingDish, display_order: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_available"
                  className="mr-2"
                  checked={editingDish.is_available || false}
                  onChange={(e) => setEditingDish({ ...editingDish, is_available: e.target.checked })}
                />
                <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
                  Available for ordering
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingDish(null)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
