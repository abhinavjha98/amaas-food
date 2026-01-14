import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { FiPackage, FiDollarSign, FiStar, FiEdit2, FiTrash2, FiPlus, FiCheck, FiX, FiClock, FiTruck, FiCheckCircle } from 'react-icons/fi'

export default function ProducerDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [producer, setProducer] = useState(null)
  const [orders, setOrders] = useState([])
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [showDishModal, setShowDishModal] = useState(false)
  const [editingDish, setEditingDish] = useState(null)
  const [dishForm, setDishForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    dietary_type: 'veg',
    spice_level: 'medium',
    image_url: '',
    ingredients: '',
    allergens: '',
    max_orders_per_day: 50,
    is_available: true
  })

  useEffect(() => {
    if (user && user.role === 'producer') {
      fetchProducerProfile()
      fetchOrders()
      fetchDishes()
    }
  }, [user, orderStatusFilter])

  const fetchProducerProfile = async () => {
    try {
      const response = await api.get('/producers/profile')
      setProducer(response.data)
    } catch (error) {
      console.error('Failed to fetch producer profile:', error)
      setMessage('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const params = orderStatusFilter !== 'all' ? `?status=${orderStatusFilter}` : ''
      const response = await api.get(`/orders${params}`)
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setMessage('Failed to load orders')
    }
  }

  const fetchDishes = async () => {
    try {
      const response = await api.get('/dishes/my-dishes')
      setDishes(response.data.dishes || [])
    } catch (error) {
      console.error('Failed to fetch dishes:', error)
      setMessage('Failed to load dishes')
    }
  }

  const handleAcceptOrder = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/accept`)
      setMessage('Order accepted successfully!')
      fetchOrders()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to accept order')
    }
  }

  const handleRejectOrder = async (orderId) => {
    const reason = window.prompt('Enter rejection reason:')
    if (!reason) return
    
    try {
      await api.post(`/orders/${orderId}/reject`, { reason })
      setMessage('Order rejected successfully!')
      fetchOrders()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to reject order')
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus })
      setMessage('Order status updated successfully!')
      fetchOrders()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to update order status')
    }
  }

  const handleCreateDish = () => {
    setEditingDish(null)
    setDishForm({
      name: '',
      description: '',
      price: '',
      category: '',
      dietary_type: 'veg',
      spice_level: 'medium',
      image_url: '',
      ingredients: '',
      allergens: '',
      max_orders_per_day: 50,
      is_available: true
    })
    setShowDishModal(true)
  }

  const handleEditDish = (dish) => {
    setEditingDish(dish)
    setDishForm({
      name: dish.name || '',
      description: dish.description || '',
      price: dish.price || '',
      category: dish.category || '',
      dietary_type: dish.dietary_type || 'veg',
      spice_level: dish.spice_level || 'medium',
      image_url: dish.image_url || '',
      ingredients: dish.ingredients || '',
      allergens: Array.isArray(dish.allergens) ? dish.allergens.join(', ') : (dish.allergens || ''),
      max_orders_per_day: dish.max_orders_per_day || 50,
      is_available: dish.is_available !== false
    })
    setShowDishModal(true)
  }

  const handleSaveDish = async () => {
    try {
      const dishData = {
        ...dishForm,
        price: parseFloat(dishForm.price),
        max_orders_per_day: parseInt(dishForm.max_orders_per_day),
        allergens: dishForm.allergens ? dishForm.allergens.split(',').map(a => a.trim()).filter(a => a).join(',') : ''
      }

      if (editingDish) {
        await api.put(`/dishes/${editingDish.id}`, dishData)
        setMessage('Dish updated successfully!')
      } else {
        await api.post('/dishes', dishData)
        setMessage('Dish created successfully!')
      }
      
      setShowDishModal(false)
      fetchDishes()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to save dish')
    }
  }

  const handleDeleteDish = async (dishId) => {
    if (!window.confirm('Are you sure you want to delete this dish?')) return
    
    try {
      await api.delete(`/dishes/${dishId}`)
      setMessage('Dish deleted successfully!')
      fetchDishes()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to delete dish')
    }
  }

  const toggleDishAvailability = async (dish) => {
    try {
      await api.put(`/dishes/${dish.id}`, { is_available: !dish.is_available })
      setMessage(`Dish ${!dish.is_available ? 'enabled' : 'disabled'} successfully!`)
      fetchDishes()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to update dish')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      accepted: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-amber-100 text-amber-800',
      ready: 'bg-purple-100 text-purple-800',
      dispatched: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      canceled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    const icons = {
      new: <FiPackage />,
      accepted: <FiCheck />,
      preparing: <FiClock />,
      ready: <FiCheckCircle />,
      dispatched: <FiTruck />,
      delivered: <FiCheckCircle />,
      canceled: <FiX />
    }
    return icons[status] || <FiPackage />
  }

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  if (!user || user.role !== 'producer') {
    return <div className="text-center py-12">Access denied. Producer only.</div>
  }

  if (!producer) {
    return <div className="text-center py-12">Producer profile not found. Please contact support.</div>
  }

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'new').length,
    totalRevenue: orders.filter(o => o.status === 'delivered' && o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total_amount, 0),
    activeDishes: dishes.filter(d => d.is_available).length,
    averageRating: producer.average_rating || 0
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Producer Dashboard</h1>
        <p className="text-gray-600 mt-1">{producer.kitchen_name}</p>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'orders', 'dishes', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <FiPackage className="text-3xl text-blue-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <FiClock className="text-3xl text-yellow-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <FiDollarSign className="text-3xl text-green-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
                  <p className="text-2xl font-bold text-gray-900">£{stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <FiCheckCircle className="text-3xl text-purple-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Active Dishes</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeDishes}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <FiStar className="text-3xl text-yellow-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Rating</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            {orders.slice(0, 5).length === 0 ? (
              <p className="text-gray-500">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Order #{order.order_number}</p>
                        <p className="text-sm text-gray-500">£{order.total_amount.toFixed(2)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Orders</h2>
            <select
              className="input-field"
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="new">New</option>
              <option value="accepted">Accepted</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          {orders.length === 0 ? (
            <p className="text-gray-500">No orders found</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-lg">Order #{order.order_number}</p>
                      <p className="text-sm text-gray-500">£{order.total_amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Items:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {order.items?.map((item, idx) => (
                        <li key={idx}>{item.dish_name} x{item.quantity} - £{item.subtotal.toFixed(2)}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {order.status === 'new' && (
                      <>
                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          className="btn-primary text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectOrder(order.id)}
                          className="btn-secondary text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {order.status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                        className="btn-primary text-sm"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                        className="btn-primary text-sm"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'dispatched')}
                        className="btn-primary text-sm"
                      >
                        Dispatch
                      </button>
                    )}
                    {order.status === 'dispatched' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                        className="btn-primary text-sm"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dishes Tab */}
      {activeTab === 'dishes' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">My Dishes</h2>
            <button onClick={handleCreateDish} className="btn-primary flex items-center gap-2">
              <FiPlus /> Add Dish
            </button>
          </div>

          {dishes.length === 0 ? (
            <p className="text-gray-500">No dishes yet. Create your first dish!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dishes.map((dish) => (
                <div key={dish.id} className="border rounded-lg p-4">
                  <img
                    src={dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}
                    alt={dish.name}
                    className="w-full h-48 object-cover rounded mb-4 bg-gray-200"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
                    }}
                  />
                  <h3 className="font-bold text-lg mb-2">{dish.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{dish.description}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold">£{dish.price}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      dish.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {dish.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEditDish(dish)}
                      className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      onClick={() => toggleDishAvailability(dish)}
                      className="flex-1 btn-secondary text-sm"
                    >
                      {dish.is_available ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteDish(dish.id)}
                      className="btn-secondary text-sm text-red-600 flex items-center justify-center"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Producer Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Kitchen Name</label>
              <p className="mt-1 text-gray-900">{producer.kitchen_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cuisine Specialty</label>
              <p className="mt-1 text-gray-900">{producer.cuisine_specialty || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1">
                <span className={`px-2 py-1 rounded text-xs ${
                  producer.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {producer.status}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Average Rating</label>
              <p className="mt-1 text-gray-900">{producer.average_rating || 0} ⭐ ({producer.total_reviews || 0} reviews)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Delivery Radius</label>
              <p className="mt-1 text-gray-900">{producer.delivery_radius_km} km</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Order Value</label>
              <p className="mt-1 text-gray-900">£{producer.minimum_order_value}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Preparation Time</label>
              <p className="mt-1 text-gray-900">{producer.preparation_time_minutes} minutes</p>
            </div>
          </div>
        </div>
      )}

      {/* Dish Modal */}
      {showDishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">{editingDish ? 'Edit Dish' : 'Create New Dish'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name *</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={dishForm.name}
                  onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="input-field w-full"
                  rows="3"
                  value={dishForm.description}
                  onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (£) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field w-full"
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="input-field w-full"
                    value={dishForm.category}
                    onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
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
                    value={dishForm.dietary_type}
                    onChange={(e) => setDishForm({ ...dishForm, dietary_type: e.target.value })}
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spice Level</label>
                  <select
                    className="input-field w-full"
                    value={dishForm.spice_level}
                    onChange={(e) => setDishForm({ ...dishForm, spice_level: e.target.value })}
                  >
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
                  value={dishForm.image_url}
                  onChange={(e) => setDishForm({ ...dishForm, image_url: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                <textarea
                  className="input-field w-full"
                  rows="2"
                  value={dishForm.ingredients}
                  onChange={(e) => setDishForm({ ...dishForm, ingredients: e.target.value })}
                  placeholder="Enter ingredients (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergens</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={dishForm.allergens}
                  onChange={(e) => setDishForm({ ...dishForm, allergens: e.target.value })}
                  placeholder="Enter allergens (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Orders Per Day</label>
                <input
                  type="number"
                  className="input-field w-full"
                  value={dishForm.max_orders_per_day}
                  onChange={(e) => setDishForm({ ...dishForm, max_orders_per_day: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_available"
                  className="mr-2"
                  checked={dishForm.is_available}
                  onChange={(e) => setDishForm({ ...dishForm, is_available: e.target.checked })}
                />
                <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
                  Available for ordering
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowDishModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDish}
                className="btn-primary"
                disabled={!dishForm.name || !dishForm.price}
              >
                {editingDish ? 'Update' : 'Create'} Dish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
