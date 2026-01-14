import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { formatDistanceToNow } from 'date-fns'
import ReviewForm from '../components/ReviewForm'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewingDishId, setReviewingDishId] = useState(null)
  const [reviewedDishes, setReviewedDishes] = useState(new Set())

  useEffect(() => {
    fetchOrder()
    fetchTracking()
    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchTracking()
    }, 30000)
    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    // Check which dishes have been reviewed
    if (order && order.items) {
      checkReviewedDishes()
    }
  }, [order])

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`)
      setOrder(response.data)
    } catch (error) {
      console.error('Failed to fetch order:', error)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const fetchTracking = async () => {
    try {
      const response = await api.get(`/orders/${id}/track`)
      setTracking(response.data)
    } catch (error) {
      console.error('Failed to fetch tracking:', error)
    }
  }

  const checkReviewedDishes = async () => {
    if (!order || !order.items) return
    
    const reviewed = new Set()
    for (const item of order.items) {
      try {
        const response = await api.get(`/reviews/dish/${item.dish_id}`)
        const reviews = response.data.reviews || []
        const userReview = reviews.find(r => r.order_id === parseInt(id))
        if (userReview) {
          reviewed.add(item.dish_id)
        }
      } catch (error) {
        console.error(`Failed to check reviews for dish ${item.dish_id}:`, error)
      }
    }
    setReviewedDishes(reviewed)
  }

  const handleReviewSuccess = (dishId) => {
    setReviewingDishId(null)
    setReviewedDishes(new Set([...reviewedDishes, dishId]))
  }

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-gray-500',
      'accepted': 'bg-blue-500',
      'preparing': 'bg-yellow-500',
      'ready': 'bg-amber-500',
      'dispatched': 'bg-purple-500',
      'delivered': 'bg-green-500',
      'canceled': 'bg-red-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  const getStatusLabel = (status) => {
    const labels = {
      'new': 'New Order',
      'accepted': 'Accepted',
      'preparing': 'Preparing',
      'ready': 'Ready for Dispatch',
      'dispatched': 'Out for Delivery',
      'delivered': 'Delivered',
      'canceled': 'Canceled'
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading order details...</div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">{error || 'Order not found'}</div>
      </div>
    )
  }

  const statusHistory = tracking?.status_timeline || {}
  const statusSteps = [
    { key: 'created', label: 'Order Placed', timestamp: statusHistory.created },
    { key: 'accepted', label: 'Order Accepted', timestamp: statusHistory.accepted },
    { key: 'preparing', label: 'Preparing', timestamp: statusHistory.preparing },
    { key: 'ready', label: 'Ready', timestamp: statusHistory.ready },
    { key: 'dispatched', label: 'Out for Delivery', timestamp: statusHistory.dispatched },
    { key: 'delivered', label: 'Delivered', timestamp: statusHistory.delivered }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/orders" className="text-primary-600 hover:text-primary-800 mb-4 inline-block">
        ← Back to Orders
      </Link>

      <h1 className="text-3xl font-bold mb-8">Order #{order.order_number}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Order Status</h2>
            <div className="flex items-center space-x-4 mb-4">
              <div className={`px-4 py-2 rounded-full text-white ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </div>
              {tracking?.eta_minutes && tracking.eta_minutes > 0 && (
                <div className="text-gray-600">
                  ETA: {Math.floor(tracking.eta_minutes / 60)}h {tracking.eta_minutes % 60}m
                </div>
              )}
            </div>

            {/* Status Timeline */}
            <div className="space-y-3">
              {statusSteps.map((step, index) => {
                const isCompleted = step.timestamp !== null
                const isCurrent = order.status === step.key || (
                  step.key === 'created' && order.status === 'new'
                )
                
                return (
                  <div key={step.key} className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      isCompleted ? 'bg-green-500' : isCurrent ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-grow">
                      <div className={`font-medium ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </div>
                      {step.timestamp && (
                        <div className="text-sm text-gray-500">
                          {new Date(step.timestamp).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Items */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-semibold">{item.dish_name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity} × £{item.dish_price}</p>
                    </div>
                    <div className="text-lg font-semibold">£{item.subtotal}</div>
                  </div>
                  
                  {/* Review Section for Delivered Orders */}
                  {order.status === 'delivered' && (
                    <div className="mt-4 pt-4 border-t">
                      {reviewedDishes.has(item.dish_id) ? (
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-green-800 text-sm">✓ You have reviewed this dish</p>
                          <Link
                            to={`/dishes/${item.dish_id}`}
                            className="text-primary-600 text-sm hover:underline mt-1 inline-block"
                          >
                            View your review
                          </Link>
                        </div>
                      ) : reviewingDishId === item.dish_id ? (
                        <div className="mt-2">
                          <ReviewForm
                            dishId={item.dish_id}
                            orderId={parseInt(id)}
                            onSuccess={() => handleReviewSuccess(item.dish_id)}
                            onCancel={() => setReviewingDishId(null)}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewingDishId(item.dish_id)}
                          className="btn-primary text-sm"
                        >
                          Rate & Review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {order.delivery_address && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
              <div className="text-gray-700">
                {typeof order.delivery_address === 'object' ? (
                  <>
                    {order.delivery_address.address_line1 && <p>{order.delivery_address.address_line1}</p>}
                    {order.delivery_address.address_line2 && <p>{order.delivery_address.address_line2}</p>}
                    <p>
                      {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.postcode || order.delivery_address.pincode}
                    </p>
                  </>
                ) : (
                  <p>{order.delivery_address}</p>
                )}
                {order.delivery_instructions && (
                  <p className="mt-2 text-sm text-gray-600">
                    <strong>Instructions:</strong> {order.delivery_instructions}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>£{order.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>£{order.delivery_charge?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>£{order.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-slate-700 font-bold">£{order.total_amount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <div>
                <strong>Payment Status:</strong> <span className="capitalize">{order.payment_status}</span>
              </div>
              <div>
                <strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}
              </div>
              {order.producer && (
                <div>
                  <strong>Chef:</strong> {order.producer.kitchen_name}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
